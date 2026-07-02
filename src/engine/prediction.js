// Match prediction system -- analytical, read-only.
//
// IMPORTANT: this never calls playSeries / resolveMap. Those mutate the sim
// (form drift, chemistry, fatigue, recorded stats). A preview must be a pure
// read of current state, so we derive win probability analytically from the
// same map-rating model the live engine uses for its per-round skillEdge.

import { rosterOf, teamBase, mapRating, currentMapPool, autoVeto } from "./state.js";
import { playerOvr } from "./utils.js";

// Converts a map-rating gap into a single-map win probability.
//
// Derivation: resolveMap() gives each round p ≈ 0.5 + gap/120, and a map is
// first-to-13 over ~24 rounds. A normal approximation of that race gives
// P(map) ≈ Φ(gap/12), and logistic(gap/7) tracks Φ(gap/12) closely across the
// realistic gap range. So: 5-pt edge ≈ 67%, 10 ≈ 80%, 16 ≈ 90%.
//
// This replaces an older side-weighted model that was neither symmetric
// (P(A beats B) + P(B beats A) ≠ 1) nor continuous at its branch point —
// the source of predictions that contradicted the per-map breakdown.
const SCALE = 7;
const logistic = (d) => 1 / (1 + Math.exp(-d / SCALE));
const mapWinProb = (rA, rB) => logistic(rA - rB);

// Bo1 veto: teams alternate 6 bans across the 7-map pool and play the last
// map standing. Each side greedily bans the opponent's biggest edge — the
// same policy autoVeto() uses for series bans — so the projected Bo1 map is
// the one the real veto would actually land on, not just pool[0].
function bo1VetoMap(state, A, B, pool) {
  let rem = [...pool];
  const order = [A, B, A, B, A, B];
  for (const me of order) {
    if (rem.length <= 1) break;
    const opp = me === A ? B : A;
    let best = rem[0], bestVal = -Infinity;
    for (const m of rem) {
      const v = mapRating(state, opp, m) - mapRating(state, me, m);
      if (v > bestVal) { bestVal = v; best = m; }
    }
    rem = rem.filter((m) => m !== best);
  }
  return rem[0];
}

// Probability A wins a first-to-`need` series, given per-map win odds played
// in veto order. Maps beyond the list (shouldn't happen) fall back to the mean.
function seriesWinProb(mapProbs, need) {
  const meanP = mapProbs.reduce((s, p) => s + p, 0) / (mapProbs.length || 1);
  const pAt = (i) => (i < mapProbs.length ? mapProbs[i] : meanP);
  let pA = 0;
  const dist = {}; // "aw-bw" -> prob, terminal states only
  const walk = (i, aw, bw, prob) => {
    if (aw === need) {
      pA += prob;
      dist[`${aw}-${bw}`] = (dist[`${aw}-${bw}`] || 0) + prob;
      return;
    }
    if (bw === need) {
      dist[`${aw}-${bw}`] = (dist[`${aw}-${bw}`] || 0) + prob;
      return;
    }
    const p = pAt(i);
    walk(i + 1, aw + 1, bw, prob * p);
    walk(i + 1, aw, bw + 1, prob * (1 - p));
  };
  walk(0, 0, 0, 1);
  // most-likely final scoreline
  let bestKey = null,
    bestProb = -1;
  for (const k in dist) {
    if (dist[k] > bestProb) {
      bestProb = dist[k];
      bestKey = k;
    }
  }
  const [aw, bw] = (bestKey || `${need}-0`).split("-").map(Number);
  return { pA, likelyScore: [aw, bw] };
}

// Public: predict A vs B over a Bo-N series. Pure read of `state`.
export function predictMatch(state, A, B, bo = 3) {
  const need = bo === 5 ? 3 : bo === 3 ? 2 : 1;
  // Show win probability for every map in the active pool.
  const maps = currentMapPool(state);

  // Headline drivers, for a short "why" line in the UI.
  const baseA = teamBase(state, A),
    baseB = teamBase(state, B);
  const rosA = rosterOf(state, A),
    rosB = rosterOf(state, B);
  const starA = rosA.length ? Math.max(...rosA.map(playerOvr)) : 0;
  const starB = rosB.length ? Math.max(...rosB.map(playerOvr)) : 0;
  const momA = state.momentum?.[A] || 0,
    momB = state.momentum?.[B] || 0;
  const injA = rosA.filter((p) => p.injury).length,
    injB = rosB.filter((p) => p.injury).length;

  // Which maps would actually get played? Project the veto (bans + picks with
  // the same greedy policy the live veto uses) instead of naively walking the
  // pool in order — the old approach made a Bo1 forecast equal to the odds on
  // pool[0], which could flatly contradict the per-map breakdown.
  const playedMaps = bo === 1 ? [bo1VetoMap(state, A, B, maps)] : autoVeto(state, A, B, bo);

  // Per-map breakdown over the whole active pool (UI shows every map), with
  // the veto-projected maps flagged.
  const mapBreakdown = maps.map((map) => {
    const rA = mapRating(state, A, map);
    const rB = mapRating(state, B, map);
    return {
      map,
      ratingA: +rA.toFixed(1),
      ratingB: +rB.toFixed(1),
      winProbA: Math.round(mapWinProb(rA, rB) * 100) / 100,
      projected: playedMaps.includes(map),
    };
  });

  // Series odds walk the veto-projected maps in play order.
  const probOf = (map) => mapBreakdown.find((m) => m.map === map)?.winProbA ?? 0.5;
  const { pA, likelyScore } = seriesWinProb(playedMaps.map(probOf), need);

  const edges = [];
  if (Math.abs(baseA - baseB) >= 1.5)
    edges.push(baseA > baseB ? `${A} stronger roster` : `${B} stronger roster`);
  if (Math.abs(starA - starB) >= 3)
    edges.push(
      starA > starB ? `${A} has the star edge` : `${B} has the star edge`,
    );
  if (momA - momB >= 2) edges.push(`${A} riding momentum`);
  else if (momB - momA >= 2) edges.push(`${B} riding momentum`);
  if (injA > injB)
    edges.push(`${A} carrying ${injA} injury${injA > 1 ? "s" : ""}`);
  else if (injB > injA)
    edges.push(`${B} carrying ${injB} injury${injB > 1 ? "s" : ""}`);

  return {
    teamA: A,
    teamB: B,
    bo,
    winProbA: pA,
    winProbB: 1 - pA,
    favorite: pA >= 0.5 ? A : B,
    confidence: Math.round(Math.abs(pA - 0.5) * 200), // 0 = coin-flip, 100 = lock
    likelyScore, // [myWins, oppWins] from the A=first-arg perspective
    mapBreakdown,
    edges: edges.slice(0, 3),
  };
}

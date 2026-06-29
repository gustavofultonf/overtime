// Match prediction system -- analytical, read-only.
//
// IMPORTANT: this never calls playSeries / resolveMap. Those mutate the sim
// (form drift, chemistry, fatigue, recorded stats). A preview must be a pure
// read of current state, so we derive win probability analytically from the
// same map-rating model the live engine uses for its per-round skillEdge.

import { rosterOf, teamBase, mapRating, autoVeto } from "./state.js";
import { playerOvr } from "./utils.js";

// Converts a map-rating gap into a single-map win probability. Tuned so a ~6
// point edge ~= 66%, ~12 ~= 79%, ~20 ~= 90% -- in line with how (strA-strB)/120
// compounds over a 13-round map in resolveMap().
const SCALE = 9;
const logistic = d => 1 / (1 + Math.exp(-d / SCALE));

// Probability A wins a first-to-`need` series, given per-map win odds played
// in veto order. Maps beyond the list (shouldn't happen) fall back to the mean.
function seriesWinProb(mapProbs, need) {
  const meanP = mapProbs.reduce((s, p) => s + p, 0) / (mapProbs.length || 1);
  const pAt = i => (i < mapProbs.length ? mapProbs[i] : meanP);
  let pA = 0;
  const dist = {}; // "aw-bw" -> prob, terminal states only
  const walk = (i, aw, bw, prob) => {
    if (aw === need) { pA += prob; dist[`${aw}-${bw}`] = (dist[`${aw}-${bw}`] || 0) + prob; return; }
    if (bw === need) { dist[`${aw}-${bw}`] = (dist[`${aw}-${bw}`] || 0) + prob; return; }
    const p = pAt(i);
    walk(i + 1, aw + 1, bw, prob * p);
    walk(i + 1, aw, bw + 1, prob * (1 - p));
  };
  walk(0, 0, 0, 1);
  // most-likely final scoreline
  let bestKey = null, bestProb = -1;
  for (const k in dist) { if (dist[k] > bestProb) { bestProb = dist[k]; bestKey = k; } }
  const [aw, bw] = (bestKey || `${need}-0`).split("-").map(Number);
  return { pA, likelyScore: [aw, bw] };
}

// Public: predict A vs B over a Bo-N series. Pure read of `state`.
export function predictMatch(state, A, B, bo = 3) {
  const need = bo === 5 ? 3 : bo === 3 ? 2 : 1;
  // autoVeto is deterministic and read-only -- gives the maps most likely played.
  const maps = autoVeto(state, A, B, bo);
  const playable = maps.slice(0, Math.max(1, need * 2 - 1));

  const mapBreakdown = playable.map(map => {
    const rA = mapRating(state, A, map);
    const rB = mapRating(state, B, map);
    const p = logistic(rA - rB);
    return { map, ratingA: +rA.toFixed(1), ratingB: +rB.toFixed(1), winProbA: p };
  });

  const { pA, likelyScore } = seriesWinProb(mapBreakdown.map(m => m.winProbA), need);

  // Headline drivers, for a short "why" line in the UI.
  const baseA = teamBase(state, A), baseB = teamBase(state, B);
  const rosA = rosterOf(state, A), rosB = rosterOf(state, B);
  const starA = rosA.length ? Math.max(...rosA.map(playerOvr)) : 0;
  const starB = rosB.length ? Math.max(...rosB.map(playerOvr)) : 0;
  const momA = state.momentum?.[A] || 0, momB = state.momentum?.[B] || 0;
  const injA = rosA.filter(p => p.injury).length, injB = rosB.filter(p => p.injury).length;

  const edges = [];
  if (Math.abs(baseA - baseB) >= 1.5) edges.push(baseA > baseB ? `${A} stronger roster` : `${B} stronger roster`);
  if (Math.abs(starA - starB) >= 3) edges.push(starA > starB ? `${A} has the star edge` : `${B} has the star edge`);
  if (momA - momB >= 2) edges.push(`${A} riding momentum`);
  else if (momB - momA >= 2) edges.push(`${B} riding momentum`);
  if (injA > injB) edges.push(`${A} carrying ${injA} injury${injA > 1 ? "s" : ""}`);
  else if (injB > injA) edges.push(`${B} carrying ${injB} injury${injB > 1 ? "s" : ""}`);

  return {
    teamA: A, teamB: B, bo,
    winProbA: pA, winProbB: 1 - pA,
    favorite: pA >= 0.5 ? A : B,
    confidence: Math.round(Math.abs(pA - 0.5) * 200), // 0 = coin-flip, 100 = lock
    likelyScore,            // [myWins, oppWins] from the A=first-arg perspective
    mapBreakdown,
    edges: edges.slice(0, 3),
  };
}

// Valve-style CS2 regional standings ranking model
// Adapted from github.com/ValveSoftware/counter-strike_regional_standings
//
// Pipeline:
//   1. scaledWinnings  — recency-weighted prize money per team (top BUCKET_SIZE events)
//   2. bountyOffered   — curve(scaledWinnings / referenceWinnings), capped 0-1
//   3. bountyCollected — curve(mean of top-N beaten opponent bounties × recency × stakes)
//   4. opponentNetwork — mean of top-N beaten opponent own-networks × recency × stakes
//   5. lanFactor       — 1 (all events in this game are LAN)
//   6. seedValue       — mean of four modifiers → remapped to Glicko init range [400, 2000]
//   7. Glicko-1        — batch update from all matches in the time window

import { glickoUpdate, FIXED_RD } from './glicko.js';

export const TIME_WINDOW = 104;     // weeks (~2 years)
const BUCKET_SIZE = 10;             // top-N results used for bounty/network
const SEED_LO = 400;
const SEED_HI = 2000;

// --- Pure helpers ---

function timestampMod(weeksAgo) {
  return Math.max(0, 1 - weeksAgo / TIME_WINDOW);
}

// Valve's stakes curve: peaks at the reference pool, tapers for much-smaller or much-larger
function stakesMod(prizePool, refPool) {
  const x = Math.max(0.001, prizePool / refPool);
  return 1 / (1 + Math.abs(Math.log10(x)));
}

// Logarithmic dampening for bounty — diminishing returns on large winnings
function curveFunc(x) {
  return Math.min(1, Math.sqrt(Math.max(0, x)));
}

function meanTopN(arr, n) {
  if (!arr.length) return 0;
  const top = arr.slice().sort((a, b) => b - a).slice(0, n);
  return top.reduce((s, v) => s + v, 0) / top.length;
}

function remap(v, lo, hi, newLo, newHi) {
  if (hi <= lo) return (newLo + newHi) / 2;
  return newLo + Math.max(0, Math.min(1, (v - lo) / (hi - lo))) * (newHi - newLo);
}

// Prize for a placement given an event's prize table ({1:500, 2:300, 4:180, ...})
export function prizeForPlace(prizeTable, place) {
  if (!prizeTable) return 0;
  const keys = Object.keys(prizeTable).map(Number).sort((a, b) => a - b);
  for (const k of keys) { if (place <= k) return prizeTable[k]; }
  return 0;
}

// --- Match extraction ---

export function extractMatches(tournament) {
  const out = [];
  if (tournament?.swiss) {
    for (const round of (tournament.swiss.rounds || [])) {
      for (const fx of round.fixtures) {
        if (fx.done && fx.res) {
          out.push({ winner: fx.res.winnerName, loser: fx.res.loserName });
        }
      }
    }
  }
  if (tournament?.bracket) {
    const br = tournament.bracket;
    const fxList = [...(br.qf || []), ...(br.sf || []), br.final].filter(Boolean);
    for (const fx of fxList) {
      if (fx.done && fx.res) {
        out.push({ winner: fx.res.winnerName, loser: fx.res.loserName });
      }
    }
  }
  return out;
}

// --- Log mutations ---

// Call after each event to record matches + prizes into persistent state logs.
export function addEventToLog(state, tournament, ev, placements, week, year) {
  if (!state.matchLog) state.matchLog = [];
  if (!state.prizeLog) state.prizeLog = [];

  const prizePool = ev.prize?.[1] || 100;

  // Record every match from the event
  extractMatches(tournament).forEach(m => {
    state.matchLog.push({ winner: m.winner, loser: m.loser, week, year, prizePool });
  });

  // Record prize winnings for each team
  if (placements && ev.prize) {
    Object.entries(placements).forEach(([team, place]) => {
      const prize = prizeForPlace(ev.prize, place);
      if (prize > 0) state.prizeLog.push({ team, amount: prize, week, year, prizePool });
    });
  }
}

// --- Core ranking computation ---

export function computeValveRankings(state, currentWeek, currentYear) {
  const matchLog = state.matchLog || [];
  const prizeLog = state.prizeLog || [];

  if (matchLog.length === 0 && prizeLog.length === 0) return;

  // Annotate entries with recency
  function annotate(entries) {
    return entries.map(e => ({
      ...e,
      weeksAgo: (currentYear - e.year) * 52 + (currentWeek - e.week),
    })).filter(e => e.weeksAgo >= 0 && e.weeksAgo < TIME_WINDOW + 8);
  }

  const matches = annotate(matchLog);
  const prizes  = annotate(prizeLog);

  matches.forEach(m => { m.tsMod = timestampMod(m.weeksAgo); });
  prizes.forEach(p  => { p.tsMod = timestampMod(p.weeksAgo); });

  // Trim stale entries from state
  const cutoff = TIME_WINDOW + 8;
  state.matchLog = matchLog.filter(m =>
    (currentYear - m.year) * 52 + (currentWeek - m.week) < cutoff);
  state.prizeLog = prizeLog.filter(p =>
    (currentYear - p.year) * 52 + (currentWeek - p.week) < cutoff);

  const refPool = Math.max(...matches.map(m => m.prizePool), 1);

  // All unique teams that have appeared in logs or already have a ranking
  const teams = new Set([
    ...matches.map(m => m.winner),
    ...matches.map(m => m.loser),
    ...prizes.map(p => p.team),
    ...Object.keys(state.rankings || {}),
  ]);

  // Phase 1: scaledWinnings — top BUCKET_SIZE recency-weighted prize amounts
  const scaledWinnings = {};
  teams.forEach(t => {
    const vals = prizes
      .filter(p => p.team === t && p.tsMod > 0)
      .map(p => p.amount * p.tsMod)
      .sort((a, b) => b - a)
      .slice(0, BUCKET_SIZE);
    scaledWinnings[t] = vals.reduce((s, v) => s + v, 0);
  });
  const refWinnings = Math.max(...[...teams].map(t => scaledWinnings[t] || 0), 1);

  // Phase 2: bountyOffered
  const bountyOffered = {};
  teams.forEach(t => { bountyOffered[t] = curveFunc(scaledWinnings[t] / refWinnings); });

  // Phase 3: bountyCollected — top-N beaten opponents' bounty × recency × stakes
  const bountyCollected = {};
  teams.forEach(t => {
    const vals = matches
      .filter(m => m.winner === t && m.tsMod > 0)
      .map(m => (bountyOffered[m.loser] || 0) * m.tsMod * stakesMod(m.prizePool, refPool));
    bountyCollected[t] = curveFunc(meanTopN(vals, BUCKET_SIZE));
  });

  // Phase 4: opponentNetwork
  // First pass: ownNetwork = unique teams beaten (normalized)
  const ownNetwork = {};
  const teamArr = [...teams];
  teams.forEach(t => {
    const beaten = new Set(matches.filter(m => m.winner === t).map(m => m.loser));
    ownNetwork[t] = beaten.size / Math.max(1, teamArr.length - 1);
  });
  // Second pass: opponentNetwork = top-N beaten opponents' ownNetwork × recency × stakes
  const opponentNetwork = {};
  teams.forEach(t => {
    const vals = matches
      .filter(m => m.winner === t && m.tsMod > 0)
      .map(m => (ownNetwork[m.loser] || 0) * m.tsMod * stakesMod(m.prizePool, refPool));
    opponentNetwork[t] = meanTopN(vals, BUCKET_SIZE);
  });

  // Phase 5: lanFactor = 1 (all events in this game are LAN)
  const LAN_FACTOR = 1;

  // Phase 6: seedValue = mean of four modifiers
  const seedValues = {};
  teams.forEach(t => {
    seedValues[t] = (bountyCollected[t] + bountyOffered[t] + opponentNetwork[t] + LAN_FACTOR) / 4;
  });

  // Phase 7: remap seedValues → Glicko initial ratings [SEED_LO, SEED_HI]
  const seedArr = [...teams].map(t => seedValues[t]);
  const minSeed = Math.min(...seedArr);
  const maxSeed = Math.max(...seedArr);
  const initialRatings = {};
  teams.forEach(t => {
    initialRatings[t] = remap(seedValues[t], minSeed, maxSeed, SEED_LO, SEED_HI);
  });

  // Phase 8: Glicko batch update — accumulate all matches, apply simultaneously
  const pending = {};
  teams.forEach(t => { pending[t] = []; });

  matches.forEach(m => {
    const sk = stakesMod(m.prizePool, refPool);
    const ic = Math.max(0.05, sk * m.tsMod);  // floor so recent events always matter
    if (pending[m.winner]) {
      pending[m.winner].push({
        oppRating: initialRatings[m.loser] ?? SEED_LO,
        oppRD: FIXED_RD,
        won: true,
        infoContent: ic,
      });
    }
    if (pending[m.loser]) {
      pending[m.loser].push({
        oppRating: initialRatings[m.winner] ?? SEED_LO,
        oppRD: FIXED_RD,
        won: false,
        infoContent: ic,
      });
    }
  });

  // Phase 9: Apply Glicko, write final ratings to state.rankings
  teams.forEach(t => {
    const finalRating = glickoUpdate(initialRatings[t] ?? SEED_LO, pending[t]);
    state.rankings[t] = Math.round(finalRating);
  });

  // Store bounty breakdown for UI display
  if (!state.valveBounty) state.valveBounty = {};
  teams.forEach(t => {
    state.valveBounty[t] = {
      bountyOffered:   +(bountyOffered[t]   || 0).toFixed(3),
      bountyCollected: +(bountyCollected[t]  || 0).toFixed(3),
      opponentNetwork: +(opponentNetwork[t]  || 0).toFixed(3),
      seedValue:       +(seedValues[t]       || 0).toFixed(3),
      initialRating:   Math.round(initialRatings[t] || SEED_LO),
    };
  });
}

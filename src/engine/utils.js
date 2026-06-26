// Player utility functions — no external deps
export function playerOvr(p){return Math.round(0.20*p.aim+0.15*p.gameSense+0.10*p.util+0.08*p.igl+0.05*p.mentality+0.08*(p.rifle||p.aim)+0.06*(p.pistol||60)+0.06*(p.awp||50)+0.05*(p.clutch||50)+0.05*(p.entry||60)+0.04*(p.composure||p.mentality)+0.04*(p.stamina||60)+0.04*(p.experience||50));}

// Valve-style ranking: points decay linearly to 0 over 2 years
export const VALVE_DECAY_WEEKS = 104;

export function recomputeRankings(state, currentWeek, currentYear) {
  if (!state.rankLog || state.rankLog.length === 0) return;
  const computed = {};
  state.rankLog.forEach(entry => {
    const weeksAgo = (currentYear - entry.year) * 52 + (currentWeek - entry.week);
    const decay = Math.max(0, 1 - weeksAgo / VALVE_DECAY_WEEKS);
    if (decay <= 0) return;
    const pts = Math.round(entry.rawPts * decay);
    computed[entry.team] = (computed[entry.team] || 0) + pts;
  });
  Object.keys(computed).forEach(t => { state.rankings[t] = computed[t]; });
  // Zero out teams whose log entries fully decayed
  new Set(state.rankLog.map(e => e.team)).forEach(t => {
    if (!computed[t]) state.rankings[t] = 0;
  });
}

export function marketValue(p){
  const ovr=playerOvr(p);
  let base;
  if(ovr>=93)      base=520;  // elite (s1mple★, dev1ce★)
  else if(ovr>=90) base=380;  // superstar
  else if(ovr>=87) base=250;  // star
  else if(ovr>=84) base=160;  // quality
  else if(ovr>=80) base=100;  // solid
  else if(ovr>=76) base=65;   // rotation
  else if(ovr>=72) base=45;   // budget
  else             base=30;   // bargain
  // Legend premium: prime-era players cost 25% more
  if(p.era&&p.era!=="current") base=Math.round(base*1.25);
  return base;
}

export function draftCost(p){
  const mv=marketValue(p);
  // Poaching from AI team costs 50% extra
  return p.team==="FA"?mv:Math.round(mv*1.5);
}

import React, { useState } from 'react';
import { C, sans, mono, SHADOW, HEAD_H } from './theme.js';
import { getRankedTeams } from '../engine/player.js';
import { AI_TEAMS } from '../constants/data.js';
import { Intro, TeamCrest } from './primitives.jsx';

// Small "+N"/"-N" rank-movement badge — green for climbing, red for dropping,
// nothing for unchanged or a team we have no prior snapshot for yet.
function RankDelta({ delta }) {
  if (delta == null || delta === 0) return null;
  const up = delta > 0;
  return (
    <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: up ? C.win : C.red, whiteSpace: 'nowrap' }}>
      {up ? '▲' : '▼'}{Math.abs(delta)}
    </span>
  );
}

export function RankingsView({ state, myTeam, week = 1, year = 2026 }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const ranked = getRankedTeams(state, myTeam);
  const maxPts = ranked[0]?.pts || 1;
  const myBounty = state.valveBounty?.[myTeam];

  // Rank movement since the last time rankings recomputed (i.e. since the last
  // event — rankings only update on event results, not every calendar week).
  // Compare current position against the position implied by the pre-recompute
  // rating snapshot (state.prevRankings, written in computeValveRankings).
  const prevRankOf = {};
  if (state.prevRankings) {
    [...AI_TEAMS, myTeam]
      .map((t) => ({ team: t, pts: state.prevRankings[t] || 0 }))
      .sort((a, b) => b.pts - a.pts)
      .forEach((r, i) => { prevRankOf[r.team] = i + 1; });
  }

  const handleTeamClick = (teamName) => {
    if (expandedTeam === teamName) {
      setExpandedTeam(null); // Click again to close
    } else {
      setExpandedTeam(teamName);
    }
  };

  return (
    <div>
      <Intro text="Valve-style Glicko rankings: seed from prize money + who you beat (bounty), then adjusted by head-to-head results. Top 8 auto-qualify as Legends for Majors; #9–16 enter as Challengers. Points decay over 2 years."/>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontSize: 10, fontFamily: mono, color: C.faint, letterSpacing: 1 }}>MODIFIERS: BOUNTY OFFERED · BOUNTY COLLECTED · OPPONENT NETWORK · LAN 1.0×</div>
        <div style={{ marginLeft: 'auto', fontSize: 10, fontFamily: mono, color: C.faint }}>Legends: #1–8 · Challengers: #9–16</div>
      </div>

      {/* Rankings table */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, boxShadow: SHADOW.card }}>
        <div style={{ display: 'grid', gridTemplateColumns: '28px 38px minmax(0,1fr) 80px 90px', gap: 8, padding: '8px 14px', fontFamily: sans, fontSize: 10.5, fontWeight: 700, color: C.dim, letterSpacing: .3, background: C.panel2, borderBottom: `1px solid ${C.line}`, position: 'sticky', top: HEAD_H, zIndex: 5, borderRadius: '12px 12px 0 0' }}>
          <span>#</span><span/><span>Team</span><span style={{ textAlign: 'right' }}>Rating</span><span/>
        </div>
        {ranked.map((r, i) => {
          const me = r.team === myTeam;
          const isLegend = i < 8;
          const isChal = i >= 8 && i < 16;
          const col = i === 0 ? C.gold : i <= 2 ? C.acc : isLegend ? C.live : C.dim;
          const pct = maxPts > 0 ? r.pts / maxPts * 100 : 0;
          const badge = isLegend ? { label: 'LEGEND', color: C.gold } : isChal ? { label: 'CHALL', color: C.live } : null;
          const isExpanded = expandedTeam === r.team;
          const prevRank = prevRankOf[r.team];
          const delta = prevRank != null ? prevRank - (i + 1) : null;

          return (
            <div key={r.team} style={{ display: 'grid', gridTemplateColumns: '28px 38px minmax(0,1fr) 80px 90px', gap: 8, padding: '9px 14px', alignItems: 'center', borderTop: `1px solid ${C.line}`, borderLeft: `3px solid ${me ? C.acc : col}`, background: me ? C.acc + '14' : 'transparent' }}>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 15, color: col }}>{i + 1}</span>
              <RankDelta delta={delta} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, cursor: 'pointer' }} onClick={() => handleTeamClick(r.team)}>
                <TeamCrest name={r.team} size={24} />
                <span style={{ fontWeight: me ? 700 : 600, fontSize: 13, color: me ? C.acc : C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 150 }}>{r.team}{me ? ' you' : ''}</span>
                {badge && <span style={{ fontFamily: mono, fontSize: 9, color: badge.color, background: badge.color + '22', padding: '1px 4px', borderRadius: 3, flexShrink: 0 }}>{badge.label}</span>}
              </div>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 13, textAlign: 'right', color: col }}>{Math.round(r.pts).toLocaleString()}</span>
              <div style={{ height: 6, background: C.line, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 3 }}/>
              </div>
              {isExpanded && state.valveBounty?.[r.team] && (
                <div style={{ gridColumn: '1 / -1', marginTop: 8, padding: '12px 14px', background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'BOUNTY OFFERED', value: state.valveBounty[r.team].bountyOffered, desc: 'Prize money earned (recency-weighted)', color: C.gold },
                      { label: 'BOUNTY COLLECTED', value: state.valveBounty[r.team].bountyCollected, desc: 'Value of opponents beaten', color: C.win },
                      { label: 'OPPONENT NETWORK', value: state.valveBounty[r.team].opponentNetwork, desc: 'Strength of schedule', color: C.live },
                      { label: 'SEED VALUE', value: state.valveBounty[r.team].seedValue, desc: `Initial Glicko rating: ${state.valveBounty[r.team].initialRating}`, color: C.acc },
                    ].map(({ label, value, desc, color }) => (
                      <div key={label} style={{ background: C.panel, borderRadius: 6, padding: '8px 12px', border: `1px solid ${C.line}` }}>
                        <div style={{ fontFamily: sans, fontSize: 9.5, fontWeight: 700, color: C.faint, letterSpacing: .7, marginBottom: 4 }}>{label}</div>
                        <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, color }}>{(value * 100).toFixed(1)}%</div>
                        <div style={{ height: 3, background: C.line, borderRadius: 2, margin: '4px 0' }}>
                          <div style={{ width: `${value * 100}%`, height: '100%', background: color, borderRadius: 2 }}/>
                        </div>
                        <div style={{ fontSize: 10, color: C.faint }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: C.faint, paddingTop: 4, borderTop: `1px solid ${C.line}`, marginTop: 2 }}>
                    LAN Factor: 100% (all events) · Final rating = Glicko adjustment from seed
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* My team bounty breakdown */}
      {myBounty && (
        <div style={{ marginTop: 12 }}>
          <button onClick={() => setExpanded(v => !v)} style={{ background: 'none', border: `1px solid ${C.line}`, borderRadius: 6, padding: '6px 12px', color: C.faint, fontFamily: mono, fontSize: 11, cursor: 'pointer', letterSpacing: 1 }}>
            {expanded ? '▾' : '▸'} YOUR RANKING BREAKDOWN
          </button>
          {expanded && (
            <div style={{ marginTop: 6, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'BOUNTY OFFERED', value: myBounty.bountyOffered, desc: 'Prize money earned (recency-weighted)', color: C.gold },
                { label: 'BOUNTY COLLECTED', value: myBounty.bountyCollected, desc: 'Value of opponents beaten', color: C.win },
                { label: 'OPPONENT NETWORK', value: myBounty.opponentNetwork, desc: 'Strength of schedule', color: C.live },
                { label: 'SEED VALUE', value: myBounty.seedValue, desc: `Initial Glicko rating: ${myBounty.initialRating}`, color: C.acc },
              ].map(({ label, value, desc, color }) => (
                <div key={label} style={{ background: C.panel, borderRadius: 6, padding: '8px 12px', border: `1px solid ${C.line}` }}>
                  <div style={{ fontFamily: sans, fontSize: 9.5, fontWeight: 700, color: C.faint, letterSpacing: .7, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, color }}>{(value * 100).toFixed(1)}%</div>
                  <div style={{ height: 3, background: C.line, borderRadius: 2, margin: '4px 0' }}>
                    <div style={{ width: `${value * 100}%`, height: '100%', background: color, borderRadius: 2 }}/>
                  </div>
                  <div style={{ fontSize: 10, color: C.faint }}>{desc}</div>
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1', fontFamily: mono, fontSize: 10, color: C.faint, paddingTop: 4, borderTop: `1px solid ${C.line}`, marginTop: 2 }}>
                LAN Factor: 100% (all events) · Final rating = Glicko adjustment from seed
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

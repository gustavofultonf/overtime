import React, { useState } from 'react';
import { C, sans, mono } from './theme.js';
import { getRankedTeams } from '../engine/player.js';
import { Intro, TeamCrest } from './primitives.jsx';

export function RankingsView({ state, myTeam, week = 1, year = 2026 }) {
  const [expanded, setExpanded] = useState(false);
  const ranked = getRankedTeams(state, myTeam);
  const maxPts = ranked[0]?.pts || 1;
  const myBounty = state.valveBounty?.[myTeam];

  return (
    <div>
      <Intro text="Valve-style Glicko rankings: seed from prize money + who you beat (bounty), then adjusted by head-to-head results. Top 8 auto-qualify as Legends for Majors; #9–16 enter as Challengers. Points decay over 2 years."/>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontSize: 10, fontFamily: mono, color: C.faint, letterSpacing: 1 }}>MODIFIERS: BOUNTY OFFERED · BOUNTY COLLECTED · OPPONENT NETWORK · LAN 1.0×</div>
        <div style={{ marginLeft: 'auto', fontSize: 10, fontFamily: mono, color: C.faint }}>Legends: #1–8 · Challengers: #9–16</div>
      </div>

      {/* Rankings table */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 80px 1fr', gap: 8, padding: '8px 14px', fontFamily: mono, fontSize: 10, color: C.faint, letterSpacing: 1 }}>
          <span>#</span><span>TEAM</span><span style={{ textAlign: 'right' }}>RATING</span><span/>
        </div>
        {ranked.map((r, i) => {
          const me = r.team === myTeam;
          const isLegend = i < 8;
          const isChal = i >= 8 && i < 16;
          const col = i === 0 ? C.gold : i <= 2 ? C.acc : isLegend ? C.live : C.dim;
          const pct = maxPts > 0 ? r.pts / maxPts * 100 : 0;
          const badge = isLegend ? { label: 'LEGEND', color: C.gold } : isChal ? { label: 'CHALL', color: C.live } : null;
          return (
            <div key={r.team} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 80px 1fr', gap: 8, padding: '9px 14px', alignItems: 'center', borderTop: `1px solid ${C.line}`, borderLeft: `3px solid ${me ? C.acc : col}`, background: me ? 'rgba(255,92,46,.06)' : 'transparent' }}>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 15, color: col }}>{i + 1}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TeamCrest name={r.team} size={24} />
                <span style={{ fontWeight: me ? 700 : 600, fontSize: 13, color: me ? C.acc : C.ink }}>{r.team}{me ? ' ◂ you' : ''}</span>
                {badge && <span style={{ fontFamily: mono, fontSize: 9, color: badge.color, background: badge.color + '22', padding: '1px 4px', borderRadius: 3 }}>{badge.label}</span>}
              </div>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 13, textAlign: 'right', color: col }}>{Math.round(r.pts).toLocaleString()}</span>
              <div style={{ height: 6, background: C.line, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 3 }}/>
              </div>
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
                  <div style={{ fontFamily: mono, fontSize: 9, color: C.faint, letterSpacing: 1, marginBottom: 4 }}>{label}</div>
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

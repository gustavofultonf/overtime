import React, { useState } from 'react';
import { C, sans, mono } from './theme.js';
import { getRankedTeams } from '../engine/player.js';
import { VALVE_DECAY_WEEKS } from '../engine/utils.js';
import { Intro } from './primitives.jsx';

function getContributions(state, team, currentWeek, currentYear) {
  return (state.rankLog || [])
    .filter(e => e.team === team)
    .map(e => {
      const weeksAgo = (currentYear - e.year) * 52 + (currentWeek - e.week);
      const decay = Math.max(0, 1 - weeksAgo / VALVE_DECAY_WEEKS);
      return { ...e, pts: Math.round(e.rawPts * decay), decay, weeksAgo };
    })
    .filter(e => e.pts > 0)
    .sort((a, b) => b.pts - a.pts);
}

function tierBadge(tier) {
  const col = tier === 'Major' ? C.gold : tier === 'A' ? C.live : C.dim;
  return <span style={{ fontFamily: mono, fontSize: 9, color: col, background: col + '22', padding: '1px 5px', borderRadius: 3 }}>{tier}</span>;
}

export function RankingsView({ state, myTeam, week = 1, year = 2026 }) {
  const [expanded, setExpanded] = useState(false);
  const ranked = getRankedTeams(state, myTeam);
  const maxPts = ranked[0]?.pts || 1;
  const myContribs = getContributions(state, myTeam, week, year);

  return (
    <div>
      <Intro text="Valve-style world rankings: event placements earn points scaled by tier (Major 1×, A-tier 0.5×, B-tier 0.25×). Points decay to zero over 2 years. Top 8 auto-qualify as Legends for Majors; #9–16 enter as Challengers."/>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        {[['Major', '1.0×'], ['A', '0.5×'], ['B', '0.25×']].map(([tier, mult]) => {
          const col = tier === 'Major' ? C.gold : tier === 'A' ? C.live : C.dim;
          return (
            <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: mono, color: C.faint }}>
              <span style={{ width: 10, height: 10, background: col, borderRadius: 2 }}/>
              {tier} {mult}
            </div>
          );
        })}
        <div style={{ marginLeft: 'auto', fontSize: 10, fontFamily: mono, color: C.faint }}>Legends: #1–8 · Challengers: #9–16</div>
      </div>

      {/* Rankings table */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 80px 1fr', gap: 8, padding: '8px 14px', fontFamily: mono, fontSize: 10, color: C.faint, letterSpacing: 1 }}>
          <span>#</span><span>TEAM</span><span style={{ textAlign: 'right' }}>PTS</span><span/>
        </div>
        {ranked.map((r, i) => {
          const me = r.team === myTeam;
          const isLegend = i < 8;
          const isChal = i >= 8 && i < 16;
          const col = i === 0 ? C.gold : i <= 2 ? C.acc : isLegend ? C.live : C.dim;
          const pct = maxPts > 0 ? r.pts / maxPts * 100 : 0;
          const badge = isLegend ? { label: 'L', color: C.gold } : isChal ? { label: 'C', color: C.live } : null;
          return (
            <div key={r.team} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 80px 1fr', gap: 8, padding: '9px 14px', alignItems: 'center', borderTop: `1px solid ${C.line}`, borderLeft: `3px solid ${me ? C.acc : col}`, background: me ? 'rgba(255,92,46,.06)' : 'transparent' }}>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 15, color: col }}>{i + 1}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: me ? 700 : 600, fontSize: 13, color: me ? C.acc : C.ink }}>{r.team}{me ? ' ◂ you' : ''}</span>
                {badge && <span style={{ fontFamily: mono, fontSize: 9, color: badge.color, background: badge.color + '22', padding: '1px 4px', borderRadius: 3 }}>{badge.label === 'L' ? 'LEGEND' : 'CHALL'}</span>}
              </div>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 13, textAlign: 'right', color: col }}>{r.pts.toLocaleString()}</span>
              <div style={{ height: 6, background: C.line, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 3 }}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* My team contribution breakdown */}
      {myContribs.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <button onClick={() => setExpanded(v => !v)} style={{ background: 'none', border: `1px solid ${C.line}`, borderRadius: 6, padding: '6px 12px', color: C.faint, fontFamily: mono, fontSize: 11, cursor: 'pointer', letterSpacing: 1 }}>
            {expanded ? '▾' : '▸'} YOUR RANKING BREAKDOWN ({myContribs.length} event{myContribs.length !== 1 ? 's' : ''})
          </button>
          {expanded && (
            <div style={{ marginTop: 6, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 70px 60px', gap: 6, padding: '7px 14px', fontFamily: mono, fontSize: 9, color: C.faint, letterSpacing: 1 }}>
                <span>EVENT</span><span>TIER</span><span style={{ textAlign: 'right' }}>BASE</span><span style={{ textAlign: 'right' }}>DECAY</span><span style={{ textAlign: 'right' }}>ACTIVE</span>
              </div>
              {myContribs.map((e, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 70px 60px', gap: 6, padding: '7px 14px', borderTop: `1px solid ${C.line}`, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: C.ink }}>{e.label}</span>
                  {tierBadge(e.tier)}
                  <span style={{ fontFamily: mono, fontSize: 11, textAlign: 'right', color: C.dim }}>{e.rawPts.toLocaleString()}</span>
                  <span style={{ fontFamily: mono, fontSize: 11, textAlign: 'right', color: C.faint }}>{Math.round(e.decay * 100)}%</span>
                  <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, textAlign: 'right', color: C.acc }}>{e.pts.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 70px 60px', gap: 6, padding: '8px 14px', borderTop: `1px solid ${C.line}`, background: C.panel }}>
                <span style={{ fontFamily: mono, fontSize: 10, color: C.faint, letterSpacing: 1 }}>TOTAL</span>
                <span/><span/><span/>
                <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, textAlign: 'right', color: C.gold }}>{myContribs.reduce((s, e) => s + e.pts, 0).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

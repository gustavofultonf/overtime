import React from 'react';
import { C, sans, mono } from './theme.js';
import { Intro, Empty, TeamCrest } from './primitives.jsx';

// Win-rate ring — replaces the old flat H2H bar with something that actually
// reads at a glance: green arc = your share, red = theirs, percentage in the
// middle.
function WinRing({ mine, theirs, size = 66 }) {
  const total = mine + theirs;
  const pct = total > 0 ? mine / total : 0.5;
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.red} strokeWidth="7" opacity="0.5" />
      {dash > 0 && (
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.win} strokeWidth="7"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      )}
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontFamily={mono} fontSize="13" fontWeight="800" fill={C.ink}>
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

export function RivalryView({ state, myTeam }) {
  const rivals = Object.entries(state.rivalries)
    .filter(([k, r]) => k.includes(myTeam) && r.matches > 0)
    .sort((a, b) => (b[1].isRival - a[1].isRival) || (b[1].matches - a[1].matches));

  return (<div>
    <Intro text="Head-to-head records against teams you've faced. Rivalries form after 3+ meetings." />
    {rivals.length === 0 ? <Empty text="No match history yet. Play some games!" /> : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
        {rivals.map(([k, r]) => {
          const opp = k.split('|').find(t => t !== myTeam);
          const myWins = r.wins[myTeam] || 0;
          const theirWins = r.wins[opp] || 0;
          const leading = myWins > theirWins;
          const trailing = myWins < theirWins;
          return (
            <div key={k} style={{
              background: C.panel, border: `1px solid ${r.isRival ? C.rival : C.line}`, borderRadius: 12,
              padding: '16px', display: 'flex', flexDirection: 'column', gap: 12,
              animation: 'risePop .35s ease both',
            }}>
              {r.isRival && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span style={{ fontFamily: mono, fontSize: 9, color: C.rival, border: `1px solid ${C.rival}`, borderRadius: 4, padding: '1px 8px', fontWeight: 700, letterSpacing: 1 }}>RIVALRY</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
                  <TeamCrest name={myTeam} size={36} />
                  <span style={{ fontWeight: 700, fontSize: 12, color: C.acc, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{myTeam}</span>
                  <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 800, color: leading ? C.win : trailing ? C.red : C.dim }}>{myWins}</span>
                </div>

                <WinRing mine={myWins} theirs={theirWins} />

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
                  <TeamCrest name={opp} size={36} />
                  <span style={{ fontWeight: 700, fontSize: 12, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{opp}</span>
                  <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 800, color: trailing ? C.win : leading ? C.red : C.dim }}>{theirWins}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', fontFamily: mono, fontSize: 10, color: C.faint }}>
                {r.matches} map{r.matches !== 1 ? 's' : ''} played
                {r.isRival && <span style={{ color: C.rival }}> · +mentality boost in matchups</span>}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════
// TRANSFER PANEL (used inside calendar)
// ═══════════════════════════════════════════════════════════════════════

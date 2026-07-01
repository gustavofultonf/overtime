import React from 'react';
import { C, mono } from './theme.js';
import { SL } from './primitives.jsx';

const TIER_META = {
  Major: { color: C.gold, label: 'MAJOR' },
  A: { color: C.live, label: 'A-TIER' },
  B: { color: C.dim, label: 'B-TIER' },
};

// All-time championship gallery. Combines this season's live wins (season.history)
// with prior years' preserved title details (season.yearHistory[].titles — see
// startNewYear() in App.jsx, which stops storing just a count and keeps the actual
// event records now). Renders nothing if the org has never won anything, so it
// doesn't clutter the screen for a team still chasing its first trophy.
export function TrophyCase({ season, myTeam }) {
  const pastTitles = (season.yearHistory || []).flatMap((y) =>
    (y.titles || []).map((t) => ({ ...t, year: y.year })),
  );
  const currentTitles = (season.history || [])
    .filter((h) => h.place === 1)
    .map((h) => ({ label: h.label, tier: h.tier, eventNum: h.eventNum, year: season.year }));
  const all = [...pastTitles, ...currentTitles].sort(
    (a, b) => b.year - a.year || b.eventNum - a.eventNum,
  );
  if (all.length === 0) return null;

  const majors = all.filter((t) => t.tier === 'Major').length;

  return (
    <div style={{ marginBottom: 20 }}>
      <SL n="TRO" t={`TROPHY CASE · ${all.length} title${all.length === 1 ? '' : 's'}${majors ? ` (${majors} Major${majors === 1 ? '' : 's'})` : ''}`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
        {all.map((t, i) => {
          const meta = TIER_META[t.tier] || TIER_META.B;
          return (
            <div key={i} className="lift" style={{
              background: `linear-gradient(160deg, ${meta.color}14, ${C.panel})`,
              border: `1px solid ${meta.color}55`, borderRadius: 10, padding: '12px 14px',
              textAlign: 'center', animation: t.tier === 'Major' ? 'glowPulse 2.6s ease-in-out infinite' : 'none',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: meta.color, margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 700, fontSize: 12.5, color: C.ink, lineHeight: 1.3 }}>{t.label}</div>
              <div style={{ fontFamily: mono, fontSize: 9.5, color: meta.color, letterSpacing: 1, marginTop: 4 }}>{meta.label}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.faint, marginTop: 2 }}>{t.year}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

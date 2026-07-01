import React from 'react';
import { C, sans, mono } from './theme.js';

// Terminal screen shown when an organization goes bankrupt (see triggerBankruptcy
// in App.jsx). The save slot stays on this screen if reloaded — the only way
// forward is to start a brand new organization.
export function BankruptcyScreen({ season, myTeam, onNewOrg }) {
  const yr = season.year || 2026;
  const seasonsPlayed = (season.yearHistory?.length || 0) + 1;
  const peakRank = Math.min(
    ...(season.yearHistory || []).map((y) => y.rank || 999),
    999,
  );
  const totalTrophies =
    (season.yearHistory || []).reduce((s, y) => s + (y.trophies || 0), 0) +
    (season.history || []).filter((h) => h.place === 1).length;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.ink, fontFamily: sans, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: 560, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.red, letterSpacing: 3, marginBottom: 10 }}>ORGANIZATION FOLDED</div>
          <div style={{ fontFamily: mono, fontSize: 30, fontWeight: 800, color: C.red, letterSpacing: 1 }}>{myTeam} IS BANKRUPT</div>
          <div style={{ fontFamily: mono, fontSize: 13, color: C.dim, marginTop: 10, lineHeight: 1.6 }}>
            The board has pulled all funding. After {yr - (season.yearHistory?.[0]?.year ?? yr)} year{seasonsPlayed > 1 ? 's' : ''} in charge,
            {' '}{myTeam} can no longer field a roster.
          </div>
        </div>

        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: '18px 22px', marginBottom: 22 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.faint, letterSpacing: 1.5, marginBottom: 12 }}>FINAL RECORD</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: 9, color: C.faint }}>SEASONS PLAYED</div>
              <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 800, color: C.ink }}>{seasonsPlayed}</div>
            </div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 9, color: C.faint }}>PEAK RANK</div>
              <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 800, color: C.acc }}>{peakRank <= 999 ? `#${peakRank}` : 'Unranked'}</div>
            </div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 9, color: C.faint }}>TROPHIES WON</div>
              <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 800, color: C.gold }}>{totalTrophies}</div>
            </div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 9, color: C.faint }}>FINAL BALANCE</div>
              <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 800, color: C.red }}>-${Math.abs(Math.round(season.budget))}K</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onNewOrg}
            style={{ background: C.acc, color: '#0a0c10', border: 'none', borderRadius: 10, padding: '14px 32px', fontFamily: mono, fontWeight: 800, fontSize: 15 }}
          >
            START A NEW ORGANIZATION →
          </button>
        </div>
      </div>
    </div>
  );
}

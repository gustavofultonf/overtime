import React, { useState } from 'react';
import { C, sans, mono } from './theme.js';
import { FACILITIES, COACHES } from '../constants/events.js';
import { playerOvr } from '../engine/player.js';
import { rosterOf } from '../engine/state.js';
import { Intro, SL, Pill, Stat } from './primitives.jsx';

const COACHES_PER_PAGE = 5;

// Scouting grade from a prospect's hidden potential ceiling.
function prospectGrade(pot) {
  if (pot >= 90) return { letter: "S", color: C.gold };
  if (pot >= 84) return { letter: "A", color: C.acc };
  if (pot >= 77) return { letter: "B", color: C.win };
  if (pot >= 70) return { letter: "C", color: C.live };
  return { letter: "D", color: C.dim };
}

export function FacilitiesView({ season, myTeam, onUpgrade, onHireCoach, onFireCoach, onInitAcademy, onPromoteProspect, onSellProspect }) {
  const coach = season.simState.coach;
  const rosterFull = myTeam ? rosterOf(season.simState, myTeam).length >= 5 : false;
  const [coachPage, setCoachPage] = useState(0);
  const coachPageCount = Math.ceil(COACHES.length / COACHES_PER_PAGE);
  const coachesShown = COACHES.slice(coachPage * COACHES_PER_PAGE, (coachPage + 1) * COACHES_PER_PAGE);
  return (<div>
    <Intro text="Build out your organization: hire a coach, run an academy, and upgrade facilities for permanent passive bonuses." />

    {/* ── Coaching staff ── */}
    <SL n="CCH" t="HEAD COACH" />
    {coach ? (
      <div style={{ background: C.panel, border: `1px solid ${C.live}`, borderRadius: 10, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{coach.name}</div>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.live }}>{coach.style}</div>
        </div>
        <span style={{ fontSize: 12, color: C.dim, flex: 1, minWidth: 160 }}>{coach.desc}</span>
        <span style={{ fontFamily: mono, fontSize: 11, color: C.gold }}>${coach.salary}K/mo</span>
        <button onClick={onFireCoach} style={{ background: "transparent", border: `1px solid ${C.red}`, color: C.red, borderRadius: 6, padding: "6px 12px", fontFamily: mono, fontSize: 10, fontWeight: 700 }}>FIRE</button>
      </div>
    ) : (
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
          {coachesShown.map(c => (
            <div key={c.name} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 9, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ minWidth: 74 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                <span style={{ fontFamily: mono, fontSize: 9, color: C.live }}>{c.style}</span>
              </div>
              <span style={{ fontSize: 11, color: C.dim, flex: 1, minWidth: 160 }}>{c.desc}</span>
              <span style={{ fontFamily: mono, fontSize: 11, color: C.gold }}>${c.salary}K/mo</span>
              <button onClick={() => onHireCoach(c)} disabled={season.budget < c.salary}
                style={{ background: season.budget >= c.salary ? C.win : C.panel2, color: season.budget >= c.salary ? C.onAcc : C.faint, border: "none", borderRadius: 6, padding: "6px 14px", fontFamily: mono, fontSize: 10, fontWeight: 700 }}>HIRE</button>
            </div>
          ))}
        </div>
        {coachPageCount > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <button onClick={() => setCoachPage(p => Math.max(0, p - 1))} disabled={coachPage === 0}
              style={{ background: "transparent", border: `1px solid ${C.line}`, color: coachPage === 0 ? C.faint : C.ink, borderRadius: 6, padding: "5px 12px", fontFamily: mono, fontSize: 10, fontWeight: 700 }}>‹ PREV</button>
            <span style={{ fontFamily: mono, fontSize: 10, color: C.dim }}>Page {coachPage + 1} of {coachPageCount}</span>
            <button onClick={() => setCoachPage(p => Math.min(coachPageCount - 1, p + 1))} disabled={coachPage === coachPageCount - 1}
              style={{ background: "transparent", border: `1px solid ${C.line}`, color: coachPage === coachPageCount - 1 ? C.faint : C.ink, borderRadius: 6, padding: "5px 12px", fontFamily: mono, fontSize: 10, fontWeight: 700 }}>NEXT ›</button>
          </div>
        )}
      </div>
    )}

    {/* ── Academy ── */}
    <SL n="ACD" t="YOUTH ACADEMY" />
    {!season.academy ? (
      <div style={{ background: C.panel, border: `1px dashed ${C.line}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Establish Academy</div>
          <div style={{ fontSize: 11, color: C.dim }}>Develop young talent for your roster or sell for profit. New prospects scouted every 6 weeks.</div>
        </div>
        <button onClick={onInitAcademy} disabled={season.budget < 100}
          style={{ background: season.budget >= 100 ? C.acc : C.panel2, color: season.budget >= 100 ? C.onAcc : C.faint, border: "none", borderRadius: 7, padding: "9px 18px", fontWeight: 700, fontSize: 12 }}>
          $100K
        </button>
      </div>
    ) : (
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.faint, marginBottom: 8 }}>Active {season.academy.weeksActive} weeks · {season.academy.prospects.length}/4 prospects</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {season.academy.prospects.map((p, i) => (
            <div key={i} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 9, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ minWidth: 84 }}>
                <div style={{ fontWeight: 600, fontSize: 12.5 }}>{p.name}</div>
                <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 2 }}><Pill c={C.dim}>{p.role}</Pill><span style={{ fontFamily: mono, fontSize: 9, color: C.win }}>age {p.age}</span></div>
              </div>
              <Stat l="OVR" v={playerOvr(p)} />
              {(() => { const g = prospectGrade(p.potential || playerOvr(p)); return (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 34 }} title={`Projected ceiling ~${p.potential || "?"} OVR`}>
                  <span style={{ fontFamily: mono, fontSize: 9, color: C.faint }}>POT</span>
                  <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 800, color: g.color }}>{g.letter}</span>
                </div>); })()}
              <Stat l="AIM" v={p.aim} />
              <span style={{ fontFamily: mono, fontSize: 9, color: C.faint }}>{p.weeksInAcademy || 0}wk trained</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
                <button onClick={() => onPromoteProspect(i)} disabled={rosterFull}
                  style={{ background: rosterFull ? C.panel2 : C.win, color: rosterFull ? C.faint : C.onAcc, border: "none", borderRadius: 5, padding: "5px 11px", fontFamily: mono, fontSize: 9, fontWeight: 700 }}>PROMOTE</button>
                <button onClick={() => onSellProspect(i)} disabled={(p.weeksInAcademy || 0) < 8}
                  style={{ background: (p.weeksInAcademy || 0) >= 8 ? C.panel2 : C.panel2, color: (p.weeksInAcademy || 0) >= 8 ? C.gold : C.faint, border: `1px solid ${(p.weeksInAcademy || 0) >= 8 ? C.gold + "44" : C.line}`, borderRadius: 5, padding: "5px 11px", fontFamily: mono, fontSize: 9, fontWeight: 700 }}>
                  {(p.weeksInAcademy || 0) >= 8 ? `SELL $${Math.round(playerOvr(p) * 0.8)}K` : `${8 - (p.weeksInAcademy || 0)}wk to sell`}
                </button>
              </div>
            </div>
          ))}
          {season.academy.prospects.length === 0 && <div style={{ fontFamily: mono, fontSize: 11, color: C.faint, padding: "8px 0" }}>No prospects yet — new talent scouted every 6 weeks.</div>}
        </div>
      </div>
    )}

    {/* ── Facilities ── */}
    <SL n="FAC" t="FACILITIES" />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
      {Object.entries(FACILITIES).map(([id, fac]) => {
        const tier = season.facilities?.[id] || 0;
        const maxed = tier >= fac.maxTier;
        const nextCost = maxed ? null : fac.cost[tier];
        const canAfford = nextCost && season.budget >= nextCost;
        return (
          <div key={id} style={{ background: C.panel, border: `1px solid ${tier > 0 ? C.win + "44" : C.line}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{fac.name}</div>
                <div style={{ display: "flex", gap: 3, marginTop: 4, alignItems: "center" }}>
                  {Array.from({ length: fac.maxTier }, (_, i) => (
                    <div key={i} style={{ width: 16, height: 4, borderRadius: 2, background: i < tier ? C.win : C.line }} />
                  ))}
                  <span style={{ fontFamily: mono, fontSize: 9, color: tier > 0 ? C.win : C.faint, marginLeft: 4 }}>Tier {tier}/{fac.maxTier}</span>
                </div>
              </div>
            </div>
            {tier > 0 && <div style={{ fontSize: 10, color: C.win, marginBottom: 6, fontFamily: mono }}>{fac.desc[tier - 1]}</div>}
            {!maxed ? (
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 11, color: C.dim, marginBottom: 6 }}>{tier === 0 ? "Unlock:" : "Upgrade:"} {fac.desc[tier]}</div>
                <button onClick={() => onUpgrade(id)} disabled={!canAfford}
                  style={{ width: "100%", background: canAfford ? C.acc : C.panel2, color: canAfford ? C.onAcc : C.faint, border: "none", borderRadius: 7, padding: "8px", fontWeight: 700, fontSize: 12 }}>
                  {canAfford ? `UPGRADE — ${nextCost}K` : `$${nextCost}K (need $${nextCost - season.budget}K more)`}
                </button>
              </div>
            ) : (
              <div style={{ fontFamily: mono, fontSize: 10, color: C.gold, marginTop: 6 }}>MAX TIER</div>
            )}
          </div>);
      })}
    </div>
  </div>);
}

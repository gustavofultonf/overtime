import React, { useState } from 'react';
import { C, sans, mono } from './theme.js';
import { MAPS, AI_TEAMS } from '../constants/data.js';
import { EVENTS, ACTIVITIES, weekToLabel, contractLabel } from '../constants/events.js';
import { playerOvr, getRankedTeams } from '../engine/player.js';
import { rosterOf, getMapProf, currentMapPool, teamActivePool } from '../engine/state.js';
import { SL, Banner, Pill, Stat, FormArrow } from './primitives.jsx';

const tierColor = t => t === "Major" ? C.gold : t === "A" ? C.live : C.dim;
const tierLabel = t => t === "Major" ? "MAJOR" : t === "A" ? "A-TIER" : "B-TIER";
const ordinal = n => { const s = ["th","st","nd","rd"]; const v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };

export function CalendarView({ season, myTeam, onAdvance, onSim, onAcceptSponsor, onDeclineSponsor, onResolveEvent, onResolveContract, onAcceptEntry, onDeclineEntry }) {
  const [act, setAct] = useState(null);
  const [mapChoice, setMapChoice] = useState(MAPS[0]);
  const [scoutChoice, setScoutChoice] = useState(null);

  const roster = rosterOf(season.simState, myTeam);
  const avgFatigue = roster.length ? Math.round(roster.reduce((s, p) => s + p.fatigue, 0) / roster.length) : 0;
  const nextEvent = EVENTS.find(e => e.week >= season.week);
  const weeksUntil = nextEvent ? nextEvent.week - season.week : 99;
  const totalSalary = roster.reduce((s, p) => s + p.salary, 0);
  const pendingContracts = season.pendingContracts || [];
  const pendingEntry = season.pendingEntry || null;
  const blocked = !!(season.pendingEvent || pendingContracts.length || pendingEntry);
  const upcoming = EVENTS.filter(e => e.week >= season.week).slice(0, 4);
  const sponsorOffers = (season.sponsorships || []).filter(sp => sp.offered);

  const ranked = getRankedTeams(season.simState, myTeam);
  const myRank = ranked.findIndex(x => x.team === myTeam) + 1;

  function confirm() {
    if (!act) return;
    const arg = act === "practice" ? mapChoice : act === "scout" ? scoutChoice : null;
    if (act === "scout" && !arg) return;
    onAdvance(act, arg);
    setAct(null);
  }

  const lastEvent = season.weekLog.length > 0 ? season.weekLog[season.weekLog.length - 1]?.event : null;

  return (<div>
    {/* ── Time-sensitive alerts ── */}
    {season.pendingEvent && (
      <div style={{ background: "rgba(99,102,241,.10)", border: `1px solid #6366f155`, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 10, color: "#a5b4fc", letterSpacing: 1 }}>DECISION</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>{season.pendingEvent.title}</span>
        </div>
        <div style={{ fontSize: 13, color: C.dim, marginBottom: 14 }}>{season.pendingEvent.text}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {season.pendingEvent.choices.map((c, i) => (
            <button key={i} onClick={() => onResolveEvent && onResolveEvent(i)}
              style={{ background: C.panel, border: `1px solid #6366f144`, borderRadius: 8, padding: "10px 14px", textAlign: "left", display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: "#818cf8", minWidth: 14 }}>{i + 1}.</span>
              <span>
                <span style={{ fontWeight: 700, fontSize: 13, color: C.ink, display: "block" }}>{c.label}</span>
                <span style={{ fontFamily: mono, fontSize: 10, color: C.dim }}>{c.desc}</span>
              </span>
            </button>
          ))}
        </div>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.faint, marginTop: 10 }}>Resolve this before advancing the week.</div>
      </div>
    )}

    {pendingContracts.map(c => {
      const perf = Math.min(1.3, Math.max(0.9, c.avgRating));
      const extSalary = Math.max(c.currentSalary, Math.round(c.currentSalary * perf * 1.1));
      const urgent = c.contract <= 0;
      return (
        <div key={c.playerName} style={{ background: urgent ? "rgba(239,68,68,.08)" : "rgba(243,194,91,.06)", border: `1px solid ${urgent ? C.red + "55" : C.gold + "44"}`, borderRadius: 12, padding: "14px 18px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 10, color: urgent ? C.red : C.gold, letterSpacing: 1 }}>{urgent ? "EXPIRED" : "CONTRACT"}</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{c.playerName}</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: C.faint, marginLeft: "auto" }}>rating {c.avgRating} · ${c.currentSalary}K/mo</span>
          </div>
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 12 }}>
            {urgent ? `${c.playerName}'s contract has expired. Extend or they leave.` : `${c.playerName}'s deal runs down in ${contractLabel(c.contract)} — sort his future now.`}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => onResolveContract && onResolveContract(c.playerName, 0)}
              style={{ flex: 1, minWidth: 120, background: C.win + "22", border: `1px solid ${C.win}44`, borderRadius: 8, padding: "9px 12px", textAlign: "left", cursor: "pointer" }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: C.win }}>Extend — 2 years</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.dim }}>${extSalary}K/mo · performance raise</div>
            </button>
            <button onClick={() => onResolveContract && onResolveContract(c.playerName, 1)}
              style={{ flex: 1, minWidth: 120, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 12px", textAlign: "left", cursor: "pointer" }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: C.dim }}>Short deal — 1 year</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.faint }}>${c.currentSalary}K/mo · no raise</div>
            </button>
            <button onClick={() => onResolveContract && onResolveContract(c.playerName, 2)}
              style={{ minWidth: 90, background: "transparent", border: `1px solid ${C.red}44`, borderRadius: 8, padding: "9px 12px", textAlign: "left", cursor: "pointer" }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: C.red }}>Release</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.faint }}>free agent</div>
            </button>
          </div>
        </div>);
    })}

    {sponsorOffers.length > 0 && (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {sponsorOffers.map((sp, i) => {
          const idx = (season.sponsorships || []).indexOf(sp);
          return (
            <div key={i} style={{ background: "rgba(243,194,91,.06)", border: `1px solid ${C.gold}44`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 10, color: C.gold, letterSpacing: 1 }}>SPONSOR</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{sp.brand}</span>
              <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>${sp.monthly}K/mo × {sp.duration}mo</span>
              <span style={{ fontSize: 11, color: C.faint }}>{sp.condition !== "None" ? `Condition: ${sp.condition}` : "No conditions"}</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <button onClick={() => onAcceptSponsor(idx)} style={{ background: C.win, color: "#0a0c10", border: "none", borderRadius: 6, padding: "6px 14px", fontFamily: mono, fontSize: 10, fontWeight: 700 }}>ACCEPT</button>
                <button onClick={() => onDeclineSponsor(idx)} style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.dim, borderRadius: 6, padding: "6px 12px", fontFamily: mono, fontSize: 10, fontWeight: 700 }}>DECLINE</button>
              </div>
            </div>);
        })}
      </div>
    )}

    {pendingEntry && (() => {
      const ev = pendingEntry.ev;
      const tc = tierColor(ev.tier);
      const isA = ev.tier === "A";
      const reason = isA
        ? (pendingEntry.directSlot
            ? `Direct invite — you're ranked #${pendingEntry.myRank} (top 12).`
            : `Organizer wildcard invite — you're ranked #${pendingEntry.myRank}, outside the top 12.`)
        : `Open qualifier — register to compete. You're free to sit it out and keep developing.`;
      const recentB = [...(season.history || [])].reverse().find(h => h.tier === "B" && h.place !== 99);
      const recentBDNP = !recentB ? [...(season.history || [])].reverse().find(h => h.tier === "B") : null;
      return (
        <div style={{ background: "rgba(155,140,255,.08)", border: `1px solid ${tc}66`, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 10, color: tc, letterSpacing: 1 }}>{isA ? "A-TIER INVITATIONAL" : "B-TIER OPEN QUALIFIER"}</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>{ev.label}</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: C.faint, marginLeft: "auto" }}>{ev.location} · {ev.teams} teams · winner ${ev.prize?.[1] || 0}K</span>
          </div>
          <div style={{ fontSize: 13, color: C.dim, marginBottom: 14 }}>{reason}</div>
          {isA && (
            <div style={{ background: "rgba(99,102,241,.06)", border: `1px solid ${C.live}33`, borderRadius: 8, padding: "8px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 9, color: C.live, letterSpacing: 1 }}>CIRCUIT FORM</span>
              {recentB ? (
                <>
                  <span style={{ fontFamily: mono, fontSize: 11, color: recentB.place <= 4 ? C.win : C.dim }}>
                    Last B-tier: {ordinal(recentB.place)} at {recentB.label?.replace(" (DNP)", "") || "event"}
                  </span>
                  {!pendingEntry.directSlot && (
                    <span style={{ fontFamily: mono, fontSize: 10, color: recentB.place <= 4 ? C.win : C.gold, marginLeft: "auto" }}>
                      {recentB.place <= 4 ? "Strong form — high invite odds" : "Moderate form — lower invite odds"}
                    </span>
                  )}
                </>
              ) : recentBDNP ? (
                <span style={{ fontFamily: mono, fontSize: 11, color: C.faint }}>No B-tier results yet (sat out {recentBDNP.label?.replace(" (DNP)", "") || "last event"})</span>
              ) : (
                <span style={{ fontFamily: mono, fontSize: 11, color: C.faint }}>No B-tier results this season</span>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => onAcceptEntry && onAcceptEntry()}
              style={{ flex: 1, minWidth: 150, background: tc, color: "#0a0c10", border: "none", borderRadius: 8, padding: "11px 16px", fontWeight: 800, fontSize: 14 }}>
              {isA ? "Accept invite →" : "Register & compete →"}
            </button>
            <button onClick={() => onDeclineEntry && onDeclineEntry()}
              style={{ minWidth: 110, background: "transparent", border: `1px solid ${C.line}`, color: C.dim, borderRadius: 8, padding: "11px 16px", fontWeight: 700, fontSize: 13 }}>
              {isA ? "Decline" : "Skip event"}
            </button>
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.faint, marginTop: 10 }}>Decide before advancing the week.</div>
        </div>
      );
    })()}

    {weeksUntil === 0 && nextEvent && !pendingEntry ? (
      <Banner c={tierColor(nextEvent.tier)}>
        <span style={{ fontSize: 15, fontWeight: 700, color: tierColor(nextEvent.tier) }}>
          {nextEvent.label} — {weekToLabel(season.week, season.year)}, {nextEvent.location || ""}
        </span>
        <span style={{ fontFamily: mono, fontSize: 11, color: C.dim, display: "block", marginTop: 3 }}>
          {tierLabel(nextEvent.tier)} · {nextEvent.teams} teams{nextEvent.bo ? ` · Bo${nextEvent.bo}` : ""}
        </span>
      </Banner>
    ) : (
      /* ── THIS WEEK — actions ── */
      <>
        <SL n="ACT" t="THIS WEEK" />
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "16px", marginBottom: 22, position: "relative" }}>
          {blocked && (
            <div style={{ fontFamily: mono, fontSize: 11, color: C.gold, marginBottom: 12, background: "rgba(243,194,91,.06)", border: `1px solid ${C.gold}33`, borderRadius: 7, padding: "8px 12px" }}>
              Resolve the alerts above before training this week.
            </div>
          )}
          <div style={{ opacity: blocked ? 0.4 : 1, pointerEvents: blocked ? "none" : "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 9 }}>
              {Object.entries(ACTIVITIES).map(([k, a]) => {
                const sel = act === k;
                const warn = a.fatigue > 0 && avgFatigue + a.fatigue > 70;
                const fc = a.fatigue > 0 ? (warn ? C.red : C.gold) : C.win;
                return (
                  <button key={k} onClick={() => setAct(sel ? null : k)}
                    style={{ background: sel ? C.acc + "1f" : C.panel2, border: `1px solid ${sel ? C.acc : C.line}`, borderRadius: 9, padding: "11px 13px", textAlign: "left", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: sel ? C.acc : C.ink, textTransform: "capitalize" }}>{a.label}</span>
                      <span style={{ fontFamily: mono, fontSize: 9, color: fc, fontWeight: 700 }}>{a.fatigue > 0 ? `+${a.fatigue}` : a.fatigue} FTG</span>
                    </div>
                    <div style={{ fontSize: 10.5, color: C.dim, lineHeight: 1.4 }}>{a.desc}</div>
                    {warn && <div style={{ fontFamily: mono, fontSize: 9, color: C.red, marginTop: 4 }}>! squad already tired</div>}
                  </button>);
              })}
            </div>

            {act === "practice" && (() => {
              const pool = currentMapPool(season.simState);
              const activeP = teamActivePool(season.simState, myTeam) || [];
              return (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.faint, letterSpacing: 1, marginBottom: 8 }}>MAP TO DRILL</div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {pool.map(m => { const prof = getMapProf(season.simState, myTeam)[m] || 50; const inPool = activeP.includes(m); return (
                    <button key={m} onClick={() => setMapChoice(m)}
                      style={{ background: mapChoice === m ? C.acc : C.panel2, color: mapChoice === m ? "#0a0c10" : C.ink, border: `1px solid ${mapChoice === m ? C.acc : inPool ? C.acc + "55" : C.line}`, borderRadius: 7, padding: "7px 13px", fontFamily: mono, fontSize: 12 }}>
                      {m} <span style={{ fontSize: 10, color: mapChoice === m ? "#0a0c10aa" : C.faint }}>{prof}</span>
                      {!inPool && activeP.length > 0 && <span style={{ fontSize: 8, color: C.red, marginLeft: 4 }}>decay</span>}
                    </button>); })}
                </div>
              </div>);
            })()}

            {act === "scout" && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.faint, letterSpacing: 1, marginBottom: 8 }}>TEAM TO SCOUT</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {AI_TEAMS.filter(tm => rosterOf(season.simState, tm).length > 0).map(tm => {
                    const scouted = season.scoutedTeams?.[tm];
                    return (<button key={tm} onClick={() => setScoutChoice(tm)}
                      style={{ background: scoutChoice === tm ? C.acc : C.panel2, color: scoutChoice === tm ? "#0a0c10" : C.ink, border: `1px solid ${scoutChoice === tm ? C.acc : scouted ? C.win + "66" : C.line}`, borderRadius: 7, padding: "6px 12px", fontFamily: mono, fontSize: 11 }}>
                      {tm}{scouted ? " ✓" : ""}
                    </button>);
                  })}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16, flexWrap: "wrap" }}>
              <button onClick={confirm} disabled={!act || (act === "scout" && !scoutChoice)}
                style={{ background: (!act || (act === "scout" && !scoutChoice)) ? C.line : C.acc, color: (!act || (act === "scout" && !scoutChoice)) ? C.faint : C.onAcc, border: "none", borderRadius: 9, padding: "12px 24px", fontWeight: 700, fontSize: 15, cursor: act ? "pointer" : "default" }}>
                Advance Week →
              </button>
              {!act && weeksUntil > 1 && (
                <button onClick={onSim} style={{ background: "transparent", border: `1px solid ${C.live}`, borderRadius: 9, padding: "11px 20px", fontFamily: mono, fontSize: 12, color: C.live, fontWeight: 700, cursor: "pointer" }}>
                  Sim {weeksUntil} weeks to {nextEvent?.label?.split(" ")[0] || "event"} →
                </button>
              )}
              <span style={{ fontFamily: mono, fontSize: 11, color: C.faint, marginLeft: "auto" }}>
                {act ? `Week ${season.week} → ${season.week + 1}` : "Pick an activity, or sim ahead"}
              </span>
            </div>
          </div>
        </div>
      </>
    )}

    {lastEvent && (
      <div style={{ background: "rgba(243,194,91,.07)", border: `1px solid ${C.gold}44`, borderRadius: 9, padding: "10px 14px", marginBottom: 22, fontFamily: mono, fontSize: 12, color: C.gold }}>
        {lastEvent}
      </div>
    )}

    {/* ── Upcoming events ── */}
    <SL n="EVT" t="UPCOMING EVENTS" />
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
      {upcoming.length === 0 && <div style={{ fontFamily: mono, fontSize: 11, color: C.faint, padding: "8px 0" }}>No events left this season.</div>}
      {upcoming.map((ev, i) => {
        const wk = ev.week - season.week;
        const tc = tierColor(ev.tier);
        const isNext = i === 0;
        const accessInfo = (() => {
          if (ev.tier === "B") return { text: "Open — register to enter", color: C.win };
          if (ev.tier === "Major") return myRank <= 16 ? { text: `Qualified — ranked #${myRank}`, color: C.win } : { text: `Not qualified — ranked #${myRank} (need top 16)`, color: C.red };
          if (myRank <= 12) return { text: `Direct invite — ranked #${myRank}`, color: C.win };
          if (myRank <= 24) {
            const lastB = [...(season.history || [])].reverse().find(h => h.tier === "B" && h.place !== 99);
            const goodForm = lastB && lastB.place <= 4;
            return { text: goodForm ? `Wildcard likely — ${ordinal(lastB.place)} at ${lastB.label?.replace(" (DNP)","")}`  : lastB ? `Wildcard possible — ${ordinal(lastB.place)} at ${lastB.label?.replace(" (DNP)","")}` : "Wildcard unlikely — no B-tier results", color: goodForm ? C.gold : C.faint };
          }
          return { text: `Out of range — ranked #${myRank} (need top 24)`, color: C.red };
        })();
        return (
          <div key={ev.week} className="lift" style={{ background: isNext ? "linear-gradient(135deg,#13171f,#1a1f29)" : C.panel, border: `1px solid ${isNext ? tc : C.line}`, borderLeft: `3px solid ${tc}`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, animation: "risePop .4s ease both", animationDelay: `${i * 0.06}s`, ...(isNext ? { boxShadow: `0 0 18px -6px ${tc}66` } : {}) }}>
            <div style={{ background: tc + "22", border: `1px solid ${tc}`, borderRadius: 6, padding: "3px 9px", fontFamily: mono, fontSize: 9, color: tc, fontWeight: 700, flexShrink: 0 }}>{tierLabel(ev.tier)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: isNext ? C.ink : C.dim }}>{ev.label}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.faint, marginTop: 2 }}>{ev.location} · {weekToLabel(ev.week, season.year)} · {ev.teams} teams</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: accessInfo.color, marginTop: 3 }}>{accessInfo.text}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: mono, fontSize: 15, fontWeight: 800, color: wk === 0 ? C.red : wk <= 2 ? C.gold : C.live }}>{wk === 0 ? "NOW" : `${wk}wk`}</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: C.faint }}>{wk === 0 ? "this week" : "away"}</div>
            </div>
          </div>);
      })}
    </div>

    {/* ── Squad ── */}
    <SL n="SQD" t="SQUAD" />
    <div style={{ fontFamily: mono, fontSize: 10.5, color: C.faint, marginBottom: 8 }}>
      {roster.length}/5 players · ${totalSalary}K/mo salary · manage via the <span style={{ color: C.acc }}>Transfers</span> tab
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
      {roster.map((p, i) => {
        const fc = p.fatigue > 80 ? C.red : p.fatigue > 60 ? C.gold : p.fatigue > 40 ? "#8bc99a" : C.win;
        const morale = p.morale ?? 60;
        const mc = morale >= 70 ? C.win : morale >= 45 ? C.gold : C.red;
        return (
          <div key={p.name} className="lift" style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 9, padding: "11px 15px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", animation: "fadeUp .4s ease both", animationDelay: `${i * 0.06}s` }}>
            <div style={{ minWidth: 96 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{p.name}</div>
              <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 2 }}><Pill c={C.dim}>{p.role}</Pill><span style={{ fontFamily: mono, fontSize: 9, color: C.faint }}>age {p.age}</span></div>
            </div>
            <Stat l="OVR" v={playerOvr(p)} />
            <FormArrow form={p.form} />
            <Meter label="FATIGUE" value={p.fatigue} color={fc} />
            <Meter label="MORALE" value={morale} color={mc} />
            {p.injury && <span style={{ fontFamily: mono, fontSize: 9, color: C.red, border: `1px solid ${C.red}`, borderRadius: 4, padding: "1px 6px" }}>INJ {p.injury.weeks}wk</span>}
            {!p.injury && p.fatigue > 80 && <span style={{ fontFamily: mono, fontSize: 9, color: C.red, border: `1px solid ${C.red}`, borderRadius: 4, padding: "1px 6px" }}>EXHAUSTED</span>}
          </div>);
      })}
    </div>

    {/* ── Activity log ── */}
    {season.weekLog.length > 0 && (<>
      <SL n="LOG" t="ACTIVITY LOG" />
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: "6px 14px", display: "flex", flexDirection: "column", maxHeight: 240, overflowY: "auto" }}>
        {[...season.weekLog].reverse().slice(0, 18).map((w, i) => (
          <div key={i} style={{ fontFamily: mono, fontSize: 11, color: w.event ? C.gold : C.dim, padding: "6px 0", borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}>
            <span style={{ color: C.faint, marginRight: 6 }}>W{w.week}</span>
            {w.event ? w.event : (<span style={{ textTransform: "capitalize" }}>{ACTIVITIES[w.activity]?.label || w.activity}{w.mapChoice ? ` (${w.mapChoice})` : ""}</span>)}
          </div>
        ))}
      </div>
    </>)}
  </div>);
}

function Meter({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 52 }}>
      <span style={{ fontFamily: mono, fontSize: 9, color: C.faint }}>{label}</span>
      <div style={{ width: 48, height: 6, background: C.line, borderRadius: 3, overflow: "hidden", marginTop: 3 }}>
        <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: "100%", background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontFamily: mono, fontSize: 10, color, marginTop: 1 }}>{value}</span>
    </div>
  );
}

import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { C, mono, SHADOW } from "./theme.js";
import { getRankedTeams } from "../engine/player.js";
import { Intro, Locked, MiniStat, Overlay, SL } from "./primitives.jsx";
import { EventDetail } from "./EventDetail.jsx";
import { TrophyCase } from "./TrophyCase.jsx";

const ordinal = (n) => {
  if (n == null) return "—";
  if (n >= 90) return "DNP";
  if (n === 1) return "1st";
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
const placeColor = (p) =>
  p === 1 ? C.gold : p === 2 ? C.silver : p <= 4 ? C.acc : p <= 8 ? C.live : p >= 90 ? C.faint : C.dim;
const tierColor = (t) => (t === "Major" ? C.gold : t === "A" ? C.live : C.win);

// Real series/match record for the season — walks every fixture actually
// recorded against myTeam (swiss + bracket) rather than inferring it from
// placements. Depends on season.history[].tournament carrying real swiss +
// bracket data (see snapshotTournament() in App.jsx).
function seasonRecord(history, myTeam) {
  let wins = 0, losses = 0;
  (history || []).forEach((h) => {
    const t = h.tournament;
    if (!t) return;
    const swissMatches = t.swiss?.records?.[myTeam]?.matches || [];
    const br = t.bracket;
    const bracketMatches = br ? [...(br.qf || []), ...(br.sf || []), br.final].filter(Boolean) : [];
    [...swissMatches, ...bracketMatches].forEach((fx) => {
      if (!fx?.res) return;
      if (fx.res.winnerName === myTeam) wins++;
      else if (fx.res.loserName === myTeam) losses++;
    });
  });
  return { wins, losses };
}

function ChartTip({ active, payload, label, rows }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 6, padding: "7px 10px", fontFamily: mono, fontSize: 10 }}>
      <div style={{ color: C.faint, marginBottom: 3 }}>Event #{label}</div>
      {payload.map((p, i) => {
        const row = rows?.[p.dataKey];
        return (
          <div key={i} style={{ color: p.color, fontWeight: 700 }}>
            {row?.label || p.dataKey}: {row?.fmt ? row.fmt(p.value) : p.value}
          </div>
        );
      })}
    </div>
  );
}

function PlacementChart({ history }) {
  if (!history || history.length < 2) return null;
  const data = history.map((h) => ({ eventNum: h.eventNum, place: h.place >= 90 ? null : h.place }));
  const maxPlace = Math.max(...data.map((d) => d.place || 0), 8);
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid stroke={C.line} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="eventNum" tickFormatter={(v) => `#${v}`}
          tick={{ fill: C.faint, fontSize: 9, fontFamily: mono }} axisLine={{ stroke: C.line }} tickLine={false} />
        <YAxis domain={[1, maxPlace]} reversed allowDecimals={false}
          tickFormatter={(v) => (v === 1 ? "1st" : `T${v}`)}
          tick={{ fill: C.faint, fontSize: 9, fontFamily: mono }} axisLine={false} tickLine={false} width={34} />
        <Tooltip cursor={{ stroke: C.acc, strokeWidth: 1 }}
          content={<ChartTip rows={{ place: { label: "placement", fmt: ordinal } }} />} />
        <Line type="monotone" dataKey="place" name="placement" stroke={C.acc} strokeWidth={2.5}
          dot={{ r: 3.5, fill: C.acc, strokeWidth: 0 }} activeDot={{ r: 5 }} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}

function PrizeChart({ history }) {
  if (!history || history.length < 2) return null;
  const data = history.map((h) => ({ eventNum: h.eventNum, prize: h.prize || 0, tier: h.tier || "Major" }));
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid stroke={C.line} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="eventNum" tickFormatter={(v) => `#${v}`}
          tick={{ fill: C.faint, fontSize: 9, fontFamily: mono }} axisLine={{ stroke: C.line }} tickLine={false} />
        <YAxis tickFormatter={(v) => `$${v}K`}
          tick={{ fill: C.faint, fontSize: 9, fontFamily: mono }} axisLine={false} tickLine={false} width={46} />
        <Tooltip cursor={{ fill: C.line, opacity: 0.2 }}
          content={<ChartTip rows={{ prize: { label: "prize won", fmt: (v) => `$${v}K` } }} />} />
        <Bar dataKey="prize" name="prize" radius={[4, 4, 0, 0]} maxBarSize={30}>
          {data.map((d, i) => <Cell key={i} fill={tierColor(d.tier)} fillOpacity={0.8} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function EventRow({ h, myTeam, onOpen }) {
  const won = h.champion === myTeam;
  const tc = tierColor(h.tier);
  return (
    <button onClick={() => onOpen(h)} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 16px",
      background: "transparent", border: "none", borderTop: `1px solid ${C.line}`,
      cursor: "pointer", textAlign: "left",
    }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: C.faint, minWidth: 24 }}>#{h.eventNum}</span>
      <span style={{
        fontFamily: mono, fontSize: 9, fontWeight: 700, color: tc, background: tc + "1a",
        border: `1px solid ${tc}55`, borderRadius: 4, padding: "2px 7px", letterSpacing: 1,
        minWidth: 46, textAlign: "center", flexShrink: 0,
      }}>
        {(h.tier || "Major").toUpperCase()}
      </span>
      <span style={{
        flex: 1, minWidth: 0, fontSize: 13, fontWeight: won ? 700 : 500, color: won ? C.gold : C.ink,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {h.label}{won ? " — champions" : ""}
      </span>
      <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 13, color: placeColor(h.place), minWidth: 40, textAlign: "right" }}>
        {ordinal(h.place)}
      </span>
      <span style={{ fontFamily: mono, fontSize: 11, color: h.prize > 0 ? C.win : C.faint, minWidth: 62, textAlign: "right" }}>
        {h.prize > 0 ? `+$${h.prize}K` : "—"}
      </span>
      <span style={{ fontFamily: mono, fontSize: 9, color: C.faint }}>▸</span>
    </button>
  );
}

export function SeasonHistory({ season, myTeam }) {
  const [selected, setSelected] = useState(null);
  const hasPastTitles = (season.yearHistory || []).some((y) => (y.titles || []).length > 0);

  if (!season.history.length && !hasPastTitles)
    return <Locked text="Season history appears after your first event." />;
  if (!season.history.length)
    return (
      <div>
        <TrophyCase season={season} myTeam={myTeam} />
        <Locked text="This season's history appears after your first event." />
      </div>
    );

  const record = seasonRecord(season.history, myTeam);
  const winPct = record.wins + record.losses > 0 ? Math.round((record.wins / (record.wins + record.losses)) * 100) : null;
  const titles = season.history.filter((h) => h.place === 1).length;
  const bestPlace = Math.min(...season.history.map((h) => h.place));
  const totalPrize = season.history.reduce((s, h) => s + (h.prize || 0), 0);
  const ranked = getRankedTeams(season.simState, myTeam);
  const myRank = ranked.findIndex((x) => x.team === myTeam) + 1;
  const recordColor = winPct == null ? C.dim : winPct >= 55 ? C.win : winPct >= 45 ? C.gold : C.red;

  return (
    <div>
      <Intro text="Your results across all events this season." />

      {/* ── Hero record strip ── */}
      <div style={{
        display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 20, padding: "16px 20px",
        background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, boxShadow: SHADOW.card,
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: sans, fontSize: 10.5, fontWeight: 700, color: C.faint, letterSpacing: .7 }}>SEASON RECORD</span>
          <span style={{ fontFamily: mono, fontSize: 28, fontWeight: 800, color: recordColor }}>
            {record.wins}–{record.losses}
          </span>
        </div>
        <div style={{ width: 1, background: C.line }} />
        <MiniStat label="MATCH WIN%" value={winPct == null ? "—" : `${winPct}%`} color={recordColor} />
        <MiniStat label="EVENTS PLAYED" value={season.history.length} color={C.ink} />
        <MiniStat label="TITLES" value={titles} color={titles > 0 ? C.gold : C.dim} />
        <MiniStat label="BEST FINISH" value={ordinal(bestPlace)} color={placeColor(bestPlace)} />
        <MiniStat label="PRIZE WON" value={`$${totalPrize}K`} color={C.win} />
        <MiniStat label="SALARY PAID" value={`$${season.totalSalaryPaid || 0}K`} color={C.red} />
        <MiniStat label="WORLD RANK" value={myRank ? `#${myRank}` : "—"} color={C.live} />
      </div>

      <TrophyCase season={season} myTeam={myTeam} />

      {/* ── Charts ── */}
      {season.history.length >= 2 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginBottom: 20 }}>
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 18px" }}>
            <SL n="PLC" t="Placement trend" />
            <PlacementChart history={season.history} />
          </div>
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 18px" }}>
            <SL n="PRZ" t="Prize per event" />
            <PrizeChart history={season.history} />
            <div style={{ display: "flex", gap: 14, marginTop: 4, fontFamily: mono, fontSize: 9, color: C.faint }}>
              {["Major", "A", "B"].map((t) => (
                <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: tierColor(t) }} />
                  {t === "Major" ? "Major" : `${t}-Tier`}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Event list ── */}
      <SL n="EVT" t="Event results" />
      <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginBottom: 6 }}>
        * click any event to view swiss standings, bracket and player stats
      </div>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 20, boxShadow: SHADOW.card }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", fontSize: 10.5, fontWeight: 700, color: C.dim, letterSpacing: .3, background: C.panel2, borderBottom: `1px solid ${C.line}` }}>
          <span style={{ minWidth: 24 }}>#</span>
          <span style={{ minWidth: 46 }}>Tier</span>
          <span style={{ flex: 1 }}>Event</span>
          <span style={{ minWidth: 40, textAlign: "right" }}>Place</span>
          <span style={{ minWidth: 62, textAlign: "right" }}>Prize</span>
          <span style={{ width: 10 }} />
        </div>
        {season.history.map((h, i) => (
          <EventRow key={i} h={h} myTeam={myTeam} onOpen={setSelected} />
        ))}
      </div>

      {selected && (
        <Overlay onClose={() => setSelected(null)} title={`${selected.label} · ${selected.tier || "Major"} · ${ordinal(selected.place)}`} wide>
          <EventDetail event={selected} myTeam={myTeam} />
        </Overlay>
      )}
    </div>
  );
}

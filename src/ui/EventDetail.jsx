import React, { useState } from "react";
import { C, sans, mono } from "./theme.js";

function WLSquares({ w, l }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {Array.from({ length: w }, (_, j) => (
        <div
          key={"w" + j}
          style={{ width: 9, height: 9, borderRadius: 2, background: C.win }}
        />
      ))}
      {Array.from({ length: l }, (_, j) => (
        <div
          key={"l" + j}
          style={{ width: 9, height: 9, borderRadius: 2, background: C.red }}
        />
      ))}
    </div>
  );
}

function SwissStandings({ swiss, myTeam }) {
  if (!swiss) return null;
  const adv = swiss._advanceAt || 3,
    eli = swiss._elimAt || 3;
  const teams = [...(swiss.teams || [])].sort((a, b) => {
    const ra = swiss.records[a],
      rb = swiss.records[b];
    return rb.w - ra.w || ra.l - rb.l;
  });

  function statusOf(team) {
    const r = swiss.records[team];
    if (r.w >= adv) return "advanced";
    if (r.l >= eli) return "eliminated";
    if (r.w >= adv - 1) return "match_adv";
    if (r.l >= eli - 1) return "match_eli";
    return "active";
  }

  function statusColor(s) {
    return s === "advanced"
      ? C.win
      : s === "eliminated"
        ? C.red
        : s === "match_adv"
          ? C.live
          : s === "match_eli"
            ? C.gold
            : C.dim;
  }

  function statusLabel(s) {
    if (s === "advanced") return "ADVANCED";
    if (s === "eliminated") return "ELIMINATED";
    if (s === "match_adv") return "ADV MATCH";
    if (s === "match_eli") return "ELI MATCH";
    return "";
  }

  function TeamRow({ team }) {
    const r = swiss.records[team];
    if (!r) return null;
    const me = team === myTeam;
    const st = statusOf(team);
    const sc = statusColor(st);
    const [open, setOpen] = useState(false);
    const matches = r.matches || [];

    return (
      <div style={{ borderTop: `1px solid ${C.line}` }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "28px 1fr auto 90px",
            gap: 6,
            padding: "9px 14px",
            alignItems: "center",
            background: me
              ? "rgba(155,140,255,.06)"
              : st === "advanced"
                ? "rgba(61,220,132,.04)"
                : st === "eliminated"
                  ? "rgba(255,76,76,.04)"
                  : "transparent",
            borderLeft: `3px solid ${me ? C.acc : sc}`,
          }}
        >
          <span style={{ fontFamily: mono, fontSize: 12, color: C.faint }}>
            {matches.reduce((s, m) => s + (m.done || m.res ? 1 : 0), 0)}
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontWeight: me ? 700 : 600,
              fontSize: 13,
              color: me ? C.acc : C.ink,
            }}
          >
            {team}
          </span>
          <WLSquares w={r.w} l={r.l} />
          <span
            style={{
              fontFamily: mono,
              fontSize: 9,
              textAlign: "right",
              color: sc,
            }}
          >
            {statusLabel(st) || `${r.w}–${r.l}`}
          </span>
        </div>

        {/* Expand toggle */}
        {!open && (
          <button
            onClick={() => setOpen(true)}
            style={{
              width: "100%",
              display: "block",
              textAlign: "left",
              background: "transparent",
              border: "none",
              color: C.dim,
              cursor: "pointer",
              padding: "2px 14px",
              fontSize: 11,
              fontFamily: mono,
            }}
          >
            ▸ view all matches ({matches.length})
          </button>
        )}

        {open && (
          <div
            style={{
              background: C.panel2,
              borderTop: `1px solid ${C.line}`,
              borderBottom: `1px solid ${C.line}`,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "30px 80px 1fr 65px 70px 90px",
                gap: 4,
                fontFamily: mono,
                fontSize: 9,
                color: C.faint,
                letterSpacing: 1,
                padding: "4px 8px",
              }}
            >
              <span>R</span>
              <span>OPPONENT</span>
              <span style={{ textAlign: "center" }}>RESULT</span>
              <span>BO</span>
              <span></span>
              <span>PRESS</span>
            </div>

            {matches.map((fx, fi) => {
              const teamIsA = fx.a === team;
              const opponent = teamIsA ? fx.b : fx.a;
              const wA = !!(fx.res && fx.res.winnerName === team);
              const scoreLine =
                fx.scoreLine ||
                (fx.res
                  ? `${fx.res.seriesScore[0]}–${fx.res.seriesScore[1]}`
                  : "");
              const isUpset = fx.upsetBadge;

              return (
                <div
                  key={fi}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "30px 80px 1fr 65px 70px 90px",
                    gap: 4,
                    alignItems: "center",
                    padding: "2px 8px",
                  }}
                >
                  <span
                    style={{ fontFamily: mono, fontSize: 9, color: C.faint }}
                  >
                    {fx.roundIdx + 1}
                  </span>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: 10,
                      color:
                        opponent === myTeam
                          ? C.acc
                          : opponent === fx.res?.winnerName
                            ? C.ink
                            : C.dim,
                    }}
                  >
                    @ {opponent}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: mono,
                        fontWeight: 700,
                        fontSize: 12,
                        color: wA
                          ? C.win
                          : fx.res && fx.res.loserName === team
                            ? C.dim
                            : C.ink,
                      }}
                    >
                      {scoreLine}
                    </span>
                  </div>
                  <span style={{ fontFamily: mono, fontSize: 9, color: C.dim }}>
                    {fx.bo > 1 ? `Bo${fx.bo}` : "M"}
                  </span>
                  <span
                    style={{
                      textAlign: "right",
                      width: 24,
                      color:
                        fx.res && (wA === true || fx.res.winnerName === team)
                          ? C.win
                          : fx.res && fx.res.loserName === team
                            ? C.red
                            : C.dim,
                      fontFamily: mono,
                      fontWeight: 700,
                    }}
                  >
                    {fx.res ? (wA === true ? "W" : "L") : ""}
                  </span>
                  <span style={{ textAlign: "right", width: 90 }}>
                    {isUpset && (
                      <span
                        style={{ fontFamily: mono, fontSize: 9, color: C.gold }}
                      >
                        UPSET
                      </span>
                    )}
                  </span>
                </div>
              );
            })}

            <button
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                width: "100%",
                background: "transparent",
                border: "none",
                color: C.dim,
                cursor: "pointer",
                padding: "3px 8px",
                fontSize: 11,
                fontFamily: mono,
              }}
            >
              ▾ close
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        background: C.panel2,
        border: `1px solid ${C.line}`,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "28px 1fr auto 90px",
          gap: 6,
          padding: "8px 14px",
          fontFamily: mono,
          fontSize: 10,
          color: C.faint,
          letterSpacing: 1,
        }}
      >
        <span>R</span>
        <span>TEAM</span>
        <span style={{ textAlign: "center" }}>RECORD</span>
        <span style={{ textAlign: "right" }}>STATUS</span>
      </div>
      {teams.map((team) => (
        <TeamRow key={team} team={team} />
      ))}
      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "8px 14px",
          fontFamily: mono,
          fontSize: 9,
          flexWrap: "wrap",
          color: C.faint,
        }}
      >
        {[
          [C.win, `ADVANCED (${adv}W)`],
          [C.live, "ADV MATCH"],
          [C.gold, "ELI MATCH"],
          [C.red, `ELIMINATED (${eli}L)`],
        ].map(([c, l]) => (
          <span
            key={l}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <span
              style={{ width: 8, height: 8, borderRadius: 2, background: c }}
            />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function PlayoffBracket({ bracket }) {
  if (!bracket) return null;
  const rounds = bracket.qf
    ? ["qf", "sf", "final"]
    : bracket.sf
      ? ["sf", "final"]
      : ["final"];
  const roundNames = {
    qf: "QUARTERFINALS",
    sf: "SEMIFINALS",
    final: "GRAND FINAL",
  };

  return (
    <div
      style={{
        background: C.panel2,
        border: `1px solid ${C.line}`,
        borderRadius: 8,
      }}
    >
      {/* Column header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 60px auto",
          gap: 4,
          padding: "8px 14px",
          fontFamily: mono,
          fontSize: 10,
          color: C.faint,
          letterSpacing: 1,
        }}
      >
        <span>BRACKET</span>
        <span style={{ textAlign: "center" }}>SCORE</span>
        <span>TITLE</span>
      </div>
      {rounds.map((r) => (
        <div key={r}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 9,
              color: C.gold,
              letterSpacing: 1.5,
              padding: "4px 14px",
            }}
          >
            {roundNames[r]}
          </div>
          {(r === "final" ? [bracket.final] : bracket[r]).map((fx, fi) => {
            if (!fx.res) return null;
            const isMe = !!(fx.a === myTeam || fx.b === myTeam);
            const wA = fx.res.winnerName === fx.a;
            return (
              <div
                key={fi}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  gap: 4,
                  padding: "7px 8px",
                  alignItems: "center",
                  background: isMe
                    ? wA === (fx.a === myTeam)
                      ? "rgba(61,220,132,.06)"
                      : "rgba(255,76,76,.06)"
                    : "transparent",
                  borderTop: `1px solid ${C.line}`,
                }}
              >
                <span
                  style={{
                    fontWeight: wA ? 700 : 500,
                    fontSize: 12,
                    color: wA ? C.win : C.dim,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fx.a}
                </span>
                <span
                  style={{
                    fontFamily: mono,
                    fontWeight: 700,
                    textAlign: "center",
                    color: C.ink,
                    fontSize: 12,
                  }}
                >
                  {fx.res.seriesScore.join("–") || fx.scoreLine}
                </span>
                <span
                  style={{
                    fontWeight: wA ? 500 : 700,
                    fontSize: 12,
                    color: wA ? C.dim : C.win,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textAlign: "right",
                  }}
                >
                  {fx.res.loserName === fx.a && wA
                    ? fx.b
                    : fx.res.winnerName === fx.a
                      ? fx.b
                      : wA
                        ? fx.a
                        : fx.b}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function PlayerStats({ roster, myTeam, statsMap }) {
  const sorted = [...roster].sort(
    (a, b) => (statsMap[b]?.rating || 0) - (statsMap[a]?.rating || 0),
  );
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto auto",
          gap: 6,
          fontFamily: mono,
          fontSize: 9,
          color: C.faint,
          letterSpacing: 1,
          padding: "3px 8px",
        }}
      >
        <span>PLAYER</span>
        <span style={{ textAlign: "center" }}>.000</span>
        <span style={{ textAlign: "right" }}>MVP</span>
        <span style={{ textAlign: "right" }}>CLUTCHES</span>
      </div>
      {sorted.map((p) => (
        <div
          key={p}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto auto",
            gap: 6,
            padding: "3px 8px",
            alignItems: "center",
            borderTop: `1px solid ${C.line}`,
          }}
        >
          <span style={{ fontSize: 12, color: p === myTeam ? C.acc : C.ink }}>
            {p}
          </span>
          <span
            style={{ fontFamily: mono, fontWeight: 700, textAlign: "center" }}
          >
            {(statsMap[p]?.rating || 0).toFixed(3)}
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: 9,
              color: C.gold,
              textAlign: "right",
            }}
          >
            {statsMap[p]?.mvps || 0}
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: 9,
              color: C.live,
              textAlign: "right",
            }}
          >
            {statsMap[p]?.clutches || 0}
          </span>
        </div>
      ))}
    </div>
  );
}

export function EventDetail({ event, myTeam }) {
  if (!event) return null;
  const swiss = event.swiss;
  let bracket = event.bracket || event._bracketData;
  if (bracket && typeof bracket === "string") {
    try {
      bracket = JSON.parse(bracket);
    } catch (e) {
      bracket = undefined;
    }
  }
  const roster = event.roster;

  const statsMap = {};
  if (event.playerStats) {
    for (const ps of event.playerStats) {
      statsMap[ps.name] = {
        maps: ps.maps,
        rating: ps.rating,
        mvps: ps.mvps || 0,
        clutches: ps.clutches || 0,
      };
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Swiss Standings */}
      {swiss && <SwissStandings swiss={swiss} myTeam={myTeam} />}

      {/* Playoff Bracket results */}
      {(bracket || event.champion) && (
        <div>
          <PlayoffBracket bracket={bracket} />
        </div>
      )}

      {/* Player Stats */}
      {event.playerStats && (
        <div
          style={{
            background: C.panel2,
            border: `1px solid ${C.line}`,
            borderRadius: 8,
            padding: "10px 14px",
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 9,
              color: C.faint,
              letterSpacing: 1.5,
              marginBottom: 6,
            }}
          >
            ROSTER STATS
          </div>
          <PlayerStats
            roster={roster || []}
            myTeam={myTeam}
            statsMap={statsMap}
          />
        </div>
      )}

      {/* Legend */}
      {event.playerStats && (
        <div
          style={{
            display: "flex",
            gap: 14,
            fontFamily: mono,
            fontSize: 9,
            color: C.faint,
          }}
        >
          <span>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: C.gold,
                display: "inline-block",
                marginRight: 5,
              }}
            ></span>
            MVP COUNT
          </span>
          <span>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: C.live,
                display: "inline-block",
                marginRight: 5,
              }}
            ></span>
            PRESS CLUTCHES
          </span>
          <span>.000 = PRESS RATING</span>
        </div>
      )}

      {!event.swiss && !bracket && (
        <div style={{ fontFamily: mono, fontSize: 10, color: C.dim }}>
          * Tournament snapshot not captured in this event.
        </div>
      )}
    </div>
  );
}

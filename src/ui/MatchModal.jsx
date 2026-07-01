import React, { useState } from "react";
import { C, sans, mono } from "./theme.js";
import { Overlay } from "./primitives.jsx";
import { recapLine } from "../engine/match.js";

export function MatchModal({ m, onClose }) {
  const [expandedMap, setExpandedMap] = useState(null);
  const isSeries = m.bo >= 3;
  const topName = isSeries ? m.a || m.winnerName : m.winnerName;
  const botName = isSeries ? m.b || m.loserName : m.loserName;
  return (
    <Overlay onClose={onClose} title={m.title} wide>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: m.winnerName === topName ? C.win : C.ink,
          }}
        >
          {topName}
        </span>
        {isSeries ? (
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 18 }}>
            {m.seriesScore[0]} – {m.seriesScore[1]}
          </span>
        ) : (
          <span style={{ fontFamily: mono, color: C.dim, fontSize: 13 }}>
            vs
          </span>
        )}
        <span
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: m.winnerName === botName ? C.win : C.ink,
          }}
        >
          {botName}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {m.maps.map((mp, i) => {
          const w = Math.max(...mp.score),
            l = Math.min(...mp.score);
          const expanded = expandedMap === i;
          const tA = mp.teamA || mp.winnerName,
            tB = mp.teamB || mp.loserName;
          return (
            <div
              key={i}
              style={{
                background: C.panel2,
                border: `1px solid ${C.line}`,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setExpandedMap(expanded ? null : i)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  padding: "11px 13px",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    color: C.faint,
                    width: 34,
                  }}
                >
                  {isSeries
                    ? i === m.maps.length - 1 && i >= 2
                      ? "DEC"
                      : `M${i + 1}`
                    : "MAP"}
                </span>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>
                  {mp.map}
                </span>
                {mp.rival && (
                  <span
                    style={{ fontFamily: mono, fontSize: 9, color: C.rival }}
                  >
                    [!]
                  </span>
                )}
                <span
                  style={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 13,
                    color: C.win,
                  }}
                >
                  {w}-{l}
                </span>
                <span
                  style={{ fontFamily: mono, fontSize: 10, color: C.faint }}
                >
                  {expanded ? "▾" : "▸"}
                </span>
              </button>
              <div style={{ padding: "0 13px 8px" }}>
                <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.55 }}>
                  {recapLine(mp)}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 5,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{ fontFamily: mono, fontSize: 10, color: C.win }}
                  >
                    MVP {mp.carry}
                  </span>
                  <span
                    style={{ fontFamily: mono, fontSize: 10, color: C.red }}
                  >
                    ▼ {mp.anchor}
                  </span>
                  {mp.triggers?.map((tr, ti) => (
                    <span
                      key={ti}
                      style={{
                        fontFamily: mono,
                        fontSize: 9,
                        color:
                          tr.what === "rivalry_win"
                            ? C.rival
                            : tr.what === "eco_heroes"
                              ? C.live
                              : C.gold,
                        border: `1px solid ${tr.what === "rivalry_win" ? C.rival : C.gold}33`,
                        borderRadius: 4,
                        padding: "1px 5px",
                      }}
                    >
                      {tr.what === "clutch_carry"
                        ? "CLUTCH"
                        : tr.what === "supernova"
                          ? "SUPERNOVA"
                          : tr.what === "rivalry_win"
                            ? "RIVALRY WIN"
                            : tr.what === "eco_heroes"
                              ? "ECO HEROES"
                              : "TILTED"}{" "}
                      · {tr.who}
                    </span>
                  ))}
                </div>
              </div>
              {expanded && mp.rounds && (
                <div
                  style={{
                    borderTop: `1px solid ${C.line}`,
                    padding: "8px 10px",
                    maxHeight: 340,
                    overflowY: "auto",
                  }}
                >
                  {/* Scoreboard header */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "26px 60px 22px 8px 22px 60px 1fr",
                      gap: 4,
                      padding: "4px 0",
                      fontFamily: mono,
                      fontSize: 9,
                      color: C.faint,
                      alignItems: "center",
                    }}
                  >
                    <span>RND</span>
                    <span>{tA}</span>
                    <span style={{ textAlign: "center" }}></span>
                    <span></span>
                    <span style={{ textAlign: "center" }}></span>
                    <span>{tB}</span>
                    <span>PLAY</span>
                  </div>
                  {mp.rounds.map((rd, ri) => {
                    const halfBreak =
                      ri > 0 && mp.rounds[ri - 1]?.side !== rd.side;
                    const buyIcon = (b) =>
                      b === "awp_buy"
                        ? "++ AWP"
                        : b === "full"
                          ? "++"
                          : b === "force"
                            ? "~"
                            : b === "eco"
                              ? "--"
                              : "";
                    const isHighlight =
                      rd.isClutch || rd.isEcoUpset || rd.isAce;
                    return (
                      <React.Fragment key={ri}>
                        {halfBreak && (
                          <div
                            style={{
                              padding: "3px 0",
                              textAlign: "center",
                              fontFamily: mono,
                              fontSize: 9,
                              color: C.gold,
                              borderTop: `1px dashed ${C.gold}44`,
                            }}
                          >
                            — HALF TIME —
                          </div>
                        )}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "26px 60px 22px 8px 22px 60px 1fr",
                            gap: 4,
                            padding: "3px 0",
                            alignItems: "center",
                            fontFamily: mono,
                            fontSize: 10,
                            background: isHighlight
                              ? C.acc+"0f"
                              : "transparent",
                            borderRadius: 3,
                          }}
                        >
                          <span style={{ color: C.faint, fontSize: 9 }}>
                            {rd.round}
                          </span>
                          <span style={{ fontSize: 8, color: C.dim }}>
                            {buyIcon(rd.buyA)}
                          </span>
                          <span
                            style={{
                              textAlign: "center",
                              fontWeight: 700,
                              color: rd.winner === tA ? C.win : C.dim,
                            }}
                          >
                            {rd.scoreA}
                          </span>
                          <span
                            style={{
                              textAlign: "center",
                              color: C.faint,
                              fontSize: 8,
                            }}
                          >
                            :
                          </span>
                          <span
                            style={{
                              textAlign: "center",
                              fontWeight: 700,
                              color: rd.winner === tB ? C.win : C.dim,
                            }}
                          >
                            {rd.scoreB}
                          </span>
                          <span style={{ fontSize: 8, color: C.dim }}>
                            {buyIcon(rd.buyB)}
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              color: isHighlight ? C.acc : C.dim,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {rd.narrative}
                          </span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Overlay>
  );
}

// ── Match Reveal (live round-by-round) ───────────────────────────────

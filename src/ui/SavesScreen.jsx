import React from "react";
import { C, sans, mono, GRAD } from "./theme.js";
import { Wordmark, MiniStat } from "./primitives.jsx";
import { Gstyle } from "./Gstyle.jsx";

export function SavesScreen({
  saves,
  cloudEnabled,
  cloudStatus,
  onNewSeason,
  onLoad,
  onDelete,
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: GRAD,
        color: C.ink,
        fontFamily: sans,
      }}
    >
      <Gstyle />
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "60px 24px" }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: 34,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Wordmark size={30} />
          <div style={{ fontSize: 13, color: C.dim, letterSpacing: 0.3 }}>
            Counter-Strike Esports Management Simulator
          </div>
        </div>
        <button
          onClick={onNewSeason}
          style={{
            width: "100%",
            background: C.acc,
            color: C.onAcc,
            border: "none",
            borderRadius: 12,
            padding: "16px",
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: 0.3,
            marginBottom: 26,
            boxShadow: `0 10px 30px -12px ${C.acc}`,
          }}
        >
          Start New Season →
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 11,
              color: C.dim,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Saved Games
          </div>
          {cloudEnabled && (
            <span
              style={{
                fontFamily: mono,
                fontSize: 9.5,
                letterSpacing: 0.5,
                marginLeft: "auto",
                padding: "3px 8px",
                borderRadius: 999,
                color:
                  cloudStatus === "synced"
                    ? C.win
                    : cloudStatus === "error"
                      ? C.red
                      : C.dim,
                border: `1px solid ${
                  cloudStatus === "synced"
                    ? C.win + "55"
                    : cloudStatus === "error"
                      ? C.red + "55"
                      : C.line
                }`,
              }}
            >
              {cloudStatus === "synced"
                ? "☁ Cloud synced"
                : cloudStatus === "error"
                  ? "☁ Cloud sync failed"
                  : "☁ Connecting…"}
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {["Auto-Save", "Slot 1", "Slot 2", "Slot 3"].map((label, i) => {
            const save = saves[i];
            if (!save)
              return (
                <div
                  key={i}
                  style={{
                    background: C.panel,
                    border: `1px dashed ${C.line}`,
                    borderRadius: 9,
                    padding: "16px 18px",
                    color: C.faint,
                    fontFamily: mono,
                    fontSize: 12,
                  }}
                >
                  {label} — Empty
                </div>
              );
            const s = save.summary || {};
            return (
              <div
                key={i}
                style={{
                  background: C.panel,
                  border: `1px solid ${C.line}`,
                  borderRadius: 9,
                  padding: "14px 18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{ fontFamily: mono, fontSize: 10, color: C.faint }}
                  >
                    {label}
                  </span>
                  <span
                    style={{ fontWeight: 700, fontSize: 15, color: C.acc }}
                  >
                    {save.myTeam}
                  </span>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      color: C.dim,
                      marginLeft: "auto",
                    }}
                  >
                    #{s.rank || "?"} ranked
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    flexWrap: "wrap",
                    marginBottom: 10,
                  }}
                >
                  <MiniStat
                    label="DATE"
                    value={`${s.date || "?"} 2026`}
                    color={C.live}
                  />
                  <MiniStat
                    label="WEEK"
                    value={s.week || "?"}
                    color={C.dim}
                  />
                  <MiniStat
                    label="BUDGET"
                    value={`$${s.budget || 0}K`}
                    color={(s.budget || 0) > 0 ? C.gold : C.red}
                  />
                  <MiniStat
                    label="EVENTS"
                    value={s.events || 0}
                    color={C.dim}
                  />
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    color: C.faint,
                    marginBottom: 10,
                  }}
                >
                  {(s.roster || []).join(" · ")}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => onLoad(save)}
                    style={{
                      flex: 1,
                      background: C.win,
                      color: "#0a0c10",
                      border: "none",
                      borderRadius: 7,
                      padding: "9px",
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    CONTINUE
                  </button>
                  {i > 0 && (
                    <button
                      onClick={() => onDelete(i)}
                      style={{
                        background: "transparent",
                        border: `1px solid ${C.red}`,
                        color: C.red,
                        borderRadius: 7,
                        padding: "9px 14px",
                        fontFamily: mono,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      DELETE
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

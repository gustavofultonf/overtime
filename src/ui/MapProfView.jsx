import React from 'react';
import { C, sans, mono } from './theme.js';
import { AI_TEAMS } from '../constants/data.js';
import { currentMapPool, getMapProf, teamActivePool, mapRating, rosterOf, teamBase } from '../engine/state.js';
import { Intro, SL, MiniStat } from './primitives.jsx';
import { playerOvr } from '../engine/player.js';

function profColor(v) {
  return v >= 75 ? C.win : v >= 60 ? C.gold : v >= 45 ? C.dim : C.red;
}

function MapCard({
  map,
  prof,
  isActive,
  hasPool,
  canAdd,
  onToggle,
  teamRecord,
  bestPlayer,
  effRating,
  leagueAvg,
}) {
  const v = prof || 50;
  const c = profColor(v);
  const w = teamRecord?.wins || 0,
    l = (teamRecord?.maps || 0) - (teamRecord?.wins || 0);
  const wr = teamRecord?.maps ? Math.round((w / teamRecord.maps) * 100) : null;
  const diff = leagueAvg ? v - leagueAvg : 0;

  return (
    <div
      onClick={onToggle}
      style={{
        background: isActive ? C.live+"14" : C.panel,
        border: `2px solid ${isActive ? C.acc : C.line}`,
        borderRadius: 10,
        padding: "14px",
        cursor: isActive || canAdd ? "pointer" : "not-allowed",
        opacity: !isActive && !canAdd ? 0.5 : 1,
        transition: "border-color .15s",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 15 }}>{map}</span>
        <span
          style={{
            fontFamily: mono,
            fontSize: 9,
            color: isActive ? C.acc : C.faint,
            background: isActive ? C.acc + "1a" : "transparent",
            borderRadius: 4,
            padding: "2px 6px",
          }}
        >
          {isActive ? "ACTIVE" : "inactive"}
        </span>
      </div>

      {/* Big proficiency number + bar */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          marginBottom: 4,
        }}
      >
        <span
          style={{ fontFamily: mono, fontSize: 28, fontWeight: 800, color: c }}
        >
          {v}
        </span>
        <span style={{ fontFamily: mono, fontSize: 10, color: C.faint }}>
          / 95
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: C.line,
          borderRadius: 3,
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: `${Math.min(100, (v / 95) * 100)}%`,
            height: "100%",
            background: c,
            borderRadius: 3,
          }}
        />
      </div>

      {/* Effective rating */}
      {effRating != null && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 10,
            marginBottom: 4,
          }}
        >
          <span style={{ color: C.faint }}>EFF RATING</span>
          <span style={{ color: C.ink, fontWeight: 700 }}>
            {effRating.toFixed(1)}
          </span>
        </div>
      )}

      {/* vs League avg */}
      {leagueAvg != null && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 10,
            marginBottom: 4,
          }}
        >
          <span style={{ color: C.faint }}>vs LEAGUE AVG</span>
          <span
            style={{
              color:
                diff >= 5
                  ? C.win
                  : diff >= 0
                    ? C.gold
                    : diff >= -5
                      ? C.dim
                      : C.red,
              fontWeight: 700,
            }}
          >
            {diff >= 0 ? "+" : ""}
            {Math.round(diff)}
          </span>
        </div>
      )}

      {/* W-L record */}
      {teamRecord?.maps > 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 10,
            marginBottom: 4,
          }}
        >
          <span style={{ color: C.faint }}>RECORD</span>
          <span>
            <span style={{ color: C.win }}>{w}W</span>
            <span style={{ color: C.faint }}> – </span>
            <span style={{ color: C.red }}>{l}L</span>
            <span style={{ color: C.faint, marginLeft: 4 }}>({wr}%)</span>
          </span>
        </div>
      ) : (
        <div
          style={{
            fontFamily: mono,
            fontSize: 10,
            color: C.faint,
            marginBottom: 4,
          }}
        >
          No matches played
        </div>
      )}

      {/* Best player */}
      {bestPlayer && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 10,
            marginBottom: 4,
          }}
        >
          <span style={{ color: C.faint }}>BEST</span>
          <span style={{ color: C.ink }}>
            {bestPlayer.name}{" "}
            <span style={{ color: C.gold }}>
              {bestPlayer.rating.toFixed(2)}
            </span>
          </span>
        </div>
      )}

      {/* Avg team rating on map */}
      {teamRecord?.avgRating > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 10,
            marginBottom: 2,
          }}
        >
          <span style={{ color: C.faint }}>TEAM AVG</span>
          <span
            style={{
              color:
                teamRecord.avgRating >= 1.05
                  ? C.win
                  : teamRecord.avgRating >= 0.95
                    ? C.ink
                    : C.red,
              fontWeight: 700,
            }}
          >
            {teamRecord.avgRating.toFixed(2)}
          </span>
        </div>
      )}

      {/* Decay warning */}
      {!isActive && hasPool && v > 30 && (
        <div
          style={{
            fontFamily: mono,
            fontSize: 9,
            color: C.red,
            marginTop: 6,
            textAlign: "center",
          }}
        >
          -2 prof/week
        </div>
      )}
    </div>
  );
}

export function MapProfView({ state, myTeam, onSetActivePool }) {
  const pool = currentMapPool(state);
  const prof = getMapProf(state, myTeam);
  const active = teamActivePool(state, myTeam) || [];
  const hasPool = active.length > 0;
  const roster = rosterOf(state, myTeam);
  const base = teamBase(state, myTeam);

  function toggle(map) {
    let next;
    if (active.includes(map)) {
      next = active.filter((m) => m !== map);
    } else {
      if (active.length >= 5) return;
      next = [...active, map];
    }
    if (onSetActivePool) onSetActivePool(next);
  }

  // Team record per map comes from teamMapStats (tracked per-team in
  // match.js), not summed from player careers — a player's career mapStats
  // follow them across every team they've ever played for, so aggregating
  // those over the current roster blended in maps a signed/traded player
  // played before joining this org, wildly inflating the W-L shown here.
  // Rating/best-player are still drawn from the roster's career data since
  // those are about individual current-squad quality, not the org's record.
  const teamMapData = {};
  pool.forEach((map) => {
    let ratingSum = 0,
      ratingCount = 0;
    let bestPlayer = null;
    roster.forEach((p) => {
      const ms = state.career?.[p.name]?.mapStats?.[map];
      if (!ms || !ms.maps) return;
      ratingSum += ms.avgRating * ms.maps;
      ratingCount += ms.maps;
      if (!bestPlayer || ms.avgRating > bestPlayer.rating) {
        bestPlayer = { name: p.name, rating: ms.avgRating, maps: ms.maps };
      }
    });
    const teamRec = state.teamMapStats?.[myTeam]?.[map];
    teamMapData[map] = {
      maps: teamRec?.maps || 0,
      wins: teamRec?.wins || 0,
      avgRating: ratingCount > 0 ? ratingSum / ratingCount : 0,
      bestPlayer: bestPlayer && bestPlayer.maps >= 2 ? bestPlayer : null,
    };
  });

  // League average proficiency per map
  const leagueAvgs = {};
  pool.forEach((map) => {
    let sum = 0,
      count = 0;
    AI_TEAMS.forEach((t) => {
      const p = state.mapProf?.[t]?.[t] || getMapProf(state, t)[map] || 50;
      sum += getMapProf(state, t)[map] || 50;
      count++;
    });
    leagueAvgs[map] = count > 0 ? sum / count : 50;
  });

  // Summary stats
  const avgProf = pool.length
    ? Math.round(pool.reduce((s, m) => s + (prof[m] || 50), 0) / pool.length)
    : 50;
  const strongMaps = pool.filter((m) => (prof[m] || 50) >= 70).length;
  const weakMaps = pool.filter((m) => (prof[m] || 50) < 45).length;
  const totalPlayed = Object.values(teamMapData).reduce(
    (s, d) => s + d.maps,
    0,
  );
  const totalWon = Object.values(teamMapData).reduce((s, d) => s + d.wins, 0);
  const overallWR =
    totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;
  // Best and worst maps by proficiency
  const sorted = [...pool].sort((a, b) => (prof[b] || 50) - (prof[a] || 50));
  const bestMap = sorted[0];
  const worstMap = sorted[sorted.length - 1];

  return (
    <div>
      <Intro text="Your competitive map pool. Click maps to add/remove from your active pool (3–5). Inactive maps decay weekly." />

      {/* Summary strip */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}
      >
        <MiniStat label="AVG PROF" value={avgProf} color={profColor(avgProf)} />
        <MiniStat label="STRONG" value={`${strongMaps} maps`} color={C.win} />
        <MiniStat
          label="WEAK"
          value={`${weakMaps} maps`}
          color={weakMaps > 0 ? C.red : C.win}
        />
        <MiniStat
          label="MAP W-L"
          value={
            totalPlayed > 0
              ? `${totalWon}-${totalPlayed - totalWon} (${overallWR}%)`
              : "—"
          }
          color={overallWR >= 55 ? C.win : overallWR >= 45 ? C.gold : C.red}
        />
        <MiniStat label="BEST MAP" value={bestMap || "—"} color={C.win} />
        <MiniStat label="WORST MAP" value={worstMap || "—"} color={C.red} />
      </div>

      {/* Active pool status */}
      {!hasPool ? (
        <div
          style={{
            background: C.gold+"12",
            border: `1px solid ${C.gold}44`,
            borderRadius: 9,
            padding: "10px 14px",
            marginBottom: 16,
            fontFamily: mono,
            fontSize: 11,
            color: C.gold,
          }}
        >
          No active pool set — all maps decay equally. Click maps below to focus
          your practice.
        </div>
      ) : (
        <div
          style={{
            fontFamily: mono,
            fontSize: 10,
            color: C.faint,
            marginBottom: 12,
          }}
        >
          ACTIVE POOL: {active.join(", ")} ({active.length}/5) · inactive maps
          lose -2 proficiency per week
        </div>
      )}

      {/* Map cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {pool.map((m) => (
          <MapCard
            key={m}
            map={m}
            prof={prof[m]}
            isActive={active.includes(m)}
            hasPool={hasPool}
            canAdd={active.length < 5}
            onToggle={() => toggle(m)}
            teamRecord={teamMapData[m]}
            bestPlayer={teamMapData[m]?.bestPlayer}
            effRating={base * (0.7 + 0.006 * (prof[m] || 50))}
            leagueAvg={leagueAvgs[m]}
          />
        ))}
      </div>

      {/* Veto intelligence: show what maps opponents might pick/ban */}
      {hasPool && (
        <>
          <SL n="VTO" t="VETO INTELLIGENCE" />
          <div
            style={{
              background: C.panel,
              border: `1px solid ${C.line}`,
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: C.faint,
                marginBottom: 10,
              }}
            >
              Based on your proficiency gaps, opponents will likely target:
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {sorted
                .slice(-2)
                .reverse()
                .map((m) => (
                  <div
                    key={m}
                    style={{
                      fontFamily: mono,
                      fontSize: 12,
                      color: C.red,
                      background: C.red + "11",
                      border: `1px solid ${C.red}33`,
                      borderRadius: 6,
                      padding: "6px 12px",
                    }}
                  >
                    BAN {m}{" "}
                    <span style={{ fontSize: 10, color: C.faint }}>
                      (your weakest — {prof[m] || 50})
                    </span>
                  </div>
                ))}
              {sorted.slice(0, 2).map((m) => (
                <div
                  key={m}
                  style={{
                    fontFamily: mono,
                    fontSize: 12,
                    color: C.win,
                    background: C.win + "11",
                    border: `1px solid ${C.win}33`,
                    borderRadius: 6,
                    padding: "6px 12px",
                  }}
                >
                  PICK {m}{" "}
                  <span style={{ fontSize: 10, color: C.faint }}>
                    (your strongest — {prof[m] || 50})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

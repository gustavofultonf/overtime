import React, { useState, useCallback } from "react";

// Cloud save mirror (no-op if no Firebase config — see src/cloud/firebase.js)
import { cloudEnabled, pullCloudSaves, pushCloudSaves } from "./cloud/firebase.js";

// Constants
import { MAPS, AI_TEAMS } from "./constants/data.js";
import {
  EVENTS,
  SEASON_WEEKS,
  SALARY_WEEKS,
  ACTIVITIES,
  COACHES,
  FACILITIES,
  CHOICE_EVENTS,
  isSalaryWeek,
  weekToLabel,
  weekToMonth,
  CONTRACT_TERMS,
  DEBT_GAMEOVER_THRESHOLD,
  DEBT_SUSTAINED_WEEKS,
  DEBT_WARNING_WEEKS,
  DEBT_FINAL_WARNING_WEEKS,
} from "./constants/events.js";

// Engine
import {
  playerOvr,
  draftCost,
  marketValue,
  getSeed,
  getRankedTeams,
  addEventToLog,
  computeValveRankings,
  aiRosterMoves,
  transferPremium,
  buyoutPrice,
  desiredSalary,
  computeSeasonAwards,
} from "./engine/player.js";
import {
  initState,
  rosterOf,
  freeAgents,
  teamBase,
  profileFor,
  getMapProf,
  isRivalMatch,
  updateMorale,
  hierarchyTier,
  tickInjuries,
  currentMapPool,
  rotateMapPool,
  setActivePool,
  teamActivePool,
} from "./engine/state.js";
import { playSeries, applyActivity, rollRandomEvent } from "./engine/match.js";
import {
  generateProspect,
  developProspect,
  autoSimWeeks,
  aiWeekActivity,
  snapshotEventStats,
} from "./engine/activity.js";
import {
  swissRound,
  swissRoundMini,
  swissDone,
  nextSwissFix,
  resolveSwissFix,
  seedPlayoff,
  resolvePlayoffAI,
  nextPlayoffFix,
  newTournament,
  newMiniTournament,
  placementOf,
  prizeMoney,
  miniPlacement,
  miniPrizeMoney,
  buildATierField,
  buildBTierField,
  decayFormBetweenEvents,
  tickContracts,
  bracketElim,
} from "./engine/tournament.js";
import {
  computeFinances,
  brandValue,
  sponsorBrandFactor,
} from "./engine/finance.js";

// UI
import { C, sans, mono, GRAD } from "./ui/theme.js";
import { Wordmark } from "./ui/primitives.jsx";
import { Gstyle } from "./ui/Gstyle.jsx";
import { Header, Tabs } from "./ui/Header.jsx";
import { MiniStat, SL } from "./ui/primitives.jsx";
import { DraftScreen } from "./ui/DraftScreen.jsx";
import { CalendarView } from "./ui/CalendarView.jsx";
import { EventHLTV } from "./ui/EventHLTV.jsx";
import { RosterView2, StatsView } from "./ui/RosterView.jsx";
import { TransferMarket } from "./ui/TransferMarket.jsx";
import { SeasonHistory } from "./ui/SeasonHistory.jsx";
import { MapProfView } from "./ui/MapProfView.jsx";
import { FacilitiesView } from "./ui/FacilitiesView.jsx";
import { FinanceView } from "./ui/FinanceView.jsx";
import { RankingsView } from "./ui/RankingsView.jsx";
import { RivalryView } from "./ui/RivalryView.jsx";
import { VetoOverlay } from "./ui/VetoOverlay.jsx";
import { MatchModal } from "./ui/MatchModal.jsx";
import { MatchReveal } from "./ui/MatchReveal.jsx";
import { EventDebrief } from "./ui/EventDebrief.jsx";
import { DynamicsView } from "./ui/DynamicsView.jsx";
import { TacticsView } from "./ui/TacticsView.jsx";
import { BoardReview } from "./ui/BoardReview.jsx";
import { BankruptcyScreen } from "./ui/BankruptcyScreen.jsx";

export default function App() {
  const [phase, setPhase] = useState("loading"); // loading | saves | draft | season
  const [myTeam, setMyTeam] = useState(null);
  const [season, setSeason] = useState(null);
  const [t, setT] = useState(null);
  const [tab, setTab] = useState("hub");
  const [openMatch, setOpenMatch] = useState(null);
  const [veto, setVeto] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [saves, setSaves] = useState([null, null, null, null]); // [auto, slot1, slot2, slot3]
  const [cloudStatus, setCloudStatus] = useState(
    cloudEnabled ? "connecting" : "off",
  ); // off | connecting | synced | error
  const [, force] = useState(0);
  const redraw = useCallback(() => force((n) => n + 1), []);

  // ── Save/Load System ──────────────────────────────────────────────
  const SAVE_KEY = "overtime-saves";

  // Slot-by-slot: newer `savedAt` wins. An empty local slot is filled from cloud (e.g.
  // first load on a new device); an empty cloud slot doesn't erase a local save.
  function mergeSaves(local, cloud) {
    if (!cloud) return local;
    return local.map((l, i) => {
      const c = cloud[i];
      if (!c) return l;
      if (!l) return c;
      return c.savedAt > l.savedAt ? c : l;
    });
  }

  async function loadSaves() {
    let local = [null, null, null, null];
    try {
      const result = await window.storage.get(SAVE_KEY);
      if (result && result.value) local = JSON.parse(result.value);
    } catch (e) {
      console.log("No local saves found");
    }
    if (!cloudEnabled) {
      setSaves(local);
      return local;
    }
    const cloud = await pullCloudSaves();
    const merged = mergeSaves(local, cloud);
    setSaves(merged);
    try {
      await window.storage.set(SAVE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.error("Local save write failed:", e);
    }
    // Push back so a slot that only existed locally (or only in the cloud) ends up
    // mirrored on both sides after the merge.
    pushCloudSaves(merged).then((ok) => setCloudStatus(ok ? "synced" : "error"));
    return merged;
  }

  async function writeSaves(newSaves) {
    try {
      await window.storage.set(SAVE_KEY, JSON.stringify(newSaves));
      setSaves(newSaves);
    } catch (e) {
      console.error("Save failed:", e);
    }
    if (cloudEnabled) {
      setCloudStatus("connecting");
      pushCloudSaves(newSaves).then((ok) => setCloudStatus(ok ? "synced" : "error"));
    }
  }

  // Strip non-serializable refs (rng functions, duplicate simState pointer) so an
  // in-progress tournament can round-trip through JSON without losing match progress.
  function tournamentForSave(tt) {
    if (!tt) return null;
    const { simState: _s, rng: _r, swiss, ...rest } = tt;
    let swissOut = null;
    if (swiss) {
      const { simState: _s2, rng: _r2, ...swissRest } = swiss;
      swissOut = swissRest;
    }
    return { ...rest, swiss: swissOut };
  }
  function tournamentFromSave(saved, simState) {
    if (!saved) return null;
    const tt = { ...saved, simState, rng: Math.random };
    if (tt.swiss) tt.swiss = { ...tt.swiss, simState, rng: Math.random };
    return tt;
  }

  // Older snapshotTournament() output double-wrapped each team's match log in an
  // extra array ([[f1,f2,...]] instead of [f1,f2,...]) — harmless for
  // JSON.stringify/localStorage, but Firestore's setDoc() rejects nested arrays
  // outright, and EventDetail.jsx's matches.map() was silently rendering garbage
  // for it too. Self-heals any save already carrying the bad shape.
  function sanitizeHistory(history) {
    return (history || []).map((h) => {
      const records = h.tournament?.swiss?.records;
      if (!records) return h;
      const fixed = {};
      let changed = false;
      for (const [team, r] of Object.entries(records)) {
        const flatMatches = Array.isArray(r.matches) ? r.matches.flat() : r.matches;
        if (flatMatches !== r.matches) changed = true;
        fixed[team] = { ...r, matches: flatMatches };
      }
      if (!changed) return h;
      return { ...h, tournament: { ...h.tournament, swiss: { ...h.tournament.swiss, records: fixed } } };
    });
  }

  // overrideT lets callers pass a tournament object that was just created via setT()
  // this render — the `t` state variable itself won't reflect it until next render.
  function buildSaveData(overrideT) {
    if (!season || !myTeam) return null;
    return {
      myTeam,
      season: { ...season, simState: undefined, history: sanitizeHistory(season.history) }, // simState saved separately
      simState: season.simState,
      tournament: tournamentForSave(overrideT !== undefined ? overrideT : t), // in-progress event, if any
      savedAt: new Date().toISOString(),
      summary: {
        week: season.week,
        date: weekToLabel(season.week, season.year),
        year: season.year || 2026,
        budget: season.budget,
        roster: rosterOf(season.simState, myTeam).map((p) => p.name),
        rank: (() => {
          const r = getRankedTeams(season.simState, myTeam);
          return r.findIndex((x) => x.team === myTeam) + 1;
        })(),
        events: season.history.length,
      },
    };
  }

  async function autoSave(overrideT) {
    const data = buildSaveData(overrideT);
    if (!data) return;
    const cur = [...saves];
    cur[0] = data;
    await writeSaves(cur);
  }

  async function saveToSlot(slot) {
    const data = buildSaveData();
    if (!data) return;
    const cur = [...saves];
    cur[slot] = data;
    await writeSaves(cur);
  }

  function loadFromSave(save) {
    if (!save) return;
    const s = {
      ...save.season,
      simState: save.simState,
      history: sanitizeHistory(save.season.history),
    };
    const restoredT = save.tournament
      ? tournamentFromSave(save.tournament, s.simState)
      : null;
    // Older saves (pre-tournament-persistence) or a save with no in-progress event
    // fall back to the calendar instead of rendering a phantom event screen.
    if (!restoredT && s.phase === "event") s.phase = "calendar";
    setMyTeam(save.myTeam);
    setSeason(s);
    setT(restoredT);
    setPhase("season");
    setTab(restoredT ? "hub" : "calendar");
  }

  async function deleteSave(slot) {
    const cur = [...saves];
    cur[slot] = null;
    await writeSaves(cur);
  }

  // Load saves on mount
  React.useEffect(() => {
    loadSaves().then((s) => {
      const hasSave = s.some((x) => x !== null);
      setPhase(hasSave ? "saves" : "draft");
    });
  }, []);

  function genBoardObjectives(rank) {
    const base = [
      {
        id: "stay_solvent",
        label: "Maintain positive budget",
        met: false,
        reward: 50,
      },
    ];
    if (rank <= 3)
      return [
        ...base,
        {
          id: "win_major",
          label: "Win a Major championship",
          met: false,
          reward: 400,
        },
        {
          id: "stay_top5",
          label: "Finish ranked top 5",
          met: false,
          reward: 200,
        },
      ];
    if (rank <= 8)
      return [
        ...base,
        {
          id: "major_playoffs",
          label: "Reach a Major playoff stage",
          met: false,
          reward: 250,
        },
        {
          id: "stay_top10",
          label: "Finish ranked top 10",
          met: false,
          reward: 150,
        },
      ];
    if (rank <= 16)
      return [
        ...base,
        {
          id: "major_qualify",
          label: "Qualify for a Major",
          met: false,
          reward: 200,
        },
        {
          id: "stay_top16",
          label: "Maintain top 16 ranking",
          met: false,
          reward: 100,
        },
      ];
    return [
      ...base,
      { id: "win_event", label: "Win any tournament", met: false, reward: 150 },
      {
        id: "break_top16",
        label: "Break into top 16",
        met: false,
        reward: 100,
      },
    ];
  }

  function setTactic(style) {
    if (!season.simState.tactics) season.simState.tactics = {};
    season.simState.tactics[myTeam] = style;
    season.weekLog.push({
      week: season.week,
      activity: "news",
      event: `[>] Tactical style set to: ${style}`,
    });
    setSeason({ ...season });
    redraw();
  }

  function onDraftComplete(teamName, simState, remaining) {
    setMyTeam(teamName);
    simState.chemistry[teamName] = 55;
    if (!simState.mapProf[teamName])
      simState.mapProf[teamName] = profileFor(teamName);
    simState.rankings[teamName] = 200;
    if (!simState.tactics) simState.tactics = {};
    simState.tactics[teamName] = "Utility";
    const boardObjectives = genBoardObjectives(30); // new team starts unranked
    const s = {
      simState,
      budget: remaining,
      boardObjectives,
      boardSummary: null,
      eventNum: 1,
      week: 1,
      year: 2026,
      history: [],
      weekLog: [],
      phase: "calendar",
      facilities: {},
      yearHistory: [],
      pendingEvent: null,
      pendingDebrief: null,
      pendingContracts: [],
      pendingEntry: null,
      sponsorships: [],
      scoutedTeams: {},
      debtWeeks: 0,
      debtWarnStage: 0,
      debtInterestRate: 0,
    };
    setSeason(s);
    setPhase("season");
    setTab("calendar");
    // Auto-save after draft
    setTimeout(() => {
      const data = buildSaveData();
      if (data) {
        const cur = [...saves];
        cur[0] = { ...data, season: s, simState };
        writeSaves(cur);
      }
    }, 100);
  }

  function nextUserFx() {
    if (!t) return null;
    // Swiss stage
    if (t.stage === "swiss" && t.swiss) {
      const fx = nextSwissFix(t.swiss);
      if (fx) return { kind: "swiss", fx, bo: fx.bo };
      // Check if swiss is done — need to seed bracket
      const adv = t.swiss._advanceAt || 3,
        eli = t.swiss._elimAt || 3;
      const allDone = t.swiss.teams.every(
        (tm) => t.swiss.records[tm].w >= adv || t.swiss.records[tm].l >= eli,
      );
      if (allDone && !t.bracket) return null; // trigger seedBracket
    }
    // Playoff stage
    if (t.bracket) {
      const nf = nextPlayoffFix(t.bracket, myTeam);
      if (nf)
        return {
          kind: nf.round,
          fx: nf.fx,
          bo:
            nf.round === "final"
              ? t.bracket.bo5Final
                ? 5
                : t.bracket.bo3 || 3
              : t.bracket.bo3 || 3,
        };
    }
    return null;
  }

  function beginVeto(fx, bo) {
    const opp = fx.a === myTeam ? fx.b : fx.a;
    setVeto({
      fixture: fx,
      bo: bo || fx.bo || 1,
      remaining: [...currentMapPool(season.simState)],
      picked: [],
      log: [],
      opp,
    });
  }

  function afterResult() {
    if (!t) return;
    if (t.stage === "swiss" && t.swiss) {
      // Check if user was just eliminated
      const userEliminated = t.swiss.eliminated.includes(myTeam);
      if (userEliminated) {
        // User is out — sim remaining Swiss rounds and playoffs without them
        const adv = t.swiss._advanceAt || 3,
          eli = t.swiss._elimAt || 3;
        let si = 0;
        while (
          !t.swiss.teams.every(
            (tm) =>
              t.swiss.records[tm].w >= adv || t.swiss.records[tm].l >= eli,
          ) &&
          si < 30
        ) {
          si++;
          if (t.isMajor) swissRound(t.swiss);
          else swissRoundMini(t.swiss);
        }
        // Seed and auto-sim playoffs
        const advancers = t.swiss.advanced.slice(0, t.advanceCount || 8);
        t.bracket = seedPlayoff(advancers, 3, t.isMajor);
        resolvePlayoffAI(t.bracket, null, t.simState, t.rng); // null myTeam = resolve all
        // Find all unresolved
        const allFx = [
          ...(t.bracket.qf || []),
          ...(t.bracket.sf || []),
          t.bracket.final,
        ].filter(Boolean);
        let pi = 0;
        while (!t.bracket.final.done && pi < 20) {
          pi++;
          allFx.forEach((fx) => {
            if (!fx.done && fx.a && fx.b) {
              const bo = fx === t.bracket.final ? (t.isMajor ? 5 : 3) : 3;
              fx.res = playSeries(
                t.simState,
                fx.a,
                fx.b,
                bo,
                { stage: "playoffs" },
                t.rng,
              );
              fx.done = true;
            }
          });
          resolvePlayoffAI(t.bracket, null, t.simState, t.rng);
        }
        if (t.bracket.final.done) t.champion = t.bracket.final.res.winnerName;
        t.stage = "done";
        setT({ ...t });
        redraw();
        autoSave();
        return;
      }

      const swissComplete = () =>
        t.swiss.teams.every(
          (tm) =>
            t.swiss.records[tm].w >= (t.swiss._advanceAt || 3) ||
            t.swiss.records[tm].l >= (t.swiss._elimAt || 3),
        );
      if (swissComplete()) {
        t.stage = "playoffs";
        const advancers = t.swiss.advanced.slice(0, t.advanceCount || 8);
        t.bracket = seedPlayoff(advancers, 3, t.isMajor);
        resolvePlayoffAI(t.bracket, myTeam, t.simState, t.rng);
      } else {
        // Advance the group stage. If the user has already advanced/been knocked out and
        // has no remaining match, keep simming rounds until the stage resolves — otherwise
        // the swiss never completes (afterResult only fires when the user plays) and the
        // bracket never seeds, soft-locking the event.
        let guard = 0;
        do {
          if (t.isMajor) swissRound(t.swiss);
          else swissRoundMini(t.swiss);
          guard++;
        } while (guard < 30 && !swissComplete() && !nextSwissFix(t.swiss));
        if (swissComplete()) {
          t.stage = "playoffs";
          const advancers = t.swiss.advanced.slice(0, t.advanceCount || 8);
          t.bracket = seedPlayoff(advancers, 3, t.isMajor);
          resolvePlayoffAI(t.bracket, myTeam, t.simState, t.rng);
        }
      }
    } else if (t.stage === "playoffs" && t.bracket) {
      // Check if user was just eliminated from playoffs
      const userElimInPlayoffs = bracketElim(t.bracket, myTeam);
      if (userElimInPlayoffs) {
        // Sim remaining playoff matches
        let pi = 0;
        while (!t.bracket.final.done && pi < 20) {
          pi++;
          const allFx = [
            ...(t.bracket.qf || []),
            ...(t.bracket.sf || []),
            t.bracket.final,
          ].filter(Boolean);
          allFx.forEach((fx) => {
            if (!fx.done && fx.a && fx.b) {
              const bo = fx === t.bracket.final ? (t.isMajor ? 5 : 3) : 3;
              fx.res = playSeries(
                t.simState,
                fx.a,
                fx.b,
                bo,
                { stage: "playoffs" },
                t.rng,
              );
              fx.done = true;
            }
          });
          resolvePlayoffAI(t.bracket, null, t.simState, t.rng);
        }
        if (t.bracket.final.done) t.champion = t.bracket.final.res.winnerName;
        t.stage = "done";
        setT({ ...t });
        redraw();
        autoSave();
        return;
      }
      resolvePlayoffAI(t.bracket, myTeam, t.simState, t.rng);
      if (t.bracket.final.done) {
        t.champion = t.bracket.final.res.winnerName;
        t.stage = "done";
      }
    }
    setT({ ...t });
    redraw();
    autoSave();
  }

  // Snapshot complete tournament state into a serializable shape for the season page.
  function snapshotTournament(state) {
    if (!state) return null;
    const swiss = state.swiss;
    let bracket = state.bracket || null;
    if (bracket) {
      bracket = {
        qf: state.qf?.map((f) => ({ ...f })),
        sf: state.sf?.map((f) => ({ ...f })),
        final: { ...state.final },
        bo3: state.bo3,
        bo5Final: !!state.bo5Final,
      };
    }
    return {
      swiss: (() => {
        if (!swiss || !Array.isArray(swiss.rounds)) return null;
        const records = {};
        for (const tm of swiss.teams) {
          records[tm] = {
            w: 0,
            l: 0,
            buchholz: swiss.records[tm]?.buchholz || 0,
            matches: (swiss.records[tm].matches || []).map((f) => ({ ...f })),
          };
        }
        return {
          teams: Array.from(swiss.teams),
          records,
          rounds: swiss.rounds.map((rd) => ({
            fixtures: (rd.fixtures || []).map((f) => ({ ...f })),
          })),
          _advanceAt: swiss._advanceAt,
          _elimAt: swiss._elimAt,
          advanced: swiss.advanced?.slice(),
          eliminated: swiss.eliminated?.slice(),
        };
      })(),
      bracket,
      champion: state.champion,
    };
  }

  function endEvent() {
    // Force-complete tournament if not done (user was eliminated)
    if (t.stage !== "done") {
      // Sim remaining Swiss
      if (t.swiss && !swissDone(t.swiss)) {
        let si = 0;
        while (!swissDone(t.swiss) && si < 30) {
          si++;
          if (t.isMajor) swissRound(t.swiss);
          else swissRoundMini(t.swiss);
        }
      }
      // Seed and sim playoffs if needed
      if (!t.bracket && t.swiss?.advanced?.length > 0) {
        t.bracket = seedPlayoff(
          t.swiss.advanced.slice(0, t.advanceCount || 8),
          3,
          t.isMajor,
        );
      }
      if (t.bracket && !t.bracket.final.done) {
        let pi = 0;
        while (!t.bracket.final.done && pi < 20) {
          pi++;
          const allFx = [
            ...(t.bracket.qf || []),
            ...(t.bracket.sf || []),
            t.bracket.final,
          ].filter(Boolean);
          allFx.forEach((fx) => {
            if (!fx.done && fx.a && fx.b) {
              const bo = fx === t.bracket.final ? (t.isMajor ? 5 : 3) : 3;
              fx.res = playSeries(
                t.simState,
                fx.a,
                fx.b,
                bo,
                { stage: "playoffs" },
                t.rng,
              );
              fx.done = true;
            }
          });
          resolvePlayoffAI(t.bracket, null, t.simState, t.rng);
        }
      }
      if (t.bracket?.final?.done) t.champion = t.bracket.final.res.winnerName;
      t.stage = "done";
    }
    const ev = season.currentEvent || { tier: "Major" };
    const isMajor = t.isMajor;
    // A-tier uses the 16-team/top-8 bracket, so it reads placements like a Major.
    const place = isMajor || t.bigField ? placementOf(t) : miniPlacement(t);
    const prize = isMajor ? prizeMoney(place) : miniPrizeMoney(t, place);

    // Capture per-player event stats before snapshot + reset
    const roster = rosterOf(season.simState, myTeam);
    const chemBefore = season.simState.chemistry[myTeam] || 70;
    const playerStats = roster.map((p) => {
      const s = season.simState.stats[p.name] || {};
      return {
        name: p.name,
        role: p.role,
        age: p.age,
        maps: s.maps || 0,
        rating: +(s.rating || 0).toFixed(3),
        mvps: s.mvps || 0,
        clutches: s.clutches || 0,
      };
    });
    snapshotEventStats(season.simState, season.eventNum);
    season.simState.players.forEach((p) => {
      if (season.simState.stats[p.name])
        season.simState.stats[p.name] = {
          maps: 0,
          rating: 0,
          mvps: 0,
          clutches: 0,
        };
    });

    // Win bonus
    const winBonus = place === 1;
    if (winBonus) {
      roster.forEach((p) => {
        p.form = Math.min(12, p.form + 5);
      });
      season.simState.chemistry[myTeam] = Math.min(100, chemBefore + 10);
    }

    // Update per-player morale based on result
    updateMorale(season.simState, myTeam, place);

    season.budget += prize;

    // Resolve a pending "place top N at the next event" sponsor bonus, if one fired
    // during a random event — it was previously set but never actually checked.
    if (season.simState.pendingBonus) {
      const pb = season.simState.pendingBonus;
      const met = pb.condition === "top4" ? place <= 4 : false;
      if (met) {
        season.budget += pb.amount;
        season.weekLog.push({
          week: season.week,
          activity: "news",
          event: `[$$] Sponsor bonus paid out: +${pb.amount}K for a top-4 finish!`,
        });
      } else {
        season.weekLog.push({
          week: season.week,
          activity: "news",
          event: `[X] Sponsor bonus missed — needed a top-4 finish.`,
        });
      }
      season.simState.pendingBonus = null;
    }

    // Mark one-time sponsor achievements met by this result: "win an event" needs a
    // 1st-place finish; "make a Major" just needs to have qualified and played in one
    // (reaching endEvent for a Major event already means you were in it).
    (season.sponsorships || []).forEach((sp) => {
      if (!sp.active || sp.achieved) return;
      if (sp.checkWin && place === 1) {
        sp.achieved = true;
        season.weekLog.push({
          week: season.week,
          activity: "news",
          event: `[OK] ${sp.brand}'s sponsorship condition met — event win delivered.`,
        });
      } else if (sp.checkMajor && ev.tier === "Major") {
        sp.achieved = true;
        season.weekLog.push({
          week: season.week,
          activity: "news",
          event: `[OK] ${sp.brand}'s sponsorship condition met — Major appearance delivered.`,
        });
      }
    });

    season.history.push({
      eventNum: season.eventNum,
      place,
      champion: t.champion,
      prize,
      salary: 0,
      budgetAfter: season.budget,
      tier: ev.tier,
      label: ev.label || "Major",
      tournament: snapshotTournament(t),
      roster: playerStats.map((p) => p.name),
    });

    // Update world rankings
    const placements = {};
    if (t.bracket) {
      const br = t.bracket;
      const fr = br.final?.res;
      if (fr) {
        placements[fr.winnerName] = 1;
        placements[fr.loserName] = 2;
      }
      (br.sf || []).forEach((s) => {
        if (s.done && s.res && !placements[s.res.loserName])
          placements[s.res.loserName] = 4;
      });
      (br.qf || []).forEach((q) => {
        if (q.done && q.res && !placements[q.res.loserName])
          placements[q.res.loserName] = 9;
      });
    }
    if (t.swiss) {
      t.swiss.eliminated.forEach((tm) => {
        if (!placements[tm]) placements[tm] = t.teams?.length || 16;
      });
    }
    addEventToLog(
      season.simState,
      t,
      ev,
      placements,
      season.week,
      season.year || 2026,
    );
    computeValveRankings(season.simState, season.week, season.year || 2026);

    // Players within ~4 months of expiry must be re-signed or released at event end.
    const expiring = roster.filter((p) => p.contract <= 16);

    // Tick contracts every event (not just Majors)
    decayFormBetweenEvents(season.simState);
    tickContracts(season.simState, myTeam);

    if (isMajor) {
      season.simState.players.forEach((p) => {
        if (Math.random() < 0.33) p.age++;
      });
      const moves = aiRosterMoves(season.simState, myTeam);
      moves.forEach((m) =>
        season.weekLog.push({ week: season.week, activity: "news", event: m }),
      );
      // Map pool rotation after every Major
      const rotation = rotateMapPool(season.simState, Math.random);
      if (rotation) {
        season.weekLog.push({
          week: season.week,
          activity: "news",
          event: `[MAP] ${rotation.dropped} removed from the competitive map pool.`,
        });
        season.weekLog.push({
          week: season.week,
          activity: "news",
          event: `[MAP] ${rotation.newMap} added to the competitive map pool!`,
        });
      }
    }

    const chemAfter = season.simState.chemistry[myTeam] || 70;
    const mvp =
      [...playerStats]
        .sort((a, b) => b.rating - a.rating)
        .find((p) => p.maps >= 2) || playerStats[0];

    if (!season.simState.rankings[myTeam]) season.simState.rankings[myTeam] = 0;
    season.eventNum++;
    season.week++;
    season.pendingDebrief = {
      label: ev.label || "Tournament",
      tier: ev.tier || "B",
      place,
      prize,
      champion: t.champion,
      playerStats,
      mvp,
      chemBefore,
      chemAfter,
      winBonus,
    };
    season.pendingContracts = expiring.map((p) => ({
      playerName: p.name,
      contract: p.contract,
      currentSalary: p.salary,
      avgRating: +(season.simState.career?.[p.name]?.avgRating || 0.9).toFixed(
        2,
      ),
    }));

    // Morale crisis: unhappy leader → pending choice event
    const unhappyLeader = roster.find(
      (p) =>
        (p.morale || 60) < 40 && (p.traits.includes("leader") || p.igl >= 88),
    );
    if (unhappyLeader && !season.pendingEvent) {
      season.pendingEvent = {
        id: "morale_crisis",
        title: "Locker Room Unrest",
        playerName: unhappyLeader.name,
        text: `${unhappyLeader.name} is visibly unhappy — the mood in the team house is toxic.`,
        choices: [
          {
            label: "Emergency team meeting",
            desc: "$10K · +8 chemistry · +15 morale (all)",
          },
          {
            label: "1-on-1 with player",
            desc: "$5K · +20 morale (player) · +3 chem",
          },
          { label: "Ignore it", desc: "-8 chemistry · -5 morale (all)" },
        ],
      };
    }
    // Transfer request: very unhappy non-leader wants out
    const unhappyPlayer = roster.find(
      (p) =>
        (p.morale || 60) <= 25 &&
        !p.traits.includes("leader") &&
        (p.igl || 0) < 88,
    );
    if (unhappyPlayer && !season.pendingEvent) {
      season.pendingEvent = {
        id: "transfer_request",
        title: "Transfer Request",
        playerName: unhappyPlayer.name,
        text: `${unhappyPlayer.name} has formally requested a transfer — morale is at rock bottom.`,
        choices: [
          {
            label: "Promise changes",
            desc: "+15 morale · -$15K bonus · +3 chemistry",
          },
          { label: "Bench & fine", desc: "-5 form · -3 chemistry · +$5K" },
          { label: "Grant request", desc: "Player released to free agency" },
        ],
      };
    }

    // Evaluate event-based board objectives
    if (season.boardObjectives) {
      const isWin = place === 1;
      const isMajorEv = t.isMajor;
      season.boardObjectives.forEach((o) => {
        if (o.met) return;
        if (o.id === "win_event" && isWin) o.met = true;
        if (o.id === "win_major" && isWin && isMajorEv) o.met = true;
        if (o.id === "major_playoffs" && isMajorEv && place <= 8) o.met = true;
        if (o.id === "major_qualify" && isMajorEv) o.met = true;
      });
    }

    season.phase = "calendar";
    season.currentEvent = null;
    setSeason({ ...season });
    setT(null);
    setTab("calendar");
    // setT(null) above won't be visible on the `t` closure until next render —
    // pass null explicitly so we don't re-save the just-finished tournament.
    autoSave(null);
  }

  function dismissDebrief() {
    season.pendingDebrief = null;
    setSeason({ ...season });
  }

  function resolveContract(playerName, choice) {
    const p = season.simState.players.find((x) => x.name === playerName);
    if (!p) return;
    if (choice === 0) {
      // Extend 2 years on a performance-based raise.
      const perf = Math.min(
        1.3,
        Math.max(0.9, season.simState.career?.[playerName]?.avgRating || 0.95),
      );
      p.salary = Math.max(
        p.salary,
        desiredSalary(p),
        Math.round(p.salary * perf * 1.1),
      );
      p.contract = 104;
    } else if (choice === 1) {
      // Short 1-year deal, no raise.
      p.contract = 52;
    } else {
      p.team = "FA";
      p.contract = 0;
    }
    season.pendingContracts = (season.pendingContracts || []).filter(
      (c) => c.playerName !== playerName,
    );
    setSeason({ ...season });
    redraw();
  }

  function paySalary(week) {
    if (!isSalaryWeek(week)) return null;
    const fin = computeFinances(season, myTeam);
    const { income } = fin,
      totalSalary = fin.expenses.salaryTotal,
      totalIncome = income.total,
      net = fin.net;
    season.budget += net;
    const dateStr = weekToLabel(week, season.year);
    const parts = [];
    if (income.content) parts.push(`content ${income.content}K`);
    if (income.merch) parts.push(`merch ${income.merch}K`);
    if (income.stipend) parts.push(`stipend ${income.stipend}K`);
    if (income.streams) parts.push(`streams ${income.streams}K`);
    if (income.sponsor) parts.push(`sponsors ${income.sponsor}K`);
    const incStr = parts.length
      ? ` | Income: ${parts.join(", ")} = ${totalIncome}K`
      : "";
    return `[$] ${dateStr} — Salary: ${totalSalary}K${incStr} | Net: ${net >= 0 ? "+" : ""}${net}K${season.budget < 0 ? " ! DEBT!" : ""}`;
  }

  // Contracts are weeks-based: tick them down as time passes. AI sides never expire
  // (auto-renew); the user's players are kept alive until renewal is offered at the
  // next event, so nobody silently vanishes mid-season.
  function tickContractWeeks(n) {
    if (n <= 0) return;
    season.simState.players.forEach((p) => {
      if (p.team === "FA") return;
      p.contract -= n;
      if (p.team !== myTeam) {
        if (p.contract <= 8) p.contract = 104;
      } else if (p.contract < 1) p.contract = 1;
    });
  }

  function advanceWeek(activity, mapChoice) {
    if (activity === "scout" && mapChoice) {
      // mapChoice is used as teamName for scouting
      scoutTeam(mapChoice);
    }
    applyActivity(
      season.simState,
      myTeam,
      activity,
      activity === "scout" ? null : mapChoice,
      season.facilities,
    );
    const injMsg = tickInjuries(
      season.simState,
      myTeam,
      activity,
      season.facilities,
    );
    aiWeekActivity(season.simState);
    const evMsg = rollRandomEvent(season.simState, myTeam);
    rollChoiceEvent();
    // Academy: develop prospects each week
    if (season.academy) {
      season.academy.weeksActive++;
      season.academy.prospects.forEach((p) => developProspect(p));
      // Generate new prospect every 6 weeks if room
      if (
        season.academy.weeksActive % 6 === 0 &&
        season.academy.prospects.length < 4
      ) {
        season.academy.prospects.push(generateProspect(season.year || 2026));
        season.weekLog.push({
          week: season.week,
          activity: "news",
          event: `[AC] New academy prospect discovered!`,
        });
      }
    }
    // Sponsorship offers (~10% chance per week if none active)
    const activeSponsorCount = (season.sponsorships || []).filter(
      (s) => s.active,
    ).length;
    if (activeSponsorCount < 2 && Math.random() < 0.1) {
      if (!season.sponsorships) season.sponsorships = [];
      const rank = (() => {
        const r = getRankedTeams(season.simState, myTeam);
        return r.findIndex((x) => x.team === myTeam) + 1;
      })();
      const offers = [
        {
          brand: "Red Bull",
          monthly: rank <= 5 ? 40 : 25,
          duration: 6,
          condition: rank <= 10 ? "Stay top 10" : "Stay top 16",
          checkRank: rank <= 10 ? 10 : 16,
        },
        {
          brand: "HyperX",
          monthly: rank <= 8 ? 30 : 15,
          duration: 4,
          condition: "None",
          checkRank: 99,
        },
        {
          brand: "Intel",
          monthly: 50,
          duration: 3,
          condition: "Win an event",
          checkWin: true,
        },
        {
          brand: "BMW",
          monthly: rank <= 3 ? 60 : 35,
          duration: 6,
          condition: rank <= 5 ? "Stay top 5" : "Stay top 10",
          checkRank: rank <= 5 ? 5 : 10,
        },
        {
          brand: "Monster",
          monthly: 20,
          duration: 8,
          condition: "None",
          checkRank: 99,
        },
        {
          brand: "Logitech",
          monthly: rank <= 10 ? 35 : 18,
          duration: 5,
          condition: "Make a Major",
          checkMajor: true,
        },
        {
          brand: "Secretlab",
          monthly: 20,
          duration: 7,
          condition: "None",
          checkRank: 99,
        },
        {
          brand: "ASUS ROG",
          monthly: rank <= 6 ? 45 : 22,
          duration: 5,
          condition: rank <= 6 ? "Stay top 6" : "Stay top 12",
          checkRank: rank <= 6 ? 6 : 12,
        },
        {
          brand: "Vindex",
          monthly: 55,
          duration: 3,
          condition: "Win an event",
          checkWin: true,
        },
      ];
      const offer = offers[Math.floor(Math.random() * offers.length)];
      // Bigger brands command bigger sponsorship cheques.
      const bf = sponsorBrandFactor(
        brandValue(season, season.simState, myTeam),
      );
      const monthly = Math.round(offer.monthly * bf);
      season.sponsorships.push({
        ...offer,
        monthly,
        active: false,
        offered: true,
        weeksLeft: offer.duration * 4,
        startWeek: season.week,
        achieved: !offer.checkWin && !offer.checkMajor, // one-time conditions start unmet
      });
      season.weekLog.push({
        week: season.week,
        activity: "news",
        event: `[>] ${offer.brand} offers ${monthly}K/month for ${offer.duration} months (${offer.condition})`,
      });
    }
    // Tick active sponsorships and enforce their conditions:
    //  - checkRank ("stay top N"): checked every week, ongoing — pulls out the
    //    moment the threshold breaks, instead of riding out the rest of the deal.
    //  - checkWin/checkMajor ("win an event" / "make a Major"): one-time
    //    achievements. `sp.achieved` is flipped in endEvent() the moment they're
    //    met. If the contract runs out (weeksLeft hits 0) and it was never met,
    //    the sponsor walks unrenewed instead of quietly disappearing.
    const sponsorRank = (() => {
      const r = getRankedTeams(season.simState, myTeam);
      return r.findIndex((x) => x.team === myTeam) + 1;
    })();
    (season.sponsorships || []).forEach((sp) => {
      if (!sp.active) return;
      if (sp.checkRank && sponsorRank > sp.checkRank) {
        sp.active = false;
        sp.weeksLeft = 0;
        season.weekLog.push({
          week: season.week,
          activity: "news",
          event: `[X] ${sp.brand} pulled their sponsorship — ${myTeam} dropped out of top ${sp.checkRank} (now #${sponsorRank}).`,
        });
        return;
      }
      sp.weeksLeft--;
      if (sp.weeksLeft <= 0) {
        sp.active = false;
        if (!sp.achieved) {
          season.weekLog.push({
            week: season.week,
            activity: "news",
            event: `[X] ${sp.brand}'s deal expired unfulfilled — ${myTeam} never delivered "${sp.condition}."`,
          });
        }
      }
    });
    season.weekLog.push({
      week: season.week,
      activity,
      mapChoice,
      event: evMsg || null,
    });
    if (injMsg)
      season.weekLog.push({
        week: season.week,
        activity: "news",
        event: injMsg,
      });
    season.week++;
    tickContractWeeks(1);
    const salMsg = paySalary(season.week);
    if (salMsg)
      season.weekLog.push({
        week: season.week,
        activity: "salary",
        event: salMsg,
      });

    if (tickDebtForWeek(true)) {
      triggerBankruptcy();
      return;
    }
    const newT = checkWeekTransition();
    autoSave(newT);
  }

  // Applies one week of debt consequences: interest on any active loan,
  // chemistry/morale decay while insolvent, debtWeeks tracking, and — when
  // `interactive` is true — board-warning choice events at set milestones.
  // Bulk "sim to next event" passes interactive=false, matching how all other
  // CHOICE_EVENTS are already silently skipped during that mode; debt still
  // accrues and can still trigger bankruptcy there, it just won't show a card.
  // Returns true if this tick crossed into bankruptcy.
  function tickDebtForWeek(interactive) {
    if (season.budget < 0) {
      if (season.debtInterestRate) {
        season.budget -= Math.round(
          -season.budget * (season.debtInterestRate / 100),
        );
      }
      season.debtWeeks = (season.debtWeeks || 0) + 1;
      season.simState.chemistry[myTeam] = Math.max(
        15,
        (season.simState.chemistry[myTeam] || 70) - 2,
      );
      rosterOf(season.simState, myTeam).forEach((p) => {
        p.morale = Math.max(5, (p.morale ?? 60) - 3);
      });
      if (season.debtWeeks === 1) {
        season.weekLog.push({
          week: season.week,
          activity: "news",
          event: `[!] ${myTeam} is running a deficit — squad morale and chemistry will keep suffering until it's cleared.`,
        });
      }
      if (
        interactive &&
        season.debtWeeks >= DEBT_WARNING_WEEKS &&
        (season.debtWarnStage || 0) < 1 &&
        !season.pendingEvent
      ) {
        season.debtWarnStage = 1;
        season.pendingEvent = {
          id: "debt_warning",
          title: "Board Warning",
          text: `The board is alarmed — ${myTeam} has run a deficit for ${season.debtWeeks} straight weeks. They want action.`,
          choices: [
            { label: "Emergency loan", desc: "+$150K now · 5%/wk interest accrues on the debt until it's repaid" },
            { label: "Cut costs immediately", desc: "Release your lowest-morale player to free agency, no refund" },
            { label: "Reassure the board", desc: "No cost · -5 chemistry from the scare" },
          ],
        };
      } else if (
        interactive &&
        season.debtWeeks >= DEBT_FINAL_WARNING_WEEKS &&
        (season.debtWarnStage || 0) < 2 &&
        !season.pendingEvent
      ) {
        season.debtWarnStage = 2;
        season.pendingEvent = {
          id: "debt_final_warning",
          title: "Final Warning",
          text: `${myTeam} has been insolvent for ${season.debtWeeks} weeks. The board says this is the last chance before they pull funding entirely.`,
          choices: [
            { label: "Sell your best player", desc: "Force-sell your highest-OVR player for 70% market value, immediate cash" },
            { label: "High-interest bailout", desc: "+$300K now · 10%/wk interest accrues on the debt until it's repaid" },
            { label: "Refuse — ride it out", desc: "No cost · bankruptcy risk is now severe" },
          ],
        };
      }
    } else {
      season.debtWeeks = 0;
      season.debtWarnStage = 0;
      season.debtInterestRate = 0;
    }
    return (
      season.budget <= DEBT_GAMEOVER_THRESHOLD ||
      season.debtWeeks >= DEBT_SUSTAINED_WEEKS
    );
  }

  function triggerBankruptcy() {
    season.phase = "bankrupt";
    season.weekLog.push({
      week: season.week,
      activity: "news",
      event: `[X] ${myTeam} has gone bankrupt. The organization folds.`,
    });
    setSeason({ ...season });
    setT(null);
    autoSave(null);
  }

  function simToNextEvent() {
    const startWk = season.week;
    const nextEv = EVENTS.find((e) => e.week >= season.week);
    const target = nextEv ? nextEv.week : SEASON_WEEKS + 1;
    const log = autoSimWeeks(
      season.simState,
      myTeam,
      season.week,
      target,
      season.facilities,
    );
    // Inject salary deductions into the log for each payday week, and tick debt
    // consequences for every simulated week — bulk-simming must not be a way to
    // dodge bankruptcy that single-stepping through weeks would otherwise trigger.
    const enriched = [];
    let bankrupt = false;
    for (const entry of log) {
      enriched.push(entry);
      if (isSalaryWeek(entry.week + 1)) {
        const roster = rosterOf(season.simState, myTeam);
        const coachPay = season.simState.coach
          ? season.simState.coach.salary
          : 0;
        const totalSalary = roster.reduce((s, p) => s + p.salary, 0) + coachPay;
        season.budget -= totalSalary;
        enriched.push({
          week: entry.week + 1,
          activity: "salary",
          event: `[$] Payday (${weekToLabel(entry.week + 1, season.year)}) — ${totalSalary}K salaries paid${season.budget < 0 ? " ! DEBT!" : ""}`,
        });
      }
      season.week = entry.week + 1;
      if (tickDebtForWeek(false)) {
        bankrupt = true;
        break;
      }
    }
    season.weekLog.push(...enriched);
    if (bankrupt) {
      triggerBankruptcy();
      return;
    }
    season.week = target;
    tickContractWeeks(target - startWk);
    const newT = checkWeekTransition();
    autoSave(newT);
  }

  function checkWeekTransition() {
    const ev = EVENTS.find((e) => e.week === season.week);
    if (ev) {
      season.phase = "event";
      season.currentEvent = ev;
      if (ev.tier === "Major") {
        // Major qualification: top 8 = Legends (direct), 9-16 = Challengers (qualifier)
        const ranked = getRankedTeams(season.simState, myTeam);
        const myRank = ranked.findIndex((x) => x.team === myTeam) + 1;
        if (myRank > 16) {
          // Outside top 16: miss the Major entirely
          season.weekLog.push({
            week: season.week,
            activity: "news",
            event: `[X] ${myTeam} (ranked #${myRank}) failed to qualify for ${ev.label}. Top 16 required.`,
          });
          // Sim Major without user
          const majorT = newTournament(myTeam, season.simState);
          // Remove user's team and sim everything
          majorT.swiss.teams = majorT.swiss.teams.filter((t) => t !== myTeam);
          let si = 0;
          while (!swissDone(majorT.swiss) && si < 30) {
            si++;
            swissRound(majorT.swiss);
          }
          const advancers = majorT.swiss.advanced.slice(0, 8);
          majorT.bracket = seedPlayoff(advancers, 3, true);
          let pi = 0;
          while (!majorT.bracket.final.done && pi < 20) {
            pi++;
            const allFx = [
              ...(majorT.bracket.qf || []),
              ...(majorT.bracket.sf || []),
              majorT.bracket.final,
            ];
            allFx.forEach((fx) => {
              if (!fx.done && fx.a && fx.b) {
                const bo = fx === majorT.bracket.final ? 5 : 3;
                fx.res = playSeries(
                  majorT.simState,
                  fx.a,
                  fx.b,
                  bo,
                  { stage: "playoffs" },
                  Math.random,
                );
                fx.done = true;
              }
            });
            resolvePlayoffAI(
              majorT.bracket,
              null,
              majorT.simState,
              Math.random,
            );
          }
          const champ = majorT.bracket.final.done
            ? majorT.bracket.final.res.winnerName
            : "Unknown";
          season.weekLog.push({
            week: season.week,
            activity: "news",
            event: `[W] ${champ} win ${ev.label} (you were not qualified)`,
          });
          season.history.push({
            eventNum: season.eventNum,
            place: 99,
            champion: champ,
            prize: 0,
            salary: 0,
            budgetAfter: season.budget,
            tier: "Major",
            label: ev.label + " (DNQ)",
            tournament: snapshotTournament(majorT),
          });
          // Rankings update for participants
          const placements = {};
          if (majorT.bracket.final.res) {
            placements[majorT.bracket.final.res.winnerName] = 1;
            placements[majorT.bracket.final.res.loserName] = 2;
          }
          (majorT.bracket.sf || []).forEach((s) => {
            if (s.done && s.res) placements[s.res.loserName] = 4;
          });
          (majorT.bracket.qf || []).forEach((q) => {
            if (q.done && q.res) placements[q.res.loserName] = 9;
          });
          majorT.swiss.eliminated.forEach((tm) => {
            if (!placements[tm]) placements[tm] = 16;
          });
          addEventToLog(
            season.simState,
            majorT,
            ev,
            placements,
            season.week,
            season.year || 2026,
          );
          computeValveRankings(
            season.simState,
            season.week,
            season.year || 2026,
          );
          decayFormBetweenEvents(season.simState);
          tickContracts(season.simState, myTeam);
          const moves = aiRosterMoves(season.simState, myTeam);
          moves.forEach((m) =>
            season.weekLog.push({
              week: season.week,
              activity: "news",
              event: m,
            }),
          );
          season.eventNum++;
          season.week++;
          season.currentEvent = null;
          season.phase = "calendar";
          setSeason({ ...season });
          setTab("calendar");
          return;
        }
        const isLegend = myRank <= 8;
        if (!isLegend) {
          season.weekLog.push({
            week: season.week,
            activity: "news",
            event: `[S] ${myTeam} (ranked #${myRank}) enters the Challenger Stage qualifier for ${ev.label}`,
          });
        } else {
          season.weekLog.push({
            week: season.week,
            activity: "news",
            event: `[*] ${myTeam} (ranked #${myRank}) auto-qualified as Legends for ${ev.label}`,
          });
        }
        // Sticker money for qualifying
        const stickerMoney = isLegend
          ? Math.round(40 + (17 - myRank) * 5)
          : Math.round(15 + (17 - myRank) * 2);
        season.budget += stickerMoney;
        season.weekLog.push({
          week: season.week,
          activity: "news",
          event: `[TK] Major sticker revenue: +${stickerMoney}K`,
        });
        const newT = newTournament(myTeam, season.simState);
        setSeason({ ...season });
        setT(newT);
        setTab("hub");
        return newT;
      } else {
        // ── A/B tier access ──────────────────────────────────────────
        // B-tier: open qualifier — the manager opts in (or skips). A-tier:
        // invitational — direct slot for top-12 ranked teams, otherwise a
        // chance at one of 4 organizer wildcards (better odds with strong
        // recent B-tier form). Either way it becomes a decision card on the
        // calendar; a team that isn't invited has the event simmed without it.
        const ranked = getRankedTeams(season.simState, myTeam);
        const myRank = ranked.findIndex((x) => x.team === myTeam) + 1;
        if (ev.tier === "A") {
          const directSlot = myRank <= 12;
          let wildcard = false;
          if (!directSlot && myRank <= 24) {
            const recentB = [...season.history]
              .reverse()
              .find((h) => h.tier === "B");
            const goodForm = recentB && recentB.place <= 4;
            const chance = goodForm ? 0.85 : myRank <= 16 ? 0.4 : 0.15;
            wildcard = Math.random() < chance;
          }
          if (directSlot || wildcard) {
            season.pendingEntry = {
              ev,
              tier: "A",
              directSlot,
              wildcard,
              myRank,
            };
            setSeason({ ...season });
            setTab("calendar");
          } else {
            const field = buildATierField(myTeam, season.simState, false);
            simSkippedEvent(
              ev,
              field,
              `[X] ${myTeam} (ranked #${myRank}) didn't receive an invite to ${ev.label}.`,
            );
          }
        } else {
          // B-tier — always eligible, manager chooses to register
          season.pendingEntry = { ev, tier: "B", myRank };
          setSeason({ ...season });
          setTab("calendar");
        }
      }
    } else if (season.week > SEASON_WEEKS) {
      const finalRank = (() => {
        const r = getRankedTeams(season.simState, myTeam);
        return r.findIndex((x) => x.team === myTeam) + 1;
      })();
      if (season.boardObjectives) {
        season.boardObjectives.forEach((o) => {
          if (o.met) return;
          if (o.id === "stay_solvent" && season.budget > 0) o.met = true;
          if (o.id === "stay_top5" && finalRank <= 5) o.met = true;
          if (o.id === "stay_top10" && finalRank <= 10) o.met = true;
          if (o.id === "stay_top16" && finalRank <= 16) o.met = true;
          if (o.id === "break_top16" && finalRank <= 16) o.met = true;
        });
      }
      const totalReward = (season.boardObjectives || [])
        .filter((o) => o.met)
        .reduce((s, o) => s + (o.reward || 0), 0);
      // Budget is a continuous, persistent resource now — no season-boundary
      // halving or floor. Debt (if any) follows you into the new year exactly
      // as it stood; only board objective rewards add anything on top.
      const carryover = season.budget;
      const awards = computeSeasonAwards(season.simState, myTeam);
      season.boardSummary = {
        finalRank,
        totalReward,
        carryover,
        oldBudget: season.budget,
        newBudget: carryover + totalReward,
        awards,
      };
      // Award winners get a form/morale boost
      if (awards) {
        const roster = rosterOf(season.simState, myTeam);
        roster.forEach((p) => {
          if (awards.mvp?.name === p.name) {
            p.form = Math.min(12, p.form + 4);
            p.morale = Math.min(100, (p.morale || 60) + 10);
          }
          if (awards.bestAWP?.name === p.name) {
            p.form = Math.min(12, p.form + 2);
            p.morale = Math.min(100, (p.morale || 60) + 5);
          }
          if (awards.rookie?.name === p.name) {
            p.form = Math.min(12, p.form + 3);
            p.morale = Math.min(100, (p.morale || 60) + 8);
          }
          if (awards.allStar?.some((a) => a.name === p.name)) {
            p.morale = Math.min(100, (p.morale || 60) + 5);
          }
        });
      }
      season.phase = "done";
      setSeason({ ...season });
      setTab("season");
    } else {
      setSeason({ ...season });
      redraw();
    }
  }

  // ── Event entry (register / accept invite) ────────────────────────
  function acceptEntry() {
    const pe = season.pendingEntry;
    if (!pe) return;
    const ev = pe.ev;
    season.pendingEntry = null;
    season.currentEvent = ev;
    season.phase = "event";
    const field =
      ev.tier === "A" ? buildATierField(myTeam, season.simState, true) : null;
    const newT = newMiniTournament(myTeam, season.simState, ev, field);
    setSeason({ ...season });
    setT(newT);
    setTab("hub");
    autoSave(newT);
  }
  function declineEntry() {
    const pe = season.pendingEntry;
    if (!pe) return;
    const ev = pe.ev;
    season.pendingEntry = null;
    const field =
      ev.tier === "A"
        ? buildATierField(myTeam, season.simState, false)
        : buildBTierField(myTeam, season.simState, ev.teams || 8, false);
    simSkippedEvent(ev, field, `[--] ${myTeam} sat out ${ev.label}.`);
  }

  // Simulate an A/B tier event the user isn't taking part in (declined or not
  // invited). Mirrors the Major DNQ path: full sim, then rankings/log upkeep.
  function simSkippedEvent(ev, field, newsLine) {
    const tourn = newMiniTournament(myTeam, season.simState, ev, field);
    const swissComplete = () =>
      tourn.swiss.teams.every(
        (tm) =>
          tourn.swiss.records[tm].w >= (tourn.swiss._advanceAt || 3) ||
          tourn.swiss.records[tm].l >= (tourn.swiss._elimAt || 3),
      );
    let si = 0;
    while (!swissComplete() && si < 40) {
      si++;
      swissRoundMini(tourn.swiss);
    }
    const advancers = tourn.swiss.advanced.slice(0, tourn.advanceCount || 4);
    tourn.bracket = seedPlayoff(advancers, 3, false);
    let pi = 0;
    while (!tourn.bracket.final.done && pi < 25) {
      pi++;
      const allFx = [
        ...(tourn.bracket.qf || []),
        ...(tourn.bracket.sf || []),
        tourn.bracket.final,
      ].filter(Boolean);
      allFx.forEach((fx) => {
        if (!fx.done && fx.a && fx.b) {
          fx.res = playSeries(
            tourn.simState,
            fx.a,
            fx.b,
            3,
            { stage: "playoffs" },
            Math.random,
          );
          fx.done = true;
        }
      });
      resolvePlayoffAI(tourn.bracket, null, tourn.simState, Math.random);
    }
    const champ = tourn.bracket.final.done
      ? tourn.bracket.final.res.winnerName
      : "Unknown";
    const placements = {};
    const br = tourn.bracket,
      fr = br.final?.res;
    if (fr) {
      placements[fr.winnerName] = 1;
      placements[fr.loserName] = 2;
    }
    (br.sf || []).forEach((s) => {
      if (s.done && s.res && !placements[s.res.loserName])
        placements[s.res.loserName] = ev.tier === "A" ? 4 : 3;
    });
    (br.qf || []).forEach((q) => {
      if (q.done && q.res && !placements[q.res.loserName])
        placements[q.res.loserName] = 9;
    });
    tourn.swiss.eliminated.forEach((tm) => {
      if (!placements[tm]) placements[tm] = field.length;
    });
    addEventToLog(
      season.simState,
      tourn,
      ev,
      placements,
      season.week,
      season.year || 2026,
    );
    computeValveRankings(season.simState, season.week, season.year || 2026);
    decayFormBetweenEvents(season.simState);
    tickContracts(season.simState, myTeam);
    season.history.push({
      eventNum: season.eventNum,
      place: 99,
      champion: champ,
      prize: 0,
      salary: 0,
      budgetAfter: season.budget,
      tier: ev.tier,
      label: ev.label + " (DNP)",
      tournament: snapshotTournament(tourn),
    });
    season.weekLog.push({
      week: season.week,
      activity: "news",
      event: newsLine,
    });
    season.weekLog.push({
      week: season.week,
      activity: "news",
      event: `[W] ${champ} won ${ev.label}.`,
    });
    season.eventNum++;
    season.week++;
    season.currentEvent = null;
    season.phase = "calendar";
    setSeason({ ...season });
    setT(null);
    setTab("calendar");
    autoSave();
  }

  function onSetActivePool(maps) {
    setActivePool(season.simState, myTeam, maps);
    setSeason({ ...season });
    redraw();
  }

  function setTactic(tactic) {
    if (!season.simState.tactics) season.simState.tactics = {};
    season.simState.tactics[myTeam] = tactic;
    season.weekLog.push({
      week: season.week,
      activity: "news",
      event: `[T] Tactical style changed to ${tactic}.`,
    });
    setSeason({ ...season });
    redraw();
  }

  function hireCoach(coach) {
    season.simState.coach = coach;
    setSeason({ ...season });
    redraw();
  }
  function fireCoach() {
    season.simState.coach = null;
    setSeason({ ...season });
    redraw();
  }

  function doTransfer(action, playerName) {
    const p = season.simState.players.find((x) => x.name === playerName);
    if (!p) return;
    if (action === "release") {
      season.budget += Math.round(marketValue(p) * 0.3);
      p.team = "FA";
      p.contract = 0;
      season.simState.chemistry[myTeam] = Math.max(
        40,
        (season.simState.chemistry[myTeam] || 70) - 8,
      );
    } else if (action === "sign" && p.team === "FA") {
      p.team = myTeam;
      p.contract = 104;
      season.budget -= marketValue(p);
      season.simState.chemistry[myTeam] = Math.max(
        40,
        (season.simState.chemistry[myTeam] || 70) - 5,
      );
      if (!season.simState.stats[p.name])
        season.simState.stats[p.name] = {
          maps: 0,
          rating: 0,
          mvps: 0,
          clutches: 0,
        };
      if (!season.simState.career[p.name])
        season.simState.career[p.name] = {
          totalMaps: 0,
          totalMvps: 0,
          totalClutches: 0,
          avgRating: 0,
          bestRating: 0,
          eventHistory: [],
          mapStats: {},
          origStats: {
            aim: p.aim,
            gameSense: p.gameSense,
            util: p.util,
            igl: p.igl,
            mentality: p.mentality,
            consistency: p.consistency,
            rifle: p.rifle,
            pistol: p.pistol,
            awp: p.awp,
            clutch: p.clutch,
            entry: p.entry,
            stamina: p.stamina,
            composure: p.composure,
            experience: p.experience,
          },
          kills: 0,
        };
    } else if (action === "buy") {
      const oldTeam = p.team;
      const rk = getRankedTeams(season.simState, myTeam).findIndex(
        (r) => r.team === oldTeam,
      );
      const buyout = buyoutPrice(p, rk < 0 ? 10 : rk);
      if (season.budget < buyout) return;
      season.budget -= buyout;
      p.team = myTeam;
      p.contract = 104;
      season.simState.chemistry[myTeam] = Math.max(
        40,
        (season.simState.chemistry[myTeam] || 70) - 5,
      );
      season.simState.chemistry[oldTeam] = Math.max(
        40,
        (season.simState.chemistry[oldTeam] || 70) - 5,
      );
      const fas = freeAgents(season.simState);
      if (fas.length > 0) {
        const best = fas.sort((a, b) => playerOvr(b) - playerOvr(a))[0];
        best.team = oldTeam;
        best.contract = 104;
      }
      if (!season.simState.stats[p.name])
        season.simState.stats[p.name] = {
          maps: 0,
          rating: 0,
          mvps: 0,
          clutches: 0,
        };
      if (!season.simState.career[p.name])
        season.simState.career[p.name] = {
          totalMaps: 0,
          totalMvps: 0,
          totalClutches: 0,
          avgRating: 0,
          bestRating: 0,
          eventHistory: [],
          mapStats: {},
          origStats: {
            aim: p.aim,
            gameSense: p.gameSense,
            util: p.util,
            igl: p.igl,
            mentality: p.mentality,
            consistency: p.consistency,
            rifle: p.rifle,
            pistol: p.pistol,
            awp: p.awp,
            clutch: p.clutch,
            entry: p.entry,
            stamina: p.stamina,
            composure: p.composure,
            experience: p.experience,
          },
          kills: 0,
        };
    }
    setSeason({ ...season });
    redraw();
  }

  function initCareer(p) {
    if (!season.simState.stats[p.name])
      season.simState.stats[p.name] = {
        maps: 0,
        rating: 0,
        mvps: 0,
        clutches: 0,
      };
    if (!season.simState.career[p.name])
      season.simState.career[p.name] = {
        totalMaps: 0,
        totalMvps: 0,
        totalClutches: 0,
        avgRating: 0,
        bestRating: 0,
        eventHistory: [],
        mapStats: {},
        origStats: {
          aim: p.aim,
          gameSense: p.gameSense,
          util: p.util,
          igl: p.igl,
          mentality: p.mentality,
          consistency: p.consistency,
          rifle: p.rifle,
          pistol: p.pistol,
          awp: p.awp,
          clutch: p.clutch,
          entry: p.entry,
          stamina: p.stamina,
          composure: p.composure,
          experience: p.experience,
        },
        kills: 0,
      };
  }

  function doNegotiateFA(playerName, offeredSalary) {
    const p = season.simState.players.find((x) => x.name === playerName);
    if (!p || p.team !== "FA")
      return { success: false, msg: "Player not available" };
    const roster = rosterOf(season.simState, myTeam);
    if (roster.length >= 5) return { success: false, msg: "Roster is full" };
    const mv = marketValue(p);
    if (season.budget < mv)
      return {
        success: false,
        msg: `Need $${mv - season.budget}K more for signing fee`,
      };
    const career = season.simState.career?.[p.name];
    const r = career?.avgRating || 0.95;
    const mult =
      r >= 1.15 ? 1.5 : r >= 1.1 ? 1.3 : r >= 1.0 ? 1.1 : r >= 0.9 ? 1.0 : 0.85;
    const desired = Math.max(desiredSalary(p), Math.round(p.salary * mult));
    if (offeredSalary >= desired) {
      p.team = myTeam;
      p.salary = offeredSalary;
      p.contract = 104;
      season.budget -= mv;
      season.simState.chemistry[myTeam] = Math.max(
        40,
        (season.simState.chemistry[myTeam] || 70) - 5,
      );
      initCareer(p);
      season.weekLog.push({
        week: season.week,
        activity: "news",
        event: `[+] ${p.name} signed for $${offeredSalary}K/mo (fee: $${mv}K)`,
      });
      setSeason({ ...season });
      redraw();
      return {
        success: true,
        signed: true,
        msg: `${p.name} signed at $${offeredSalary}K/mo!`,
      };
    }
    if (offeredSalary >= desired * 0.8) {
      const counter = Math.round((offeredSalary + desired) / 2);
      return {
        success: false,
        counter: true,
        counterSalary: counter,
        msg: `${p.name} counters at $${counter}K/mo (wanted $${desired}K)`,
      };
    }
    return {
      success: false,
      msg: `${p.name} rejects $${offeredSalary}K — wants at least $${Math.round(desired * 0.8)}K/mo`,
    };
  }

  function doBuyoutOffer(playerName, offerAmount) {
    const p = season.simState.players.find((x) => x.name === playerName);
    if (!p || p.team === "FA" || p.team === myTeam)
      return { success: false, msg: "Invalid player" };
    const roster = rosterOf(season.simState, myTeam);
    if (roster.length >= 5) return { success: false, msg: "Roster is full" };
    if (season.budget < offerAmount)
      return { success: false, msg: "Insufficient budget" };
    const mv = marketValue(p);
    const holdTeam = p.team;
    const ranked = getRankedTeams(season.simState, myTeam);
    const teamRank = ranked.findIndex((r) => r.team === holdTeam);
    // Franchise protection: a team's best player carries a big extra premium.
    const holdRoster = rosterOf(season.simState, holdTeam);
    const isFranchise =
      holdRoster.length > 0 &&
      [...holdRoster].sort((a, b) => playerOvr(b) - playerOvr(a))[0].name ===
        p.name;
    let minAccept = buyoutPrice(p, teamRank < 0 ? 10 : teamRank);
    if (isFranchise) minAccept = Math.round(minAccept * 1.35);
    const counterPrice = Math.round(minAccept * 1.18);
    if (offerAmount >= minAccept) {
      const oldTeam = p.team;
      season.budget -= offerAmount;
      p.team = myTeam;
      p.contract = 104;
      season.simState.chemistry[myTeam] = Math.max(
        40,
        (season.simState.chemistry[myTeam] || 70) - 5,
      );
      season.simState.chemistry[oldTeam] = Math.max(
        40,
        (season.simState.chemistry[oldTeam] || 70) - 5,
      );
      const fas = freeAgents(season.simState);
      if (fas.length > 0) {
        const best = fas.sort((a, b) => playerOvr(b) - playerOvr(a))[0];
        best.team = oldTeam;
        best.contract = 104;
      }
      initCareer(p);
      season.weekLog.push({
        week: season.week,
        activity: "news",
        event: `[+] ${playerName} bought from ${holdTeam} for $${offerAmount}K`,
      });
      setSeason({ ...season });
      redraw();
      return {
        success: true,
        accepted: true,
        msg: `${holdTeam} accepts $${offerAmount}K for ${playerName}!`,
      };
    }
    if (offerAmount >= minAccept * 0.8) {
      return {
        success: false,
        accepted: false,
        counter: true,
        counterAmount: counterPrice,
        msg: `${holdTeam} counters at $${counterPrice}K${isFranchise ? " — he's their franchise player" : ""}`,
      };
    }
    return {
      success: false,
      accepted: false,
      msg: `${holdTeam} rejects. They value ${playerName} at ~$${minAccept}K+`,
    };
  }

  function doTradeOffer(myPlayerName, theirPlayerName, cashBonus) {
    const myP = season.simState.players.find(
      (x) => x.name === myPlayerName && x.team === myTeam,
    );
    const theirP = season.simState.players.find(
      (x) => x.name === theirPlayerName && x.team !== myTeam && x.team !== "FA",
    );
    if (!myP || !theirP) return { success: false, msg: "Invalid players" };
    if (season.budget < cashBonus)
      return { success: false, msg: "Insufficient budget" };
    const myMv = marketValue(myP),
      theirMv = marketValue(theirP);
    const myOvr = playerOvr(myP),
      theirOvr = playerOvr(theirP);
    const offerVal = myMv + cashBonus;
    const theirTeam = theirP.team;
    const theirRoster = rosterOf(season.simState, theirTeam);
    const needsRole = theirRoster.filter((p) => p.role === myP.role).length < 2;
    const isFranchise =
      theirRoster.length > 0 &&
      [...theirRoster].sort((a, b) => playerOvr(b) - playerOvr(a))[0].name ===
        theirP.name;
    // Trades must clear nearly the same bar as a cash buyout — otherwise swapping a
    // mid player + pocket change for a superstar is a free exploit. Stars also won't
    // be traded for a clear downgrade, and franchise players need the full premium.
    const prem = transferPremium(theirP);
    const tradeBar = Math.round(theirMv * prem * 0.85);
    const bigDowngrade = theirOvr - myOvr > 4; // can't pay mostly in scrubs
    const star = theirOvr >= 86;
    const franchiseBlock = isFranchise && offerVal < Math.round(theirMv * prem);
    if (offerVal >= tradeBar && !(star && bigDowngrade) && !franchiseBlock) {
      season.budget -= cashBonus;
      const oldTheirTeam = theirP.team;
      myP.team = oldTheirTeam;
      myP.contract = 104;
      theirP.team = myTeam;
      theirP.contract = 104;
      season.simState.chemistry[myTeam] = Math.max(
        40,
        (season.simState.chemistry[myTeam] || 70) - 5,
      );
      season.simState.chemistry[oldTheirTeam] = Math.max(
        40,
        (season.simState.chemistry[oldTheirTeam] || 70) - 5,
      );
      initCareer(theirP);
      season.weekLog.push({
        week: season.week,
        activity: "news",
        event: `[=] TRADE: ${myPlayerName} → ${oldTheirTeam}, ${theirPlayerName} → ${myTeam}${cashBonus > 0 ? ` (+$${cashBonus}K)` : ""}`,
      });
      setSeason({ ...season });
      redraw();
      return {
        success: true,
        accepted: true,
        msg: `Trade done! ${theirPlayerName} joins your roster.`,
      };
    }
    if (star && bigDowngrade)
      return {
        success: false,
        accepted: false,
        msg: `${theirTeam} won't trade ${theirPlayerName} for a clear downgrade.`,
      };
    if (offerVal >= tradeBar * 0.6) {
      const neededCash = Math.max(0, Math.round(tradeBar - myMv));
      if (neededCash > cashBonus)
        return {
          success: false,
          accepted: false,
          counter: true,
          counterCash: neededCash,
          msg: `${theirTeam} wants $${neededCash}K cash on top to part with ${theirPlayerName}.`,
        };
    }
    return {
      success: false,
      accepted: false,
      msg: `${theirTeam} declined — they value ${theirPlayerName} far higher than that.`,
    };
  }

  function doSellPlayer(playerName, buyingTeam, amount) {
    const p = season.simState.players.find(
      (x) => x.name === playerName && x.team === myTeam,
    );
    if (!p) return;
    season.budget += amount;
    p.team = buyingTeam;
    p.contract = 104;
    season.simState.chemistry[myTeam] = Math.max(
      40,
      (season.simState.chemistry[myTeam] || 70) - 8,
    );
    season.simState.chemistry[buyingTeam] = Math.max(
      40,
      (season.simState.chemistry[buyingTeam] || 70) - 3,
    );
    season.weekLog.push({
      week: season.week,
      activity: "news",
      event: `[$$] ${playerName} sold to ${buyingTeam} for $${amount}K`,
    });
    setSeason({ ...season });
    redraw();
  }

  function upgradeFacility(facId) {
    const fac = FACILITIES[facId];
    if (!fac) return;
    const curTier = season.facilities[facId] || 0;
    if (curTier >= fac.maxTier) return;
    const cost = fac.cost[curTier];
    if (season.budget < cost) return;
    season.budget -= cost;
    season.facilities = { ...season.facilities, [facId]: curTier + 1 };
    setSeason({ ...season });
    redraw();
  }

  function startNewYear() {
    // Year-end: save year summary, reset calendar, age players, generate rookies, decay rankings
    const yr = season.year || 2026;
    const endRank =
      season.boardSummary?.finalRank ||
      (() => {
        const r = getRankedTeams(season.simState, myTeam);
        return r.findIndex((x) => x.team === myTeam) + 1;
      })();
    season.yearHistory.push({
      year: yr,
      events: season.history.length,
      budgetEnd: season.budget,
      rank: endRank,
      trophies: season.history.filter((h) => h.place === 1).length,
      // Keep the actual championship details (not just the count) so a career
      // trophy case can show what was won, not just how many — see TrophyCase.jsx.
      titles: season.history
        .filter((h) => h.place === 1)
        .map((h) => ({ label: h.label, tier: h.tier, eventNum: h.eventNum })),
      roster: rosterOf(season.simState, myTeam).map((p) => p.name),
    });
    // Apply board budget — pure carryover of last season's balance plus any
    // objective rewards. No reset, no floor: debt persists into the new year.
    season.budget = season.boardSummary?.newBudget ?? season.budget;
    // Age all players +1
    season.simState.players.forEach((p) => {
      p.age++;
    });
    // Generate 5-8 rookies (young talents entering FA pool)
    const rookieCount = 5 + Math.floor(Math.random() * 4);
    const roles = ["IGL", "AWP", "Entry", "Lurk", "Support"];
    const rookieNames = [
      "prodigy",
      "wunderkid",
      "flash",
      "nova",
      "zen",
      "blitz",
      "cipher",
      "phantom",
      "ace",
      "bolt",
    ];
    for (let i = 0; i < rookieCount; i++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const name =
        rookieNames[Math.floor(Math.random() * rookieNames.length)] +
        (yr - 2025) +
        "_" +
        i;
      const base = 55 + Math.floor(Math.random() * 25);
      const p = {
        team: "FA",
        name,
        role,
        aim: base + Math.floor(Math.random() * 15),
        gameSense: base + Math.floor(Math.random() * 10),
        util: base + Math.floor(Math.random() * 10),
        igl: role === "IGL" ? base + 20 : base - 10,
        mentality: 50 + Math.floor(Math.random() * 30),
        consistency: 40 + Math.floor(Math.random() * 30),
        traits:
          Math.random() < 0.2
            ? ["boom"]
            : Math.random() < 0.1
              ? ["clutch"]
              : [],
        salary: 5 + Math.floor(Math.random() * 5),
        contract: 0,
        age: 17 + Math.floor(Math.random() * 2),
        era: "current",
        form: 0,
        fatigue: 10,
        injury: null,
        rifle: base + Math.floor(Math.random() * 12),
        pistol: base + Math.floor(Math.random() * 12),
        awp: role === "AWP" ? base + 15 : base - 5,
        clutch: 40 + Math.floor(Math.random() * 20),
        entry: role === "Entry" ? base + 15 : base,
        stamina: 60 + Math.floor(Math.random() * 25),
        composure: 40 + Math.floor(Math.random() * 25),
        experience: 30 + Math.floor(Math.random() * 10),
      };
      season.simState.players.push(p);
      season.simState.stats[p.name] = {
        maps: 0,
        rating: 0,
        mvps: 0,
        clutches: 0,
      };
      season.simState.career[p.name] = {
        totalMaps: 0,
        totalMvps: 0,
        totalClutches: 0,
        avgRating: 0,
        bestRating: 0,
        eventHistory: [],
        mapStats: {},
        origStats: {
          aim: p.aim,
          gameSense: p.gameSense,
          util: p.util,
          igl: p.igl,
          mentality: p.mentality,
          consistency: p.consistency,
          rifle: p.rifle,
          pistol: p.pistol,
          awp: p.awp,
          clutch: p.clutch,
          entry: p.entry,
          stamina: p.stamina,
          composure: p.composure,
          experience: p.experience,
        },
        kills: 0,
      };
    }
    // Recompute rankings with Valve time-decay (off-season: prior season now 52+ weeks older)
    computeValveRankings(season.simState, 1, newYear);
    // Expire more contracts
    tickContracts(season.simState, myTeam);
    // AI roster moves in off-season
    const moves = aiRosterMoves(season.simState, myTeam);
    // Generate new board objectives based on post-decay rank
    const newRank = (() => {
      const r = getRankedTeams(season.simState, myTeam);
      return r.findIndex((x) => x.team === myTeam) + 1;
    })();
    season.boardObjectives = genBoardObjectives(newRank);
    season.boardSummary = null;
    // Reset season but keep everything else
    const newYear = yr + 1;
    season.year = newYear;
    season.week = 1;
    season.eventNum = 1;
    season.history = [];
    season.weekLog = [
      {
        week: 0,
        activity: "news",
        event: `> Welcome to the ${newYear} season! ${rookieCount} new rookies entered the market.`,
      },
    ];
    if (moves.length)
      moves.forEach((m) =>
        season.weekLog.push({ week: 0, activity: "news", event: m }),
      );
    season.phase = "calendar";
    setSeason({ ...season });
    setT(null);
    setTab("calendar");
    autoSave();
  }

  function acceptSponsorship(idx) {
    if (!season.sponsorships?.[idx]) return;
    season.sponsorships[idx].active = true;
    season.sponsorships[idx].offered = false;
    setSeason({ ...season });
    redraw();
  }
  function declineSponsorship(idx) {
    if (!season.sponsorships?.[idx]) return;
    season.sponsorships[idx].offered = false;
    setSeason({ ...season });
    redraw();
  }

  // Contract negotiations
  function negotiateContract(playerName, offeredSalary) {
    const p = season.simState.players.find((x) => x.name === playerName);
    if (!p || p.team !== myTeam)
      return { success: false, msg: "Player not on roster" };
    const ovr = playerOvr(p);
    const recentRating = season.simState.career?.[p.name]?.avgRating || 0.9;
    // Player's desired salary based on performance
    const demandBase = Math.max(
      desiredSalary(p),
      p.salary *
        (recentRating >= 1.1
          ? 1.4
          : recentRating >= 1.0
            ? 1.15
            : recentRating >= 0.9
              ? 1.0
              : 0.85),
    );
    const demand = Math.round(demandBase);
    if (offeredSalary >= demand) {
      p.salary = offeredSalary;
      p.contract = 156;
      return {
        success: true,
        msg: `${p.name} accepts $${offeredSalary}K/mo on a 3-year deal. They wanted $${demand}K.`,
      };
    }
    if (offeredSalary >= demand * 0.85) {
      // Counter-offer: split the difference, 2-year term
      const counter = Math.round((offeredSalary + demand) / 2);
      p.salary = counter;
      p.contract = 104;
      return {
        success: true,
        msg: `${p.name} counters at $${counter}K/mo on a 2-year deal (wanted $${demand}K).`,
      };
    }
    return {
      success: false,
      msg: `${p.name} rejected $${offeredSalary}K/mo. They want at least $${Math.round(demand * 0.85)}K.`,
    };
  }

  // Role assignment
  function changeRole(playerName, newRole) {
    const p = season.simState.players.find((x) => x.name === playerName);
    if (!p || p.team !== myTeam) return;
    if (p.role === newRole) return;
    p.role = newRole;
    season.simState.chemistry[myTeam] = Math.max(
      40,
      (season.simState.chemistry[myTeam] || 55) - 3,
    );
    season.weekLog.push({
      week: season.week,
      activity: "news",
      event: `[>] ${p.name} moved to ${newRole} role (-3 chemistry)`,
    });
    setSeason({ ...season });
    redraw();
  }

  // Scout prep
  function scoutTeam(teamName) {
    if (!season.scoutedTeams) season.scoutedTeams = {};
    const roster = rosterOf(season.simState, teamName);
    const mapProf = getMapProf(season.simState, teamName);
    season.scoutedTeams[teamName] = {
      roster: roster.map((p) => ({
        name: p.name,
        ovr: playerOvr(p),
        role: p.role,
      })),
      maps: Object.entries(mapProf)
        .sort((a, b) => b[1] - a[1])
        .map(([m, v]) => ({ map: m, prof: v })),
      scoutedAt: season.week,
    };
    season.weekLog.push({
      week: season.week,
      activity: "news",
      event: `[SC] Scouted ${teamName} — map pool and roster intel acquired`,
    });
    setSeason({ ...season });
    redraw();
  }

  // Academy
  function initAcademy() {
    if (season.academy) return;
    if (season.budget < 100) return;
    season.budget -= 100;
    season.academy = { prospects: [], weeksActive: 0 };
    // Generate 2 initial prospects
    for (let i = 0; i < 2; i++)
      season.academy.prospects.push(generateProspect(season.year || 2026));
    setSeason({ ...season });
    redraw();
  }

  function promoteProspect(idx) {
    if (!season.academy?.prospects[idx]) return;
    const roster = rosterOf(season.simState, myTeam);
    if (roster.length >= 5) return;
    const p = season.academy.prospects[idx];
    p.team = myTeam;
    p.contract = 156;
    season.simState.players.push(p);
    season.simState.stats[p.name] = {
      maps: 0,
      rating: 0,
      mvps: 0,
      clutches: 0,
    };
    season.simState.career[p.name] = {
      totalMaps: 0,
      totalMvps: 0,
      totalClutches: 0,
      avgRating: 0,
      bestRating: 0,
      eventHistory: [],
      mapStats: {},
      origStats: {
        aim: p.aim,
        gameSense: p.gameSense,
        util: p.util,
        igl: p.igl,
        mentality: p.mentality,
        consistency: p.consistency,
        rifle: p.rifle || 60,
        pistol: p.pistol || 50,
        awp: p.awp || 40,
        clutch: p.clutch || 40,
        entry: p.entry || 50,
        stamina: p.stamina || 60,
        composure: p.composure || 40,
        experience: p.experience || 30,
      },
      kills: 0,
    };
    season.academy.prospects.splice(idx, 1);
    season.simState.chemistry[myTeam] = Math.max(
      40,
      (season.simState.chemistry[myTeam] || 55) - 5,
    );
    setSeason({ ...season });
    redraw();
  }

  function sellProspect(idx) {
    if (!season.academy?.prospects[idx]) return;
    if ((season.academy.prospects[idx].weeksInAcademy || 0) < 8) return;
    const p = season.academy.prospects[idx];
    const value = Math.round(playerOvr(p) * 0.8);
    season.budget += value;
    season.academy.prospects.splice(idx, 1);
    season.weekLog.push({
      week: season.week,
      activity: "news",
      event: `[$$] Sold academy prospect ${p.name} for ${value}K`,
    });
    setSeason({ ...season });
    redraw();
  }

  function rollChoiceEvent() {
    if (season.pendingEvent) return;
    if (Math.random() > 0.25) return;
    const roster = rosterOf(season.simState, myTeam);
    if (!roster.length) return;
    const totalWeight = CHOICE_EVENTS.reduce((s, e) => s + e.weight, 0);
    let roll = Math.random() * totalWeight,
      ev = null;
    for (const e of CHOICE_EVENTS) {
      roll -= e.weight;
      if (roll <= 0) {
        ev = e;
        break;
      }
    }
    if (!ev) return;
    const player = roster[Math.floor(Math.random() * roster.length)];
    season.pendingEvent = {
      ...ev,
      playerName: player.name,
      text: ev.text.replace("{player}", player.name),
    };
  }

  function resolveChoiceEvent(choiceIdx) {
    const ev = season.pendingEvent;
    if (!ev) return;
    const roster = rosterOf(season.simState, myTeam);
    const player = roster.find((p) => p.name === ev.playerName) || roster[0];
    switch (ev.id) {
      case "team_friction":
        if (choiceIdx === 0) {
          season.budget -= 10;
          season.simState.chemistry[myTeam] = Math.min(
            100,
            (season.simState.chemistry[myTeam] || 70) + 8,
          );
        } else if (choiceIdx === 1) {
          season.simState.chemistry[myTeam] = Math.max(
            40,
            (season.simState.chemistry[myTeam] || 70) - 5,
          );
        } else {
          if (player) player.form = Math.max(-12, player.form - 2);
          season.simState.chemistry[myTeam] = Math.max(
            40,
            (season.simState.chemistry[myTeam] || 70) - 2,
          );
          season.budget += 5;
        }
        break;
      case "player_demand":
        if (choiceIdx === 0) {
          if (player) {
            player.salary += 5;
            player.form = Math.min(12, player.form + 5);
          }
        } else if (choiceIdx === 1) {
          if (player) player.form = Math.max(-12, player.form - 4);
        } else {
          season.simState.chemistry[myTeam] = Math.max(
            40,
            (season.simState.chemistry[myTeam] || 70) - 2,
          );
        }
        break;
      case "rival_interest":
        if (choiceIdx === 0) {
          season.budget -= 20;
          if (player) player.form = Math.min(12, player.form + 3);
        } else if (choiceIdx === 1) {
          if (player) {
            player.salary += 4;
            player.contract = Math.max(player.contract, 2);
          }
        } else {
          if (player) player.form = Math.max(-12, player.form - 3);
          season.simState.chemistry[myTeam] = Math.max(
            40,
            (season.simState.chemistry[myTeam] || 70) - 5,
          );
        }
        break;
      case "bootcamp_invite":
        if (choiceIdx === 0) {
          season.budget -= 30;
          roster.forEach((p) => {
            p.gameSense = Math.min(99, p.gameSense + 2);
            p.fatigue = Math.min(100, p.fatigue + 10);
          });
        } else if (choiceIdx === 1) {
          season.budget -= 10;
          roster.forEach((p) => {
            p.gameSense = Math.min(99, p.gameSense + 1);
            p.fatigue = Math.min(100, p.fatigue + 5);
          });
        }
        break;
      case "slump":
        if (choiceIdx === 0) {
          season.budget -= 15;
          if (player) {
            player.form = Math.min(12, player.form + 4);
            player.gameSense = Math.min(99, player.gameSense + 1);
          }
        } else if (choiceIdx === 1) {
          if (player) {
            player.fatigue = Math.max(0, player.fatigue - 15);
            player.form = Math.min(12, player.form + 2);
          }
        } else {
          if (player) {
            player.fatigue = Math.min(100, player.fatigue + 10);
            player.form = Math.max(-12, player.form - 2);
          }
        }
        break;
      case "media_storm":
        if (choiceIdx === 0) {
          if (player) player.form = Math.max(-12, player.form - 3);
          season.simState.chemistry[myTeam] = Math.min(
            100,
            (season.simState.chemistry[myTeam] || 70) + 3,
          );
        } else if (choiceIdx === 1) {
          if (player) player.form = Math.min(12, player.form + 4);
          season.simState.chemistry[myTeam] = Math.max(
            40,
            (season.simState.chemistry[myTeam] || 70) - 7,
          );
        } else {
          season.simState.chemistry[myTeam] = Math.max(
            40,
            (season.simState.chemistry[myTeam] || 70) - 2,
          );
        }
        break;
      case "morale_crisis": {
        const roster2 = rosterOf(season.simState, myTeam);
        if (choiceIdx === 0) {
          season.budget -= 10;
          season.simState.chemistry[myTeam] = Math.min(
            100,
            (season.simState.chemistry[myTeam] || 70) + 8,
          );
          roster2.forEach((p) => {
            p.morale = Math.min(100, (p.morale || 60) + 15);
          });
        } else if (choiceIdx === 1) {
          season.budget -= 5;
          if (player) player.morale = Math.min(100, (player.morale || 60) + 20);
          season.simState.chemistry[myTeam] = Math.min(
            100,
            (season.simState.chemistry[myTeam] || 70) + 3,
          );
        } else {
          season.simState.chemistry[myTeam] = Math.max(
            30,
            (season.simState.chemistry[myTeam] || 70) - 8,
          );
          roster2.forEach((p) => {
            p.morale = Math.max(5, (p.morale || 60) - 5);
          });
        }
        break;
      }
      case "transfer_request": {
        if (choiceIdx === 0) {
          season.budget -= 15;
          if (player) player.morale = Math.min(100, (player.morale || 60) + 15);
          season.simState.chemistry[myTeam] = Math.min(
            100,
            (season.simState.chemistry[myTeam] || 70) + 3,
          );
        } else if (choiceIdx === 1) {
          if (player) {
            player.form = Math.max(-12, player.form - 5);
          }
          season.simState.chemistry[myTeam] = Math.max(
            40,
            (season.simState.chemistry[myTeam] || 70) - 3,
          );
          season.budget += 5;
        } else if (player) {
          player.team = "FA";
          player.contract = 0;
          season.simState.chemistry[myTeam] = Math.max(
            40,
            (season.simState.chemistry[myTeam] || 70) - 4,
          );
          season.weekLog.push({
            week: season.week,
            activity: "news",
            event: `[--] ${player.name} released after transfer request.`,
          });
        }
        break;
      }
      case "debt_warning":
        if (choiceIdx === 0) {
          season.budget += 150;
          season.debtInterestRate = 5;
        } else if (choiceIdx === 1) {
          const worst = [...roster].sort(
            (a, b) => (a.morale ?? 60) - (b.morale ?? 60),
          )[0];
          if (worst) {
            worst.team = "FA";
            worst.contract = 0;
            season.weekLog.push({
              week: season.week,
              activity: "news",
              event: `[--] ${worst.name} released to cut costs amid financial trouble.`,
            });
          }
        } else {
          season.simState.chemistry[myTeam] = Math.max(
            15,
            (season.simState.chemistry[myTeam] || 70) - 5,
          );
        }
        break;
      case "debt_final_warning":
        if (choiceIdx === 0) {
          const best = [...roster].sort(
            (a, b) => playerOvr(b) - playerOvr(a),
          )[0];
          if (best) {
            const sale = Math.round(marketValue(best) * 0.7);
            season.budget += sale;
            best.team = "FA";
            best.contract = 0;
            season.weekLog.push({
              week: season.week,
              activity: "news",
              event: `[$] Forced sale: ${best.name} sold for ${sale}K to cover debts.`,
            });
          }
        } else if (choiceIdx === 1) {
          season.budget += 300;
          season.debtInterestRate = 10;
        } else {
          season.weekLog.push({
            week: season.week,
            activity: "news",
            event: `[!] ${myTeam} refuses board intervention — bankruptcy risk is now severe.`,
          });
        }
        break;
      default:
        break;
    }
    const choice = ev.choices[choiceIdx];
    season.weekLog.push({
      week: season.week,
      activity: "news",
      event: `[!] ${ev.title}: "${choice?.label}" — ${choice?.desc || ""}`,
    });
    season.pendingEvent = null;
    setSeason({ ...season });
    redraw();
  }

  function resetAll() {
    setPhase("saves");
    setMyTeam(null);
    setSeason(null);
    setT(null);
    setTab("hub");
    loadSaves();
  }

  if (phase === "loading")
    return (
      <div
        style={{
          minHeight: "100vh",
          background: GRAD,
          color: C.ink,
          fontFamily: sans,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Gstyle />
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Wordmark size={22} />
          <div
            style={{
              color: C.dim,
              fontSize: 12,
              fontFamily: mono,
              letterSpacing: 1,
              animation: "pulse 1.4s ease infinite",
            }}
          >
            Loading…
          </div>
        </div>
      </div>
    );

  if (phase === "saves")
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
            onClick={() => setPhase("draft")}
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
                      onClick={() => loadFromSave(save)}
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
                        onClick={() => deleteSave(i)}
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

  if (phase === "draft") return <DraftScreen onComplete={onDraftComplete} />;

  // Calendar phase
  if (season?.phase === "calendar" && !t)
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
        <Header
          season={season}
          myTeam={myTeam}
          onReset={resetAll}
          onSave={saveToSlot}
          stageLabel={`${weekToLabel(season.week, season.year)} ${season.year || 2026} · W${season.week}`}
        />
        <Tabs tab={tab} setTab={setTab} calMode />
        <main
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "22px 18px 80px",
          }}
        >
          {tab === "calendar" && (
            <CalendarView
              season={season}
              myTeam={myTeam}
              onAdvance={advanceWeek}
              onSim={simToNextEvent}
              onAcceptSponsor={acceptSponsorship}
              onDeclineSponsor={declineSponsorship}
              onResolveEvent={resolveChoiceEvent}
              onResolveContract={resolveContract}
              onAcceptEntry={acceptEntry}
              onDeclineEntry={declineEntry}
            />
          )}
          {tab === "roster" && (
            <RosterView2
              state={season.simState}
              myTeam={myTeam}
              onNegotiate={negotiateContract}
              onChangeRole={changeRole}
            />
          )}
          {tab === "market" && (
            <TransferMarket
              season={season}
              myTeam={myTeam}
              onNegotiateFA={doNegotiateFA}
              onBuyoutOffer={doBuyoutOffer}
              onTradeOffer={doTradeOffer}
              onSellPlayer={doSellPlayer}
              onRelease={(p) => doTransfer("release", p)}
            />
          )}
          {tab === "maps" && (
            <MapProfView
              state={season.simState}
              myTeam={myTeam}
              onSetActivePool={onSetActivePool}
            />
          )}
          {tab === "facility" && (
            <FacilitiesView
              season={season}
              myTeam={myTeam}
              onUpgrade={upgradeFacility}
              onHireCoach={hireCoach}
              onFireCoach={fireCoach}
              onInitAcademy={initAcademy}
              onPromoteProspect={promoteProspect}
              onSellProspect={sellProspect}
            />
          )}
          {tab === "finance" && <FinanceView season={season} myTeam={myTeam} />}
          {tab === "rankings" && (
            <RankingsView
              state={season.simState}
              myTeam={myTeam}
              week={season.week}
              year={season.year || 2026}
            />
          )}
          {tab === "rivals" && (
            <RivalryView state={season.simState} myTeam={myTeam} />
          )}
          {tab === "dynamics" && (
            <DynamicsView season={season} myTeam={myTeam} />
          )}
          {tab === "tactics" && (
            <TacticsView
              season={season}
              myTeam={myTeam}
              onSetStyle={setTactic}
            />
          )}
          {tab === "season" && (
            <SeasonHistory season={season} myTeam={myTeam} />
          )}
        </main>
        {season.pendingDebrief && (
          <EventDebrief
            debrief={season.pendingDebrief}
            onDismiss={dismissDebrief}
          />
        )}
      </div>
    );

  // Bankrupt — organization folded, only path forward is a new org
  if (season?.phase === "bankrupt")
    return (
      <BankruptcyScreen season={season} myTeam={myTeam} onNewOrg={resetAll} />
    );

  // Season done — board review
  if (season?.phase === "done")
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
        <Header
          season={season}
          myTeam={myTeam}
          onReset={resetAll}
          onSave={saveToSlot}
          stageLabel={`${season.year || 2026} SEASON COMPLETE`}
        />
        <main
          style={{ maxWidth: 900, margin: "0 auto", padding: "32px 18px 80px" }}
        >
          <BoardReview
            season={season}
            myTeam={myTeam}
            onBeginNewYear={startNewYear}
            onMenu={resetAll}
          />
        </main>
      </div>
    );

  // Event phase
  if (!t) return null;
  const isMajor = t.isMajor;
  const nf = nextUserFx();
  const elimInSwiss = t.swiss?.eliminated?.includes(myTeam);
  const elimInPlayoffs = t.bracket ? bracketElim(t.bracket, myTeam) : false;
  const alive =
    t.stage === "done"
      ? t.champion === myTeam
      : !elimInSwiss && !elimInPlayoffs;
  const evLabel = season.currentEvent?.label || (isMajor ? "MAJOR" : "EVENT");
  const tierTag = season.currentEvent?.tier || "Major";
  const stageLabel =
    { swiss: "GROUP STAGE", playoffs: "PLAYOFFS", done: "COMPLETE" }[t.stage] ||
    "";
  const SEED = getSeed(myTeam, season?.simState);

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
      <Header
        season={season}
        myTeam={myTeam}
        onReset={resetAll}
        onSave={saveToSlot}
        stageLabel={`${evLabel} · ${stageLabel}`}
      />
      <Tabs tab={tab} setTab={setTab} miniMode={!isMajor} />
      <main
        style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 18px 80px" }}
      >
        {tab === "roster" ? (
          <RosterView2
            state={season.simState}
            myTeam={myTeam}
            onNegotiate={negotiateContract}
            onChangeRole={changeRole}
          />
        ) : tab === "stats" ? (
          <StatsView t={t} />
        ) : tab === "rivals" ? (
          <RivalryView state={season.simState} myTeam={myTeam} />
        ) : tab === "season" ? (
          <SeasonHistory season={season} myTeam={myTeam} />
        ) : (
          <EventHLTV
            t={t}
            myTeam={myTeam}
            nf={nf}
            onPlay={(fx, bo) => beginVeto(fx, bo)}
            alive={alive}
            onOpen={setOpenMatch}
            onEndEvent={endEvent}
            season={season}
            SEED={SEED}
            evLabel={evLabel}
            tierTag={tierTag}
            tab={tab}
            setTab={setTab}
          />
        )}
      </main>
      {veto && (
        <VetoOverlay
          session={veto}
          myTeam={myTeam}
          t={t}
          onClose={() => setVeto(null)}
          onResolved={(res, fx) => {
            setVeto(null);
            setReveal({ res, fx });
          }}
        />
      )}
      {reveal && (
        <MatchReveal
          reveal={reveal}
          myTeam={myTeam}
          t={t}
          onDone={() => {
            const { res, fx } = reveal;
            fx.res = res;
            fx.done = true;
            // Swiss: update records
            if (t.stage === "swiss" && t.swiss) resolveSwissFix(t.swiss, fx);
            setReveal(null);
            afterResult();
          }}
        />
      )}
      {openMatch && (
        <MatchModal m={openMatch} onClose={() => setOpenMatch(null)} />
      )}
    </div>
  );
}

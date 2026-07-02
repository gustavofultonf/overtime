// In-progress tournament progression: veto, match results, swiss/playoff
// advancement, event completion, and A/B-tier entry decisions.
import { EVENTS, SEASON_WEEKS } from "../constants/events.js";
import {
  getRankedTeams,
  addEventToLog,
  computeValveRankings,
  aiRosterMoves,
  desiredSalary,
  computeSeasonAwards,
} from "../engine/player.js";
import { rosterOf, updateMorale, rotateMapPool, currentMapPool } from "../engine/state.js";
import { playSeries } from "../engine/match.js";
import { snapshotEventStats } from "../engine/activity.js";
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
} from "../engine/tournament.js";

export function useTournamentFlow({
  season,
  setSeason,
  myTeam,
  t,
  setT,
  setTab,
  setVeto,
  redraw,
  autoSave,
}) {
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
  // Strips the heavy round-by-round breakdown (economy/narrative per round —
  // 16-30+ entries per map) out of a finished match result before it goes into
  // permanent save history. EventDetail.jsx only ever reads winnerName/
  // loserName/seriesScore for past events, never the round-by-round detail, so
  // keeping it was pure dead weight — across a season/multi-year save it was
  // the main driver of "overtime-saves" outgrowing the localStorage quota.
  function slimFixtureRes(res) {
    if (!res) return res;
    return {
      ...res,
      maps: (res.maps || []).map(({ rounds, wPerf, lPerf, triggers, ...m }) => m),
    };
  }

  function snapshotTournament(state) {
    if (!state) return null;
    const swiss = state.swiss;
    let bracket = state.bracket || null;
    if (bracket) {
      // Bug fix: this used to read state.qf/state.sf/state.final directly —
      // those fields live on state.bracket, not state, so every saved bracket
      // came out as {qf:undefined, sf:undefined, final:{}, bo5Final:false}
      // regardless of what actually happened in the playoffs. Season history
      // and EventDetail's bracket view were silently missing all of it.
      bracket = {
        qf: bracket.qf?.map((f) => ({ ...f, res: slimFixtureRes(f.res) })),
        sf: bracket.sf?.map((f) => ({ ...f, res: slimFixtureRes(f.res) })),
        final: { ...bracket.final, res: slimFixtureRes(bracket.final?.res) },
        bo3: bracket.bo3,
        bo5Final: !!bracket.bo5Final,
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
            matches: (swiss.records[tm].matches || []).map((f) => ({ ...f, res: slimFixtureRes(f.res) })),
          };
        }
        // `rounds` (round-by-round fixture groupings) used to be stored here too, but
        // every fixture it holds already appears in `records[team].matches` for both
        // teams involved — EventDetail/SeasonHistory (the only things that ever read
        // saved history) only ever consume `records`, never `rounds`. It was pure
        // dead weight, and a meaningful chunk of it: ~35% of a season's stored
        // history in testing.
        return {
          teams: Array.from(swiss.teams),
          records,
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
      playerStats,
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
        (p.morale || 60) < 40 && (p.traits.includes("leader") || p.igl >= 81),
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

  function checkWeekTransition() {
    const ev = EVENTS.find((e) => e.week === season.week);
    if (ev) {
      // Phase only flips to "event" once a tournament actually starts for the
      // user (Major auto-entry below, or acceptEntry() once they accept an
      // A/B-tier invite). A/B-tier events instead show a pendingEntry decision
      // card and must stay on "calendar" — setting phase="event" here
      // unconditionally left it stuck in "event" with `t` still null for that
      // branch, which renders nothing (the event-phase JSX bails on `!t`).
      season.currentEvent = ev;
      if (ev.tier === "Major") {
        season.phase = "event";
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

  return {
    nextUserFx,
    beginVeto,
    afterResult,
    snapshotTournament,
    endEvent,
    dismissDebrief,
    resolveContract,
    checkWeekTransition,
    acceptEntry,
    declineEntry,
    simSkippedEvent,
  };
}

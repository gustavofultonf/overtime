// Draft completion, board objectives, and season/year rollover.
import { getRankedTeams, computeValveRankings, aiRosterMoves } from "../engine/player.js";
import { rosterOf, profileFor } from "../engine/state.js";
import { tickContracts } from "../engine/tournament.js";

export function useSeasonCycle({
  season,
  setSeason,
  myTeam,
  setMyTeam,
  setPhase,
  setTab,
  setT,
  saves,
  writeSaves,
  buildSaveData,
  autoSave,
}) {
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
      totalSalaryPaid: 0,
      totalIncomeEarned: 0,
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
    season.totalSalaryPaid = 0;
    season.totalIncomeEarned = 0;
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

  return { genBoardObjectives, onDraftComplete, startNewYear };
}

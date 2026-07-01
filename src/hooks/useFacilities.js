// Facility upgrades, coaching staff, and the youth academy.
import { FACILITIES } from "../constants/events.js";
import { playerOvr } from "../engine/player.js";
import { rosterOf } from "../engine/state.js";
import { generateProspect } from "../engine/activity.js";

export function useFacilities({ season, setSeason, myTeam, redraw }) {
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
    p.contract = 52;
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

  return {
    upgradeFacility,
    hireCoach,
    fireCoach,
    initAcademy,
    promoteProspect,
    sellProspect,
  };
}

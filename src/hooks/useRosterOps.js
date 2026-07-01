// Transfer market, free agency, trades, contracts, roles, and scouting.
import {
  playerOvr,
  marketValue,
  getRankedTeams,
  transferPremium,
  buyoutPrice,
  desiredSalary,
} from "../engine/player.js";
import { rosterOf, freeAgents, getMapProf } from "../engine/state.js";

export function useRosterOps({ season, setSeason, myTeam, redraw }) {
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
      p.contract = 52;
      season.budget -= marketValue(p);
      season.simState.chemistry[myTeam] = Math.max(
        40,
        (season.simState.chemistry[myTeam] || 70) - 5,
      );
      initCareer(p);
    } else if (action === "buy") {
      const oldTeam = p.team;
      const rk = getRankedTeams(season.simState, myTeam).findIndex(
        (r) => r.team === oldTeam,
      );
      const buyout = buyoutPrice(p, rk < 0 ? 10 : rk);
      if (season.budget < buyout) return;
      season.budget -= buyout;
      p.team = myTeam;
      p.contract = 52;
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
    }
    setSeason({ ...season });
    redraw();
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
      p.contract = 52;
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
      p.contract = 52;
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
      theirP.contract = 52;
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

  // Contract negotiations
  function negotiateContract(playerName, offeredSalary) {
    const p = season.simState.players.find((x) => x.name === playerName);
    if (!p || p.team !== myTeam)
      return { success: false, msg: "Player not on roster" };
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

  // Direct pay adjustment for a current roster player — unlike negotiateContract
  // (which only fires at renewal and can reject a lowball), this always succeeds
  // but a cut below what the player's worth dings morale/chemistry proportionally
  // to the size of the cut, so pay can't be slashed for free.
  function adjustPay(playerName, newSalary) {
    const p = season.simState.players.find(
      (x) => x.name === playerName && x.team === myTeam,
    );
    if (!p) return { success: false, msg: "Player not on roster" };
    const floor = Math.max(5, Math.round(desiredSalary(p) * 0.5));
    if (newSalary < floor)
      return {
        success: false,
        msg: `${p.name} won't accept below $${floor}K/mo.`,
      };
    const cut = p.salary - newSalary;
    if (cut > 0) {
      const pct = cut / p.salary;
      p.morale = Math.max(5, (p.morale ?? 60) - Math.round(pct * 40));
      season.simState.chemistry[myTeam] = Math.max(
        40,
        (season.simState.chemistry[myTeam] || 70) - Math.round(pct * 10),
      );
    } else if (cut < 0) {
      const pct = -cut / p.salary;
      p.morale = Math.min(100, (p.morale ?? 60) + Math.min(8, Math.round(pct * 20)));
    }
    p.salary = newSalary;
    season.weekLog.push({
      week: season.week,
      activity: "news",
      event: `[$] ${p.name}'s pay ${cut > 0 ? "cut" : cut < 0 ? "raised" : "set"} to $${newSalary}K/mo`,
    });
    setSeason({ ...season });
    redraw();
    return {
      success: true,
      msg: `${p.name}'s pay is now $${newSalary}K/mo.`,
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

  return {
    initCareer,
    doTransfer,
    doNegotiateFA,
    doBuyoutOffer,
    doTradeOffer,
    doSellPlayer,
    negotiateContract,
    adjustPay,
    changeRole,
    scoutTeam,
  };
}

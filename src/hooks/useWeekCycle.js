// Weekly calendar advancement: activities, salary, sponsorships, debt,
// bulk-sim, choice events, and bankruptcy.
import {
  isSalaryWeek,
  weekToLabel,
  EVENTS,
  SEASON_WEEKS,
  CHOICE_EVENTS,
  DEBT_GAMEOVER_THRESHOLD,
  DEBT_SUSTAINED_WEEKS,
  DEBT_WARNING_WEEKS,
  DEBT_FINAL_WARNING_WEEKS,
} from "../constants/events.js";
import { getRankedTeams, playerOvr, marketValue } from "../engine/player.js";
import { rosterOf, tickInjuries } from "../engine/state.js";
import { applyActivity, rollRandomEvent } from "../engine/match.js";
import {
  generateProspect,
  developProspect,
  autoSimWeeks,
  aiWeekActivity,
} from "../engine/activity.js";
import { computeFinances, brandValue, sponsorBrandFactor } from "../engine/finance.js";

export function useWeekCycle({
  season,
  setSeason,
  myTeam,
  t,
  setT,
  redraw,
  autoSave,
  checkWeekTransition,
  scoutTeam,
}) {
  function paySalary(week) {
    if (!isSalaryWeek(week)) return null;
    const fin = computeFinances(season, myTeam);
    const { income } = fin,
      totalSalary = fin.expenses.salaryTotal,
      totalIncome = income.total,
      net = fin.net;
    season.budget += net;
    // Real running total for the Season tab — previously reverse-parsed from
    // weekLog display strings with a regex that never actually matched the
    // log format, so it silently always read $0K. Tracked directly here instead.
    season.totalSalaryPaid = (season.totalSalaryPaid || 0) + totalSalary;
    season.totalIncomeEarned = (season.totalIncomeEarned || 0) + totalIncome;
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
        season.totalSalaryPaid = (season.totalSalaryPaid || 0) + totalSalary;
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

  return {
    paySalary,
    tickContractWeeks,
    advanceWeek,
    tickDebtForWeek,
    triggerBankruptcy,
    simToNextEvent,
    acceptSponsorship,
    declineSponsorship,
    rollChoiceEvent,
    resolveChoiceEvent,
  };
}

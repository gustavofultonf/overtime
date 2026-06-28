import { playerOvr } from './utils.js';
import { rosterOf } from './state.js';
import { getRankedTeams } from './player.js';

// ── Central finance model ────────────────────────────────────────────
// Single source of truth for income/expense math. Mirrors the deductions
// applied in paySalary() so the Finance panel always matches reality.
// All figures are monthly (income/salaries are settled on salary weeks)
// and expressed in $K.
export function computeFinances(season, myTeam){
  const state = season.simState;
  const roster = rosterOf(state, myTeam);
  const ranked = getRankedTeams(state, myTeam);
  const rank = ranked.findIndex(x => x.team === myTeam) + 1;

  // ── Income streams ──
  const contentTier = season.facilities?.content || 0;
  const content = [0, 15, 30][contentTier] || 0;
  const merch   = rank <= 3 ? 40 : rank <= 6 ? 25 : rank <= 10 ? 15 : rank <= 16 ? 8 : 3;
  const stipend = rank <= 5 ? 30 : rank <= 10 ? 20 : rank <= 16 ? 12 : 5;
  const streams = Math.round(roster.reduce((s, p) => {
    const pop = playerOvr(p) / 20 + (state.career?.[p.name]?.totalMvps || 0) * 0.5;
    return s + pop;
  }, 0));
  const sponsor = (season.sponsorships || []).reduce((s, sp) => s + (sp.active ? sp.monthly : 0), 0);
  const incomeTotal = content + merch + stipend + streams + sponsor;

  // ── Expenses ──
  const players = roster.map(p => ({ name: p.name, role: p.role, salary: p.salary }))
                        .sort((a, b) => b.salary - a.salary);
  const coachObj = state.coach || null;
  const coach = coachObj ? { name: coachObj.name, salary: coachObj.salary } : null;
  const playerSalary = players.reduce((s, p) => s + p.salary, 0);
  const coachSalary = coach ? coach.salary : 0;
  const salaryTotal = playerSalary + coachSalary;

  // ── Net / runway ──
  const net = incomeTotal - salaryTotal;          // monthly
  const weeklyNet = net / 4;
  // Runway: how long the bank lasts at the current burn (only meaningful if losing money)
  const runwayMonths = net >= 0 ? Infinity : season.budget / -net;
  const runwayWeeks = net >= 0 ? Infinity : Math.floor(runwayMonths * 4);

  return {
    rank,
    budget: season.budget,
    income: { content, merch, stipend, streams, sponsor, total: incomeTotal },
    expenses: { players, coach, playerSalary, coachSalary, salaryTotal, total: salaryTotal },
    net, weeklyNet, runwayMonths, runwayWeeks,
  };
}

export const INCOME_LABELS = {
  content: "Content / Media",
  merch:   "Merchandise",
  stipend: "Org Stipend",
  streams: "Streaming",
  sponsor: "Sponsorships",
};

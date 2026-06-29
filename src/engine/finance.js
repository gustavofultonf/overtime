import { playerOvr } from './utils.js';
import { rosterOf } from './state.js';
import { getRankedTeams } from './player.js';

// ── Brand value ──────────────────────────────────────────────────────
// A 0–100 measure of how marketable the organization is. Driven by results
// (ranking + trophies), star power on the roster, and content investment.
// Brand drives merch income and the size of sponsorship offers, so winning
// and signing stars compounds into bigger off-server revenue.
export function brandValue(season, state, myTeam){
  const ranked = getRankedTeams(state, myTeam);
  const rank = ranked.findIndex(x => x.team === myTeam) + 1;
  const rankScore = rank <= 1 ? 40 : rank <= 3 ? 34 : rank <= 5 ? 28 : rank <= 10 ? 20 : rank <= 16 ? 12 : 6;
  const trophies = (season.history || []).filter(h => h.place === 1).length
    + (season.yearHistory || []).reduce((s, y) => s + (y.trophies || 0), 0);
  const trophyScore = Math.min(25, trophies * 5);
  const roster = rosterOf(state, myTeam);
  const starPower = roster.reduce((s, p) => s + Math.max(0, playerOvr(p) - 80), 0);
  const starScore = Math.min(20, starPower * 1.2);
  const contentScore = [0, 5, 10][season.facilities?.content || 0] || 0;
  return Math.max(1, Math.round(rankScore + trophyScore + starScore + contentScore));
}
export function brandTier(v){
  if (v >= 80) return { label: "Iconic",   color: "#f3c25b" };
  if (v >= 62) return { label: "Global",   color: "#9b8cff" };
  if (v >= 44) return { label: "National", color: "#5b9dff" };
  if (v >= 26) return { label: "Regional", color: "#36d29b" };
  return { label: "Local", color: "#8e98ad" };
}
// Sponsorship offers scale up with brand strength.
export function sponsorBrandFactor(v){ return 0.7 + v / 100; }

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
  const brand = brandValue(season, state, myTeam);
  const contentTier = season.facilities?.content || 0;
  const content = [0, 15, 30][contentTier] || 0;
  // Merch is now brand-driven: a recognizable org shifts far more product.
  const merch   = Math.round(6 + brand * 0.55);
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
    brand,
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

import React from 'react';
import { C, sans, mono } from './theme.js';
import { computeFinances, INCOME_LABELS } from '../engine/finance.js';
import { SL, MiniStat, Empty } from './primitives.jsx';

const fmt = v => `${v < 0 ? "-" : ""}$${Math.abs(Math.round(v))}K`;

// ── Budget trend: bank balance after each event + prize bars ──
function BudgetChart({ history }) {
  if (!history || history.length < 2) return null;
  const W = 440, H = 110, PL = 38, PR = 14, PT = 12, PB = 24;
  const plotW = W - PL - PR, plotH = H - PT - PB;
  const n = history.length;
  const budgets = history.map(h => h.budgetAfter);
  const prizes = history.map(h => h.prize);
  const maxV = Math.max(...budgets, 200) * 1.1;
  const minV = Math.min(...budgets, 0);
  const range = maxV - minV || 200;
  const xOf = i => PL + (i / (n - 1)) * plotW;
  const yOf = v => PT + (1 - (v - minV) / range) * plotH;
  const maxPrize = Math.max(...prizes, 1);
  const barW = Math.max(4, Math.min(18, plotW / n * 0.45));
  const gridVals = [0, Math.round(maxV * 0.5 / 100) * 100, Math.round(maxV / 100) * 100].filter((v, i, a) => a.indexOf(v) === i);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
      {gridVals.map(v => (
        <g key={v}>
          <line x1={PL} x2={W - PR} y1={yOf(v)} y2={yOf(v)} stroke={C.line} strokeWidth={0.5} strokeDasharray="3,3" />
          <text x={PL - 4} y={yOf(v) + 3} fontSize="8" fill={C.faint} textAnchor="end">{v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}</text>
        </g>
      ))}
      {minV < 0 && <line x1={PL} x2={W - PR} y1={yOf(0)} y2={yOf(0)} stroke={C.red} strokeWidth={1} opacity={0.4} />}
      {history.map((h, i) => {
        const barH = (h.prize / maxPrize) * plotH * 0.4;
        return <rect key={i} x={xOf(i) - barW / 2} y={PT + plotH - barH} width={barW} height={barH} fill={C.win + '55'} rx={2} />;
      })}
      <polyline points={history.map((h, i) => `${xOf(i)},${yOf(h.budgetAfter)}`).join(' ')} fill="none" stroke={C.gold} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {history.map((h, i) => (
        <g key={i}>
          <circle cx={xOf(i)} cy={yOf(h.budgetAfter)} r="3.5" fill={h.budgetAfter > 0 ? C.gold : C.red} />
          <text x={xOf(i)} y={H - 5} fontSize="8" fill={C.faint} textAnchor="middle">#{h.eventNum}</text>
        </g>
      ))}
      <text x={PL} y={PT - 3} fontSize="8" fill={C.faint}>budget ($K)</text>
    </svg>
  );
}

// ── Income vs Expenses: two stacked bars side by side ──
function CashflowBars({ fin }) {
  const segs = [
    { k: 'content', v: fin.income.content, c: '#9d7cff' },
    { k: 'merch',   v: fin.income.merch,   c: C.win },
    { k: 'stipend', v: fin.income.stipend, c: C.live },
    { k: 'streams', v: fin.income.streams, c: '#2ee6c8' },
    { k: 'sponsor', v: fin.income.sponsor, c: C.gold },
  ].filter(s => s.v > 0);
  const max = Math.max(fin.income.total, fin.expenses.total, 1);
  const BAR_H = 150;
  const Bar = ({ label, total, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <div style={{ height: BAR_H, width: 56, display: 'flex', flexDirection: 'column-reverse', borderRadius: 6, overflow: 'hidden', background: C.panel2, border: `1px solid ${C.line}` }}>
        {children}
      </div>
      <span style={{ fontFamily: mono, fontSize: 10, color: C.faint, letterSpacing: 1 }}>{label}</span>
      <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: total === fin.income.total ? C.win : C.red }}>{fmt(total)}</span>
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, justifyContent: 'center', padding: '4px 0' }}>
      <Bar label="INCOME" total={fin.income.total}>
        {segs.map(s => (
          <div key={s.k} title={`${INCOME_LABELS[s.k]}: ${fmt(s.v)}`}
               style={{ height: `${(s.v / max) * 100}%`, background: s.c, borderTop: `1px solid ${C.bg}` }} />
        ))}
      </Bar>
      {/* net arrow */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingBottom: 30 }}>
        <span style={{ fontFamily: mono, fontSize: 9, color: C.faint, letterSpacing: 1 }}>NET</span>
        <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 800, color: fin.net >= 0 ? C.win : C.red }}>
          {fin.net >= 0 ? '+' : ''}{fin.net}K
        </span>
        <span style={{ fontFamily: mono, fontSize: 10, color: fin.net >= 0 ? C.win : C.red }}>/mo</span>
      </div>
      <Bar label="EXPENSES" total={fin.expenses.total}>
        <div title={`Player salaries: ${fmt(fin.expenses.playerSalary)}`}
             style={{ height: `${(fin.expenses.playerSalary / max) * 100}%`, background: C.red, borderTop: `1px solid ${C.bg}` }} />
        {fin.expenses.coachSalary > 0 &&
          <div title={`Coach: ${fmt(fin.expenses.coachSalary)}`}
               style={{ height: `${(fin.expenses.coachSalary / max) * 100}%`, background: C.acc, borderTop: `1px solid ${C.bg}` }} />}
      </Bar>
    </div>
  );
}

function Row({ label, value, color, sub, pct, barColor }) {
  return (
    <div style={{ padding: '8px 0', borderTop: `1px solid ${C.line}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: C.ink, flex: 1 }}>{label}{sub && <span style={{ color: C.faint, fontFamily: mono, fontSize: 10, marginLeft: 6 }}>{sub}</span>}</span>
        <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color }}>{value}</span>
      </div>
      {pct != null && (
        <div style={{ height: 4, borderRadius: 2, background: C.panel2, marginTop: 5, overflow: 'hidden' }}>
          <div style={{ width: `${Math.max(2, pct)}%`, height: '100%', background: barColor }} />
        </div>
      )}
    </div>
  );
}

export function FinanceView({ season, myTeam }) {
  const fin = computeFinances(season, myTeam);
  const inDebt = season.budget < 0;
  const losing = fin.net < 0;
  // Runway label
  let runwayLabel, runwayColor;
  if (inDebt) { runwayLabel = 'IN DEBT'; runwayColor = C.red; }
  else if (!losing) { runwayLabel = 'Sustainable'; runwayColor = C.win; }
  else {
    const w = fin.runwayWeeks;
    runwayLabel = w <= 0 ? 'Broke now' : `${w}wk left`;
    runwayColor = w <= 4 ? C.red : w <= 12 ? C.gold : C.dim;
  }
  const incTotal = fin.income.total || 1;
  const incSegs = [
    { k: 'sponsor', c: C.gold }, { k: 'merch', c: C.win }, { k: 'stipend', c: C.live },
    { k: 'streams', c: '#2ee6c8' }, { k: 'content', c: '#9d7cff' },
  ];
  const activeSponsors = (season.sponsorships || []).filter(s => s.active);

  return (
    <div>
      {/* ── Top-line numbers ── */}
      <div style={{
        display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 18, padding: '16px 20px',
        background: inDebt ? 'rgba(255,76,76,.08)' : C.panel,
        border: `1px solid ${inDebt ? C.red : C.line}`, borderRadius: 12,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: mono, fontSize: 10, color: C.faint, letterSpacing: 1 }}>IN THE BANK</span>
          <span style={{ fontFamily: mono, fontSize: 30, fontWeight: 800, color: inDebt ? C.red : C.gold }}>{fmt(season.budget)}</span>
        </div>
        <div style={{ width: 1, background: C.line }} />
        <MiniStat label="RUN RATE / MO" value={`${fin.net >= 0 ? '+' : ''}${fin.net}K`} color={fin.net >= 0 ? C.win : C.red} />
        <MiniStat label="RUNWAY" value={runwayLabel} color={runwayColor} />
        <MiniStat label="MONTHLY IN" value={`${fin.income.total}K`} color={C.win} />
        <MiniStat label="MONTHLY OUT" value={`${fin.expenses.total}K`} color={C.red} />
        <MiniStat label="WORLD RANK" value={`#${fin.rank}`} color={C.live} />
      </div>

      {(inDebt || (losing && fin.runwayWeeks <= 8)) && (
        <div style={{ background: 'rgba(255,76,76,.1)', border: `1px solid ${C.red}`, borderRadius: 8, padding: '10px 16px', marginBottom: 18, fontFamily: mono, fontSize: 12, color: C.red }}>
          {inDebt
            ? '! Your organization is in debt. Win prize money or cut salaries to recover.'
            : `! Burning ${-fin.net}K/month — the bank runs dry in about ${fin.runwayWeeks} weeks. Secure a sponsor or shed salary.`}
        </div>
      )}

      {/* ── Cashflow chart ── */}
      <SL n="CF1" t="MONTHLY CASHFLOW" />
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
        <CashflowBars fin={fin} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 20 }}>
        {/* ── Income breakdown ── */}
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.acc, letterSpacing: 1.5, fontWeight: 700, marginBottom: 4 }}>INCOME · {fin.income.total}K/mo</div>
          {incSegs.map(s => {
            const v = fin.income[s.k];
            return <Row key={s.k} label={INCOME_LABELS[s.k]} value={`+${v}K`} color={v > 0 ? C.win : C.faint}
                        pct={(v / incTotal) * 100} barColor={s.c} />;
          })}
        </div>

        {/* ── Salary breakdown ── */}
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.acc, letterSpacing: 1.5, fontWeight: 700, marginBottom: 4 }}>PAYROLL · {fin.expenses.total}K/mo</div>
          {fin.expenses.players.map(p => (
            <Row key={p.name} label={p.name} sub={p.role} value={`-${p.salary}K`} color={C.red}
                 pct={(p.salary / (fin.expenses.total || 1)) * 100} barColor={C.red} />
          ))}
          {fin.expenses.coach
            ? <Row label={fin.expenses.coach.name} sub="coach" value={`-${fin.expenses.coachSalary}K`} color={C.acc}
                   pct={(fin.expenses.coachSalary / (fin.expenses.total || 1)) * 100} barColor={C.acc} />
            : <div style={{ padding: '8px 0', borderTop: `1px solid ${C.line}`, fontFamily: mono, fontSize: 11, color: C.faint }}>No coach hired</div>}
        </div>
      </div>

      {/* ── Active sponsorships ── */}
      <SL n="SPN" t="ACTIVE SPONSORSHIPS" />
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: '6px 18px 12px', marginBottom: 20 }}>
        {activeSponsors.length === 0
          ? <Empty text="No active sponsorships. Offers appear on the calendar as your ranking improves." />
          : activeSponsors.map((sp, i) => (
            <Row key={i} label={sp.brand}
                 sub={`${Math.ceil((sp.weeksLeft || 0) / 4)}mo left${sp.condition && sp.condition !== 'None' ? ' · ' + sp.condition : ''}`}
                 value={`+${sp.monthly}K/mo`} color={C.gold} />
          ))}
      </div>

      {/* ── Budget trend ── */}
      {season.history && season.history.length >= 2 && (
        <>
          <SL n="TRD" t="BANK BALANCE TREND" />
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: '14px 18px' }}>
            <BudgetChart history={season.history} />
            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontFamily: mono, fontSize: 9, color: C.faint }}>
              <span style={{ color: C.gold }}>— balance after event</span>
              <span style={{ color: C.win }}>▪ prize earned</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import React from 'react';
import { C, sans, mono, ACCENTS } from './theme.js';
import { computeFinances, INCOME_LABELS, brandTier } from '../engine/finance.js';
import { SL, MiniStat, Empty } from './primitives.jsx';
import { DEBT_GAMEOVER_THRESHOLD, DEBT_SUSTAINED_WEEKS, DEBT_WARNING_WEEKS } from '../constants/events.js';

const fmt = v => `${v < 0 ? "-" : ""}$${Math.abs(Math.round(v))}K`;

// ── Budget trend: bank balance after each event + prize bars ──
function BudgetChart({ history }) {
  if (!history || history.length < 2) return null;
  const W = 440, H = 170, PL = 46, PR = 16, PT = 16, PB = 28;
  const plotW = W - PL - PR, plotH = H - PT - PB;
  const n = history.length;
  const budgets = history.map(h => h.budgetAfter);
  const prizes = history.map(h => h.prize || 0);
  // Axis bounds: include 0, pad so the line never hugs the edges.
  let hi = Math.max(...budgets, 0), lo = Math.min(...budgets, 0);
  const pad = Math.max(40, (hi - lo) * 0.15);
  hi += pad;
  lo = lo < 0 ? lo - pad : 0;
  const range = hi - lo || 1;
  const xOf = i => n === 1 ? PL + plotW / 2 : PL + (i / (n - 1)) * plotW;
  const yOf = v => PT + (1 - (v - lo) / range) * plotH;
  const maxPrize = Math.max(...prizes, 1);
  const barW = Math.max(5, Math.min(20, (plotW / n) * 0.5));
  const fmtAxis = v => Math.abs(v) >= 1000 ? (v / 1000).toFixed(1) + 'k' : `${Math.round(v)}`;
  // 4 evenly-spaced gridlines instead of 3 — easier to interpolate an exact value.
  const gridVals = [hi, lo + range * 0.667, lo + range * 0.333, lo].filter((v, i, a) => a.indexOf(v) === i);
  const baseY = yOf(lo); // prize-bar baseline (plot bottom)
  // With many events the x-axis labels collide — thin them out to at most ~8, but
  // always keep the first and last so the timeline's start/end stay legible.
  const labelStep = Math.max(1, Math.ceil(n / 8));
  const showLabel = i => i === 0 || i === n - 1 || i % labelStep === 0;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
      <text x={PL} y={11} fontSize="9" fill={C.faint} fontFamily={mono}>$K</text>
      {gridVals.map((v, i) => (
        <g key={i}>
          <line x1={PL} x2={W - PR} y1={yOf(v)} y2={yOf(v)} stroke={C.line} strokeWidth={0.5} strokeDasharray="3,3" />
          <text x={PL - 6} y={yOf(v) + 3} fontSize="9" fill={C.faint} textAnchor="end" fontFamily={mono}>{fmtAxis(v)}</text>
        </g>
      ))}
      {lo < 0 && hi > 0 && <line x1={PL} x2={W - PR} y1={yOf(0)} y2={yOf(0)} stroke={C.red} strokeWidth={1} opacity={0.5} />}
      {/* Prize earned per event — bars rise from the baseline */}
      {history.map((h, i) => {
        if (!h.prize) return null;
        const barH = (h.prize / maxPrize) * plotH * 0.35;
        return (
          <rect key={i} x={xOf(i) - barW / 2} y={baseY - barH} width={barW} height={barH} fill={C.win + '66'} rx={2}>
            <title>{`Event #${h.eventNum}: +${h.prize}K prize`}</title>
          </rect>
        );
      })}
      <polyline points={history.map((h, i) => `${xOf(i)},${yOf(h.budgetAfter)}`).join(' ')} fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {history.map((h, i) => (
        <g key={i}>
          <circle cx={xOf(i)} cy={yOf(h.budgetAfter)} r="4" fill={h.budgetAfter >= 0 ? C.gold : C.red} stroke={C.panel} strokeWidth="1.5">
            <title>{`Event #${h.eventNum} — balance ${fmt(h.budgetAfter)}${h.prize ? `, prize +${h.prize}K` : ''}`}</title>
          </circle>
          {showLabel(i) && (
            <text x={xOf(i)} y={H - 8} fontSize="9" fill={C.faint} textAnchor="middle" fontFamily={mono}>#{h.eventNum}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ── Income vs Expenses: two stacked bars side by side ──
function CashflowBars({ fin }) {
  const segs = [
    { k: 'content', v: fin.income.content, c: ACCENTS[7] },
    { k: 'merch',   v: fin.income.merch,   c: C.win },
    { k: 'stipend', v: fin.income.stipend, c: C.live },
    { k: 'streams', v: fin.income.streams, c: ACCENTS[5] },
    { k: 'sponsor', v: fin.income.sponsor, c: C.gold },
  ].filter(s => s.v > 0);
  const max = Math.max(fin.income.total, fin.expenses.total, 1);
  const BAR_H = 150;
  const Bar = ({ label, total, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <div style={{ height: BAR_H, width: 56, display: 'flex', flexDirection: 'column-reverse', borderRadius: 6, overflow: 'hidden', background: C.panel2, border: `1px solid ${C.line}` }}>
        {children}
      </div>
      <span style={{ fontFamily: sans, fontSize: 10.5, fontWeight: 700, color: C.faint, letterSpacing: .7 }}>{label}</span>
      <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: total === fin.income.total ? C.win : C.red }}>{fmt(total)}</span>
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, justifyContent: 'center', padding: '4px 0' }}>
      <Bar label="Income" total={fin.income.total}>
        {segs.map(s => (
          <div key={s.k} title={`${INCOME_LABELS[s.k]}: ${fmt(s.v)}`}
               style={{ height: `${(s.v / max) * 100}%`, background: s.c, borderTop: `1px solid ${C.bg}` }} />
        ))}
      </Bar>
      {/* net arrow */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingBottom: 30 }}>
        <span style={{ fontFamily: sans, fontSize: 9.5, fontWeight: 700, color: C.faint, letterSpacing: .7 }}>Net</span>
        <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 800, color: fin.net >= 0 ? C.win : C.red }}>
          {fin.net >= 0 ? '+' : ''}{fin.net}K
        </span>
        <span style={{ fontFamily: mono, fontSize: 10, color: fin.net >= 0 ? C.win : C.red }}>/mo</span>
      </div>
      <Bar label="Expenses" total={fin.expenses.total}>
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
  if (inDebt) { runwayLabel = 'In debt'; runwayColor = C.red; }
  else if (!losing) { runwayLabel = 'Sustainable'; runwayColor = C.win; }
  else {
    const w = fin.runwayWeeks;
    runwayLabel = w <= 0 ? 'Broke now' : `${w}wk left`;
    runwayColor = w <= 4 ? C.red : w <= 12 ? C.gold : C.dim;
  }
  const incTotal = fin.income.total || 1;
  const incSegs = [
    { k: 'sponsor', c: C.gold }, { k: 'merch', c: C.win }, { k: 'stipend', c: C.live },
    { k: 'streams', c: ACCENTS[5] }, { k: 'content', c: ACCENTS[7] },
  ];
  const activeSponsors = (season.sponsorships || []).filter(s => s.active);

  return (
    <div>
      {/* ── Top-line numbers ── */}
      <div style={{
        display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 18, padding: '16px 20px',
        background: inDebt ? C.red + '14' : C.panel,
        border: `1px solid ${inDebt ? C.red : C.line}`, borderRadius: 12,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: sans, fontSize: 10.5, fontWeight: 700, color: C.faint, letterSpacing: .7 }}>In the bank</span>
          <span style={{ fontFamily: mono, fontSize: 30, fontWeight: 800, color: inDebt ? C.red : C.gold }}>{fmt(season.budget)}</span>
        </div>
        <div style={{ width: 1, background: C.line }} />
        <MiniStat label="RUN RATE / MO" value={`${fin.net >= 0 ? '+' : ''}${fin.net}K`} color={fin.net >= 0 ? C.win : C.red} />
        <MiniStat label="RUNWAY" value={runwayLabel} color={runwayColor} />
        <MiniStat label="MONTHLY IN" value={`${fin.income.total}K`} color={C.win} />
        <MiniStat label="MONTHLY OUT" value={`${fin.expenses.total}K`} color={C.red} />
        <MiniStat label="WORLD RANK" value={`#${fin.rank}`} color={C.live} />
        <MiniStat label="BRAND" value={brandTier(fin.brand).label} color={brandTier(fin.brand).color} />
      </div>

      {/* ── Brand value ── */}
      <SL n="BRD" t="BRAND VALUE" />
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: mono, fontSize: 26, fontWeight: 800, color: brandTier(fin.brand).color }}>{fin.brand}</span>
          <span style={{ fontFamily: mono, fontSize: 11, color: C.faint }}>/ 100</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: brandTier(fin.brand).color }}>{brandTier(fin.brand).label}</span>
          <span style={{ fontFamily: mono, fontSize: 10, color: C.faint, marginLeft: 'auto' }}>drives merch & sponsor offers</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: C.panel2, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ width: `${Math.min(100, fin.brand)}%`, height: '100%', background: brandTier(fin.brand).color, transition: 'width .3s ease' }} />
        </div>
        <div style={{ fontFamily: mono, fontSize: 10.5, color: C.dim, lineHeight: 1.5 }}>
          Built from ranking, trophies, roster star power and content investment. Higher brand means fatter merch revenue (now <span style={{ color: C.win }}>+{fin.income.merch}K/mo</span>) and bigger sponsorship cheques.
        </div>
      </div>

      {(inDebt || (losing && fin.runwayWeeks <= 8)) && (
        <div style={{ background: C.red + '1a', border: `1px solid ${C.red}`, borderRadius: 8, padding: '10px 16px', marginBottom: 18, fontFamily: mono, fontSize: 12, color: C.red }}>
          {inDebt
            ? (() => {
                const weeks = season.debtWeeks || 0;
                const weeksLeft = Math.max(0, DEBT_SUSTAINED_WEEKS - weeks);
                return `! Bankruptcy risk: in debt for ${weeks} week${weeks === 1 ? '' : 's'} (folds at ${DEBT_SUSTAINED_WEEKS}, or instantly below $${Math.abs(DEBT_GAMEOVER_THRESHOLD)}K). ${weeks >= DEBT_WARNING_WEEKS ? 'The board is watching closely.' : `${weeksLeft} weeks of runway before the board intervenes.`}`;
              })()
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
          <div style={{ fontFamily: mono, fontSize: 11, color: C.acc, letterSpacing: 1.5, fontWeight: 700, marginBottom: 4 }}>Income · {fin.income.total}K/mo</div>
          {incSegs.map(s => {
            const v = fin.income[s.k];
            return <Row key={s.k} label={INCOME_LABELS[s.k]} value={`+${v}K`} color={v > 0 ? C.win : C.faint}
                        pct={(v / incTotal) * 100} barColor={s.c} />;
          })}
        </div>

        {/* ── Salary breakdown ── */}
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.acc, letterSpacing: 1.5, fontWeight: 700, marginBottom: 4 }}>Payroll · {fin.expenses.total}K/mo</div>
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

      {/* ── Merch store breakdown ── */}
      <SL n="MRC" t="MERCH STORE" />
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: '6px 18px 12px', marginBottom: 20 }}>
        {(fin.merchLines || []).map(item => (
          <Row key={item.key} label={item.label} value={`+${item.value}K`} color={C.win}
               pct={(item.value / (fin.income.merch || 1)) * 100} barColor={item.key === 'champDrop' ? C.gold : C.acc} />
        ))}
      </div>

      {/* ── Active sponsorships ── */}
      <SL n="SPN" t="ACTIVE SPONSORSHIPS" />
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: '6px 18px 12px', marginBottom: 20 }}>
        {activeSponsors.length === 0
          ? <Empty text="No active sponsorships. Offers appear on the calendar as your ranking improves." />
          : activeSponsors.map((sp, i) => {
              const hasCondition = sp.condition && sp.condition !== 'None';
              // checkRank is an ongoing gate (enforced weekly, void-on-break — see
              // advanceWeek), not a one-time goal, so it doesn't get a ✓/pending badge.
              const isOneTimeGoal = hasCondition && (sp.checkWin || sp.checkMajor);
              const conditionTag = !hasCondition
                ? ''
                : isOneTimeGoal
                  ? sp.achieved ? ' · ✓ ' + sp.condition : ' · ' + sp.condition + ' (pending)'
                  : ' · ' + sp.condition;
              return (
                <Row key={i} label={sp.brand}
                     sub={`${Math.ceil((sp.weeksLeft || 0) / 4)}mo left${conditionTag}`}
                     value={`+${sp.monthly}K/mo`} color={isOneTimeGoal && !sp.achieved ? C.live : C.gold} />
              );
            })}
      </div>

      {/* ── Budget trend ── */}
      {season.history && season.history.length >= 2 && (
        <>
          <SL n="TRD" t="BANK BALANCE TREND" />
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: '14px 18px' }}>
            <BudgetChart history={season.history} />
            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontFamily: mono, fontSize: 9, color: C.faint }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: C.gold }} />balance after event</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: C.win }} />prize earned</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

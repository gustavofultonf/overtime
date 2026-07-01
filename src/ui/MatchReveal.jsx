import React, { useState, useEffect, useRef } from 'react';
import { C, sans, mono } from './theme.js';
import { Overlay, TeamCrest } from './primitives.jsx';
import { resolveMap } from '../engine/match.js';

// ── Helpers ──────────────────────────────────────────────────────────

function computeMomentum(rounds, myTeam) {
  let mom = 50;
  return rounds.map(rd => {
    mom = mom * 0.80 + (rd.winner === myTeam ? 80 : 20) * 0.20;
    return mom;
  });
}

function ScoreGraph({ rounds, tA, tB, myTeam }) {
  if (!rounds || rounds.length === 0) return null;
  const W = 340, H = 110, PL = 24, PR = 50, PT = 12, PB = 22;
  const plotW = W - PL - PR, plotH = H - PT - PB;
  const total = rounds.length;
  const last = rounds[total - 1];
  const maxR = Math.max(24, total);
  const maxScore = Math.max(13, last.scoreA, last.scoreB) + 0.5;
  const xOf = r => PL + (r / maxR) * plotW;
  const yOf = s => PT + (1 - s / maxScore) * plotH;
  const colA = tA === myTeam ? C.win : C.red;
  const colB = tB === myTeam ? C.win : C.red;
  const ptsA = [`${xOf(0)},${yOf(0)}`, ...rounds.map((rd, i) => `${xOf(i + 1)},${yOf(rd.scoreA)}`)].join(' ');
  const ptsB = [`${xOf(0)},${yOf(0)}`, ...rounds.map((rd, i) => `${xOf(i + 1)},${yOf(rd.scoreB)}`)].join(' ');
  const keyRds = rounds.filter(rd => rd.isAce || rd.isClutch || rd.isEcoUpset);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
      {[0, 5, 10, 13].map(s => (
        <g key={s}>
          <line x1={PL} x2={W - PR} y1={yOf(s)} y2={yOf(s)} stroke={C.line} strokeWidth={s === 13 ? 1 : 0.5} strokeDasharray={s > 0 ? '3,3' : 'none'} opacity={s === 13 ? 0.7 : 0.4} />
          <text x={PL - 3} y={yOf(s) + 3} fontSize="7" fill={s === 13 ? C.gold : C.faint} textAnchor="end">{s}</text>
        </g>
      ))}
      <line x1={xOf(12)} x2={xOf(12)} y1={PT} y2={PT + plotH} stroke={C.gold} strokeWidth={0.8} strokeDasharray="2,3" opacity={0.5} />
      <text x={xOf(12)} y={H - 4} fontSize="7" fill={C.gold + 'aa'} textAnchor="middle">HT</text>
      {total > 24 && <>
        <line x1={xOf(24)} x2={xOf(24)} y1={PT} y2={PT + plotH} stroke={C.gold} strokeWidth={1} strokeDasharray="2,3" opacity={0.8} />
        <text x={xOf(24)} y={H - 4} fontSize="7" fill={C.gold} textAnchor="middle">OT</text>
      </>}
      {[5, 10, 15, 20, 24].filter(r => r <= maxR).map(r => (
        <text key={r} x={xOf(r)} y={H - 4} fontSize="6.5" fill={C.faint + '88'} textAnchor="middle">{r}</text>
      ))}
      <polyline points={ptsA} fill="none" stroke={colA} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={ptsB} fill="none" stroke={colB} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      {keyRds.map((rd, i) => {
        const col = rd.isAce ? C.gold : rd.isClutch ? C.win : C.acc;
        const winIsA = rd.winner === tA;
        const [cx, cy] = [xOf(rd.round), yOf(winIsA ? rd.scoreA : rd.scoreB)];
        return <circle key={i} cx={cx} cy={cy} r={3.5} fill={col} opacity={0.9} />;
      })}
      <circle cx={xOf(total)} cy={yOf(last.scoreA)} r={4} fill={colA} />
      <circle cx={xOf(total)} cy={yOf(last.scoreB)} r={4} fill={colB} />
      <text x={W - PR + 6} y={yOf(last.scoreA) + 4} fontSize="12" fontWeight="700" fill={colA}>{last.scoreA}</text>
      <text x={W - PR + 6} y={yOf(last.scoreB) + 4} fontSize="12" fontWeight="700" fill={colB}>{last.scoreB}</text>
      <text x={W - PR + 6} y={yOf(last.scoreA) - 7} fontSize="7" fill={colA + 'cc'}>{tA.slice(0, 5)}</text>
      <text x={W - PR + 6} y={yOf(last.scoreB) - 7} fontSize="7" fill={colB + 'cc'}>{tB.slice(0, 5)}</text>
    </svg>
  );
}

function MomentumBar({ momentum, myTeam }) {
  if (!momentum || momentum.length === 0) return null;
  const cur = momentum[momentum.length - 1];
  // cur is 0-100, 50 = neutral
  const pct = Math.round(cur);
  const myColor = C.win;
  const oppColor = C.red;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 9, color: C.faint, marginBottom: 3 }}>
        <span style={{ color: myColor }}>▲ {myTeam}</span>
        <span style={{ fontSize: 9, color: C.dim }}>MOMENTUM</span>
        <span style={{ color: oppColor }}>OPP ▲</span>
      </div>
      <div style={{ position: 'relative', height: 8, background: C.panel2, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: pct + '%',
          background: pct > 55 ? myColor : pct < 45 ? oppColor : C.gold,
          borderRadius: 4,
          transition: 'width 0.3s ease',
        }} />
        {/* Center line */}
        <div style={{ position: 'absolute', left: '50%', top: 0, width: 1, height: '100%', background: C.gold + 'aa' }} />
      </div>
    </div>
  );
}

// ── Round-by-round history (HLTV-style icon strip) ───────────────────
// Orange = round won on the T side, blue = won on the CT side. Icon shape
// tells you how it ended: kills (skull), bomb detonation, defuse, or time.
const SIDE_COL = { T: '#f0883e', CT: '#5aa9e6' };

function RoundIcon({ method, color, size = 13 }) {
  const fill = { fill: color };
  if (method === 'bomb') return (
    <svg width={size} height={size} viewBox="0 0 24 24"><path {...fill} d="M12 1.5l2.2 5.6 5.8-1.6-3.9 4.6 4.4 3.4-5.9.4L12 22.5l-2.6-8.6-5.9-.4 4.4-3.4-3.9-4.6 5.8 1.6z" /></svg>
  );
  if (method === 'defuse') return (
    <svg width={size} height={size} viewBox="0 0 24 24"><path {...fill} d="M5 9a3 3 0 015.8-1.1h2.4A3 3 0 1116 13.9V20a1 1 0 01-1 1h-1v-3h-1v3h-2v-3H9v3H8a1 1 0 01-1-1v-6.1A3 3 0 015 9zm3-1.2A1.2 1.2 0 109.2 9 1.2 1.2 0 008 7.8zm5 0A1.2 1.2 0 1014.2 9 1.2 1.2 0 0013 7.8z" /></svg>
  );
  if (method === 'time') return (
    <svg width={size} height={size} viewBox="0 0 24 24"><g fill="none" stroke={color} strokeWidth="2.2"><circle cx="12" cy="12" r="8" /><path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" /></g></svg>
  );
  // elim → skull
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"><path {...fill} d="M12 2a8 8 0 00-8 8v3.2c0 .9.5 1.7 1.3 2.1l1.2.6V19a1 1 0 001 1h.5v-2h1.5v2h1v-2h1.5v2h.5a1 1 0 001-1v-3.1l1.2-.6c.8-.4 1.3-1.2 1.3-2.1V10a8 8 0 00-8-8zM8.7 10.4a1.7 1.7 0 110 3.4 1.7 1.7 0 010-3.4zm6.6 0a1.7 1.7 0 110 3.4 1.7 1.7 0 010-3.4zM11 16h2l-1 2z" /></svg>
  );
}

function RoundHistory({ rounds, tA, tB, myTeam, mapDone }) {
  const last = rounds[rounds.length - 1];
  const scA = last?.scoreA ?? 0, scB = last?.scoreB ?? 0;
  const Row = ({ team, score, oppScore }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 50, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        <TeamCrest name={team} size={16} />
        <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: team === myTeam ? C.acc : C.dim }}>{team.slice(0, 3).toUpperCase()}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {rounds.map((rd, i) => {
          const prev = i > 0 ? rounds[i - 1] : null;
          const half = prev && prev.side !== rd.side && rd.round <= 24;
          const ot = prev && prev.scoreA === 12 && prev.scoreB === 12;
          const won = rd.winner === team;
          const col = SIDE_COL[rd.winSide] || C.dim;
          const pistol = rd.round === 1 || rd.round === 13;
          return (
            <React.Fragment key={i}>
              {(half || ot) && <div style={{ width: 2, height: 17, background: ot ? C.gold : C.line, margin: '0 3px', borderRadius: 1 }} />}
              <div title={won ? `R${rd.round}: ${rd.winSide} ${rd.winMethod}` : `R${rd.round}`} style={{
                width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 3, background: won ? col + '22' : 'transparent',
                boxShadow: won && pistol ? `inset 0 0 0 1px ${col}99` : 'none',
                animation: won ? 'popIn .28s ease both' : undefined,
              }}>
                {won
                  ? <RoundIcon method={rd.winMethod} color={col} />
                  : <span style={{ width: 3, height: 3, borderRadius: '50%', background: C.line }} />}
              </div>
            </React.Fragment>
          );
        })}
        {!mapDone && <div style={{ width: 17, height: 17, marginLeft: 1, borderRadius: 3, border: `1px dashed ${C.line}`, opacity: 0.5 }} />}
      </div>
      <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 800, color: score > oppScore ? C.ink : C.faint, marginLeft: 6, minWidth: 16, textAlign: 'right' }}>{score}</span>
    </div>
  );
  return (
    <div style={{ alignSelf: 'stretch', width: '100%' }}>
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 5, minWidth: '100%' }}>
          <Row team={tA} score={scA} oppScore={scB} />
          <Row team={tB} score={scB} oppScore={scA} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 13, justifyContent: 'center', marginTop: 9, flexWrap: 'wrap', fontFamily: mono, fontSize: 8.5, color: C.faint }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: SIDE_COL.T }} />T-SIDE</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: SIDE_COL.CT }} />CT-SIDE</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><RoundIcon method="elim" color={C.dim} size={11} />KILLS</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><RoundIcon method="bomb" color={C.dim} size={11} />BOMB</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><RoundIcon method="defuse" color={C.dim} size={11} />DEFUSE</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><RoundIcon method="time" color={C.dim} size={11} />TIME</span>
      </div>
    </div>
  );
}

// ── Half-time decisions ──────────────────────────────────────────────
// Each option trades a strength swing against a real cost: lingering tilt,
// squad fatigue/morale, or a thinner economy going into the next stretch.
// fx fields: str (flat) | gamble:[hi,lo,prob]; clearTilt; tilt; money;
// fatigue (season); morale (season).
//
// The options themselves — and their pro/con copy — react to the actual
// state of the match at halftime (score margin, current tilt, banked money,
// squad fatigue) instead of always showing the same generic numbers, so the
// call you're making reads differently when you're down big vs. cruising.
function halftimeOptions(ctx) {
  const { tilt, money, scoreDiff, avgFatigue } = ctx;
  const down = scoreDiff <= -3;
  const tilted = tilt > 0;
  const flushEco = money >= 3000;
  const wired = avgFatigue >= 60;

  const fireStr = down ? 8 : 7;
  const calmStr = tilted ? 3 : 2;
  const ecoGain = flushEco ? 1500 : 4500;

  return [
    { label: 'Tactical Reset', color: '#a78bfa',
      pro: 'Fresh strats — steady +4 strength for the half',
      con: 'Safe, but no big surge',
      fx: { str: 4, clearTilt: true } },
    { label: 'Fire Them Up', color: C.acc,
      pro: `Adrenaline surge — big +${fireStr} strength${down ? ' (down big — worth the risk)' : ''}`,
      con: `Players tire (+fatigue) and start on edge — losses snowball${wired ? ' (squad already gassed!)' : ''}`,
      fx: { str: fireStr, tilt: 2, fatigue: 6 } },
    { label: 'Stay Calm', color: C.win,
      pro: tilted ? `Wipes ${tilt} tilt, steadies nerves (+morale), +${calmStr} strength` : `Steadies nerves (+morale), +${calmStr} strength — no tilt to shake off right now`,
      con: 'Only a small tactical bump',
      fx: { str: calmStr, clearTilt: true, morale: 4 } },
    { label: 'Default Buys', color: C.gold,
      pro: flushEco ? `Top off the bank (+$${ecoGain}) — already sitting on $${money}, so this mostly just clears heads` : `Rebuild the bank (+$${ecoGain}) — start the half flush for better buys`,
      con: 'Passive opening — only +1 strength',
      fx: { str: 1, money: money + ecoGain, clearTilt: true } },
    { label: 'All-In Gamble', color: C.red,
      pro: `Swing for it — +10 strength if the read lands${down ? ' (you need this)' : ''}`,
      con: 'Boom-or-bust (~55%) and dents squad morale either way',
      fx: { gamble: [10, -1, 0.55], morale: -4 } },
  ];
}
function resolveStr(fx, rng) {
  if (fx.gamble) { const [hi, lo, prob] = fx.gamble; return rng() < prob ? hi : lo; }
  return fx.str || 0;
}
function effectDesc(fx, strVal) {
  const parts = [fx.gamble ? `${strVal > 0 ? 'gamble landed +' + strVal : 'gamble flopped ' + strVal} str` : `${strVal >= 0 ? '+' : ''}${strVal} str`];
  if (fx.clearTilt) parts.push('tilt cleared');
  if (fx.tilt) parts.push('starts tilted');
  if (fx.money) parts.push('eco shift');
  if (fx.fatigue) parts.push('+fatigue');
  if (fx.morale) parts.push(`${fx.morale > 0 ? '+' : '−'}morale`);
  return parts.join(' · ');
}
function ChoiceButton({ opt, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: C.panel, border: `1px solid ${opt.color}55`, borderLeft: `3px solid ${opt.color}`,
      borderRadius: 9, padding: '11px 14px', textAlign: 'left', cursor: 'pointer',
    }}>
      <div style={{ fontWeight: 800, fontSize: 14, color: opt.color, marginBottom: 5 }}>{opt.label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontFamily: mono, fontSize: 10.5, color: C.win, display: 'flex', gap: 7, lineHeight: 1.3 }}><span style={{ fontWeight: 800, flexShrink: 0 }}>PRO</span><span style={{ color: C.dim }}>{opt.pro}</span></div>
        <div style={{ fontFamily: mono, fontSize: 10.5, color: C.red, display: 'flex', gap: 7, lineHeight: 1.3 }}><span style={{ fontWeight: 800, flexShrink: 0 }}>CON</span><span style={{ color: C.dim }}>{opt.con}</span></div>
      </div>
    </button>
  );
}

// ── Main component ───────────────────────────────────────────────────

export function MatchReveal({ reveal, myTeam, t, onDone }) {
  const { res } = reveal;
  const [mapIdx, setMapIdx] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [speed, setSpeed] = useState(350);

  // Interactive state
  const [halftimeDone, setHalftimeDone] = useState(false);
  const [showHalftime, setShowHalftime] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(null);
  const [paused, setPaused] = useState(false);

  // Visual feedback state
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [flashTeam, setFlashTeam] = useState(null);
  const [tickerView, setTickerView] = useState('rounds'); // 'rounds' | 'graph'

  // mp is a ref to the *current* map result — mutated by re-sims in place
  const mpRef = useRef(null);
  mpRef.current = res.maps[mapIdx];
  const mp = mpRef.current;

  const tA = mp?.teamA || res.winnerName;
  const tB = mp?.teamB || res.loserName;
  const isMyMap = tA === myTeam || tB === myTeam;
  const myTeamInMap = tA === myTeam ? tA : tB === myTeam ? tB : null;
  const oppTeam = myTeamInMap === tA ? tB : tA;

  // Reset interactive state when map changes
  useEffect(() => {
    setHalftimeDone(false);
    setShowHalftime(false);
    setLastInteraction(null);
    setPaused(false);
    setTickerView('rounds');
  }, [mapIdx]);

  // Auto-advance rounds
  useEffect(() => {
    if (done || !mp || paused || showHalftime) return;
    if (roundIdx >= mp.rounds.length) {
      const timer = setTimeout(() => {
        if (mapIdx < res.maps.length - 1) { setMapIdx(i => i + 1); setRoundIdx(0); }
        else setDone(true);
      }, 1200);
      return () => clearTimeout(timer);
    }

    // Halftime pause (round 12 done → round 13 about to start)
    if (roundIdx === 12 && !halftimeDone && t && isMyMap) {
      setShowHalftime(true);
      setPaused(true);
      return;
    }

    const timer = setTimeout(() => setRoundIdx(i => i + 1), speed);
    return () => clearTimeout(timer);
  }, [roundIdx, mapIdx, done, mp, speed, paused, showHalftime, halftimeDone, t, isMyMap, myTeamInMap]);

  // Toast: trigger on notable rounds
  useEffect(() => {
    if (roundIdx < 1 || !mp) return;
    const rd = mp.rounds[roundIdx - 1];
    if (!rd) return;
    let t = null;
    if (rd.isAce)      t = { label: 'ACE',        sub: rd.narrative, color: C.gold };
    else if (rd.isClutch)    t = { label: 'CLUTCH',     sub: rd.narrative, color: C.win };
    else if (rd.isEcoUpset) t = { label: 'ECO UPSET',  sub: rd.narrative, color: C.acc };
    if (t) {
      setToast(t); setToastVisible(true);
      const timer = setTimeout(() => setToastVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [roundIdx, mp]);

  // Flash: briefly highlight the team that just scored
  useEffect(() => {
    if (roundIdx < 1 || !mp) return;
    const rd = mp.rounds[roundIdx - 1];
    if (!rd) return;
    setFlashTeam(rd.winner);
    const timer = setTimeout(() => setFlashTeam(null), 500);
    return () => clearTimeout(timer);
  }, [roundIdx, mp]);

  const visibleRounds = mp ? mp.rounds.slice(0, roundIdx) : [];
  const curScore = visibleRounds.length > 0 ? visibleRounds[visibleRounds.length - 1] : { scoreA: 0, scoreB: 0 };
  const mapDone = roundIdx >= (mp?.rounds?.length || 0);
  const momentum = computeMomentum(visibleRounds, myTeamInMap || myTeam);
  const inOT = visibleRounds.length > 0 && visibleRounds[visibleRounds.length - 1].round > 24;
  const matchPoint = !mapDone && !inOT && (
    (curScore.scoreA === 12 && curScore.scoreB < 12) ||
    (curScore.scoreB === 12 && curScore.scoreA < 12)
  );
  const myMatchPoint = matchPoint && (
    (curScore.scoreA === 12 && tA === myTeamInMap) ||
    (curScore.scoreB === 12 && tB === myTeamInMap)
  );

  // Apply lasting (season-long) fatigue/morale costs to my squad.
  function applySquadCost(fx) {
    if (!fx.fatigue && !fx.morale) return;
    t.simState.players.filter(p => p.team === myTeamInMap).forEach(p => {
      if (fx.fatigue) p.fatigue = Math.min(100, (p.fatigue || 0) + fx.fatigue);
      if (fx.morale) p.morale = Math.min(100, Math.max(0, (p.morale ?? 60) + fx.morale));
    });
  }

  function squadAvgFatigue() {
    if (!t) return 0;
    const roster = t.simState.players.filter(p => p.team === myTeamInMap);
    if (!roster.length) return 0;
    return roster.reduce((s, p) => s + (p.fatigue || 0), 0) / roster.length;
  }

  function halftimeCtx(lastRd, isA) {
    const tilt = isA ? lastRd.tiltA : lastRd.tiltB;
    const money = isA ? lastRd.moneyA : lastRd.moneyB;
    const myScore = isA ? lastRd.scoreA : lastRd.scoreB;
    const oppScore = isA ? lastRd.scoreB : lastRd.scoreA;
    return { tilt, money, scoreDiff: myScore - oppScore, avgFatigue: squadAvgFatigue() };
  }

  function finalizeMapFrom(slice, fromRounds) {
    mp.rounds = mp.rounds.slice(0, slice).concat(fromRounds);
    const fA = mp.rounds[mp.rounds.length - 1]?.scoreA || 0;
    const fB = mp.rounds[mp.rounds.length - 1]?.scoreB || 0;
    mp.score = fA > fB ? [fA, fB] : [fB, fA];
    mp.winnerName = fA > fB ? tA : tB;
    mp.loserName = fA > fB ? tB : tA;
  }

  // ── Interactive: halftime team talk ─────────────────────────────────
  function applyHalftimeChoice(choiceIdx) {
    if (!t || !mp) return;
    const lastRd = mp.rounds[11]; // round 12 data (0-indexed)
    if (!lastRd) return;
    const isA = tA === myTeamInMap;
    const opts = halftimeOptions(halftimeCtx(lastRd, isA));
    const opt = opts[choiceIdx]; const fx = opt.fx;
    const strVal = resolveStr(fx, t.rng);
    const myTilt = fx.clearTilt ? 0 : (fx.tilt ?? (isA ? lastRd.tiltA : lastRd.tiltB));
    const myMoney = fx.money ?? 800;

    const startFrom = {
      scoreA: lastRd.scoreA, scoreB: lastRd.scoreB,
      moneyA: isA ? myMoney : 800, moneyB: isA ? 800 : myMoney,
      lossStreakA: 0, lossStreakB: 0,
      tiltA: isA ? myTilt : (fx.clearTilt ? 0 : lastRd.tiltA),
      tiltB: isA ? (fx.clearTilt ? 0 : lastRd.tiltB) : myTilt,
      side: 1, startRound: 12,
      strModA: isA ? strVal : 0, strModB: isA ? 0 : strVal,
    };

    applySquadCost(fx);
    const newHalf = resolveMap(t.simState, mp.map, tA, tB, { stage: 'group' }, t.rng, startFrom);
    finalizeMapFrom(12, newHalf.rounds);

    // Concrete payoff, not just the strength swing: how many of the second-half
    // rounds you actually won, plus an explicit landed/missed call for gambles —
    // so the choice reads as having actually worked or not, not just a number.
    const won = newHalf.rounds.filter(r => r.winner === myTeamInMap).length;
    const lost = newHalf.rounds.length - won;
    const gambleOutcome = fx.gamble ? (strVal > 0 ? 'landed' : 'missed') : null;
    setLastInteraction({ type: 'halftime', choice: opt.label, desc: effectDesc(fx, strVal), secondHalf: { won, lost }, gambleOutcome });
    setHalftimeDone(true);
    setShowHalftime(false);
    setPaused(false);
  }

  // ── Notable round filter ────────────────────────────────────────────
  function isNotable(rd, idx, rounds) {
    if (rd.isClutch || rd.isEcoUpset || rd.isAce) return true;
    if (rd.round === 1) return true;
    if (rd.round > 24) return true;  // all OT rounds are notable
    if (idx > 0 && rounds[idx - 1]?.side !== rd.side) return true;
    if (rd.scoreA === 12 || rd.scoreB === 12) return true;
    if (Math.abs(rd.scoreA - rd.scoreB) <= 1 && rd.scoreA >= 8) return true;
    return false;
  }

  // ── Halftime panel ──────────────────────────────────────────────────
  if (showHalftime) {
    const scH = curScore;
    const myScore = myTeamInMap === tA ? scH.scoreA : scH.scoreB;
    const oppScore = myTeamInMap === tA ? scH.scoreB : scH.scoreA;
    const winning = myScore > oppScore;
    const haOpts = halftimeOptions(halftimeCtx(mp.rounds[11], tA === myTeamInMap));
    return (
      <Overlay onClose={() => { setHalftimeDone(true); setShowHalftime(false); setPaused(false); }}
        title={`HALF-TIME · ${mp.map} · ${myScore}–${oppScore}`} wide>
        <div style={{ background: 'rgba(80,60,180,0.15)', border: '1px solid #7c3aed', borderRadius: 10, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontFamily: mono, fontSize: 13, color: '#a78bfa', marginBottom: 6, letterSpacing: 1 }}>
            HALF-TIME TEAM TALK
          </div>
          <div style={{ color: C.ink, fontSize: 14, marginBottom: 2 }}>
            {winning
              ? `${myScore}–${oppScore} up. Hold the lead — second half starts now.`
              : myScore === oppScore
                ? `Level at ${myScore}–${oppScore}. Everything to play for.`
                : `${myScore}–${oppScore} down. Time to flip the script.`}
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.faint }}>
            Choose your approach for the second half:
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {haOpts.map((opt, i) => (
            <ChoiceButton key={i} opt={opt} onClick={() => applyHalftimeChoice(i)} />
          ))}
        </div>
        <div style={{ marginTop: 12, fontFamily: mono, fontSize: 10, color: C.faint, textAlign: 'center' }}>
          The second half is re-simulated with your call — pros and cons included.
        </div>
      </Overlay>
    );
  }

  // ── Main reveal view ────────────────────────────────────────────────
  return (
    <Overlay onClose={onDone} title={`${res.bo >= 3 ? 'BO' + res.bo + ' · ' : ''}${tA} vs ${tB}`} wide>
      {/* Series map tabs for Bo3/Bo5 */}
      {res.bo >= 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
          {res.maps.map((m, mi) => {
            const played = mi < mapIdx || (mi === mapIdx && mapDone);
            return (
              <div key={mi} style={{ fontFamily: mono, fontSize: 11, color: mi === mapIdx ? C.acc : played ? C.dim : C.faint, textAlign: 'center' }}>
                <div>{m.map}</div>
                {played && <div style={{ fontWeight: 700, fontSize: 14, color: m.winnerName === myTeam ? C.win : C.red }}>{m.score.join('-')}</div>}
                {!played && mi > mapIdx && <div style={{ color: C.faint }}>—</div>}
              </div>
            );
          })}
        </div>
      )}

      {mp && (<>
        {/* Map label */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: mono, fontSize: 12, color: C.gold, letterSpacing: 2 }}>{mp.map}</span>
          {res.bo >= 3 && <span style={{ fontFamily: mono, fontSize: 10, color: C.faint, marginLeft: 8 }}>MAP {mapIdx + 1}</span>}
        </div>

        {/* Scoreboard */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 4, padding: '14px 0 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: tA === myTeam ? C.acc : C.ink }}>{tA}</div>
            <TeamCrest name={tA} size={34} />
          </div>
          <div style={{ fontFamily: mono, fontWeight: 800, fontSize: 42, minWidth: 100, textAlign: 'center', letterSpacing: 4 }}>
            <span key={'a' + curScore.scoreA} style={{ display: 'inline-block', color: flashTeam === tA ? C.gold : C.ink, transition: 'color 0.25s ease', animation: 'scorePop .4s ease' }}>{curScore.scoreA}</span>
            <span style={{ color: C.faint, fontSize: 24 }}> : </span>
            <span key={'b' + curScore.scoreB} style={{ display: 'inline-block', color: flashTeam === tB ? C.gold : C.ink, transition: 'color 0.25s ease', animation: 'scorePop .4s ease' }}>{curScore.scoreB}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 10, flex: 1 }}>
            <TeamCrest name={tB} size={34} />
            <div style={{ fontWeight: 800, fontSize: 18, color: tB === myTeam ? C.acc : C.ink }}>{tB}</div>
          </div>
        </div>
        {/* Score split bar */}
        {(() => {
          const total = curScore.scoreA + curScore.scoreB;
          const pct = total > 0 ? (curScore.scoreA / total) * 100 : 50;
          const colA = tA === myTeam ? C.win : C.red;
          const colB = tB === myTeam ? C.win : C.red;
          return (
            <div style={{ height: 5, borderRadius: 3, overflow: 'hidden', marginBottom: 12, display: 'flex', background: C.panel2 }}>
              <div style={{ width: pct + '%', background: colA, transition: 'width 0.4s ease', borderRadius: '3px 0 0 3px' }} />
              <div style={{ flex: 1, background: colB, borderRadius: '0 3px 3px 0' }} />
            </div>
          );
        })()}

        {/* Event toast */}
        {toast && (
          <div style={{
            opacity: toastVisible ? 1 : 0,
            transition: 'opacity 0.35s ease',
            background: `${toast.color}22`,
            border: `2px solid ${toast.color}`,
            borderRadius: 10, padding: '10px 18px', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 12,
            pointerEvents: 'none',
          }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: toast.color, boxShadow: `0 0 10px ${toast.color}`, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: mono, fontWeight: 800, fontSize: 15, color: toast.color, letterSpacing: 2 }}>{toast.label}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.dim, marginTop: 2 }}>{toast.sub}</div>
            </div>
          </div>
        )}

        {/* OT / match point banners */}
        {inOT && (
          <div style={{
            textAlign: 'center', marginBottom: 10,
            fontFamily: mono, fontSize: 13, fontWeight: 800,
            color: C.gold, letterSpacing: 3,
            background: `${C.gold}18`,
            border: `1px solid ${C.gold}66`,
            borderRadius: 6, padding: '6px 16px',
          }}>
            OVERTIME
          </div>
        )}
        {matchPoint && (
          <div style={{
            textAlign: 'center', marginBottom: 10,
            fontFamily: mono, fontSize: 11, fontWeight: 700,
            color: myMatchPoint ? C.win : C.red, letterSpacing: 2,
            background: myMatchPoint ? `${C.win}15` : `${C.red}15`,
            border: `1px solid ${myMatchPoint ? C.win : C.red}55`,
            borderRadius: 6, padding: '5px 14px',
          }}>
            {myMatchPoint ? '▲ MATCH POINT' : '▼ MATCH POINT'}
          </div>
        )}

        {/* Momentum bar */}
        {isMyMap && <MomentumBar momentum={momentum} myTeam={myTeamInMap} />}

        {/* Last interaction badge */}
        {lastInteraction && (
          <div style={{
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid #7c3aed',
            borderRadius: 6, padding: '6px 12px', marginBottom: 8,
            fontFamily: mono, fontSize: 10,
            color: '#a78bfa',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <span style={{ fontWeight: 700 }}>HALF-TIME</span>
            <span style={{ color: C.dim }}>"{lastInteraction.choice}"</span>
            <span style={{ color: C.faint }}>— {lastInteraction.desc}</span>
            {lastInteraction.gambleOutcome && (
              <span style={{ color: lastInteraction.gambleOutcome === 'landed' ? C.win : C.red, fontWeight: 700 }}>
                {lastInteraction.gambleOutcome === 'landed' ? 'GAMBLE LANDED' : 'GAMBLE MISSED'}
              </span>
            )}
            {lastInteraction.secondHalf && (
              <span style={{ color: lastInteraction.secondHalf.won >= lastInteraction.secondHalf.lost ? C.win : C.red, marginLeft: 'auto' }}>
                2nd half: {lastInteraction.secondHalf.won}-{lastInteraction.secondHalf.lost}
              </span>
            )}
          </div>
        )}

        {/* Economy + round ticker / score graph */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', marginBottom: 10 }}>
          {/* Tab row */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, alignSelf: 'stretch', justifyContent: 'center' }}>
            {[['rounds', 'ROUNDS'], ['graph', 'SCORE GRAPH']].map(([v, label]) => (
              <button key={v} onClick={() => setTickerView(v)} style={{
                fontFamily: mono, fontSize: 9, letterSpacing: 1, fontWeight: tickerView === v ? 700 : 400,
                color: tickerView === v ? C.acc : C.faint,
                background: tickerView === v ? C.acc + '15' : 'transparent',
                border: `1px solid ${tickerView === v ? C.acc : C.line}`,
                borderRadius: 5, padding: '3px 10px', cursor: 'pointer',
              }}>{label}</button>
            ))}
          </div>

          {tickerView === 'graph' ? (
            <div style={{ width: '100%', background: C.panel2, borderRadius: 8, padding: '10px 8px' }}>
              <ScoreGraph rounds={visibleRounds} tA={tA} tB={tB} myTeam={myTeam} />
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 4, fontFamily: mono, fontSize: 8, color: C.faint }}>
                <span>● ACE</span><span style={{ color: C.win }}>● CLUTCH</span><span style={{ color: C.acc }}>● ECO UPSET</span>
              </div>
            </div>
          ) : (
            <RoundHistory rounds={visibleRounds} tA={tA} tB={tB} myTeam={myTeam} mapDone={mapDone} />
          )}
        </div>

        {/* Notable events feed */}
        <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 4 }}>
          {visibleRounds.filter((rd, i) => isNotable(rd, i, visibleRounds)).slice(-8).map((rd, i) => {
            const isOT = rd.round > 24;
            return (
              <div key={i} style={{
                fontFamily: mono, fontSize: 11, padding: '4px 8px', borderRadius: 4,
                background: isOT ? `${C.gold}18` : rd.isEcoUpset ? 'rgba(155,140,255,.1)' : rd.isClutch ? 'rgba(61,220,132,.1)' : rd.isAce ? 'rgba(243,194,91,.1)' : 'transparent',
                color: isOT ? C.gold : rd.isEcoUpset ? C.acc : rd.isClutch ? C.win : rd.isAce ? C.gold : C.dim,
                border: isOT ? `1px solid ${C.gold}33` : 'none',
              }}>
                <span style={{ color: isOT ? C.gold : C.faint, marginRight: 6 }}>R{rd.round}</span>
                {isOT && <span style={{ fontWeight: 800, marginRight: 5 }}>[OT]</span>}
                {rd.narrative}
              </div>
            );
          })}
        </div>
      </>)}

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        {!done && (<>
          <button onClick={() => setSpeed(s => Math.max(50, s - 150))} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 6, padding: '6px 12px', fontFamily: mono, fontSize: 11, color: C.dim, cursor: 'pointer' }}>Faster</button>
          <button onClick={() => { setRoundIdx(mp?.rounds?.length || 0); }} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 6, padding: '6px 12px', fontFamily: mono, fontSize: 11, color: C.dim, cursor: 'pointer' }}>Skip Map</button>
          <button onClick={() => { setMapIdx(res.maps.length - 1); setRoundIdx(res.maps[res.maps.length - 1]?.rounds?.length || 0); setDone(true); }} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 6, padding: '6px 12px', fontFamily: mono, fontSize: 11, color: C.dim, cursor: 'pointer' }}>Skip All</button>
        </>)}
        {done && (
          <button onClick={onDone} style={{ background: C.acc, color: '#0a0c10', border: 'none', borderRadius: 9, padding: '13px 26px', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
            {res.winnerName === myTeam ? 'VICTORY — Continue' : 'Continue →'}
          </button>
        )}
      </div>
    </Overlay>
  );
}

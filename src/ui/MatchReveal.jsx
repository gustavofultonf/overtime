import React, { useState, useEffect, useRef } from 'react';
import { C, sans, mono } from './theme.js';
import { Overlay } from './primitives.jsx';
import { resolveMap } from '../engine/match.js';

// ── Helpers ──────────────────────────────────────────────────────────

function computeMomentum(rounds, myTeam) {
  let mom = 50;
  return rounds.map(rd => {
    mom = mom * 0.80 + (rd.winner === myTeam ? 80 : 20) * 0.20;
    return mom;
  });
}

const BUY_COLOR = { awp_buy: C.live, full: C.win, force: C.gold, eco: C.red };
const BUY_LABEL = { awp_buy: 'AWP', full: 'FULL', force: 'FRCE', eco: 'ECO' };

function EconBar({ buy, align = 'left' }) {
  const col = BUY_COLOR[buy] || C.faint;
  return (
    <div style={{
      width: 34, height: 11, borderRadius: 2,
      background: col + '55', border: `1px solid ${col}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: mono, fontSize: 7, color: col, fontWeight: 700,
    }}>
      {BUY_LABEL[buy] || '?'}
    </div>
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
  const [timeoutUsed, setTimeoutUsed] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(null);
  const [paused, setPaused] = useState(false);

  // Visual feedback state
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [flashTeam, setFlashTeam] = useState(null);

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
    setTimeoutUsed(false);
    setShowTimeout(false);
    setLastInteraction(null);
    setPaused(false);
  }, [mapIdx]);

  // Auto-advance rounds
  useEffect(() => {
    if (done || !mp || paused || showHalftime || showTimeout) return;
    if (roundIdx >= mp.rounds.length) {
      const timer = setTimeout(() => {
        if (mapIdx < res.maps.length - 1) { setMapIdx(i => i + 1); setRoundIdx(0); }
        else setDone(true);
      }, 1200);
      return () => clearTimeout(timer);
    }

    // Halftime pause (round 12 done → round 13 about to start)
    const visRds = mp.rounds.slice(0, roundIdx);
    const lastRd = visRds[visRds.length - 1];
    if (roundIdx === 12 && !halftimeDone && t && isMyMap) {
      setShowHalftime(true);
      setPaused(true);
      return;
    }

    // Timeout: detect 5 consecutive losses for myTeam
    if (!timeoutUsed && t && isMyMap && roundIdx >= 5) {
      const recent = visRds.slice(-5);
      if (recent.length === 5 && recent.every(rd => rd.winner !== myTeamInMap)) {
        setShowTimeout(true);
        setPaused(true);
        return;
      }
    }

    const timer = setTimeout(() => setRoundIdx(i => i + 1), speed);
    return () => clearTimeout(timer);
  }, [roundIdx, mapIdx, done, mp, speed, paused, showHalftime, showTimeout, halftimeDone, timeoutUsed, t, isMyMap, myTeamInMap]);

  // Toast: trigger on notable rounds
  useEffect(() => {
    if (roundIdx < 1 || !mp) return;
    const rd = mp.rounds[roundIdx - 1];
    if (!rd) return;
    let t = null;
    if (rd.isAce)      t = { icon: '★', label: 'ACE!',       sub: rd.narrative, color: C.gold };
    else if (rd.isClutch)    t = { icon: '⚡', label: 'CLUTCH!',    sub: rd.narrative, color: C.win };
    else if (rd.isEcoUpset) t = { icon: '$', label: 'ECO UPSET!', sub: rd.narrative, color: C.acc };
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

  // ── Interactive: halftime team talk ─────────────────────────────────
  function applyHalftimeChoice(choiceIdx) {
    if (!t || !mp) return;
    const lastRd = mp.rounds[11]; // round 12 data (0-indexed)
    if (!lastRd) return;
    // strMod applied to myTeam's side
    const isA = tA === myTeamInMap;
    let strModA = 0, strModB = 0;
    let desc = '';
    if (choiceIdx === 0) {
      // Tactical reset: strong buff
      if (isA) strModA = 4; else strModB = 4;
      desc = 'Tactical Reset → +4 str second half';
    } else if (choiceIdx === 1) {
      // Motivate: bigger buff but volatile
      if (isA) strModA = 6; else strModB = 6;
      desc = 'Fire them up → +6 str second half';
    } else {
      // Stay calm: small buff + clear tilt
      if (isA) strModA = 2; else strModB = 2;
      desc = 'Stay calm → +2 str, tilt cleared';
    }

    const startFrom = {
      scoreA: lastRd.scoreA,
      scoreB: lastRd.scoreB,
      moneyA: 800,
      moneyB: 800,
      lossStreakA: 0,
      lossStreakB: 0,
      tiltA: choiceIdx === 2 ? 0 : lastRd.tiltA,
      tiltB: choiceIdx === 2 ? 0 : lastRd.tiltB,
      side: 1,
      startRound: 12,
      strModA,
      strModB,
    };

    const newHalf = resolveMap(t.simState, mp.map, tA, tB, { stage: 'group' }, t.rng, startFrom);
    // Replace second half rounds in mp (mutate in place — fine since we own this array)
    mp.rounds = mp.rounds.slice(0, 12).concat(newHalf.rounds);
    mp.score = [newHalf.score[0] + startFrom.scoreA, newHalf.score[1] + startFrom.scoreB];
    // Determine actual final score
    const finalScoreA = mp.rounds[mp.rounds.length - 1]?.scoreA || 0;
    const finalScoreB = mp.rounds[mp.rounds.length - 1]?.scoreB || 0;
    mp.score = finalScoreA > finalScoreB ? [finalScoreA, finalScoreB] : [finalScoreB, finalScoreA];
    const aWon = finalScoreA > finalScoreB;
    mp.winnerName = aWon ? tA : tB;
    mp.loserName = aWon ? tB : tA;

    setLastInteraction({ type: 'halftime', choice: ['Tactical Reset', 'Fire Up', 'Stay Calm'][choiceIdx], desc });
    setHalftimeDone(true);
    setShowHalftime(false);
    setPaused(false);
  }

  // ── Interactive: timeout call ───────────────────────────────────────
  function applyTimeoutChoice(choiceIdx) {
    if (!t || !mp) return;
    const lastRd = visibleRounds[visibleRounds.length - 1];
    if (!lastRd) return;
    const isA = tA === myTeamInMap;
    let strModA = 0, strModB = 0;
    let desc = '';
    let tiltA = lastRd.tiltA, tiltB = lastRd.tiltB;
    if (choiceIdx === 0) {
      // Aggro: big str bonus
      if (isA) strModA = 6; else strModB = 6;
      desc = 'Go Aggro → +6 str for the run';
    } else if (choiceIdx === 1) {
      // Eco cycle: reset loss streak effect
      if (isA) strModA = 3; else strModB = 3;
      desc = 'Eco Cycle → +3 str, buy rhythm restored';
    } else {
      // Mindset reset: clear tilt + moderate str
      if (isA) { strModA = 5; tiltA = 0; } else { strModB = 5; tiltB = 0; }
      desc = 'Mindset Reset → +5 str, tilt cleared';
    }

    const startFrom = {
      scoreA: lastRd.scoreA,
      scoreB: lastRd.scoreB,
      moneyA: lastRd.moneyA,
      moneyB: lastRd.moneyB,
      lossStreakA: choiceIdx === 1 ? 0 : lastRd.lossStreakA,
      lossStreakB: choiceIdx === 1 ? 0 : lastRd.lossStreakB,
      tiltA,
      tiltB,
      side: lastRd.side === 'first' ? 0 : 1,
      startRound: lastRd.round,
      strModA,
      strModB,
    };

    const continuation = resolveMap(t.simState, mp.map, tA, tB, { stage: 'group' }, t.rng, startFrom);
    mp.rounds = mp.rounds.slice(0, roundIdx).concat(continuation.rounds);
    const finalScoreA = mp.rounds[mp.rounds.length - 1]?.scoreA || 0;
    const finalScoreB = mp.rounds[mp.rounds.length - 1]?.scoreB || 0;
    mp.score = finalScoreA > finalScoreB ? [finalScoreA, finalScoreB] : [finalScoreB, finalScoreA];
    const aWon = finalScoreA > finalScoreB;
    mp.winnerName = aWon ? tA : tB;
    mp.loserName = aWon ? tB : tA;

    setLastInteraction({ type: 'timeout', choice: ['Go Aggro', 'Eco Cycle', 'Mindset Reset'][choiceIdx], desc });
    setTimeoutUsed(true);
    setShowTimeout(false);
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Tactical Reset', sub: 'Switch up the strats. +4 str second half.', col: '#7c3aed' },
            { label: 'Fire Them Up', sub: 'Pump the energy. +6 str — but risky.', col: C.acc },
            { label: 'Stay Calm', sub: 'Keep the head. +2 str + clear any tilt.', col: C.win },
          ].map((opt, i) => (
            <button key={i} onClick={() => applyHalftimeChoice(i)} style={{
              background: C.panel, border: `1px solid ${opt.col}`, borderRadius: 9,
              padding: '13px 16px', textAlign: 'left', cursor: 'pointer',
            }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: opt.col, marginBottom: 2 }}>{opt.label}</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>{opt.sub}</div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, fontFamily: mono, fontSize: 10, color: C.faint, textAlign: 'center' }}>
          This will re-simulate the second half with your chosen boost.
        </div>
      </Overlay>
    );
  }

  // ── Timeout panel ───────────────────────────────────────────────────
  if (showTimeout) {
    const scT = curScore;
    const myScore = myTeamInMap === tA ? scT.scoreA : scT.scoreB;
    const oppScore = myTeamInMap === tA ? scT.scoreB : scT.scoreA;
    return (
      <Overlay onClose={() => { setTimeoutUsed(true); setShowTimeout(false); setPaused(false); }}
        title={`TIMEOUT · ${mp.map} · ${myScore}–${oppScore}`} wide>
        <div style={{ background: 'rgba(220,50,50,0.10)', border: `1px solid ${C.red}`, borderRadius: 10, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontFamily: mono, fontSize: 13, color: C.red, marginBottom: 6, letterSpacing: 1 }}>
            TACTICAL TIMEOUT
          </div>
          <div style={{ color: C.ink, fontSize: 14, marginBottom: 2 }}>
            5-round losing streak. The momentum has shifted — call it now.
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.faint }}>
            One timeout per map. Use it wisely.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Go Aggro', sub: 'Force the pace. Big +6 str burst.', col: C.acc },
            { label: 'Eco Cycle', sub: 'Save this round. +3 str, reset buy rhythm.', col: C.gold },
            { label: 'Mindset Reset', sub: 'Clear the heads. +5 str, wipe the tilt.', col: C.win },
          ].map((opt, i) => (
            <button key={i} onClick={() => applyTimeoutChoice(i)} style={{
              background: C.panel, border: `1px solid ${opt.col}`, borderRadius: 9,
              padding: '13px 16px', textAlign: 'left', cursor: 'pointer',
            }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: opt.col, marginBottom: 2 }}>{opt.label}</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>{opt.sub}</div>
            </button>
          ))}
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
          <div style={{ textAlign: 'right', flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: tA === myTeam ? C.acc : C.ink }}>{tA}</div>
          </div>
          <div style={{ fontFamily: mono, fontWeight: 800, fontSize: 42, minWidth: 100, textAlign: 'center', letterSpacing: 4 }}>
            <span style={{ color: flashTeam === tA ? C.gold : C.ink, transition: 'color 0.25s ease' }}>{curScore.scoreA}</span>
            <span style={{ color: C.faint, fontSize: 24 }}> : </span>
            <span style={{ color: flashTeam === tB ? C.gold : C.ink, transition: 'color 0.25s ease' }}>{curScore.scoreB}</span>
          </div>
          <div style={{ textAlign: 'left', flex: 1 }}>
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
            <span style={{ fontSize: 22, lineHeight: 1 }}>{toast.icon}</span>
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
            ⚡ OVERTIME ⚡
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
            background: lastInteraction.type === 'halftime' ? 'rgba(124,58,237,0.15)' : 'rgba(220,50,50,0.12)',
            border: `1px solid ${lastInteraction.type === 'halftime' ? '#7c3aed' : C.red}`,
            borderRadius: 6, padding: '6px 12px', marginBottom: 8,
            fontFamily: mono, fontSize: 10,
            color: lastInteraction.type === 'halftime' ? '#a78bfa' : C.red,
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <span style={{ fontWeight: 700 }}>{lastInteraction.type === 'halftime' ? 'HALF-TIME' : 'TIMEOUT'}</span>
            <span style={{ color: C.dim }}>"{lastInteraction.choice}"</span>
            <span style={{ color: C.faint }}>— {lastInteraction.desc}</span>
          </div>
        )}

        {/* Economy + round ticker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', marginBottom: 10 }}>
          {/* Economy legend */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
            {Object.entries(BUY_COLOR).map(([k, col]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 8, height: 8, borderRadius: 1, background: col }} />
                <span style={{ fontFamily: mono, fontSize: 8, color: C.faint }}>{BUY_LABEL[k]}</span>
              </div>
            ))}
          </div>
          {/* Round blocks: teamA buy | result arrow | teamB buy */}
          <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            {visibleRounds.map((rd, i) => {
              const prevRd = i > 0 ? visibleRounds[i - 1] : null;
              const halfBreak = prevRd && prevRd.side !== rd.side && rd.round <= 24;
              const isOTBreak = prevRd && prevRd.scoreA === 12 && prevRd.scoreB === 12;
              const isOTRound = rd.round > 24;
              const myWin = rd.winner === myTeamInMap;
              const hasNarrative = rd.isClutch || rd.isEcoUpset || rd.isAce;
              return (
                <React.Fragment key={i}>
                  {halfBreak && (
                    <div style={{ width: 2, alignSelf: 'stretch', background: C.gold, margin: '0 3px', borderRadius: 1 }} />
                  )}
                  {isOTBreak && (
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      margin: '0 4px', gap: 1, justifyContent: 'center',
                    }}>
                      <div style={{ width: 2, height: 14, background: C.gold, borderRadius: 1 }} />
                      <div style={{ fontFamily: mono, fontSize: 7, color: C.gold, fontWeight: 800, letterSpacing: 1 }}>OT</div>
                      <div style={{ width: 2, height: 14, background: C.gold, borderRadius: 1 }} />
                    </div>
                  )}
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                    border: isOTRound ? `1px solid ${C.gold}88` : hasNarrative ? `1px solid ${C.gold}44` : 'none',
                    background: isOTRound ? `${C.gold}0a` : 'transparent',
                    borderRadius: 3, padding: '1px',
                  }}>
                    {/* Pistol / special badge (top) */}
                    {(rd.round === 1 || rd.round === 13) ? (
                      <div style={{ width: 34, height: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontSize: 7, fontWeight: 800, color: C.gold }}>P</div>
                    ) : (rd.isAce || rd.isClutch || rd.isEcoUpset) ? (
                      <div style={{ width: 34, height: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>
                        {rd.isAce ? <span style={{ color: C.gold }}>★</span> : rd.isClutch ? <span style={{ color: C.win }}>⚡</span> : <span style={{ color: C.acc }}>$</span>}
                      </div>
                    ) : null}
                    {/* Team A buy */}
                    <EconBar buy={rd.buyA} />
                    {/* Result arrow */}
                    <div style={{
                      width: 34, height: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: mono, fontSize: 9, fontWeight: 700,
                      color: rd.winner === tA ? (tA === myTeamInMap ? C.win : C.red) : (tB === myTeamInMap ? C.win : C.red),
                      background: myWin !== undefined
                        ? (rd.winner === myTeamInMap ? 'rgba(61,220,132,.12)' : 'rgba(239,68,68,.10)')
                        : 'transparent',
                      borderRadius: 2,
                    }}>
                      {rd.winner === tA ? '◀' : '▶'}
                    </div>
                    {/* Team B buy */}
                    <EconBar buy={rd.buyB} />
                  </div>
                </React.Fragment>
              );
            })}
            {!mapDone && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 34, height: i === 1 ? 12 : 11, borderRadius: 2, background: C.panel2 }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notable events feed */}
        <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 4 }}>
          {visibleRounds.filter((rd, i) => isNotable(rd, i, visibleRounds)).slice(-8).map((rd, i) => {
            const isOT = rd.round > 24;
            return (
              <div key={i} style={{
                fontFamily: mono, fontSize: 11, padding: '4px 8px', borderRadius: 4,
                background: isOT ? `${C.gold}18` : rd.isEcoUpset ? 'rgba(255,92,46,.1)' : rd.isClutch ? 'rgba(61,220,132,.1)' : rd.isAce ? 'rgba(255,194,75,.1)' : 'transparent',
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
          <button onClick={() => setSpeed(s => Math.max(50, s - 150))} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 6, padding: '6px 12px', fontFamily: mono, fontSize: 11, color: C.dim, cursor: 'pointer' }}>⏩ Faster</button>
          <button onClick={() => { setRoundIdx(mp?.rounds?.length || 0); }} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 6, padding: '6px 12px', fontFamily: mono, fontSize: 11, color: C.dim, cursor: 'pointer' }}>⏭ Skip Map</button>
          <button onClick={() => { setMapIdx(res.maps.length - 1); setRoundIdx(res.maps[res.maps.length - 1]?.rounds?.length || 0); setDone(true); }} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 6, padding: '6px 12px', fontFamily: mono, fontSize: 11, color: C.dim, cursor: 'pointer' }}>⏭⏭ Skip All</button>
        </>)}
        {done && (
          <button onClick={onDone} style={{ background: C.acc, color: '#0a0c10', border: 'none', borderRadius: 9, padding: '13px 26px', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
            {res.winnerName === myTeam ? '[W] VICTORY — Continue' : 'Continue →'}
          </button>
        )}
      </div>
    </Overlay>
  );
}

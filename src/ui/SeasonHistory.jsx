import React from 'react';
import { C, sans, mono } from './theme.js';
import { getRankedTeams } from '../engine/player.js';
import { Intro, Locked, MiniStat } from './primitives.jsx';

function BudgetChart({ history }) {
  if (!history || history.length < 1) return null;
  const W = 420, H = 90, PL = 36, PR = 14, PT = 10, PB = 22;
  const plotW = W - PL - PR, plotH = H - PT - PB;
  const n = history.length;
  const budgets = history.map(h => h.budgetAfter);
  const prizes = history.map(h => h.prize);
  const maxV = Math.max(...budgets, 200) * 1.1;
  const minV = Math.min(...budgets, 0);
  const range = maxV - minV || 200;
  const xOf = i => n === 1 ? PL + plotW / 2 : PL + (i / (n - 1)) * plotW;
  const yOf = v => PT + (1 - (v - minV) / range) * plotH;
  const maxPrize = Math.max(...prizes, 1);
  const barW = Math.max(4, Math.min(18, plotW / n * 0.45));
  const gridVals = [0, Math.round(maxV * 0.5 / 100) * 100, Math.round(maxV / 100) * 100].filter((v, i, a) => a.indexOf(v) === i);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
      {gridVals.map(v => (
        <g key={v}>
          <line x1={PL} x2={W - PR} y1={yOf(v)} y2={yOf(v)} stroke={C.line} strokeWidth={0.5} strokeDasharray="3,3" />
          <text x={PL - 3} y={yOf(v) + 3} fontSize="8" fill={C.faint} textAnchor="end">{v >= 1000 ? (v/1000).toFixed(0)+'k' : v}</text>
        </g>
      ))}
      {minV < 0 && <line x1={PL} x2={W - PR} y1={yOf(0)} y2={yOf(0)} stroke={C.red} strokeWidth={1} opacity={0.4} />}
      {history.map((h, i) => {
        const barH = (h.prize / maxPrize) * plotH * 0.4;
        return <rect key={i} x={xOf(i) - barW / 2} y={PT + plotH - barH} width={barW} height={barH} fill={C.win + '55'} rx={2} />;
      })}
      {n > 1 && <polyline points={history.map((h, i) => `${xOf(i)},${yOf(h.budgetAfter)}`).join(' ')} fill="none" stroke={C.gold} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
      {history.map((h, i) => (
        <g key={i}>
          <circle cx={xOf(i)} cy={yOf(h.budgetAfter)} r="3.5" fill={h.budgetAfter > 0 ? C.gold : C.red} />
          <text x={xOf(i)} y={H - 4} fontSize="8" fill={C.faint} textAnchor="middle">#{h.eventNum}</text>
        </g>
      ))}
      <text x={PL} y={PT - 3} fontSize="8" fill={C.faint}>budget ($K)</text>
      <text x={W - PR} y={H - 4} fontSize="8" fill={C.win + 'aa'} textAnchor="end">▪ prize</text>
    </svg>
  );
}

export function SeasonHistory({season,myTeam}){
  if(!season.history.length)return <Locked text="Season history appears after your first event."/>;
  const plCol=p=>p===1?C.gold:p===2?"#c9d2e0":p<=4?C.acc:p<=8?C.live:C.dim;
  // Calculate total salary paid (from weekLog)
  const totalSalaryPaid=season.weekLog.filter(e=>e.activity==="salary").reduce((s,e)=>{
    const m=e.event?.match(/\$(\d+)K/);return s+(m?parseInt(m[1]):0);
  },0);
  return(<div>
    <Intro text="Your results across all events this season."/>
    <div style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:8,padding:"10px 14px",marginBottom:12,display:"flex",gap:16,flexWrap:"wrap"}}>
      <MiniStat label="TOTAL SALARY PAID" value={`${totalSalaryPaid}K`} color={C.red}/>
      <MiniStat label="TOTAL PRIZE WON" value={`$${season.history.reduce((s,h)=>s+h.prize,0)}K`} color={C.win}/>
      <MiniStat label="CURRENT BUDGET" value={`$${season.budget}K`} color={season.budget>0?C.gold:C.red}/>
    </div>
    {season.history.length >= 2 && (
      <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,padding:"12px 16px",marginBottom:12}}>
        <div style={{fontFamily:mono,fontSize:10,color:C.faint,letterSpacing:1,marginBottom:8}}>BUDGET TREND</div>
        <BudgetChart history={season.history}/>
        <div style={{display:"flex",gap:14,marginTop:6,fontFamily:mono,fontSize:9,color:C.faint}}>
          <span style={{color:C.gold}}>— budget after event</span>
          <span style={{color:C.win}}>▪ prize earned</span>
        </div>
      </div>
    )}
    <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"40px 60px 1fr 80px 60px 70px",gap:6,padding:"8px 14px",fontFamily:mono,fontSize:10,color:C.faint,letterSpacing:1}}>
        <span>#</span><span>TYPE</span><span>CHAMPION</span><span style={{textAlign:"right"}}>PLACE</span><span style={{textAlign:"right"}}>PRIZE</span><span style={{textAlign:"right"}}>BUDGET</span>
      </div>
      {season.history.map((h,i)=>{
        const tierC=h.tier==="Major"?C.gold:h.tier==="A"?C.live:C.dim;
        return(
        <div key={i} style={{display:"grid",gridTemplateColumns:"40px 60px 1fr 80px 60px 70px",gap:6,padding:"9px 14px",alignItems:"center",borderTop:`1px solid ${C.line}`}}>
          <span style={{fontFamily:mono,fontWeight:700,color:C.acc}}>#{h.eventNum}</span>
          <span style={{fontFamily:mono,fontSize:9,color:tierC}}>{h.tier||"Major"}</span>
          <span style={{fontSize:12,color:h.champion===myTeam?C.gold:C.ink}}>{h.champion}{h.champion===myTeam?" [W]":""}</span>
          <span style={{fontFamily:mono,fontWeight:700,fontSize:13,textAlign:"right",color:plCol(h.place)}}>{h.place===1?"1st":h.place===2?"2nd":h.place<=4?"T"+h.place:"T"+h.place}</span>
          <span style={{fontFamily:mono,fontSize:11,textAlign:"right",color:C.win}}>+{h.prize}</span>
          <span style={{fontFamily:mono,fontSize:11,textAlign:"right",color:h.budgetAfter>0?C.gold:C.red}}>{h.budgetAfter}</span>
        </div>);})}
    </div>
  </div>);}
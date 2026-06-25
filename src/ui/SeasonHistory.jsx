import React from 'react';
import { C, sans, mono } from './theme.js';
import { getRankedTeams } from '../engine/player.js';
import { Intro, Locked, MiniStat } from './primitives.jsx';

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
      <MiniStat label="TOTAL PRIZE WON" value={`$season.history.reduce((s,h)=>s+h.prize,0)K`} color={C.win}/>
      <MiniStat label="CURRENT BUDGET" value={`$${season.budget}K`} color={season.budget>0?C.gold:C.red}/>
    </div>
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
import React from 'react';
import { C, sans, mono } from './theme.js';
import { getRankedTeams } from '../engine/player.js';
import { Intro } from './primitives.jsx';

export function RankingsView({state,myTeam}){
  const ranked=getRankedTeams(state,myTeam);
  const maxPts=ranked[0]?.pts||1;
  return(<div>
    <Intro text="World rankings based on event results. Majors award 3× points, A-tier 2×, B-tier 1×. Rankings determine seeding at events."/>
    <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"36px 1fr 70px 1fr",gap:8,padding:"8px 14px",fontFamily:mono,fontSize:10,color:C.faint,letterSpacing:1}}>
        <span>#</span><span>TEAM</span><span style={{textAlign:"right"}}>POINTS</span><span></span>
      </div>
      {ranked.map((r,i)=>{const me=r.team===myTeam;const pct=maxPts>0?r.pts/maxPts*100:0;
        const col=i===0?C.gold:i<=2?C.acc:i<=7?C.live:C.dim;
        return(
        <div key={r.team} style={{display:"grid",gridTemplateColumns:"36px 1fr 70px 1fr",gap:8,padding:"9px 14px",alignItems:"center",borderTop:`1px solid ${C.line}`,borderLeft:`3px solid ${me?C.acc:col}`,background:me?"rgba(255,92,46,.06)":"transparent"}}>
          <span style={{fontFamily:mono,fontWeight:700,fontSize:15,color:col}}>{i+1}</span>
          <span style={{fontWeight:me?700:600,fontSize:13,color:me?C.acc:C.ink}}>{r.team}{me?" ◂ you":""}</span>
          <span style={{fontFamily:mono,fontWeight:700,fontSize:13,textAlign:"right",color:col}}>{r.pts}</span>
          <div style={{height:6,background:C.line,borderRadius:3,overflow:"hidden"}}>
            <div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:3}}/>
          </div>
        </div>);
      })}
    </div>
  </div>);
}

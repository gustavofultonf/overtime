import React from 'react';
import { C, sans, mono } from './theme.js';
import { MAPS } from '../constants/data.js';
import { getMapProf } from '../engine/state.js';
import { Intro, SL } from './primitives.jsx';

export function MapProfView({state,myTeam}){
  const prof=getMapProf(state,myTeam);
  return(<div>
    <Intro text="Your team's map pool. Practice maps during the calendar to improve proficiency."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12}}>
      {MAPS.map(m=>{const v=prof[m]||50;const c=v>=75?C.win:v>=60?C.gold:v>=45?C.dim:C.red;return(
        <div key={m} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:9,padding:"16px 14px",textAlign:"center"}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>{m}</div>
          <div style={{fontFamily:mono,fontSize:28,fontWeight:800,color:c}}>{v}</div>
          <div style={{height:6,background:C.line,borderRadius:3,overflow:"hidden",marginTop:8}}>
            <div style={{width:`${v}%`,height:"100%",background:c,borderRadius:3}}/>
          </div>
        </div>);
      })}
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════
// RANKINGS VIEW
// ═══════════════════════════════════════════════════════════════════════
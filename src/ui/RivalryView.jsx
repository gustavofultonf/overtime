import React from 'react';
import { C, sans, mono } from './theme.js';
import { Intro, Empty } from './primitives.jsx';

export function RivalryView({state,myTeam}){
  const rivals=Object.entries(state.rivalries).filter(([k,r])=>k.includes(myTeam)&&r.matches>0).sort((a,b)=>b[1].matches-a[1].matches);
  return(<div>
    <Intro text="Head-to-head records against teams you've faced. Rivalries form after 3+ meetings."/>
    {rivals.length===0?<Empty text="No match history yet. Play some games!"/>:(
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {rivals.map(([k,r])=>{
        const opp=k.split("|").find(t=>t!==myTeam);
        const myWins=r.wins[myTeam]||0;const theirWins=r.wins[opp]||0;
        return(
        <div key={k} style={{background:C.panel,border:`1px solid ${r.isRival?C.rival:C.line}`,borderRadius:9,padding:"12px 16px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
          {r.isRival&&<span style={{fontFamily:mono,fontSize:9,color:C.rival,border:`1px solid ${C.rival}`,borderRadius:4,padding:"2px 6px",fontWeight:700}}>RIVAL</span>}
          <span style={{fontWeight:700,fontSize:14}}>{opp}</span>
          <span style={{fontFamily:mono,fontSize:13,color:C.win,fontWeight:700}}>{myWins}W</span>
          <span style={{fontFamily:mono,fontSize:13,color:C.red}}>{theirWins}L</span>
          <span style={{fontFamily:mono,fontSize:11,color:C.faint}}>({r.matches} played)</span>
          {r.isRival&&<span style={{fontSize:11,color:C.rival,marginLeft:"auto"}}>+mentality boost in matchups</span>}
        </div>);
      })}
    </div>)}
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════
// TRANSFER PANEL (used inside calendar)
// ═══════════════════════════════════════════════════════════════════════
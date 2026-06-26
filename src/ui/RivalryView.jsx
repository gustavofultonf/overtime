import React from 'react';
import { C, sans, mono } from './theme.js';
import { Intro, Empty, TeamCrest, H2HBar } from './primitives.jsx';

export function RivalryView({state,myTeam}){
  const rivals=Object.entries(state.rivalries).filter(([k,r])=>k.includes(myTeam)&&r.matches>0).sort((a,b)=>b[1].matches-a[1].matches);
  return(<div>
    <Intro text="Head-to-head records against teams you've faced. Rivalries form after 3+ meetings."/>
    {rivals.length===0?<Empty text="No match history yet. Play some games!"/>:(
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {rivals.map(([k,r])=>{
        const opp=k.split("|").find(t=>t!==myTeam);
        const myWins=r.wins[myTeam]||0;const theirWins=r.wins[opp]||0;
        const leading=myWins>theirWins;
        return(
        <div key={k} style={{background:C.panel,border:`1px solid ${r.isRival?C.rival:C.line}`,borderRadius:9,padding:"12px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            {/* You */}
            <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
              <TeamCrest name={myTeam} size={32}/>
              <span style={{fontWeight:700,fontSize:13,color:C.acc}}>{myTeam}</span>
            </div>
            {/* Center */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              {r.isRival&&<span style={{fontFamily:mono,fontSize:9,color:C.rival,border:`1px solid ${C.rival}`,borderRadius:4,padding:"1px 6px",fontWeight:700}}>RIVAL</span>}
              <span style={{fontFamily:mono,fontSize:18,fontWeight:800,color:leading?C.win:myWins<theirWins?C.red:C.dim}}>{myWins}–{theirWins}</span>
              <span style={{fontFamily:mono,fontSize:9,color:C.faint}}>{r.matches} played</span>
            </div>
            {/* Opponent */}
            <div style={{display:"flex",alignItems:"center",gap:8,flex:1,justifyContent:"flex-end"}}>
              <span style={{fontWeight:700,fontSize:13}}>{opp}</span>
              <TeamCrest name={opp} size={32}/>
            </div>
          </div>
          <H2HBar mine={myWins} theirs={theirWins}/>
          {r.isRival&&<div style={{fontSize:10,color:C.rival,marginTop:8,textAlign:"center"}}>+mentality boost in matchups</div>}
        </div>);
      })}
    </div>)}
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════
// TRANSFER PANEL (used inside calendar)
// ═══════════════════════════════════════════════════════════════════════
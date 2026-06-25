import React, { useState, useEffect, useRef } from 'react';
import { C, sans, mono } from './theme.js';
import { Overlay, SL } from './primitives.jsx';

export function MatchReveal({reveal,myTeam,onDone}){
  const {res}=reveal;
  const [mapIdx,setMapIdx]=useState(0);
  const [roundIdx,setRoundIdx]=useState(0);
  const [done,setDone]=useState(false);
  const [speed,setSpeed]=useState(400);
  const mp=res.maps[mapIdx];
  const tA=mp?.teamA||res.winnerName,tB=mp?.teamB||res.loserName;

  React.useEffect(()=>{
    if(done||!mp) return;
    if(roundIdx>=mp.rounds.length){
      // Map finished — pause then move to next map or done
      const timer=setTimeout(()=>{
        if(mapIdx<res.maps.length-1){setMapIdx(i=>i+1);setRoundIdx(0);}
        else setDone(true);
      },1200);
      return ()=>clearTimeout(timer);
    }
    const timer=setTimeout(()=>setRoundIdx(i=>i+1),speed);
    return ()=>clearTimeout(timer);
  },[roundIdx,mapIdx,done,mp,speed,res.maps.length]);

  const visibleRounds=mp?mp.rounds.slice(0,roundIdx):[];
  const curScore=visibleRounds.length>0?visibleRounds[visibleRounds.length-1]:{scoreA:0,scoreB:0};
  const mapDone=roundIdx>=((mp?.rounds?.length)||0);

  // Only show narrative for notable rounds
  function isNotable(rd,idx,rounds){
    if(rd.isClutch||rd.isEcoUpset||rd.isAce) return true;
    if(rd.round===1) return true; // pistol round
    // half-time
    if(idx>0&&rounds[idx-1]?.side!==rd.side) return true;
    // match point
    if(rd.scoreA===12||rd.scoreB===12) return true;
    // close round (within 2)
    if(Math.abs(rd.scoreA-rd.scoreB)<=1&&rd.scoreA>=8) return true;
    return false;
  }

  return(
  <Overlay onClose={onDone} title={`${res.bo>=3?"BO"+res.bo+" · ":""}${tA} vs ${tB}`} wide>
    {/* Series score for Bo3/Bo5 */}
    {res.bo>=3&&(
      <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:12}}>
        {res.maps.map((m,mi)=>{
          const played=mi<mapIdx||(mi===mapIdx&&mapDone);
          return(<div key={mi} style={{fontFamily:mono,fontSize:11,color:mi===mapIdx?C.acc:played?C.dim:C.faint,textAlign:"center"}}>
            <div>{m.map}</div>
            {played&&<div style={{fontWeight:700,fontSize:14,color:m.winnerName===myTeam?C.win:C.red}}>{m.score.join("-")}</div>}
            {!played&&mi>mapIdx&&<div style={{color:C.faint}}>—</div>}
          </div>);
        })}
      </div>
    )}

    {/* Current map */}
    {mp&&(<>
    <div style={{textAlign:"center",marginBottom:8}}>
      <span style={{fontFamily:mono,fontSize:12,color:C.gold,letterSpacing:2}}>{mp.map}</span>
      {res.bo>=3&&<span style={{fontFamily:mono,fontSize:10,color:C.faint,marginLeft:8}}>MAP {mapIdx+1}</span>}
    </div>

    {/* Big scoreboard */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20,marginBottom:16,padding:"16px 0"}}>
      <div style={{textAlign:"right",flex:1}}>
        <div style={{fontWeight:800,fontSize:18,color:tA===myTeam?C.acc:C.ink}}>{tA}</div>
      </div>
      <div style={{fontFamily:mono,fontWeight:800,fontSize:42,color:C.ink,minWidth:100,textAlign:"center",letterSpacing:4}}>
        {curScore.scoreA} <span style={{color:C.faint,fontSize:24}}>:</span> {curScore.scoreB}
      </div>
      <div style={{textAlign:"left",flex:1}}>
        <div style={{fontWeight:800,fontSize:18,color:tB===myTeam?C.acc:C.ink}}>{tB}</div>
      </div>
    </div>

    {/* Round ticker */}
    <div style={{display:"flex",gap:3,justifyContent:"center",marginBottom:14,flexWrap:"wrap"}}>
      {visibleRounds.map((rd,i)=>{
        const halfBreak=i>0&&visibleRounds[i-1]?.side!==rd.side;
        return(<React.Fragment key={i}>
          {halfBreak&&<div style={{width:2,height:20,background:C.gold,margin:"0 4px",borderRadius:1}}/>}
          <div style={{width:18,height:20,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:9,fontFamily:mono,fontWeight:700,
            background:rd.winner===tA?(tA===myTeam?"rgba(61,220,132,.25)":"rgba(106,163,255,.2)"):(tB===myTeam?"rgba(61,220,132,.25)":"rgba(106,163,255,.2)"),
            color:rd.winner===tA?(tA===myTeam?C.win:C.live):(tB===myTeam?C.win:C.live),
            border:`1px solid ${rd.isEcoUpset||rd.isClutch||rd.isAce?C.gold+"88":"transparent"}`}}>
            {rd.winner===tA?"◀":"▶"}
          </div>
        </React.Fragment>);
      })}
      {!mapDone&&<div style={{width:18,height:20,borderRadius:3,background:C.panel2,animation:"pulse 0.8s infinite"}}/>}
    </div>

    {/* Notable events feed */}
    <div style={{maxHeight:140,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}}>
      {visibleRounds.filter((rd,i)=>isNotable(rd,i,visibleRounds)).slice(-5).map((rd,i)=>(
        <div key={i} style={{fontFamily:mono,fontSize:11,padding:"4px 8px",borderRadius:4,
          background:rd.isEcoUpset?"rgba(255,92,46,.1)":rd.isClutch?"rgba(61,220,132,.1)":rd.isAce?"rgba(255,194,75,.1)":"transparent",
          color:rd.isEcoUpset?C.acc:rd.isClutch?C.win:rd.isAce?C.gold:C.dim}}>
          <span style={{color:C.faint,marginRight:6}}>R{rd.round}</span>
          <span style={{fontSize:8,marginRight:4}}>{rd.buyA==="awp_buy"||rd.buyA==="full"?"++":rd.buyA==="force"?"~":"--"}</span>
          vs
          <span style={{fontSize:8,marginLeft:4,marginRight:6}}>{rd.buyB==="awp_buy"||rd.buyB==="full"?"++":rd.buyB==="force"?"~":"--"}</span>
          {rd.narrative}
        </div>
      ))}
    </div>
    </>)}

    {/* Speed controls + Continue */}
    <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:16,alignItems:"center"}}>
      {!done&&(<>
        <button onClick={()=>setSpeed(s=>Math.max(50,s-150))} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:6,padding:"6px 12px",fontFamily:mono,fontSize:11,color:C.dim}}>⏩ Faster</button>
        <button onClick={()=>{setRoundIdx(mp?.rounds?.length||0);}} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:6,padding:"6px 12px",fontFamily:mono,fontSize:11,color:C.dim}}>⏭ Skip Map</button>
        <button onClick={()=>{setMapIdx(res.maps.length-1);setRoundIdx(res.maps[res.maps.length-1]?.rounds?.length||0);setDone(true);}} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:6,padding:"6px 12px",fontFamily:mono,fontSize:11,color:C.dim}}>⏭⏭ Skip All</button>
      </>)}
      {done&&(
        <button onClick={onDone} style={{background:C.acc,color:"#0a0c10",border:"none",borderRadius:9,padding:"13px 26px",fontWeight:800,fontSize:15}}>
          {res.winnerName===myTeam?"[W] VICTORY — Continue":"Continue →"}
        </button>
      )}
    </div>
  </Overlay>);
}

// ── Primitives ───────────────────────────────────────────────────────
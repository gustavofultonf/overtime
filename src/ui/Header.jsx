import React, { useState } from 'react';
import { C, sans, mono } from './theme.js';
import { Wordmark, TeamCrest, CountUp } from './primitives.jsx';

export function Header({season,myTeam,onReset,stageLabel,onSave}){
  const [showSave,setShowSave]=useState(false);
  const budget=season.budget;
  const broke=budget<0;
  return(
  <header style={{borderBottom:`1px solid ${C.line}`,padding:"11px 22px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",position:"sticky",top:0,background:"rgba(11,14,23,.82)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",zIndex:20}}>
    <Wordmark size={16}/>
    <span style={{width:1,height:20,background:C.line}}/>
    <div style={{display:"flex",alignItems:"center",gap:9,minWidth:0}}>
      <TeamCrest name={myTeam} size={26}/>
      <div style={{lineHeight:1.15,minWidth:0}}>
        <div style={{fontWeight:700,fontSize:14,color:C.ink,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:200}}>{myTeam}</div>
        <div style={{fontFamily:mono,fontSize:10,color:C.faint,letterSpacing:.5,whiteSpace:"nowrap"}}>{stageLabel}</div>
      </div>
    </div>
    <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
      <div style={{display:"flex",alignItems:"center",gap:7,background:C.panel,border:`1px solid ${broke?C.red+"66":C.line}`,borderRadius:9,padding:"6px 11px"}}>
        <span style={{fontFamily:mono,fontSize:9,color:C.faint,letterSpacing:1}}>BUDGET</span>
        <CountUp value={budget} prefix="$" suffix="K" style={{fontFamily:mono,fontSize:13,fontWeight:700,color:broke?C.red:C.gold,display:"inline-block"}}/>
      </div>
      <div style={{position:"relative"}}>
        <button onClick={()=>setShowSave(!showSave)} title="Save game" style={{background:C.panel,color:C.live,border:`1px solid ${C.line}`,borderRadius:9,padding:"8px 12px",fontSize:12,fontFamily:sans,fontWeight:700}}>Save</button>
        {showSave&&<div style={{position:"absolute",right:0,top:"100%",marginTop:6,background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,padding:"8px",zIndex:30,minWidth:140,display:"flex",flexDirection:"column",gap:5,boxShadow:"0 18px 50px -20px rgba(0,0,0,.8)"}}>
          <div style={{fontFamily:mono,fontSize:9,color:C.faint,letterSpacing:1,padding:"2px 6px 4px"}}>SAVE TO SLOT</div>
          {[1,2,3].map(i=><button key={i} onClick={()=>{onSave(i);setShowSave(false);}} style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:7,padding:"8px 12px",fontFamily:sans,fontSize:12,fontWeight:600,color:C.ink,textAlign:"left"}}>Slot {i}</button>)}
        </div>}
      </div>
      <button onClick={onReset} style={{background:"transparent",color:C.dim,border:`1px solid ${C.line}`,borderRadius:9,padding:"8px 12px",fontSize:12,fontFamily:sans,fontWeight:600}}>Menu</button>
    </div>
  </header>);}

export function Tabs({tab,setTab,calMode,miniMode}){
  const items=calMode
    ?[["calendar","Calendar"],["roster","Squad"],["dynamics","Dynamics"],["tactics","Tactics"],["market","Transfers"],["maps","Maps"],["facility","Club"],["finance","Finance"],["rankings","Rankings"],["rivals","Rivals"],["season","Season"]]
    :[["hub","Event"],["roster","Squad"],["stats","Stats"],["rivals","Rivals"],["season","Season"]];
  return(
  <nav style={{display:"flex",gap:4,padding:"0 22px",borderBottom:`1px solid ${C.line}`,flexWrap:"wrap",overflowX:"auto",background:C.bg}}>
    {items.map(([k,l])=>{const on=tab===k;return(
      <button key={k} onClick={()=>setTab(k)} style={{background:"transparent",border:"none",padding:"12px 13px 11px",fontFamily:sans,fontSize:12.5,fontWeight:on?700:600,letterSpacing:.2,color:on?C.ink:C.dim,borderBottom:`2px solid ${on?C.acc:"transparent"}`,marginBottom:-1,whiteSpace:"nowrap"}}>{l}</button>
    );})}
  </nav>);}

// ═══════════════════════════════════════════════════════════════════════
// HLTV-STYLE EVENT VIEW
// ═══════════════════════════════════════════════════════════════════════

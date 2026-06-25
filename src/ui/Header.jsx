import React, { useState } from 'react';
import { C, sans, mono } from './theme.js';

export function Header({season,myTeam,onReset,stageLabel,onSave}){
  const [showSave,setShowSave]=useState(false);
  return(
  <header style={{borderBottom:`1px solid ${C.line}`,padding:"13px 22px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",position:"sticky",top:0,background:C.bg,zIndex:20}}>
    <span style={{fontFamily:mono,fontWeight:700,fontSize:13,color:C.acc,letterSpacing:2}}>▸ OVERTIME</span>
    <span style={{fontFamily:mono,fontSize:11,color:C.dim,letterSpacing:1}}>{stageLabel}</span>
    <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontFamily:mono,fontSize:10,color:C.gold}}>${season.budget}K</span>
      <span style={{fontWeight:700,fontSize:13,color:C.acc}}>{myTeam}</span>
      <div style={{position:"relative"}}>
        <button onClick={()=>setShowSave(!showSave)} style={{background:C.panel,color:C.live,border:`1px solid ${C.line}`,borderRadius:6,padding:"7px 10px",fontSize:11,fontFamily:mono}}>[S]</button>
        {showSave&&<div style={{position:"absolute",right:0,top:"100%",marginTop:4,background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,padding:"8px",zIndex:30,minWidth:120,display:"flex",flexDirection:"column",gap:4}}>
          {[1,2,3].map(i=><button key={i} onClick={()=>{onSave(i);setShowSave(false);}} style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:5,padding:"6px 10px",fontFamily:mono,fontSize:10,color:C.ink,textAlign:"left"}}>Save Slot {i}</button>)}
        </div>}
      </div>
      <button onClick={onReset} style={{background:C.panel,color:C.dim,border:`1px solid ${C.line}`,borderRadius:6,padding:"7px 10px",fontSize:11,fontFamily:mono}}>MENU</button>
    </div>
  </header>);}

export function Tabs({tab,setTab,calMode,miniMode}){
  const items=calMode
    ?[["calendar","CALENDAR"],["roster","ROSTER"],["maps","MAPS"],["facility","FACILITY"],["rankings","RANKINGS"],["rivals","RIVALS"],["season","SEASON"]]
    :miniMode
    ?[["hub","HUB"],["bracket","BRACKET"],["roster","ROSTER"],["stats","STATS"],["rivals","RIVALS"],["season","SEASON"]]
    :[["hub","HUB"],["groups","GROUPS"],["bracket","BRACKET"],["roster","ROSTER"],["stats","STATS"],["rivals","RIVALS"],["season","SEASON"]];
  return(
  <nav style={{display:"flex",gap:2,padding:"11px 22px 0",borderBottom:`1px solid ${C.line}`,flexWrap:"wrap",overflowX:"auto"}}>
    {items.map(([k,l])=>(
      <button key={k} onClick={()=>setTab(k)} style={{background:"transparent",border:"none",padding:"9px 12px",fontFamily:mono,fontSize:11,fontWeight:700,letterSpacing:1,color:tab===k?C.ink:C.dim,borderBottom:`2px solid ${tab===k?C.acc:"transparent"}`,marginBottom:-1,whiteSpace:"nowrap"}}>{l}</button>
    ))}
  </nav>);}

// ═══════════════════════════════════════════════════════════════════════
// HLTV-STYLE EVENT VIEW
// ═══════════════════════════════════════════════════════════════════════
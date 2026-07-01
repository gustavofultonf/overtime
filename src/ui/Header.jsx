import React, { useState } from 'react';
import { C, sans, mono } from './theme.js';
import { Wordmark, TeamCrest, CountUp } from './primitives.jsx';

export function Header({season,myTeam,onReset,stageLabel,onSave}){
  const [showSave,setShowSave]=useState(false);
  const budget=season.budget;
  const broke=budget<0;
  return(
  <header style={{borderBottom:`1px solid ${C.line}`,padding:"10px 22px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",position:"sticky",top:0,background:"rgba(15,20,29,.85)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",zIndex:20}}>
    <Wordmark size={16}/>
    <span style={{width:1,height:20,background:C.line}}/>
    <div style={{display:"flex",alignItems:"center",gap:9,minWidth:0}}>
      <TeamCrest name={myTeam} size={26}/>
      <div style={{lineHeight:1.15,minWidth:0}}>
        <div style={{fontWeight:700,fontSize:14,color:C.ink,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:200}}>{myTeam}</div>
        <div style={{fontSize:11,color:C.faint,letterSpacing:.2,whiteSpace:"nowrap"}}>{stageLabel}</div>
      </div>
    </div>
    <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
      <div style={{display:"flex",alignItems:"center",gap:7,background:C.panel,border:`1px solid ${broke?C.red+"66":C.line}`,borderRadius:9,padding:"6px 11px"}}>
        <span style={{fontSize:10,fontWeight:700,color:C.faint,letterSpacing:.4}}>Budget</span>
        <CountUp value={budget} prefix="$" suffix="K" style={{fontFamily:mono,fontSize:13,fontWeight:700,color:broke?C.red:C.gold,display:"inline-block"}}/>
      </div>
      <div style={{position:"relative"}}>
        <button onClick={()=>setShowSave(!showSave)} title="Save game" style={{background:`linear-gradient(100deg,${C.accDeep},${C.acc2})`,color:"#fff",border:"none",borderRadius:9,padding:"8px 16px",fontSize:12,fontFamily:sans,fontWeight:700,boxShadow:`0 6px 18px -8px ${C.accDeep}aa`}}>Save</button>
        {showSave&&<div style={{position:"absolute",right:0,top:"100%",marginTop:6,background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,padding:"8px",zIndex:30,minWidth:140,display:"flex",flexDirection:"column",gap:5,boxShadow:"0 18px 50px -20px rgba(0,0,0,.8)"}}>
          <div style={{fontFamily:sans,fontSize:9.5,fontWeight:700,color:C.faint,letterSpacing:.7,padding:"2px 6px 4px"}}>SAVE TO SLOT</div>
          {[1,2,3].map(i=><button key={i} onClick={()=>{onSave(i);setShowSave(false);}} style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:7,padding:"8px 12px",fontFamily:sans,fontSize:12,fontWeight:600,color:C.ink,textAlign:"left"}}>Slot {i}</button>)}
        </div>}
      </div>
      <button onClick={onReset} style={{background:"transparent",color:C.dim,border:`1px solid ${C.line}`,borderRadius:9,padding:"8px 12px",fontSize:12,fontFamily:sans,fontWeight:600}}>Menu</button>
    </div>
  </header>);}

// FM-style persistent navigation rail (left on desktop, horizontal strip on
// narrow viewports — see .rail rules in Gstyle). Grouped sections, plain
// labels with a gradient-tint active state.
export function Tabs({tab,setTab,calMode,miniMode}){
  const groups=calMode
    ?[["Team",[["calendar","Calendar"],["roster","Squad"],["dynamics","Dynamics"],["tactics","Tactics"],["maps","Maps"]]],
      ["Club",[["market","Transfers"],["facility","Facilities"],["finance","Finance"]]],
      ["World",[["rankings","Rankings"],["rivals","Rivals"],["season","Season"]]]]
    :[["Tournament",[["hub","Event"],["stats","Stats"]]],
      ["Team",[["roster","Squad"],["rivals","Rivals"],["season","Season"]]]];
  return(
  <nav className="rail">
    {groups.map(([sec,items])=>(
      <React.Fragment key={sec}>
        <div className="railsec">{sec}</div>
        {items.map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} className={`railbtn${tab===k?" on":""}`}>{l}</button>))}
      </React.Fragment>))}
  </nav>);}

// ═══════════════════════════════════════════════════════════════════════
// HLTV-STYLE EVENT VIEW
// ═══════════════════════════════════════════════════════════════════════

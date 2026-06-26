import React from 'react';
import { C, mono } from './theme.js';
import { SeasonHistory } from './SeasonHistory.jsx';

function ObjRow({obj}){
  const met=obj.met;
  const col=met?C.win:C.red;
  return(
  <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
    background:met?"rgba(34,197,94,.07)":"rgba(239,68,68,.05)",
    border:`1px solid ${col}33`,borderRadius:8,marginBottom:6}}>
    <span style={{fontFamily:mono,fontWeight:800,fontSize:15,color:col,minWidth:16}}>{met?"✓":"✗"}</span>
    <span style={{fontSize:13,color:met?C.ink:C.dim,flex:1}}>{obj.label}</span>
    <span style={{fontFamily:mono,fontSize:12,color:met?C.gold:C.faint}}>
      {met?`+$${obj.reward}K`:`missed (+$${obj.reward}K)`}
    </span>
  </div>);
}

export function BoardReview({season,myTeam,onBeginNewYear,onMenu}){
  const objectives=season.boardObjectives||[];
  const summary=season.boardSummary;
  const metCount=objectives.filter(o=>o.met).length;
  const total=objectives.length;
  const ratio=total>0?metCount/total:0;
  const verdict=ratio===1?"BOARD IS DELIGHTED":ratio>=0.67?"BOARD IS SATISFIED":ratio>=0.34?"BOARD IS CONCERNED":"BOARD IS DISAPPOINTED";
  const verdictColor=ratio===1?C.win:ratio>=0.67?C.gold:ratio>=0.34?"#e07050":C.red;
  const yr=season.year||2026;

  return(
  <div>
    {/* Verdict banner */}
    <div style={{background:C.panel,border:`2px solid ${verdictColor}55`,borderRadius:12,padding:"20px 24px",marginBottom:20,textAlign:"center"}}>
      <div style={{fontFamily:mono,fontSize:9,color:C.faint,letterSpacing:2,marginBottom:6}}>ANNUAL BOARD REVIEW — {yr} SEASON</div>
      <div style={{fontFamily:mono,fontSize:24,fontWeight:800,color:verdictColor,letterSpacing:1,marginBottom:6}}>{verdict}</div>
      <div style={{fontFamily:mono,fontSize:12,color:C.dim}}>{metCount}/{total} objectives completed · World rank #{summary?.finalRank||"?"}</div>
    </div>

    {/* Objectives */}
    <div style={{fontFamily:mono,fontSize:9,color:C.faint,letterSpacing:1.5,marginBottom:8}}>BOARD OBJECTIVES</div>
    <div style={{marginBottom:20}}>
      {objectives.map(o=><ObjRow key={o.id} obj={o}/>)}
      {objectives.length===0&&<div style={{fontFamily:mono,fontSize:12,color:C.faint}}>No objectives were set this season.</div>}
    </div>

    {/* Budget breakdown */}
    {summary&&(
    <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,padding:"16px 20px",marginBottom:20}}>
      <div style={{fontFamily:mono,fontSize:9,color:C.faint,letterSpacing:1.5,marginBottom:12}}>BUDGET FOR {yr+1} SEASON</div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        <div style={{display:"flex",justifyContent:"space-between",fontFamily:mono,fontSize:12,color:C.dim}}>
          <span>Base allocation</span><span style={{color:C.ink}}>$400K</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontFamily:mono,fontSize:12,color:C.dim}}>
          <span>Budget carryover (50% of ${summary.oldBudget}K)</span>
          <span style={{color:summary.carryover>0?C.gold:C.faint}}>+${summary.carryover}K</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontFamily:mono,fontSize:12,color:C.dim}}>
          <span>Board rewards ({metCount} objectives)</span>
          <span style={{color:summary.totalReward>0?C.win:C.faint}}>+${summary.totalReward}K</span>
        </div>
        <div style={{borderTop:`1px solid ${C.line}`,paddingTop:8,marginTop:4,display:"flex",justifyContent:"space-between"}}>
          <span style={{fontFamily:mono,fontSize:14,fontWeight:800,color:C.ink}}>NEW SEASON BUDGET</span>
          <span style={{fontFamily:mono,fontSize:16,fontWeight:800,color:C.gold}}>${summary.newBudget}K</span>
        </div>
      </div>
    </div>)}

    {/* Season results */}
    <div style={{fontFamily:mono,fontSize:9,color:C.faint,letterSpacing:1.5,marginBottom:8}}>SEASON RESULTS</div>
    <div style={{marginBottom:20}}>
      <SeasonHistory season={season} myTeam={myTeam}/>
    </div>

    {/* Previous years */}
    {season.yearHistory?.length>0&&(
    <div style={{marginBottom:24}}>
      <div style={{fontFamily:mono,fontSize:9,color:C.faint,letterSpacing:1.5,marginBottom:8}}>CAREER HISTORY</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {season.yearHistory.map((yh,i)=>(
        <div key={i} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,padding:"10px 14px",minWidth:110}}>
          <div style={{fontFamily:mono,fontWeight:700,fontSize:15,color:C.acc}}>{yh.year}</div>
          <div style={{fontFamily:mono,fontSize:10,color:C.dim}}>#{yh.rank} · {yh.trophies}[W]</div>
          <div style={{fontFamily:mono,fontSize:10,color:C.gold}}>${yh.budgetEnd}K</div>
        </div>))}
      </div>
    </div>)}

    {/* Actions */}
    <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:8}}>
      <button onClick={onBeginNewYear}
        style={{background:C.acc,color:"#0a0c10",border:"none",borderRadius:10,padding:"14px 32px",fontFamily:mono,fontWeight:800,fontSize:16}}>
        BEGIN {yr+1} SEASON →
      </button>
      <button onClick={onMenu}
        style={{background:C.panel,color:C.dim,border:`1px solid ${C.line}`,borderRadius:10,padding:"14px 20px",fontFamily:mono,fontWeight:700,fontSize:13}}>
        MAIN MENU
      </button>
    </div>
  </div>);
}

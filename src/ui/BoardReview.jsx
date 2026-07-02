import React from 'react';
import { C, mono } from './theme.js';
import { SeasonHistory } from './SeasonHistory.jsx';

function ObjRow({obj}){
  const met=obj.met;
  const col=met?C.win:C.red;
  return(
  <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
    background:met?C.win+"12":C.red+"0d",
    border:`1px solid ${col}33`,borderRadius:8,marginBottom:6}}>
    <span style={{fontFamily:mono,fontWeight:800,fontSize:15,color:col,minWidth:16}}>{met?"✓":"✗"}</span>
    <span style={{fontSize:13,color:met?C.ink:C.dim,flex:1}}>{obj.label}</span>
    <span style={{fontFamily:mono,fontSize:12,color:met?C.gold:C.faint}}>
      {met?`+$${obj.reward}K`:`missed (+$${obj.reward}K)`}
    </span>
  </div>);
}

function AwardRow({icon,label,player,team,detail,color,myTeam}){
  const isOwn=team===myTeam;
  return(
  <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
    background:isOwn?C.live+"14":C.gold+"0a",
    border:`1px solid ${isOwn?C.acc+"44":color+"33"}`,borderRadius:8}}>
    <span style={{fontFamily:mono,fontWeight:800,fontSize:11,color,minWidth:32,textAlign:"center",
      background:color+"18",borderRadius:5,padding:"3px 6px"}}>{icon}</span>
    <div style={{flex:1}}>
      <div style={{fontSize:13,fontWeight:700,color:isOwn?C.acc:C.ink}}>{player} <span style={{fontFamily:mono,fontSize:10,color:C.dim,fontWeight:400}}>{team}</span></div>
      <div style={{fontFamily:mono,fontSize:10,color:C.faint}}>{label} — {detail}</div>
    </div>
  </div>);
}

export function BoardReview({season,myTeam,onBeginNewYear,onMenu}){
  const objectives=season.boardObjectives||[];
  const summary=season.boardSummary;
  const metCount=objectives.filter(o=>o.met).length;
  const total=objectives.length;
  const ratio=total>0?metCount/total:0;
  const verdict=ratio===1?"BOARD IS DELIGHTED":ratio>=0.67?"BOARD IS SATISFIED":ratio>=0.34?"BOARD IS CONCERNED":"BOARD IS DISAPPOINTED";
  const verdictColor=ratio===1?C.win:ratio>=0.67?C.gold:ratio>=0.34?C.bronze:C.red;
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
    <div style={{fontFamily:sans,fontSize:9.5,fontWeight:700,color:C.faint,letterSpacing:.7,marginBottom:8}}>Board objectives</div>
    <div style={{marginBottom:20}}>
      {objectives.map(o=><ObjRow key={o.id} obj={o}/>)}
      {objectives.length===0&&<div style={{fontFamily:mono,fontSize:12,color:C.faint}}>No objectives were set this season.</div>}
    </div>

    {/* Budget breakdown */}
    {summary&&(
    <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,padding:"16px 20px",marginBottom:20}}>
      <div style={{fontFamily:sans,fontSize:9.5,fontWeight:700,color:C.faint,letterSpacing:.7,marginBottom:12}}>BUDGET FOR {yr+1} SEASON</div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        <div style={{display:"flex",justifyContent:"space-between",fontFamily:mono,fontSize:12,color:C.dim}}>
          <span>Budget carryover (full balance)</span>
          <span style={{color:summary.carryover>=0?C.gold:C.red}}>{summary.carryover>=0?"+":""}${summary.carryover}K</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontFamily:mono,fontSize:12,color:C.dim}}>
          <span>Board rewards ({metCount} objectives)</span>
          <span style={{color:summary.totalReward>0?C.win:C.faint}}>+${summary.totalReward}K</span>
        </div>
        <div style={{borderTop:`1px solid ${C.line}`,paddingTop:8,marginTop:4,display:"flex",justifyContent:"space-between"}}>
          <span style={{fontFamily:mono,fontSize:14,fontWeight:800,color:C.ink}}>New season budget</span>
          <span style={{fontFamily:mono,fontSize:16,fontWeight:800,color:summary.newBudget>=0?C.gold:C.red}}>{summary.newBudget<0?"-":""}${Math.abs(summary.newBudget)}K</span>
        </div>
      </div>
    </div>)}

    {/* Season Awards */}
    {summary?.awards&&(
    <div style={{marginBottom:20}}>
      <div style={{fontFamily:sans,fontSize:9.5,fontWeight:700,color:C.faint,letterSpacing:.7,marginBottom:8}}>Season awards</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {summary.awards.mvp&&<AwardRow icon="MVP" label="Season MVP" player={summary.awards.mvp.name} team={summary.awards.mvp.team} detail={`${summary.awards.mvp.rating.toFixed(2)} rating · ${summary.awards.mvp.maps} maps`} color={C.gold} myTeam={myTeam}/>}
        {summary.awards.bestAWP&&<AwardRow icon="AWP" label="Best AWPer" player={summary.awards.bestAWP.name} team={summary.awards.bestAWP.team} detail={`${summary.awards.bestAWP.rating.toFixed(2)} rating`} color={C.live} myTeam={myTeam}/>}
        {summary.awards.rookie&&<AwardRow icon="ROY" label="Rookie of the Year" player={summary.awards.rookie.name} team={summary.awards.rookie.team} detail={`${summary.awards.rookie.rating.toFixed(2)} rating · age ${summary.awards.rookie.age}`} color={C.win} myTeam={myTeam}/>}
        {summary.awards.mostImproved&&<AwardRow icon="+OVR" label="Most Improved" player={summary.awards.mostImproved.name} team={summary.awards.mostImproved.team} detail={`+${summary.awards.mostImproved.gain} OVR growth`} color={C.acc} myTeam={myTeam}/>}
        {summary.awards.clutchKing&&<AwardRow icon="CLT" label="Clutch King" player={summary.awards.clutchKing.name} team={summary.awards.clutchKing.team} detail={`${summary.awards.clutchKing.clutches} clutch rounds`} color={C.acc2} myTeam={myTeam}/>}
      </div>
      {summary.awards.allStar&&summary.awards.allStar.length>0&&(
      <div style={{marginTop:12}}>
        <div style={{fontFamily:sans,fontSize:9.5,fontWeight:700,color:C.faint,letterSpacing:.7,marginBottom:6}}>All-star team</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {summary.awards.allStar.map((p,i)=>{
            const isOwn=p.team===myTeam;
            return(
            <div key={i} style={{background:isOwn?C.live+"1a":C.panel,border:`1px solid ${isOwn?C.acc+"55":C.line}`,borderRadius:8,padding:"8px 12px",minWidth:100}}>
              <div style={{fontWeight:700,fontSize:13,color:isOwn?C.acc:C.ink}}>{p.name}</div>
              <div style={{fontFamily:mono,fontSize:9,color:C.dim}}>{p.team} · {p.role}</div>
              <div style={{fontFamily:mono,fontSize:11,color:C.gold,marginTop:2}}>{p.rating.toFixed(2)} avg</div>
            </div>);})}
        </div>
      </div>)}
    </div>)}

    {/* Season results */}
    <div style={{fontFamily:sans,fontSize:9.5,fontWeight:700,color:C.faint,letterSpacing:.7,marginBottom:8}}>Season results</div>
    <div style={{marginBottom:20}}>
      <SeasonHistory season={season} myTeam={myTeam}/>
    </div>

    {/* Previous years */}
    {season.yearHistory?.length>0&&(
    <div style={{marginBottom:24}}>
      <div style={{fontFamily:sans,fontSize:9.5,fontWeight:700,color:C.faint,letterSpacing:.7,marginBottom:8}}>Career history</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {season.yearHistory.map((yh,i)=>(
        <div key={i} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,padding:"10px 14px",minWidth:110}}>
          <div style={{fontFamily:mono,fontWeight:700,fontSize:15,color:C.acc}}>{yh.year}</div>
          <div style={{fontFamily:mono,fontSize:10,color:C.dim}}>#{yh.rank} · {yh.trophies} titles</div>
          <div style={{fontFamily:mono,fontSize:10,color:C.gold}}>${yh.budgetEnd}K</div>
        </div>))}
      </div>
    </div>)}

    {/* Actions */}
    <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:8}}>
      <button onClick={onBeginNewYear}
        style={{background:C.acc,color:C.onAcc,border:"none",borderRadius:10,padding:"14px 32px",fontFamily:mono,fontWeight:800,fontSize:16}}>
        BEGIN {yr+1} SEASON →
      </button>
      <button onClick={onMenu}
        style={{background:C.panel,color:C.dim,border:`1px solid ${C.line}`,borderRadius:10,padding:"14px 20px",fontFamily:mono,fontWeight:700,fontSize:13}}>
        MAIN MENU
      </button>
    </div>
  </div>);
}

import React, { useState } from 'react';
import { C, sans, mono, GRAD } from './theme.js';
import { MAPS, AI_TEAMS, PLAYERS_INIT } from '../constants/data.js';
import { DRAFT_BUDGET, ACTIVITIES, COACHES, FACILITIES, SEASON_WEEKS } from '../constants/events.js';
import { playerOvr, draftCost } from '../engine/player.js';
import { initState } from '../engine/state.js';
import { rosterOf, freeAgents, profileFor } from '../engine/state.js';
import { Pill, TraitPill, MiniStat, Intro, SL, Empty, Stat, Wordmark } from './primitives.jsx';
import { Gstyle } from './Gstyle.jsx';
import { PlayerProfile } from './RosterView.jsx';

// Mirrors the role/tactic identity used in TacticsView.jsx and the AI auto-assignment
// in engine/state.js, so the draft preview foreshadows real mid-season mechanics.
const IDENTITY_FIT={
  "Aggressive":{color:C.acc,fit:p=>p.role==="Entry"?p.aim:0,desc:"Entry fraggers lead every round"},
  "Structured":{color:C.live,fit:p=>p.role==="IGL"?p.igl:0,desc:"IGL-driven, disciplined setups"},
  "AWP-Dependent":{color:C.awp,fit:p=>p.role==="AWP"?p.awp:0,desc:"Built around your AWPer"},
};
function suggestedIdentity(roster){
  let best=null,bestScore=0;
  for(const style of Object.keys(IDENTITY_FIT)){
    const scores=roster.map(IDENTITY_FIT[style].fit).filter(v=>v>0);
    const score=scores.length?Math.max(...scores):0;
    if(score>bestScore){bestScore=score;best=style;}
  }
  return best?{style:best,score:bestScore,...IDENTITY_FIT[best]}:null;
}
function synergyPreview(roster){
  const counts={};roster.forEach(p=>{counts[p.role]=(counts[p.role]||0)+1;});
  const leaders=roster.filter(p=>p.traits.includes("leader")).length;
  const checks=[];let pts=0;
  const igl=counts.IGL||0;
  if(igl===1){pts+=25;checks.push({ok:true,t:"In-game leader set"});}
  else if(igl>=2)checks.push({ok:false,t:"Two callers — only one voice should run rounds"});
  else checks.push({ok:false,t:"No IGL — nobody calling the game"});
  const awp=counts.AWP||0;
  if(awp===1){pts+=25;checks.push({ok:true,t:"Dedicated AWPer"});}
  else if(awp>=2)checks.push({ok:false,t:"Two AWPs — one rifle budget is wasted"});
  else checks.push({ok:false,t:"No AWPer — no long-range pick power"});
  const entry=counts.Entry||0;
  if(entry>=1){pts+=15;checks.push({ok:true,t:"Entry fragger ready"});}
  else checks.push({ok:false,t:"No entry fragger"});
  const support=counts.Support||0;
  if(support>=1){pts+=10;checks.push({ok:true,t:"Utility/support covered"});}
  else checks.push({ok:false,t:"No support player"});
  const lurk=counts.Lurk||0;
  if(lurk>=1){pts+=10;checks.push({ok:true,t:"Lurker for flanks & info"});}
  else checks.push({ok:false,t:"No lurker"});
  pts+=Math.min(10,Object.keys(counts).length*2);
  if(leaders===1)pts+=5;
  else if(leaders>=2){pts-=5;checks.push({ok:false,t:"Two leader-trait players — egos may clash"});}
  return {score:Math.max(0,Math.min(100,pts)),checks,identity:suggestedIdentity(roster)};
}

export function DraftScreen({onComplete}){
  const [name,setName]=useState("");
  const [named,setNamed]=useState(false);
  const [eras,setEras]=useState(["current"]);
  const [simState,setSimState]=useState(null);
  const [budget,setBudget]=useState(DRAFT_BUDGET);
  const [roster,setRoster]=useState([]);
  const [filter,setFilter]=useState("ALL");
  const [sort,setSort]=useState("ovr");
  const [profilePlayer,setProfilePlayer]=useState(null);
  const [page,setPage]=useState(0);
  const PAGE_SIZE=20;
  const teamName=name.trim()||"MY TEAM";

  const ERA_OPTIONS=[
    {id:"current",label:"Current",desc:"2024-25 rosters",color:C.acc},
    {id:"2018",label:"2018-21",desc:"s1mple, Astralis era, coldzera",color:C.live},
    {id:"2015",label:"2015-17",desc:"olof, kennyS, FalleN, fnatic",color:C.gold},
    {id:"2013",label:"2013-14",desc:"GeT_RiGhT, f0rest, NiP, VP",color:C.silver},
  ];

  function toggleEra(id){
    const next=eras.includes(id)?eras.filter(e=>e!==id):[...eras,id];
    if(next.length===0) return; // must have at least one
    setEras(next);
  }

  function confirmSetup(){
    if(!name.trim()) return;
    const ss=initState(eras);
    setSimState(ss);
    setNamed(true);
  }

  function buyPlayer(p){
    const cost=draftCost(p);if(budget<cost||roster.length>=5)return;
    const oldTeam=p.team;p.team=teamName;p.contract=52;
    setBudget(b=>b-cost);setRoster(r=>[...r,p]);
    if(oldTeam!=="FA"){const fas=freeAgents(simState);if(fas.length>0){const best=[...fas].sort((a,b)=>playerOvr(b)-playerOvr(a))[0];best.team=oldTeam;best.contract=104;}}
    if(!simState.stats[p.name])simState.stats[p.name]={maps:0,rating:0,mvps:0,clutches:0};if(!simState.career[p.name])simState.career[p.name]={totalMaps:0,totalMvps:0,totalClutches:0,avgRating:0,bestRating:0,eventHistory:[],mapStats:{},origStats:{aim:p.aim,gameSense:p.gameSense,util:p.util,igl:p.igl,mentality:p.mentality,consistency:p.consistency,rifle:p.rifle,pistol:p.pistol,awp:p.awp,clutch:p.clutch,entry:p.entry,stamina:p.stamina,composure:p.composure,experience:p.experience},kills:0};
  }
  function releasePlayer(p){const refund=Math.round(draftCost(p)*0.5);p.team="FA";p.contract=0;setBudget(b=>b+refund);setRoster(r=>r.filter(x=>x.name!==p.name));}
  function startSeason(){if(roster.length!==5||!simState)return;onComplete(teamName,simState,budget);}

  const avail=simState?simState.players.filter(p=>p.team!==teamName):[];
  const filtered=filter==="ALL"?avail:filter==="FA"?avail.filter(p=>p.team==="FA"):filter==="LEGEND"?avail.filter(p=>(p.era||"current")!=="current"):avail.filter(p=>p.role===filter);
  const sorted=[...filtered].sort((a,b)=>sort==="ovr"?playerOvr(b)-playerOvr(a):sort==="aim"?b.aim-a.aim:sort==="cost"?draftCost(a)-draftCost(b):b.gameSense-a.gameSense);
  const pageCount=Math.max(1,Math.ceil(sorted.length/PAGE_SIZE));
  const curPage=Math.min(page,pageCount-1);
  const pageSlice=sorted.slice(curPage*PAGE_SIZE,curPage*PAGE_SIZE+PAGE_SIZE);
  function setFilterAndReset(f){setFilter(f);setPage(0);}
  function setSortAndReset(s){setSort(s);setPage(0);}

  if(!named)return(
    <div style={{minHeight:"100vh",background:GRAD,color:C.ink,fontFamily:sans,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <Gstyle/>
      <div style={{maxWidth:540,padding:"40px 24px",textAlign:"center",animation:"fadeUp .35s ease"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:22}}><Wordmark size={18}/></div>
        <h1 style={{fontSize:34,fontWeight:800,margin:"0 0 10px",letterSpacing:-.8}}>Build Your Organization</h1>
        <p style={{color:C.dim,fontSize:14,lineHeight:1.65,margin:"0 auto 26px",maxWidth:440}}>
          Name your org, choose which player eras to include, then draft five players for a {SEASON_WEEKS}-week season.
        </p>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter organization name…"
          onKeyDown={e=>{if(e.key==="Enter"&&name.trim())confirmSetup();}}
          style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,padding:"14px 18px",color:C.ink,fontFamily:sans,fontSize:16,fontWeight:700,width:"100%",maxWidth:340,outline:"none",marginBottom:26,textAlign:"center"}}/>
        <div style={{fontFamily:mono,fontSize:11,color:C.dim,letterSpacing:1.5,marginBottom:12,textTransform:"uppercase"}}>Player Eras</div>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:26}}>
          {ERA_OPTIONS.map(e=>{const on=eras.includes(e.id);return(
            <button key={e.id} onClick={()=>toggleEra(e.id)}
              style={{position:"relative",background:on?e.color+"1f":C.panel,border:`1.5px solid ${on?e.color:C.line}`,borderRadius:12,padding:"12px 16px",textAlign:"left",minWidth:120,boxShadow:on?`0 8px 24px -14px ${e.color}`:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:on?e.color:C.faint,boxShadow:on?`0 0 8px ${e.color}`:"none"}}/>
                <span style={{fontWeight:700,fontSize:13,color:on?C.ink:C.dim}}>{e.label}</span>
              </div>
              <div style={{fontSize:10.5,color:on?C.dim:C.faint,marginTop:5,lineHeight:1.4}}>{e.desc}</div>
            </button>);})}
        </div>
        <div style={{fontFamily:mono,fontSize:11,color:C.faint,marginBottom:20}}>
          {PLAYERS_INIT.filter(p=>eras.includes(p.era||"current")).length} players available across {eras.length} era{eras.length>1?"s":""}
        </div>
        <button onClick={confirmSetup} disabled={!name.trim()}
          style={{background:C.acc,color:C.onAcc,border:"none",borderRadius:11,padding:"15px 32px",fontWeight:800,fontSize:15,letterSpacing:.3,boxShadow:`0 12px 32px -14px ${C.acc}`}}>Continue to Draft →</button>
      </div>
    </div>);

  if(!simState) return null; // shouldn't happen but guard

  return(
  <div style={{minHeight:"100vh",background:GRAD,color:C.ink,fontFamily:sans}}>
    <Gstyle/>
    <header style={{borderBottom:`1px solid ${C.line}`,padding:"11px 22px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",position:"sticky",top:0,background:"rgba(15,20,29,.85)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",zIndex:20}}>
      <Wordmark size={15}/>
      <span style={{width:1,height:18,background:C.line}}/>
      <span style={{fontFamily:sans,fontSize:12,color:C.dim,fontWeight:600}}>Draft · <span style={{color:C.ink,fontWeight:700}}>{teamName}</span></span>
      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:6,background:C.panel,border:`1px solid ${C.line}`,borderRadius:9,padding:"5px 11px"}}>
          <span style={{fontFamily:sans,fontSize:9.5,fontWeight:700,color:C.faint,letterSpacing:.7}}>BUDGET</span>
          <span style={{fontFamily:mono,fontSize:12,color:C.gold,fontWeight:700}}>${budget}K</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,background:C.panel,border:`1px solid ${C.line}`,borderRadius:9,padding:"5px 11px"}}>
          <span style={{fontFamily:sans,fontSize:9.5,fontWeight:700,color:C.faint,letterSpacing:.7}}>ROSTER</span>
          <span style={{fontFamily:mono,fontSize:12,color:roster.length===5?C.win:C.ink,fontWeight:700}}>{roster.length}/5</span>
        </div>
      </div>
    </header>
    <main style={{maxWidth:1100,margin:"0 auto",padding:"22px 18px 80px"}}>
      <SL n="RST" t={`${teamName} · YOUR PICKS`}/>
      {roster.length===0?<Empty text="No players drafted yet. Browse the market below."/>:(
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:8}}>
          {roster.map(p=>(
            <div key={p.name} className="lift" onClick={()=>setProfilePlayer(p)} style={{background:C.panel,border:`1px solid ${C.acc}33`,borderRadius:9,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",cursor:"pointer"}}>
              <div style={{minWidth:100}}>
                <div style={{fontWeight:700,fontSize:14}}>{p.name}</div>
                <div style={{display:"flex",gap:4,marginTop:2}}><Pill c={C.dim}>{p.role}</Pill>{p.traits.map(tr=><TraitPill key={tr} t={tr}/>)}</div>
              </div>
              <Stat l="OVR" v={playerOvr(p)}/><Stat l="AIM" v={p.aim}/><Stat l="SENSE" v={p.gameSense}/>
              <span style={{fontFamily:mono,fontSize:11,color:C.gold}}>${p.salary}K/mo</span>
              <span style={{fontFamily:mono,fontSize:9,color:C.faint}}>age {p.age}</span>
              <button onClick={e=>{e.stopPropagation();releasePlayer(p);}} style={{marginLeft:"auto",background:"transparent",border:`1px solid ${C.red}`,color:C.red,borderRadius:6,padding:"5px 10px",fontFamily:mono,fontSize:10,fontWeight:700}}>DROP</button>
            </div>))}
        </div>)}
      {roster.length>0&&(()=>{const syn=synergyPreview(roster);const col=syn.score>=70?C.win:syn.score>=40?C.gold:C.red;return(
        <div style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:10,padding:"14px 16px",marginBottom:16,display:"flex",gap:18,flexWrap:"wrap",alignItems:"flex-start"}}>
          <div style={{minWidth:90,textAlign:"center"}}>
            <div style={{fontFamily:sans,fontSize:9.5,fontWeight:700,color:C.faint,letterSpacing:.7,marginBottom:4}}>SYNERGY</div>
            <div style={{fontFamily:mono,fontSize:30,fontWeight:800,color:col,lineHeight:1}}>{syn.score}</div>
            <div style={{height:5,background:C.line,borderRadius:3,overflow:"hidden",marginTop:6}}>
              <div style={{width:`${syn.score}%`,height:"100%",background:col,borderRadius:3}}/>
            </div>
          </div>
          <div style={{flex:1,minWidth:220,display:"flex",flexDirection:"column",gap:3}}>
            {syn.checks.map((c,i)=>(
              <span key={i} style={{fontFamily:mono,fontSize:11,color:c.ok?C.dim:C.faint,display:"flex",alignItems:"center",gap:6}}>
                <span style={{color:c.ok?C.win:C.red,fontWeight:700}}>{c.ok?"✓":"✗"}</span>{c.t}
              </span>
            ))}
          </div>
          {syn.identity&&<div style={{minWidth:150,padding:"8px 12px",background:syn.identity.color+"14",border:`1px solid ${syn.identity.color}44`,borderRadius:8}}>
            <div style={{fontFamily:sans,fontSize:9.5,fontWeight:700,color:C.faint,letterSpacing:.7,marginBottom:3}}>SUGGESTED IDENTITY</div>
            <div style={{fontFamily:mono,fontSize:13,fontWeight:800,color:syn.identity.color}}>{syn.identity.style}</div>
            <div style={{fontSize:10.5,color:C.dim,marginTop:3,lineHeight:1.4}}>{syn.identity.desc}</div>
          </div>}
        </div>);})()}
      {roster.length===5&&<div style={{display:"flex",justifyContent:"center",padding:"16px 0 24px"}}>
        <button onClick={startSeason} style={{background:C.acc,color:C.onAcc,border:"none",borderRadius:10,padding:"16px 36px",fontWeight:800,fontSize:17,letterSpacing:.5}}>START SEASON →</button>
      </div>}
      {roster.length>0&&roster.length<5&&<div style={{textAlign:"center",padding:"10px 0 20px",fontFamily:mono,fontSize:12,color:C.dim}}>Need {5-roster.length} more · ${budget}K remaining</div>}
      <SL n="MKT" t="PLAYER MARKET"/>
      <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap",marginBottom:10,fontFamily:mono,fontSize:10.5,color:C.dim}}>
        <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:8,height:8,borderRadius:2,background:C.win,display:"inline-block"}}/>SIGN — free agent, costs market value</span>
        <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:8,height:8,borderRadius:2,background:C.live,display:"inline-block"}}/>BUY — under contract elsewhere, costs 1.5× value (poaching premium)</span>
        <span style={{color:C.faint}}>· click a player to view full stats</span>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
        {["ALL","FA","LEGEND","IGL","AWP","Entry","Lurk","Support"].map(f=>(
          <button key={f} onClick={()=>setFilterAndReset(f)} style={{background:filter===f?C.acc:C.panel,color:filter===f?C.onAcc:C.dim,border:`1px solid ${filter===f?C.acc:C.line}`,borderRadius:6,padding:"5px 10px",fontFamily:mono,fontSize:10,fontWeight:700}}>{f}</button>
        ))}
        <span style={{width:1,background:C.line,margin:"0 4px"}}/>
        {[["ovr","OVR"],["aim","AIM"],["cost","COST"]].map(([k,l])=>(
          <button key={k} onClick={()=>setSortAndReset(k)} style={{background:sort===k?C.live:C.panel,color:sort===k?C.onAcc:C.dim,border:`1px solid ${sort===k?C.live:C.line}`,borderRadius:6,padding:"5px 10px",fontFamily:mono,fontSize:10,fontWeight:700}}>↕ {l}</button>
        ))}
        <span style={{marginLeft:"auto",fontFamily:mono,fontSize:10.5,color:C.faint}}>{sorted.length} players</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {pageSlice.map(p=>{const cost=draftCost(p);const canBuy=budget>=cost&&roster.length<5;const isFA=p.team==="FA";return(
          <div key={p.name} className="lift" onClick={()=>setProfilePlayer(p)} style={{background:(p.era&&p.era!=="current")?C.panel2+"":C.panel2,border:`1px solid ${p.era&&p.era!=="current"?C.gold+"44":isFA?C.win+"33":C.line}`,borderRadius:8,padding:"9px 13px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",cursor:"pointer"}}>
            <div style={{minWidth:85}}>
              <div style={{fontWeight:600,fontSize:13}}>{p.name}</div>
              <div style={{display:"flex",gap:3,marginTop:1}}>
                <Pill c={C.dim}>{p.role}</Pill>
                {p.traits.map(tr=><TraitPill key={tr} t={tr}/>)}
                {p.era&&p.era!=="current"&&<Pill c={p.era==="2018"?C.live:p.era==="2015"?C.gold:C.silver}>{p.era}</Pill>}
              </div>
            </div>
            <Stat l="OVR" v={playerOvr(p)}/><Stat l="AIM" v={p.aim}/><Stat l="SENSE" v={p.gameSense}/><Stat l="CON" v={p.consistency}/>
            <span style={{fontFamily:mono,fontSize:9,color:C.faint}}>age {p.age}</span>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:55}}>
              <span style={{fontFamily:mono,fontSize:9,color:C.faint}}>{isFA?"STATUS":"FROM"}</span>
              <span style={{fontFamily:mono,fontSize:11,color:isFA?C.win:C.dim}}>{isFA?"Free Agent":p.team}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",marginLeft:"auto",minWidth:80}}>
              <span style={{fontFamily:mono,fontSize:9,color:isFA?C.win:C.live,fontWeight:700}}>{isFA?"SIGN":"BUY · 1.5×"}</span>
              <span style={{fontFamily:mono,fontSize:13,fontWeight:700,color:canBuy?C.gold:C.red}}>${cost}K</span>
            </div>
            <button onClick={e=>{e.stopPropagation();buyPlayer(p);}} disabled={!canBuy}
              style={{background:canBuy?(isFA?C.win:C.live):"#333",color:canBuy?C.onAcc:C.faint,border:"none",borderRadius:6,padding:"6px 14px",fontFamily:mono,fontSize:11,fontWeight:700}}>
              {isFA?"SIGN":"BUY"}
            </button>
          </div>);})}
      </div>
      {pageCount>1&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:"16px 0 4px"}}>
        <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={curPage===0}
          style={{background:C.panel,border:`1px solid ${C.line}`,color:C.ink,borderRadius:6,padding:"6px 12px",fontFamily:mono,fontSize:11,fontWeight:700}}>← PREV</button>
        <span style={{fontFamily:mono,fontSize:11,color:C.dim}}>Page {curPage+1} / {pageCount}</span>
        <button onClick={()=>setPage(p=>Math.min(pageCount-1,p+1))} disabled={curPage>=pageCount-1}
          style={{background:C.panel,border:`1px solid ${C.line}`,color:C.ink,borderRadius:6,padding:"6px 12px",fontFamily:mono,fontSize:11,fontWeight:700}}>NEXT →</button>
      </div>}
    </main>
    {profilePlayer&&<PlayerProfile p={profilePlayer} state={simState} onClose={()=>setProfilePlayer(null)}/>}
  </div>);
}

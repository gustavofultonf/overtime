import React, { useState, useEffect } from 'react';
import { C, sans, mono } from './theme.js';
import { MAPS } from '../constants/data.js';
import { autoVeto, getMapProf, mapRating, isRivalMatch } from '../engine/state.js';
import { playSeries } from '../engine/match.js';
import { Overlay, SL, EdgeBar, TeamCrest } from './primitives.jsx';

export function VetoOverlay({session,myTeam,t,onClose,onResolved}){
  const opp=session.opp;
  const bo=session.bo;
  const [allMaps]=useState(session.remaining);            // full pool, never shrinks
  const [remaining,setRemaining]=useState(session.remaining);
  const [picked,setPicked]=useState(session.picked);
  const [log,setLog]=useState(session.log);
  const [stepIdx,setStepIdx]=useState(0);
  const [resolving,setResolving]=useState(false);
  const [anim,setAnim]=useState(null);                    // last acted {map,action,who}
  const rival=isRivalMatch(t.simState,myTeam,opp);

  // ── Bo1: single pick ──
  if(bo===1&&!resolving){
    const chooseBo1=(map)=>{setResolving(true);const res=playSeries(t.simState,myTeam,opp,1,{stage:"group"},t.rng,[map]);onResolved(res,session.fixture);};
    return(
    <Overlay onClose={onClose} title={`MAP PICK · BO1 · vs ${opp}${rival?" · [!] RIVALRY":""}`} wide>
      <VetoHeader myTeam={myTeam} opp={opp} state={t.simState} rival={rival}/>
      <p style={{color:C.dim,fontSize:13,margin:"14px 0",lineHeight:1.6}}>Pick your map. Green bar = you're favored.</p>
      <MapBoard allMaps={allMaps} log={[]} picked={[]} remaining={allMaps} decider={null}
        myTeam={myTeam} opp={opp} state={t.simState} onPick={chooseBo1} anim={null} yourTurn/>
    </Overlay>);
  }

  const steps=bo===5
    ?[[myTeam,"ban"],[opp,"ban"],[myTeam,"pick"],[opp,"pick"],[myTeam,"pick"],[opp,"pick"]]
    :[[myTeam,"ban"],[opp,"ban"],[myTeam,"pick"],[opp,"pick"],[myTeam,"ban"],[opp,"ban"]];
  const step=steps[stepIdx];
  const isYour=step&&step[0]===myTeam&&!resolving;
  const decider=(stepIdx>=steps.length&&remaining.length>=1)?remaining[0]:null;

  function aiChoose(action,rem){
    let best=rem[0],bv=-Infinity;
    for(const m of rem){const v=action==="ban"?(mapRating(t.simState,myTeam,m)-mapRating(t.simState,opp,m)):(mapRating(t.simState,opp,m)-mapRating(t.simState,myTeam,m));if(v>bv){bv=v;best=m;}}
    return best;
  }

  function applyAction(who,action,map){
    setAnim({map,action,who,k:Date.now()});
    setRemaining(r=>r.filter(m=>m!==map));
    setLog(l=>[...l,{who,action,map}]);
    if(action==="pick") setPicked(p=>[...p,map]);
    setStepIdx(i=>i+1);
  }

  function playerPick(map){ if(isYour) applyAction(myTeam,step[1],map); }

  // ── Drives AI turns + final resolution, one step at a time ──
  useEffect(()=>{
    if(resolving) return;
    if(stepIdx>=steps.length){
      // Decider is whatever remains; reveal it, then resolve
      const dec=remaining[0];
      const finalMaps=[...picked,dec];
      const reveal=setTimeout(()=>setAnim({map:dec,action:"decider",who:null,k:Date.now()}),300);
      const stage=session.fixture===t.bracket?.final?"final":bo===3?(t.stage||"qf"):"group";
      const go=setTimeout(()=>{setResolving(true);const res=playSeries(t.simState,myTeam,opp,bo,{stage},t.rng,finalMaps);onResolved(res,session.fixture);},1500);
      return ()=>{clearTimeout(reveal);clearTimeout(go);};
    }
    const s=steps[stepIdx];
    if(s[0]!==myTeam){
      const timer=setTimeout(()=>{const ai=aiChoose(s[1],remaining);applyAction(opp,s[1],ai);},1000);
      return ()=>clearTimeout(timer);
    }
  },[stepIdx,resolving]); // eslint-disable-line

  const phaseText=resolving?"Resolving series…"
    :stepIdx>=steps.length?"Decider locked — heading to the server…"
    :isYour?<span><b style={{color:C.acc}}>YOUR TURN</b> — {step[1]==="ban"?"ban a map":"pick a map"}</span>
    :<span style={{color:C.dim}}>{opp} is {step[1]==="ban"?"banning":"picking"}…</span>;

  return(
  <Overlay onClose={onClose} title={`MAP VETO · BO${bo} · vs ${opp}${rival?" · [!] RIVALRY":""}`} wide>
    <VetoHeader myTeam={myTeam} opp={opp} state={t.simState} rival={rival}/>
    {/* Sequence strip */}
    <VetoStrip steps={steps} stepIdx={stepIdx} log={log} myTeam={myTeam} opp={opp} resolving={resolving||stepIdx>=steps.length}/>
    {/* Status banner */}
    <div style={{background:isYour?"rgba(255,92,46,.12)":C.panel2,border:`1px solid ${isYour?C.acc:C.line}`,borderRadius:8,padding:"11px 14px",margin:"12px 0 16px",fontFamily:mono,fontSize:13,minHeight:18}}>
      {phaseText}
    </div>
    <MapBoard allMaps={allMaps} log={log} picked={picked} remaining={remaining} decider={decider}
      myTeam={myTeam} opp={opp} state={t.simState} onPick={isYour?playerPick:null} anim={anim} yourTurn={isYour}/>
  </Overlay>);
}

// ── Versus header with crests ──
function VetoHeader({myTeam,opp,state,rival}){
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:18,padding:"4px 0 2px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <TeamCrest name={myTeam} size={34}/>
        <span style={{fontWeight:800,fontSize:15,color:C.acc}}>{myTeam}</span>
      </div>
      <span style={{fontFamily:mono,fontSize:12,color:rival?C.rival:C.faint,fontWeight:700,letterSpacing:1}}>{rival?"⚔ RIVALRY":"VS"}</span>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontWeight:800,fontSize:15}}>{opp}</span>
        <TeamCrest name={opp} size={34}/>
      </div>
    </div>
  );
}

// ── Ordered ban/pick sequence ──
function VetoStrip({steps,stepIdx,log,myTeam,opp,resolving}){
  return(
    <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center",marginTop:12}}>
      {steps.map((s,i)=>{
        const done=i<stepIdx;
        const active=i===stepIdx&&!resolving;
        const entry=log[i];
        const who=s[0]===myTeam?"YOU":opp;
        const isBan=s[1]==="ban";
        const col=isBan?C.red:C.win;
        return(
          <div key={i} style={{
            display:"flex",flexDirection:"column",alignItems:"center",minWidth:64,
            background:done?(isBan?"rgba(255,76,76,.08)":"rgba(61,220,132,.08)"):active?C.acc+"18":C.panel2,
            border:`1px solid ${active?C.acc:done?col+"55":C.line}`,borderRadius:6,padding:"4px 6px",
            opacity:done||active?1:0.5,transition:"all .25s ease",
          }}>
            <span style={{fontFamily:mono,fontSize:8,color:s[0]===myTeam?C.acc:C.dim,letterSpacing:.5}}>{who}</span>
            <span style={{fontFamily:mono,fontSize:9,fontWeight:700,color:col}}>{isBan?"BAN":"PICK"}</span>
            <span style={{fontFamily:mono,fontSize:8,color:done?C.ink:C.faint,whiteSpace:"nowrap",maxWidth:60,overflow:"hidden",textOverflow:"ellipsis"}}>
              {entry?entry.map:active?"…":"—"}
            </span>
          </div>
        );
      })}
      {/* Decider slot */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:64,background:resolving?"rgba(255,194,75,.1)":C.panel2,border:`1px solid ${resolving?C.gold:C.line}`,borderRadius:6,padding:"4px 6px",opacity:resolving?1:0.5,transition:"all .25s ease"}}>
        <span style={{fontFamily:mono,fontSize:8,color:C.gold,letterSpacing:.5}}>LEFT</span>
        <span style={{fontFamily:mono,fontSize:9,fontWeight:700,color:C.gold}}>DECIDER</span>
        <span style={{fontFamily:mono,fontSize:8,color:C.faint}}>◆</span>
      </div>
    </div>
  );
}

// ── Map board: all maps always shown, stamped as they're vetoed ──
function MapBoard({allMaps,log,picked,remaining,decider,myTeam,opp,state,onPick,anim,yourTurn}){
  const statusOf=(m)=>{
    const entry=log.find(l=>l.map===m);
    if(entry) return {kind:entry.action,who:entry.who};
    if(decider===m) return {kind:"decider",who:null};
    return {kind:"open",who:null};
  };
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10}}>
      {allMaps.map(m=>{
        const st=statusOf(m);
        const edge=mapRating(state,myTeam,m)-mapRating(state,opp,m);
        const isOpen=st.kind==="open";
        const clickable=isOpen&&onPick;
        const justActed=anim&&anim.map===m;
        const banned=st.kind==="ban";
        const isPick=st.kind==="pick";
        const isDecider=st.kind==="decider";
        const accent=banned?C.red:isPick?C.win:isDecider?C.gold:edge>0?"#2f6b45":C.line;
        const whoLabel=st.who===myTeam?"YOU":st.who===opp?opp:null;
        return(
          <button key={m} onClick={()=>clickable&&onPick(m)} disabled={!clickable}
            style={{
              position:"relative",overflow:"hidden",
              background:banned?"rgba(255,76,76,.05)":isPick?"rgba(61,220,132,.07)":isDecider?"rgba(255,194,75,.08)":C.panel,
              border:`1px solid ${accent}`,borderRadius:8,padding:"12px 13px",textAlign:"left",
              opacity:banned?0.5:1,transition:"all .4s ease",cursor:clickable?"pointer":"default",
              animation:isDecider?"deciderGlow 1.6s ease-in-out infinite":undefined,
            }}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontWeight:700,fontSize:14,color:banned?C.faint:C.ink,textDecoration:banned?"line-through":"none"}}>{m}</span>
              {clickable&&<span style={{fontFamily:mono,fontSize:9,color:yourTurn?C.acc:C.faint}}>▸</span>}
            </div>
            <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginBottom:6}}>prof: {getMapProf(state,myTeam)[m]||50}</div>
            <EdgeBar edge={edge}/>
            {/* Stamp overlay */}
            {!isOpen&&(
              <div style={{
                position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%) rotate(-8deg)",
                animation:justActed?"stampIn .4s ease":undefined,
                border:`2px solid ${accent}`,borderRadius:5,padding:"2px 10px",
                background:"rgba(10,12,16,.55)",pointerEvents:"none",textAlign:"center",
              }}>
                <div style={{fontFamily:mono,fontSize:13,fontWeight:800,color:accent,letterSpacing:1}}>
                  {banned?"BANNED":isPick?"PICK":"DECIDER"}
                </div>
                {whoLabel&&<div style={{fontFamily:mono,fontSize:8,color:C.dim}}>by {whoLabel}</div>}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Kept for any external imports
export function MapGrid({maps,myTeam,opp,state,onPick,disabled}){return(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10}}>
  {maps.map(m=>{const edge=mapRating(state,myTeam,m)-mapRating(state,opp,m);return(
    <button key={m} onClick={()=>onPick&&onPick(m)} disabled={disabled||!onPick}
      style={{background:C.panel,border:`1px solid ${edge>0?"#2f6b45":C.line}`,borderRadius:8,padding:"12px 13px",textAlign:"left"}}>
      <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{m}</div>
      <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginBottom:4}}>prof: {getMapProf(state,myTeam)[m]||50}</div>
      <EdgeBar edge={edge}/>
    </button>);})}
</div>);}

import React, { useState } from 'react';
import { C, sans, mono } from './theme.js';
import { MAPS } from '../constants/data.js';
import { autoVeto, getMapProf } from '../engine/state.js';
import { Overlay, SL } from './primitives.jsx';

export function VetoOverlay({session,myTeam,t,onClose,onResolved}){
  const opp=session.opp;
  const [remaining,setRemaining]=useState(session.remaining);
  const [picked,setPicked]=useState(session.picked);
  const [log,setLog]=useState(session.log);
  const [resolving,setResolving]=useState(false);
  const [stepIdx,setStepIdx]=useState(0);
  const bo=session.bo;
  const rival=isRivalMatch(t.simState,myTeam,opp);

  if(bo===1&&!resolving){
    const chooseBo1=(map)=>{setResolving(true);const res=playSeries(t.simState,myTeam,opp,1,{stage:"group"},t.rng,[map]);onResolved(res,session.fixture);};
    return(
    <Overlay onClose={onClose} title={`MAP PICK · BO1 · vs ${opp}${rival?" · [!] RIVALRY":""}`}>
      <p style={{color:C.dim,fontSize:13,margin:"0 0 14px",lineHeight:1.6}}>Pick your map. Green = favored.</p>
      <MapGrid maps={remaining} myTeam={myTeam} opp={opp} state={t.simState} onPick={chooseBo1}/>
    </Overlay>);}

  const steps=bo===5
    ?[[myTeam,"ban"],[opp,"ban"],[myTeam,"pick"],[opp,"pick"],[myTeam,"pick"],[opp,"pick"]]
    :[[myTeam,"ban"],[opp,"ban"],[myTeam,"pick"],[opp,"pick"],[myTeam,"ban"],[opp,"ban"]];
  const step=steps[stepIdx];const isYour=step&&step[0]===myTeam&&!resolving;

  function aiChoose(action,rem){
    let best=rem[0],bv=-Infinity;
    for(const m of rem){const v=action==="ban"?(mapRating(t.simState,myTeam,m)-mapRating(t.simState,opp,m)):(mapRating(t.simState,opp,m)-mapRating(t.simState,myTeam,m));if(v>bv){bv=v;best=m;}}
    return best;
  }
  function act(map){
    let rem=remaining.filter(m=>m!==map);const newLog=[...log,{who:myTeam,action:step[1],map}];const newPicked=step[1]==="pick"?[...picked,map]:[...picked];let idx=stepIdx+1;
    while(idx<steps.length&&steps[idx][0]!==myTeam){const s=steps[idx];const ai=aiChoose(s[1],rem);rem=rem.filter(m=>m!==ai);newLog.push({who:opp,action:s[1],map:ai});if(s[1]==="pick")newPicked.push(ai);idx++;}
    setRemaining(rem);setLog(newLog);setPicked(newPicked);setStepIdx(idx);
    if(idx>=steps.length){const decider=rem[0];const finalMaps=[...newPicked,decider];setResolving(true);
      const stage=session.fixture===t.bracket?.final?"final":bo===3?(t.stage||"qf"):"group";
      setTimeout(()=>{const res=playSeries(t.simState,myTeam,opp,bo,{stage},t.rng,finalMaps);onResolved(res,session.fixture);},200);
    }
  }
  return(
  <Overlay onClose={onClose} title={`MAP VETO · BO${bo} · vs ${opp}${rival?" · [!] RIVALRY":""}`} wide>
    <div style={{background:isYour?"rgba(255,92,46,.12)":C.panel2,border:`1px solid ${isYour?C.acc:C.line}`,borderRadius:8,padding:"11px 14px",marginBottom:16,fontFamily:mono,fontSize:13}}>
      {resolving?"Resolving series…":isYour?<span><b style={{color:C.acc}}>YOUR TURN</b> — {step[1]==="ban"?"ban a map":"pick a map"}</span>:"…"}
    </div>
    <MapGrid maps={remaining} myTeam={myTeam} opp={opp} state={t.simState} onPick={isYour?act:null} disabled={!isYour}/>
    <div style={{marginTop:16,fontFamily:mono,fontSize:12,color:C.dim,lineHeight:1.9}}>
      {log.map((l,i)=>(<div key={i}><span style={{color:l.who===myTeam?C.acc:C.dim}}>{l.who===myTeam?"YOU":opp.toUpperCase()}</span>{" "}{l.action==="ban"?"x banned":"ok picked"} {l.map}</div>))}
      {picked.length>=2&&remaining.length===1&&<div><span style={{color:C.live}}>DECIDER</span> ◆ {remaining[0]}</div>}
    </div>
  </Overlay>);}

export function MapGrid({maps,myTeam,opp,state,onPick,disabled}){return(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10}}>
  {maps.map(m=>{const edge=mapRating(state,myTeam,m)-mapRating(state,opp,m);return(
    <button key={m} onClick={()=>onPick&&onPick(m)} disabled={disabled||!onPick}
      style={{background:C.panel,border:`1px solid ${edge>0?"#2f6b45":C.line}`,borderRadius:8,padding:"12px 13px",textAlign:"left"}}>
      <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{m}</div>
      <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginBottom:4}}>prof: {getMapProf(state,myTeam)[m]||50}</div>
      <EdgeBar edge={edge}/>
    </button>);})}
</div>);}

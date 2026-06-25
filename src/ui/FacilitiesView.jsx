import React from 'react';
import { C, sans, mono } from './theme.js';
import { FACILITIES } from '../constants/events.js';
import { Intro, SL } from './primitives.jsx';

export function FacilitiesView({season,onUpgrade}){
  return(<div>
    <Intro text="Invest in permanent upgrades for your organization. Facilities provide passive bonuses every week."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
      {Object.entries(FACILITIES).map(([id,fac])=>{
        const tier=season.facilities?.[id]||0;
        const maxed=tier>=fac.maxTier;
        const nextCost=maxed?null:fac.cost[tier];
        const canAfford=nextCost&&season.budget>=nextCost;
        return(
        <div key={id} style={{background:C.panel,border:`1px solid ${tier>0?C.win+"44":C.line}`,borderRadius:10,padding:"14px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:22}}>{fac.icon}</span>
            <div>
              <div style={{fontWeight:700,fontSize:14}}>{fac.name}</div>
              <div style={{display:"flex",gap:3,marginTop:2}}>
                {Array.from({length:fac.maxTier},(_,i)=>(
                  <div key={i} style={{width:16,height:4,borderRadius:2,background:i<tier?C.win:C.line}}/>
                ))}
                <span style={{fontFamily:mono,fontSize:9,color:tier>0?C.win:C.faint,marginLeft:4}}>Tier {tier}/{fac.maxTier}</span>
              </div>
            </div>
          </div>
          {/* Current tier description */}
          {tier>0&&<div style={{fontSize:10,color:C.win,marginBottom:6,fontFamily:mono}}>{fac.desc[tier-1]}</div>}
          {/* Next tier */}
          {!maxed?(
            <div style={{marginTop:6}}>
              <div style={{fontSize:11,color:C.dim,marginBottom:6}}>{tier===0?"Unlock:":"Upgrade:"} {fac.desc[tier]}</div>
              <button onClick={()=>onUpgrade(id)} disabled={!canAfford}
                style={{width:"100%",background:canAfford?C.acc:"#333",color:canAfford?"#0a0c10":C.faint,border:"none",borderRadius:7,padding:"8px",fontWeight:700,fontSize:12}}>
                {canAfford?`UPGRADE — ${nextCost}K`:`$${nextCost}K (need $${nextCost-season.budget}K more)`}
              </button>
            </div>
          ):(
            <div style={{fontFamily:mono,fontSize:10,color:C.gold,marginTop:6}}>ok MAX TIER</div>
          )}
        </div>);
      })}
    </div>
  </div>);
}

import React from 'react';
import { C, sans, mono } from './theme.js';
import { playerOvr, desiredSalary } from '../engine/utils.js';
import { rosterOf, hierarchyTier } from '../engine/state.js';
import { contractLabel } from '../constants/events.js';

const TIER_COLOR={Leader:C.gold,Star:C.live,Player:C.dim,Prospect:C.acc};
const TIER_BG={Leader:C.gold+"1a",Star:C.live+"14",Player:"transparent",Prospect:C.acc+"1a"};
const ROLE_COLOR={IGL:C.live,AWP:C.awp,Entry:C.acc,Lurk:C.gold,Support:C.win};

function MoralBar({morale}){
  const col=morale>=70?C.win:morale>=45?C.gold:C.red;
  return(
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <div style={{width:72,height:5,background:C.panel2,borderRadius:3,overflow:"hidden"}}>
        <div style={{width:`${morale}%`,height:"100%",background:col,borderRadius:3,transition:"width .3s"}}/>
      </div>
      <span style={{fontFamily:mono,fontSize:11,fontWeight:700,color:col,minWidth:22}}>{morale}</span>
    </div>
  );
}

function SatisfactionTag({label,ok,warn}){
  const col=ok?C.win:warn?C.gold:C.red;
  return <span style={{fontFamily:mono,fontSize:9,color:col,border:`1px solid ${col}44`,borderRadius:3,padding:"2px 5px",whiteSpace:"nowrap"}}>{label}</span>;
}

export function DynamicsView({season,myTeam}){
  const state=season.simState;
  const roster=rosterOf(state,myTeam);
  const avgMorale=roster.length?Math.round(roster.reduce((s,p)=>s+(p.morale??60),0)/roster.length):60;
  const moodColor=avgMorale>=70?C.win:avgMorale>=50?C.gold:C.red;
  const moodLabel=avgMorale>=75?"POSITIVE":avgMorale>=58?"NEUTRAL":avgMorale>=38?"TENSE":"CRISIS";
  const chem=state.chemistry[myTeam]||70;
  const unhappyLeaders=roster.filter(p=>(p.morale??60)<45&&(p.traits.includes("leader")||p.igl>=88));

  const sorted=[...roster].sort((a,b)=>{
    const order={Leader:0,Star:1,Player:2,Prospect:3};
    const ta=order[hierarchyTier(a,roster)]??2;
    const tb=order[hierarchyTier(b,roster)]??2;
    return ta!==tb?ta-tb:playerOvr(b)-playerOvr(a);
  });

  return(
  <div>
    {/* Team mood header */}
    <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:12,padding:"18px 20px",marginBottom:16}}>
      <div style={{display:"flex",gap:24,alignItems:"center",flexWrap:"wrap"}}>
        <div>
          <div style={{fontFamily:sans,fontSize:9.5,fontWeight:700,color:C.faint,letterSpacing:.7,marginBottom:5}}>TEAM MOOD</div>
          <div style={{fontFamily:mono,fontSize:18,fontWeight:800,color:moodColor,letterSpacing:1}}>{moodLabel}</div>
        </div>
        <div>
          <div style={{fontFamily:sans,fontSize:9.5,fontWeight:700,color:C.faint,letterSpacing:.7,marginBottom:5}}>AVG MORALE</div>
          <MoralBar morale={avgMorale}/>
        </div>
        <div>
          <div style={{fontFamily:sans,fontSize:9.5,fontWeight:700,color:C.faint,letterSpacing:.7,marginBottom:5}}>CHEMISTRY</div>
          <div style={{fontFamily:mono,fontSize:15,fontWeight:700,color:chem>=70?C.win:chem>=55?C.gold:C.red}}>{chem}</div>
        </div>
        <div style={{marginLeft:"auto",fontFamily:mono,fontSize:10,color:C.faint,lineHeight:1.9}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:8,height:8,borderRadius:2,background:C.gold}}/><span style={{color:C.gold}}>Leader</span> — spreads mood to squad</div>
          <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:8,height:8,borderRadius:2,background:C.live}}/><span style={{color:C.live}}>Star</span> — needs results &amp; pay</div>
          <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:8,height:8,borderRadius:2,background:C.acc}}/><span style={{color:C.acc}}>Prospect</span> — hungry, stable</div>
        </div>
      </div>
      {unhappyLeaders.length>0&&(
        <div style={{marginTop:12,background:C.red+"14",border:`1px solid ${C.red}44`,borderRadius:8,padding:"8px 12px",fontFamily:mono,fontSize:11,color:C.red}}>
          !! LOCKER ROOM UNREST — {unhappyLeaders.map(p=>p.name).join(", ")} {unhappyLeaders.length===1?"is":"are"} critically unhappy. A crisis event will trigger next week.
        </div>
      )}
    </div>

    {/* Squad hierarchy table */}
    <div style={{fontFamily:sans,fontSize:9.5,fontWeight:700,color:C.faint,letterSpacing:.7,marginBottom:8}}>SQUAD DYNAMICS</div>
    <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:20}}>
      {sorted.map(p=>{
        const tier=hierarchyTier(p,roster);
        const morale=p.morale??60;
        const fairPay=desiredSalary(p);
        const payOk=p.salary>=fairPay*0.90;
        const payLow=!payOk&&p.salary>=fairPay*0.70;
        const payLabel=payOk?"Pay ✓":payLow?"Pay ↓":"!! Underpaid";
        const rColor=ROLE_COLOR[p.role]||C.dim;
        const tColor=TIER_COLOR[tier]||C.dim;
        const tBg=TIER_BG[tier]||"transparent";
        const isAtRisk=morale<45;
        return(
        <div key={p.name} style={{background:tBg,border:`1px solid ${isAtRisk?C.red+"55":C.line}`,borderRadius:9,padding:"10px 14px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <div style={{minWidth:120}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
              <span style={{fontWeight:700,fontSize:14}}>{p.name}</span>
              <span style={{fontFamily:mono,fontSize:8,color:tColor,border:`1px solid ${tColor}44`,borderRadius:3,padding:"1px 5px"}}>{tier.toUpperCase()}</span>
            </div>
            <div style={{fontFamily:mono,fontSize:10,color:rColor}}>{p.role} · age {p.age}</div>
          </div>

          <div style={{display:"flex",gap:14,alignItems:"center",marginLeft:"auto",flexWrap:"wrap"}}>
            <div>
              <div style={{fontFamily:mono,fontSize:9,color:C.faint,marginBottom:3}}>MORALE</div>
              <MoralBar morale={morale}/>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              <SatisfactionTag label={payLabel} ok={payOk} warn={payLow}/>
              <SatisfactionTag label={`Form ${p.form>0?"+":""}${Math.round(p.form)}`} ok={p.form>2} warn={p.form>=-2&&p.form<=2}/>
              <SatisfactionTag label={`Contract ${contractLabel(p.contract)}`} ok={p.contract>=52} warn={p.contract<26}/>
            </div>
          </div>
        </div>);
      })}
    </div>

    {/* How it works */}
    <div style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:8,padding:"12px 16px",fontFamily:mono,fontSize:10,color:C.faint,lineHeight:2}}>
      <div style={{color:C.dim,fontWeight:700,marginBottom:4}}>HOW MORALE WORKS</div>
      <div>• Results: 1st +12 · 2nd +7 · top 4 +3 · group exit -5 — moderated by mentality</div>
      <div>• Pay: fair pay +2 · below market -2 · severely underpaid -5 per event</div>
      <div>• Low-morale Leaders drain -1 chemistry per activity week</div>
      <div>• Rest &amp; vacation: +3 morale · Scrim: +1 · Bootcamp: -1</div>
      <div>• Match impact: morale 20→60→100 = -1 to +1 per-player performance</div>
    </div>
  </div>);
}

import React, { useState } from 'react';
import { C, sans, mono } from './theme.js';
import { MAPS, AI_TEAMS } from '../constants/data.js';
import { EVENTS, SEASON_WEEKS, ACTIVITIES, COACHES, FACILITIES, isSalaryWeek, weekToLabel, weekToMonth } from '../constants/events.js';
import { playerOvr } from '../engine/player.js';
import { rosterOf, getMapProf } from '../engine/state.js';
import { getRankedTeams } from '../engine/player.js';
import { SL, Banner, Locked, Intro, Pill, MiniStat } from './primitives.jsx';

export function CalendarView({season,myTeam,onAdvance,onTransfer,onSim,onHireCoach,onFireCoach,onInitAcademy,onPromoteProspect,onSellProspect,onAcceptSponsor,onDeclineSponsor}){
  const [act,setAct]=useState(null);
  const [mapChoice,setMapChoice]=useState(MAPS[0]);
  const [showTransfer,setShowTransfer]=useState(false);
  const roster=rosterOf(season.simState,myTeam);
  const avgFatigue=roster.length?Math.round(roster.reduce((s,p)=>s+p.fatigue,0)/roster.length):0;
  const nextEvent=EVENTS.find(e=>e.week>=season.week);
  const weeksUntil=nextEvent?nextEvent.week-season.week:99;
  const totalSalary=roster.reduce((s,p)=>s+p.salary,0);

  function confirm(){if(!act)return;onAdvance(act,act==="practice"?mapChoice:null);setAct(null);}

  return(<div>
    <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap"}}>
      <MiniStat label="DATE" value={`${weekToLabel(season.week,season.year)} ${season.year||2026}`} color={C.acc}/>
      <MiniStat label="NEXT EVENT" value={weeksUntil===0?(nextEvent?.label||"EVENT"):`${weeksUntil}wk`} color={weeksUntil<=2?C.red:C.live}/>
      {nextEvent&&weeksUntil>0&&<MiniStat label="TYPE" value={nextEvent.tier} color={nextEvent.tier==="Major"?C.gold:nextEvent.tier==="A"?C.live:C.dim}/>}
      {(()=>{const nextPay=SALARY_WEEKS.find(w=>w>=season.week);const wksToPay=nextPay?nextPay-season.week:0;const roster=rosterOf(season.simState,myTeam);const coachPay=season.simState.coach?season.simState.coach.salary:5;const sal=roster.reduce((s,p)=>s+p.salary,0)+coachPay;return <MiniStat label={wksToPay===0?"PAYDAY":"NEXT PAY"} value={wksToPay===0?`${sal}K due!`:`${wksToPay}wk · ${sal}K`} color={wksToPay===0?C.red:wksToPay<=1?C.gold:C.dim}/>;})()}
      <MiniStat label="AVG FATIGUE" value={avgFatigue} color={avgFatigue>70?C.red:avgFatigue>50?C.gold:C.win}/>
      <MiniStat label="BUDGET" value={`$${season.budget}K`} color={season.budget>0?C.gold:C.red}/>
    </div>

    {/* Calendar grid */}
    <SL n="TME" t={`${season.year||2026} SEASON`}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:16}}>
      {(()=>{
        const months=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
        const monthGroups={};
        for(let w=1;w<=SEASON_WEEKS;w++){const m=weekToMonth(w);if(!monthGroups[m])monthGroups[m]=[];monthGroups[m].push(w);}
        return months.map((mName,mi)=>{
          const weeks=monthGroups[mi]||[];
          if(!weeks.length)return null;
          const isPast=weeks.every(w=>w<season.week);
          const isCurrent=weeks.some(w=>w===season.week);
          const hasEvent=weeks.some(w=>EVENTS.find(e=>e.week===w));
          return(
          <div key={mi} style={{background:isCurrent?C.acc+"11":C.panel,border:`1px solid ${isCurrent?C.acc:hasEvent?C.gold+"44":C.line}`,borderRadius:7,padding:"6px",opacity:isPast?0.6:1}}>
            <div style={{fontFamily:mono,fontSize:9,fontWeight:700,color:isCurrent?C.acc:hasEvent?C.gold:isPast?C.faint:C.dim,letterSpacing:1,marginBottom:4,textAlign:"center"}}>{mName}</div>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(weeks.length,5)},1fr)`,gap:2}}>
              {weeks.map(w=>{
                const ev=EVENTS.find(e=>e.week===w);
                const current=w===season.week;const past=w<season.week;
                const bg=current?C.acc:ev?(ev.tier==="Major"?C.gold+"33":ev.tier==="A"?C.live+"22":C.panel2):past?"transparent":C.panel2;
                const fg=current?"#0a0c10":ev?(ev.tier==="Major"?C.gold:ev.tier==="A"?C.live:C.dim):past?C.faint:C.dim;
                const bd=current?C.acc:ev?(ev.tier==="Major"?C.gold:ev.tier==="A"?C.live:C.line):"transparent";
                return(<div key={w} title={`W${w} ${weekToLabel(w,season.year)}${ev?" - "+ev.label:""}`}
                  style={{height:16,borderRadius:2,background:bg,border:`1px solid ${bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:6,fontFamily:mono,fontWeight:current||ev?700:400,color:fg}}>
                  {ev?(ev.tier==="Major"?"★":ev.tier[0]):current?"▸":""}
                </div>);
              })}
            </div>
            {/* Show event name if this month has one */}
            {weeks.map(w=>EVENTS.find(e=>e.week===w)).filter(Boolean).map((ev,i)=>(
              <div key={i} style={{fontFamily:mono,fontSize:7,color:ev.tier==="Major"?C.gold:ev.tier==="A"?C.live:C.dim,marginTop:2,textAlign:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ev.label}</div>
            ))}
          </div>);
        }).filter(Boolean);
      })()}
    </div>
    {/* Legend */}
    <div style={{display:"flex",gap:12,marginBottom:16,fontFamily:mono,fontSize:9,color:C.faint,justifyContent:"center"}}>
      <span style={{color:C.gold}}>★ Major</span><span style={{color:C.live}}>A A-Tier</span><span style={{color:C.dim}}>B B-Tier</span><span style={{color:C.acc}}>▸ Now</span>
    </div>

    {weeksUntil===0&&nextEvent?(
      <Banner c={nextEvent.tier==="Major"?C.gold:nextEvent.tier==="A"?C.live:C.dim}>
        <span style={{fontSize:15,fontWeight:700,color:nextEvent.tier==="Major"?C.gold:nextEvent.tier==="A"?C.live:C.ink}}>
          {nextEvent.label} -- {weekToLabel(season.week,season.year)}, {nextEvent.location||""}
        </span>
        <span style={{fontFamily:mono,fontSize:11,color:C.dim,display:"block",marginTop:3}}>
          {nextEvent.tier==="Major"?"Major - 16 teams":nextEvent.tier==="A"?`A-Tier - ${nextEvent.teams} teams - Bo${nextEvent.bo}`:`B-Tier - ${nextEvent.teams} teams - Bo${nextEvent.bo}`}
        </span>
      </Banner>
    ):(<>
    {/* Activity picker */}
    <SL n="ACT" t="WEEKLY ACTIVITY"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:16}}>
      {Object.entries(ACTIVITIES).map(([k,a])=>{
        const sel=act===k;
        const warn=a.fatigue>0&&avgFatigue+a.fatigue>70;
        return(
        <button key={k} onClick={()=>setAct(k)}
          style={{background:sel?C.acc+"22":C.panel,border:`1px solid ${sel?C.acc:C.line}`,borderRadius:9,padding:"12px 14px",textAlign:"left"}}>
          <div style={{fontSize:20,marginBottom:4}}>{a.icon}</div>
          <div style={{fontWeight:700,fontSize:13,color:sel?C.acc:C.ink}}>{a.label}</div>
          <div style={{fontSize:11,color:C.dim,lineHeight:1.4,marginTop:4}}>{a.desc}</div>
          {warn&&<div style={{fontFamily:mono,fontSize:9,color:C.red,marginTop:4}}>! HIGH FATIGUE</div>}
        </button>);
      })}
    </div>

    {act==="practice"&&(
      <div style={{marginBottom:16}}>
        <div style={{fontFamily:mono,fontSize:11,color:C.dim,marginBottom:8}}>CHOOSE MAP TO DRILL</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {MAPS.map(m=>{const prof=getMapProf(season.simState,myTeam)[m]||50;return(
            <button key={m} onClick={()=>setMapChoice(m)}
              style={{background:mapChoice===m?C.acc:C.panel,color:mapChoice===m?"#0a0c10":C.ink,border:`1px solid ${mapChoice===m?C.acc:C.line}`,borderRadius:7,padding:"8px 14px",fontFamily:mono,fontSize:12}}>
              {m} <span style={{fontSize:10,color:mapChoice===m?"#0a0c10aa":C.faint}}>{prof}</span>
            </button>);
          })}
        </div>
      </div>
    )}

    {act==="scout"&&(
      <div style={{marginBottom:16}}>
        <div style={{fontFamily:mono,fontSize:11,color:C.dim,marginBottom:8}}>CHOOSE TEAM TO SCOUT</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {AI_TEAMS.filter(t=>rosterOf(season.simState,t).length>0).map(t=>{
            const scouted=season.scoutedTeams?.[t];
            return(<button key={t} onClick={()=>setMapChoice(t)}
              style={{background:mapChoice===t?C.acc:C.panel,color:mapChoice===t?"#0a0c10":C.ink,border:`1px solid ${mapChoice===t?C.acc:scouted?C.win+"66":C.line}`,borderRadius:7,padding:"6px 12px",fontFamily:mono,fontSize:11}}>
              {t}{scouted?" ok":""}
            </button>);
          })}
        </div>
        {mapChoice&&season.scoutedTeams?.[mapChoice]&&(
          <div style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:8,padding:"8px 12px",marginTop:8,fontFamily:mono,fontSize:10,color:C.dim}}>
            Already scouted — re-scouting updates intel
          </div>
        )}
      </div>
    )}

    {act&&(
      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:24}}>
        <button onClick={confirm} disabled={act==="scout"&&!mapChoice} style={{background:(act==="scout"&&!mapChoice)?"#333":C.acc,color:(act==="scout"&&!mapChoice)?C.faint:"#0a0c10",border:"none",borderRadius:9,padding:"13px 26px",fontWeight:800,fontSize:15}}>
          ADVANCE WEEK →
        </button>
        <span style={{fontFamily:mono,fontSize:12,color:C.dim}}>Week {season.week} → {season.week+1}</span>
      </div>
    )}

    {/* Sim to next event */}
    {!act&&weeksUntil>1&&(
      <div style={{marginBottom:20}}>
        <button onClick={onSim} style={{background:C.panel2,border:`1px solid ${C.live}`,borderRadius:9,padding:"11px 22px",fontFamily:mono,fontSize:12,color:C.live,fontWeight:700}}>
          ⏩ SIM TO NEXT EVENT ({weeksUntil} weeks)
        </button>
        <span style={{fontFamily:mono,fontSize:10,color:C.faint,marginLeft:10}}>Auto-manages training, rest, and fatigue</span>
      </div>
    )}

    {/* Last random event */}
    {season.weekLog.length>0&&season.weekLog[season.weekLog.length-1]?.event&&(
      <div style={{background:"rgba(255,194,75,.08)",border:`1px solid ${C.gold}44`,borderRadius:8,padding:"10px 14px",marginBottom:16,fontFamily:mono,fontSize:12,color:C.gold}}>
        {season.weekLog[season.weekLog.length-1].event}
      </div>
    )}

    {/* Sponsorships */}
    {(season.sponsorships||[]).filter(sp=>sp.offered||sp.active).length>0&&(<>
      <SL n="SPO" t="SPONSORSHIPS"/>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
        {(season.sponsorships||[]).map((sp,i)=>{
          if(!sp.offered&&!sp.active) return null;
          if(sp.offered) return(
            <div key={i} style={{background:"rgba(255,194,75,.06)",border:`1px solid ${C.gold}44`,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{fontWeight:700,fontSize:13,color:C.gold}}>{sp.brand}</span>
              <span style={{fontFamily:mono,fontSize:11,color:C.ink}}>${sp.monthly}K/mo × {sp.duration}mo</span>
              <span style={{fontSize:11,color:C.dim}}>{sp.condition!=="None"?`Condition: ${sp.condition}`:"No conditions"}</span>
              <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                <button onClick={()=>onAcceptSponsor(i)} style={{background:C.win,color:"#0a0c10",border:"none",borderRadius:6,padding:"5px 12px",fontFamily:mono,fontSize:10,fontWeight:700}}>ACCEPT</button>
                <button onClick={()=>onDeclineSponsor(i)} style={{background:"transparent",border:`1px solid ${C.red}`,color:C.red,borderRadius:6,padding:"5px 10px",fontFamily:mono,fontSize:10,fontWeight:700}}>x</button>
              </div>
            </div>);
          return(
            <div key={i} style={{background:C.panel,border:`1px solid ${C.win}33`,borderRadius:8,padding:"8px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{fontWeight:600,fontSize:12,color:C.win}}>{sp.brand}</span>
              <span style={{fontFamily:mono,fontSize:10,color:C.dim}}>${sp.monthly}K/mo · {Math.ceil(sp.weeksLeft/4)}mo left</span>
              {sp.condition!=="None"&&<span style={{fontSize:10,color:C.gold}}>{sp.condition}</span>}
            </div>);
        })}
      </div>
    </>)}

    {/* Income overview */}
    {(()=>{
      const rank=(()=>{const r=getRankedTeams(season.simState,myTeam);return r.findIndex(x=>x.team===myTeam)+1;})();
      const merchIncome=rank<=3?40:rank<=6?25:rank<=10?15:rank<=16?8:3;
      const stipendIncome=rank<=5?30:rank<=10?20:rank<=16?12:5;
      const contentTier=season.facilities?.content||0;
      const contentIncome=[0,15,30][contentTier]||0;
      const streamIncome=Math.round(roster.reduce((s,p)=>{const pop=playerOvr(p)/20+(season.simState.career?.[p.name]?.totalMvps||0)*0.5;return s+pop;},0));
      const sponsorIncome=(season.sponsorships||[]).reduce((s,sp)=>s+(sp.active?sp.monthly:0),0);
      const totalIncome=contentIncome+merchIncome+stipendIncome+streamIncome+sponsorIncome;
      return(
      <div style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:8,padding:"10px 14px",marginBottom:16,display:"flex",gap:10,flexWrap:"wrap",fontFamily:mono,fontSize:10}}>
        <span style={{color:C.faint}}>MONTHLY:</span>
        <span style={{color:C.win}}>+${stipendIncome}K stipend</span>
        <span style={{color:C.win}}>+${merchIncome}K merch</span>
        {streamIncome>0&&<span style={{color:C.win}}>+${streamIncome}K streams</span>}
        {contentIncome>0&&<span style={{color:C.win}}>+${contentIncome}K content</span>}
        {sponsorIncome>0&&<span style={{color:C.win}}>+${sponsorIncome}K sponsors</span>}
        <span style={{color:C.gold}}>= ${totalIncome}K income</span>
        <span style={{color:C.red}}>- ${totalSalary}K salary</span>
        <span style={{color:totalIncome>=totalSalary?C.win:C.red,fontWeight:700}}>Net {totalIncome>=totalSalary?"+":""}{totalIncome-totalSalary}</span>
      </div>);
    })()}

    {/* Coach */}
    <SL n="CCH" t="COACH"/>
    {season.simState.coach?(
      <div style={{background:C.panel,border:`1px solid ${C.live}`,borderRadius:9,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        <div>
          <div style={{fontWeight:700,fontSize:14}}>{season.simState.coach.name}</div>
          <div style={{fontFamily:mono,fontSize:10,color:C.live}}>{season.simState.coach.style}</div>
        </div>
        <span style={{fontSize:12,color:C.dim,flex:1}}>{season.simState.coach.desc}</span>
        <span style={{fontFamily:mono,fontSize:11,color:C.gold}}>${season.simState.coach.salary}K/ev</span>
        <button onClick={onFireCoach} style={{background:"transparent",border:`1px solid ${C.red}`,color:C.red,borderRadius:6,padding:"5px 10px",fontFamily:mono,fontSize:10,fontWeight:700}}>FIRE</button>
      </div>
    ):(
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
        {COACHES.map(c=>(
          <div key={c.name} style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:8,padding:"9px 13px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <div style={{minWidth:70}}>
              <div style={{fontWeight:600,fontSize:13}}>{c.name}</div>
              <span style={{fontFamily:mono,fontSize:9,color:C.live}}>{c.style}</span>
            </div>
            <span style={{fontSize:11,color:C.dim,flex:1}}>{c.desc}</span>
            <span style={{fontFamily:mono,fontSize:11,color:C.gold}}>${c.salary}K/ev</span>
            <button onClick={()=>onHireCoach(c)} disabled={season.budget<c.salary}
              style={{background:C.win,color:"#0a0c10",border:"none",borderRadius:6,padding:"5px 12px",fontFamily:mono,fontSize:10,fontWeight:700}}>HIRE</button>
          </div>
        ))}
      </div>
    )}

    {/* Player fatigue overview */}
    <SL n="FTG" t="PLAYER STATUS"/>
    <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
      {roster.map(p=>{
        const fc=p.fatigue>80?C.red:p.fatigue>60?C.gold:p.fatigue>40?"#8bc99a":C.win;
        return(
        <div key={p.name} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <div style={{minWidth:90}}>
            <div style={{fontWeight:700,fontSize:13}}>{p.name}</div>
            <div style={{display:"flex",gap:3}}><Pill c={C.dim}>{p.role}</Pill><span style={{fontFamily:mono,fontSize:9,color:C.faint}}>age {p.age}</span></div>
          </div>
          <Stat l="OVR" v={playerOvr(p)}/>
          <FormArrow form={p.form}/>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:52}}>
            <span style={{fontFamily:mono,fontSize:9,color:C.faint}}>FATIGUE</span>
            <div style={{width:48,height:6,background:C.line,borderRadius:3,overflow:"hidden",marginTop:2}}>
              <div style={{width:`${p.fatigue}%`,height:"100%",background:fc,borderRadius:3}}/>
            </div>
            <span style={{fontFamily:mono,fontSize:10,color:fc}}>{p.fatigue}</span>
          </div>
          {p.fatigue>80&&<span style={{fontFamily:mono,fontSize:9,color:C.red,border:`1px solid ${C.red}`,borderRadius:4,padding:"1px 5px"}}>EXHAUSTED</span>}
        </div>);
      })}
    </div>

    {/* Transfer access */}
    <button onClick={()=>setShowTransfer(!showTransfer)}
      style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,padding:"10px 16px",fontFamily:mono,fontSize:12,color:C.dim,marginBottom:16}}>
      {showTransfer?"▾ HIDE":"▸ SHOW"} TRANSFER MARKET (roster {roster.length}/5, salary ${totalSalary}K)
    </button>
    {showTransfer&&<TransferPanel season={season} myTeam={myTeam} onTransfer={onTransfer}/>}

    {/* Academy */}
    <SL n="ACD" t="ACADEMY"/>
    {!season.academy?(
      <div style={{background:C.panel,border:`1px dashed ${C.line}`,borderRadius:9,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <span style={{fontSize:18}}>[AC]</span>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:13}}>Establish Academy</div>
          <div style={{fontSize:11,color:C.dim}}>Develop young talent for your roster or sell for profit.</div>
        </div>
        <button onClick={onInitAcademy} disabled={season.budget<100}
          style={{background:season.budget>=100?C.acc:"#333",color:season.budget>=100?"#0a0c10":C.faint,border:"none",borderRadius:7,padding:"8px 16px",fontWeight:700,fontSize:12}}>
          $100K
        </button>
      </div>
    ):(
      <div style={{marginBottom:20}}>
        <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginBottom:8}}>Developing for {season.academy.weeksActive} weeks · {season.academy.prospects.length}/4 prospects</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {season.academy.prospects.map((p,i)=>(
            <div key={i} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,padding:"9px 13px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <div style={{minWidth:80}}>
                <div style={{fontWeight:600,fontSize:12}}>{p.name}</div>
                <div style={{display:"flex",gap:3}}><Pill c={C.dim}>{p.role}</Pill><span style={{fontFamily:mono,fontSize:9,color:C.win}}>age {p.age}</span></div>
              </div>
              <Stat l="OVR" v={playerOvr(p)}/>
              <Stat l="AIM" v={p.aim}/>
              <span style={{fontFamily:mono,fontSize:9,color:C.faint}}>{p.weeksInAcademy||0}wk trained</span>
              <div style={{marginLeft:"auto",display:"flex",gap:4}}>
                <button onClick={()=>onPromoteProspect(i)} disabled={rosterOf(season.simState,myTeam).length>=5}
                  style={{background:C.win,color:"#0a0c10",border:"none",borderRadius:5,padding:"4px 10px",fontFamily:mono,fontSize:9,fontWeight:700}}>PROMOTE</button>
                <button onClick={()=>onSellProspect(i)} disabled={(p.weeksInAcademy||0)<8}
                  style={{background:(p.weeksInAcademy||0)>=8?C.panel2:"#222",color:(p.weeksInAcademy||0)>=8?C.gold:C.faint,border:`1px solid ${(p.weeksInAcademy||0)>=8?C.gold+"44":C.line}`,borderRadius:5,padding:"4px 10px",fontFamily:mono,fontSize:9,fontWeight:700}}>{(p.weeksInAcademy||0)>=8?`SELL $Math.round(playerOvr(p)*0.8)K`:`${8-(p.weeksInAcademy||0)}wk to sell`}</button>
              </div>
            </div>
          ))}
          {season.academy.prospects.length===0&&<div style={{fontFamily:mono,fontSize:11,color:C.faint,padding:"8px 0"}}>No prospects yet — new talent scouted every 6 weeks.</div>}
        </div>
      </div>
    )}
    </>)}

    {/* Week log with events */}
    {season.weekLog.length>0&&(<>
      <SL n="LOG" t="ACTIVITY LOG"/>
      <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:200,overflowY:"auto"}}>
        {[...season.weekLog].reverse().slice(0,15).map((w,i)=>(
          <div key={i} style={{fontFamily:mono,fontSize:11,color:w.event?C.gold:C.dim,padding:"4px 0"}}>
            <span style={{color:C.faint}}>W{w.week}</span>{" "}
            {w.event?w.event:(<>{ACTIVITIES[w.activity]?.icon} {ACTIVITIES[w.activity]?.label}{w.mapChoice?` (${w.mapChoice})`:""}</>)}
          </div>
        ))}
      </div>
    </>)}
  </div>);
}

export function TransferPanel({season,myTeam,onTransfer}){
  const [scoutTeam,setScoutTeam]=useState(null);
  const roster=rosterOf(season.simState,myTeam);
  const fas=freeAgents(season.simState).sort((a,b)=>playerOvr(b)-playerOvr(a));
  const rosterFull=roster.length>=5;
  return(<div style={{marginBottom:24}}>
    <SL n="FA" t="FREE AGENTS"/>
    {fas.length===0?<Empty text="No free agents available."/>:(
    <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
      {fas.slice(0,10).map(p=>(
        <div key={p.name} style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:8,padding:"9px 13px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <div style={{minWidth:80}}><span style={{fontWeight:600,fontSize:13}}>{p.name}</span><span style={{fontFamily:mono,fontSize:9,color:C.faint,marginLeft:4}}>age {p.age}</span></div>
          <Pill c={C.dim}>{p.role}</Pill>
          <Stat l="OVR" v={playerOvr(p)}/>
          <span style={{fontFamily:mono,fontSize:11,color:C.gold}}>${p.salary}K</span>
          <button onClick={()=>onTransfer("sign",p.name)} disabled={rosterFull||season.budget<p.salary}
            style={{marginLeft:"auto",background:C.win,color:"#0a0c10",border:"none",borderRadius:6,padding:"5px 12px",fontFamily:mono,fontSize:10,fontWeight:700}}>SIGN</button>
        </div>))}
    </div>)}
    <SL n="SCT" t="SCOUT TEAMS"/>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
      {AI_TEAMS.map(team=>(
        <button key={team} onClick={()=>setScoutTeam(scoutTeam===team?null:team)}
          style={{background:scoutTeam===team?C.acc:C.panel,color:scoutTeam===team?"#0a0c10":C.dim,border:`1px solid ${scoutTeam===team?C.acc:C.line}`,borderRadius:5,padding:"4px 10px",fontFamily:mono,fontSize:10,fontWeight:700}}>{team}</button>
      ))}
    </div>
    {scoutTeam&&(
      <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:9,padding:"12px"}}>
        {rosterOf(season.simState,scoutTeam).map(p=>{const buyout=Math.round(marketValue(p)*2);return(
          <div key={p.name} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderTop:`1px solid ${C.line}`,flexWrap:"wrap"}}>
            <span style={{fontWeight:600,fontSize:12,minWidth:80}}>{p.name}</span><Pill c={C.dim}>{p.role}</Pill>
            <Stat l="OVR" v={playerOvr(p)}/>
            <span style={{fontFamily:mono,fontSize:10,color:C.gold}}>${buyout}K</span>
            <button onClick={()=>onTransfer("buy",p.name)} disabled={rosterFull||season.budget<buyout}
              style={{marginLeft:"auto",background:C.live,color:"#0a0c10",border:"none",borderRadius:5,padding:"4px 10px",fontFamily:mono,fontSize:10,fontWeight:700}}>BUY</button>
          </div>);})}
      </div>)}
    {/* Release from roster */}
    {roster.length>0&&(<>
      <SL n="RLS" t="RELEASE PLAYER"/>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {roster.map(p=>(
          <div key={p.name} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0"}}>
            <span style={{fontWeight:600,fontSize:12,minWidth:80}}>{p.name}</span><Pill c={C.dim}>{p.role}</Pill>
            <Stat l="OVR" v={playerOvr(p)}/>
            <button onClick={()=>onTransfer("release",p.name)} disabled={roster.length<=4}
              style={{marginLeft:"auto",background:"transparent",border:`1px solid ${C.red}`,color:C.red,borderRadius:5,padding:"4px 10px",fontFamily:mono,fontSize:10,fontWeight:700}}>RELEASE</button>
          </div>))}
      </div>
    </>)}
  </div>);
}

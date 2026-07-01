import React, { useState } from 'react';
import { C, sans, mono, ratingColor, rating2Color } from './theme.js';
import { playerOvr, desiredSalary } from '../engine/player.js';
import { rosterOf, teamBase, momentumOf } from '../engine/state.js';
import { Overlay, SL, Intro, Pill, TraitPill, MiniStat, TeamCrest, MoodTag, Table, RatingBadge, AttrBar, Btn, Card } from './primitives.jsx';
import { contractLabel } from '../constants/events.js';

// Per-player rating across events, from career.eventHistory (real recorded match
// data — no fabricated stats). 1.00 is the "neutral" line CS rating conventions use.
function RatingTrendChart({ history }) {
  if (!history || history.length < 2) return null;
  const W = 380,
    H = 80,
    PL = 24,
    PR = 10,
    PT = 10,
    PB = 18;
  const plotW = W - PL - PR,
    plotH = H - PT - PB;
  const n = history.length;
  const ratings = history.map((e) => e.rating);
  const maxV = Math.max(...ratings, 1.3) * 1.05;
  const minV = Math.min(...ratings, 0.7) * 0.95;
  const range = maxV - minV || 1;
  const xOf = (i) => (n === 1 ? PL + plotW / 2 : PL + (i / (n - 1)) * plotW);
  const yOf = (v) => PT + (1 - (v - minV) / range) * plotH;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
      <line x1={PL} x2={W - PR} y1={yOf(1)} y2={yOf(1)} stroke={C.faint} strokeWidth={0.5} strokeDasharray="3,3" />
      <text x={PL - 3} y={yOf(1) + 3} fontSize="8" fill={C.faint} textAnchor="end">1.00</text>
      {n > 1 && (
        <polyline
          points={history.map((e, i) => `${xOf(i)},${yOf(e.rating)}`).join(' ')}
          fill="none" stroke={C.acc} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
        />
      )}
      {history.map((e, i) => (
        <g key={i}>
          <circle cx={xOf(i)} cy={yOf(e.rating)} r="3" fill={e.rating >= 1.1 ? C.win : e.rating >= 0.9 ? C.ink : C.red} />
          <text x={xOf(i)} y={H - 4} fontSize="8" fill={C.faint} textAnchor="middle">#{e.eventNum + 1}</text>
        </g>
      ))}
    </svg>
  );
}

function StatRadar({ p }) {
  const CX = 70, CY = 70, R = 54;
  const stats = [
    { label: 'AIM',    v: p.aim || 0 },
    { label: 'RIFLE',  v: p.rifle || 0 },
    { label: 'CLUTCH', v: p.clutch || 0 },
    { label: 'EXP',    v: p.experience || 50 },
    { label: 'COMP',   v: p.composure || p.mentality || 60 },
    { label: 'SENSE',  v: p.gameSense || 0 },
  ];
  const n = stats.length;
  const angle = i => (i / n) * 2 * Math.PI - Math.PI / 2;
  const pt = (i, r) => [CX + Math.cos(angle(i)) * r, CY + Math.sin(angle(i)) * r];
  const ringPts = r => Array.from({ length: n }, (_, i) => pt(i, r * R).join(',')).join(' ');
  const dataPts = stats.map((s, i) => pt(i, (s.v / 100) * R).join(',')).join(' ');
  return (
    <svg width={CX * 2} height={CY * 2} style={{ overflow: 'visible', display: 'block' }}>
      {[0.25, 0.5, 0.75, 1.0].map(r => (
        <polygon key={r} points={ringPts(r)} fill={r === 1 ? C.acc + '08' : 'none'} stroke={r === 1 ? C.line : C.line + '88'} strokeWidth={r === 1 ? 1 : 0.5} />
      ))}
      {stats.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke={C.line} strokeWidth={0.5} />; })}
      <polygon points={dataPts} fill={C.acc + '2a'} stroke={C.acc} strokeWidth={1.5} />
      {stats.map((s, i) => { const [x, y] = pt(i, (s.v / 100) * R); return <circle key={i} cx={x} cy={y} r={2.5} fill={C.acc} />; })}
      {stats.map((s, i) => {
        const [x, y] = pt(i, R + 14);
        return (
          <g key={i}>
            <text x={x} y={y - 4} fontSize="7.5" fill={C.faint} textAnchor="middle" dominantBaseline="middle">{s.label}</text>
            <text x={x} y={y + 6} fontSize="9" fontWeight="700" fill={s.v >= 90 ? C.acc : s.v >= 75 ? C.win : C.dim} textAnchor="middle" dominantBaseline="middle">{s.v}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Sparkline({history}){
  if(!history||history.length<2) return null;
  const pts=history.slice(-5);
  const min=0.7,max=1.4,w=54,h=18;
  const coords=pts.map((e,i)=>{
    const x=pts.length===1?w/2:(i/(pts.length-1))*w;
    const y=h-Math.max(0,Math.min(1,(e.rating-min)/(max-min)))*h;
    return[x,y];
  });
  const lastR=pts[pts.length-1].rating;
  const col=lastR>=1.1?C.win:lastR>=0.9?C.dim:C.red;
  return(
    <svg width={w} height={h} style={{overflow:"visible"}}>
      <polyline points={coords.map(([x,y])=>`${x},${y}`).join(" ")} fill="none" stroke={col} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      {coords.map(([x,y],i)=>(<circle key={i} cx={x} cy={y} r="2" fill={col} opacity={i===coords.length-1?1:0.5}/>))}
    </svg>
  );
}

export function RosterView2({state,myTeam,onNegotiate,onChangeRole,onAdjustPay}){
  const [profilePlayer,setProfilePlayer]=useState(null);
  const [negotiating,setNegotiating]=useState(null);
  const [negoResult,setNegoResult]=useState(null);
  const [adjustingPay,setAdjustingPay]=useState(null);
  const [payResult,setPayResult]=useState(null);
  const r=rosterOf(state,myTeam);const base=teamBase(state,myTeam);const chem=state.chemistry[myTeam]||55;
  const roleColor={IGL:C.live,AWP:C.awp,Entry:C.acc,Lurk:C.gold,Support:C.win};
  const mom=momentumOf(state,myTeam);
  const momLabel=mom>0?`W${mom}`:mom<0?`L${-mom}`:"—";
  const momColor=mom>=2?C.win:mom>0?C.winSoft:mom<=-2?C.red:mom<0?C.redSoft:C.faint;

  const curRating=p=>{
    const st=state.stats[p.name],career=state.career?.[p.name];
    if(st&&st.maps>0) return st.rating;
    if(career&&career.totalMaps>0) return career.avgRating;
    return null;
  };
  const ageColor=a=>a>=32?C.red:a>=29?C.gold:a>=23&&a<=26?C.win:a<=21?C.live:C.dim;

  const cols=[
    {key:"player",label:"Player",sort:p=>p.name,cell:p=>{
      const rc=roleColor[p.role]||C.dim;
      return(
        <div style={{display:"flex",alignItems:"center",gap:9,minWidth:150}}>
          <span style={{width:30,height:30,borderRadius:15,background:rc+"1f",border:`1.5px solid ${rc}66`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontFamily:mono,fontSize:11,fontWeight:800,color:rc,flexShrink:0}}>{p.name.slice(0,2).toUpperCase()}</span>
          <span style={{minWidth:0}}>
            <span style={{display:"block",fontWeight:700,fontSize:13,color:C.ink,whiteSpace:"nowrap"}}>{p.name}</span>
            <span style={{display:"flex",gap:4,alignItems:"center",marginTop:1}}>
              <Pill c={rc}>{p.role}</Pill>
              {p.traits.map(tr=><TraitPill key={tr} t={tr}/>)}
              {p.injury&&<Pill c={C.red}>INJ {p.injury.weeks}wk</Pill>}
              {!p.injury&&p.fatigue>80&&<Pill c={C.red}>EXHAUSTED</Pill>}
            </span>
          </span>
        </div>);
    }},
    {key:"age",label:"Age",align:"right",mono,sort:p=>p.age,cell:p=><span style={{color:ageColor(p.age),fontWeight:600}}>{p.age}</span>},
    {key:"ovr",label:"Ovr",align:"center",sort:p=>playerOvr(p),cell:p=><RatingBadge v={playerOvr(p)}/>},
    ...[["aim","Aim",p=>p.aim],["gameSense","Sen",p=>p.gameSense],["rifle","Rif",p=>p.rifle||0],["clutch","Clt",p=>p.clutch||0]].map(([key,label,get])=>(
      {key,label,align:"right",mono,sort:get,cell:p=>{const v=get(p);return <span style={{fontWeight:700,color:ratingColor(v)===C.dim?C.ink:ratingColor(v)}}>{v}</span>;}}
    )),
    {key:"form",label:"Form",align:"right",mono,sort:p=>p.form,cell:p=>(
      <span style={{fontWeight:700,color:p.form>3?C.win:p.form>0?C.winSoft:p.form<-3?C.red:p.form<0?C.redSoft:C.faint}}>
        {p.form>3?"▲▲":p.form>0?"▲":p.form<-3?"▼▼":p.form<0?"▼":"–"} {p.form>0?"+":""}{p.form.toFixed(1)}
      </span>)},
    {key:"fatigue",label:"Ftg",align:"right",sort:p=>p.fatigue,cell:p=>{
      const fc=p.fatigue>80?C.red:p.fatigue>60?C.gold:p.fatigue>40?C.winSoft:C.win;
      return(
        <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
          <span style={{width:38,height:5,background:C.panel2,border:`1px solid ${C.line}`,borderRadius:3,overflow:"hidden",display:"inline-block"}}>
            <span style={{display:"block",width:`${p.fatigue}%`,height:"100%",background:fc}}/>
          </span>
          <span style={{fontFamily:mono,fontSize:11,color:fc,width:20,textAlign:"right"}}>{p.fatigue}</span>
        </span>);
    }},
    {key:"morale",label:"Mor",align:"right",mono,sort:p=>p.morale??60,cell:p=>{
      const m=p.morale??60;
      return <span style={{fontWeight:700,color:m>=70?C.win:m>=45?C.gold:C.red}}>{m}</span>;
    }},
    {key:"rtg",label:"Rtg",align:"right",mono,sort:p=>curRating(p)??-1,cell:p=>{
      const v=curRating(p);
      return v==null?<span style={{color:C.faint}}>—</span>:<span style={{fontWeight:700,color:rating2Color(v)}}>{v.toFixed(2)}</span>;
    }},
    {key:"trend",label:"Trend",align:"center",cell:p=><Sparkline history={state.career?.[p.name]?.eventHistory}/>},
    {key:"salary",label:"Salary",align:"right",mono,sort:p=>p.salary,cell:p=><span style={{color:C.gold}}>${p.salary}K</span>},
    {key:"deal",label:"Deal",align:"right",mono,sort:p=>p.contract,cell:p=><span style={{color:p.contract<=16?C.red:C.dim,fontSize:11}}>{contractLabel(p.contract)}</span>},
    {key:"act",label:"",align:"right",cell:p=>(
      <span style={{display:"inline-flex",gap:5}} onClick={e=>e.stopPropagation()}>
        {onChangeRole&&<select value={p.role} onChange={e=>onChangeRole(p.name,e.target.value)} title="Change role"
          style={{background:C.panel2,color:C.ink,border:`1px solid ${C.line}`,borderRadius:5,padding:"3px 5px",fontFamily:mono,fontSize:9.5}}>
          {["IGL","AWP","Entry","Lurk","Support"].map(rl=><option key={rl} value={rl}>{rl}</option>)}
        </select>}
        {onAdjustPay&&<Btn size="sm" kind="soft" title="Adjust pay" onClick={()=>setAdjustingPay({player:p,offer:p.salary})} style={{fontFamily:mono,fontSize:9,padding:"4px 8px"}}>PAY</Btn>}
        {p.contract<=16&&onNegotiate&&<Btn size="sm" kind="gold" title="Renew contract" onClick={()=>setNegotiating({player:p,offer:p.salary})} style={{fontFamily:mono,fontSize:9,padding:"4px 8px"}}>RENEW</Btn>}
      </span>)},
  ];

  return(<div>
    {/* Club band — crest, name, headline numbers */}
    <div style={{background:`linear-gradient(135deg,${C.panel2},${C.panel})`,border:`1px solid ${C.line}`,borderRadius:12,padding:"16px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",boxShadow:"0 1px 0 rgba(255,255,255,.03) inset, 0 8px 24px -16px rgba(0,0,0,.7)"}}>
      <TeamCrest name={myTeam} size={48}/>
      <div>
        <div style={{fontWeight:800,fontSize:21,color:C.ink,letterSpacing:.5}}>{myTeam}</div>
        <div style={{fontSize:11.5,color:C.faint,marginTop:2}}>First team · {r.length}/5 registered</div>
      </div>
      <div style={{marginLeft:"auto",display:"flex",gap:22,flexWrap:"wrap"}}>
        <MiniStat label="RATING" value={base.toFixed(1)} color={C.acc}/>
        <MiniStat label="CHEMISTRY" value={chem} color={chem>=80?C.win:chem>=60?C.gold:C.red}/>
        <MiniStat label="MOMENTUM" value={momLabel} color={momColor}/>
      </div>
    </div>

    {/* FM-style squad table — sortable; click a row for the full profile */}
    <Table cols={cols} rows={r} rowKey={p=>p.name} onRowClick={p=>setProfilePlayer(p)} style={{marginBottom:16}}/>
    <div style={{fontSize:11.5,color:C.faint,margin:"-8px 2px 16px"}}>Click a column to sort · click a player for the full profile</div>

    {/* Negotiation modal */}
    {negotiating&&(
      <Overlay onClose={()=>{setNegotiating(null);setNegoResult(null);}} title={`CONTRACT · ${negotiating.player.name}`}>
        {negoResult?(
          <div>
            <div style={{fontSize:14,color:negoResult.success?C.win:C.red,marginBottom:12}}>{negoResult.msg}</div>
            <button onClick={()=>{setNegotiating(null);setNegoResult(null);}} style={{background:C.acc,color:C.onAcc,border:"none",borderRadius:8,padding:"10px 20px",fontWeight:700}}>OK</button>
          </div>
        ):(
          <div>
            <div style={{marginBottom:12}}>
              <span style={{fontFamily:mono,fontSize:12,color:C.dim}}>Current: ${negotiating.player.salary}/mo · {contractLabel(negotiating.player.contract)} left</span>
            </div>
            <div style={{fontFamily:mono,fontSize:11,color:C.dim,marginBottom:8}}>YOUR OFFER ($/month)</div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16}}>
              <button onClick={()=>setNegotiating(n=>({...n,offer:Math.max(5,n.offer-2)}))} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:5,padding:"6px 10px",fontFamily:mono,color:C.ink}}>−</button>
              <span style={{fontFamily:mono,fontSize:20,fontWeight:700,color:C.gold,minWidth:60,textAlign:"center"}}>${negotiating.offer}</span>
              <button onClick={()=>setNegotiating(n=>({...n,offer:n.offer+2}))} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:5,padding:"6px 10px",fontFamily:mono,color:C.ink}}>+</button>
            </div>
            <button onClick={()=>{const res=onNegotiate(negotiating.player.name,negotiating.offer);setNegoResult(res);}} style={{width:"100%",background:C.acc,color:C.onAcc,border:"none",borderRadius:8,padding:"12px",fontWeight:800,fontSize:14}}>SUBMIT OFFER</button>
          </div>
        )}
      </Overlay>
    )}
    {/* Adjust pay modal */}
    {adjustingPay&&(
      <Overlay onClose={()=>{setAdjustingPay(null);setPayResult(null);}} title={`PAY · ${adjustingPay.player.name}`}>
        {payResult?(
          <div>
            <div style={{fontSize:14,color:payResult.success?C.win:C.red,marginBottom:12}}>{payResult.msg}</div>
            <button onClick={()=>{setAdjustingPay(null);setPayResult(null);}} style={{background:C.acc,color:C.onAcc,border:"none",borderRadius:8,padding:"10px 20px",fontWeight:700}}>OK</button>
          </div>
        ):(()=>{
          const desired=desiredSalary(adjustingPay.player);
          const max=Math.max(desired*2.5,adjustingPay.player.salary*1.5,10);
          return(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontFamily:mono,fontSize:12,color:C.dim}}>Current: ${adjustingPay.player.salary}K/mo</span>
              <MoodTag offered={adjustingPay.offer} desired={desired}/>
              <span style={{fontFamily:mono,fontSize:9,color:C.faint,marginLeft:"auto"}}>wants ~${desired}K/mo</span>
            </div>
            <div style={{fontFamily:mono,fontSize:11,color:C.dim,marginBottom:8}}>NEW PAY ($/month)</div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
              <button onClick={()=>setAdjustingPay(a=>({...a,offer:Math.max(1,a.offer-2)}))} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:5,padding:"6px 10px",fontFamily:mono,color:C.ink}}>−</button>
              <input type="range" min={1} max={Math.round(max)} value={adjustingPay.offer}
                onChange={e=>setAdjustingPay(a=>({...a,offer:+e.target.value}))}
                style={{flex:1,accentColor:C.acc}}/>
              <button onClick={()=>setAdjustingPay(a=>({...a,offer:a.offer+2}))} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:5,padding:"6px 10px",fontFamily:mono,color:C.ink}}>+</button>
              <span style={{fontFamily:mono,fontSize:16,fontWeight:700,color:C.gold,minWidth:60,textAlign:"center"}}>${adjustingPay.offer}K</span>
            </div>
            <div style={{fontFamily:mono,fontSize:9,color:C.faint,marginBottom:16}}>Cutting below what they want hurts morale and chemistry — bigger cuts hurt more. Raises don't cost you anything but the money.</div>
            <button onClick={()=>{const res=onAdjustPay(adjustingPay.player.name,adjustingPay.offer);setPayResult(res);}} style={{width:"100%",background:C.acc,color:C.onAcc,border:"none",borderRadius:8,padding:"12px",fontWeight:800,fontSize:14}}>CONFIRM</button>
          </div>
          );
        })()}
      </Overlay>
    )}
    {profilePlayer&&<PlayerProfile p={profilePlayer} state={state} onClose={()=>setProfilePlayer(null)}/>}
  </div>);}

export function PlayerProfile({p,state,onClose}){
  const c=state.career?.[p.name];
  const orig=c?.origStats||{};
  const statDiff=(key)=>p[key]-(orig[key]||p[key]);
  const coreStats=[["aim","AIM"],["gameSense","SENSE"],["util","UTIL"],["igl","IGL"],["consistency","CON"]];
  const combatStats=[["rifle","RIFLE"],["pistol","PISTOL"],["awp","AWP"],["clutch","CLUTCH"],["entry","ENTRY"]];
  const mentalStats=[["mentality","MENT"],["composure","COMP"],["stamina","STAM"],["experience","EXP"]];
  const mapEntries=Object.entries(c?.mapStats||{}).sort((a,b)=>b[1].maps-a[1].maps);
  const evHist=c?.eventHistory||[];
  const StatBars=({stats,label})=>(<>
    <SL n={label.slice(0,3).toUpperCase()} t={label}/>
    <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:16}}>
      {stats.map(([key,lbl])=><AttrBar key={key} l={lbl} v={p[key]||0} delta={statDiff(key)}/>)}
    </div>
  </>);
  return(
  <Overlay onClose={onClose} title={`${p.name} · PLAYER PROFILE`} wide>
    <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
      <div>
        <div style={{fontWeight:800,fontSize:22,color:C.acc}}>{p.name}</div>
        <div style={{display:"flex",gap:6,marginTop:4}}>
          <Pill c={C.dim}>{p.role}</Pill>
          {p.traits.map(tr=><TraitPill key={tr} t={tr}/>)}
          <span style={{fontFamily:mono,fontSize:10,color:p.age>=32?C.red:p.age>=29?C.gold:p.age>=23&&p.age<=26?C.win:p.age<=21?C.live:C.faint}}>age {p.age}</span>
        </div>
      </div>
      <div style={{marginLeft:"auto",display:"flex",gap:14,flexWrap:"wrap"}}>
        <MiniStat label="OVR" value={playerOvr(p)} color={playerOvr(p)>=85?C.acc:C.ink}/>
        <MiniStat label="SALARY" value={`${p.salary}K`} color={C.gold}/>
        <MiniStat label="CONTRACT" value={contractLabel(p.contract)} color={p.contract<=16?C.red:C.dim}/>
      </div>
    </div>
    {/* Radar + stat bars side by side */}
    <div style={{display:"flex",gap:16,marginBottom:4,alignItems:"flex-start",flexWrap:"wrap"}}>
      <div style={{flexShrink:0}}>
        <div style={{fontFamily:sans,fontSize:9.5,fontWeight:700,color:C.faint,letterSpacing:.7,marginBottom:4,textAlign:"center"}}>ATTRIBUTE RADAR</div>
        <StatRadar p={p}/>
      </div>
      <div style={{flex:1,minWidth:180}}>
        <StatBars stats={coreStats} label="CORE"/>
        <StatBars stats={combatStats} label="COMBAT"/>
      </div>
    </div>
    <StatBars stats={mentalStats} label="MENTAL / PHYSICAL"/>
    <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap"}}>
      <MiniStat label="FORM" value={p.form>0?"+"+p.form.toFixed(1):p.form.toFixed(1)} color={p.form>3?C.win:p.form<-3?C.red:C.faint}/>
      <MiniStat label="FATIGUE" value={p.fatigue} color={p.fatigue>70?C.red:p.fatigue>50?C.gold:C.win}/>
      <MiniStat label="HEALTH" value={p.injury?`${p.injury.kind} (${p.injury.weeks}wk)`:"Fit"} color={p.injury?C.red:C.win}/>
    </div>
    {c&&c.totalMaps>0&&(<>
      <SL n="CAR" t="CAREER STATS"/>
      <div style={{display:"flex",gap:14,marginBottom:16,flexWrap:"wrap"}}>
        <MiniStat label="MAPS" value={c.totalMaps} color={C.ink}/>
        <MiniStat label="AVG RTG" value={c.avgRating.toFixed(2)} color={c.avgRating>=1.1?C.win:c.avgRating>=0.9?C.ink:C.red}/>
        <MiniStat label="BEST" value={c.bestRating.toFixed(2)} color={C.gold}/>
        <MiniStat label="MVPs" value={c.totalMvps} color={C.gold}/>
        <MiniStat label="CLUTCH" value={c.totalClutches} color={C.live}/>
        <MiniStat label="~KILLS" value={c.kills} color={C.dim}/>
      </div>
    </>)}
    {mapEntries.length>0&&(<>
      <SL n="MAP" t="MAP PERFORMANCE"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8,marginBottom:16}}>
        {mapEntries.map(([map,ms])=>{const wr=ms.maps>0?Math.round(ms.wins/ms.maps*100):0;return(
          <div key={map} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:7,padding:"8px 10px",textAlign:"center"}}>
            <div style={{fontWeight:600,fontSize:12}}>{map}</div>
            <div style={{fontFamily:mono,fontSize:16,fontWeight:700,color:ms.avgRating>=1.1?C.win:ms.avgRating>=0.9?C.ink:C.red,marginTop:2}}>{ms.avgRating.toFixed(2)}</div>
            <div style={{fontFamily:mono,fontSize:9,color:C.faint}}>{ms.maps} maps · {wr}% WR</div>
          </div>);})}
      </div>
    </>)}
    {evHist.length>0&&(<>
      <SL n="EVT" t="EVENT HISTORY"/>
      {evHist.length>=2&&(
        <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,padding:"10px 12px",marginBottom:8}}>
          <RatingTrendChart history={evHist}/>
        </div>
      )}
      <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"50px 60px 50px 50px",gap:6,padding:"6px 12px",fontFamily:mono,fontSize:9,color:C.faint}}>
          <span>EVENT</span><span style={{textAlign:"right"}}>RTG</span><span style={{textAlign:"right"}}>MVPs</span><span style={{textAlign:"right"}}>MAPS</span>
        </div>
        {evHist.map((e,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"50px 60px 50px 50px",gap:6,padding:"5px 12px",borderTop:`1px solid ${C.line}`}}>
            <span style={{fontFamily:mono,fontSize:10,color:C.acc}}>#{e.eventNum+1}</span>
            <span style={{fontFamily:mono,fontSize:12,fontWeight:700,textAlign:"right",color:e.rating>=1.1?C.win:e.rating>=0.9?C.ink:C.red}}>{e.rating.toFixed(2)}</span>
            <span style={{fontFamily:mono,fontSize:11,textAlign:"right",color:C.gold}}>{e.mvps}</span>
            <span style={{fontFamily:mono,fontSize:11,textAlign:"right",color:C.dim}}>{e.maps}</span>
          </div>))}
      </div>
    </>)}
  </Overlay>);}

export function StatsView({t}){
  const all=Object.entries(t.simState.stats).filter(([,s])=>s.maps>0)
    .sort((a,b)=>b[1].rating-a[1].rating).slice(0,30)
    .map(([name,s],i)=>({name,...s,rank:i+1,team:t.simState.players.find(x=>x.name===name)?.team||"FA"}));
  return(<div>
    <Intro text="Player performance this event — HLTV-style event leaderboard."/>
    <Table rowKey={r=>r.name} rows={all} initialSort={{key:"rating",dir:"desc"}} cols={[
      {key:"rank",label:"#",align:"right",mono,w:36,cell:r=><span style={{color:C.faint}}>{r.rank}</span>},
      {key:"name",label:"Player",sort:r=>r.name,cell:r=><span style={{fontWeight:700,fontSize:13}}>{r.name}</span>},
      {key:"team",label:"Team",sort:r=>r.team,cell:r=>(
        <span style={{display:"inline-flex",alignItems:"center",gap:7,color:C.dim,fontSize:12}}><TeamCrest name={r.team!=="FA"?r.team:null} size={16}/>{r.team}</span>)},
      {key:"rating",label:"Rating",align:"right",mono,sort:r=>r.rating,cell:r=><span style={{fontWeight:700,fontSize:13,color:rating2Color(r.rating)}}>{r.rating.toFixed(2)}</span>},
      {key:"maps",label:"Maps",align:"right",mono,sort:r=>r.maps,cell:r=><span style={{color:C.dim}}>{r.maps}</span>},
      {key:"mvps",label:"MVP",align:"right",mono,sort:r=>r.mvps,cell:r=><span style={{color:C.gold}}>{r.mvps}</span>},
      {key:"clutches",label:"Clutch",align:"right",mono,sort:r=>r.clutches,cell:r=><span style={{color:C.live}}>{r.clutches}</span>},
    ]}/>
  </div>);}
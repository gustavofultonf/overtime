import React, { useState } from 'react';
import { C, sans, mono } from './theme.js';
import { playerOvr } from '../engine/player.js';
import { rosterOf, teamBase } from '../engine/state.js';
import { Overlay, SL, Intro, Pill, TraitPill, Stat, MiniStat, FormArrow } from './primitives.jsx';

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

export function RosterView2({state,myTeam,onNegotiate,onChangeRole}){
  const [profilePlayer,setProfilePlayer]=useState(null);
  const [negotiating,setNegotiating]=useState(null);
  const [negoResult,setNegoResult]=useState(null);
  const r=rosterOf(state,myTeam);const base=teamBase(state,myTeam);const chem=state.chemistry[myTeam]||55;
  const roleColor={IGL:C.live,AWP:"#e05050",Entry:C.acc,Lurk:C.gold,Support:C.win};

  return(<div>
    {/* Team overview header */}
    <div style={{background:`linear-gradient(180deg,${C.panel2},${C.panel})`,border:`1px solid ${C.line}`,borderRadius:12,padding:"20px 18px 14px",marginBottom:16,textAlign:"center"}}>
      <div style={{fontWeight:800,fontSize:20,color:C.acc,letterSpacing:1}}>{myTeam}</div>
      <div style={{fontFamily:mono,fontSize:11,color:C.dim,marginTop:4}}>Team overview</div>
      <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:12}}>
        <MiniStat label="RATING" value={base.toFixed(1)} color={C.acc}/>
        <MiniStat label="CHEMISTRY" value={chem} color={chem>=80?C.win:chem>=60?C.gold:C.red}/>
      </div>
    </div>

    {/* Player cards — HLTV fantasy style */}
    <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,marginBottom:16}}>
      {r.map(p=>{
        const ovr=playerOvr(p);const st=state.stats[p.name];const career=state.career?.[p.name];
        const fc=p.fatigue>80?C.red:p.fatigue>60?C.gold:p.fatigue>40?"#8bc99a":C.win;
        const rc=roleColor[p.role]||C.dim;
        return(
        <button key={p.name} onClick={()=>setProfilePlayer(p)}
          style={{background:`linear-gradient(180deg,${rc}18,${C.panel})`,border:`1px solid ${rc}55`,borderRadius:10,padding:0,minWidth:140,maxWidth:160,flex:"0 0 auto",textAlign:"center",overflow:"hidden"}}>
          {/* Role header */}
          <div style={{background:rc+"33",padding:"6px 8px",borderBottom:`1px solid ${rc}44`}}>
            <div style={{fontWeight:800,fontSize:11,color:rc,letterSpacing:1}}>{p.role}</div>
          </div>
          {/* Avatar placeholder */}
          <div style={{padding:"12px 10px 8px"}}>
            <div style={{width:56,height:56,borderRadius:28,background:C.panel2,border:`2px solid ${rc}66`,margin:"0 auto 8px",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:mono,fontSize:18,fontWeight:800,color:rc}}>
              {p.name.slice(0,2).toUpperCase()}
            </div>
            {/* Name */}
            <div style={{fontWeight:700,fontSize:14,color:C.ink,marginBottom:2}}>{p.name}</div>
            {/* OVR badge */}
            <div style={{display:"inline-block",background:ovr>=90?C.acc:ovr>=80?C.win:ovr>=70?C.live:C.dim,color:"#0a0c10",fontFamily:mono,fontSize:12,fontWeight:800,borderRadius:5,padding:"2px 10px",marginBottom:8}}>
              {ovr} OVR
            </div>
            {/* Key stats grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3,marginBottom:8}}>
              {[["AIM",p.aim],["SENSE",p.gameSense],["RIFLE",p.rifle||0],["CLUTCH",p.clutch||0]].map(([l,v])=>(
                <div key={l} style={{background:C.panel2,borderRadius:4,padding:"3px 0"}}>
                  <div style={{fontFamily:mono,fontSize:7,color:C.faint,letterSpacing:1}}>{l}</div>
                  <div style={{fontFamily:mono,fontSize:12,fontWeight:700,color:v>=90?C.acc:v>=75?C.win:C.ink}}>{v}</div>
                </div>
              ))}
            </div>
            {/* Status bar: form + fatigue */}
            <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:6}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:mono,fontSize:7,color:C.faint}}>FORM</div>
                <div style={{fontFamily:mono,fontSize:11,fontWeight:700,color:p.form>3?C.win:p.form<-3?C.red:C.faint}}>{p.form>0?"+":""}{p.form.toFixed(1)}</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:mono,fontSize:7,color:C.faint}}>FATIGUE</div>
                <div style={{width:30,height:4,background:C.line,borderRadius:2,overflow:"hidden",margin:"3px auto 0"}}>
                  <div style={{width:`${p.fatigue}%`,height:"100%",background:fc,borderRadius:2}}/>
                </div>
              </div>
            </div>
            {/* Contract + salary */}
            <div style={{fontFamily:mono,fontSize:9,color:C.faint}}>
              ${p.salary}K/mo · {p.contract<=1?<span style={{color:C.red}}>!{p.contract}ev</span>:<span>{p.contract}ev</span>}
            </div>
            {/* Age + traits */}
            <div style={{display:"flex",gap:3,justifyContent:"center",marginTop:4,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontFamily:mono,fontSize:8,color:p.age>=32?C.red:p.age>=29?C.gold:p.age>=23&&p.age<=26?C.win:p.age<=21?C.live:C.faint}}>
                age {p.age}{p.age>=23&&p.age<=26?" ★":p.age>=32?" ↓":""}
              </span>
              {p.traits.map(tr=><TraitPill key={tr} t={tr}/>)}
            </div>
          </div>
          {/* Sparkline + stats footer */}
          <div style={{background:C.panel2,padding:"6px 8px",borderTop:`1px solid ${C.line}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:6}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {st&&st.maps>0&&<span style={{fontFamily:mono,fontSize:10,color:st.rating>=1.1?C.win:st.rating>=0.9?C.ink:C.red,fontWeight:700}}>{st.rating.toFixed(2)}</span>}
              {(!st||st.maps===0)&&career&&career.totalMaps>0&&<span style={{fontFamily:mono,fontSize:10,color:career.avgRating>=1.1?C.win:career.avgRating>=0.9?C.ink:C.red}}>{career.avgRating.toFixed(2)}</span>}
              {st&&st.maps>0&&<span style={{fontFamily:mono,fontSize:9,color:C.gold}}>{st.mvps}MVP</span>}
            </div>
            {career&&<Sparkline history={career.eventHistory}/>}
          </div>
        </button>);
      })}
    </div>

    {/* Quick overview / actions */}
    <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,padding:"14px 16px",marginBottom:16}}>
      <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>Quick actions</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {r.map(p=>(
          <div key={p.name} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderTop:`1px solid ${C.line}`}}>
            <span style={{fontWeight:600,fontSize:12,minWidth:90,color:C.ink}}>{p.name}</span>
            {onChangeRole&&<select value={p.role} onChange={e=>onChangeRole(p.name,e.target.value)}
              style={{background:C.panel2,color:C.ink,border:`1px solid ${C.line}`,borderRadius:5,padding:"4px 8px",fontFamily:mono,fontSize:10}}>
              {["IGL","AWP","Entry","Lurk","Support"].map(rl=><option key={rl} value={rl}>{rl}</option>)}
            </select>}
            {p.contract<=1&&onNegotiate&&<button onClick={()=>setNegotiating({player:p,offer:p.salary})}
              style={{marginLeft:"auto",background:C.gold,color:"#0a0c10",border:"none",borderRadius:5,padding:"4px 10px",fontFamily:mono,fontSize:9,fontWeight:700}}>RENEW CONTRACT</button>}
          </div>
        ))}
      </div>
    </div>

    {/* Negotiation modal */}
    {negotiating&&(
      <Overlay onClose={()=>{setNegotiating(null);setNegoResult(null);}} title={`CONTRACT · ${negotiating.player.name}`}>
        {negoResult?(
          <div>
            <div style={{fontSize:14,color:negoResult.success?C.win:C.red,marginBottom:12}}>{negoResult.msg}</div>
            <button onClick={()=>{setNegotiating(null);setNegoResult(null);}} style={{background:C.acc,color:"#0a0c10",border:"none",borderRadius:8,padding:"10px 20px",fontWeight:700}}>OK</button>
          </div>
        ):(
          <div>
            <div style={{marginBottom:12}}>
              <span style={{fontFamily:mono,fontSize:12,color:C.dim}}>Current: ${negotiating.player.salary}/mo · {negotiating.player.contract} events left</span>
            </div>
            <div style={{fontFamily:mono,fontSize:11,color:C.dim,marginBottom:8}}>YOUR OFFER ($/month)</div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16}}>
              <button onClick={()=>setNegotiating(n=>({...n,offer:Math.max(5,n.offer-2)}))} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:5,padding:"6px 10px",fontFamily:mono,color:C.ink}}>−</button>
              <span style={{fontFamily:mono,fontSize:20,fontWeight:700,color:C.gold,minWidth:60,textAlign:"center"}}>${negotiating.offer}</span>
              <button onClick={()=>setNegotiating(n=>({...n,offer:n.offer+2}))} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:5,padding:"6px 10px",fontFamily:mono,color:C.ink}}>+</button>
            </div>
            <button onClick={()=>{const res=onNegotiate(negotiating.player.name,negotiating.offer);setNegoResult(res);}} style={{width:"100%",background:C.acc,color:"#0a0c10",border:"none",borderRadius:8,padding:"12px",fontWeight:800,fontSize:14}}>SUBMIT OFFER</button>
          </div>
        )}
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
      {stats.map(([key,lbl])=>{const val=p[key]||0;const d=statDiff(key);return(
        <div key={key} style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontFamily:mono,fontSize:10,color:C.faint,width:48}}>{lbl}</span>
          <div style={{flex:1,height:7,background:C.line,borderRadius:4,overflow:"hidden"}}>
            <div style={{width:`${val}%`,height:"100%",background:val>=90?C.acc:val>=75?C.win:val>=60?C.live:C.dim,borderRadius:4}}/>
          </div>
          <span style={{fontFamily:mono,fontSize:12,fontWeight:700,width:28,textAlign:"right",color:val>=90?C.acc:C.ink}}>{val}</span>
          {d!==0?<span style={{fontFamily:mono,fontSize:10,color:d>0?C.win:C.red,width:30}}>{d>0?"+":""}{d}</span>:<span style={{width:30}}/>}
        </div>);})}
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
          <span style={{fontFamily:mono,fontSize:10,color:p.age>=32?C.red:p.age>=29?C.gold:p.age>=23&&p.age<=26?C.win:p.age<=21?C.live:C.faint}}>age {p.age}{p.age>=23&&p.age<=26?" ★":p.age>=32?" ↓":""}</span>
        </div>
      </div>
      <div style={{marginLeft:"auto",display:"flex",gap:14,flexWrap:"wrap"}}>
        <MiniStat label="OVR" value={playerOvr(p)} color={playerOvr(p)>=85?C.acc:C.ink}/>
        <MiniStat label="SALARY" value={`${p.salary}K`} color={C.gold}/>
        <MiniStat label="CONTRACT" value={p.contract} color={p.contract<=1?C.red:C.dim}/>
      </div>
    </div>
    {/* Radar + stat bars side by side */}
    <div style={{display:"flex",gap:16,marginBottom:4,alignItems:"flex-start",flexWrap:"wrap"}}>
      <div style={{flexShrink:0}}>
        <div style={{fontFamily:mono,fontSize:9,color:C.faint,letterSpacing:1,marginBottom:4,textAlign:"center"}}>ATTRIBUTE RADAR</div>
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
  const all=Object.entries(t.simState.stats).filter(([,s])=>s.maps>0).sort((a,b)=>b[1].rating-a[1].rating);
  return(<div>
    <Intro text="Player performance this event."/>
    <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"30px 110px 1fr 55px 50px 45px 45px",gap:8,padding:"8px 14px",fontFamily:mono,fontSize:10,color:C.faint,letterSpacing:1}}>
        <span>#</span><span>PLAYER</span><span>TEAM</span><span style={{textAlign:"right"}}>RTG</span><span style={{textAlign:"right"}}>MAPS</span><span style={{textAlign:"right"}}>MVP</span><span style={{textAlign:"right"}}>CLT</span>
      </div>
      {all.slice(0,30).map(([name,s],i)=>{const p=t.simState.players.find(x=>x.name===name);return(
        <div key={name} style={{display:"grid",gridTemplateColumns:"30px 110px 1fr 55px 50px 45px 45px",gap:8,padding:"7px 14px",alignItems:"center",borderTop:`1px solid ${C.line}`}}>
          <span style={{fontFamily:mono,fontSize:12,color:C.faint}}>{i+1}</span>
          <span style={{fontWeight:600,fontSize:13}}>{name}</span>
          <span style={{fontSize:12,color:C.dim}}>{p?.team||"FA"}</span>
          <span style={{fontFamily:mono,fontSize:13,fontWeight:700,textAlign:"right",color:s.rating>=1.15?C.win:s.rating>=0.95?C.ink:C.red}}>{s.rating.toFixed(2)}</span>
          <span style={{fontFamily:mono,fontSize:12,textAlign:"right",color:C.dim}}>{s.maps}</span>
          <span style={{fontFamily:mono,fontSize:12,textAlign:"right",color:C.gold}}>{s.mvps}</span>
          <span style={{fontFamily:mono,fontSize:12,textAlign:"right",color:C.live}}>{s.clutches}</span>
        </div>);})}
    </div>
  </div>);}
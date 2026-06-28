import React, { useState } from 'react';
import { C, sans, mono } from './theme.js';
import { playerOvr } from '../engine/utils.js';
import { rosterOf, getMapProf } from '../engine/state.js';

const STYLES = ["Aggressive","Structured","Utility","AWP-Dependent"];

const STYLE_META = {
  "Aggressive": {
    color: C.acc,
    bg: "rgba(155,140,255,.10)",
    short: "Rush and pressure. Entry fraggers lead every round.",
    beats: "Utility",
    beatenBy: "Structured",
    bonus: "Entry impact ×1.3 · higher performance variance",
    fit: p => p.role==="Entry" ? p.aim : 0,
    fitLabel: "Entry fragging power",
    fitKey: "aim",
  },
  "Structured": {
    color: C.live,
    bg: "rgba(20,184,166,.10)",
    short: "IGL-driven. Disciplined setups and counterstrategy.",
    beats: "Aggressive",
    beatenBy: "AWP-Dependent",
    bonus: "IGL bonus ×1.5 · consistent mid-round reads",
    fit: p => p.role==="IGL" ? p.igl : 0,
    fitLabel: "IGL quality",
    fitKey: "igl",
  },
  "Utility": {
    color: C.win,
    bg: "rgba(34,197,94,.10)",
    short: "Grenade-heavy setup. Map knowledge is multiplied.",
    beats: "AWP-Dependent",
    beatenBy: "Aggressive",
    bonus: "Map proficiency bonus to all perf · utility stats amplified",
    fit: (p, mapProf) => Object.values(mapProf||{}).reduce((s,v)=>s+v,0)/7,
    fitLabel: "Map proficiency (avg)",
    fitKey: "util",
  },
  "AWP-Dependent": {
    color: "#e05050",
    bg: "rgba(224,80,80,.10)",
    short: "AWP carries rounds. Lower threshold, higher ceiling.",
    beats: "Structured",
    beatenBy: "Utility",
    bonus: "AWP carry bonus ×1.6 · activates at awp 80+ (normally 85+)",
    fit: p => p.role==="AWP" ? p.awp : 0,
    fitLabel: "AWP firepower",
    fitKey: "awp",
  },
};

function FitBar({score, max=99}){
  const pct = Math.min(100, Math.round(score/max*100));
  const col = pct>=75?C.win:pct>=50?C.gold:C.red;
  return(
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <div style={{width:80,height:5,background:C.panel2,borderRadius:3,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:3}}/>
      </div>
      <span style={{fontFamily:mono,fontSize:11,color:col}}>{Math.round(score)}</span>
    </div>
  );
}

export function TacticsView({season, myTeam, onSetStyle}){
  const state = season.simState;
  const roster = rosterOf(state, myTeam);
  const mapProf = getMapProf(state, myTeam);
  const currentStyle = state.tactics?.[myTeam] || null;
  const [preview, setPreview] = useState(currentStyle || "Aggressive");

  const meta = STYLE_META[preview];

  // Compute roster fit per style
  function fitScore(style){
    const m = STYLE_META[style];
    if(style==="Utility"){
      const avg = Object.values(mapProf||{}).reduce((s,v)=>s+v,0)/Math.max(1,Object.keys(mapProf||{}).length);
      return avg;
    }
    const scores = roster.map(p=>m.fit(p,mapProf)).filter(v=>v>0);
    return scores.length ? Math.max(...scores) : 0;
  }

  // Best player for each style
  function bestFit(style){
    const m = STYLE_META[style];
    if(style==="Utility") return null;
    return [...roster].sort((a,b)=>m.fit(b)-m.fit(a)).find(p=>m.fit(p)>0);
  }

  return(
  <div>
    {/* Current style banner */}
    <div style={{background:currentStyle?STYLE_META[currentStyle]?.bg:C.panel,border:`1px solid ${currentStyle?STYLE_META[currentStyle]?.color+"55":C.line}`,borderRadius:12,padding:"16px 20px",marginBottom:16}}>
      <div style={{fontFamily:mono,fontSize:9,color:C.faint,letterSpacing:1.5,marginBottom:4}}>CURRENT TEAM STYLE</div>
      {currentStyle
        ? <div style={{fontFamily:mono,fontSize:20,fontWeight:800,color:STYLE_META[currentStyle]?.color}}>{currentStyle.toUpperCase()}</div>
        : <div style={{fontFamily:mono,fontSize:14,color:C.faint}}>No style set — pick one below. Defaulting to no tactical advantage.</div>
      }
    </div>

    {/* Style picker */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8,marginBottom:16}}>
      {STYLES.map(s=>{
        const m=STYLE_META[s];
        const active=s===currentStyle;
        const previewing=s===preview;
        return(
        <button key={s} onClick={()=>setPreview(s)}
          style={{background:previewing?m.bg:C.panel,border:`2px solid ${active?m.color:previewing?m.color+"66":C.line}`,borderRadius:10,padding:"12px 14px",textAlign:"left",cursor:"pointer",position:"relative"}}>
          {active&&<span style={{position:"absolute",top:6,right:8,fontFamily:mono,fontSize:8,color:m.color,letterSpacing:1}}>ACTIVE</span>}
          <div style={{fontFamily:mono,fontWeight:800,fontSize:13,color:m.color,marginBottom:3}}>{s}</div>
          <div style={{fontFamily:mono,fontSize:9,color:C.faint}}>Beats: {STYLE_META[s].beats}</div>
        </button>);
      })}
    </div>

    {/* Preview panel */}
    {meta&&(
    <div style={{background:meta.bg,border:`1px solid ${meta.color}44`,borderRadius:12,padding:"18px 20px",marginBottom:16}}>
      <div style={{fontFamily:mono,fontWeight:800,fontSize:16,color:meta.color,marginBottom:6}}>{preview}</div>
      <div style={{fontSize:14,color:C.dim,marginBottom:14,lineHeight:1.6}}>{meta.short}</div>
      <div style={{display:"flex",gap:24,flexWrap:"wrap",marginBottom:14}}>
        <div>
          <div style={{fontFamily:mono,fontSize:9,color:C.faint,letterSpacing:1,marginBottom:3}}>BEATS</div>
          <div style={{fontFamily:mono,fontSize:12,color:C.win}}>✓ {meta.beats}</div>
        </div>
        <div>
          <div style={{fontFamily:mono,fontSize:9,color:C.faint,letterSpacing:1,marginBottom:3}}>COUNTERED BY</div>
          <div style={{fontFamily:mono,fontSize:12,color:C.red}}>✗ {meta.beatenBy}</div>
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:mono,fontSize:9,color:C.faint,letterSpacing:1,marginBottom:3}}>MATCH BONUS</div>
          <div style={{fontFamily:mono,fontSize:11,color:C.dim}}>{meta.bonus}</div>
        </div>
      </div>

      {/* Roster fit */}
      <div style={{background:"rgba(0,0,0,.2)",borderRadius:8,padding:"10px 14px",marginBottom:14}}>
        <div style={{fontFamily:mono,fontSize:9,color:C.faint,letterSpacing:1,marginBottom:6}}>ROSTER FIT — {meta.fitLabel.toUpperCase()}</div>
        {preview==="Utility"
          ? <FitBar score={fitScore("Utility")} max={95}/>
          : (()=>{const bp=bestFit(preview);return bp?(
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontFamily:mono,fontSize:12,color:C.dim}}>{bp.name}</span>
              <FitBar score={meta.fit(bp)} max={99}/>
            </div>
          ):<span style={{fontFamily:mono,fontSize:11,color:C.red}}>No suitable player for this style</span>;})()
        }
      </div>

      <button onClick={()=>onSetStyle(preview)}
        style={{background:preview===currentStyle?C.panel:meta.color,color:preview===currentStyle?C.dim:"#0a0c10",border:`1px solid ${meta.color}`,borderRadius:8,padding:"10px 20px",fontFamily:mono,fontWeight:800,fontSize:13,cursor:"pointer"}}>
        {preview===currentStyle?"CURRENT STYLE":"SET STYLE: "+preview.toUpperCase()+" →"}
      </button>
    </div>)}

    {/* Matchup cycle */}
    <div style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:8,padding:"12px 16px",fontFamily:mono,fontSize:10,color:C.faint,lineHeight:2}}>
      <div style={{color:C.dim,fontWeight:700,marginBottom:4}}>MATCHUP CYCLE</div>
      <div><span style={{color:C.acc}}>Aggressive</span> → beats <span style={{color:C.win}}>Utility</span> → beats <span style={{color:"#e05050"}}>AWP-Dependent</span> → beats <span style={{color:C.live}}>Structured</span> → beats <span style={{color:C.acc}}>Aggressive</span></div>
      <div style={{marginTop:4}}>Winning matchup = ~+3% win rate per map · Style change takes effect next event.</div>
    </div>
  </div>);
}

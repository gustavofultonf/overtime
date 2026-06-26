import React from 'react';
import { C, sans, mono } from './theme.js';

export function Overlay({children,onClose,title,wide}){return(
  <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.72)",display:"flex",alignItems:"center",justifyContent:"center",padding:18,zIndex:50}}>
    <div onClick={e=>e.stopPropagation()} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:12,maxWidth:wide?600:480,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.line}`,display:"flex",alignItems:"center",position:"sticky",top:0,background:C.panel,zIndex:2}}>
        <span style={{fontFamily:mono,fontSize:11,color:C.acc,letterSpacing:1}}>{title}</span>
        <button onClick={onClose} style={{marginLeft:"auto",background:"transparent",border:"none",color:C.dim,fontSize:22,lineHeight:1}}>×</button>
      </div>
      <div style={{padding:"16px 18px"}}>{children}</div>
    </div>
  </div>);}
export function SL({n,t}){return(<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{fontFamily:mono,fontSize:11,color:C.acc,fontWeight:700}}>{n}</span><span style={{fontFamily:mono,fontSize:11,color:C.dim,letterSpacing:1.5}}>{t}</span><span style={{flex:1,height:1,background:C.line}}/></div>);}
export function Banner({children,c}){return <div style={{background:C.panel,border:`1px solid ${c}`,borderRadius:12,padding:"18px 20px"}}>{children}</div>;}
export function Locked({text}){return <div style={{background:C.panel,border:`1px dashed ${C.line}`,borderRadius:12,padding:"40px 20px",textAlign:"center",color:C.dim,fontSize:14}}>{text}</div>;}
export function Empty({text}){return <div style={{color:C.faint,fontSize:13,padding:"12px 0"}}>{text}</div>;}
export function Intro({text}){return <p style={{color:C.dim,fontSize:13,lineHeight:1.6,margin:"0 0 18px",maxWidth:740}}>{text}</p>;}
export function ColHead({children}){return <div style={{fontFamily:mono,fontSize:11,fontWeight:700,color:C.acc,letterSpacing:1.5,paddingBottom:6,borderBottom:`1px solid ${C.line}`}}>{children}</div>;}
export function Pill({children,c}){return <span style={{fontFamily:mono,fontSize:9,color:c,border:`1px solid ${c}`,borderRadius:4,padding:"1px 6px"}}>{children}</span>;}
export function TraitPill({t}){const m={clutch:["CLUTCH",C.win],boom:["BOOM/BUST",C.acc],leader:["LEADER",C.live]};const[l,c]=m[t]||[t,C.dim];return <Pill c={c}>{l}</Pill>;}
export function Stat({l,v}){return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:34}}><span style={{fontFamily:mono,fontSize:9,color:C.faint}}>{l}</span><span style={{fontFamily:mono,fontSize:13,fontWeight:700,color:v>=90?C.acc:C.ink}}>{v}</span></div>);}
export function MiniStat({label,value,color,small}){return(<div style={{display:"flex",flexDirection:"column",alignItems:small?"flex-end":"flex-start"}}><span style={{fontFamily:mono,fontSize:9,color:C.faint,letterSpacing:1}}>{label}</span><span style={{fontFamily:mono,fontSize:small?13:22,fontWeight:700,color}}>{value}</span></div>);}
export function FormArrow({form}){const col=form>3?C.win:form>0?"#8bc99a":form<-3?C.red:form<0?"#c98b8b":C.faint;const arrow=form>3?"▲▲":form>0?"▲":form<-3?"▼▼":form<0?"▼":"–";return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:38}}><span style={{fontFamily:mono,fontSize:9,color:C.faint}}>FORM</span><span style={{fontFamily:mono,fontSize:14,fontWeight:700,color:col}}>{arrow}</span><span style={{fontFamily:mono,fontSize:10,color:col}}>{form>0?"+":""}{form.toFixed(1)}</span></div>);}
// ── Procedural team crest ───────────────────────────────────────────
// Deterministic SVG badge generated from the team name. No two teams alike.
const CREST_PALETTE = [
  "#ff5c2e","#ffc24b","#3ddc84","#6aa3ff","#e040fb","#ff4c4c",
  "#2ee6c8","#f7768e","#9d7cff","#56d364","#e3b341","#ff7eb6",
];
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}

export function TeamCrest({name,size=26}){
  if(!name) return null;
  const h=hashStr(name);
  const shape=h%4;                    // 0 shield, 1 hexagon, 2 circle, 3 diamond
  const c1=CREST_PALETTE[(h>>3)%CREST_PALETTE.length];
  const c2=CREST_PALETTE[(h>>9)%CREST_PALETTE.length];
  const emblem=(h>>13)%4;             // inner mark
  const stripe=((h>>17)&1)===1;
  // Initials: first letter of up to two words, else first two chars
  const words=name.replace(/[^a-zA-Z0-9 ]/g,"").trim().split(/\s+/);
  const initials=(words.length>=2?words[0][0]+words[1][0]:name.replace(/[^a-zA-Z0-9]/g,"").slice(0,2)).toUpperCase();
  const id="cg"+h.toString(36);
  const S=48,CX=24,CY=24;
  // Outer shape path
  let outer;
  if(shape===0) outer=<path d="M24 2 L44 9 V25 C44 36 35 43 24 46 C13 43 4 36 4 25 V9 Z" fill={`url(#${id})`} stroke={c2} strokeWidth="1.5"/>;
  else if(shape===1) outer=<polygon points="24,3 43,13 43,35 24,45 5,35 5,13" fill={`url(#${id})`} stroke={c2} strokeWidth="1.5"/>;
  else if(shape===2) outer=<circle cx={CX} cy={CY} r="22" fill={`url(#${id})`} stroke={c2} strokeWidth="1.5"/>;
  else outer=<polygon points="24,2 46,24 24,46 2,24" fill={`url(#${id})`} stroke={c2} strokeWidth="1.5"/>;
  return(
    <svg width={size} height={size} viewBox="0 0 48 48" style={{flexShrink:0,display:"block"}}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c1}/>
          <stop offset="100%" stopColor={c1+"99"}/>
        </linearGradient>
      </defs>
      {outer}
      {stripe&&<rect x="4" y="21" width="40" height="6" fill={c2} opacity="0.35"/>}
      {emblem===0&&<polygon points="24,11 27,19 35,19 28,24 31,32 24,27 17,32 20,24 13,19 21,19" fill="#fff" opacity="0.22"/>}
      {emblem===1&&<circle cx={CX} cy={CY} r="9" fill="none" stroke="#fff" strokeWidth="2" opacity="0.25"/>}
      {emblem===2&&<polygon points="24,13 33,30 15,30" fill="#fff" opacity="0.2"/>}
      {emblem===3&&<rect x="17" y="17" width="14" height="14" fill="#fff" opacity="0.18" transform="rotate(45 24 24)"/>}
      <text x={CX} y={CY+0.5} fontFamily={mono} fontSize="15" fontWeight="800" fill="#fff" textAnchor="middle" dominantBaseline="central" style={{textShadow:"0 1px 2px rgba(0,0,0,.5)"}}>{initials}</text>
    </svg>
  );
}

// Head-to-head split bar: myWins vs theirWins
export function H2HBar({mine,theirs,myColor=C.win,theirColor=C.red}){
  const total=mine+theirs;
  const mp=total>0?(mine/total)*100:50;
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,width:"100%"}}>
      <span style={{fontFamily:mono,fontSize:11,fontWeight:700,color:myColor,minWidth:24,textAlign:"right"}}>{mine}</span>
      <div style={{flex:1,height:8,borderRadius:4,overflow:"hidden",display:"flex",background:C.panel2}}>
        <div style={{width:mp+"%",background:myColor,transition:"width 0.3s ease"}}/>
        <div style={{flex:1,background:theirColor}}/>
      </div>
      <span style={{fontFamily:mono,fontSize:11,fontWeight:700,color:theirColor,minWidth:24}}>{theirs}</span>
    </div>
  );
}

export function EdgeBar({edge}){const pct=Math.max(-1,Math.min(1,edge/8));return(
  <div style={{height:6,background:C.line,borderRadius:3,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:`${Math.abs(pct)*50}%`,background:pct>=0?C.win:C.ban,transform:pct>=0?"none":"translateX(-100%)"}}/>
    <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:C.dim}}/>
  </div>);}

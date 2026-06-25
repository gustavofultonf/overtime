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
export function EdgeBar({edge}){const pct=Math.max(-1,Math.min(1,edge/8));return(
  <div style={{height:6,background:C.line,borderRadius:3,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:`${Math.abs(pct)*50}%`,background:pct>=0?C.win:C.ban,transform:pct>=0?"none":"translateX(-100%)"}}/>
    <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:C.dim}}/>
  </div>);}

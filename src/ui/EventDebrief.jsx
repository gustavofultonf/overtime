import React, { useMemo } from 'react';
import { C, sans, mono } from './theme.js';
import { CountUp } from './primitives.jsx';

const PLACE_LABELS=["","1st","2nd","3rd","4th","5th-8th","9th-12th","13th-16th"];
const PLACE_COLORS=["",C.gold,"#c9d2e0","#cd7f32",C.dim,C.faint,C.faint,C.faint];
const CONFETTI_COLORS=[C.gold,C.acc,C.win,C.live,"#f472b6"];

// Pure-CSS confetti burst across the overlay on a tournament win. Piece layout is
// randomized once per mount (useMemo) so it doesn't reshuffle on incidental re-renders
// while the debrief is open. Respects prefers-reduced-motion via Gstyle's global rule.
function Confetti(){
  const pieces=useMemo(()=>Array.from({length:60},(_,i)=>({
    id:i,
    left:Math.random()*100,
    delay:Math.random()*1.2,
    duration:2.4+Math.random()*1.8,
    size:6+Math.random()*6,
    color:CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)],
    round:Math.random()<0.5,
  })),[]);
  return(
    <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:1}}>
      {pieces.map(p=>(
        <div key={p.id} style={{
          position:"absolute",left:`${p.left}%`,top:0,width:p.size,height:p.size*(p.round?1:1.6),
          background:p.color,borderRadius:p.round?"50%":2,
          animation:`confettiFall ${p.duration}s linear ${p.delay}s infinite`,
        }}/>
      ))}
    </div>
  );
}

export function EventDebrief({debrief,onDismiss}){
  const{label,tier,place,prize,champion,playerStats,mvp,chemBefore,chemAfter,winBonus}=debrief;
  const placeLabel=PLACE_LABELS[place]||`${place}th`;
  const placeColor=PLACE_COLORS[place]||C.faint;
  const won=place===1;
  const chemDelta=chemAfter-chemBefore;

  return(
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",padding:18,zIndex:60,animation:"fadeUp .2s ease",overflow:"hidden"}}>
    {won&&<Confetti/>}
    <div style={{position:"relative",zIndex:2,background:C.panel,border:`1px solid ${won?C.gold+"66":C.line}`,borderRadius:14,maxWidth:580,width:"100%",maxHeight:"92vh",overflowY:"auto",animation:"popIn .42s cubic-bezier(.2,.8,.3,1)",...(won?{boxShadow:`0 0 50px -6px ${C.gold}66`}:{})}}>

      {/* Header banner */}
      <div className={won?"sheen":undefined} style={{background:won?"rgba(243,194,91,.08)":"rgba(20,20,30,1)",borderRadius:"14px 14px 0 0",padding:"20px 22px",borderBottom:`1px solid ${C.line}`}}>
        <div style={{fontFamily:mono,fontSize:10,color:tier==="Major"?C.gold:tier==="A"?C.live:C.dim,letterSpacing:2,marginBottom:6}}>
          {tier==="Major"?"MAJOR":tier==="A"?"A-TIER":"B-TIER"} · EVENT DEBRIEF
        </div>
        <div style={{fontWeight:800,fontSize:22,letterSpacing:-.5,marginBottom:8,fontFamily:sans}}>{label}</div>
        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontFamily:mono,fontSize:22,fontWeight:800,color:placeColor,display:"inline-block",animation:"stampIn .5s ease"}}>{placeLabel}</span>
          <CountUp value={prize} prefix="+$" suffix="K" style={{fontFamily:mono,fontSize:15,color:C.gold,fontWeight:700}}/>
          {won&&<span style={{fontFamily:mono,fontSize:13,color:"#0a0c10",background:C.gold,padding:"5px 12px",borderRadius:6,letterSpacing:1,fontWeight:800,animation:"glowPulse 1.8s ease-in-out infinite"}}>CHAMPIONS</span>}
        </div>
        {!won&&champion&&<div style={{fontFamily:mono,fontSize:11,color:C.faint,marginTop:5}}>Champion: <span style={{color:C.dim}}>{champion}</span></div>}
      </div>

      <div style={{padding:"16px 22px"}}>
        {/* Win bonus */}
        {winBonus&&(
          <div style={{background:"rgba(243,194,91,.07)",border:`1px solid ${C.gold}44`,borderRadius:8,padding:"8px 13px",marginBottom:14,fontFamily:mono,fontSize:11,color:C.gold}}>
            WIN BONUS — all players +5 form · chemistry +10
          </div>
        )}

        {/* Player performance table */}
        <div style={{fontFamily:mono,fontSize:10,color:C.faint,letterSpacing:1.5,marginBottom:8}}>PLAYER PERFORMANCE</div>
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:18}}>
          {[...playerStats].sort((a,b)=>b.rating-a.rating).map((p,i)=>{
            const isMvp=mvp&&p.name===mvp.name&&p.maps>=2;
            const rColor=p.rating>=1.15?C.win:p.rating>=0.95?C.dim:C.red;
            return(
            <div key={p.name} style={{background:i===0?"rgba(243,194,91,.05)":C.panel2,border:`1px solid ${i===0?C.gold+"33":C.line}`,borderRadius:8,padding:"9px 13px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",animation:`risePop .4s ease both`,animationDelay:`${0.08+i*0.07}s`}}>
              <div style={{minWidth:90}}>
                <div style={{fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:6}}>
                  {p.name}
                  {isMvp&&<span style={{fontFamily:mono,fontSize:8,color:C.gold,background:"rgba(243,194,91,.18)",padding:"2px 6px",borderRadius:3,letterSpacing:.5}}>MVP</span>}
                </div>
                <div style={{fontFamily:mono,fontSize:9,color:C.faint,marginTop:1}}>{p.role}</div>
              </div>
              <div style={{display:"flex",gap:16,marginLeft:"auto",fontFamily:mono,flexWrap:"wrap"}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.faint,marginBottom:1}}>MAPS</div>
                  <div style={{fontSize:14,fontWeight:700,color:C.dim}}>{p.maps}</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.faint,marginBottom:1}}>RATING</div>
                  <div style={{fontSize:14,fontWeight:700,color:rColor}}>{p.rating.toFixed(2)}</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.faint,marginBottom:1}}>MVPs</div>
                  <div style={{fontSize:14,fontWeight:700,color:p.mvps>0?C.gold:C.faint}}>{p.mvps}</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.faint,marginBottom:1}}>CLU</div>
                  <div style={{fontSize:14,fontWeight:700,color:p.clutches>0?C.live:C.faint}}>{p.clutches}</div>
                </div>
              </div>
            </div>);
          })}
        </div>

        {/* Chemistry */}
        <div style={{display:"flex",gap:10,alignItems:"center",fontFamily:mono,fontSize:12,marginBottom:20,padding:"8px 12px",background:C.panel2,borderRadius:7,border:`1px solid ${C.line}`}}>
          <span style={{color:C.faint,letterSpacing:1}}>CHEMISTRY</span>
          <span style={{fontWeight:700,color:C.dim}}>{Math.round(chemBefore)}</span>
          <span style={{color:C.faint}}>→</span>
          <span style={{fontWeight:700,color:chemDelta>=0?C.win:C.red}}>{Math.round(chemAfter)}</span>
          <span style={{color:chemDelta>=0?C.win:C.red,fontSize:11}}>{chemDelta>=0?`+${Math.round(chemDelta)}`:Math.round(chemDelta)}</span>
        </div>

        <button onClick={onDismiss}
          style={{width:"100%",background:C.acc,color:"#0a0c10",border:"none",borderRadius:10,padding:"14px",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:mono}}>
          CONTINUE →
        </button>
      </div>
    </div>
  </div>);
}

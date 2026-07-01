import React, { useState } from 'react';
import { C, sans, mono } from './theme.js';
import { weekToLabel } from '../constants/events.js';
import { isRivalMatch } from '../engine/state.js';
import { predictMatch } from '../engine/prediction.js';
import { SL, Locked, Empty, TeamCrest, Btn } from './primitives.jsx';

// Small status chip used for match stakes / ownership tags.
function Tag({c,children,solid}){
  return <span style={{fontFamily:sans,fontSize:9.5,fontWeight:700,color:solid?C.onAcc:c,background:solid?c:c+"1a",border:solid?"none":`1px solid ${c}55`,borderRadius:5,padding:"2px 8px",letterSpacing:.2,whiteSpace:"nowrap"}}>{children}</span>;
}

export function EventHLTV({t,myTeam,nf,onPlay,alive,onOpen,onEndEvent,season,SEED,evLabel,tierTag,tab,setTab}){
  const [evTab,setEvTab]=useState("results");
  const tierC=tierTag==="Major"?C.gold:tierTag==="A"?C.live:C.dim;
  const location=season?.currentEvent?.location||"";

  return(<div style={{fontFamily:sans}}>
    {/* HLTV-style event header */}
    <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,padding:"16px 20px",marginBottom:12}}>
      <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div style={{background:tierC+"22",border:`1px solid ${tierC}`,borderRadius:6,padding:"3px 10px",fontFamily:sans,fontSize:11,color:tierC,fontWeight:800}}>{tierTag==="Major"?"Major":`${tierTag}-Tier`}</div>
        <div>
          <div style={{fontWeight:800,fontSize:20}}>{evLabel}</div>
          <div style={{fontSize:12,color:C.dim,marginTop:2}}>{location} · {weekToLabel(season?.week||1,season?.year)}, {season?.year||2026} · {t.teams?.length||t.participants?.length||16} teams</div>
        </div>
        {t.stage==="done"&&t.champion&&(
          <div style={{marginLeft:"auto",textAlign:"right"}}>
            <div style={{fontSize:10,fontWeight:700,color:C.gold}}>Champion</div>
            <div style={{fontWeight:800,fontSize:16,color:C.gold}}>{t.champion}</div>
          </div>
        )}
      </div>
    </div>

    {/* Action banner */}
    {t.stage==="done"?(
      <div className={t.champion===myTeam?"sheen":undefined} style={{background:t.champion===myTeam?`linear-gradient(135deg,${C.gold}1f,${C.panel})`:C.panel,border:`1px solid ${t.champion===myTeam?C.gold:C.line}`,borderRadius:10,padding:"14px 18px",marginBottom:12,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",animation:t.champion===myTeam?"glowPulse 2.2s ease-in-out infinite":undefined}}>
        {t.champion===myTeam?<span style={{color:C.gold,fontWeight:800,fontSize:18}}>{myTeam} win {evLabel}</span>:<span style={{color:C.dim,fontSize:15}}>{myTeam} finish {alive?"top":"eliminated"}.</span>}
        {onEndEvent&&<button onClick={onEndEvent} style={{marginLeft:"auto",background:t.champion===myTeam?C.gold:C.acc,color:C.onAcc,border:"none",borderRadius:8,padding:"10px 20px",fontWeight:800,fontSize:14}}>Back to Dashboard →</button>}
      </div>
    ):!alive?(
      <div style={{background:C.panel,border:`1px solid ${C.red}40`,borderRadius:10,padding:"14px 18px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
        <span style={{color:C.red,fontWeight:700}}>{myTeam} eliminated</span>
        {onEndEvent&&<button onClick={onEndEvent} style={{marginLeft:"auto",background:C.panel2,color:C.acc,border:`1px solid ${C.acc}`,borderRadius:8,padding:"8px 16px",fontWeight:700,fontSize:13}}>Back to Dashboard →</button>}
      </div>
    ):nf?(
      <NextMatchHLTV nf={nf} myTeam={myTeam} onPlay={onPlay} t={t} SEED={SEED}/>
    ):(
      // Alive but no pending match yet (waiting on the bracket to resolve, or a rare
      // stuck state). Never leave the manager without a way out of the event.
      <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,padding:"14px 18px",marginBottom:12,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <span style={{color:C.dim,fontSize:14}}>No match awaiting you right now — the rest of the bracket is being decided.</span>
        {onEndEvent&&<button onClick={onEndEvent} style={{marginLeft:"auto",background:C.acc,color:C.onAcc,border:"none",borderRadius:8,padding:"10px 18px",fontWeight:800,fontSize:14}}>Back to Dashboard →</button>}
      </div>
    )}

    {/* Stage tabs */}
    <div style={{display:"flex",gap:1,marginBottom:12,background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,overflow:"hidden"}}>
      {[["results","Results"],["standings","Standings"],["bracket","Bracket"]].map(([tb,label])=>(
        <button key={tb} onClick={()=>setEvTab(tb)}
          style={{flex:1,background:evTab===tb?`linear-gradient(100deg,${C.accDeep},${C.acc})`:"transparent",color:evTab===tb?"#fff":C.dim,border:"none",padding:"9px 0",fontFamily:sans,fontSize:12.5,fontWeight:700,letterSpacing:.2}}>
          {label}
        </button>
      ))}
    </div>

    {evTab==="results"&&<SwissResults t={t} myTeam={myTeam} onOpen={onOpen} SEED={SEED}/>}
    {evTab==="standings"&&<SwissStandings t={t} myTeam={myTeam} SEED={SEED}/>}
    {evTab==="bracket"&&(t.bracket?<PlayoffBracket bracket={t.bracket} champion={t.champion} myTeam={myTeam} onOpen={onOpen} SEED={SEED}/>:<Locked text="Bracket unlocks when all group matches are complete."/>)}
  </div>);
}

export function NextMatchHLTV({nf,myTeam,onPlay,t,SEED}){
  const opp=nf.fx.a===myTeam?nf.fx.b:nf.fx.a;
  const bo=nf.bo||nf.fx?.bo||1;
  const isSwiss=nf.kind==="swiss";
  const myRec=t.swiss?.records[myTeam];
  const oppRec=t.swiss?.records[opp];
  const rival=isRivalMatch(t.simState,myTeam,opp);
  const kindLabel=isSwiss?"Swiss":nf.kind[0].toUpperCase()+nf.kind.slice(1);
  const stageStr=`${kindLabel} · Bo${bo}`;

  // Bubble stakes detection
  const adv=t.swiss?._advanceAt||3, eli=t.swiss?._elimAt||3;
  const myAdv=myRec&&myRec.w>=adv-1, myEli=myRec&&myRec.l>=eli-1;
  const oppAdv=oppRec&&oppRec.w>=adv-1, oppEli=oppRec&&oppRec.l>=eli-1;
  const isDecider=myAdv&&myEli&&oppAdv&&oppEli;
  const isElimination=(myEli||oppEli)&&!isDecider;
  const isAdvancement=(myAdv||oppAdv)&&!isElimination&&!isDecider;
  const stakes=isSwiss&&myRec?(isDecider?"Decider":isElimination?"Elimination match":isAdvancement?"Advancement match":null):null;
  const stakesColor=isDecider?C.gold:isElimination?C.red:C.live;
  const teamMeta=(team,fallbackChem)=>`Seed #${SEED[team]||"?"} · Chemistry ${t.simState.chemistry[team]||fallbackChem}`;

  return(
  <div style={{background:`linear-gradient(135deg,${C.panel2},${C.panel})`,border:`2px solid ${rival?C.rival:stakes?stakesColor:C.acc}`,borderRadius:10,padding:"16px 20px",marginBottom:12}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
      <span style={{width:7,height:7,borderRadius:7,background:C.acc,animation:"pulse 1.4s infinite"}}/>
      <span style={{fontFamily:sans,fontSize:11.5,fontWeight:800,color:C.acc,letterSpacing:.3}}>Up next · {stageStr}</span>
      {rival&&<Tag c={C.rival}>Rivalry</Tag>}
      {stakes&&<Tag c={stakesColor}>{stakes}</Tag>}
      {isSwiss&&myRec&&<span style={{fontSize:11,color:C.faint,marginLeft:"auto"}}>Group records: <span style={{fontFamily:mono,color:C.dim}}>{myRec.w}–{myRec.l}</span> vs <span style={{fontFamily:mono,color:C.dim}}>{oppRec?.w||0}–{oppRec?.l||0}</span></span>}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:16,alignItems:"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <TeamCrest name={myTeam} size={34}/>
        <div>
          <div style={{fontWeight:800,fontSize:18,color:C.acc}}>{myTeam}</div>
          <div style={{fontSize:11,color:C.faint,marginTop:2}}>{teamMeta(myTeam,55)}</div>
        </div>
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:mono,fontSize:22,color:C.faint,fontWeight:700}}>VS</div>
        <div style={{fontSize:10,color:C.faint}}>Bo{bo}</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"flex-end"}}>
        <div style={{textAlign:"right"}}>
          <div style={{fontWeight:700,fontSize:18}}>{opp}</div>
          <div style={{fontSize:11,color:C.faint,marginTop:2}}>{teamMeta(opp,70)}</div>
        </div>
        <TeamCrest name={opp} size={34}/>
      </div>
    </div>
    <MatchPrediction t={t} myTeam={myTeam} opp={opp} bo={bo}/>
    <button onClick={()=>onPlay(nf.fx,bo)} style={{width:"100%",marginTop:14,background:`linear-gradient(100deg,${C.accDeep},${C.acc})`,color:"#fff",border:"none",borderRadius:8,padding:"12px",fontWeight:800,fontSize:15,letterSpacing:.3,boxShadow:`0 6px 18px -8px ${C.accDeep}aa`}}>
      {bo===1?"Pick map →":"Enter veto →"}
    </button>
  </div>);
}

// ── Pre-match prediction preview ─────────────────────────────────────
// Read-only analytical forecast — favourite, win probability, likely score
// and a per-map breakdown. Never touches sim state.
export function MatchPrediction({t,myTeam,opp,bo}){
  const [open,setOpen]=useState(false);
  const pred=predictMatch(t.simState,myTeam,opp,bo);
  const myP=Math.round(pred.winProbA*100), oppP=100-myP;
  const conf=pred.confidence>55?"strong call":pred.confidence>25?`lean ${pred.favorite}`:"coin-flip";
  return(
  <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.line}`}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
      <span style={{fontFamily:sans,fontSize:11,fontWeight:700,color:C.acc2}}>Win probability</span>
      <span style={{fontSize:11,color:C.faint,marginLeft:"auto"}}>Projected <span style={{fontFamily:mono,color:C.dim}}>{pred.likelyScore.join("–")}</span> · {conf}</span>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontFamily:mono,fontSize:14,fontWeight:700,color:C.acc,minWidth:36}}>{myP}%</span>
      <div style={{flex:1,height:10,borderRadius:5,overflow:"hidden",display:"flex",background:C.panel2}}>
        <div style={{width:myP+"%",background:C.acc,transition:"width .3s ease"}}/>
        <div style={{flex:1,background:C.red+"aa"}}/>
      </div>
      <span style={{fontFamily:mono,fontSize:14,fontWeight:700,color:C.red,minWidth:36,textAlign:"right"}}>{oppP}%</span>
    </div>
    {pred.edges.length>0&&<div style={{fontSize:11.5,color:C.dim,marginTop:8,lineHeight:1.5}}>{pred.edges.join(" · ")}</div>}
    <button onClick={()=>setOpen(o=>!o)} style={{background:"transparent",border:"none",color:C.acc,fontFamily:sans,fontSize:11.5,fontWeight:600,padding:"8px 0 0",cursor:"pointer"}}>
      {open?"▾ Hide map-by-map projection":"▸ Show map-by-map projection"}
    </button>
    {open&&<div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
      {pred.mapBreakdown.map(m=>{const mp=Math.round(m.winProbA*100);return(
        <div key={m.map} style={{flex:"1 1 64px",background:C.panel2,border:`1px solid ${C.line}`,borderRadius:6,padding:"7px 6px",textAlign:"center"}}>
          <div style={{fontSize:10,fontWeight:600,color:C.faint,whiteSpace:"nowrap"}}>{m.map}</div>
          <div style={{fontFamily:mono,fontSize:14,fontWeight:700,color:mp>=55?C.win:mp>=45?C.gold:C.red}}>{mp}%</div>
          <div title={`Map rating: ${m.ratingA} vs ${m.ratingB}`} style={{fontFamily:mono,fontSize:8.5,color:C.faint}}>{m.ratingA} v {m.ratingB}</div>
        </div>);})}
    </div>}
  </div>);
}

export function SwissResults({t,myTeam,onOpen,SEED}){
  const swiss=t.swiss;if(!swiss)return null;
  const allMatches=swiss.rounds.flatMap((rd,ri)=>rd.fixtures.map(f=>({...f,roundIdx:ri})));
  if(!allMatches.length)return <Empty text="No matches played yet."/>;
  const adv=swiss._advanceAt||3, eli=swiss._elimAt||3;

  function fixtureBubble(fx){
    const ra=swiss.records[fx.a], rb=swiss.records[fx.b];
    if(!ra||!rb) return null;
    const aAdv=ra.w>=adv-1, aEli=ra.l>=eli-1;
    const bAdv=rb.w>=adv-1, bEli=rb.l>=eli-1;
    if(aAdv&&aEli&&bAdv&&bEli) return {label:"Decider",color:C.gold};
    if(aEli||bEli) return {label:"Elimination",color:C.red};
    if(aAdv||bAdv) return {label:"Advancement",color:C.live};
    return null;
  }

  function upsetBadge(fx){
    if(!fx.done||!SEED) return null;
    const ws=SEED[fx.res.winnerName]??99, ls=SEED[fx.res.loserName]??1;
    if(ws>=ls+4) return true;
    return false;
  }

  return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
    {swiss.rounds.map((rd,ri)=>{
      const done=rd.fixtures.every(f=>f.done);
      return(<div key={ri}>
        <div style={{fontFamily:sans,fontSize:11.5,fontWeight:700,color:C.dim,marginBottom:6}}>Round {ri+1}{!done&&<span style={{color:C.acc}}> · in progress</span>}</div>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {rd.fixtures.map((fx,fi)=>{
            const isMe=fx.a===myTeam||fx.b===myTeam;
            const myTeamIsA=fx.a===myTeam;
            const bubble=fixtureBubble(fx);
            if(!fx.done)return(
              <div key={fi} style={{background:isMe?C.acc+"22":C.panel,border:`1px solid ${isMe?C.acc:bubble?bubble.color+"55":C.line}`,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontFamily:mono,fontSize:10,color:C.faint,width:28}}>Bo{fx.bo}</span>
                <span style={{flex:1,fontWeight:isMe?700:500,color:isMe?C.acc:C.ink}}>{fx.a}</span>
                <span style={{fontFamily:mono,fontSize:10,color:C.faint}}>vs</span>
                <span style={{flex:1,textAlign:"right",fontWeight:isMe?700:500,color:isMe?C.acc:C.ink}}>{fx.b}</span>
                {bubble&&<Tag c={bubble.color}>{bubble.label}</Tag>}
                {isMe&&!bubble&&<Tag c={C.acc}>Your match</Tag>}
              </div>
            );
            const wA=fx.res.winnerName===fx.a;
            const upset=upsetBadge(fx);
            return(
            <button key={fi} onClick={()=>onOpen({...fx.res,title:`Swiss R${ri+1} · Bo${fx.bo}`,a:fx.a,b:fx.b})}
              style={{background:isMe?(wA===myTeamIsA?C.win+"0f":C.red+"0f"):C.panel,border:`1px solid ${isMe?(wA===myTeamIsA?C.win+"44":C.red+"44"):C.line}`,borderRadius:8,padding:"10px 14px",textAlign:"left",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontFamily:mono,fontSize:9,color:C.faint,width:28}}>Bo{fx.bo}</span>
              <span style={{flex:1,fontWeight:700,color:wA?C.win:C.dim}}>{fx.a}</span>
              <span style={{fontFamily:mono,fontWeight:700,fontSize:13,color:C.ink}}>{fx.res.bo>=3?fx.res.seriesScore.join("–"):fx.res.scoreLine}</span>
              <span style={{flex:1,textAlign:"right",fontWeight:700,color:!wA?C.win:C.dim}}>{fx.b}</span>
              {upset&&<Tag c={C.gold}>Upset</Tag>}
              {isMe&&<span style={{fontFamily:mono,fontSize:9,color:wA===myTeamIsA?C.win:C.red,fontWeight:700,width:28}}>{wA===myTeamIsA?"W":"L"}</span>}
            </button>);
          })}
        </div>
      </div>);
    })}
    {t.stage==="playoffs"&&t.bracket&&<div style={{marginTop:8}}>
      <div style={{fontFamily:sans,fontSize:11.5,fontWeight:700,color:C.gold,marginBottom:6}}>Playoffs</div>
      <PlayoffMatchList bracket={t.bracket} myTeam={myTeam} onOpen={onOpen} SEED={SEED}/>
    </div>}
  </div>);
}

export function PlayoffMatchList({bracket,myTeam,onOpen}){
  const rows=[];
  const rndNames={qf:"Quarterfinal",sf:"Semifinal",final:"Final"};
  const rounds=bracket.qf?["qf","sf","final"]:bracket.sf?["sf","final"]:["final"];
  for(const r of rounds){
    const list=r==="final"?[bracket.final]:bracket[r];
    list.forEach(fx=>{if(!fx.res)return;const isMe=fx.a===myTeam||fx.b===myTeam;const wA=fx.res.winnerName===fx.a;
      rows.push(<button key={r+fx.a} onClick={()=>onOpen({...fx.res,title:`${rndNames[r]} · Bo${fx.res.bo}`,a:fx.a,b:fx.b})}
        style={{background:isMe?(wA===(fx.a===myTeam)?C.win+"0f":C.red+"0f"):C.panel,border:`1px solid ${isMe?(wA===(fx.a===myTeam)?C.win+"44":C.red+"44"):C.line}`,borderRadius:8,padding:"10px 14px",textAlign:"left",display:"flex",alignItems:"center",gap:10,width:"100%"}}>
        <span style={{fontFamily:mono,fontSize:9,color:C.gold,width:60}}>{rndNames[r].toUpperCase()}</span>
        <span style={{flex:1,fontWeight:700,color:wA?C.win:C.dim}}>{fx.a}</span>
        <span style={{fontFamily:mono,fontWeight:700,fontSize:13}}>{fx.res.seriesScore?.join("–")||fx.res.scoreLine}</span>
        <span style={{flex:1,textAlign:"right",fontWeight:700,color:!wA?C.win:C.dim}}>{fx.b}</span>
      </button>);
    });
  }
  return <div style={{display:"flex",flexDirection:"column",gap:4}}>{rows}</div>;
}

export function SwissStandings({t,myTeam,SEED}){
  const swiss=t.swiss;if(!swiss)return null;
  const adv=swiss._advanceAt||3,eli=swiss._elimAt||3;
  const teams=[...swiss.teams].sort((a,b)=>{
    const ra=swiss.records[a],rb=swiss.records[b];
    return (rb.w-ra.w)||(ra.l-rb.l);
  });
  const statusOf=team=>{
    const r=swiss.records[team];
    if(r.w>=adv)return "advanced";
    if(r.l>=eli)return "eliminated";
    if(r.w>=adv-1)return "match_adv"; // one win away from advancing
    if(r.l>=eli-1)return "match_eli"; // one loss from elimination
    return "active";
  };
  const statusColor={advanced:C.win,eliminated:C.red,match_adv:C.live,match_eli:C.gold,active:C.dim};
  const statusLabel={advanced:"ADVANCED",eliminated:"ELIMINATED",match_adv:"ADV MATCH",match_eli:"ELI MATCH",active:""};
  const maxRounds=adv+eli-1;
  function WLSquares({w,l}){
    return(
      <div style={{display:"flex",gap:2,alignItems:"center",justifyContent:"center"}}>
        {Array.from({length:w},(_,j)=><div key={"w"+j} style={{width:9,height:9,borderRadius:2,background:C.win}}/>)}
        {Array.from({length:l},(_,j)=><div key={"l"+j} style={{width:9,height:9,borderRadius:2,background:C.red}}/>)}
        {Array.from({length:Math.max(0,maxRounds-w-l)},(_,j)=><div key={"p"+j} style={{width:9,height:9,borderRadius:2,background:C.panel2,border:`1px solid ${C.line}`}}/>)}
      </div>
    );
  }
  return(<div>
    <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"28px 1fr auto 90px",gap:6,padding:"8px 14px",fontFamily:sans,fontSize:10.5,fontWeight:700,color:C.faint,letterSpacing:.7}}>
        <span>#</span><span>TEAM</span><span style={{textAlign:"center"}}>RECORD</span><span style={{textAlign:"right"}}>STATUS</span>
      </div>
      {teams.map((team,i)=>{
        const r=swiss.records[team];const me=team===myTeam;const st=statusOf(team);const sc=statusColor[st];
        return(
        <div key={team} style={{display:"grid",gridTemplateColumns:"28px 1fr auto 90px",gap:6,padding:"9px 14px",alignItems:"center",borderTop:`1px solid ${C.line}`,borderLeft:`3px solid ${me?C.acc:st!=="active"?sc:"transparent"}`,background:me?C.acc+"0f":st==="advanced"?C.win+"0a":st==="eliminated"?C.red+"0a":"transparent"}}>
          <span style={{fontFamily:mono,fontSize:12,color:C.faint}}>{i+1}</span>
          <span style={{display:"flex",alignItems:"center",gap:7,fontWeight:me?700:600,fontSize:13,color:me?C.acc:C.ink}}><TeamCrest name={team} size={22}/>{team}</span>
          <WLSquares w={r.w} l={r.l}/>
          <span style={{fontFamily:mono,fontSize:9,textAlign:"right",color:sc||C.faint}}>{statusLabel[st]||`${r.w}–${r.l}`}</span>
        </div>);
      })}
    </div>
    {/* Legend */}
    <div style={{display:"flex",gap:16,marginTop:10,fontFamily:mono,fontSize:9,flexWrap:"wrap",color:C.faint}}>
      {[[C.win,`ADVANCED (${adv}W)`],[C.live,"ADV MATCH"],[C.gold,"ELI MATCH"],[C.red,`ELIMINATED (${eli}L)`]].map(([c,l])=>(
        <span key={l} style={{display:"inline-flex",alignItems:"center",gap:6}}><span style={{width:8,height:8,borderRadius:2,background:c}}/>{l}</span>
      ))}
    </div>
  </div>);
}

export function PlayoffBracket({bracket,champion,myTeam,onOpen,SEED}){
  const rounds=bracket.qf?["qf","sf","final"]:bracket.sf?["sf","final"]:["final"];
  const roundNames={qf:"QUARTERFINALS",sf:"SEMIFINALS",final:"GRAND FINAL"};
  return(<div>
    <div style={{overflowX:"auto",paddingBottom:10}}>
      <div style={{display:"flex",gap:24,minWidth:bracket.qf?860:500,padding:"8px 4px"}}>
        {rounds.map(r=>{
          const list=r==="final"?[bracket.final]:bracket[r];
          const isFinale=r==="final";
          return(
          <div key={r} style={{flex:1,minWidth:220}}>
            <div style={{fontFamily:mono,fontSize:10,color:r==="final"?C.gold:C.acc,letterSpacing:1.5,fontWeight:700,marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${C.line}`}}>
              {roundNames[r]} {isFinale&&bracket.bo5Final?"· BO5":"· BO3"}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {list.map((fx,i)=>{
                const me=fx.a===myTeam||fx.b===myTeam;
                const A=fx.a,B=fx.b,done=fx.done,res=fx.res;
                const BracketTeam=({team,side})=>{
                  const won=done&&res?.winnerName===team;
                  const lost=done&&res?.loserName===team;
                  const sc=done?res.seriesScore[side]:null;
                  return(<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:won?C.win+"0f":"transparent",borderRadius:4,opacity:lost?0.6:1}}>
                    {SEED&&team&&<span style={{fontFamily:mono,fontSize:9,color:C.faint,width:16}}>{SEED[team]||"?"}</span>}
                    {team&&<TeamCrest name={team} size={20}/>}
                    <span style={{flex:1,fontWeight:won?700:500,fontSize:13,color:!team?C.faint:team===myTeam?C.acc:won?C.ink:C.dim}}>{team||"TBD"}</span>
                    {sc!=null&&<span style={{fontFamily:mono,fontWeight:700,fontSize:14,color:won?C.win:C.faint}}>{sc}</span>}
                  </div>);
                };
                return(
                <button key={i} onClick={()=>done&&onOpen({...res,title:`${roundNames[r]} · Bo${res?.bo}`,a:A,b:B})} disabled={!done}
                  style={{background:C.panel,border:`2px solid ${isFinale&&champion?C.gold:me?C.acc:C.line}`,borderRadius:8,overflow:"hidden",padding:0,textAlign:"left",width:"100%"}}>
                  <BracketTeam team={A} side={0}/>
                  <div style={{height:1,background:C.line}}/>
                  <BracketTeam team={B} side={1}/>
                  {isFinale&&champion&&<div style={{padding:"6px 12px",background:C.gold+"14",fontFamily:mono,fontSize:9,color:C.gold,textAlign:"center"}}>{champion}</div>}
                </button>);
              })}
            </div>
          </div>);
        })}
      </div>
    </div>
  </div>);
}

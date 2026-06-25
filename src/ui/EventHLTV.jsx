import React, { useState } from 'react';
import { C, sans, mono } from './theme.js';
import { weekToLabel } from '../constants/events.js';
import { isRivalMatch } from '../engine/state.js';
import { SL, Locked, Empty } from './primitives.jsx';

export function EventHLTV({t,myTeam,nf,onPlay,alive,onOpen,onEndEvent,season,SEED,evLabel,tierTag,tab,setTab}){
  const [evTab,setEvTab]=useState("results");
  const tierC=tierTag==="Major"?C.gold:tierTag==="A"?C.live:C.dim;
  const location=season?.currentEvent?.location||"";

  return(<div style={{fontFamily:sans}}>
    {/* HLTV-style event header */}
    <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,padding:"16px 20px",marginBottom:12}}>
      <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div style={{background:tierC+"22",border:`1px solid ${tierC}`,borderRadius:6,padding:"3px 10px",fontFamily:mono,fontSize:10,color:tierC,fontWeight:700}}>{tierTag.toUpperCase()}</div>
        <div>
          <div style={{fontWeight:800,fontSize:20}}>{evLabel}</div>
          <div style={{fontFamily:mono,fontSize:11,color:C.dim,marginTop:2}}>{location} · {weekToLabel(season?.week||1,season?.year)} ${season?.year||2026} · {t.teams?.length||t.participants?.length||16} Teams</div>
        </div>
        {t.stage==="done"&&t.champion&&(
          <div style={{marginLeft:"auto",textAlign:"right"}}>
            <div style={{fontFamily:mono,fontSize:9,color:C.gold}}>CHAMPION</div>
            <div style={{fontWeight:800,fontSize:16,color:C.gold}}>[W] {t.champion}</div>
          </div>
        )}
      </div>
    </div>

    {/* Action banner */}
    {t.stage==="done"?(
      <div style={{background:t.champion===myTeam?"linear-gradient(135deg,#2a2310,#1a1f29)":C.panel,border:`1px solid ${t.champion===myTeam?C.gold:C.line}`,borderRadius:10,padding:"14px 18px",marginBottom:12,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        {t.champion===myTeam?<span style={{color:C.gold,fontWeight:800,fontSize:18}}>[W] {myTeam} WIN {evLabel.toUpperCase()}!</span>:<span style={{color:C.dim,fontSize:15}}>{myTeam} finish {alive?"top":"eliminated"}.</span>}
        {onEndEvent&&<button onClick={onEndEvent} style={{marginLeft:"auto",background:t.champion===myTeam?C.gold:C.acc,color:"#0a0c10",border:"none",borderRadius:8,padding:"10px 20px",fontWeight:800,fontSize:14}}>BACK TO CALENDAR →</button>}
      </div>
    ):!alive?(
      <div style={{background:C.panel,border:`1px solid ${C.red}40`,borderRadius:10,padding:"14px 18px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
        <span style={{color:C.red,fontWeight:700}}>[X] {myTeam} eliminated</span>
        {onEndEvent&&<button onClick={onEndEvent} style={{marginLeft:"auto",background:C.panel2,color:C.acc,border:`1px solid ${C.acc}`,borderRadius:8,padding:"8px 16px",fontWeight:700,fontSize:13}}>BACK TO CALENDAR →</button>}
      </div>
    ):nf?(
      <NextMatchHLTV nf={nf} myTeam={myTeam} onPlay={onPlay} t={t} SEED={SEED}/>
    ):null}

    {/* Stage tabs */}
    <div style={{display:"flex",gap:1,marginBottom:12,background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,overflow:"hidden"}}>
      {["results","standings","bracket"].map(tb=>(
        <button key={tb} onClick={()=>setEvTab(tb)}
          style={{flex:1,background:evTab===tb?C.acc:"transparent",color:evTab===tb?"#0a0c10":C.dim,border:"none",padding:"9px 0",fontFamily:mono,fontSize:11,fontWeight:700,letterSpacing:1}}>
          {tb.toUpperCase()}
        </button>
      ))}
    </div>

    {evTab==="results"&&<SwissResults t={t} myTeam={myTeam} onOpen={onOpen}/>}
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
  const stageStr=isSwiss?`SWISS — Bo${bo}`:`${nf.kind.toUpperCase()} — Bo${bo}`;
  return(
  <div style={{background:`linear-gradient(135deg,#13171f,#1a1f29)`,border:`2px solid ${rival?C.rival:C.acc}`,borderRadius:10,padding:"16px 20px",marginBottom:12}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
      <span style={{width:7,height:7,borderRadius:7,background:C.acc,animation:"pulse 1.4s infinite"}}/>
      <span style={{fontFamily:mono,fontSize:10,color:C.acc,letterSpacing:1.5}}>▸ UP NEXT · {stageStr}</span>
      {rival&&<span style={{fontFamily:mono,fontSize:9,color:C.rival,border:`1px solid ${C.rival}`,borderRadius:4,padding:"2px 6px"}}>[!] RIVALRY</span>}
      {isSwiss&&myRec&&<span style={{fontFamily:mono,fontSize:10,color:C.faint,marginLeft:"auto"}}>{myRec.w}-{myRec.l} vs {oppRec?.w||0}-{oppRec?.l||0}</span>}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:16,alignItems:"center"}}>
      <div>
        <div style={{fontWeight:800,fontSize:18,color:C.acc}}>{myTeam}</div>
        <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginTop:2}}>#{SEED[myTeam]||"?"} seed · chem {t.simState.chemistry[myTeam]||55}</div>
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:mono,fontSize:22,color:C.faint,fontWeight:700}}>VS</div>
        <div style={{fontFamily:mono,fontSize:9,color:C.faint}}>Bo{bo}</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontWeight:700,fontSize:18}}>{opp}</div>
        <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginTop:2}}>#{SEED[opp]||"?"} seed · chem {t.simState.chemistry[opp]||70}</div>
      </div>
    </div>
    <button onClick={()=>onPlay(nf.fx,bo)} style={{width:"100%",marginTop:14,background:C.acc,color:"#0a0c10",border:"none",borderRadius:8,padding:"12px",fontWeight:800,fontSize:15,letterSpacing:.5}}>
      {bo===1?"PICK MAP →":"ENTER VETO →"}
    </button>
  </div>);
}

export function SwissResults({t,myTeam,onOpen}){
  const swiss=t.swiss;if(!swiss)return null;
  const allMatches=swiss.rounds.flatMap((rd,ri)=>rd.fixtures.map(f=>({...f,roundIdx:ri})));
  if(!allMatches.length)return <Empty text="No matches played yet."/>;
  return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
    {swiss.rounds.map((rd,ri)=>{
      const done=rd.fixtures.every(f=>f.done);
      return(<div key={ri}>
        <div style={{fontFamily:mono,fontSize:10,color:C.faint,letterSpacing:1.5,marginBottom:6}}>ROUND {ri+1} {!done&&"(IN PROGRESS)"}</div>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {rd.fixtures.map((fx,fi)=>{
            const isMe=fx.a===myTeam||fx.b===myTeam;
            const myTeamIsA=fx.a===myTeam;
            if(!fx.done)return(
              <div key={fi} style={{background:isMe?C.acc+"22":C.panel,border:`1px solid ${isMe?C.acc:C.line}`,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontFamily:mono,fontSize:10,color:C.faint,width:28}}>Bo{fx.bo}</span>
                <span style={{flex:1,fontWeight:isMe?700:500,color:isMe?C.acc:C.ink}}>{fx.a}</span>
                <span style={{fontFamily:mono,fontSize:10,color:C.faint}}>vs</span>
                <span style={{flex:1,textAlign:"right",fontWeight:isMe?700:500,color:isMe?C.acc:C.ink}}>{fx.b}</span>
                {isMe&&<span style={{fontFamily:mono,fontSize:9,color:C.acc,border:`1px solid ${C.acc}`,borderRadius:4,padding:"2px 6px"}}>YOUR MATCH</span>}
              </div>
            );
            const wA=fx.res.winnerName===fx.a;
            return(
            <button key={fi} onClick={()=>onOpen({...fx.res,title:`Swiss R${ri+1} · Bo${fx.bo}`,a:fx.a,b:fx.b})}
              style={{background:isMe?(wA===myTeamIsA?"rgba(61,220,132,.06)":"rgba(255,76,76,.06)"):C.panel,border:`1px solid ${isMe?(wA===myTeamIsA?C.win+"44":C.red+"44"):C.line}`,borderRadius:8,padding:"10px 14px",textAlign:"left",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontFamily:mono,fontSize:9,color:C.faint,width:28}}>Bo{fx.bo}</span>
              <span style={{flex:1,fontWeight:700,color:wA?C.win:C.dim}}>{fx.a}</span>
              <span style={{fontFamily:mono,fontWeight:700,fontSize:13,color:C.ink}}>{fx.res.bo>=3?fx.res.seriesScore.join("–"):fx.res.scoreLine}</span>
              <span style={{flex:1,textAlign:"right",fontWeight:700,color:!wA?C.win:C.dim}}>{fx.b}</span>
              {isMe&&<span style={{fontFamily:mono,fontSize:9,color:wA===myTeamIsA?C.win:C.red,fontWeight:700,width:28}}>{wA===myTeamIsA?"W":"L"}</span>}
            </button>);
          })}
        </div>
      </div>);
    })}
    {t.stage==="playoffs"&&t.bracket&&<div style={{marginTop:8}}>
      <div style={{fontFamily:mono,fontSize:10,color:C.gold,letterSpacing:1.5,marginBottom:6}}>PLAYOFFS</div>
      <PlayoffMatchList bracket={t.bracket} myTeam={myTeam} onOpen={onOpen}/>
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
        style={{background:isMe?(wA===(fx.a===myTeam)?"rgba(61,220,132,.06)":"rgba(255,76,76,.06)"):C.panel,border:`1px solid ${isMe?(wA===(fx.a===myTeam)?C.win+"44":C.red+"44"):C.line}`,borderRadius:8,padding:"10px 14px",textAlign:"left",display:"flex",alignItems:"center",gap:10,width:"100%"}}>
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
  return(<div>
    <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"28px 1fr 60px 40px 40px 90px",gap:6,padding:"8px 14px",fontFamily:mono,fontSize:10,color:C.faint,letterSpacing:1}}>
        <span>#</span><span>TEAM</span><span style={{textAlign:"center"}}>W–L</span><span style={{textAlign:"center"}}>W</span><span style={{textAlign:"center"}}>L</span><span style={{textAlign:"right"}}>STATUS</span>
      </div>
      {teams.map((team,i)=>{
        const r=swiss.records[team];const me=team===myTeam;const st=statusOf(team);const sc=statusColor[st];
        return(
        <div key={team} style={{display:"grid",gridTemplateColumns:"28px 1fr 60px 40px 40px 90px",gap:6,padding:"9px 14px",alignItems:"center",borderTop:`1px solid ${C.line}`,borderLeft:`3px solid ${me?C.acc:st!=="active"?sc:"transparent"}`,background:me?"rgba(255,92,46,.06)":st==="advanced"?"rgba(61,220,132,.04)":st==="eliminated"?"rgba(255,76,76,.04)":"transparent"}}>
          <span style={{fontFamily:mono,fontSize:12,color:C.faint}}>{i+1}</span>
          <span style={{fontWeight:me?700:600,fontSize:13,color:me?C.acc:C.ink}}>{team}{me?" ◂":""}</span>
          <span style={{fontFamily:mono,fontWeight:700,fontSize:14,textAlign:"center",color:sc||C.ink}}>{r.w}–{r.l}</span>
          <span style={{fontFamily:mono,fontSize:12,textAlign:"center",color:C.win}}>{r.w}</span>
          <span style={{fontFamily:mono,fontSize:12,textAlign:"center",color:C.red}}>{r.l}</span>
          <span style={{fontFamily:mono,fontSize:9,textAlign:"right",color:sc||C.faint}}>{statusLabel[st]}</span>
        </div>);
      })}
    </div>
    {/* Legend */}
    <div style={{display:"flex",gap:14,marginTop:8,fontFamily:mono,fontSize:9,flexWrap:"wrap"}}>
      <span style={{color:C.win}}>● ADVANCED ({adv}W)</span>
      <span style={{color:C.live}}>● ADV MATCH</span>
      <span style={{color:C.gold}}>● ELI MATCH</span>
      <span style={{color:C.red}}>● ELIMINATED ({eli}L)</span>
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
                  return(<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:won?"rgba(61,220,132,.06)":"transparent",borderRadius:4}}>
                    {SEED&&team&&<span style={{fontFamily:mono,fontSize:9,color:C.faint,width:16}}>{SEED[team]||"?"}</span>}
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
                  {isFinale&&champion&&<div style={{padding:"6px 12px",background:"rgba(255,194,75,.08)",fontFamily:mono,fontSize:9,color:C.gold,textAlign:"center"}}>[W] {champion}</div>}
                </button>);
              })}
            </div>
          </div>);
        })}
      </div>
    </div>
  </div>);
}

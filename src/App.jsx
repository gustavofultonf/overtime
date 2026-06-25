import React, { useState, useCallback } from "react";

// Constants
import { MAPS, AI_TEAMS } from './constants/data.js';
import { EVENTS, SEASON_WEEKS, SALARY_WEEKS, ACTIVITIES, COACHES, FACILITIES,
         CHOICE_EVENTS, isSalaryWeek, weekToLabel, weekToMonth } from './constants/events.js';

// Engine
import { playerOvr, draftCost, marketValue, getTeamOrder, getSeed,
         getRankedTeams, updateRankings, aiRosterMoves } from './engine/player.js';
import { initState, rosterOf, freeAgents, teamBase, profileFor,
         getMapProf, isRivalMatch, updateMorale, hierarchyTier } from './engine/state.js';
import { playSeries, applyActivity, rollRandomEvent } from './engine/match.js';
import { generateProspect, developProspect, autoSimWeeks, aiWeekActivity,
         snapshotEventStats } from './engine/activity.js';
import { swissRound, swissRoundMini, swissDone, nextSwissFix, resolveSwissFix,
         seedPlayoff, resolvePlayoffAI, nextPlayoffFix, newTournament, newMiniTournament,
         placementOf, prizeMoney, miniPlacement, miniPrizeMoney,
         decayFormBetweenEvents, tickContracts, bracketElim } from './engine/tournament.js';

// UI
import { C, sans, mono } from './ui/theme.js';
import { Gstyle } from './ui/Gstyle.jsx';
import { Header, Tabs } from './ui/Header.jsx';
import { MiniStat, SL } from './ui/primitives.jsx';
import { DraftScreen } from './ui/DraftScreen.jsx';
import { CalendarView } from './ui/CalendarView.jsx';
import { EventHLTV } from './ui/EventHLTV.jsx';
import { RosterView2 } from './ui/RosterView.jsx';
import { TransferMarket } from './ui/TransferMarket.jsx';
import { SeasonHistory } from './ui/SeasonHistory.jsx';
import { MapProfView } from './ui/MapProfView.jsx';
import { FacilitiesView } from './ui/FacilitiesView.jsx';
import { RankingsView } from './ui/RankingsView.jsx';
import { RivalryView } from './ui/RivalryView.jsx';
import { VetoOverlay } from './ui/VetoOverlay.jsx';
import { MatchModal } from './ui/MatchModal.jsx';
import { MatchReveal } from './ui/MatchReveal.jsx';
import { EventDebrief } from './ui/EventDebrief.jsx';
import { DynamicsView } from './ui/DynamicsView.jsx';

export default function App(){
  const [phase,setPhase]=useState("loading"); // loading | saves | draft | season
  const [myTeam,setMyTeam]=useState(null);
  const [season,setSeason]=useState(null);
  const [t,setT]=useState(null);
  const [tab,setTab]=useState("hub");
  const [openMatch,setOpenMatch]=useState(null);
  const [veto,setVeto]=useState(null);
  const [reveal,setReveal]=useState(null);
  const [saves,setSaves]=useState([null,null,null,null]); // [auto, slot1, slot2, slot3]
  const [,force]=useState(0);
  const redraw=useCallback(()=>force(n=>n+1),[]);

  // ── Save/Load System ──────────────────────────────────────────────
  const SAVE_KEY="overtime-saves";

  async function loadSaves(){
    try{
      const result=await window.storage.get(SAVE_KEY);
      if(result&&result.value){
        const parsed=JSON.parse(result.value);
        setSaves(parsed);
        return parsed;
      }
    }catch(e){console.log("No saves found");}
    return [null,null,null,null];
  }

  async function writeSaves(newSaves){
    try{
      await window.storage.set(SAVE_KEY,JSON.stringify(newSaves));
      setSaves(newSaves);
    }catch(e){console.error("Save failed:",e);}
  }

  function buildSaveData(){
    if(!season||!myTeam)return null;
    return {
      myTeam,
      season:{...season,simState:undefined}, // simState saved separately
      simState:season.simState,
      // Tournament state NOT saved — too complex. Auto-save happens between events.
      savedAt:new Date().toISOString(),
      summary:{
        week:season.week,
        date:weekToLabel(season.week,season.year),year:season.year||2026,
        budget:season.budget,
        roster:rosterOf(season.simState,myTeam).map(p=>p.name),
        rank:(()=>{const r=getRankedTeams(season.simState,myTeam);return r.findIndex(x=>x.team===myTeam)+1;})(),
        events:season.history.length,
      }
    };
  }

  async function autoSave(){
    const data=buildSaveData();
    if(!data)return;
    const cur=[...saves];
    cur[0]=data;
    await writeSaves(cur);
  }

  async function saveToSlot(slot){
    const data=buildSaveData();
    if(!data)return;
    const cur=[...saves];
    cur[slot]=data;
    await writeSaves(cur);
  }

  function loadFromSave(save){
    if(!save)return;
    const s={...save.season,simState:save.simState};
    setMyTeam(save.myTeam);
    setSeason(s);
    setT(null);
    setPhase("season");
    setTab("calendar");
  }

  async function deleteSave(slot){
    const cur=[...saves];
    cur[slot]=null;
    await writeSaves(cur);
  }

  // Load saves on mount
  React.useEffect(()=>{
    loadSaves().then(s=>{
      const hasSave=s.some(x=>x!==null);
      setPhase(hasSave?"saves":"draft");
    });
  },[]);

  function onDraftComplete(teamName,simState,remaining){
    setMyTeam(teamName);
    simState.chemistry[teamName]=55;
    if(!simState.mapProf[teamName]) simState.mapProf[teamName]=profileFor(teamName);
    simState.rankings[teamName]=200;
    const s={simState,budget:remaining,eventNum:1,week:1,year:2026,history:[],weekLog:[],phase:"calendar",facilities:{},yearHistory:[],pendingEvent:null,pendingDebrief:null,pendingContracts:[]};
    setSeason(s);setPhase("season");setTab("calendar");
    // Auto-save after draft
    setTimeout(()=>{const data=buildSaveData();if(data){const cur=[...saves];cur[0]={...data,season:s,simState};writeSaves(cur);}},100);
  }

  function nextUserFx(){
    if(!t) return null;
    // Swiss stage
    if(t.stage==="swiss"&&t.swiss){
      const fx=nextSwissFix(t.swiss);
      if(fx) return {kind:"swiss",fx,bo:fx.bo};
      // Check if swiss is done — need to seed bracket
      const adv=t.swiss._advanceAt||3,eli=t.swiss._elimAt||3;
      const allDone=t.swiss.teams.every(tm=>t.swiss.records[tm].w>=adv||t.swiss.records[tm].l>=eli);
      if(allDone&&!t.bracket) return null; // trigger seedBracket
    }
    // Playoff stage
    if(t.bracket){
      const nf=nextPlayoffFix(t.bracket,myTeam);
      if(nf) return {kind:nf.round,fx:nf.fx,bo:nf.round==="final"?(t.bracket.bo5Final?5:t.bracket.bo3||3):t.bracket.bo3||3};
    }
    return null;
  }

  function beginVeto(fx,bo){
    const opp=fx.a===myTeam?fx.b:fx.a;
    setVeto({fixture:fx,bo:bo||fx.bo||1,remaining:[...MAPS],picked:[],log:[],opp});
  }

  function afterResult(){
    if(!t) return;
    if(t.stage==="swiss"&&t.swiss){
      // Check if user was just eliminated
      const userEliminated=t.swiss.eliminated.includes(myTeam);
      if(userEliminated){
        // User is out — sim remaining Swiss rounds and playoffs without them
        const adv=t.swiss._advanceAt||3,eli=t.swiss._elimAt||3;
        let si=0;
        while(!t.swiss.teams.every(tm=>t.swiss.records[tm].w>=adv||t.swiss.records[tm].l>=eli)&&si<30){
          si++;if(t.isMajor)swissRound(t.swiss);else swissRoundMini(t.swiss);
        }
        // Seed and auto-sim playoffs
        const advancers=t.swiss.advanced.slice(0,t.advanceCount||8);
        t.bracket=seedPlayoff(advancers,3,t.isMajor);
        resolvePlayoffAI(t.bracket,null,t.simState,t.rng); // null myTeam = resolve all
        // Find all unresolved
        const allFx=[...(t.bracket.qf||[]),...(t.bracket.sf||[]),t.bracket.final].filter(Boolean);
        let pi=0;
        while(!t.bracket.final.done&&pi<20){pi++;allFx.forEach(fx=>{if(!fx.done&&fx.a&&fx.b){const bo=fx===t.bracket.final?(t.isMajor?5:3):3;fx.res=playSeries(t.simState,fx.a,fx.b,bo,{stage:"playoffs"},t.rng);fx.done=true;}});resolvePlayoffAI(t.bracket,null,t.simState,t.rng);}
        if(t.bracket.final.done)t.champion=t.bracket.final.res.winnerName;
        t.stage="done";
        setT({...t});redraw();
        return;
      }

      const allDone=t.swiss.teams.every(tm=>t.swiss.records[tm].w>=(t.swiss._advanceAt||3)||t.swiss.records[tm].l>=(t.swiss._elimAt||3));
      if(allDone){
        t.stage="playoffs";
        const advancers=t.swiss.advanced.slice(0,t.advanceCount||8);
        t.bracket=seedPlayoff(advancers,3,t.isMajor);
        resolvePlayoffAI(t.bracket,myTeam,t.simState,t.rng);
      } else {
        if(t.isMajor) swissRound(t.swiss);
        else swissRoundMini(t.swiss);
      }
    } else if(t.stage==="playoffs"&&t.bracket){
      // Check if user was just eliminated from playoffs
      const userElimInPlayoffs=bracketElim(t.bracket,myTeam);
      if(userElimInPlayoffs){
        // Sim remaining playoff matches
        let pi=0;
        while(!t.bracket.final.done&&pi<20){pi++;const allFx=[...(t.bracket.qf||[]),...(t.bracket.sf||[]),t.bracket.final].filter(Boolean);allFx.forEach(fx=>{if(!fx.done&&fx.a&&fx.b){const bo=fx===t.bracket.final?(t.isMajor?5:3):3;fx.res=playSeries(t.simState,fx.a,fx.b,bo,{stage:"playoffs"},t.rng);fx.done=true;}});resolvePlayoffAI(t.bracket,null,t.simState,t.rng);}
        if(t.bracket.final.done)t.champion=t.bracket.final.res.winnerName;
        t.stage="done";
        setT({...t});redraw();
        return;
      }
      resolvePlayoffAI(t.bracket,myTeam,t.simState,t.rng);
      if(t.bracket.final.done){
        t.champion=t.bracket.final.res.winnerName;
        t.stage="done";
      }
    }
    setT({...t});redraw();
  }

  function endEvent(){
    // Force-complete tournament if not done (user was eliminated)
    if(t.stage!=="done"){
      // Sim remaining Swiss
      if(t.swiss&&!swissDone(t.swiss)){
        let si=0;while(!swissDone(t.swiss)&&si<30){si++;if(t.isMajor)swissRound(t.swiss);else swissRoundMini(t.swiss);}
      }
      // Seed and sim playoffs if needed
      if(!t.bracket&&t.swiss?.advanced?.length>0){
        t.bracket=seedPlayoff(t.swiss.advanced.slice(0,t.advanceCount||8),3,t.isMajor);
      }
      if(t.bracket&&!t.bracket.final.done){
        let pi=0;while(!t.bracket.final.done&&pi<20){pi++;
          const allFx=[...(t.bracket.qf||[]),...(t.bracket.sf||[]),t.bracket.final].filter(Boolean);
          allFx.forEach(fx=>{if(!fx.done&&fx.a&&fx.b){const bo=fx===t.bracket.final?(t.isMajor?5:3):3;fx.res=playSeries(t.simState,fx.a,fx.b,bo,{stage:"playoffs"},t.rng);fx.done=true;}});
          resolvePlayoffAI(t.bracket,null,t.simState,t.rng);
        }
      }
      if(t.bracket?.final?.done)t.champion=t.bracket.final.res.winnerName;
      t.stage="done";
    }
    const ev=season.currentEvent||{tier:"Major"};
    const isMajor=t.isMajor;
    const place=isMajor?placementOf(t):miniPlacement(t);
    const prize=isMajor?prizeMoney(place):miniPrizeMoney(t,place);

    // Capture per-player event stats before snapshot + reset
    const roster=rosterOf(season.simState,myTeam);
    const chemBefore=season.simState.chemistry[myTeam]||70;
    const playerStats=roster.map(p=>{
      const s=season.simState.stats[p.name]||{};
      return{name:p.name,role:p.role,age:p.age,
        maps:s.maps||0,rating:+(s.rating||0).toFixed(3),
        mvps:s.mvps||0,clutches:s.clutches||0};
    });
    snapshotEventStats(season.simState,season.eventNum);
    season.simState.players.forEach(p=>{
      if(season.simState.stats[p.name])season.simState.stats[p.name]={maps:0,rating:0,mvps:0,clutches:0};
    });

    // Win bonus
    const winBonus=place===1;
    if(winBonus){
      roster.forEach(p=>{p.form=Math.min(12,p.form+5);});
      season.simState.chemistry[myTeam]=Math.min(100,chemBefore+10);
    }

    // Update per-player morale based on result
    updateMorale(season.simState,myTeam,place);

    season.budget+=prize;
    season.history.push({eventNum:season.eventNum,place,champion:t.champion,prize,salary:0,budgetAfter:season.budget,tier:ev.tier,label:ev.label||"Major"});

    // Update world rankings
    const placements={};
    if(t.bracket){
      const br=t.bracket;const fr=br.final?.res;
      if(fr){placements[fr.winnerName]=1;placements[fr.loserName]=2;}
      (br.sf||[]).forEach(s=>{if(s.done&&s.res&&!placements[s.res.loserName])placements[s.res.loserName]=4;});
      (br.qf||[]).forEach(q=>{if(q.done&&q.res&&!placements[q.res.loserName])placements[q.res.loserName]=9;});
    }
    if(t.swiss){
      t.swiss.eliminated.forEach(tm=>{if(!placements[tm])placements[tm]=t.teams?.length||16;});
    }
    updateRankings(season.simState,placements,ev.tier||"B");

    // Check expiring contracts before ticking
    const expiring=roster.filter(p=>p.contract<=1);

    // Tick contracts every event (not just Majors)
    decayFormBetweenEvents(season.simState);
    tickContracts(season.simState,myTeam);

    if(isMajor){
      season.simState.players.forEach(p=>{if(Math.random()<0.33)p.age++;});
      const moves=aiRosterMoves(season.simState,myTeam);
      moves.forEach(m=>season.weekLog.push({week:season.week,activity:"news",event:m}));
    }

    const chemAfter=season.simState.chemistry[myTeam]||70;
    const mvp=[...playerStats].sort((a,b)=>b.rating-a.rating).find(p=>p.maps>=2)||playerStats[0];

    if(!season.simState.rankings[myTeam])season.simState.rankings[myTeam]=0;
    season.eventNum++;season.week++;
    season.pendingDebrief={label:ev.label||"Tournament",tier:ev.tier||"B",place,prize,
      champion:t.champion,playerStats,mvp,chemBefore,chemAfter,winBonus};
    season.pendingContracts=expiring.map(p=>({
      playerName:p.name,contract:p.contract,currentSalary:p.salary,
      avgRating:+(season.simState.career?.[p.name]?.avgRating||0.9).toFixed(2)}));

    // Morale crisis: unhappy leader → pending choice event
    const unhappyLeader=roster.find(p=>(p.morale||60)<40&&(p.traits.includes("leader")||p.igl>=88));
    if(unhappyLeader&&!season.pendingEvent){
      season.pendingEvent={id:"morale_crisis",title:"Locker Room Unrest",playerName:unhappyLeader.name,
        text:`${unhappyLeader.name} is visibly unhappy — the mood in the team house is toxic.`,
        choices:[
          {label:"Emergency team meeting",desc:"$10K · +8 chemistry · +15 morale (all)"},
          {label:"1-on-1 with player",    desc:"$5K · +20 morale (player) · +3 chem"},
          {label:"Ignore it",             desc:"-8 chemistry · -5 morale (all)"},
        ]};
    }

    season.phase="calendar";season.currentEvent=null;
    setSeason({...season});setT(null);setTab("calendar");
    autoSave();
  }

  function dismissDebrief(){
    season.pendingDebrief=null;
    setSeason({...season});
  }

  function resolveContract(playerName,choice){
    const p=season.simState.players.find(x=>x.name===playerName);
    if(!p) return;
    if(choice===0){
      const perf=Math.min(1.3,Math.max(0.9,(season.simState.career?.[playerName]?.avgRating||0.95)));
      p.salary=Math.max(p.salary,Math.round(p.salary*perf*1.1));
      p.contract=3;
    } else if(choice===1){
      p.contract=2;
    } else {
      p.team="FA";p.contract=0;
    }
    season.pendingContracts=(season.pendingContracts||[]).filter(c=>c.playerName!==playerName);
    setSeason({...season});redraw();
  }

  function paySalary(week){
    if(!isSalaryWeek(week)) return null;
    const roster=rosterOf(season.simState,myTeam);
    const coachPay=season.simState.coach?season.simState.coach.salary:0;
    const totalSalary=roster.reduce((s,p)=>s+p.salary,0)+coachPay;
    // Revenue streams
    const contentTier=season.facilities?.content||0;
    const contentIncome=[0,15,30][contentTier]||0;
    // Merch income: scales with world ranking
    const rank=(()=>{const r=getRankedTeams(season.simState,myTeam);return r.findIndex(x=>x.team===myTeam)+1;})();
    const merchIncome=rank<=3?40:rank<=6?25:rank<=10?15:rank<=16?8:3;
    // Org stipend: base income from investors
    const stipendIncome=rank<=5?30:rank<=10?20:rank<=16?12:5;
    // Streaming: sum of player popularity (star players = more viewers)
    const streamIncome=Math.round(roster.reduce((s,p)=>{
      const pop=playerOvr(p)/20+(season.simState.career?.[p.name]?.totalMvps||0)*0.5;
      return s+pop;
    },0));
    // Sponsorship income
    const sponsorIncome=(season.sponsorships||[]).reduce((s,sp)=>s+(sp.active?sp.monthly:0),0);
    const totalIncome=contentIncome+merchIncome+stipendIncome+streamIncome+sponsorIncome;
    const net=totalIncome-totalSalary;
    season.budget+=net;
    const dateStr=weekToLabel(week,season.year);
    const parts=[];
    if(contentIncome)parts.push(`content ${contentIncome}K`);
    if(merchIncome)parts.push(`merch ${merchIncome}K`);
    if(stipendIncome)parts.push(`stipend ${stipendIncome}K`);
    if(streamIncome)parts.push(`streams ${streamIncome}K`);
    if(sponsorIncome)parts.push(`sponsors ${sponsorIncome}K`);
    const incStr=parts.length?` | Income: ${parts.join(", ")} = ${totalIncome}K`:"";
    return `[$] ${dateStr} — Salary: ${totalSalary}K${incStr} | Net: ${net>=0?"+":""}${net}K${season.budget<0?" ! DEBT!":""}`;
  }

  function advanceWeek(activity,mapChoice){
    if(activity==="scout"&&mapChoice){
      // mapChoice is used as teamName for scouting
      scoutTeam(mapChoice);
    }
    applyActivity(season.simState,myTeam,activity,activity==="scout"?null:mapChoice,season.facilities);
    aiWeekActivity(season.simState);
    const evMsg=rollRandomEvent(season.simState,myTeam);
    rollChoiceEvent();
    // Academy: develop prospects each week
    if(season.academy){
      season.academy.weeksActive++;
      season.academy.prospects.forEach(p=>developProspect(p));
      // Generate new prospect every 6 weeks if room
      if(season.academy.weeksActive%6===0&&season.academy.prospects.length<4){
        season.academy.prospects.push(generateProspect(season.year||2026));
        season.weekLog.push({week:season.week,activity:"news",event:`[AC] New academy prospect discovered!`});
      }
    }
    // Sponsorship offers (~10% chance per week if none active)
    const activeSponsorCount=(season.sponsorships||[]).filter(s=>s.active).length;
    if(activeSponsorCount<2&&Math.random()<0.10){
      if(!season.sponsorships)season.sponsorships=[];
      const rank=(()=>{const r=getRankedTeams(season.simState,myTeam);return r.findIndex(x=>x.team===myTeam)+1;})();
      const offers=[
        {brand:"Red Bull",monthly:rank<=5?40:25,duration:6,condition:rank<=10?"Stay top 10":"Stay top 16",checkRank:rank<=10?10:16},
        {brand:"HyperX",monthly:rank<=8?30:15,duration:4,condition:"None",checkRank:99},
        {brand:"Intel",monthly:50,duration:3,condition:"Win an event",checkWin:true},
        {brand:"BMW",monthly:rank<=3?60:35,duration:6,condition:rank<=5?"Stay top 5":"Stay top 10",checkRank:rank<=5?5:10},
        {brand:"Monster",monthly:20,duration:8,condition:"None",checkRank:99},
        {brand:"Logitech",monthly:rank<=10?35:18,duration:5,condition:"Make a Major",checkMajor:true},
      ];
      const offer=offers[Math.floor(Math.random()*offers.length)];
      season.sponsorships.push({...offer,active:false,offered:true,weeksLeft:offer.duration*4,startWeek:season.week});
      season.weekLog.push({week:season.week,activity:"news",event:`[>] ${offer.brand} offers ${offer.monthly}K/month for ${offer.duration} months (${offer.condition})`});
    }
    // Tick active sponsorships
    (season.sponsorships||[]).forEach(sp=>{
      if(sp.active){sp.weeksLeft--;if(sp.weeksLeft<=0)sp.active=false;}
    });
    season.weekLog.push({week:season.week,activity,mapChoice,event:evMsg||null});
    season.week++;
    const salMsg=paySalary(season.week);
    if(salMsg) season.weekLog.push({week:season.week,activity:"salary",event:salMsg});
    checkWeekTransition();
    autoSave();
  }

  function simToNextEvent(){
    const nextEv=EVENTS.find(e=>e.week>=season.week);
    const target=nextEv?nextEv.week:SEASON_WEEKS+1;
    const log=autoSimWeeks(season.simState,myTeam,season.week,target);
    // Inject salary deductions into the log for each payday week
    const enriched=[];
    for(const entry of log){
      enriched.push(entry);
      if(isSalaryWeek(entry.week+1)){
        const roster=rosterOf(season.simState,myTeam);
        const coachPay=season.simState.coach?season.simState.coach.salary:5;
        const totalSalary=roster.reduce((s,p)=>s+p.salary,0)+coachPay;
        season.budget-=totalSalary;
        enriched.push({week:entry.week+1,activity:"salary",event:`[$] Payday (${weekToLabel(entry.week+1,season.year)}) — ${totalSalary}K salaries paid${season.budget<0?" ! DEBT!":""}`});
      }
    }
    season.weekLog.push(...enriched);
    season.week=target;
    checkWeekTransition();
    autoSave();
  }

  function checkWeekTransition(){
    const ev=EVENTS.find(e=>e.week===season.week);
    if(ev){
      season.phase="event";season.currentEvent=ev;
      if(ev.tier==="Major"){
        // Major qualification: top 8 = Legends (direct), 9-16 = Challengers (qualifier)
        const ranked=getRankedTeams(season.simState,myTeam);
        const myRank=ranked.findIndex(x=>x.team===myTeam)+1;
        if(myRank>16){
          // Outside top 16: miss the Major entirely
          season.weekLog.push({week:season.week,activity:"news",event:`[X] ${myTeam} (ranked #${myRank}) failed to qualify for ${ev.label}. Top 16 required.`});
          // Sim Major without user
          const majorT=newTournament(myTeam,season.simState);
          // Remove user's team and sim everything
          majorT.swiss.teams=majorT.swiss.teams.filter(t=>t!==myTeam);
          let si=0;while(!swissDone(majorT.swiss)&&si<30){si++;swissRound(majorT.swiss);}
          const advancers=majorT.swiss.advanced.slice(0,8);
          majorT.bracket=seedPlayoff(advancers,3,true);
          let pi=0;while(!majorT.bracket.final.done&&pi<20){pi++;const allFx=[...(majorT.bracket.qf||[]),...(majorT.bracket.sf||[]),majorT.bracket.final];allFx.forEach(fx=>{if(!fx.done&&fx.a&&fx.b){const bo=fx===majorT.bracket.final?5:3;fx.res=playSeries(majorT.simState,fx.a,fx.b,bo,{stage:"playoffs"},Math.random);fx.done=true;}});resolvePlayoffAI(majorT.bracket,null,majorT.simState,Math.random);}
          const champ=majorT.bracket.final.done?majorT.bracket.final.res.winnerName:"Unknown";
          season.weekLog.push({week:season.week,activity:"news",event:`[W] ${champ} win ${ev.label} (you were not qualified)`});
          season.history.push({eventNum:season.eventNum,place:99,champion:champ,prize:0,salary:0,budgetAfter:season.budget,tier:"Major",label:ev.label+" (DNQ)"});
          // Rankings update for participants
          const placements={};if(majorT.bracket.final.res){placements[majorT.bracket.final.res.winnerName]=1;placements[majorT.bracket.final.res.loserName]=2;}
          (majorT.bracket.sf||[]).forEach(s=>{if(s.done&&s.res)placements[s.res.loserName]=4;});
          (majorT.bracket.qf||[]).forEach(q=>{if(q.done&&q.res)placements[q.res.loserName]=9;});
          majorT.swiss.eliminated.forEach(tm=>{if(!placements[tm])placements[tm]=16;});
          updateRankings(season.simState,placements,"Major");
          decayFormBetweenEvents(season.simState);tickContracts(season.simState,myTeam);
          const moves=aiRosterMoves(season.simState,myTeam);
          moves.forEach(m=>season.weekLog.push({week:season.week,activity:"news",event:m}));
          season.eventNum++;season.week++;season.currentEvent=null;season.phase="calendar";
          setSeason({...season});setTab("calendar");
          return;
        }
        const isLegend=myRank<=8;
        if(!isLegend){
          season.weekLog.push({week:season.week,activity:"news",event:`[S] ${myTeam} (ranked #${myRank}) enters the Challenger Stage qualifier for ${ev.label}`});
        } else {
          season.weekLog.push({week:season.week,activity:"news",event:`[*] ${myTeam} (ranked #${myRank}) auto-qualified as Legends for ${ev.label}`});
        }
        // Sticker money for qualifying
        const stickerMoney=isLegend?Math.round(40+((17-myRank)*5)):Math.round(15+((17-myRank)*2));
        season.budget+=stickerMoney;
        season.weekLog.push({week:season.week,activity:"news",event:`[TK] Major sticker revenue: +${stickerMoney}K`});
        setSeason({...season});
        setT(newTournament(myTeam,season.simState));
        setTab("hub");
      } else {
        setSeason({...season});
        setT(newMiniTournament(myTeam,season.simState,ev));
        setTab("hub");
      }
    } else if(season.week>SEASON_WEEKS){
      season.phase="done";setSeason({...season});setTab("season");
    } else {
      setSeason({...season});redraw();
    }
  }

  function hireCoach(coach){
    season.simState.coach=coach;
    setSeason({...season});redraw();
  }
  function fireCoach(){
    season.simState.coach=null;
    setSeason({...season});redraw();
  }

  function doTransfer(action,playerName){
    const p=season.simState.players.find(x=>x.name===playerName);if(!p)return;
    if(action==="release"){season.budget+=Math.round(marketValue(p)*0.3);p.team="FA";p.contract=0;season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||70)-8);}
    else if(action==="sign"&&p.team==="FA"){p.team=myTeam;p.contract=2;season.budget-=marketValue(p);season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||70)-5);if(!season.simState.stats[p.name])season.simState.stats[p.name]={maps:0,rating:0,mvps:0,clutches:0};if(!season.simState.career[p.name])season.simState.career[p.name]={totalMaps:0,totalMvps:0,totalClutches:0,avgRating:0,bestRating:0,eventHistory:[],mapStats:{},origStats:{aim:p.aim,gameSense:p.gameSense,util:p.util,igl:p.igl,mentality:p.mentality,consistency:p.consistency,rifle:p.rifle,pistol:p.pistol,awp:p.awp,clutch:p.clutch,entry:p.entry,stamina:p.stamina,composure:p.composure,experience:p.experience},kills:0};}
    else if(action==="buy"){const buyout=Math.round(marketValue(p)*2);if(season.budget<buyout)return;const oldTeam=p.team;season.budget-=buyout;p.team=myTeam;p.contract=2;season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||70)-5);season.simState.chemistry[oldTeam]=Math.max(40,(season.simState.chemistry[oldTeam]||70)-5);const fas=freeAgents(season.simState);if(fas.length>0){const best=fas.sort((a,b)=>playerOvr(b)-playerOvr(a))[0];best.team=oldTeam;best.contract=2;}if(!season.simState.stats[p.name])season.simState.stats[p.name]={maps:0,rating:0,mvps:0,clutches:0};if(!season.simState.career[p.name])season.simState.career[p.name]={totalMaps:0,totalMvps:0,totalClutches:0,avgRating:0,bestRating:0,eventHistory:[],mapStats:{},origStats:{aim:p.aim,gameSense:p.gameSense,util:p.util,igl:p.igl,mentality:p.mentality,consistency:p.consistency,rifle:p.rifle,pistol:p.pistol,awp:p.awp,clutch:p.clutch,entry:p.entry,stamina:p.stamina,composure:p.composure,experience:p.experience},kills:0};}
    setSeason({...season});redraw();
  }

  function initCareer(p){
    if(!season.simState.stats[p.name]) season.simState.stats[p.name]={maps:0,rating:0,mvps:0,clutches:0};
    if(!season.simState.career[p.name]) season.simState.career[p.name]={totalMaps:0,totalMvps:0,totalClutches:0,avgRating:0,bestRating:0,eventHistory:[],mapStats:{},origStats:{aim:p.aim,gameSense:p.gameSense,util:p.util,igl:p.igl,mentality:p.mentality,consistency:p.consistency,rifle:p.rifle,pistol:p.pistol,awp:p.awp,clutch:p.clutch,entry:p.entry,stamina:p.stamina,composure:p.composure,experience:p.experience},kills:0};
  }

  function doNegotiateFA(playerName,offeredSalary){
    const p=season.simState.players.find(x=>x.name===playerName);
    if(!p||p.team!=="FA") return{success:false,msg:"Player not available"};
    const roster=rosterOf(season.simState,myTeam);
    if(roster.length>=5) return{success:false,msg:"Roster is full"};
    const mv=marketValue(p);
    if(season.budget<mv) return{success:false,msg:`Need $${mv-season.budget}K more for signing fee`};
    const career=season.simState.career?.[p.name];
    const r=career?.avgRating||0.95;
    const mult=r>=1.15?1.5:r>=1.1?1.3:r>=1.0?1.1:r>=0.9?1.0:0.85;
    const desired=Math.max(5,Math.round(p.salary*mult));
    if(offeredSalary>=desired){
      p.team=myTeam;p.salary=offeredSalary;p.contract=3;
      season.budget-=mv;
      season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||70)-5);
      initCareer(p);
      season.weekLog.push({week:season.week,activity:"news",event:`[+] ${p.name} signed for $${offeredSalary}K/mo (fee: $${mv}K)`});
      setSeason({...season});redraw();
      return{success:true,signed:true,msg:`${p.name} signed at $${offeredSalary}K/mo!`};
    }
    if(offeredSalary>=desired*0.80){
      const counter=Math.round((offeredSalary+desired)/2);
      return{success:false,counter:true,counterSalary:counter,msg:`${p.name} counters at $${counter}K/mo (wanted $${desired}K)`};
    }
    return{success:false,msg:`${p.name} rejects $${offeredSalary}K — wants at least $${Math.round(desired*0.80)}K/mo`};
  }

  function doBuyoutOffer(playerName,offerAmount){
    const p=season.simState.players.find(x=>x.name===playerName);
    if(!p||p.team==="FA"||p.team===myTeam) return{success:false,msg:"Invalid player"};
    const roster=rosterOf(season.simState,myTeam);
    if(roster.length>=5) return{success:false,msg:"Roster is full"};
    if(season.budget<offerAmount) return{success:false,msg:"Insufficient budget"};
    const mv=marketValue(p);
    const holdTeam=p.team;
    const ranked=getRankedTeams(season.simState,myTeam);
    const teamRank=ranked.findIndex(r=>r.team===holdTeam);
    const minMult=teamRank<5?1.8:teamRank<10?1.6:1.4;
    const ctrMult=teamRank<5?2.2:teamRank<10?1.95:1.75;
    const minAccept=Math.round(mv*minMult);
    const counterPrice=Math.round(mv*ctrMult);
    if(offerAmount>=minAccept){
      const oldTeam=p.team;
      season.budget-=offerAmount;
      p.team=myTeam;p.contract=2;
      season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||70)-5);
      season.simState.chemistry[oldTeam]=Math.max(40,(season.simState.chemistry[oldTeam]||70)-5);
      const fas=freeAgents(season.simState);
      if(fas.length>0){const best=fas.sort((a,b)=>playerOvr(b)-playerOvr(a))[0];best.team=oldTeam;best.contract=2;}
      initCareer(p);
      season.weekLog.push({week:season.week,activity:"news",event:`[+] ${playerName} bought from ${holdTeam} for $${offerAmount}K`});
      setSeason({...season});redraw();
      return{success:true,accepted:true,msg:`${holdTeam} accepts $${offerAmount}K for ${playerName}!`};
    }
    if(offerAmount>=mv*1.2){
      return{success:false,accepted:false,counter:true,counterAmount:counterPrice,msg:`${holdTeam} counters at $${counterPrice}K`};
    }
    return{success:false,accepted:false,msg:`${holdTeam} rejects. They value ${playerName} at ~$${minAccept}K+`};
  }

  function doTradeOffer(myPlayerName,theirPlayerName,cashBonus){
    const myP=season.simState.players.find(x=>x.name===myPlayerName&&x.team===myTeam);
    const theirP=season.simState.players.find(x=>x.name===theirPlayerName&&x.team!==myTeam&&x.team!=="FA");
    if(!myP||!theirP) return{success:false,msg:"Invalid players"};
    if(season.budget<cashBonus) return{success:false,msg:"Insufficient budget"};
    const myMv=marketValue(myP),theirMv=marketValue(theirP);
    const myOvr=playerOvr(myP),theirOvr=playerOvr(theirP);
    const offerVal=myMv+cashBonus;
    const theirTeam=theirP.team;
    const theirRoster=rosterOf(season.simState,theirTeam);
    const needsRole=theirRoster.filter(p=>p.role===myP.role).length<2;
    if(offerVal>=theirMv*0.90&&(needsRole||myOvr>=theirOvr-5)){
      season.budget-=cashBonus;
      const oldTheirTeam=theirP.team;
      myP.team=oldTheirTeam;myP.contract=2;
      theirP.team=myTeam;theirP.contract=2;
      season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||70)-5);
      season.simState.chemistry[oldTheirTeam]=Math.max(40,(season.simState.chemistry[oldTheirTeam]||70)-5);
      initCareer(theirP);
      season.weekLog.push({week:season.week,activity:"news",event:`[=] TRADE: ${myPlayerName} → ${oldTheirTeam}, ${theirPlayerName} → ${myTeam}${cashBonus>0?` (+$${cashBonus}K)`:""}`});
      setSeason({...season});redraw();
      return{success:true,accepted:true,msg:`Trade done! ${theirPlayerName} joins your roster.`};
    }
    if(offerVal>=theirMv*0.70){
      const neededCash=Math.max(0,Math.round(theirMv*0.95-myMv));
      if(neededCash>cashBonus) return{success:false,accepted:false,counter:true,counterCash:neededCash,msg:`${theirTeam} wants $${neededCash}K cash to close the deal.`};
    }
    const reason=!needsRole?"They have that role covered.":offerVal<theirMv*0.70?"Offer too low.":"OVR gap is too large.";
    return{success:false,accepted:false,msg:`${theirTeam} declined: ${reason}`};
  }

  function doSellPlayer(playerName,buyingTeam,amount){
    const p=season.simState.players.find(x=>x.name===playerName&&x.team===myTeam);
    if(!p) return;
    season.budget+=amount;
    p.team=buyingTeam;p.contract=2;
    season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||70)-8);
    season.simState.chemistry[buyingTeam]=Math.max(40,(season.simState.chemistry[buyingTeam]||70)-3);
    season.weekLog.push({week:season.week,activity:"news",event:`[$$] ${playerName} sold to ${buyingTeam} for $${amount}K`});
    setSeason({...season});redraw();
  }

  function upgradeFacility(facId){
    const fac=FACILITIES[facId];if(!fac)return;
    const curTier=season.facilities[facId]||0;
    if(curTier>=fac.maxTier)return;
    const cost=fac.cost[curTier];
    if(season.budget<cost)return;
    season.budget-=cost;
    season.facilities={...season.facilities,[facId]:curTier+1};
    setSeason({...season});redraw();
  }

  function startNewYear(){
    // Year-end: save year summary, reset calendar, age players, generate rookies, decay rankings
    const yr=season.year||2026;
    season.yearHistory.push({
      year:yr,
      events:season.history.length,
      budgetEnd:season.budget,
      rank:(()=>{const r=getRankedTeams(season.simState,myTeam);return r.findIndex(x=>x.team===myTeam)+1;})(),
      trophies:season.history.filter(h=>h.place===1).length,
      roster:rosterOf(season.simState,myTeam).map(p=>p.name),
    });
    // Age all players +1
    season.simState.players.forEach(p=>{p.age++;});
    // Generate 5-8 rookies (young talents entering FA pool)
    const rookieCount=5+Math.floor(Math.random()*4);
    const roles=["IGL","AWP","Entry","Lurk","Support"];
    const rookieNames=["prodigy","wunderkid","flash","nova","zen","blitz","cipher","phantom","ace","bolt"];
    for(let i=0;i<rookieCount;i++){
      const role=roles[Math.floor(Math.random()*roles.length)];
      const name=rookieNames[Math.floor(Math.random()*rookieNames.length)]+(yr-2025)+"_"+i;
      const base=55+Math.floor(Math.random()*25);
      const p={team:"FA",name,role,aim:base+Math.floor(Math.random()*15),gameSense:base+Math.floor(Math.random()*10),util:base+Math.floor(Math.random()*10),igl:role==="IGL"?base+20:base-10,mentality:50+Math.floor(Math.random()*30),consistency:40+Math.floor(Math.random()*30),traits:Math.random()<0.2?["boom"]:Math.random()<0.1?["clutch"]:[],salary:5+Math.floor(Math.random()*5),contract:0,age:17+Math.floor(Math.random()*2),era:"current",form:0,fatigue:10,
        rifle:base+Math.floor(Math.random()*12),pistol:base+Math.floor(Math.random()*12),awp:role==="AWP"?base+15:base-5,clutch:40+Math.floor(Math.random()*20),entry:role==="Entry"?base+15:base,stamina:60+Math.floor(Math.random()*25),composure:40+Math.floor(Math.random()*25),experience:30+Math.floor(Math.random()*10),
      };
      season.simState.players.push(p);
      season.simState.stats[p.name]={maps:0,rating:0,mvps:0,clutches:0};
      season.simState.career[p.name]={totalMaps:0,totalMvps:0,totalClutches:0,avgRating:0,bestRating:0,eventHistory:[],mapStats:{},origStats:{aim:p.aim,gameSense:p.gameSense,util:p.util,igl:p.igl,mentality:p.mentality,consistency:p.consistency,rifle:p.rifle,pistol:p.pistol,awp:p.awp,clutch:p.clutch,entry:p.entry,stamina:p.stamina,composure:p.composure,experience:p.experience},kills:0};
    }
    // Decay rankings (off-season)
    Object.keys(season.simState.rankings).forEach(t=>{season.simState.rankings[t]=Math.round((season.simState.rankings[t]||0)*0.7);});
    // Expire more contracts
    tickContracts(season.simState,myTeam);
    // AI roster moves in off-season
    const moves=aiRosterMoves(season.simState,myTeam);
    // Reset season but keep everything else
    const newYear=yr+1;
    season.year=newYear;season.week=1;season.eventNum=1;season.history=[];
    season.weekLog=[{week:0,activity:"news",event:`> Welcome to the ${newYear} season! ${rookieCount} new rookies entered the market.`}];
    if(moves.length)moves.forEach(m=>season.weekLog.push({week:0,activity:"news",event:m}));
    season.phase="calendar";
    setSeason({...season});setT(null);setTab("calendar");
    autoSave();
  }

  function acceptSponsorship(idx){
    if(!season.sponsorships?.[idx])return;
    season.sponsorships[idx].active=true;
    season.sponsorships[idx].offered=false;
    setSeason({...season});redraw();
  }
  function declineSponsorship(idx){
    if(!season.sponsorships?.[idx])return;
    season.sponsorships[idx].offered=false;
    setSeason({...season});redraw();
  }

  // Contract negotiations
  function negotiateContract(playerName,offeredSalary){
    const p=season.simState.players.find(x=>x.name===playerName);if(!p||p.team!==myTeam)return{success:false,msg:"Player not on roster"};
    const ovr=playerOvr(p);
    const recentRating=season.simState.career?.[p.name]?.avgRating||0.9;
    // Player's desired salary based on performance
    const demandBase=p.salary*(recentRating>=1.1?1.4:recentRating>=1.0?1.15:recentRating>=0.9?1.0:0.85);
    const demand=Math.round(demandBase);
    if(offeredSalary>=demand){
      p.salary=offeredSalary;p.contract=3;
      return{success:true,msg:`${p.name} accepts ${offeredSalary}K/mo for 3 events. They wanted ${demand}K.`};
    }
    if(offeredSalary>=demand*0.85){
      // Counter-offer: split the difference
      const counter=Math.round((offeredSalary+demand)/2);
      p.salary=counter;p.contract=2;
      return{success:true,msg:`${p.name} countered at ${counter}K/mo for 2 events (wanted ${demand}K).`};
    }
    return{success:false,msg:`${p.name} rejected ${offeredSalary}K/mo. They demand at least $Math.round(demand*0.85)K.`};
  }

  // Role assignment
  function changeRole(playerName,newRole){
    const p=season.simState.players.find(x=>x.name===playerName);if(!p||p.team!==myTeam)return;
    if(p.role===newRole)return;
    p.role=newRole;
    season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||55)-3);
    season.weekLog.push({week:season.week,activity:"news",event:`[>] ${p.name} moved to ${newRole} role (-3 chemistry)`});
    setSeason({...season});redraw();
  }

  // Scout prep
  function scoutTeam(teamName){
    if(!season.scoutedTeams)season.scoutedTeams={};
    const roster=rosterOf(season.simState,teamName);
    const mapProf=getMapProf(season.simState,teamName);
    season.scoutedTeams[teamName]={
      roster:roster.map(p=>({name:p.name,ovr:playerOvr(p),role:p.role})),
      maps:Object.entries(mapProf).sort((a,b)=>b[1]-a[1]).map(([m,v])=>({map:m,prof:v})),
      scoutedAt:season.week
    };
    season.weekLog.push({week:season.week,activity:"news",event:`[SC] Scouted ${teamName} — map pool and roster intel acquired`});
    setSeason({...season});redraw();
  }

  // Academy
  function initAcademy(){
    if(season.academy)return;
    if(season.budget<100)return;
    season.budget-=100;
    season.academy={prospects:[],weeksActive:0};
    // Generate 2 initial prospects
    for(let i=0;i<2;i++) season.academy.prospects.push(generateProspect(season.year||2026));
    setSeason({...season});redraw();
  }

  function promoteProspect(idx){
    if(!season.academy?.prospects[idx])return;
    const roster=rosterOf(season.simState,myTeam);
    if(roster.length>=5)return;
    const p=season.academy.prospects[idx];
    p.team=myTeam;p.contract=3;
    season.simState.players.push(p);
    season.simState.stats[p.name]={maps:0,rating:0,mvps:0,clutches:0};
    season.simState.career[p.name]={totalMaps:0,totalMvps:0,totalClutches:0,avgRating:0,bestRating:0,eventHistory:[],mapStats:{},origStats:{aim:p.aim,gameSense:p.gameSense,util:p.util,igl:p.igl,mentality:p.mentality,consistency:p.consistency,rifle:p.rifle||60,pistol:p.pistol||50,awp:p.awp||40,clutch:p.clutch||40,entry:p.entry||50,stamina:p.stamina||60,composure:p.composure||40,experience:p.experience||30},kills:0};
    season.academy.prospects.splice(idx,1);
    season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||55)-5);
    setSeason({...season});redraw();
  }

  function sellProspect(idx){
    if(!season.academy?.prospects[idx])return;
    if((season.academy.prospects[idx].weeksInAcademy||0)<8)return;
    const p=season.academy.prospects[idx];
    const value=Math.round(playerOvr(p)*0.8);
    season.budget+=value;
    season.academy.prospects.splice(idx,1);
    season.weekLog.push({week:season.week,activity:"news",event:`[$$] Sold academy prospect ${p.name} for ${value}K`});
    setSeason({...season});redraw();
  }

  function rollChoiceEvent(){
    if(season.pendingEvent) return;
    if(Math.random()>0.25) return;
    const roster=rosterOf(season.simState,myTeam);
    if(!roster.length) return;
    const totalWeight=CHOICE_EVENTS.reduce((s,e)=>s+e.weight,0);
    let roll=Math.random()*totalWeight,ev=null;
    for(const e of CHOICE_EVENTS){roll-=e.weight;if(roll<=0){ev=e;break;}}
    if(!ev) return;
    const player=roster[Math.floor(Math.random()*roster.length)];
    season.pendingEvent={...ev,playerName:player.name,text:ev.text.replace("{player}",player.name)};
  }

  function resolveChoiceEvent(choiceIdx){
    const ev=season.pendingEvent;if(!ev)return;
    const roster=rosterOf(season.simState,myTeam);
    const player=roster.find(p=>p.name===ev.playerName)||roster[0];
    switch(ev.id){
      case "team_friction":
        if(choiceIdx===0){season.budget-=10;season.simState.chemistry[myTeam]=Math.min(100,(season.simState.chemistry[myTeam]||70)+8);}
        else if(choiceIdx===1){season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||70)-5);}
        else{if(player)player.form=Math.max(-12,player.form-2);season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||70)-2);season.budget+=5;}
        break;
      case "player_demand":
        if(choiceIdx===0){if(player){player.salary+=5;player.form=Math.min(12,player.form+5);}}
        else if(choiceIdx===1){if(player)player.form=Math.max(-12,player.form-4);}
        else{season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||70)-2);}
        break;
      case "rival_interest":
        if(choiceIdx===0){season.budget-=20;if(player)player.form=Math.min(12,player.form+3);}
        else if(choiceIdx===1){if(player){player.salary+=4;player.contract=Math.max(player.contract,2);}}
        else{if(player)player.form=Math.max(-12,player.form-3);season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||70)-5);}
        break;
      case "bootcamp_invite":
        if(choiceIdx===0){season.budget-=30;roster.forEach(p=>{p.gameSense=Math.min(99,p.gameSense+2);p.fatigue=Math.min(100,p.fatigue+10);});}
        else if(choiceIdx===1){season.budget-=10;roster.forEach(p=>{p.gameSense=Math.min(99,p.gameSense+1);p.fatigue=Math.min(100,p.fatigue+5);});}
        break;
      case "slump":
        if(choiceIdx===0){season.budget-=15;if(player){player.form=Math.min(12,player.form+4);player.gameSense=Math.min(99,player.gameSense+1);}}
        else if(choiceIdx===1){if(player){player.fatigue=Math.max(0,player.fatigue-15);player.form=Math.min(12,player.form+2);}}
        else{if(player){player.fatigue=Math.min(100,player.fatigue+10);player.form=Math.max(-12,player.form-2);}}
        break;
      case "media_storm":
        if(choiceIdx===0){if(player)player.form=Math.max(-12,player.form-3);season.simState.chemistry[myTeam]=Math.min(100,(season.simState.chemistry[myTeam]||70)+3);}
        else if(choiceIdx===1){if(player)player.form=Math.min(12,player.form+4);season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||70)-7);}
        else{season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||70)-2);}
        break;
      case "morale_crisis":{
        const roster2=rosterOf(season.simState,myTeam);
        if(choiceIdx===0){season.budget-=10;season.simState.chemistry[myTeam]=Math.min(100,(season.simState.chemistry[myTeam]||70)+8);roster2.forEach(p=>{p.morale=Math.min(100,(p.morale||60)+15);});}
        else if(choiceIdx===1){season.budget-=5;if(player)player.morale=Math.min(100,(player.morale||60)+20);season.simState.chemistry[myTeam]=Math.min(100,(season.simState.chemistry[myTeam]||70)+3);}
        else{season.simState.chemistry[myTeam]=Math.max(30,(season.simState.chemistry[myTeam]||70)-8);roster2.forEach(p=>{p.morale=Math.max(5,(p.morale||60)-5);});}
        break;}
      default:break;
    }
    const choice=ev.choices[choiceIdx];
    season.weekLog.push({week:season.week,activity:"news",event:`[!] ${ev.title}: "${choice?.label}" — ${choice?.desc||""}`});
    season.pendingEvent=null;
    setSeason({...season});redraw();
  }

  function resetAll(){setPhase("saves");setMyTeam(null);setSeason(null);setT(null);setTab("hub");loadSaves();}

  if(phase==="loading") return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:sans,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <Gstyle/><div style={{textAlign:"center"}}><div style={{fontFamily:mono,fontWeight:700,fontSize:16,color:C.acc,letterSpacing:3}}>▸ OVERTIME</div><div style={{color:C.dim,fontSize:13,marginTop:8}}>Loading...</div></div>
    </div>);

  if(phase==="saves") return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:sans}}>
      <Gstyle/>
      <div style={{maxWidth:600,margin:"0 auto",padding:"60px 24px"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontFamily:mono,fontWeight:700,fontSize:20,color:C.acc,letterSpacing:3,marginBottom:8}}>▸ OVERTIME</div>
          <div style={{fontSize:14,color:C.dim}}>CS Major Team Management Simulator</div>
        </div>
        <button onClick={()=>setPhase("draft")} style={{width:"100%",background:C.acc,color:"#0a0c10",border:"none",borderRadius:10,padding:"16px",fontWeight:800,fontSize:17,marginBottom:24}}>NEW SEASON →</button>
        <div style={{fontFamily:mono,fontSize:11,color:C.dim,letterSpacing:1.5,marginBottom:12}}>SAVED GAMES</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {["Auto-Save","Slot 1","Slot 2","Slot 3"].map((label,i)=>{
            const save=saves[i];
            if(!save) return <div key={i} style={{background:C.panel,border:`1px dashed ${C.line}`,borderRadius:9,padding:"16px 18px",color:C.faint,fontFamily:mono,fontSize:12}}>{label} — Empty</div>;
            const s=save.summary||{};
            return(
            <div key={i} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:9,padding:"14px 18px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                <span style={{fontFamily:mono,fontSize:10,color:C.faint}}>{label}</span>
                <span style={{fontWeight:700,fontSize:15,color:C.acc}}>{save.myTeam}</span>
                <span style={{fontFamily:mono,fontSize:11,color:C.dim,marginLeft:"auto"}}>#{s.rank||"?"} ranked</span>
              </div>
              <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:10}}>
                <MiniStat label="DATE" value={`${s.date||"?"} 2026`} color={C.live}/>
                <MiniStat label="WEEK" value={s.week||"?"} color={C.dim}/>
                <MiniStat label="BUDGET" value={`$${s.budget||0}K`} color={(s.budget||0)>0?C.gold:C.red}/>
                <MiniStat label="EVENTS" value={s.events||0} color={C.dim}/>
              </div>
              <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginBottom:10}}>{(s.roster||[]).join(" · ")}</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>loadFromSave(save)} style={{flex:1,background:C.win,color:"#0a0c10",border:"none",borderRadius:7,padding:"9px",fontWeight:800,fontSize:13}}>CONTINUE</button>
                {i>0&&<button onClick={()=>deleteSave(i)} style={{background:"transparent",border:`1px solid ${C.red}`,color:C.red,borderRadius:7,padding:"9px 14px",fontFamily:mono,fontSize:11,fontWeight:700}}>DELETE</button>}
              </div>
            </div>);
          })}
        </div>
      </div>
    </div>);

  if(phase==="draft")return <DraftScreen onComplete={onDraftComplete}/>;

  // Calendar phase
  if(season?.phase==="calendar"&&!t) return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:sans}}>
      <Gstyle/><Header season={season} myTeam={myTeam} onReset={resetAll} onSave={saveToSlot} stageLabel={`${weekToLabel(season.week,season.year)} ${season.year||2026} · W${season.week}`}/>
      <Tabs tab={tab} setTab={setTab} calMode/>
      <main style={{maxWidth:1100,margin:"0 auto",padding:"22px 18px 80px"}}>
        {tab==="calendar"&&<CalendarView season={season} myTeam={myTeam} onAdvance={advanceWeek} onTransfer={doTransfer} onSim={simToNextEvent} onHireCoach={hireCoach} onFireCoach={fireCoach} onInitAcademy={initAcademy} onPromoteProspect={promoteProspect} onSellProspect={sellProspect} onAcceptSponsor={acceptSponsorship} onDeclineSponsor={declineSponsorship} onResolveEvent={resolveChoiceEvent} onResolveContract={resolveContract}/>}
        {tab==="roster"&&<RosterView2 state={season.simState} myTeam={myTeam} onNegotiate={negotiateContract} onChangeRole={changeRole}/>}
        {tab==="market"&&<TransferMarket season={season} myTeam={myTeam} onNegotiateFA={doNegotiateFA} onBuyoutOffer={doBuyoutOffer} onTradeOffer={doTradeOffer} onSellPlayer={doSellPlayer} onRelease={p=>doTransfer("release",p)}/>}
        {tab==="maps"&&<MapProfView state={season.simState} myTeam={myTeam}/>}
        {tab==="facility"&&<FacilitiesView season={season} onUpgrade={upgradeFacility}/>}
        {tab==="rankings"&&<RankingsView state={season.simState} myTeam={myTeam}/>}
        {tab==="rivals"&&<RivalryView state={season.simState} myTeam={myTeam}/>}
        {tab==="dynamics"&&<DynamicsView season={season} myTeam={myTeam}/>}
        {tab==="season"&&<SeasonHistory season={season} myTeam={myTeam}/>}
      </main>
      {season.pendingDebrief&&<EventDebrief debrief={season.pendingDebrief} onDismiss={dismissDebrief}/>}
    </div>);

  // Season done
  if(season?.phase==="done") return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:sans}}>
      <Gstyle/><Header season={season} myTeam={myTeam} onReset={resetAll} onSave={saveToSlot} stageLabel={`${season.year||2026} SEASON COMPLETE`}/>
      <main style={{maxWidth:1100,margin:"0 auto",padding:"40px 18px 80px",textAlign:"center"}}>
        <div style={{fontSize:28,fontWeight:800,color:C.gold,marginBottom:4}}>{season.year||2026} SEASON COMPLETE</div>
        <p style={{color:C.dim,fontSize:14,marginBottom:20}}>You managed {myTeam} through {season.history.length} events.</p>
        <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",marginBottom:24}}>
          <MiniStat label="TROPHIES" value={season.history.filter(h=>h.place===1).length} color={C.gold}/>
          <MiniStat label="WORLD RANK" value={`#${(()=>{const r=getRankedTeams(season.simState,myTeam);return r.findIndex(x=>x.team===myTeam)+1;})()}`} color={C.acc}/>
          <MiniStat label="BUDGET" value={`$${season.budget}K`} color={season.budget>0?C.gold:C.red}/>
          <MiniStat label="BEST FINISH" value={Math.min(...season.history.map(h=>h.place))||"—"} color={C.win}/>
        </div>
        <SeasonHistory season={season} myTeam={myTeam}/>
        {season.yearHistory?.length>0&&(<>
          <div style={{fontFamily:mono,fontSize:11,color:C.dim,letterSpacing:1.5,marginTop:24,marginBottom:8}}>PREVIOUS YEARS</div>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:16}}>
            {season.yearHistory.map((yh,i)=>(
              <div key={i} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,padding:"10px 14px",textAlign:"center",minWidth:100}}>
                <div style={{fontWeight:700,fontSize:15,color:C.acc}}>{yh.year}</div>
                <div style={{fontFamily:mono,fontSize:10,color:C.dim}}>#{yh.rank} ranked · {yh.trophies}[W]</div>
                <div style={{fontFamily:mono,fontSize:10,color:C.gold}}>${yh.budgetEnd}K</div>
              </div>
            ))}
          </div>
        </>)}
        <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:24}}>
          <button onClick={startNewYear} style={{background:C.acc,color:"#0a0c10",border:"none",borderRadius:10,padding:"16px 36px",fontWeight:800,fontSize:17}}>CONTINUE TO {(season.year||2026)+1} →</button>
          <button onClick={resetAll} style={{background:C.panel,color:C.dim,border:`1px solid ${C.line}`,borderRadius:10,padding:"16px 24px",fontWeight:700,fontSize:14}}>MAIN MENU</button>
        </div>
      </main>
    </div>);

  // Event phase
  const isMajor=t.isMajor;
  const nf=nextUserFx();
  const elimInSwiss=t.swiss?.eliminated?.includes(myTeam);
  const elimInPlayoffs=t.bracket?bracketElim(t.bracket,myTeam):false;
  const alive=t.stage==="done"?t.champion===myTeam:!elimInSwiss&&!elimInPlayoffs;
  const evLabel=season.currentEvent?.label||(isMajor?"MAJOR":"EVENT");
  const tierTag=season.currentEvent?.tier||"Major";
  const stageLabel={swiss:"GROUP STAGE",playoffs:"PLAYOFFS",done:"COMPLETE"}[t.stage]||"";
  const SEED=getSeed(myTeam,season?.simState);

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:sans}}>
      <Gstyle/><Header season={season} myTeam={myTeam} onReset={resetAll} onSave={saveToSlot} stageLabel={`${evLabel} · ${stageLabel}`}/>
      <Tabs tab={tab} setTab={setTab} miniMode={!isMajor}/>
      <main style={{maxWidth:1200,margin:"0 auto",padding:"16px 18px 80px"}}>
        <EventHLTV t={t} myTeam={myTeam} nf={nf} onPlay={(fx,bo)=>beginVeto(fx,bo)} alive={alive} onOpen={setOpenMatch} onEndEvent={(t.stage==="done"||!alive)?endEvent:null} season={season} SEED={SEED} evLabel={evLabel} tierTag={tierTag} tab={tab} setTab={setTab}/>
      </main>
      {veto&&<VetoOverlay session={veto} myTeam={myTeam} t={t} onClose={()=>setVeto(null)} onResolved={(res,fx)=>{
        setVeto(null);setReveal({res,fx});
      }}/>}
      {reveal&&<MatchReveal reveal={reveal} myTeam={myTeam} t={t} onDone={()=>{
        const{res,fx}=reveal;
        fx.res=res;fx.done=true;
        // Swiss: update records
        if(t.stage==="swiss"&&t.swiss) resolveSwissFix(t.swiss,fx);
        setReveal(null);afterResult();
      }}/>}
      {openMatch&&<MatchModal m={openMatch} onClose={()=>setOpenMatch(null)}/>}
    </div>);
}

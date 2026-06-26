import { MAPS } from '../constants/data.js';
import { ACTIVITIES, RANDOM_EVENTS } from '../constants/events.js';
import { playerOvr } from './utils.js';
import { rosterOf, getMapProf, nervesModifier, isRivalMatch, recordMatch, autoVeto, mapRating, styleModifier } from './state.js';

export function resolveMap(state,map,A,B,ctx,rng,startFrom=null){
  // ── Round-by-round CS economy engine ──
  // startFrom: {scoreA,scoreB,moneyA,moneyB,lossStreakA,lossStreakB,tiltA,tiltB,side,startRound,strModA,strModB}
  // When provided, re-simulates from that mid-match state without updating stats (for interactive halftime/timeout)
  const rA=rosterOf(state,A), rB=rosterOf(state,B);
  const rival=isRivalMatch(state,A,B);

  // ── IGL tactical influence ──
  const iglOf=(t)=>{const r=rosterOf(state,t);return r.length?r.reduce((b,p)=>p.igl>b.igl?p:b,r[0]):null;};
  const iglA=iglOf(A),iglB=iglOf(B);
  let iglModA=iglA?(iglA.igl-65)/900:0;
  let iglModB=iglB?(iglB.igl-65)/900:0;

  // ── Tactical style ──
  const tacA=state.tactics?.[A]||null;
  const tacB=state.tactics?.[B]||null;
  if(tacA==="Structured") iglModA*=1.5; // Structured amplifies IGL leadership
  if(tacB==="Structured") iglModB*=1.5;
  const styleMod=styleModifier(state,A,B);
  const strA=mapRating(state,A,map)+nervesModifier(state,A,B,ctx)+(ctx.decider&&!startFrom?(rng()-0.5)*3:0)+(startFrom?.strModA||0)+styleMod;
  const strB=mapRating(state,B,map)-nervesModifier(state,A,B,ctx)+(ctx.decider&&!startFrom?(rng()-0.5)*3:0)+(startFrom?.strModB||0)-styleMod;

  // ── Tilt tracking (composure stat counters tilt) ──
  const tilt={[A]:startFrom?.tiltA??0,[B]:startFrom?.tiltB??0};
  const avgComp=(t)=>{const r=rosterOf(state,t);return r.length?r.reduce((s,p)=>s+(p.composure||p.mentality||60),0)/r.length:60;};
  const compA=avgComp(A),compB=avgComp(B);

  // Economy state per team (seeded from startFrom for re-simulations)
  const econ={
    [A]:{money:startFrom?.moneyA??800,lossStreak:startFrom?.lossStreakA??0,roundsWon:0},
    [B]:{money:startFrom?.moneyB??800,lossStreak:startFrom?.lossStreakB??0,roundsWon:0}
  };
  const LOSS_BONUS=[1400,1900,2400,2900,3400];
  const WIN_BONUS=3250;
  const FULL_BUY=4100;const FORCE_BUY=2000;
  const AWP_COST=4750;

  function buyType(team){
    const m=econ[team].money;
    if(m>=AWP_COST+500) return "awp_buy"; // full buy + AWP for best player
    if(m>=FULL_BUY) return "full";
    if(m>=FORCE_BUY) return "force";
    return "eco";
  }

  // Per-player performance for the map (enriched with new stats)
  const perfOf=(team)=>rosterOf(state,team).map(p=>{
    const staminaMod=(p.stamina||70)/100; // high stamina = less fatigue impact
    const fatigueNoise=p.fatigue>70?(p.fatigue-70)*0.15*(1-staminaMod*0.5):0;
    const spread=30*(1-p.consistency/100)+fatigueNoise;
    const spreadMult=state.tactics?.[team]==="Aggressive"?1.3:1; // Aggressive = higher variance
    const noise=(rng()-0.5)*2*spread*spreadMult;
    const moraleMod=((p.morale??60)-60)/40;
    const profBonus=state.tactics?.[team]==="Utility"?(getMapProf(state,team)[map]||50)/250:0; // Utility amplifies map knowledge
    const base=(p.aim+p.gameSense)/2+p.form+moraleMod+profBonus;
    return {name:p.name,perf:base+noise,traits:p.traits,team,aim:p.aim,role:p.role,
      rifle:p.rifle||p.aim,pistol:p.pistol||60,awp:p.awp||50,clutch:p.clutch||50,
      entry:p.entry||60,composure:p.composure||p.mentality,experience:p.experience||50,stamina:p.stamina||60};
  });
  const perfA=perfOf(A).sort((a,b)=>b.perf-a.perf);
  const perfB=perfOf(B).sort((a,b)=>b.perf-a.perf);
  const starOf=(team)=>team===A?perfA[0]:perfB[0];
  const awperOf=(team)=>{const r=team===A?perfA:perfB;return r.find(p=>p.role==="AWP")||r[0];};
  const entryOf=(team)=>{const r=team===A?perfA:perfB;return r.find(p=>p.role==="Entry")||r.sort((a,b)=>b.entry-a.entry)[0];};
  // Team-level combat averages for round resolution
  const teamCombat=(team,buyType)=>{
    const r=team===A?perfA:perfB;
    const avg=k=>r.reduce((s,p)=>s+p[k],0)/r.length;
    if(buyType==="eco") return avg("pistol")/100;
    if(buyType==="force") return (avg("pistol")*0.6+avg("rifle")*0.4)/100;
    if(buyType==="awp_buy") return (avg("rifle")*0.7+awperOf(team).awp*0.3)/100;
    return avg("rifle")/100; // full buy
  };

  const BUYMATCH={awp_buy:{awp_buy:.50,full:.55,force:.70,eco:.88},full:{awp_buy:.45,full:.50,force:.65,eco:.85},force:{awp_buy:.30,full:.35,force:.50,eco:.65},eco:{awp_buy:.12,full:.15,force:.35,eco:.50}};

  const rounds=[];
  let scoreA=startFrom?.scoreA??0;
  let scoreB=startFrom?.scoreB??0;
  let side=startFrom?.side??0;
  let prevWinner=null;

  // Track if team is choosing to save (eco to build up for full buy)
  const saving={[A]:false,[B]:false};

  function decideBuy(team){
    const m=econ[team].money;
    // After losing, teams often save 1-2 rounds to get a full buy
    // If we can't afford full buy, but saving one more round would get us there, eco
    if(m<FULL_BUY){
      const nextRoundMoney=m+LOSS_BONUS[Math.min(econ[team].lossStreak,4)];
      if(nextRoundMoney>=FULL_BUY&&m>=FORCE_BUY){
        // Could force, but saving gets us full buy next round — save
        saving[team]=true;
        return "eco";
      }
      if(m<FORCE_BUY){saving[team]=true;return "eco";}
      // Force buy if losing streak is 3+ (desperate) or if it's match point
      if(econ[team].lossStreak>=3||scoreA>=12||scoreB>=12) return "force";
      // Otherwise save
      saving[team]=true;
      return "eco";
    }
    saving[team]=false;
    if(m>=AWP_COST+500) return "awp_buy";
    return "full";
  }

  function playRound(roundNum){
    // Determine buy type (includes save logic)
    const btA=decideBuy(A), btB=decideBuy(B);

    // Deduct buy cost
    [A,B].forEach(team=>{
      const bt=team===A?btA:btB;
      if(bt==="awp_buy") econ[team].money-=4750+3*2700+1000;
      else if(bt==="full") econ[team].money-=5*2700+1500;
      else if(bt==="force") econ[team].money-=5*1500+500;
      // eco: keep money (save for next round)
      econ[team].money=Math.max(0,econ[team].money);
    });
    let pA=BUYMATCH[btA]?.[btB]??0.50;
    const combatEdge=(teamCombat(A,btA)-teamCombat(B,btB))*0.15;
    const skillEdge=(strA-strB)/120+combatEdge;
    pA=Math.max(0.05,Math.min(0.95,pA+skillEdge));
    const ctBonus=0.03;
    if(side===0) pA+=ctBonus; else pA-=ctBonus;
    if(econ[A].lossStreak===0&&scoreA>0) pA+=0.02;
    if(econ[B].lossStreak===0&&scoreB>0) pA-=0.02;
    if(rival) pA+=(rng()-0.5)*0.06;

    // IGL influence + tilt penalty + star carry
    pA+=iglModA-iglModB;
    const tiltPenA=tilt[A]>=3?(tilt[A]-2)*0.018*Math.max(0.3,1-compA/120):0;
    const tiltPenB=tilt[B]>=3?(tilt[B]-2)*0.018*Math.max(0.3,1-compB/120):0;
    pA=pA-tiltPenA+tiltPenB;
    if(perfA[0].perf>=82&&rng()<(perfA[0].perf-75)/120) pA=Math.min(0.95,pA+0.08);
    if(perfB[0].perf>=82&&rng()<(perfB[0].perf-75)/120) pA=Math.max(0.05,pA-0.08);
    if(btA==="awp_buy"){const aw=awperOf(A);const th=tacA==="AWP-Dependent"?80:85;const m=tacA==="AWP-Dependent"?1.6:1;if(aw.awp>=th)pA=Math.min(0.95,pA+(aw.awp-75)/400*m);}
    if(btB==="awp_buy"){const aw=awperOf(B);const th=tacB==="AWP-Dependent"?80:85;const m=tacB==="AWP-Dependent"?1.6:1;if(aw.awp>=th)pA=Math.max(0.05,pA-(aw.awp-75)/400*m);}
    pA=Math.max(0.05,Math.min(0.95,pA));

    const aWins=rng()<pA;
    const winner=aWins?A:B, loser=aWins?B:A;
    prevWinner=winner;
    tilt[loser]=Math.min(5,tilt[loser]+1);
    tilt[winner]=Math.max(0,tilt[winner]-1);

    econ[winner].money+=WIN_BONUS;
    econ[winner].lossStreak=0;
    const ls=Math.min(econ[loser].lossStreak,4);
    econ[loser].money+=LOSS_BONUS[ls];
    econ[loser].lossStreak++;

    if(aWins) scoreA++; else scoreB++;

    const star=starOf(winner);
    const awper=awperOf(winner);
    const entryPlayer=entryOf(winner);
    const lStar=starOf(loser);
    const bestClutcher=(t)=>{const r=t===A?perfA:perfB;return [...r].sort((a,b)=>(b.clutch||50)-(a.clutch||50))[0];};
    const clutcher=bestClutcher(winner);
    const isClutch=rng()<((clutcher.clutch||50)/100)*0.18;
    const isAce=rng()<0.04;
    const isEcoUpset=(btA==="eco"&&(btB==="full"||btB==="awp_buy")&&aWins)||(btB==="eco"&&(btA==="full"||btA==="awp_buy")&&!aWins);
    const isEntryPlay=rng()<((entryPlayer.entry||60)/100)*0.20;

    let narrative="";
    const wBuy=aWins?btA:btB, lBuy=aWins?btB:btA;

    if(isEcoUpset){
      const bestPistol=[...(aWins?perfA:perfB)].sort((a,b)=>(b.pistol||50)-(a.pistol||50))[0];
      const wpn=rng()<0.4?"Deagle":rng()<0.6?"P250":"USP";
      narrative=`ECO UPSET! ${bestPistol.name} (${bestPistol.pistol} PST) leads a ${wpn} charge`;
    } else if(isAce){
      narrative=`${star.name} ACE! Tears through all five with a ${wBuy==="awp_buy"?"AWP":"rifle"}`;
    } else if(isClutch){
      const situation=["1v2","1v3","1v1"][Math.floor(rng()*3)];
      narrative=`${clutcher.name} (${clutcher.clutch} CLT) wins a ${situation} clutch`;
    } else if(isEntryPlay){
      narrative=`${entryPlayer.name} (${entryPlayer.entry} ENT) opens with an entry frag, ${winner} convert`;
    } else if(wBuy==="awp_buy"&&rng()<0.35){
      narrative=`${awper.name} (${awper.awp} AWP) gets two picks, ${winner} clean up`;
    } else if(lBuy==="eco"||lBuy==="force"){
      if(rng()<0.4) narrative=`${winner} clean up the ${lBuy==="eco"?"eco":"force buy"}`;
      else narrative=`Sloppy from ${winner} — ${lStar.name} gets two kills but can't close it`;
    } else {
      const descs=[
        `${star.name} opens the round with a key frag, ${winner} trade out to win`,
        `Textbook execute from ${winner}, ${loser} can't retake`,
        `${winner} win a scrappy aim duel round, ${star.name} finishes with 3K`,
        `Post-plant hold from ${winner}, ${lStar.name} falls trying to defuse`,
        `Mid-round call from ${winner} catches ${loser} rotating late`,
      ];
      narrative=descs[Math.floor(rng()*descs.length)];
    }
    if(!narrative&&tilt[loser]>=4) narrative=`${loser} look tilted — ${lStar.name} can't find their footing`;
    if(!narrative&&rng()<0.22&&(aWins?iglModA>iglModB:iglModB>iglModA)){const wi=aWins?iglA:iglB;if(wi)narrative=`Tactical masterclass from ${wi.name} (${wi.igl} IGL) — ${winner} execute perfectly`;}

    rounds.push({
      round:roundNum,winner,loser,scoreA,scoreB,
      buyA:btA,buyB:btB,moneyA:econ[A].money,moneyB:econ[B].money,
      lossStreakA:econ[A].lossStreak,lossStreakB:econ[B].lossStreak,
      tiltA:tilt[A],tiltB:tilt[B],
      narrative,isClutch,isEcoUpset,isAce,
      side:side===0?"first":"second"
    });
  }

  // Regulation: first to 13, switch sides at 12 rounds
  let roundNum=startFrom?.startRound??0;
  while(scoreA<13&&scoreB<13){
    roundNum++;
    if(roundNum===13){
      side=1; // half-time: switch sides
      // Only reset economy for full simulations (startFrom handles this for re-sims)
      if(!startFrom){econ[A].money=800;econ[B].money=800;econ[A].lossStreak=0;econ[B].lossStreak=0;}
    }
    playRound(roundNum);
  }

  // Overtime (MR3: first to 16, then 19, etc.)
  while(scoreA===scoreB){
    // OT reset
    econ[A].money=16000;econ[B].money=16000;
    econ[A].lossStreak=0;econ[B].lossStreak=0;
    const target=scoreA+4; // need 4 more (MR3 = play up to 3 each side, first to +4 total)
    let otRounds=0;
    while(scoreA<target&&scoreB<target&&otRounds<6){
      roundNum++;otRounds++;
      if(otRounds===4){side=1-side;econ[A].money=16000;econ[B].money=16000;}
      playRound(roundNum);
    }
  }

  const aWon=scoreA>scoreB;
  const finalScore=aWon?[scoreA,scoreB]:[scoreB,scoreA];

  const allPerf=[...perfA,...perfB];
  const carry=aWon?perfA[0]:perfB[0];
  const anchor=aWon?perfB[perfB.length-1]:perfA[perfA.length-1];
  const triggers=[];
  // Stats only updated for full simulations (not interactive re-sims via startFrom)
  if(!startFrom){
    allPerf.forEach(pp=>{
      const st=state.stats[pp.name];if(!st)return;
      st.maps++;st.rating=(st.rating*(st.maps-1)+pp.perf/90)/st.maps;
      const c=state.career?.[pp.name];
      if(c){
        if(!c.mapStats[map])c.mapStats[map]={maps:0,wins:0,avgRating:0};
        const ms=c.mapStats[map];
        const r=pp.perf/90;
        ms.avgRating=(ms.avgRating*ms.maps+r)/(ms.maps+1);
        ms.maps++;
        if((aWon&&pp.team===A)||(!aWon&&pp.team===B)) ms.wins++;
        c.kills+=Math.round(10+pp.perf/15);
      }
    });
    if(carry.traits.includes("clutch")&&Math.min(scoreA,scoreB)>=9){const s=state.stats[carry.name];if(s)s.clutches++;}
    if(state.stats[carry.name])state.stats[carry.name].mvps++;
    if(carry.traits.includes("clutch")&&Math.min(scoreA,scoreB)>=9)triggers.push({who:carry.name,what:"clutch_carry"});
    if(carry.traits.includes("boom"))triggers.push({who:carry.name,what:"supernova"});
    if(anchor.traits.includes("boom"))triggers.push({who:anchor.name,what:"boom_bust_low"});
    if(rival)triggers.push({who:aWon?A:B,what:"rivalry_win"});
    const ecoUpsets=rounds.filter(r=>r.isEcoUpset).length;
    if(ecoUpsets>=2)triggers.push({who:aWon?A:B,what:"eco_heroes"});
  }

  return {map,winnerName:aWon?A:B,loserName:aWon?B:A,score:finalScore,pA:strA/(strA+strB),carry:carry.name,anchor:anchor.name,carryTeam:aWon?A:B,triggers,wPerf:aWon?perfA:perfB,lPerf:aWon?perfB:perfA,rival,rounds,teamA:A,teamB:B};
}

export function driftForm(state,teamA,teamB,results){
  const winner=results.filter(r=>r.winnerName===teamA).length>results.filter(r=>r.winnerName===teamB).length?teamA:teamB;
  [teamA,teamB].forEach(team=>{
    const won=team===winner;
    rosterOf(state,team).forEach(p=>{
      const shift=won?1.5+Math.random()*1.5:-(1+Math.random()*2);
      p.form=Math.max(-12,Math.min(12,p.form+shift));
      p.fatigue=Math.min(100,p.fatigue+3);
      // Experience grows from playing matches
      if(p.experience!==undefined&&p.experience<99) p.experience=Math.min(99,p.experience+(Math.random()<0.15?1:0));
    });
    if(won)state.chemistry[team]=Math.min(100,(state.chemistry[team]||70)+2);
    else state.chemistry[team]=Math.max(40,(state.chemistry[team]||70)-3);
  });
}

export function recapLine(r){
  const w=Math.max(...r.score),l=Math.min(...r.score);
  const stomp=w-l>=8,close=w-l<=3,ot=w>=14; // regulation max win is 13; OT produces 16+
  const rivalTag=r.rival?" in a heated rivalry clash":"";
  const ecoTag=r.rounds?.filter(x=>x.isEcoUpset).length>=2?" with multiple eco upsets":"";
  const flow=ot?`${r.map} went to overtime${rivalTag}`:stomp?`${r.winnerName} dominated ${r.map}${rivalTag}`:close?`${r.map} was razor-thin${rivalTag}${ecoTag}`:`${r.winnerName} took ${r.map}${rivalTag}`;
  const trig=r.triggers?.[0];
  const carryLine=trig?.what==="clutch_carry"?`${r.carry} hit every clutch when it mattered`
    :trig?.what==="supernova"?`${r.carry} went supernova on the server`
    :trig?.what==="eco_heroes"?`${r.carry} led crucial eco rounds`
    :`${r.carry} top-fragged the lobby`;
  return `${flow}, ${w}-${l}. ${carryLine}. ${r.anchor} couldn't get anything going.`;
}

export function playSeries(state,A,B,bo,ctx,rng,fixedMaps){
  const mapList=fixedMaps||autoVeto(state,A,B,bo);
  const need=bo===5?3:bo===3?2:1;
  const results=[];let aw=0,bw=0;
  for(let i=0;i<mapList.length;i++){
    const r=resolveMap(state,mapList[i],A,B,{...ctx,decider:i===mapList.length-1&&i>=2},rng);
    results.push(r);
    if(r.winnerName===A)aw++;else bw++;
    if(aw===need||bw===need)break;
  }
  driftForm(state,A,B,results);
  const winner=aw>=need?A:B,loser=aw>=need?B:A;
  recordMatch(state,winner,loser);
  return {winnerName:winner,loserName:loser,maps:results,seriesScore:[aw,bw],bo,mapList,scoreLine:bo===1?`${Math.max(...results[0].score)}-${Math.min(...results[0].score)}`:undefined};
}

// ── calendar / training ──────────────────────────────────────────────
export function applyActivity(state,team,activity,mapChoice,facilities){
  const roster=rosterOf(state,team);
  const coach=state.coach;
  const cb=coach?.bonus||null;
  const fac=facilities||{};
  const ghTier=fac.gaming_house||0;
  const bcTier=fac.bootcamp_center||0;
  const psTier=fac.psychologist||0;
  const anTier=fac.analytics||0;
  const mbTier=fac.medbay||0;
  // Fatigue: coach + gaming house reduce gain
  const ghBonus=[0,2,4,6][ghTier]||0;
  const mbBonus=(activity==="rest"||activity==="vacation")?([0,5,8][mbTier]||0):0;
  const fatMod=cb==="fitness"&&(activity==="rest"||activity==="vacation")?-5:cb==="motivator"?-3:0;
  roster.forEach(p=>{
    p.fatigue=Math.max(0,Math.min(100,p.fatigue+(ACTIVITIES[activity]?.fatigue||0)+fatMod-ghBonus-mbBonus));
  });
  if(activity==="practice"&&mapChoice){
    const prof=getMapProf(state,team);
    const profGain=4+(cb==="analyst"?2:0)+(cb==="tactical"?1:0)+(bcTier>=3?2:0);
    prof[mapChoice]=Math.min(95,(prof[mapChoice]||50)+profGain);
  } else if(activity==="bootcamp"){
    const bcExtra=[0,1,2,3][bcTier]||0;
    roster.forEach(p=>{
      const gain=()=>1+(bcExtra>0?1:0)+(Math.random()|0);
      p.aim=Math.min(99,p.aim+gain());p.gameSense=Math.min(99,p.gameSense+gain()+(cb==="tactical"?1:0));
      p.util=Math.min(99,p.util+gain());
      p.rifle=Math.min(99,(p.rifle||70)+gain());
      p.entry=Math.min(99,(p.entry||60)+gain());
      if(cb==="veteran"){p.mentality=Math.min(99,p.mentality+1);p.composure=Math.min(99,(p.composure||60)+1);}
      if(cb==="fitness"){p.consistency=Math.min(99,p.consistency+1);p.stamina=Math.min(99,(p.stamina||60)+1);}
      if(psTier>=1){p.composure=Math.min(99,(p.composure||60)+1);}
    });
  } else if(activity==="scrim"){
    roster.forEach(p=>{
      p.form=Math.max(-12,Math.min(12,p.form+1+Math.random()));
      // Scrims develop clutch and AWP slightly
      if(Math.random()<0.3) p.clutch=Math.min(99,(p.clutch||50)+1);
      if(Math.random()<0.2&&p.role==="AWP") p.awp=Math.min(99,(p.awp||50)+1);
      if(Math.random()<0.2) p.pistol=Math.min(99,(p.pistol||50)+1);
    });
    state.chemistry[team]=Math.min(100,(state.chemistry[team]||70)+2+(cb==="motivator"?2:0));
  } else if(activity==="vod"){
    const anExtra=anTier>=2?2:anTier>=1?1:0;
    roster.forEach(p=>{
      p.gameSense=Math.min(99,p.gameSense+1+anExtra);p.util=Math.min(99,p.util+1);
    });
  } else if(activity==="rest"){
    // fatigue already handled above
  } else if(activity==="vacation"){
    state.chemistry[team]=Math.min(100,(state.chemistry[team]||70)+3);
    roster.forEach(p=>{p.form=p.form*0.7;});
  }
  // age-based career peaks and decline per week
  roster.forEach(p=>{
    const age=p.age;
    if(age<=21){
      if(Math.random()<0.22){const sk=["aim","gameSense","util","mentality"][Math.random()*4|0];p[sk]=Math.min(99,p[sk]+1);}
      if(Math.random()<0.04){const sk=["consistency","composure"][Math.random()*2|0];p[sk]=Math.max(30,(p[sk]||60)-1);}
    } else if(age<=26){
      if(Math.random()<0.10){const sk=["gameSense","util","mentality","experience"][Math.random()*4|0];p[sk]=Math.min(99,(p[sk]||50)+1);}
      if(Math.random()<0.04){p.aim=Math.min(99,p.aim+1);}
    } else if(age<=29){
      if(Math.random()<0.05){p.experience=Math.min(99,(p.experience||50)+1);}
      if(Math.random()<0.08){p.aim=Math.max(40,p.aim-1);}
    } else if(age<=32){
      if(Math.random()<0.13){p.aim=Math.max(40,p.aim-1);}
      if(Math.random()<0.08){p.stamina=Math.max(30,(p.stamina||60)-1);}
      if(Math.random()<0.05){p.experience=Math.min(99,(p.experience||50)+1);}
    } else {
      if(Math.random()<0.20){const sk=["aim","stamina"][Math.random()*2|0];p[sk]=Math.max(25,(p[sk]||50)-1);}
      if(Math.random()<0.10){p.consistency=Math.max(25,p.consistency-1);}
    }
  });
  // Morale drift: slow regression toward 60, boosted by rest/scrim
  roster.forEach(p=>{
    const cur=p.morale??60;
    let delta=(60-cur)*0.05;
    if(activity==="rest"||activity==="vacation") delta+=3;
    else if(activity==="scrim") delta+=1;
    else if(activity==="bootcamp") delta-=1;
    p.morale=Math.max(5,Math.min(100,Math.round(cur+delta)));
  });
  // Low-morale leaders erode team chemistry
  const lowMoraleLeaders=roster.filter(p=>(p.morale??60)<45&&(p.traits.includes("leader")||p.igl>=88));
  if(lowMoraleLeaders.length>0){
    state.chemistry[team]=Math.max(30,(state.chemistry[team]||70)-lowMoraleLeaders.length);
  }
}

export function rollRandomEvent(state,team){
  const totalWeight=RANDOM_EVENTS.reduce((s,e)=>s+e.weight,0);
  let roll=Math.random()*totalWeight;
  for(const ev of RANDOM_EVENTS){
    roll-=ev.weight;
    if(roll<=0) return ev.apply(state,team,Math.random);
  }
  return null;
}
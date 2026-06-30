import { MAPS, AI_TEAMS, PLAYERS_INIT, RESERVE_MAPS } from '../constants/data.js';
import { SEASON_WEEKS, TUNING } from '../constants/events.js';
import { playerOvr, marketValue, desiredSalary } from './utils.js';
import { computeValveRankings, prizeForPlace } from './valveRanking.js';

export function initState(eras){
  const activeEras=eras||["current"];
  const clamp=(v,lo=30,hi=99)=>Math.max(lo,Math.min(hi,Math.round(v)));
  let filtered=PLAYERS_INIT.filter(p=>activeEras.includes(p.era||"current"));
  // Deduplicate: if same base name exists across eras, prefer ★ (prime) version
  const seen={};
  const deduped=[];
  // Sort: ★ first, then by OVR desc — so ★ version wins dedup
  filtered.sort((a,b)=>{
    const aLegend=a.name.includes("★")?1:0;
    const bLegend=b.name.includes("★")?1:0;
    if(bLegend!==aLegend) return bLegend-aLegend; // legends first
    const ovrA=0.40*a.aim+0.25*a.gameSense+0.20*a.util+0.10*a.igl+0.05*a.mentality;
    const ovrB=0.40*b.aim+0.25*b.gameSense+0.20*b.util+0.10*b.igl+0.05*b.mentality;
    return ovrB-ovrA;
  });
  for(const p of filtered){
    // Strip ★ and trailing digits (Snax2 → Snax, HooXi2 → HooXi are DIFFERENT players, keep them)
    // Only deduplicate if the ★ stripped name matches exactly (no numeric suffix)
    const baseName=p.name.endsWith("★")?p.name.slice(0,-1).trim():p.name.replace("★","").trim();
    // If baseName has a trailing digit that the pair doesn't (e.g. Snax vs Snax★), deduplicate
    // If it's something like HooXi2 (internal disambiguation), keep it
    const key=baseName.replace(/\d+$/,"");
    const isInternalDupe=p.name.match(/\d+$/); // HooXi2, Spinx2 etc
    const dedupeKey=isInternalDupe?p.name:key;
    if(!seen[dedupeKey]){seen[dedupeKey]=true;deduped.push(p);}
  }
  const players=deduped.map(p=>{
    const rng=()=>Math.random()*10-5; // ±5 noise
    // Contracts are now WEEKS remaining. Convert the authored event-count into a
    // 1–3 year deal, staggered so the whole league doesn't expire on the same week.
    const contractWeeks=Math.max(16,(p.contract||2)*52-Math.floor(Math.random()*44));
    return{...p,form:0,fatigue:20+Math.random()*20|0,contract:contractWeeks,injury:null,
      // Derived combat stats
      rifle:  clamp(p.aim*0.65+p.consistency*0.35+rng()),
      pistol: clamp(p.aim*0.45+p.mentality*0.3+p.gameSense*0.25+rng()),
      awp:    clamp(p.role==="AWP"?p.aim*0.8+p.mentality*0.2+rng()*0.5 : p.aim*0.4+p.gameSense*0.2+rng()),
      clutch: clamp(p.traits.includes("clutch")?p.gameSense*0.5+p.mentality*0.5+10+rng() : p.gameSense*0.4+p.mentality*0.35+p.aim*0.25+rng()),
      entry:  clamp(p.role==="Entry"?p.aim*0.7+p.mentality*0.3+8+rng() : p.aim*0.5+p.mentality*0.25+p.gameSense*0.25+rng()),
      // Derived mental/physical stats
      stamina:    clamp(p.consistency*0.4+p.mentality*0.3+(p.age<=25?15:p.age>=30?-5:5)+rng()),
      composure:  clamp(p.mentality*0.6+p.consistency*0.2+p.gameSense*0.2+rng()),
      experience: clamp(Math.min(99, 30+p.age*2+(p.traits.includes("leader")?10:0)+rng())),
    };
  });
  // Second pass: enforce a salary floor (stars earn star money) + init morale
  players.forEach(p=>{
    p.salary=Math.max(p.salary||0,desiredSalary(p));
    const mv=marketValue(p);
    const payFactor=p.salary>=mv*0.90?3:p.salary>=mv*0.70?0:-5;
    p.morale=Math.max(30,Math.min(90,Math.round(65+(p.mentality-70)*0.3+payFactor+(Math.random()*16-8))));
  });

  const chemistry={};
  AI_TEAMS.forEach(t=>{chemistry[t]=70;});
  const momentum={};
  AI_TEAMS.forEach(t=>{momentum[t]=0;});
  const stats={};
  const career={};
  players.forEach(p=>{
    stats[p.name]={maps:0,rating:0,mvps:0,clutches:0};
    career[p.name]={
      totalMaps:0,totalMvps:0,totalClutches:0,avgRating:0,bestRating:0,
      eventHistory:[], // [{eventNum,maps,rating,mvps,clutches}]
      mapStats:{}, // {mapName:{maps:0,wins:0,avgRating:0}}
      origStats:{aim:p.aim,gameSense:p.gameSense,util:p.util,igl:p.igl,mentality:p.mentality,consistency:p.consistency,rifle:p.rifle,pistol:p.pistol,awp:p.awp,clutch:p.clutch,entry:p.entry,stamina:p.stamina,composure:p.composure,experience:p.experience},
      kills:0 // approximate total frags
    };
  });
  const mapProf={};
  [...AI_TEAMS,"FA"].forEach(t=>{mapProf[t]=profileFor(t);});
  const rivalries={};
  const rankings={};

  // Seed with fictional 2025 Major results so AI teams start differentiated.
  // Placements roughly follow initial ranking order: top teams placed higher.
  const priorPrizeTable={1:500,2:300,4:180,8:100,9:50,16:30};
  // First 15 = existing circuit teams; next 16 = new entrants that only scraped last-place finishes
  const priorPlaces=[1,2,4,4,8,8,8,8,9,9,9,16,16,16,16, 16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16];
  const matchLog=[];
  const prizeLog=[];
  AI_TEAMS.forEach((t,i)=>{
    const place=priorPlaces[Math.min(i,priorPlaces.length-1)];
    prizeLog.push({team:t,amount:prizeForPlace(priorPrizeTable,place),week:41,year:2025,prizePool:500});
  });
  // Also seed a prior A-tier for more granularity among mid-tier teams
  const priorATable={1:200,2:100,4:50,8:30};
  const priorAPlaces=[1,2,2,4,4,4,4,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8];
  AI_TEAMS.forEach((t,i)=>{
    const place=priorAPlaces[Math.min(i,priorAPlaces.length-1)];
    prizeLog.push({team:t,amount:prizeForPlace(priorATable,place),week:30,year:2025,prizePool:200});
  });
  computeValveRankings({rankings,matchLog,prizeLog,valveBounty:{}},1,2026);

  // If current era is not active, AI teams have no players — auto-assign from FA pool
  if(!activeEras.includes("current")){
    const reserveForUser=10;
    const totalFA=players.filter(p=>p.team==="FA").length;
    const maxAssign=Math.max(0,totalFA-reserveForUser);
    let assigned=0;
    for(const team of AI_TEAMS){
      if(assigned>=maxAssign) break;
      let count=0;
      for(const p of players){
        if(p.team!=="FA"||count>=5||assigned>=maxAssign) continue;
        p.team=team;p.contract=104;
        count++;assigned++;
      }
    }
  }

  // Auto-assign AI team tactical styles from roster composition
  const tactics={};
  AI_TEAMS.forEach(team=>{
    const r=players.filter(p=>p.team===team);
    const hasEliteAWP=r.some(p=>p.role==="AWP"&&(p.awp||50)>=85);
    const hasEliteIGL=r.some(p=>p.igl>=88);
    const highAimEntries=r.filter(p=>p.role==="Entry"&&p.aim>=88).length;
    if(hasEliteAWP&&!hasEliteIGL) tactics[team]="AWP-Dependent";
    else if(hasEliteIGL) tactics[team]="Structured";
    else if(highAimEntries>=2) tactics[team]="Aggressive";
    else tactics[team]="Utility";
  });

  const mapPool=[...MAPS];
  const activePool={};

  return {players,chemistry,momentum,stats,career,mapProf,rivalries,rankings,matchLog,prizeLog,valveBounty:{},coach:null,pendingBonus:null,tactics,mapPool,activePool};
}

export function rosterOf(state,team){return state.players.filter(p=>p.team===team);}
export function freeAgents(state){return state.players.filter(p=>p.team==="FA");}
export function currentMapPool(state){return state.mapPool&&state.mapPool.length?state.mapPool:[...MAPS];}
export function teamActivePool(state,team){return state.activePool?.[team]||null;}

export function teamBase(state,team){
  const r=rosterOf(state,team);
  if(r.length===0) return 0;
  const mean=k=>r.reduce((s,p)=>s+p[k],0)/r.length;
  const igl=r.reduce((b,p)=>p.igl>b.igl?p:b,r[0]);
  const core=0.45*mean("aim")+0.25*mean("gameSense")+0.20*mean("util")+0.10*igl.igl;
  const formAdj=mean("form");
  const chem=(state.chemistry[team]||70)/100;
  // fatigue penalty: avg fatigue over 50 reduces effective rating
  const avgFatigue=mean("fatigue");
  const fatiguePenalty=avgFatigue>50?(avgFatigue-50)*0.08:0;
  // Recent competitive momentum nudges effective rating (±~3 at the extremes).
  const momentumAdj=(state.momentum?.[team]||0)*0.6;
  // Injuries directly sap the team's effective strength — each carried injury
  // subtracts its severity, so playing hurt is a real, felt penalty.
  const injuryPenalty=r.reduce((s,p)=>s+(p.injury?p.injury.sev:0),0);
  return core*(0.85+TUNING.SYNERGY*chem)+formAdj+momentumAdj-fatiguePenalty-injuryPenalty;
}

// ── Injuries ─────────────────────────────────────────────────────────
// Injury severity → effective-rating penalty (points) and recovery weeks.
export const INJURY_TYPES=[
  {kind:"wrist strain",   sev:2, minWk:1, maxWk:2},
  {kind:"back tightness", sev:3, minWk:2, maxWk:3},
  {kind:"hand injury",    sev:4, minWk:3, maxWk:5},
  {kind:"illness",        sev:3, minWk:1, maxWk:3},
  {kind:"shoulder injury",sev:6, minWk:5, maxWk:9},
];
export function rollInjury(rng=Math.random){
  const t=INJURY_TYPES[Math.floor(rng()*INJURY_TYPES.length)];
  const weeks=t.minWk+Math.floor(rng()*(t.maxWk-t.minWk+1));
  return {kind:t.kind,sev:t.sev,weeks,total:weeks};
}
// Weekly recovery + (low) chance of a new injury, driven by fatigue and the
// intensity of the week's activity. Medbay facility cushions both. Mutates the
// roster in place; returns a log string when something changes, else null.
export function tickInjuries(state,team,activity,facilities,rng=Math.random){
  const roster=rosterOf(state,team);
  const mbTier=facilities?.medbay||0;
  let healed=null,hurt=null;
  roster.forEach(p=>{
    if(p.injury){
      // Rest / medical care speeds recovery.
      const heal=(activity==="rest"||activity==="vacation"?2:1)+(mbTier>=1?1:0);
      p.injury.weeks-=heal;
      if(p.injury.weeks<=0){const k=p.injury.kind;p.injury=null;if(!healed)healed=`[+] ${p.name} recovered from ${k}`;}
      return;
    }
    // Injury risk: baseline from intensive sessions, amplified by fatigue.
    const intensity=activity==="bootcamp"?1.6:activity==="scrim"?1.2:activity==="practice"?0.9:0.3;
    const fatigueRisk=Math.max(0,(p.fatigue-55))/100; // 0 below 55, ramps after
    let chance=(0.010+fatigueRisk*0.05)*intensity;
    if(mbTier>=2) chance*=0.35;       // elite medical bay: strong prevention
    else if(mbTier>=1) chance*=0.6;
    if(rng()<chance){p.injury=rollInjury(rng);if(!hurt)hurt=`[!] ${p.name} picked up a ${p.injury.kind} — out ~${p.injury.weeks}wk`;}
  });
  return hurt||healed;
}

// ── Momentum ─────────────────────────────────────────────────────────
export function momentumOf(state,team){return state.momentum?.[team]||0;}

export function profileFor(team,pool){
  let s=0;for(const c of team)s=(s*31+c.charCodeAt(0))>>>0;
  const rng=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  const maps=pool||MAPS;
  const p={};maps.forEach(m=>{p[m]=Math.round(45+rng()*50);});return p;
}

export function getMapProf(state,team){
  if(!state.mapProf[team]) state.mapProf[team]=profileFor(team);
  return state.mapProf[team];
}

export function mapRating(state,team,map){
  return teamBase(state,team)*(0.70+0.006*(getMapProf(state,team)[map]||50));
}

// ── rivalries ────────────────────────────────────────────────────────
export function rivalryKey(a,b){return [a,b].sort().join("|");}
export function getRivalry(state,a,b){return state.rivalries[rivalryKey(a,b)]||null;}
export function recordMatch(state,winner,loser){
  const k=rivalryKey(winner,loser);
  if(!state.rivalries[k]) state.rivalries[k]={wins:{},matches:0,isRival:false};
  const r=state.rivalries[k];
  r.matches++;
  r.wins[winner]=(r.wins[winner]||0)+1;
  // rival after 3+ meetings with 2+ wins for one side
  if(r.matches>=3){
    const vals=Object.values(r.wins);
    if(vals.some(v=>v>=2)) r.isRival=true;
  }
}
export function isRivalMatch(state,a,b){const r=getRivalry(state,a,b);return r&&r.isRival;}

export function nervesModifier(state,A,B,ctx){
  const rOf=t=>rosterOf(state,t);
  const compA=rOf(A).reduce((s,p)=>s+(p.composure||p.mentality),0)/(rOf(A).length||1);
  const compB=rOf(B).reduce((s,p)=>s+(p.composure||p.mentality),0)/(rOf(B).length||1);
  const expA=rOf(A).reduce((s,p)=>s+(p.experience||50),0)/(rOf(A).length||1);
  const expB=rOf(B).reduce((s,p)=>s+(p.experience||50),0)/(rOf(B).length||1);
  const pressure={group:0.05,qf:0.12,sf:0.18,final:0.28}[ctx.stage]||0.08;
  let mod=(compA-compB)*pressure;
  // experience helps on big stages
  mod+=(expA-expB)*pressure*0.3;
  if(isRivalMatch(state,A,B)) mod+=(Math.random()-0.5)*3;
  return mod;
}

// ── Tactical styles ──────────────────────────────────────────────────
// Matchup cycle: Aggressive → beats Utility → AWP-Dependent → Structured → Aggressive
const STYLE_BEATS={"Aggressive":"Utility","Utility":"AWP-Dependent","AWP-Dependent":"Structured","Structured":"Aggressive"};
export const TACTICS_INFO={
  "Aggressive":{desc:"High-variance T-side rushes. +30% perf variance, beats Utility.",fatigue:"+2/match",beats:"Utility",icon:"A"},
  "Utility":{desc:"Map knowledge wins rounds. Map prof bonus, beats AWP-Dependent.",fatigue:"normal",beats:"AWP-Dependent",icon:"U"},
  "AWP-Dependent":{desc:"Build around your AWPer. AWP bonus ×1.6, beats Structured.",fatigue:"normal",beats:"Structured",icon:"W"},
  "Structured":{desc:"IGL-led discipline. IGL influence ×1.5, lower variance, beats Aggressive.",fatigue:"normal",beats:"Aggressive",icon:"S"},
};
export function styleModifier(state,A,B){
  const tA=state.tactics?.[A]||null,tB=state.tactics?.[B]||null;
  if(!tA||!tB||tA===tB) return 0;
  if(STYLE_BEATS[tA]===tB) return 4;  // ~3% win-rate swing via skillEdge
  if(STYLE_BEATS[tB]===tA) return -4;
  return 0;
}

// ── Team Dynamics ────────────────────────────────────────────────────
export function hierarchyTier(p,roster){
  const isLeader=p.mentality>=88&&(p.experience||50)>=65&&(p.traits.includes("leader")||p.igl>=88);
  const maxOvr=roster.length?Math.max(...roster.map(x=>playerOvr(x))):0;
  const isStar=playerOvr(p)>=maxOvr-4;
  const isProspect=p.age<=21;
  if(isLeader) return "Leader";
  if(isStar)   return "Star";
  if(isProspect) return "Prospect";
  return "Player";
}

export function updateMorale(state,myTeam,place){
  const roster=rosterOf(state,myTeam);
  const resultBonus=place===1?12:place===2?7:place<=4?3:place<=8?0:-5;
  const chem=state.chemistry[myTeam]||70;
  const chemFactor=chem>=80?2:chem>=60?0:-3;
  roster.forEach(p=>{
    const mv=marketValue(p);
    const payFactor=p.salary>=mv*0.90?2:p.salary>=mv*0.70?-2:-5;
    // High mentality = smaller swings (mental resilience)
    const mentMod=0.5+(100-(p.mentality||70))/100*0.5;
    const delta=(resultBonus+payFactor+chemFactor)*mentMod;
    p.morale=Math.max(5,Math.min(100,Math.round((p.morale||60)+delta)));
  });
}

export function autoVeto(state,A,B,bo){
  let rem=[...currentMapPool(state)];
  const steps=bo===5
    ?[[A,"ban"],[B,"ban"],[A,"pick"],[B,"pick"],[A,"pick"],[B,"pick"]]
    :[[A,"ban"],[B,"ban"],[A,"pick"],[B,"pick"],[A,"ban"],[B,"ban"]];
  const picks=[];
  for(const[me,action]of steps){
    const opp=me===A?B:A;
    let best=rem[0],bestVal=-Infinity;
    for(const m of rem){const v=action==="ban"?(mapRating(state,opp,m)-mapRating(state,me,m)):(mapRating(state,me,m)-mapRating(state,opp,m));if(v>bestVal){bestVal=v;best=m;}}
    rem=rem.filter(m=>m!==best);
    if(action==="pick")picks.push(best);
  }
  picks.push(rem[0]);
  return picks;
}

// ── Map Pool Management ─────────────────────────────────────────────
export function rotateMapPool(state,rng){
  const pool=currentMapPool(state);
  const dropIdx=Math.floor((rng||Math.random)()*pool.length);
  const dropped=pool[dropIdx];
  const available=(RESERVE_MAPS||[]).filter(m=>!pool.includes(m));
  if(!available.length) return null;
  const newMap=available[Math.floor((rng||Math.random)()*available.length)];
  const newPool=pool.filter(m=>m!==dropped);
  newPool.push(newMap);
  state.mapPool=newPool;
  // Init proficiency for the new map across all teams
  const allTeams=Object.keys(state.mapProf);
  allTeams.forEach(t=>{
    if(state.mapProf[t]){
      state.mapProf[t][newMap]=Math.round(35+Math.random()*15);
      delete state.mapProf[t][dropped];
    }
  });
  // Remove dropped map from any active pools
  if(state.activePool){
    Object.keys(state.activePool).forEach(t=>{
      const ap=state.activePool[t];
      if(ap){
        state.activePool[t]=ap.filter(m=>m!==dropped);
        if(!state.activePool[t].includes(newMap)&&state.activePool[t].length<3){
          state.activePool[t].push(newMap);
        }
      }
    });
  }
  return {dropped,newMap};
}

export function decayMapProf(state,team){
  const pool=currentMapPool(state);
  const active=teamActivePool(state,team);
  if(!active||!active.length) return;
  const prof=getMapProf(state,team);
  pool.forEach(m=>{
    if(!active.includes(m)){
      prof[m]=Math.max(30,(prof[m]||50)-2);
    }
  });
}

export function setActivePool(state,team,maps){
  if(!state.activePool) state.activePool={};
  state.activePool[team]=maps.slice(0,5);
}

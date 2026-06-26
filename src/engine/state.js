import { MAPS, AI_TEAMS, PLAYERS_INIT } from '../constants/data.js';
import { SEASON_WEEKS, TUNING } from '../constants/events.js';
import { playerOvr, marketValue, recomputeRankings } from './utils.js';

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
    return{...p,form:0,fatigue:20+Math.random()*20|0,
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
  // Second pass: initialize morale (needs derived stats for marketValue)
  players.forEach(p=>{
    const mv=marketValue(p);
    const payFactor=p.salary>=mv*0.90?3:p.salary>=mv*0.70?0:-5;
    p.morale=Math.max(30,Math.min(90,Math.round(65+(p.mentality-70)*0.3+payFactor+(Math.random()*16-8))));
  });

  const chemistry={};
  AI_TEAMS.forEach(t=>{chemistry[t]=70;});
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
  // Seed AI teams with fictional prior-season results (2025 Major, decays to 50% by 2026/w1)
  const rankLog=AI_TEAMS.map((t,i)=>({
    team:t, rawPts:2000-i*100, week:1, year:2025, tier:"Major", label:"Prior Season"
  }));
  recomputeRankings({rankings,rankLog},1,2026);

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
        p.team=team;p.contract=2;
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

  return {players,chemistry,stats,career,mapProf,rivalries,rankings,rankLog,coach:null,pendingBonus:null,tactics};
}

export function rosterOf(state,team){return state.players.filter(p=>p.team===team);}
export function freeAgents(state){return state.players.filter(p=>p.team==="FA");}

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
  return core*(0.85+TUNING.SYNERGY*chem)+formAdj-fatiguePenalty;
}

export function profileFor(team){
  let s=0;for(const c of team)s=(s*31+c.charCodeAt(0))>>>0;
  const rng=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  const p={};MAPS.forEach(m=>{p[m]=Math.round(45+rng()*50);});return p;
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
  let rem=[...MAPS];
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

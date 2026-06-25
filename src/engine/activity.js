import { AI_TEAMS, MAPS } from '../constants/data.js';
import { ACTIVITIES, EVENTS } from '../constants/events.js';
import { playerOvr } from './utils.js';
import { rosterOf, getMapProf } from './state.js';
import { getTeamOrder } from './player.js';
import { applyActivity, rollRandomEvent } from './match.js';

export function generateProspect(year){
  const roles=["IGL","AWP","Entry","Lurk","Support"];
  const role=roles[Math.floor(Math.random()*roles.length)];
  const firstNames=["kai","luka","nyx","rio","axel","zeno","mars","dex","finn","koda","jett","sage","raze","sova","omen"];
  const name=firstNames[Math.floor(Math.random()*firstNames.length)]+(year-2025)+"x"+Math.floor(Math.random()*99);
  const talent=40+Math.floor(Math.random()*30); // base talent 40-70
  const age=16+Math.floor(Math.random()*2);
  return{team:"ACADEMY",name,role,aim:talent+Math.floor(Math.random()*15),gameSense:talent+Math.floor(Math.random()*10),util:talent+Math.floor(Math.random()*10),igl:role==="IGL"?talent+15:talent-10,mentality:40+Math.floor(Math.random()*25),consistency:35+Math.floor(Math.random()*25),traits:Math.random()<0.15?["boom"]:Math.random()<0.08?["clutch"]:[],salary:5+Math.floor(Math.random()*3),contract:0,age,era:"current",form:0,fatigue:5,
    rifle:talent+Math.floor(Math.random()*12),pistol:talent+Math.floor(Math.random()*10),awp:role==="AWP"?talent+12:talent-8,clutch:35+Math.floor(Math.random()*20),entry:role==="Entry"?talent+12:talent,stamina:55+Math.floor(Math.random()*20),composure:35+Math.floor(Math.random()*20),experience:25+Math.floor(Math.random()*10),
    weeksInAcademy:0};
}

export function developProspect(p){
  p.weeksInAcademy=(p.weeksInAcademy||0)+1;
  // Develop monthly (every 4 weeks)
  if(p.weeksInAcademy%4!==0) return;
  const gain=()=>Math.random()<0.5?1:0;
  p.aim=Math.min(85,p.aim+gain());p.gameSense=Math.min(85,p.gameSense+gain());
  p.rifle=Math.min(85,(p.rifle||50)+gain());p.pistol=Math.min(80,(p.pistol||45)+gain());
  p.entry=Math.min(80,(p.entry||45)+gain());p.clutch=Math.min(75,(p.clutch||35)+gain());
  p.composure=Math.min(70,(p.composure||35)+gain());p.experience=Math.min(60,(p.experience||25)+gain());
}

export function autoSimWeeks(state,team,fromWeek,toWeek){
  // Auto-manage weeks: smart activity selection + random events
  const log=[];
  for(let w=fromWeek;w<toWeek;w++){
    const roster=rosterOf(state,team);
    const avgFat=roster.length?roster.reduce((s,p)=>s+p.fatigue,0)/roster.length:0;
    const nextEv=EVENTS.find(e=>e.week>w);
    const weeksToEvent=nextEv?nextEv.week-w:99;
    // Smart activity: rest if tired, train if event is close, otherwise mix
    let act,mc=null;
    if(avgFat>70) act="rest";
    else if(avgFat>55&&weeksToEvent>2) act="rest";
    else if(weeksToEvent<=2&&avgFat>40) act="rest"; // taper before event
    else if(weeksToEvent<=3) act=Math.random()<0.5?"scrim":"vod"; // light prep
    else act=["practice","bootcamp","scrim","vod"][Math.floor(Math.random()*4)];
    if(act==="practice") mc=MAPS[Math.floor(Math.random()*MAPS.length)];
    applyActivity(state,team,act,mc);
    aiWeekActivity(state);
    const evMsg=rollRandomEvent(state,team);
    log.push({week:w,activity:act,mapChoice:mc,event:evMsg||null});
  }
  return log;
}

export function aiWeekActivity(state){
  // AI teams auto-manage each week
  AI_TEAMS.forEach(team=>{
    const roster=rosterOf(state,team);
    if(roster.length===0) return;
    const avgFat=roster.reduce((s,p)=>s+p.fatigue,0)/roster.length;
    let act;
    if(avgFat>75) act="rest";
    else if(avgFat>60) act=Math.random()<0.5?"rest":"vod";
    else act=["practice","bootcamp","scrim","vod"][Math.random()*4|0];
    const mapChoice=act==="practice"?MAPS[Math.random()*MAPS.length|0]:null;
    applyActivity(state,team,act,mapChoice);
  });
}

// ── tournament structure ─────────────────────────────────────────────
export function snapshotEventStats(simState,eventNum){
  Object.entries(simState.stats).forEach(([name,s])=>{
    if(s.maps===0)return;
    const c=simState.career?.[name];
    if(!c)return;
    c.eventHistory.push({eventNum,maps:s.maps,rating:+s.rating.toFixed(3),mvps:s.mvps,clutches:s.clutches});
    c.totalMaps+=s.maps;c.totalMvps+=s.mvps;c.totalClutches+=s.clutches;
    c.avgRating=c.eventHistory.length>0?c.eventHistory.reduce((a,e)=>a+e.rating,0)/c.eventHistory.length:0;
    if(s.rating>c.bestRating)c.bestRating=+s.rating.toFixed(3);
  });
}

export function buildGroups(myTeam,simState){
  let order=getTeamOrder(myTeam,simState);
  // Need exactly 16 for 4 groups of 4; if fewer, pad with existing teams or truncate
  while(order.length<16){order.push(order[order.length-1]||myTeam);} // shouldn't happen with current era
  order=order.slice(0,16);
  const g=[[],[],[],[]];
  order.forEach((t,i)=>{const r=Math.floor(i/4),c=i%4;g[r%2===0?c:3-c].push(t);});
  return g;
}
export function standingsOf(table){return Object.values(table).sort((a,b)=>b.w-a.w||b.rd-a.rd);}

// ── Swiss System Engine ──────────────────────────────────────────────
// 3W=advance, 3L=eliminated. Bo1 for 0-0/1-0/0-1, Bo3 for 2-X or X-2 (elim/adv matches)
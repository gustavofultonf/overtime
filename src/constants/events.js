import { rosterOf } from '../engine/state.js';

export const TUNING = { D: 27, SYNERGY: 0.30 };
export const DRAFT_BUDGET = 780;
export const SEASON_WEEKS = 52;

export function seasonStart(year){return new Date(`${year}-01-06`);} // First Monday
export function weekToDate(week,year){
  const d=new Date(seasonStart(year||2026));
  d.setDate(d.getDate()+(week-1)*7);
  return d;
}
export function weekToLabel(week,year){
  const d=weekToDate(week,year||2026);
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}
export function weekToMonth(week){
  return weekToDate(week).getMonth(); // 0-11
}
export function weekToYear(week){
  return weekToDate(week).getFullYear();
}

// Which weeks are salary paydays (1st of each month approx — first week of each month)
export function isSalaryWeek(week){
  if(week===1) return true;
  const prev=weekToMonth(week-1);
  const curr=weekToMonth(week);
  return curr!==prev; // month changed
}

// Real CS 2026 calendar (approximate real schedule)
export const EVENTS = [
  {week:4, tier:"B", label:"DreamHack Open",     location:"Leipzig", teams:8,  bo:1, prize:{1:80,2:40,3:25,4:25,5:10}},
  {week:7, tier:"A", label:"IEM Katowice",        location:"Katowice",teams:8,  bo:3, prize:{1:200,2:100,3:50,4:30,5:15}},
  {week:13,tier:"B", label:"BLAST Bounty",        location:"Online",  teams:8,  bo:1, prize:{1:80,2:40,3:25,4:25,5:10}},
  {week:18,tier:"Major",label:"PGL SHANGHAI MAJOR",location:"Shanghai",teams:16,bo:0, prize:{1:500,2:300,4:180,8:100,12:50,16:30}},
  {week:24,tier:"B", label:"ESL Challenger",      location:"Malta",   teams:8,  bo:1, prize:{1:80,2:40,3:25,4:25,5:10}},
  {week:30,tier:"A", label:"ESL Pro League S22",  location:"Malta",   teams:8,  bo:3, prize:{1:200,2:100,3:50,4:30,5:15}},
  {week:35,tier:"B", label:"Elisa Masters",       location:"Helsinki",teams:8,  bo:1, prize:{1:80,2:40,3:25,4:25,5:10}},
  {week:41,tier:"Major",label:"BLAST FALL MAJOR", location:"Copenhagen",teams:16,bo:0,prize:{1:500,2:300,4:180,8:100,12:50,16:30}},
  {week:48,tier:"A", label:"BLAST Premier Finals",location:"Abu Dhabi",teams:8, bo:3, prize:{1:200,2:100,3:50,4:30,5:15}},
];
export const MAJOR_WEEKS = EVENTS.filter(e=>e.tier==="Major").map(e=>e.week);
export const EVENT_WEEKS = EVENTS.map(e=>e.week);

// Monthly salary paydays in 2026 (week numbers when salary is due)
export const SALARY_WEEKS = Array.from({length:SEASON_WEEKS},(_,i)=>i+1).filter(isSalaryWeek);

export const ACTIVITIES = {
  practice: {label:"practice",desc:"drill a specific map. +4 map proficiency, +8 fatigue.",fatigue:8,icon:"p"},
  bootcamp: {label:"bootcamp",desc:"intensive training. All stats gain +1-2, +15 fatigue.",fatigue:15,icon:"t"},
  scrim:    {label:"scrim",desc:"practice match vs AI team. Form +1-2, chemistry +2, +10 fatigue.",fatigue:10,icon:"s"},
  vod:      {label:"vod review",desc:"study demos. Game sense & util +1, +5 fatigue.",fatigue:5,icon:"v"},
  scout:    {label:"scout rival",desc:"study a specific team. Get intel on their map pool and roster.",fatigue:3,icon:"sc"},
  rest:     {label:"rest",desc:"light week. -15 fatigue, no stat gains.",fatigue:-15,icon:"r"},
  vacation: {label:"vacation",desc:"full reset. -30 fatigue, +3 chemistry, form decays.",fatigue:-30,icon:"vc"},
};

// Coaches are salaried staff paid monthly like players (figures are $K/month).
export const COACHES = [
  {name:"zonic",style:"Tactical",desc:"+2 game sense per bootcamp, +1 map prof per practice",salary:18,bonus:"tactical"},
  {name:"Jumpy",style:"Motivator",desc:"-3 fatigue per activity, +2 chemistry per scrim",salary:14,bonus:"motivator"},
  {name:"casle",style:"Analyst",desc:"+2 map proficiency per practice, better veto intel",salary:16,bonus:"analyst"},
  {name:"Robban",style:"Veteran",desc:"+1 mentality per bootcamp, reduced nerves penalty",salary:20,bonus:"veteran"},
  {name:"Floo",style:"Fitness",desc:"-5 extra fatigue per rest/vacation, +1 consistency per bootcamp",salary:12,bonus:"fitness"},
];

// ── Contracts (time-based) ──────────────────────────────────────────
// p.contract is measured in WEEKS remaining and counts down each week.
export const WEEKS_PER_YEAR = 52;
export const CONTRACT_TERMS = [
  { label: "6-month loan", weeks: 26, loan: true },
  { label: "1 year",  weeks: 52 },
  { label: "2 years", weeks: 104 },
  { label: "3 years", weeks: 156 },
];
export function contractLabel(weeks){
  if(weeks==null) return "—";
  if(weeks<=0) return "expired";
  if(weeks<9) return `${weeks}wk`;
  const months=Math.round(weeks/4.33);
  if(months<12) return `${months}mo`;
  const years=Math.floor(months/12), rem=months%12;
  return rem>0?`${years}y ${rem}m`:`${years}y`;
}

export const FACILITIES = {
  gaming_house: {name:"Gaming House",icon:"h",maxTier:3,
    cost:[200,400,800],desc:["Basic setup — -2 fatigue/activity","Pro setup — -4 fatigue/activity","Elite facility — -6 fatigue/activity"]},
  bootcamp_center:{name:"Bootcamp Center",icon:"t",maxTier:3,
    cost:[150,350,700],desc:["Training room — +1 stat from bootcamp","Full gym — +2 stats from bootcamp","World-class — +3 stats + map prof bonus"]},
  psychologist:{name:"Sports Psychologist",icon:"p",maxTier:2,
    cost:[250,500],desc:["+1 composure/event, better mentality growth","Also reduces chemistry loss from roster changes"]},
  analytics:{name:"Analytics Lab",icon:"a",maxTier:2,
    cost:[200,450],desc:["+1 game sense from VOD review","Also +2 game sense from VOD, better scouting"]},
  content:{name:"Content Studio",icon:"c",maxTier:2,
    cost:[150,300],desc:["Streaming/content — +$15K passive income/month","Full production — +$30K passive income/month"]},
  medbay:{name:"Medical Bay",icon:"m",maxTier:2,
    cost:[200,400],desc:["-5 extra fatigue on rest/vacation","Also prevents injury random events"]},
};

export const RANDOM_EVENTS = [
  {id:"sponsor",text:"[$$] Sponsor deal! A brand offers a ${amt}K bonus if you place top 4 at the next event.",weight:8,apply:(s,t,rng)=>{const amt=30+Math.round(rng()*40);s.pendingBonus={condition:"top4",amount:amt};return`[$$] Sponsor offers ${amt}K bonus for top 4 finish`;}},
  {id:"injury",text:"[!] {player} tweaked their wrist in practice.",weight:6,apply:(s,t,rng)=>{const r=rosterOf(s,t);if(!r.length)return null;const p=r[Math.floor(rng()*r.length)];p.fatigue=Math.min(100,p.fatigue+15);return`[!] ${p.name} tweaked their wrist — +15 fatigue`;}},
  {id:"morale",text:"Team dinner boosts morale.",weight:7,apply:(s,t)=>{s.chemistry[t]=Math.min(100,(s.chemistry[t]||55)+4);return"[+] Team dinner night — +4 chemistry";}},
  {id:"media",text:"Media interview goes viral.",weight:5,apply:(s,t,rng)=>{const r=rosterOf(s,t);if(!r.length)return null;const p=r[Math.floor(rng()*r.length)];p.form=Math.min(12,p.form+2);return`[>] ${p.name}'s interview goes viral — confidence boost (+2 form)`;}},
  {id:"drama",text:"Internal disagreement.",weight:4,apply:(s,t)=>{s.chemistry[t]=Math.max(40,(s.chemistry[t]||55)-5);return"[!!] Argument in team comms — -5 chemistry";}},
  {id:"streamer",text:"Player streams and pops off.",weight:6,apply:(s,t,rng)=>{const r=rosterOf(s,t);if(!r.length)return null;const p=r[Math.floor(rng()*r.length)];p.aim=Math.min(99,p.aim+1);return`[>>] ${p.name} went on a sick FPL stream — +1 aim`;}},
  {id:"bootcamp_invite",text:"Bootcamp invite from another org.",weight:3,apply:(s,t)=>{rosterOf(s,t).forEach(p=>{p.gameSense=Math.min(99,p.gameSense+1);p.fatigue=Math.min(100,p.fatigue+5);});return"[>>] Guest bootcamp with a top team — +1 game sense (all), +5 fatigue";}},
  {id:"nothing",text:"Quiet week.",weight:20,apply:()=>null},
];

export const CHOICE_EVENTS = [
  {id:"team_friction",weight:4,title:"Team Tension",text:"{player} is clashing with teammates after a rough run.",
    choices:[
      {label:"Team meeting",    desc:"$10K · +8 chemistry"},
      {label:"Let it blow over",desc:"-5 chemistry"},
      {label:"Fine the player", desc:"-2 form · -2 chem · +$5K"},
    ]},
  {id:"player_demand",weight:3,title:"Salary Demand",text:"{player} is angling for a pay raise before the next event.",
    choices:[
      {label:"Agree to raise",      desc:"+$5K/mo salary · +5 form"},
      {label:"Decline",             desc:"-4 form"},
      {label:"Promise next season", desc:"-2 chemistry"},
    ]},
  {id:"rival_interest",weight:2,title:"Rival Poaching",text:"A top org is reportedly making offers to {player}.",
    choices:[
      {label:"Reassure + bonus",  desc:"-$20K · +3 form · secured"},
      {label:"Extend contract",   desc:"+$4K/mo · +1 event"},
      {label:"Call their bluff",  desc:"-3 form · -5 chemistry"},
    ]},
  {id:"bootcamp_invite",weight:3,title:"Bootcamp Invitation",text:"A European org invites your team to a joint bootcamp.",
    choices:[
      {label:"Full bootcamp",  desc:"-$30K · +2 gameSense all · +10 fatigue"},
      {label:"Day visit",      desc:"-$10K · +1 gameSense all · +5 fatigue"},
      {label:"Decline",        desc:"No cost, miss opportunity"},
    ]},
  {id:"slump",weight:3,title:"Player Slump",text:"{player} is going through a rough patch — low confidence.",
    choices:[
      {label:"Private coaching", desc:"-$15K · +4 form · +1 gameSense"},
      {label:"Rest week",        desc:"-15 fatigue · +2 form"},
      {label:"Keep grinding",    desc:"+10 fatigue · -2 form"},
    ]},
  {id:"morale_crisis",weight:0,title:"Locker Room Unrest",text:"{player} is visibly unhappy — the mood in the team house is toxic.",
    choices:[
      {label:"Emergency team meeting",desc:"$10K · +8 chemistry · +15 morale (all)"},
      {label:"1-on-1 with player",    desc:"$5K · +20 morale (player) · +3 chem"},
      {label:"Ignore it",             desc:"-8 chemistry · -5 morale (all)"},
    ]},
  {id:"media_storm",weight:2,title:"Media Storm",text:"{player}'s social post sparks online controversy.",
    choices:[
      {label:"Public apology", desc:"-3 form · +3 chemistry"},
      {label:"Double down",    desc:"+4 form · -7 chemistry"},
      {label:"Silent mode",    desc:"-2 chemistry"},
    ]},
];

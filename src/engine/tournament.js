import { MAPS } from '../constants/data.js';
import { playerOvr } from './utils.js';
import { rosterOf, freeAgents } from './state.js';
import { getTeamOrder } from './player.js';
import { playSeries } from './match.js';
import { snapshotEventStats } from './activity.js';

export function swissBo(w,l){return(w>=2||l>=2)?3:1;}

export function swissPairings(teams,records){
  // Group by W-L record, pair within group (avoid rematches if possible)
  const groups={};
  teams.forEach(t=>{const k=`${records[t].w}-${records[t].l}`;(groups[k]=groups[k]||[]).push(t);});
  const pairs=[];const used=new Set();
  const sortedKeys=Object.keys(groups).sort((a,b)=>{const [aw,al]=a.split("-").map(Number);const [bw,bl]=b.split("-").map(Number);return (bw-aw)||(al-bl);});
  for(const k of sortedKeys){
    const g=groups[k].filter(t=>!used.has(t));
    // Sort by buchholz (tie-break)
    for(let i=0;i<g.length-1;i+=2){pairs.push({a:g[i],b:g[i+1]});used.add(g[i]);used.add(g[i+1]);}
    if(g.length%2===1){// bubble team — pair with team from adjacent record
      const bubble=g[g.length-1];
      const nextKey=sortedKeys.find(nk=>nk!==k&&groups[nk].some(t=>!used.has(t)));
      if(nextKey){const nextG=groups[nextKey].filter(t=>!used.has(t));if(nextG.length>0){pairs.push({a:bubble,b:nextG[0]});used.add(bubble);used.add(nextG[0]);}}
    }
  }
  return pairs;
}

export function newSwiss(myTeam,simState,teams){
  const records=Object.fromEntries(teams.map(t=>[t,{w:0,l:0,buchholz:0,matches:[]}]));
  return {myTeam,teams,records,rounds:[],advanced:[],eliminated:[],stage:"swiss",bracket:null,champion:null,simState,rng:Math.random};
}

export function swissRound(s){
  // Build pairings from active teams (not yet 3W or 3L)
  const active=s.teams.filter(t=>{const r=s.records[t];return r.w<3&&r.l<3&&!s.advanced.includes(t)&&!s.eliminated.includes(t);});
  if(active.length===0)return null;
  const pairs=swissPairings(active,s.records);
  const fixtures=pairs.map(({a,b})=>{
    const bo=swissBo(Math.max(s.records[a].w,s.records[b].w),Math.max(s.records[a].l,s.records[b].l));
    const mine=(a===s.myTeam||b===s.myTeam);
    return {a,b,bo,mine,done:false,res:null};
  });
  s.rounds.push({fixtures});
  // Auto-resolve AI matches
  fixtures.filter(f=>!f.mine).forEach(f=>{
    f.res=playSeries(s.simState,f.a,f.b,f.bo,{stage:"swiss"},s.rng);
    f.done=true;
    s.records[f.res.winnerName].w++;s.records[f.res.loserName].l++;
    s.records[f.res.winnerName].matches.push(f);s.records[f.res.loserName].matches.push(f);
  });
  // Update advanced/eliminated
  s.teams.forEach(t=>{
    if(s.records[t].w>=3&&!s.advanced.includes(t)) s.advanced.push(t);
    if(s.records[t].l>=3&&!s.eliminated.includes(t)) s.eliminated.push(t);
  });
  return fixtures;
}

export function resolveSwissFix(s,fx){
  const {res}=fx;
  s.records[res.winnerName].w++;s.records[res.loserName].l++;
  s.records[res.winnerName].matches.push(fx);s.records[res.loserName].matches.push(fx);
  const adv=s._advanceAt||3,eli=s._elimAt||3;
  s.teams.forEach(t=>{
    if(s.records[t].w>=adv&&!s.advanced.includes(t)) s.advanced.push(t);
    if(s.records[t].l>=eli&&!s.eliminated.includes(t)) s.eliminated.push(t);
  });
}

export function swissDone(s){
  return s.teams.every(t=>s.records[t].w>=3||s.records[t].l>=3);
}

export function nextSwissFix(s){
  for(const rd of s.rounds){const f=rd.fixtures.find(f=>f.mine&&!f.done);if(f)return f;}
  return null;
}

// Build playoff bracket from top N swiss advancers
export function seedPlayoff(advancers,bo3,bo5Final){
  const n=advancers.length;
  if(n===8){
    // QF (1v8,2v7,3v6,4v5) → SF → Final
    const qf=[{a:advancers[0],b:advancers[7],res:null,done:false},{a:advancers[3],b:advancers[4],res:null,done:false},{a:advancers[1],b:advancers[6],res:null,done:false},{a:advancers[2],b:advancers[5],res:null,done:false}];
    const sf=[{a:null,b:null,res:null,done:false},{a:null,b:null,res:null,done:false}];
    const fin={a:null,b:null,res:null,done:false,bo:bo5Final?5:3};
    return {qf,sf,final:fin,bo3,bo5Final};
  } else if(n===4){
    // SF → Final
    const sf=[{a:advancers[0],b:advancers[3],res:null,done:false},{a:advancers[1],b:advancers[2],res:null,done:false}];
    return {sf,final:{a:null,b:null,res:null,done:false,bo:bo5Final?5:3},bo3,bo5Final};
  } else {
    // 2 teams: just a final
    return {final:{a:advancers[0],b:advancers[1],res:null,done:false,bo:bo5Final?5:3},bo3,bo5Final};
  }
}

export function resolvePlayoffAI(bracket,myTeam,simState,rng){
  const rounds=bracket.qf?["qf","sf","final"]:bracket.sf?["sf","final"]:["final"];
  for(const r of rounds){
    const list=r==="final"?[bracket.final]:bracket[r];
    list.forEach(fx=>{
      if(fx.done||!fx.a||!fx.b||fx.a===myTeam||fx.b===myTeam)return;
      const bo=r==="final"?(bracket.bo5Final?5:bracket.bo3||3):bracket.bo3||3;
      fx.res=playSeries(simState,fx.a,fx.b,bo,{stage:r},rng);fx.done=true;
    });
  }
  // propagate
  if(bracket.qf){
    if(bracket.qf[0].done&&bracket.qf[1].done){bracket.sf[0].a=bracket.qf[0].res.winnerName;bracket.sf[0].b=bracket.qf[1].res.winnerName;}
    if(bracket.qf[2].done&&bracket.qf[3].done){bracket.sf[1].a=bracket.qf[2].res.winnerName;bracket.sf[1].b=bracket.qf[3].res.winnerName;}
  }
  if(bracket.sf&&bracket.sf[0].done&&bracket.sf[1].done){bracket.final.a=bracket.sf[0].res.winnerName;bracket.final.b=bracket.sf[1].res.winnerName;}
}

export function nextPlayoffFix(bracket,myTeam){
  const rounds=bracket.qf?["qf","sf","final"]:bracket.sf?["sf","final"]:["final"];
  for(const r of rounds){
    const list=r==="final"?[bracket.final]:bracket[r];
    for(const fx of list)if(!fx.done&&fx.a&&fx.b&&(fx.a===myTeam||fx.b===myTeam))return{fx,round:r};
  }
  return null;
}

export function newTournament(myTeam,simState){
  snapshotEventStats(simState,simState._eventCounter||0);simState._eventCounter=(simState._eventCounter||0)+1;
  Object.keys(simState.stats).forEach(k=>{simState.stats[k]={maps:0,rating:0,mvps:0,clutches:0};});
  // Major: 16-team Swiss → top 8 → playoffs Bo3/Bo5 final
  const teams=getTeamOrder(myTeam,simState).slice(0,16);
  const swiss=newSwiss(myTeam,simState,teams);
  swissRound(swiss); // run round 1
  return {myTeam,swiss,stage:"swiss",bracket:null,champion:null,simState,rng:Math.random,isMajor:true,
    advanceCount:8,prizeTable:{1:500,2:300,4:180,8:100,9:50,16:30}};
}

export function allGroupsDone(t){return swissDone(t.swiss);}

export function seedBracket(t){
  const advancers=t.swiss.advanced.slice(0,t.advanceCount||8);
  t.bracket=seedPlayoff(advancers,3,true);
  resolvePlayoffAI(t.bracket,t.myTeam,t.simState,t.rng);
}

export function resolveAIFixtures(t,round){resolvePlayoffAI(t.bracket,t.myTeam,t.simState,t.rng);}
export function propagate(b){resolvePlayoffAI(b,null,null,null);} // no-op, handled inline

export function bracketElim(b,team){
  const rounds=b.qf?["qf","sf","final"]:b.sf?["sf","final"]:["final"];
  for(const r of rounds){const list=r==="final"?[b.final]:b[r];for(const f of list)if(f.done&&f.res&&f.res.loserName===team)return true;}
  return false;
}

export function placementOf(t){
  if(!t||t.stage!=="done")return 16;
  const br=t.bracket;if(!br)return 16;
  const fr=br.final.res;
  if(fr.winnerName===t.myTeam)return 1;if(fr.loserName===t.myTeam)return 2;
  if(br.sf){for(const s of br.sf)if(s.done&&s.res&&s.res.loserName===t.myTeam)return 4;}
  if(br.qf){for(const q of br.qf)if(q.done&&q.res&&q.res.loserName===t.myTeam)return 9;}
  return t.swiss?.eliminated?.includes(t.myTeam)?t.teams?.length||16:12;
}
export function prizeMoney(place){return{1:500,2:300,4:180,8:100,9:50,16:30}[place]||30;}
export function decayFormBetweenEvents(simState){simState.players.forEach(p=>{p.form=p.form*0.4;});}
export function tickContracts(simState,myTeam){
  // Contracts are weeks-based and tick down weekly (see App.tickContractWeeks).
  // This per-event hook only guarantees AI sides never disband: any AI player on a
  // short deal is quietly re-signed so tournaments can always field full rosters.
  simState.players.forEach(p=>{
    if(p.team==="FA"||p.team===myTeam)return;
    if(p.contract<=8)p.contract=104; // AI auto-renew (2yr), never bleed to FA
  });
}

// ── A/B tier tournaments (also Swiss) ────────────────────────────────
export function newMiniTournament(myTeam,simState,eventInfo){
  snapshotEventStats(simState,simState._eventCounter||0);simState._eventCounter=(simState._eventCounter||0)+1;
  Object.keys(simState.stats).forEach(k=>{simState.stats[k]={maps:0,rating:0,mvps:0,clutches:0};});
  const rng=Math.random;
  const n=eventInfo.teams||8;
  // Pick top N teams by rating (user always included)
  const ranked=getTeamOrder(myTeam,simState).filter(t=>t===myTeam||rosterOf(simState,t).length>=3);
  const participants=[myTeam,...ranked.filter(t=>t!==myTeam).slice(0,n-1)];
  const isATier=eventInfo.tier==="A";
  // Both A and B tier: 8 teams Swiss (2W/2L) → top 4 playoffs
  // A-tier: Bo3 playoffs, B-tier: Bo1 swiss + Bo3 playoffs
  const swiss=newSwiss(myTeam,simState,participants);
  swiss._advanceAt=2;swiss._elimAt=2;
  swissRoundMini(swiss);
  return {myTeam,swiss,stage:"swiss",bracket:null,champion:null,simState,rng,isMajor:false,tier:eventInfo.tier,label:eventInfo.label,location:eventInfo.location,advanceCount:4,prizeTable:eventInfo.prize,participants,bo:eventInfo.bo||3};
}

export function swissRoundMini(s){
  // Mini Swiss: uses _advanceAt/_elimAt instead of 3
  const adv=s._advanceAt||3,eli=s._elimAt||3;
  const active=s.teams.filter(t=>s.records[t].w<adv&&s.records[t].l<eli&&!s.advanced.includes(t)&&!s.eliminated.includes(t));
  if(active.length<2)return null;
  const pairs=swissPairings(active,s.records);
  const fixtures=pairs.map(({a,b})=>{const mine=(a===s.myTeam||b===s.myTeam);const bo=(s.records[a].w+s.records[a].l>=1||s.records[b].w+s.records[b].l>=1)?3:1;return{a,b,bo,mine,done:false,res:null};});
  s.rounds.push({fixtures});
  fixtures.filter(f=>!f.mine).forEach(f=>{
    f.res=playSeries(s.simState,f.a,f.b,f.bo,{stage:"swiss"},s.rng);f.done=true;
    s.records[f.res.winnerName].w++;s.records[f.res.loserName].l++;
    s.records[f.res.winnerName].matches.push(f);s.records[f.res.loserName].matches.push(f);
  });
  const adv2=s._advanceAt||3,eli2=s._elimAt||3;
  s.teams.forEach(t=>{if(s.records[t].w>=adv2&&!s.advanced.includes(t))s.advanced.push(t);if(s.records[t].l>=eli2&&!s.eliminated.includes(t))s.eliminated.push(t);});
  return fixtures;
}

export function resolveMiniAI(t,round){if(t.bracket)resolvePlayoffAI(t.bracket,t.myTeam,t.simState,t.rng);}
export function propagateMini(t){if(t.bracket)resolvePlayoffAI(t.bracket,t.myTeam,t.simState,t.rng);}

export function miniPlacement(t){
  if(!t.champion)return t.participants?.length||8;
  const br=t.bracket;if(!br)return t.participants?.length||8;
  const fr=br.final?.res;if(!fr)return t.participants?.length||8;
  if(fr.winnerName===t.myTeam)return 1;
  if(fr.loserName===t.myTeam)return 2;
  if(br.sf){for(const s of br.sf||[])if(s.done&&s.res?.loserName===t.myTeam)return 3;}
  return t.swiss?.eliminated?.includes(t.myTeam)?t.participants?.length||8:4;
}
export function miniPrizeMoney(t,place){const tbl=t.prizeTable||{};return tbl[place]||tbl[Object.keys(tbl).sort((a,b)=>b-a).pop()]||10;}

import { AI_TEAMS } from '../constants/data.js';
import { playerOvr } from './utils.js';
import { rosterOf, freeAgents } from './state.js';

export { playerOvr, marketValue, draftCost } from './utils.js';

export function getTeamOrder(myTeam,state){
  const all=[...AI_TEAMS,myTeam];
  // Filter to only teams that have players
  const active=state?all.filter(t=>t===myTeam||rosterOf(state,t).length>=3):all;
  if(state&&state.rankings){
    return active.sort((a,b)=>(state.rankings[b]||0)-(state.rankings[a]||0));
  }
  return active;
}
export function getSeed(myTeam,state){return Object.fromEntries(getTeamOrder(myTeam,state).map((t,i)=>[t,i+1]));}

export const RANKING_POINTS={1:1000,2:600,3:350,4:350,5:150,6:150,7:150,8:150,9:50,10:50,11:50,12:50,13:50,14:50,15:50,16:50};
export const TIER_MULT={Major:3,A:2,B:1};

export function updateRankings(state,placements,tier){
  const mult=TIER_MULT[tier]||1;
  Object.entries(placements).forEach(([team,place])=>{
    const pts=(RANKING_POINTS[place]||30)*mult;
    // Decay old points slightly, add new
    state.rankings[team]=Math.round((state.rankings[team]||0)*0.85+pts);
  });
}

export function getRankedTeams(state,myTeam){
  const all=[...AI_TEAMS,myTeam];
  return all.map(t=>({team:t,pts:state.rankings[t]||0})).sort((a,b)=>b.pts-a.pts);
}

export function aiRosterMoves(state,myTeam){
  // AI teams evaluate after Majors: drop underperformers, sign replacements
  const moves=[];
  AI_TEAMS.forEach(team=>{
    const roster=rosterOf(state,team);
    if(roster.length===0) return;
    // Find worst performer from last event stats
    const worst=roster.filter(p=>state.stats[p.name]&&state.stats[p.name].maps>0)
      .sort((a,b)=>(state.stats[a.name]?.rating||0)-(state.stats[b.name]?.rating||0))[0];
    // Only drop if they performed badly (rating < 0.85) and with some probability
    if(worst&&(state.stats[worst.name]?.rating||1)<0.85&&Math.random()<0.35){
      const oldName=worst.name;
      worst.team="FA";worst.contract=0;
      state.chemistry[team]=Math.max(40,(state.chemistry[team]||70)-5);
      // Sign best available FA of same role
      const fas=freeAgents(state).filter(p=>p.role===worst.role).sort((a,b)=>playerOvr(b)-playerOvr(a));
      if(fas.length>0){
        const newP=fas[0];newP.team=team;newP.contract=2;
        state.chemistry[team]=Math.max(40,(state.chemistry[team]||70)-3);
        if(!state.stats[newP.name])state.stats[newP.name]={maps:0,rating:0,mvps:0,clutches:0};
        if(!state.career[newP.name])state.career[newP.name]={totalMaps:0,totalMvps:0,totalClutches:0,avgRating:0,bestRating:0,eventHistory:[],mapStats:{},origStats:{aim:newP.aim,gameSense:newP.gameSense,util:newP.util,igl:newP.igl,mentality:newP.mentality,consistency:newP.consistency,rifle:newP.rifle,pistol:newP.pistol,awp:newP.awp,clutch:newP.clutch,entry:newP.entry,stamina:newP.stamina,composure:newP.composure,experience:newP.experience},kills:0};
        moves.push(`> ${team} release ${oldName}, sign ${newP.name}`);
      } else {
        moves.push(`> ${team} release ${oldName} (no replacement found)`);
      }
    }
    // Rare poach: strong team steals from weak team
    if(Math.random()<0.08){
      const ranked=getRankedTeams(state,myTeam);
      const myRank=ranked.findIndex(r=>r.team===team);
      // Only top 5 teams poach from bottom 5
      if(myRank<5){
        const weakTeams=ranked.slice(-5).map(r=>r.team).filter(t=>t!==myTeam&&t!==team);
        const target=weakTeams[Math.floor(Math.random()*weakTeams.length)];
        if(target){
          const targetRoster=rosterOf(state,target).sort((a,b)=>playerOvr(b)-playerOvr(a));
          if(targetRoster.length>1){
            const stolen=targetRoster[0];
            stolen.team=team;stolen.contract=2;
            state.chemistry[team]=Math.max(40,(state.chemistry[team]||70)-5);
            state.chemistry[target]=Math.max(40,(state.chemistry[target]||70)-8);
            // Backfill target team
            const fas2=freeAgents(state).sort((a,b)=>playerOvr(b)-playerOvr(a));
            if(fas2.length>0){fas2[0].team=target;fas2[0].contract=2;}
            moves.push(`[!] ${team} poach ${stolen.name} from ${target}!`);
          }
        }
      }
    }
  });
  return moves;
}

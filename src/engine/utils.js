// Player utility functions — no external deps
export function playerOvr(p){return Math.round(0.20*p.aim+0.15*p.gameSense+0.10*p.util+0.08*p.igl+0.05*p.mentality+0.08*(p.rifle||p.aim)+0.06*(p.pistol||60)+0.06*(p.awp||50)+0.05*(p.clutch||50)+0.05*(p.entry||60)+0.04*(p.composure||p.mentality)+0.04*(p.stamina||60)+0.04*(p.experience||50));}


export function marketValue(p){
  const ovr=playerOvr(p);
  let base;
  if(ovr>=94)      base=1000; // generational (the undisputed #1)
  else if(ovr>=91) base=700;  // superstar
  else if(ovr>=88) base=460;  // elite (HLTV top 5)
  else if(ovr>=85) base=300;  // star
  else if(ovr>=82) base=195;  // quality starter
  else if(ovr>=79) base=125;  // solid
  else if(ovr>=75) base=80;   // rotation
  else if(ovr>=71) base=50;   // budget
  else             base=32;   // bargain
  // Legend premium: prime-era players cost 25% more
  if(p.era&&p.era!=="current") base=Math.round(base*1.25);
  return base;
}

// How much over market value it takes to prise a player loose. Stars carry a
// steep premium so the world's best can't be had on the cheap.
export function transferPremium(p){
  const ovr=playerOvr(p);
  return ovr>=92?3.0:ovr>=89?2.6:ovr>=86?2.3:ovr>=82?2.0:1.8;
}

// Cash buyout floor. sellerRank is the 0-based world rank of the holding team —
// stronger orgs are more reluctant to sell.
export function buyoutPrice(p,sellerRank=10){
  const mv=marketValue(p);
  const rankMult=sellerRank<3?1.25:sellerRank<6?1.12:sellerRank<10?1.0:0.9;
  return Math.round(mv*transferPremium(p)*rankMult);
}

// Salary floor a player of this calibre will accept ($K/month). Keeps elite
// talent on appropriately large contracts.
export function desiredSalary(p){
  const ovr=playerOvr(p);
  if(ovr>=94) return 55;
  if(ovr>=91) return 42;
  if(ovr>=88) return 32;
  if(ovr>=85) return 24;
  if(ovr>=82) return 18;
  if(ovr>=79) return 13;
  if(ovr>=75) return 9;
  return 6;
}

export function draftCost(p){
  const mv=marketValue(p);
  // Poaching from AI team costs 50% extra
  return p.team==="FA"?mv:Math.round(mv*1.5);
}

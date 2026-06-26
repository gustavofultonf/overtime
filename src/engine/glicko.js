// Glicko-1 rating system matching Valve's counter-strike_regional_standings model
// All teams use a fixed RD (rating deviation) after seeding

const Q = Math.log(10) / 400;
export const FIXED_RD = 75;
export const INIT_RATING = 1500;

function gRD(rd) {
  return 1 / Math.sqrt(1 + (3 * Q * Q * rd * rd) / (Math.PI * Math.PI));
}

function expectedScore(r, rOpp, rdOpp) {
  return 1 / (1 + Math.pow(10, (-gRD(rdOpp) * (r - rOpp)) / 400));
}

// Apply a batch of matches simultaneously (one Glicko rating period).
// matches: [{oppRating, oppRD, won, infoContent}]
// informationContent scales match impact — higher-stakes events count more.
export function glickoUpdate(rating, matches) {
  if (!matches.length) return rating;
  const rd = FIXED_RD;
  let dSqInv = 0;
  let adjustment = 0;
  for (const m of matches) {
    const g = gRD(m.oppRD ?? rd);
    const E = expectedScore(rating, m.oppRating, m.oppRD ?? rd);
    const ic = m.infoContent ?? 1;
    const score = m.won ? 1 : 0;
    dSqInv += ic * Q * Q * g * g * E * (1 - E);
    adjustment += ic * g * (score - E);
  }
  if (dSqInv === 0) return rating;
  // adjustedRDSq = 1 / (1/RD² + dSqInv)
  const adjustedRDSq = 1 / (1 / (rd * rd) + dSqInv);
  return rating + Q * adjustedRDSq * adjustment;
}

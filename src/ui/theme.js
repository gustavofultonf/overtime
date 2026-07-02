// ── OVERTIME design system ──────────────────────────────────────────
// "Broadcast" palette — an esports-native look (HLTV/BLAST energy, not
// a Football Manager clone): dark slate base, electric-blue brand with
// teal section accents, and clear semantic greens/golds/reds for data.
// Token names are stable; every component reads from these so the
// whole app re-skins from this one file.
export const C = {
  // surfaces
  bg:"#0f141d", panel:"#171e2b", panel2:"#202939", line:"#2d3a52",
  // ink
  ink:"#edf2fa", dim:"#96a3ba", faint:"#5e6b83",
  // brand + semantic accents
  acc:"#4da3ff",        // electric blue — primary brand
  accDeep:"#2f6bff",    // saturated blue — CTA gradients / fills
  acc2:"#2dd6c4",       // teal — section headings / highlights
  gold:"#f3c25b", silver:"#c9d2e0", bronze:"#cd7f32",
  win:"#3ddc97", live:"#9d8cff", ban:"#566077",
  red:"#f0596b", rival:"#ff6ea9",
  // muted mid-tier form/rating shades (between neutral and full win/red)
  winSoft:"#8bc99a", redSoft:"#c98b8b",
  // role accent (AWP) — a warmer red than the semantic danger red
  awp:"#e05050",
  // CS side colors (broadcast convention): T orange, CT blue
  tSide:"#f0883e", ctSide:"#5aa9e6",
  // text that sits on a bright accent fill
  onAcc:"#0a1120",
  // depth helpers
  glow:"rgba(77,163,255,.16)",
};

// Cohesive accent for any team/era tinting that needs a stable hue set.
export const ACCENTS = [C.acc,C.live,C.gold,C.win,C.acc2,"#4dd6c4","#ff9d5c","#7c83ff"];

// Elevation + shape tokens (used by primitives; opt-in elsewhere).
export const R = { sm:8, md:12, lg:16, pill:999 };
export const SHADOW = {
  card:"0 1px 0 rgba(255,255,255,.03) inset, 0 8px 24px -16px rgba(0,0,0,.7)",
  pop:"0 18px 50px -20px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.04)",
  glow:`0 0 0 1px ${C.acc}55, 0 8px 30px -10px ${C.glow}`,
};

// Page-level backdrop: dark slate with an electric-blue glow top-right and
// a faint teal wash low-right — arena-lighting depth without visual noise.
export const GRAD =
  "radial-gradient(1000px 620px at 90% -12%, rgba(77,163,255,.12), transparent 60%)," +
  "radial-gradient(800px 560px at 104% 96%, rgba(45,214,196,.06), transparent 55%)," +
  "linear-gradient(200deg, #131a26 0%, #0f141d 55%, #101724 100%)";

export const sans = "'Manrope','Inter',system-ui,sans-serif";
export const mono = "'JetBrains Mono',ui-monospace,Menlo,monospace";
export const GL = ["A","B","C","D"];

// Spacing scale (px). Use these steps instead of ad-hoc margins so rhythm
// stays consistent across screens: SP.xs 4 · sm 8 · md 12 · lg 16 · xl 22 · xxl 32.
export const SP = { xs:4, sm:8, md:12, lg:16, xl:22, xxl:32 };

// Sticky-chrome height (header). Nav rail / sticky sub-headers offset by this.
export const HEAD_H = 59;

// Shared 0–100 attribute tier scale (FM-style): elite → strong → good →
// serviceable → weak. Every attribute number/bar should color through this.
export const ratingColor = v =>
  v>=90 ? C.acc : v>=80 ? C.win : v>=70 ? C.live : v>=58 ? C.gold : C.dim;

// HLTV-style 2.0 match-rating scale (≈0.7–1.4, 1.00 neutral).
export const rating2Color = v =>
  v>=1.15 ? C.win : v>=1.05 ? C.winSoft : v>=0.95 ? C.ink : v>=0.85 ? C.redSoft : C.red;

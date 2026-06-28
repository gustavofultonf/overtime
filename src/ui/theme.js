// ── OVERTIME design system ──────────────────────────────────────────
// "Midnight" palette — a calm, professional broadcast/management look
// (deep navy base, electric-violet brand, cool data accents). Token
// names are stable; every component reads from these so the whole app
// re-skins from this one file.
export const C = {
  // surfaces
  bg:"#0b0e17", panel:"#141a27", panel2:"#1b2233", line:"#283145",
  // ink
  ink:"#eef1f8", dim:"#8e98ad", faint:"#5a6580",
  // brand + semantic accents
  acc:"#9b8cff",        // electric violet — primary brand / CTAs
  acc2:"#e85bbd",       // magenta — secondary highlight
  gold:"#f3c25b", win:"#36d29b", live:"#5b9dff", ban:"#566077",
  red:"#f0596b", rival:"#e85bbd",
  // text that sits on a bright accent fill
  onAcc:"#0b0e17",
  // depth helpers
  glow:"rgba(155,140,255,.16)",
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

// Page-level backdrop: solid navy with two soft brand glows for depth.
export const GRAD =
  "radial-gradient(1100px 620px at 12% -8%, rgba(155,140,255,.10), transparent 58%)," +
  "radial-gradient(1000px 700px at 96% -4%, rgba(91,157,255,.07), transparent 55%)," +
  "#0b0e17";

export const sans = "'Manrope','Inter',system-ui,sans-serif";
export const mono = "'JetBrains Mono',ui-monospace,Menlo,monospace";
export const GL = ["A","B","C","D"];

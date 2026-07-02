import React from 'react';
import { C, sans, mono, HEAD_H } from './theme.js';

export function Gstyle(){return <style>{`
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

*{box-sizing:border-box;}
html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;}
body{margin:0;background:${C.bg};color:${C.ink};font-family:${sans};}
::selection{background:${C.acc}44;color:${C.ink};}

button{cursor:pointer;font-family:${sans};font-weight:600;letter-spacing:.2px;transition:transform .12s ease,background .15s ease,border-color .15s ease,box-shadow .15s ease,color .12s ease;}
button:not(:disabled):hover{transform:translateY(-1px);}
button:not(:disabled):active{transform:translateY(0);}
button:disabled{cursor:default;opacity:.45;}
button:focus-visible{outline:2px solid ${C.acc};outline-offset:2px;}

input,textarea{font-family:${sans};}
input::placeholder{color:${C.faint};}
input:focus,textarea:focus{outline:none;border-color:${C.acc}!important;box-shadow:0 0 0 3px ${C.acc}22;}

a{color:${C.acc};}

::-webkit-scrollbar{height:10px;width:10px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:${C.line};border-radius:8px;border:2px solid ${C.bg};}
::-webkit-scrollbar-thumb:hover{background:${C.faint};}
*{scrollbar-width:thin;scrollbar-color:${C.line} transparent;}

@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.55;}}
@keyframes fadeUp{0%{opacity:0;transform:translateY(6px);}100%{opacity:1;transform:translateY(0);}}
@keyframes stampIn{0%{opacity:0;transform:scale(1.6) rotate(-8deg);}60%{opacity:1;transform:scale(.92) rotate(-8deg);}100%{opacity:1;transform:scale(1) rotate(-8deg);}}
@keyframes vetoFlash{0%{box-shadow:0 0 0 0 currentColor;}100%{box-shadow:0 0 0 6px transparent;}}
@keyframes deciderGlow{0%,100%{box-shadow:0 0 8px 0 ${C.gold}55;}50%{box-shadow:0 0 16px 3px ${C.gold}99;}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
@keyframes popIn{0%{opacity:0;transform:scale(.4);}70%{opacity:1;transform:scale(1.12);}100%{transform:scale(1);}}
@keyframes scorePop{0%{transform:scale(1);}35%{transform:scale(1.4);}100%{transform:scale(1);}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 10px 0 ${C.gold}44;}50%{box-shadow:0 0 24px 5px ${C.gold}aa;}}
@keyframes risePop{0%{opacity:0;transform:translateY(14px) scale(.96);}60%{opacity:1;}100%{opacity:1;transform:translateY(0) scale(1);}}
@keyframes sheen{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
@keyframes confettiFall{0%{transform:translateY(-8vh) rotate(0deg);opacity:1;}90%{opacity:1;}100%{transform:translateY(108vh) rotate(540deg);opacity:0;}}
@keyframes shake{0%,100%{transform:translateX(0);}20%{transform:translateX(-7px);}40%{transform:translateX(6px);}60%{transform:translateX(-4px);}80%{transform:translateX(2px);}}
@keyframes bannerSweep{0%{transform:scaleX(0);opacity:0;}55%{opacity:1;}100%{transform:scaleX(1);opacity:1;}}

/* ── Data tables (Table primitive) ── */
table.tbl{border-collapse:separate;border-spacing:0;width:100%;font-family:${sans};}
.tbl thead th{position:sticky;top:0;z-index:2;background:${C.panel2};font-family:${sans};font-size:10.5px;font-weight:700;letter-spacing:.3px;color:${C.dim};padding:8px 10px;border-bottom:1px solid ${C.line};white-space:nowrap;user-select:none;}
.tbl tbody td{padding:7px 10px;border-top:1px solid ${C.line};font-size:12.5px;color:${C.ink};vertical-align:middle;}
.tbl tbody tr:first-child td{border-top:none;}
.tbl tbody tr{transition:background .1s ease;}
.tbl tbody tr:hover{background:${C.acc}0d;}
.tbl tbody tr.hl{background:${C.acc}14;}
.tbl tbody tr.hl td:first-child{box-shadow:inset 2px 0 0 ${C.acc};}

/* ── App shell: sticky header · left nav rail · content ── */
.shell{display:flex;align-items:flex-start;max-width:1440px;margin:0 auto;width:100%;}
.rail{position:sticky;top:${HEAD_H}px;display:flex;flex-direction:column;gap:1px;padding:14px 10px 24px;width:176px;flex-shrink:0;min-height:calc(100vh - ${HEAD_H}px);border-right:1px solid ${C.line};}
.railsec{font-family:${sans};font-size:9.5px;font-weight:800;letter-spacing:1.2px;color:${C.faint};text-transform:uppercase;padding:16px 12px 6px;}
.rail>.railsec:first-child{padding-top:4px;}
.railbtn{display:flex;align-items:center;gap:9px;width:100%;background:transparent;border:none;border-radius:9px;padding:8px 12px;color:${C.dim};font-size:13px;font-weight:600;text-align:left;letter-spacing:.1px;}
.railbtn:not(:disabled):hover{background:${C.panel2};color:${C.ink};transform:none;}
.railbtn.on{background:linear-gradient(100deg,${C.accDeep}33,${C.acc2}1f);color:${C.ink};font-weight:700;box-shadow:inset 2.5px 0 0 ${C.acc2};}
@media(max-width:860px){
  .shell{flex-direction:column;}
  .rail{position:static;flex-direction:row;align-items:center;overflow-x:auto;width:100%;min-height:0;border-right:none;border-bottom:1px solid ${C.line};padding:6px 12px;}
  .railsec{display:none;}
  .railbtn{width:auto;white-space:nowrap;padding:7px 9px;}
  .railbtn.on{box-shadow:inset 0 -2px 0 ${C.acc};}
}

/* Subtle hover-lift for non-button cards */
.lift{transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease;}
.lift:hover{transform:translateY(-2px);box-shadow:0 12px 28px -16px rgba(0,0,0,.75);}

/* Gold sheen sweep across an element (e.g. champion banners) */
.sheen{background-image:linear-gradient(110deg,transparent 30%,${C.gold}33 50%,transparent 70%);background-size:200% 100%;animation:sheen 2.4s linear infinite;}

@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;}}
`}</style>;}

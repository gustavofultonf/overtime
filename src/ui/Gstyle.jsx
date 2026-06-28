import React from 'react';
import { C, sans, mono } from './theme.js';

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

@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;}}
`}</style>;}

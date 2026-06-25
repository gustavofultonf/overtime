import React from 'react';
import { C, sans, mono } from './theme.js';

export function Gstyle(){return <style>{`*{box-sizing:border-box;}@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');button{cursor:pointer;font-family:${sans};transition:all .12s ease;}button:disabled{cursor:default;opacity:.5;}button:focus-visible{outline:2px solid ${C.acc};outline-offset:2px;}::-webkit-scrollbar{height:9px;width:9px;}::-webkit-scrollbar-thumb{background:${C.line};border-radius:4px;}@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.55;}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;}}`}</style>;}

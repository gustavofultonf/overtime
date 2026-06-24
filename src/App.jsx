import React, { useState, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════
// OVERTIME v5 — CS Major Simulator
// Fantasy Draft · Calendar Management · Training · Fatigue · Rivalries
// ═══════════════════════════════════════════════════════════════════════

const MAPS = ["Mirage","Inferno","Nuke","Ancient","Dust2","Anubis","Train"];
const AI_TEAMS = ["Vitality","Spirit","FaZe","G2","MOUZ","NAVI","FURIA","Falcons","Liquid","Astralis","Heroic","Complexity","paiN","3DMAX","GamerLegion"];

const PLAYERS_INIT = [
  {team:"Vitality",name:"ZywOo",role:"IGL",aim:87,gameSense:99,util:98,igl:94,mentality:99,consistency:65,traits:["leader","boom","clutch"],salary:21,contract:3,age:24,era:"current"},
  {team:"Vitality",name:"apEX",role:"AWP",aim:99,gameSense:94,util:84,igl:56,mentality:96,consistency:77,traits:[],salary:19,contract:2,age:30,era:"current"},
  {team:"Vitality",name:"flameZ",role:"Entry",aim:99,gameSense:99,util:96,igl:55,mentality:94,consistency:80,traits:[],salary:20,contract:2,age:21,era:"current"},
  {team:"Vitality",name:"mezii",role:"Lurk",aim:95,gameSense:99,util:92,igl:57,mentality:94,consistency:80,traits:["clutch"],salary:17,contract:3,age:24,era:"current"},
  {team:"Vitality",name:"Spinx",role:"Support",aim:95,gameSense:95,util:99,igl:69,mentality:95,consistency:84,traits:[],salary:17,contract:2,age:23,era:"current"},
  {team:"Spirit",name:"donk",role:"IGL",aim:81,gameSense:99,util:93,igl:85,mentality:99,consistency:69,traits:["leader","boom","clutch"],salary:21,contract:3,age:18,era:"current"},
  {team:"Spirit",name:"sh1ro",role:"AWP",aim:96,gameSense:93,util:80,igl:68,mentality:90,consistency:79,traits:["clutch"],salary:17,contract:2,age:23,era:"current"},
  {team:"Spirit",name:"zont1x",role:"Entry",aim:99,gameSense:93,util:93,igl:68,mentality:90,consistency:61,traits:["boom","clutch"],salary:17,contract:2,age:20,era:"current"},
  {team:"Spirit",name:"chopper",role:"Lurk",aim:98,gameSense:99,util:98,igl:60,mentality:99,consistency:63,traits:["boom"],salary:19,contract:3,age:27,era:"current"},
  {team:"Spirit",name:"magixx",role:"Support",aim:94,gameSense:91,util:99,igl:57,mentality:95,consistency:81,traits:[],salary:16,contract:2,age:21,era:"current"},
  {team:"FaZe",name:"karrigan",role:"IGL",aim:76,gameSense:93,util:85,igl:89,mentality:99,consistency:87,traits:["leader","clutch"],salary:17,contract:3,age:34,era:"current"},
  {team:"FaZe",name:"ropz",role:"AWP",aim:99,gameSense:91,util:80,igl:48,mentality:94,consistency:92,traits:[],salary:18,contract:2,age:25,era:"current"},
  {team:"FaZe",name:"frozen",role:"Entry",aim:94,gameSense:90,util:84,igl:69,mentality:82,consistency:88,traits:[],salary:15,contract:2,age:22,era:"current"},
  {team:"FaZe",name:"broky",role:"Lurk",aim:89,gameSense:94,util:93,igl:54,mentality:96,consistency:83,traits:[],salary:15,contract:3,age:23,era:"current"},
  {team:"FaZe",name:"rain",role:"Support",aim:81,gameSense:88,util:95,igl:47,mentality:90,consistency:72,traits:[],salary:13,contract:2,age:30,era:"current"},
  {team:"G2",name:"NiKo",role:"IGL",aim:83,gameSense:96,util:92,igl:90,mentality:99,consistency:97,traits:["leader","clutch"],salary:21,contract:3,age:28,era:"current"},
  {team:"G2",name:"huNter",role:"AWP",aim:93,gameSense:88,util:78,igl:59,mentality:85,consistency:79,traits:[],salary:14,contract:2,age:30,era:"current"},
  {team:"G2",name:"m0NESY",role:"Entry",aim:99,gameSense:90,util:90,igl:62,mentality:92,consistency:84,traits:[],salary:19,contract:2,age:19,era:"current"},
  {team:"G2",name:"Snax",role:"Lurk",aim:92,gameSense:91,util:90,igl:70,mentality:88,consistency:77,traits:[],salary:15,contract:2,age:30,era:"current"},
  {team:"G2",name:"HooXi",role:"Support",aim:85,gameSense:87,util:99,igl:62,mentality:90,consistency:65,traits:["boom","clutch"],salary:13,contract:3,age:26,era:"current"},
  {team:"MOUZ",name:"Brollan",role:"IGL",aim:78,gameSense:90,util:89,igl:83,mentality:90,consistency:68,traits:["leader","boom"],salary:16,contract:3,age:22,era:"current"},
  {team:"MOUZ",name:"Jimpphat",role:"AWP",aim:99,gameSense:86,util:76,igl:67,mentality:88,consistency:61,traits:["boom"],salary:15,contract:2,age:18,era:"current"},
  {team:"MOUZ",name:"torzsi",role:"Entry",aim:99,gameSense:94,util:87,igl:58,mentality:87,consistency:63,traits:["boom"],salary:16,contract:2,age:23,era:"current"},
  {team:"MOUZ",name:"xertioN",role:"Lurk",aim:92,gameSense:98,util:92,igl:50,mentality:95,consistency:78,traits:[],salary:16,contract:3,age:19,era:"current"},
  {team:"MOUZ",name:"Spinx2",role:"Support",aim:83,gameSense:84,util:98,igl:53,mentality:82,consistency:61,traits:["boom"],salary:11,contract:2,age:23,era:"current"},
  {team:"NAVI",name:"Aleksib",role:"IGL",aim:77,gameSense:93,util:86,igl:93,mentality:99,consistency:72,traits:["leader"],salary:17,contract:3,age:28,era:"current"},
  {team:"NAVI",name:"b1t",role:"AWP",aim:99,gameSense:93,util:81,igl:58,mentality:86,consistency:90,traits:[],salary:17,contract:2,age:22,era:"current"},
  {team:"NAVI",name:"jL",role:"Entry",aim:95,gameSense:88,util:81,igl:63,mentality:82,consistency:67,traits:["boom"],salary:14,contract:2,age:23,era:"current"},
  {team:"NAVI",name:"w0nderful",role:"Lurk",aim:91,gameSense:91,util:91,igl:65,mentality:91,consistency:77,traits:[],salary:15,contract:2,age:20,era:"current"},
  {team:"NAVI",name:"iM",role:"Support",aim:80,gameSense:86,util:97,igl:61,mentality:82,consistency:83,traits:[],salary:13,contract:3,age:25,era:"current"},
  {team:"FURIA",name:"KSCERATO",role:"IGL",aim:83,gameSense:92,util:94,igl:86,mentality:95,consistency:91,traits:["leader","clutch"],salary:18,contract:3,age:26,era:"current"},
  {team:"FURIA",name:"yuurih",role:"AWP",aim:98,gameSense:87,util:76,igl:48,mentality:91,consistency:61,traits:["boom","clutch"],salary:15,contract:2,age:25,era:"current"},
  {team:"FURIA",name:"FalleN",role:"Entry",aim:96,gameSense:81,util:80,igl:50,mentality:85,consistency:74,traits:[],salary:13,contract:2,age:33,era:"current"},
  {team:"FURIA",name:"molodoy",role:"Lurk",aim:87,gameSense:92,util:87,igl:46,mentality:92,consistency:95,traits:[],salary:15,contract:3,age:22,era:"current"},
  {team:"FURIA",name:"YEKINDAR",role:"Support",aim:84,gameSense:92,util:99,igl:57,mentality:94,consistency:78,traits:["clutch"],salary:15,contract:2,age:24,era:"current"},
  {team:"Falcons",name:"TeSeS",role:"IGL",aim:68,gameSense:83,util:83,igl:85,mentality:92,consistency:88,traits:["leader","clutch"],salary:14,contract:3,age:26,era:"current"},
  {team:"Falcons",name:"kyxsan",role:"AWP",aim:99,gameSense:93,util:79,igl:52,mentality:92,consistency:67,traits:["boom"],salary:15,contract:2,age:25,era:"current"},
  {team:"Falcons",name:"NertZ",role:"Entry",aim:84,gameSense:78,util:76,igl:65,mentality:77,consistency:90,traits:[],salary:11,contract:2,age:24,era:"current"},
  {team:"Falcons",name:"m0NESY2",role:"Lurk",aim:88,gameSense:89,util:83,igl:67,mentality:85,consistency:88,traits:[],salary:13,contract:2,age:22,era:"current"},
  {team:"Falcons",name:"Kaze",role:"Support",aim:75,gameSense:85,util:95,igl:62,mentality:85,consistency:65,traits:["boom"],salary:11,contract:3,age:23,era:"current"},
  {team:"Liquid",name:"NAF",role:"IGL",aim:73,gameSense:83,util:75,igl:89,mentality:87,consistency:97,traits:["leader"],salary:15,contract:3,age:28,era:"current"},
  {team:"Liquid",name:"Twistzz",role:"AWP",aim:99,gameSense:90,util:83,igl:61,mentality:94,consistency:85,traits:["clutch"],salary:17,contract:2,age:26,era:"current"},
  {team:"Liquid",name:"ultimate",role:"Entry",aim:96,gameSense:88,util:85,igl:60,mentality:85,consistency:63,traits:["boom"],salary:14,contract:2,age:21,era:"current"},
  {team:"Liquid",name:"NertZ2",role:"Lurk",aim:88,gameSense:91,util:85,igl:68,mentality:87,consistency:72,traits:[],salary:13,contract:2,age:24,era:"current"},
  {team:"Liquid",name:"siuhy",role:"Support",aim:76,gameSense:81,util:96,igl:51,mentality:87,consistency:96,traits:[],salary:13,contract:3,age:24,era:"current"},
  {team:"Astralis",name:"device",role:"IGL",aim:79,gameSense:95,util:94,igl:94,mentality:99,consistency:75,traits:["leader","clutch"],salary:19,contract:3,age:30,era:"current"},
  {team:"Astralis",name:"stavn",role:"AWP",aim:91,gameSense:86,util:77,igl:64,mentality:82,consistency:93,traits:[],salary:14,contract:2,age:23,era:"current"},
  {team:"Astralis",name:"jabbi",role:"Entry",aim:91,gameSense:78,util:78,igl:62,mentality:74,consistency:95,traits:[],salary:13,contract:2,age:22,era:"current"},
  {team:"Astralis",name:"Staehr",role:"Lurk",aim:89,gameSense:91,util:85,igl:47,mentality:88,consistency:61,traits:["boom"],salary:13,contract:2,age:21,era:"current"},
  {team:"Astralis",name:"HooXi2",role:"Support",aim:78,gameSense:87,util:91,igl:56,mentality:87,consistency:64,traits:["boom"],salary:11,contract:3,age:26,era:"current"},
  {team:"Heroic",name:"xfl0ud",role:"IGL",aim:74,gameSense:83,util:85,igl:84,mentality:93,consistency:63,traits:["leader","boom"],salary:13,contract:3,age:24,era:"current"},
  {team:"Heroic",name:"yxngstxr",role:"AWP",aim:89,gameSense:86,util:76,igl:66,mentality:78,consistency:72,traits:[],salary:12,contract:2,age:22,era:"current"},
  {team:"Heroic",name:"tN1R",role:"Entry",aim:82,gameSense:79,util:77,igl:54,mentality:74,consistency:85,traits:[],salary:11,contract:2,age:23,era:"current"},
  {team:"Heroic",name:"SunPayus",role:"Lurk",aim:81,gameSense:80,util:76,igl:70,mentality:79,consistency:72,traits:[],salary:11,contract:2,age:25,era:"current"},
  {team:"Heroic",name:"kyuubii",role:"Support",aim:78,gameSense:81,util:92,igl:51,mentality:85,consistency:96,traits:[],salary:12,contract:3,age:22,era:"current"},
  {team:"Complexity",name:"JT",role:"IGL",aim:66,gameSense:76,util:78,igl:90,mentality:83,consistency:68,traits:["leader","boom"],salary:12,contract:3,age:28,era:"current"},
  {team:"Complexity",name:"hallzerk",role:"AWP",aim:86,gameSense:80,util:68,igl:56,mentality:79,consistency:66,traits:["boom"],salary:11,contract:2,age:24,era:"current"},
  {team:"Complexity",name:"Grim",role:"Entry",aim:84,gameSense:76,util:72,igl:64,mentality:73,consistency:63,traits:["boom"],salary:10,contract:2,age:25,era:"current"},
  {team:"Complexity",name:"EliGE",role:"Lurk",aim:76,gameSense:84,util:80,igl:60,mentality:79,consistency:73,traits:[],salary:11,contract:2,age:27,era:"current"},
  {team:"Complexity",name:"Cybermaniac",role:"Support",aim:71,gameSense:81,util:92,igl:62,mentality:83,consistency:72,traits:[],salary:11,contract:3,age:24,era:"current"},
  {team:"paiN",name:"dav1deuS",role:"IGL",aim:69,gameSense:79,util:77,igl:82,mentality:88,consistency:95,traits:["leader"],salary:13,contract:3,age:27,era:"current"},
  {team:"paiN",name:"biguzera",role:"AWP",aim:84,gameSense:80,util:73,igl:57,mentality:76,consistency:61,traits:["boom"],salary:10,contract:2,age:22,era:"current"},
  {team:"paiN",name:"snow",role:"Entry",aim:88,gameSense:74,util:78,igl:60,mentality:76,consistency:70,traits:["boom"],salary:11,contract:2,age:24,era:"current"},
  {team:"paiN",name:"dgt",role:"Lurk",aim:83,gameSense:86,util:78,igl:69,mentality:79,consistency:89,traits:[],salary:12,contract:2,age:23,era:"current"},
  {team:"paiN",name:"nqz",role:"Support",aim:70,gameSense:80,util:87,igl:57,mentality:80,consistency:95,traits:[],salary:11,contract:3,age:26,era:"current"},
  {team:"3DMAX",name:"Maka",role:"IGL",aim:70,gameSense:83,util:75,igl:89,mentality:84,consistency:65,traits:["leader","boom"],salary:13,contract:3,age:27,era:"current"},
  {team:"3DMAX",name:"Lucky",role:"AWP",aim:88,gameSense:77,util:72,igl:49,mentality:78,consistency:67,traits:["boom"],salary:11,contract:2,age:26,era:"current"},
  {team:"3DMAX",name:"Djoko",role:"Entry",aim:83,gameSense:75,util:74,igl:67,mentality:75,consistency:92,traits:[],salary:11,contract:2,age:29,era:"current"},
  {team:"3DMAX",name:"Graviti",role:"Lurk",aim:76,gameSense:81,util:75,igl:67,mentality:81,consistency:89,traits:[],salary:11,contract:2,age:24,era:"current"},
  {team:"3DMAX",name:"ALEX",role:"Support",aim:67,gameSense:74,util:79,igl:48,mentality:74,consistency:95,traits:[],salary:9,contract:3,age:30,era:"current"},
  {team:"GamerLegion",name:"REZ",role:"IGL",aim:65,gameSense:74,util:69,igl:88,mentality:76,consistency:75,traits:["leader"],salary:11,contract:3,age:26,era:"current"},
  {team:"GamerLegion",name:"Tauson",role:"AWP",aim:81,gameSense:82,util:66,igl:54,mentality:79,consistency:92,traits:[],salary:11,contract:2,age:22,era:"current"},
  {team:"GamerLegion",name:"ztr",role:"Entry",aim:85,gameSense:80,util:70,igl:64,mentality:76,consistency:65,traits:["boom"],salary:10,contract:2,age:21,era:"current"},
  {team:"GamerLegion",name:"PR",role:"Lurk",aim:79,gameSense:82,util:74,igl:46,mentality:82,consistency:66,traits:["boom"],salary:10,contract:2,age:23,era:"current"},
  {team:"GamerLegion",name:"Kursy",role:"Support",aim:71,gameSense:77,util:85,igl:53,mentality:75,consistency:83,traits:[],salary:10,contract:3,age:24,era:"current"},
  {team:"FA",name:"tabseN",role:"IGL",aim:69,gameSense:76,util:74,igl:84,mentality:80,consistency:76,traits:["leader"],salary:11,contract:0,age:29,era:"current"},
  {team:"FA",name:"kr4sylya",role:"AWP",aim:81,gameSense:78,util:70,igl:52,mentality:75,consistency:77,traits:[],salary:10,contract:0,age:23,era:"current"},
  {team:"FA",name:"JDC",role:"Entry",aim:87,gameSense:77,util:73,igl:51,mentality:78,consistency:94,traits:[],salary:11,contract:0,age:22,era:"current"},
  {team:"FA",name:"hyped",role:"Lurk",aim:74,gameSense:83,util:73,igl:55,mentality:75,consistency:65,traits:["boom"],salary:9,contract:0,age:21,era:"current"},
  {team:"FA",name:"Krimbo",role:"Support",aim:71,gameSense:71,util:79,igl:58,mentality:77,consistency:79,traits:[],salary:9,contract:0,age:22,era:"current"},
  {team:"FA",name:"refrezh",role:"Entry",aim:88,gameSense:83,util:78,igl:55,mentality:80,consistency:76,traits:["clutch"],salary:11,contract:0,age:27,era:"current"},
  {team:"FA",name:"valde",role:"Lurk",aim:85,gameSense:89,util:84,igl:72,mentality:86,consistency:82,traits:[],salary:13,contract:0,age:29,era:"current"},
  {team:"FA",name:"AcoR",role:"AWP",aim:91,gameSense:79,util:70,igl:45,mentality:72,consistency:60,traits:["boom"],salary:10,contract:0,age:25,era:"current"},
  {team:"FA",name:"Magisk",role:"Support",aim:82,gameSense:90,util:93,igl:78,mentality:93,consistency:88,traits:["leader"],salary:15,contract:0,age:29,era:"current"},
  {team:"FA",name:"es3tag",role:"Support",aim:79,gameSense:82,util:90,igl:60,mentality:84,consistency:85,traits:[],salary:11,contract:0,age:28,era:"current"},
  {team:"FA",name:"kjaerbye",role:"Entry",aim:86,gameSense:78,util:72,igl:48,mentality:70,consistency:58,traits:["boom"],salary:9,contract:0,age:28,era:"current"},
  {team:"FA",name:"RUSH",role:"Entry",aim:78,gameSense:80,util:77,igl:52,mentality:82,consistency:80,traits:[],salary:9,contract:0,age:29,era:"current"},
  {team:"FA",name:"poizon",role:"AWP",aim:93,gameSense:81,util:72,igl:44,mentality:76,consistency:64,traits:["boom"],salary:11,contract:0,age:25,era:"current"},
  {team:"FA",name:"Boombl4",role:"IGL",aim:72,gameSense:86,util:83,igl:91,mentality:85,consistency:70,traits:["leader"],salary:13,contract:0,age:26,era:"current"},
  {team:"FA",name:"nbk",role:"Support",aim:75,gameSense:88,util:90,igl:75,mentality:90,consistency:83,traits:["leader"],salary:13,contract:0,age:31,era:"current"},
  // ── 2018-2021 ERA ──────────────────────────────────────────────────
  {team:"FA",name:"s1mple★",role:"AWP",aim:99,gameSense:99,util:90,igl:72,mentality:99,consistency:70,traits:["clutch","boom"],salary:24,contract:0,age:22,era:"2018"},
  {team:"FA",name:"electronic★",role:"Entry",aim:97,gameSense:94,util:88,igl:55,mentality:93,consistency:82,traits:["clutch"],salary:19,contract:0,age:22,era:"2018"},
  {team:"FA",name:"NiKo★",role:"Entry",aim:99,gameSense:97,util:90,igl:60,mentality:96,consistency:75,traits:["boom","clutch"],salary:22,contract:0,age:23,era:"2018"},
  {team:"FA",name:"coldzera★",role:"Lurk",aim:95,gameSense:99,util:92,igl:65,mentality:98,consistency:90,traits:["clutch"],salary:21,contract:0,age:24,era:"2018"},
  {team:"FA",name:"dev1ce★",role:"AWP",aim:94,gameSense:97,util:93,igl:80,mentality:99,consistency:97,traits:["leader","clutch"],salary:21,contract:0,age:25,era:"2018"},
  {team:"FA",name:"dupreeh★",role:"Entry",aim:93,gameSense:92,util:90,igl:60,mentality:95,consistency:88,traits:["clutch"],salary:17,contract:0,age:27,era:"2018"},
  {team:"FA",name:"gla1ve★",role:"IGL",aim:78,gameSense:97,util:95,igl:99,mentality:97,consistency:85,traits:["leader"],salary:18,contract:0,age:25,era:"2018"},
  {team:"FA",name:"Xyp9x★",role:"Support",aim:82,gameSense:95,util:97,igl:65,mentality:99,consistency:95,traits:["clutch"],salary:17,contract:0,age:25,era:"2018"},
  {team:"FA",name:"Twistzz★",role:"Lurk",aim:97,gameSense:90,util:82,igl:50,mentality:90,consistency:88,traits:[],salary:17,contract:0,age:21,era:"2018"},
  {team:"FA",name:"EliGE★",role:"Entry",aim:95,gameSense:92,util:85,igl:62,mentality:88,consistency:85,traits:[],salary:17,contract:0,age:22,era:"2018"},
  {team:"FA",name:"ZywOo★",role:"AWP",aim:98,gameSense:97,util:92,igl:70,mentality:95,consistency:72,traits:["boom","clutch"],salary:20,contract:0,age:19,era:"2018"},
  {team:"FA",name:"Brehze★",role:"Lurk",aim:96,gameSense:90,util:82,igl:48,mentality:85,consistency:80,traits:["boom"],salary:15,contract:0,age:22,era:"2018"},
  {team:"FA",name:"NAF★",role:"Support",aim:90,gameSense:93,util:90,igl:70,mentality:92,consistency:90,traits:["leader"],salary:16,contract:0,age:23,era:"2018"},
  {team:"FA",name:"blameF★",role:"IGL",aim:88,gameSense:94,util:88,igl:95,mentality:90,consistency:82,traits:["leader"],salary:16,contract:0,age:24,era:"2018"},
  {team:"FA",name:"ropz★",role:"Lurk",aim:96,gameSense:95,util:85,igl:48,mentality:90,consistency:95,traits:[],salary:17,contract:0,age:21,era:"2018"},
  // ── 2015-2017 ERA ──────────────────────────────────────────────────
  {team:"FA",name:"olofmeister★",role:"Lurk",aim:95,gameSense:98,util:90,igl:70,mentality:99,consistency:80,traits:["clutch","leader"],salary:20,contract:0,age:24,era:"2015"},
  {team:"FA",name:"flusha★",role:"Support",aim:88,gameSense:99,util:95,igl:82,mentality:96,consistency:85,traits:["clutch"],salary:18,contract:0,age:23,era:"2015"},
  {team:"FA",name:"KRiMZ★",role:"Entry",aim:93,gameSense:95,util:92,igl:55,mentality:97,consistency:93,traits:[],salary:18,contract:0,age:22,era:"2015"},
  {team:"FA",name:"kennyS★",role:"AWP",aim:99,gameSense:90,util:72,igl:45,mentality:88,consistency:60,traits:["boom","clutch"],salary:19,contract:0,age:22,era:"2015"},
  {team:"FA",name:"GuardiaN★",role:"AWP",aim:97,gameSense:93,util:80,igl:55,mentality:92,consistency:78,traits:["clutch"],salary:18,contract:0,age:25,era:"2015"},
  {team:"FA",name:"shox★",role:"Entry",aim:97,gameSense:95,util:82,igl:78,mentality:90,consistency:65,traits:["boom","clutch"],salary:18,contract:0,age:24,era:"2015"},
  {team:"FA",name:"Happy★",role:"IGL",aim:82,gameSense:95,util:85,igl:96,mentality:88,consistency:70,traits:["leader"],salary:15,contract:0,age:25,era:"2015"},
  {team:"FA",name:"FalleN★",role:"IGL",aim:93,gameSense:97,util:90,igl:98,mentality:98,consistency:82,traits:["leader","clutch"],salary:20,contract:0,age:25,era:"2015"},
  {team:"FA",name:"fer★",role:"Entry",aim:95,gameSense:88,util:78,igl:45,mentality:92,consistency:62,traits:["boom"],salary:16,contract:0,age:24,era:"2015"},
  {team:"FA",name:"TACO★",role:"Support",aim:75,gameSense:88,util:93,igl:60,mentality:90,consistency:88,traits:[],salary:12,contract:0,age:24,era:"2015"},
  {team:"FA",name:"rain★",role:"Entry",aim:94,gameSense:88,util:82,igl:48,mentality:92,consistency:75,traits:["clutch"],salary:15,contract:0,age:22,era:"2015"},
  {team:"FA",name:"dennis★",role:"Entry",aim:93,gameSense:85,util:78,igl:55,mentality:85,consistency:72,traits:["boom"],salary:13,contract:0,age:23,era:"2015"},
  {team:"FA",name:"NBK★",role:"Support",aim:85,gameSense:92,util:92,igl:78,mentality:93,consistency:82,traits:["leader"],salary:15,contract:0,age:22,era:"2015"},
  // ── 2013-2014 LEGENDS ──────────────────────────────────────────────
  {team:"FA",name:"GeT_RiGhT★",role:"Lurk",aim:95,gameSense:99,util:85,igl:60,mentality:97,consistency:88,traits:["clutch"],salary:19,contract:0,age:23,era:"2013"},
  {team:"FA",name:"f0rest★",role:"Entry",aim:97,gameSense:95,util:82,igl:55,mentality:93,consistency:82,traits:["clutch","boom"],salary:18,contract:0,age:25,era:"2013"},
  {team:"FA",name:"friberg★",role:"Entry",aim:88,gameSense:85,util:82,igl:50,mentality:90,consistency:80,traits:[],salary:12,contract:0,age:23,era:"2013"},
  {team:"FA",name:"Xizt★",role:"IGL",aim:80,gameSense:90,util:85,igl:92,mentality:88,consistency:80,traits:["leader"],salary:13,contract:0,age:23,era:"2013"},
  {team:"FA",name:"ScreaM★",role:"Entry",aim:99,gameSense:80,util:70,igl:40,mentality:78,consistency:55,traits:["boom"],salary:15,contract:0,age:21,era:"2013"},
  {team:"FA",name:"JW★",role:"AWP",aim:92,gameSense:88,util:75,igl:48,mentality:90,consistency:60,traits:["boom","clutch"],salary:15,contract:0,age:20,era:"2013"},
  {team:"FA",name:"pronax★",role:"IGL",aim:70,gameSense:95,util:88,igl:99,mentality:95,consistency:78,traits:["leader"],salary:14,contract:0,age:24,era:"2013"},
  {team:"FA",name:"Snax★",role:"Lurk",aim:95,gameSense:93,util:82,igl:55,mentality:88,consistency:68,traits:["boom","clutch"],salary:16,contract:0,age:22,era:"2013"},
  {team:"FA",name:"pasha★",role:"Entry",aim:92,gameSense:82,util:78,igl:42,mentality:95,consistency:70,traits:["boom"],salary:14,contract:0,age:25,era:"2013"},
  {team:"FA",name:"NEO★",role:"IGL",aim:85,gameSense:96,util:90,igl:97,mentality:95,consistency:80,traits:["leader","clutch"],salary:16,contract:0,age:27,era:"2013"},
  {team:"FA",name:"TaZ★",role:"Support",aim:80,gameSense:90,util:88,igl:75,mentality:96,consistency:82,traits:["leader"],salary:13,contract:0,age:27,era:"2013"},
  {team:"FA",name:"markeloff★",role:"AWP",aim:95,gameSense:90,util:78,igl:50,mentality:85,consistency:72,traits:["clutch"],salary:15,contract:0,age:24,era:"2013"},
];

// ═══════════════════════════════════════════════════════════════════════
// SIMULATION MODEL
// ═══════════════════════════════════════════════════════════════════════
const TUNING = { D: 27, SYNERGY: 0.30 };
const DRAFT_BUDGET = 600;
const SEASON_WEEKS = 52;

function seasonStart(year){return new Date(`${year}-01-06`);} // First Monday
function weekToDate(week,year){
  const d=new Date(seasonStart(year||2026));
  d.setDate(d.getDate()+(week-1)*7);
  return d;
}
function weekToLabel(week,year){
  const d=weekToDate(week,year||2026);
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}
function weekToMonth(week){
  return weekToDate(week).getMonth(); // 0-11
}
function weekToYear(week){
  return weekToDate(week).getFullYear();
}

// Which weeks are salary paydays (1st of each month approx — first week of each month)
function isSalaryWeek(week){
  if(week===1) return true;
  const prev=weekToMonth(week-1);
  const curr=weekToMonth(week);
  return curr!==prev; // month changed
}

// Real CS 2026 calendar (approximate real schedule)
const EVENTS = [
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
const MAJOR_WEEKS = EVENTS.filter(e=>e.tier==="Major").map(e=>e.week);
const EVENT_WEEKS = EVENTS.map(e=>e.week);

// Monthly salary paydays in 2026 (week numbers when salary is due)
const SALARY_WEEKS = Array.from({length:SEASON_WEEKS},(_,i)=>i+1).filter(isSalaryWeek);

const ACTIVITIES = {
  practice: {label:"practice",desc:"drill a specific map. +4 map proficiency, +8 fatigue.",fatigue:8,icon:"p"},
  bootcamp: {label:"bootcamp",desc:"intensive training. All stats gain +1-2, +15 fatigue.",fatigue:15,icon:"t"},
  scrim:    {label:"scrim",desc:"practice match vs AI team. Form +1-2, chemistry +2, +10 fatigue.",fatigue:10,icon:"s"},
  vod:      {label:"vod review",desc:"study demos. Game sense & util +1, +5 fatigue.",fatigue:5,icon:"v"},
  scout:    {label:"scout rival",desc:"study a specific team. Get intel on their map pool and roster.",fatigue:3,icon:"sc"},
  rest:     {label:"rest",desc:"light week. -15 fatigue, no stat gains.",fatigue:-15,icon:"r"},
  vacation: {label:"vacation",desc:"full reset. -30 fatigue, +3 chemistry, form decays.",fatigue:-30,icon:"vc"},
};

const COACHES = [
  {name:"zonic",style:"Tactical",desc:"+2 game sense per bootcamp, +1 map prof per practice",salary:8,bonus:"tactical"},
  {name:"Jumpy",style:"Motivator",desc:"-3 fatigue per activity, +2 chemistry per scrim",salary:7,bonus:"motivator"},
  {name:"casle",style:"Analyst",desc:"+2 map proficiency per practice, better veto intel",salary:8,bonus:"analyst"},
  {name:"Robban",style:"Veteran",desc:"+1 mentality per bootcamp, reduced nerves penalty",salary:9,bonus:"veteran"},
  {name:"Floo",style:"Fitness",desc:"-5 extra fatigue per rest/vacation, +1 consistency per bootcamp",salary:6,bonus:"fitness"},
];

const FACILITIES = {
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

const RANDOM_EVENTS = [
  {id:"sponsor",text:"[$$] Sponsor deal! A brand offers a ${amt}K bonus if you place top 4 at the next event.",weight:8,apply:(s,t,rng)=>{const amt=30+Math.round(rng()*40);s.pendingBonus={condition:"top4",amount:amt};return`[$$] Sponsor offers ${amt}K bonus for top 4 finish`;}},
  {id:"injury",text:"[!] {player} tweaked their wrist in practice.",weight:6,apply:(s,t,rng)=>{const r=rosterOf(s,t);if(!r.length)return null;const p=r[Math.floor(rng()*r.length)];p.fatigue=Math.min(100,p.fatigue+15);return`[!] ${p.name} tweaked their wrist — +15 fatigue`;}},
  {id:"morale",text:"Team dinner boosts morale.",weight:7,apply:(s,t)=>{s.chemistry[t]=Math.min(100,(s.chemistry[t]||55)+4);return"[+] Team dinner night — +4 chemistry";}},
  {id:"media",text:"Media interview goes viral.",weight:5,apply:(s,t,rng)=>{const r=rosterOf(s,t);if(!r.length)return null;const p=r[Math.floor(rng()*r.length)];p.form=Math.min(12,p.form+2);return`[>] ${p.name}'s interview goes viral — confidence boost (+2 form)`;}},
  {id:"drama",text:"Internal disagreement.",weight:4,apply:(s,t)=>{s.chemistry[t]=Math.max(40,(s.chemistry[t]||55)-5);return"[!!] Argument in team comms — -5 chemistry";}},
  {id:"streamer",text:"Player streams and pops off.",weight:6,apply:(s,t,rng)=>{const r=rosterOf(s,t);if(!r.length)return null;const p=r[Math.floor(rng()*r.length)];p.aim=Math.min(99,p.aim+1);return`[>>] ${p.name} went on a sick FPL stream — +1 aim`;}},
  {id:"bootcamp_invite",text:"Bootcamp invite from another org.",weight:3,apply:(s,t)=>{rosterOf(s,t).forEach(p=>{p.gameSense=Math.min(99,p.gameSense+1);p.fatigue=Math.min(100,p.fatigue+5);});return"[>>] Guest bootcamp with a top team — +1 game sense (all), +5 fatigue";}},
  {id:"nothing",text:"Quiet week.",weight:20,apply:()=>null},
];

function playerOvr(p){return Math.round(0.20*p.aim+0.15*p.gameSense+0.10*p.util+0.08*p.igl+0.05*p.mentality+0.08*(p.rifle||p.aim)+0.06*(p.pistol||60)+0.06*(p.awp||50)+0.05*(p.clutch||50)+0.05*(p.entry||60)+0.04*(p.composure||p.mentality)+0.04*(p.stamina||60)+0.04*(p.experience||50));}
function marketValue(p){
  const ovr=playerOvr(p);
  let base;
  if(ovr>=93)      base=520;  // elite (s1mple★, dev1ce★)
  else if(ovr>=90) base=380;  // superstar
  else if(ovr>=87) base=250;  // star
  else if(ovr>=84) base=160;  // quality
  else if(ovr>=80) base=100;  // solid
  else if(ovr>=76) base=65;   // rotation
  else if(ovr>=72) base=45;   // budget
  else             base=30;   // bargain
  // Legend premium: prime-era players cost 25% more
  if(p.era&&p.era!=="current") base=Math.round(base*1.25);
  return base;
}
function draftCost(p){
  const mv=marketValue(p);
  // Poaching from AI team costs 50% extra
  return p.team==="FA"?mv:Math.round(mv*1.5);
}
function getTeamOrder(myTeam,state){
  const all=[...AI_TEAMS,myTeam];
  // Filter to only teams that have players
  const active=state?all.filter(t=>t===myTeam||rosterOf(state,t).length>=3):all;
  if(state&&state.rankings){
    return active.sort((a,b)=>(state.rankings[b]||0)-(state.rankings[a]||0));
  }
  return active;
}
function getSeed(myTeam,state){return Object.fromEntries(getTeamOrder(myTeam,state).map((t,i)=>[t,i+1]));}

const RANKING_POINTS={1:1000,2:600,3:350,4:350,5:150,6:150,7:150,8:150,9:50,10:50,11:50,12:50,13:50,14:50,15:50,16:50};
const TIER_MULT={Major:3,A:2,B:1};

function updateRankings(state,placements,tier){
  const mult=TIER_MULT[tier]||1;
  Object.entries(placements).forEach(([team,place])=>{
    const pts=(RANKING_POINTS[place]||30)*mult;
    // Decay old points slightly, add new
    state.rankings[team]=Math.round((state.rankings[team]||0)*0.85+pts);
  });
}

function getRankedTeams(state,myTeam){
  const all=[...AI_TEAMS,myTeam];
  return all.map(t=>({team:t,pts:state.rankings[t]||0})).sort((a,b)=>b.pts-a.pts);
}

function aiRosterMoves(state,myTeam){
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

function initState(eras){
  const activeEras=eras||["current"];
  const clamp=(v,lo=30,hi=99)=>Math.max(lo,Math.min(hi,Math.round(v)));
  let filtered=PLAYERS_INIT.filter(p=>activeEras.includes(p.era||"current"));
  // Deduplicate: if same base name exists across eras, prefer ★ (prime) version
  const seen={};
  const deduped=[];
  // Sort: ★ first, then by OVR desc — so ★ version wins dedup
  filtered.sort((a,b)=>{
    const aLegend=a.name.includes("★")?1:0;
    const bLegend=b.name.includes("★")?1:0;
    if(bLegend!==aLegend) return bLegend-aLegend; // legends first
    const ovrA=0.40*a.aim+0.25*a.gameSense+0.20*a.util+0.10*a.igl+0.05*a.mentality;
    const ovrB=0.40*b.aim+0.25*b.gameSense+0.20*b.util+0.10*b.igl+0.05*b.mentality;
    return ovrB-ovrA;
  });
  for(const p of filtered){
    // Strip ★ and trailing digits (Snax2 → Snax, HooXi2 → HooXi are DIFFERENT players, keep them)
    // Only deduplicate if the ★ stripped name matches exactly (no numeric suffix)
    const baseName=p.name.endsWith("★")?p.name.slice(0,-1).trim():p.name.replace("★","").trim();
    // If baseName has a trailing digit that the pair doesn't (e.g. Snax vs Snax★), deduplicate
    // If it's something like HooXi2 (internal disambiguation), keep it
    const key=baseName.replace(/\d+$/,"");
    const isInternalDupe=p.name.match(/\d+$/); // HooXi2, Spinx2 etc
    const dedupeKey=isInternalDupe?p.name:key;
    if(!seen[dedupeKey]){seen[dedupeKey]=true;deduped.push(p);}
  }
  const players=deduped.map(p=>{
    const rng=()=>Math.random()*10-5; // ±5 noise
    return{...p,form:0,fatigue:20+Math.random()*20|0,
      // Derived combat stats
      rifle:  clamp(p.aim*0.65+p.consistency*0.35+rng()),
      pistol: clamp(p.aim*0.45+p.mentality*0.3+p.gameSense*0.25+rng()),
      awp:    clamp(p.role==="AWP"?p.aim*0.8+p.mentality*0.2+rng()*0.5 : p.aim*0.4+p.gameSense*0.2+rng()),
      clutch: clamp(p.traits.includes("clutch")?p.gameSense*0.5+p.mentality*0.5+10+rng() : p.gameSense*0.4+p.mentality*0.35+p.aim*0.25+rng()),
      entry:  clamp(p.role==="Entry"?p.aim*0.7+p.mentality*0.3+8+rng() : p.aim*0.5+p.mentality*0.25+p.gameSense*0.25+rng()),
      // Derived mental/physical stats
      stamina:    clamp(p.consistency*0.4+p.mentality*0.3+(p.age<=25?15:p.age>=30?-5:5)+rng()),
      composure:  clamp(p.mentality*0.6+p.consistency*0.2+p.gameSense*0.2+rng()),
      experience: clamp(Math.min(99, 30+p.age*2+(p.traits.includes("leader")?10:0)+rng())),
    };
  });
  const chemistry={};
  AI_TEAMS.forEach(t=>{chemistry[t]=70;});
  const stats={};
  const career={};
  players.forEach(p=>{
    stats[p.name]={maps:0,rating:0,mvps:0,clutches:0};
    career[p.name]={
      totalMaps:0,totalMvps:0,totalClutches:0,avgRating:0,bestRating:0,
      eventHistory:[], // [{eventNum,maps,rating,mvps,clutches}]
      mapStats:{}, // {mapName:{maps:0,wins:0,avgRating:0}}
      origStats:{aim:p.aim,gameSense:p.gameSense,util:p.util,igl:p.igl,mentality:p.mentality,consistency:p.consistency,rifle:p.rifle,pistol:p.pistol,awp:p.awp,clutch:p.clutch,entry:p.entry,stamina:p.stamina,composure:p.composure,experience:p.experience},
      kills:0 // approximate total frags
    };
  });
  const mapProf={};
  [...AI_TEAMS,"FA"].forEach(t=>{mapProf[t]=profileFor(t);});
  const rivalries={};
  const rankings={};
  AI_TEAMS.forEach((t,i)=>{rankings[t]=1000-i*50;});

  // If current era is not active, AI teams have no players — auto-assign from FA pool
  if(!activeEras.includes("current")){
    const reserveForUser=10;
    const totalFA=players.filter(p=>p.team==="FA").length;
    const maxAssign=Math.max(0,totalFA-reserveForUser);
    let assigned=0;
    for(const team of AI_TEAMS){
      if(assigned>=maxAssign) break;
      let count=0;
      for(const p of players){
        if(p.team!=="FA"||count>=5||assigned>=maxAssign) continue;
        p.team=team;p.contract=2;
        count++;assigned++;
      }
    }
  }

  return {players,chemistry,stats,career,mapProf,rivalries,rankings,coach:null,pendingBonus:null};
}

function rosterOf(state,team){return state.players.filter(p=>p.team===team);}
function freeAgents(state){return state.players.filter(p=>p.team==="FA");}

function teamBase(state,team){
  const r=rosterOf(state,team);
  if(r.length===0) return 0;
  const mean=k=>r.reduce((s,p)=>s+p[k],0)/r.length;
  const igl=r.reduce((b,p)=>p.igl>b.igl?p:b,r[0]);
  const core=0.45*mean("aim")+0.25*mean("gameSense")+0.20*mean("util")+0.10*igl.igl;
  const formAdj=mean("form");
  const chem=(state.chemistry[team]||70)/100;
  // fatigue penalty: avg fatigue over 50 reduces effective rating
  const avgFatigue=mean("fatigue");
  const fatiguePenalty=avgFatigue>50?(avgFatigue-50)*0.08:0;
  return core*(0.85+TUNING.SYNERGY*chem)+formAdj-fatiguePenalty;
}

function profileFor(team){
  let s=0;for(const c of team)s=(s*31+c.charCodeAt(0))>>>0;
  const rng=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  const p={};MAPS.forEach(m=>{p[m]=Math.round(45+rng()*50);});return p;
}

function getMapProf(state,team){
  if(!state.mapProf[team]) state.mapProf[team]=profileFor(team);
  return state.mapProf[team];
}

function mapRating(state,team,map){
  return teamBase(state,team)*(0.70+0.006*(getMapProf(state,team)[map]||50));
}

// ── rivalries ────────────────────────────────────────────────────────
function rivalryKey(a,b){return [a,b].sort().join("|");}
function getRivalry(state,a,b){return state.rivalries[rivalryKey(a,b)]||null;}
function recordMatch(state,winner,loser){
  const k=rivalryKey(winner,loser);
  if(!state.rivalries[k]) state.rivalries[k]={wins:{},matches:0,isRival:false};
  const r=state.rivalries[k];
  r.matches++;
  r.wins[winner]=(r.wins[winner]||0)+1;
  // rival after 3+ meetings with 2+ wins for one side
  if(r.matches>=3){
    const vals=Object.values(r.wins);
    if(vals.some(v=>v>=2)) r.isRival=true;
  }
}
function isRivalMatch(state,a,b){const r=getRivalry(state,a,b);return r&&r.isRival;}

function nervesModifier(state,A,B,ctx){
  const rOf=t=>rosterOf(state,t);
  const compA=rOf(A).reduce((s,p)=>s+(p.composure||p.mentality),0)/(rOf(A).length||1);
  const compB=rOf(B).reduce((s,p)=>s+(p.composure||p.mentality),0)/(rOf(B).length||1);
  const expA=rOf(A).reduce((s,p)=>s+(p.experience||50),0)/(rOf(A).length||1);
  const expB=rOf(B).reduce((s,p)=>s+(p.experience||50),0)/(rOf(B).length||1);
  const pressure={group:0.05,qf:0.12,sf:0.18,final:0.28}[ctx.stage]||0.08;
  let mod=(compA-compB)*pressure;
  // experience helps on big stages
  mod+=(expA-expB)*pressure*0.3;
  if(isRivalMatch(state,A,B)) mod+=(Math.random()-0.5)*3;
  return mod;
}

function autoVeto(state,A,B,bo){
  let rem=[...MAPS];
  const steps=bo===5
    ?[[A,"ban"],[B,"ban"],[A,"pick"],[B,"pick"],[A,"pick"],[B,"pick"]]
    :[[A,"ban"],[B,"ban"],[A,"pick"],[B,"pick"],[A,"ban"],[B,"ban"]];
  const picks=[];
  for(const[me,action]of steps){
    const opp=me===A?B:A;
    let best=rem[0],bestVal=-Infinity;
    for(const m of rem){const v=action==="ban"?(mapRating(state,opp,m)-mapRating(state,me,m)):(mapRating(state,me,m)-mapRating(state,opp,m));if(v>bestVal){bestVal=v;best=m;}}
    rem=rem.filter(m=>m!==best);
    if(action==="pick")picks.push(best);
  }
  picks.push(rem[0]);
  return picks;
}

function resolveMap(state,map,A,B,ctx,rng){
  // ── Round-by-round CS economy engine ──
  const rA=rosterOf(state,A), rB=rosterOf(state,B);
  const strA=mapRating(state,A,map)+nervesModifier(state,A,B,ctx)+(ctx.decider?(rng()-0.5)*3:0);
  const strB=mapRating(state,B,map)-nervesModifier(state,A,B,ctx)+(ctx.decider?(rng()-0.5)*3:0);
  const rival=isRivalMatch(state,A,B);

  // Economy state per team
  const econ={[A]:{money:800,lossStreak:0,roundsWon:0},[B]:{money:800,lossStreak:0,roundsWon:0}};
  const LOSS_BONUS=[1400,1900,2400,2900,3400];
  const WIN_BONUS=3250;
  const FULL_BUY=4100;const FORCE_BUY=2000;
  const AWP_COST=4750;

  function buyType(team){
    const m=econ[team].money;
    if(m>=AWP_COST+500) return "awp_buy"; // full buy + AWP for best player
    if(m>=FULL_BUY) return "full";
    if(m>=FORCE_BUY) return "force";
    return "eco";
  }

  // Per-player performance for the map (enriched with new stats)
  const perfOf=(team)=>rosterOf(state,team).map(p=>{
    const staminaMod=(p.stamina||70)/100; // high stamina = less fatigue impact
    const fatigueNoise=p.fatigue>70?(p.fatigue-70)*0.15*(1-staminaMod*0.5):0;
    const spread=30*(1-p.consistency/100)+fatigueNoise;
    const noise=(rng()-0.5)*2*spread;
    const base=(p.aim+p.gameSense)/2+p.form;
    return {name:p.name,perf:base+noise,traits:p.traits,team,aim:p.aim,role:p.role,
      rifle:p.rifle||p.aim,pistol:p.pistol||60,awp:p.awp||50,clutch:p.clutch||50,
      entry:p.entry||60,composure:p.composure||p.mentality,experience:p.experience||50,stamina:p.stamina||60};
  });
  const perfA=perfOf(A).sort((a,b)=>b.perf-a.perf);
  const perfB=perfOf(B).sort((a,b)=>b.perf-a.perf);
  const starOf=(team)=>team===A?perfA[0]:perfB[0];
  const awperOf=(team)=>{const r=team===A?perfA:perfB;return r.find(p=>p.role==="AWP")||r[0];};
  const entryOf=(team)=>{const r=team===A?perfA:perfB;return r.find(p=>p.role==="Entry")||r.sort((a,b)=>b.entry-a.entry)[0];};
  // Team-level combat averages for round resolution
  const teamCombat=(team,buyType)=>{
    const r=team===A?perfA:perfB;
    const avg=k=>r.reduce((s,p)=>s+p[k],0)/r.length;
    if(buyType==="eco") return avg("pistol")/100;
    if(buyType==="force") return (avg("pistol")*0.6+avg("rifle")*0.4)/100;
    if(buyType==="awp_buy") return (avg("rifle")*0.7+awperOf(team).awp*0.3)/100;
    return avg("rifle")/100; // full buy
  };

  const BUYMATCH={awp_buy:{awp_buy:.50,full:.55,force:.70,eco:.88},full:{awp_buy:.45,full:.50,force:.65,eco:.85},force:{awp_buy:.30,full:.35,force:.50,eco:.65},eco:{awp_buy:.12,full:.15,force:.35,eco:.50}};

  const rounds=[];
  let scoreA=0,scoreB=0;
  let side=0;
  let prevWinner=null;

  // Track if team is choosing to save (eco to build up for full buy)
  const saving={[A]:false,[B]:false};

  function decideBuy(team){
    const m=econ[team].money;
    // After losing, teams often save 1-2 rounds to get a full buy
    // If we can't afford full buy, but saving one more round would get us there, eco
    if(m<FULL_BUY){
      const nextRoundMoney=m+LOSS_BONUS[Math.min(econ[team].lossStreak,4)];
      if(nextRoundMoney>=FULL_BUY&&m>=FORCE_BUY){
        // Could force, but saving gets us full buy next round — save
        saving[team]=true;
        return "eco";
      }
      if(m<FORCE_BUY){saving[team]=true;return "eco";}
      // Force buy if losing streak is 3+ (desperate) or if it's match point
      if(econ[team].lossStreak>=3||scoreA>=12||scoreB>=12) return "force";
      // Otherwise save
      saving[team]=true;
      return "eco";
    }
    saving[team]=false;
    if(m>=AWP_COST+500) return "awp_buy";
    return "full";
  }

  function playRound(roundNum){
    // Determine buy type (includes save logic)
    const btA=decideBuy(A), btB=decideBuy(B);

    // Deduct buy cost
    [A,B].forEach(team=>{
      const bt=team===A?btA:btB;
      if(bt==="awp_buy") econ[team].money-=4750+3*2700+1000;
      else if(bt==="full") econ[team].money-=5*2700+1500;
      else if(bt==="force") econ[team].money-=5*1500+500;
      // eco: keep money (save for next round)
      econ[team].money=Math.max(0,econ[team].money);
    });
    let pA=BUYMATCH[btA]?.[btB]??0.50;
    const combatEdge=(teamCombat(A,btA)-teamCombat(B,btB))*0.15;
    const skillEdge=(strA-strB)/120+combatEdge;
    pA=Math.max(0.05,Math.min(0.95,pA+skillEdge));
    const ctBonus=0.03;
    if(side===0) pA+=ctBonus; else pA-=ctBonus;
    if(econ[A].lossStreak===0&&scoreA>0) pA+=0.02;
    if(econ[B].lossStreak===0&&scoreB>0) pA-=0.02;
    if(rival) pA+=(rng()-0.5)*0.06;

    const aWins=rng()<pA;
    const winner=aWins?A:B, loser=aWins?B:A;
    prevWinner=winner;

    econ[winner].money+=WIN_BONUS;
    econ[winner].lossStreak=0;
    const ls=Math.min(econ[loser].lossStreak,4);
    econ[loser].money+=LOSS_BONUS[ls];
    econ[loser].lossStreak++;

    if(aWins) scoreA++; else scoreB++;

    const star=starOf(winner);
    const awper=awperOf(winner);
    const entryPlayer=entryOf(winner);
    const lStar=starOf(loser);
    const bestClutcher=(t)=>{const r=t===A?perfA:perfB;return [...r].sort((a,b)=>(b.clutch||50)-(a.clutch||50))[0];};
    const clutcher=bestClutcher(winner);
    const isClutch=rng()<((clutcher.clutch||50)/100)*0.18;
    const isAce=rng()<0.04;
    const isEcoUpset=(btA==="eco"&&(btB==="full"||btB==="awp_buy")&&aWins)||(btB==="eco"&&(btA==="full"||btA==="awp_buy")&&!aWins);
    const isEntryPlay=rng()<((entryPlayer.entry||60)/100)*0.20;

    let narrative="";
    const wBuy=aWins?btA:btB, lBuy=aWins?btB:btA;

    if(isEcoUpset){
      const bestPistol=[...(aWins?perfA:perfB)].sort((a,b)=>(b.pistol||50)-(a.pistol||50))[0];
      const wpn=rng()<0.4?"Deagle":rng()<0.6?"P250":"USP";
      narrative=`ECO UPSET! ${bestPistol.name} (${bestPistol.pistol} PST) leads a ${wpn} charge`;
    } else if(isAce){
      narrative=`${star.name} ACE! Tears through all five with a ${wBuy==="awp_buy"?"AWP":"rifle"}`;
    } else if(isClutch){
      const situation=["1v2","1v3","1v1"][Math.floor(rng()*3)];
      narrative=`${clutcher.name} (${clutcher.clutch} CLT) wins a ${situation} clutch`;
    } else if(isEntryPlay){
      narrative=`${entryPlayer.name} (${entryPlayer.entry} ENT) opens with an entry frag, ${winner} convert`;
    } else if(wBuy==="awp_buy"&&rng()<0.35){
      narrative=`${awper.name} (${awper.awp} AWP) gets two picks, ${winner} clean up`;
    } else if(lBuy==="eco"||lBuy==="force"){
      if(rng()<0.4) narrative=`${winner} clean up the ${lBuy==="eco"?"eco":"force buy"}`;
      else narrative=`Sloppy from ${winner} — ${lStar.name} gets two kills but can't close it`;
    } else {
      const descs=[
        `${star.name} opens the round with a key frag, ${winner} trade out to win`,
        `Textbook execute from ${winner}, ${loser} can't retake`,
        `${winner} win a scrappy aim duel round, ${star.name} finishes with 3K`,
        `Post-plant hold from ${winner}, ${lStar.name} falls trying to defuse`,
        `Mid-round call from ${winner} catches ${loser} rotating late`,
      ];
      narrative=descs[Math.floor(rng()*descs.length)];
    }

    rounds.push({
      round:roundNum,winner,loser,scoreA,scoreB,
      buyA:btA,buyB:btB,moneyA:econ[A].money,moneyB:econ[B].money,
      narrative,isClutch,isEcoUpset,isAce,
      side:side===0?"first":"second"
    });
  }

  // Regulation: first to 13, switch sides at 12 rounds
  let roundNum=0;
  while(scoreA<13&&scoreB<13){
    roundNum++;
    if(roundNum===13){side=1;} // half-time: switch sides
    // Half-time economy reset
    if(roundNum===13){econ[A].money=800;econ[B].money=800;econ[A].lossStreak=0;econ[B].lossStreak=0;}
    playRound(roundNum);
  }

  // Overtime (MR3: first to 16, then 19, etc.)
  while(scoreA===scoreB){
    // OT reset
    econ[A].money=16000;econ[B].money=16000;
    econ[A].lossStreak=0;econ[B].lossStreak=0;
    const target=scoreA+4; // need 4 more (MR3 = play up to 3 each side, first to +4 total)
    let otRounds=0;
    while(scoreA<target&&scoreB<target&&otRounds<6){
      roundNum++;otRounds++;
      if(otRounds===4){side=1-side;econ[A].money=16000;econ[B].money=16000;}
      playRound(roundNum);
    }
  }

  const aWon=scoreA>scoreB;
  const finalScore=aWon?[scoreA,scoreB]:[scoreB,scoreA];

  // Stats tracking
  const allPerf=[...perfA,...perfB];
  allPerf.forEach(pp=>{
    const st=state.stats[pp.name];if(!st)return;
    st.maps++;st.rating=(st.rating*(st.maps-1)+pp.perf/90)/st.maps;
    // Career map stats
    const c=state.career?.[pp.name];
    if(c){
      if(!c.mapStats[map])c.mapStats[map]={maps:0,wins:0,avgRating:0};
      const ms=c.mapStats[map];
      const r=pp.perf/90;
      ms.avgRating=(ms.avgRating*ms.maps+r)/(ms.maps+1);
      ms.maps++;
      if((aWon&&pp.team===A)||(!aWon&&pp.team===B)) ms.wins++;
      c.kills+=Math.round(10+pp.perf/15); // approximate kill count
    }
  });
  const carry=aWon?perfA[0]:perfB[0];
  const anchor=aWon?perfB[perfB.length-1]:perfA[perfA.length-1];
  if(carry.traits.includes("clutch")&&Math.min(scoreA,scoreB)>=9){const s=state.stats[carry.name];if(s)s.clutches++;}
  if(state.stats[carry.name])state.stats[carry.name].mvps++;

  const triggers=[];
  if(carry.traits.includes("clutch")&&Math.min(scoreA,scoreB)>=9)triggers.push({who:carry.name,what:"clutch_carry"});
  if(carry.traits.includes("boom"))triggers.push({who:carry.name,what:"supernova"});
  if(anchor.traits.includes("boom"))triggers.push({who:anchor.name,what:"boom_bust_low"});
  if(rival)triggers.push({who:aWon?A:B,what:"rivalry_win"});
  const ecoUpsets=rounds.filter(r=>r.isEcoUpset).length;
  if(ecoUpsets>=2)triggers.push({who:aWon?A:B,what:"eco_heroes"});

  return {map,winnerName:aWon?A:B,loserName:aWon?B:A,score:finalScore,pA:strA/(strA+strB),carry:carry.name,anchor:anchor.name,carryTeam:aWon?A:B,triggers,wPerf:aWon?perfA:perfB,lPerf:aWon?perfB:perfA,rival,rounds,teamA:A,teamB:B};
}

function driftForm(state,teamA,teamB,results){
  const winner=results.filter(r=>r.winnerName===teamA).length>results.filter(r=>r.winnerName===teamB).length?teamA:teamB;
  [teamA,teamB].forEach(team=>{
    const won=team===winner;
    rosterOf(state,team).forEach(p=>{
      const shift=won?1.5+Math.random()*1.5:-(1+Math.random()*2);
      p.form=Math.max(-12,Math.min(12,p.form+shift));
      p.fatigue=Math.min(100,p.fatigue+3);
      // Experience grows from playing matches
      if(p.experience!==undefined&&p.experience<99) p.experience=Math.min(99,p.experience+(Math.random()<0.15?1:0));
    });
    if(won)state.chemistry[team]=Math.min(100,(state.chemistry[team]||70)+2);
    else state.chemistry[team]=Math.max(40,(state.chemistry[team]||70)-3);
  });
}

function recapLine(r){
  const w=Math.max(...r.score),l=Math.min(...r.score);
  const stomp=w-l>=8,close=w-l<=3,ot=l>=13;
  const rivalTag=r.rival?" in a heated rivalry clash":"";
  const ecoTag=r.rounds?.filter(x=>x.isEcoUpset).length>=2?" with multiple eco upsets":"";
  const flow=ot?`${r.map} went to overtime${rivalTag}`:stomp?`${r.winnerName} dominated ${r.map}${rivalTag}`:close?`${r.map} was razor-thin${rivalTag}${ecoTag}`:`${r.winnerName} took ${r.map}${rivalTag}`;
  const trig=r.triggers?.[0];
  const carryLine=trig?.what==="clutch_carry"?`${r.carry} hit every clutch when it mattered`
    :trig?.what==="supernova"?`${r.carry} went supernova on the server`
    :trig?.what==="eco_heroes"?`${r.carry} led crucial eco rounds`
    :`${r.carry} top-fragged the lobby`;
  return `${flow}, ${w}-${l}. ${carryLine}. ${r.anchor} couldn't get anything going.`;
}

function playSeries(state,A,B,bo,ctx,rng,fixedMaps){
  const mapList=fixedMaps||autoVeto(state,A,B,bo);
  const need=bo===5?3:bo===3?2:1;
  const results=[];let aw=0,bw=0;
  for(let i=0;i<mapList.length;i++){
    const r=resolveMap(state,mapList[i],A,B,{...ctx,decider:i===mapList.length-1&&i>=2},rng);
    results.push(r);
    if(r.winnerName===A)aw++;else bw++;
    if(aw===need||bw===need)break;
  }
  driftForm(state,A,B,results);
  const winner=aw>=need?A:B,loser=aw>=need?B:A;
  recordMatch(state,winner,loser);
  return {winnerName:winner,loserName:loser,maps:results,seriesScore:[aw,bw],bo,mapList,scoreLine:bo===1?`${Math.max(...results[0].score)}-${Math.min(...results[0].score)}`:undefined};
}

// ── calendar / training ──────────────────────────────────────────────
function applyActivity(state,team,activity,mapChoice,facilities){
  const roster=rosterOf(state,team);
  const coach=state.coach;
  const cb=coach?.bonus||null;
  const fac=facilities||{};
  const ghTier=fac.gaming_house||0;
  const bcTier=fac.bootcamp_center||0;
  const psTier=fac.psychologist||0;
  const anTier=fac.analytics||0;
  const mbTier=fac.medbay||0;
  // Fatigue: coach + gaming house reduce gain
  const ghBonus=[0,2,4,6][ghTier]||0;
  const mbBonus=(activity==="rest"||activity==="vacation")?([0,5,8][mbTier]||0):0;
  const fatMod=cb==="fitness"&&(activity==="rest"||activity==="vacation")?-5:cb==="motivator"?-3:0;
  roster.forEach(p=>{
    p.fatigue=Math.max(0,Math.min(100,p.fatigue+(ACTIVITIES[activity]?.fatigue||0)+fatMod-ghBonus-mbBonus));
  });
  if(activity==="practice"&&mapChoice){
    const prof=getMapProf(state,team);
    const profGain=4+(cb==="analyst"?2:0)+(cb==="tactical"?1:0)+(bcTier>=3?2:0);
    prof[mapChoice]=Math.min(95,(prof[mapChoice]||50)+profGain);
  } else if(activity==="bootcamp"){
    const bcExtra=[0,1,2,3][bcTier]||0;
    roster.forEach(p=>{
      const gain=()=>1+(bcExtra>0?1:0)+(Math.random()|0);
      p.aim=Math.min(99,p.aim+gain());p.gameSense=Math.min(99,p.gameSense+gain()+(cb==="tactical"?1:0));
      p.util=Math.min(99,p.util+gain());
      p.rifle=Math.min(99,(p.rifle||70)+gain());
      p.entry=Math.min(99,(p.entry||60)+gain());
      if(cb==="veteran"){p.mentality=Math.min(99,p.mentality+1);p.composure=Math.min(99,(p.composure||60)+1);}
      if(cb==="fitness"){p.consistency=Math.min(99,p.consistency+1);p.stamina=Math.min(99,(p.stamina||60)+1);}
      if(psTier>=1){p.composure=Math.min(99,(p.composure||60)+1);}
    });
  } else if(activity==="scrim"){
    roster.forEach(p=>{
      p.form=Math.max(-12,Math.min(12,p.form+1+Math.random()));
      // Scrims develop clutch and AWP slightly
      if(Math.random()<0.3) p.clutch=Math.min(99,(p.clutch||50)+1);
      if(Math.random()<0.2&&p.role==="AWP") p.awp=Math.min(99,(p.awp||50)+1);
      if(Math.random()<0.2) p.pistol=Math.min(99,(p.pistol||50)+1);
    });
    state.chemistry[team]=Math.min(100,(state.chemistry[team]||70)+2+(cb==="motivator"?2:0));
  } else if(activity==="vod"){
    const anExtra=anTier>=2?2:anTier>=1?1:0;
    roster.forEach(p=>{
      p.gameSense=Math.min(99,p.gameSense+1+anExtra);p.util=Math.min(99,p.util+1);
    });
  } else if(activity==="rest"){
    // fatigue already handled above
  } else if(activity==="vacation"){
    state.chemistry[team]=Math.min(100,(state.chemistry[team]||70)+3);
    roster.forEach(p=>{p.form=p.form*0.7;});
  }
  // age-based development/decline per week (subtle)
  roster.forEach(p=>{
    if(p.age<=22){
      if(Math.random()<0.15){const sk=["aim","gameSense","util","mentality"][Math.random()*4|0];p[sk]=Math.min(99,p[sk]+1);}
    } else if(p.age>=29){
      if(Math.random()<0.10){const sk=["aim","consistency","mentality"][Math.random()*3|0];p[sk]=Math.max(40,p[sk]-1);}
    }
  });
}

function rollRandomEvent(state,team){
  const totalWeight=RANDOM_EVENTS.reduce((s,e)=>s+e.weight,0);
  let roll=Math.random()*totalWeight;
  for(const ev of RANDOM_EVENTS){
    roll-=ev.weight;
    if(roll<=0) return ev.apply(state,team,Math.random);
  }
  return null;
}

function generateProspect(year){
  const roles=["IGL","AWP","Entry","Lurk","Support"];
  const role=roles[Math.floor(Math.random()*roles.length)];
  const firstNames=["kai","luka","nyx","rio","axel","zeno","mars","dex","finn","koda","jett","sage","raze","sova","omen"];
  const name=firstNames[Math.floor(Math.random()*firstNames.length)]+(year-2025)+"x"+Math.floor(Math.random()*99);
  const talent=40+Math.floor(Math.random()*30); // base talent 40-70
  const age=16+Math.floor(Math.random()*2);
  return{team:"ACADEMY",name,role,aim:talent+Math.floor(Math.random()*15),gameSense:talent+Math.floor(Math.random()*10),util:talent+Math.floor(Math.random()*10),igl:role==="IGL"?talent+15:talent-10,mentality:40+Math.floor(Math.random()*25),consistency:35+Math.floor(Math.random()*25),traits:Math.random()<0.15?["boom"]:Math.random()<0.08?["clutch"]:[],salary:5+Math.floor(Math.random()*3),contract:0,age,era:"current",form:0,fatigue:5,
    rifle:talent+Math.floor(Math.random()*12),pistol:talent+Math.floor(Math.random()*10),awp:role==="AWP"?talent+12:talent-8,clutch:35+Math.floor(Math.random()*20),entry:role==="Entry"?talent+12:talent,stamina:55+Math.floor(Math.random()*20),composure:35+Math.floor(Math.random()*20),experience:25+Math.floor(Math.random()*10),
    weeksInAcademy:0};
}

function developProspect(p){
  p.weeksInAcademy=(p.weeksInAcademy||0)+1;
  // Develop monthly (every 4 weeks)
  if(p.weeksInAcademy%4!==0) return;
  const gain=()=>Math.random()<0.5?1:0;
  p.aim=Math.min(85,p.aim+gain());p.gameSense=Math.min(85,p.gameSense+gain());
  p.rifle=Math.min(85,(p.rifle||50)+gain());p.pistol=Math.min(80,(p.pistol||45)+gain());
  p.entry=Math.min(80,(p.entry||45)+gain());p.clutch=Math.min(75,(p.clutch||35)+gain());
  p.composure=Math.min(70,(p.composure||35)+gain());p.experience=Math.min(60,(p.experience||25)+gain());
}

function autoSimWeeks(state,team,fromWeek,toWeek){
  // Auto-manage weeks: smart activity selection + random events
  const log=[];
  for(let w=fromWeek;w<toWeek;w++){
    const roster=rosterOf(state,team);
    const avgFat=roster.length?roster.reduce((s,p)=>s+p.fatigue,0)/roster.length:0;
    const nextEv=EVENTS.find(e=>e.week>w);
    const weeksToEvent=nextEv?nextEv.week-w:99;
    // Smart activity: rest if tired, train if event is close, otherwise mix
    let act,mc=null;
    if(avgFat>70) act="rest";
    else if(avgFat>55&&weeksToEvent>2) act="rest";
    else if(weeksToEvent<=2&&avgFat>40) act="rest"; // taper before event
    else if(weeksToEvent<=3) act=Math.random()<0.5?"scrim":"vod"; // light prep
    else act=["practice","bootcamp","scrim","vod"][Math.floor(Math.random()*4)];
    if(act==="practice") mc=MAPS[Math.floor(Math.random()*MAPS.length)];
    applyActivity(state,team,act,mc);
    aiWeekActivity(state);
    const evMsg=rollRandomEvent(state,team);
    log.push({week:w,activity:act,mapChoice:mc,event:evMsg||null});
  }
  return log;
}

function aiWeekActivity(state){
  // AI teams auto-manage each week
  AI_TEAMS.forEach(team=>{
    const roster=rosterOf(state,team);
    if(roster.length===0) return;
    const avgFat=roster.reduce((s,p)=>s+p.fatigue,0)/roster.length;
    let act;
    if(avgFat>75) act="rest";
    else if(avgFat>60) act=Math.random()<0.5?"rest":"vod";
    else act=["practice","bootcamp","scrim","vod"][Math.random()*4|0];
    const mapChoice=act==="practice"?MAPS[Math.random()*MAPS.length|0]:null;
    applyActivity(state,team,act,mapChoice);
  });
}

// ── tournament structure ─────────────────────────────────────────────
function snapshotEventStats(simState,eventNum){
  Object.entries(simState.stats).forEach(([name,s])=>{
    if(s.maps===0)return;
    const c=simState.career?.[name];
    if(!c)return;
    c.eventHistory.push({eventNum,maps:s.maps,rating:+s.rating.toFixed(3),mvps:s.mvps,clutches:s.clutches});
    c.totalMaps+=s.maps;c.totalMvps+=s.mvps;c.totalClutches+=s.clutches;
    c.avgRating=c.eventHistory.length>0?c.eventHistory.reduce((a,e)=>a+e.rating,0)/c.eventHistory.length:0;
    if(s.rating>c.bestRating)c.bestRating=+s.rating.toFixed(3);
  });
}

function buildGroups(myTeam,simState){
  let order=getTeamOrder(myTeam,simState);
  // Need exactly 16 for 4 groups of 4; if fewer, pad with existing teams or truncate
  while(order.length<16){order.push(order[order.length-1]||myTeam);} // shouldn't happen with current era
  order=order.slice(0,16);
  const g=[[],[],[],[]];
  order.forEach((t,i)=>{const r=Math.floor(i/4),c=i%4;g[r%2===0?c:3-c].push(t);});
  return g;
}
function standingsOf(table){return Object.values(table).sort((a,b)=>b.w-a.w||b.rd-a.rd);}

// ── Swiss System Engine ──────────────────────────────────────────────
// 3W=advance, 3L=eliminated. Bo1 for 0-0/1-0/0-1, Bo3 for 2-X or X-2 (elim/adv matches)
function swissBo(w,l){return(w>=2||l>=2)?3:1;}

function swissPairings(teams,records){
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

function newSwiss(myTeam,simState,teams){
  const records=Object.fromEntries(teams.map(t=>[t,{w:0,l:0,buchholz:0,matches:[]}]));
  return {myTeam,teams,records,rounds:[],advanced:[],eliminated:[],stage:"swiss",bracket:null,champion:null,simState,rng:Math.random};
}

function swissRound(s){
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

function resolveSwissFix(s,fx){
  const {res}=fx;
  s.records[res.winnerName].w++;s.records[res.loserName].l++;
  s.records[res.winnerName].matches.push(fx);s.records[res.loserName].matches.push(fx);
  s.teams.forEach(t=>{
    if(s.records[t].w>=3&&!s.advanced.includes(t)) s.advanced.push(t);
    if(s.records[t].l>=3&&!s.eliminated.includes(t)) s.eliminated.push(t);
  });
}

function swissDone(s){
  return s.teams.every(t=>s.records[t].w>=3||s.records[t].l>=3);
}

function nextSwissFix(s){
  for(const rd of s.rounds){const f=rd.fixtures.find(f=>f.mine&&!f.done);if(f)return f;}
  return null;
}

// Build playoff bracket from top N swiss advancers
function seedPlayoff(advancers,bo3,bo5Final){
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

function resolvePlayoffAI(bracket,myTeam,simState,rng){
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

function nextPlayoffFix(bracket,myTeam){
  const rounds=bracket.qf?["qf","sf","final"]:bracket.sf?["sf","final"]:["final"];
  for(const r of rounds){
    const list=r==="final"?[bracket.final]:bracket[r];
    for(const fx of list)if(!fx.done&&fx.a&&fx.b&&(fx.a===myTeam||fx.b===myTeam))return{fx,round:r};
  }
  return null;
}

function newTournament(myTeam,simState){
  snapshotEventStats(simState,simState._eventCounter||0);simState._eventCounter=(simState._eventCounter||0)+1;
  Object.keys(simState.stats).forEach(k=>{simState.stats[k]={maps:0,rating:0,mvps:0,clutches:0};});
  // Major: 16-team Swiss → top 8 → playoffs Bo3/Bo5 final
  const teams=getTeamOrder(myTeam,simState).slice(0,16);
  const swiss=newSwiss(myTeam,simState,teams);
  swissRound(swiss); // run round 1
  return {myTeam,swiss,stage:"swiss",bracket:null,champion:null,simState,rng:Math.random,isMajor:true,
    advanceCount:8,prizeTable:{1:500,2:300,4:180,8:100,9:50,16:30}};
}

function allGroupsDone(t){return swissDone(t.swiss);}

function seedBracket(t){
  const advancers=t.swiss.advanced.slice(0,t.advanceCount||8);
  t.bracket=seedPlayoff(advancers,3,true);
  resolvePlayoffAI(t.bracket,t.myTeam,t.simState,t.rng);
}

function resolveAIFixtures(t,round){resolvePlayoffAI(t.bracket,t.myTeam,t.simState,t.rng);}
function propagate(b){resolvePlayoffAI(b,null,null,null);} // no-op, handled inline

function bracketElim(b,team){
  const rounds=b.qf?["qf","sf","final"]:b.sf?["sf","final"]:["final"];
  for(const r of rounds){const list=r==="final"?[b.final]:b[r];for(const f of list)if(f.done&&f.res&&f.res.loserName===team)return true;}
  return false;
}

function placementOf(t){
  if(!t||t.stage!=="done")return 16;
  const br=t.bracket;if(!br)return 16;
  const fr=br.final.res;
  if(fr.winnerName===t.myTeam)return 1;if(fr.loserName===t.myTeam)return 2;
  if(br.sf){for(const s of br.sf)if(s.done&&s.res&&s.res.loserName===t.myTeam)return 4;}
  if(br.qf){for(const q of br.qf)if(q.done&&q.res&&q.res.loserName===t.myTeam)return 9;}
  return t.swiss?.eliminated?.includes(t.myTeam)?t.teams?.length||16:12;
}
function prizeMoney(place){return{1:500,2:300,4:180,8:100,9:50,16:30}[place]||30;}
function decayFormBetweenEvents(simState){simState.players.forEach(p=>{p.form=p.form*0.4;});}
function tickContracts(simState,myTeam){
  simState.players.forEach(p=>{if(p.team==="FA")return;if(p.contract>0)p.contract--;if(p.contract<=0&&p.team!==myTeam){p.team="FA";}});
}

// ── A/B tier tournaments (also Swiss) ────────────────────────────────
function newMiniTournament(myTeam,simState,eventInfo){
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

function swissRoundMini(s){
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

function resolveMiniAI(t,round){if(t.bracket)resolvePlayoffAI(t.bracket,t.myTeam,t.simState,t.rng);}
function propagateMini(t){if(t.bracket)resolvePlayoffAI(t.bracket,t.myTeam,t.simState,t.rng);}

function miniPlacement(t){
  if(!t.champion)return t.participants?.length||8;
  const br=t.bracket;if(!br)return t.participants?.length||8;
  const fr=br.final?.res;if(!fr)return t.participants?.length||8;
  if(fr.winnerName===t.myTeam)return 1;
  if(fr.loserName===t.myTeam)return 2;
  if(br.sf){for(const s of br.sf||[])if(s.done&&s.res?.loserName===t.myTeam)return 3;}
  return t.swiss?.eliminated?.includes(t.myTeam)?t.participants?.length||8:4;
}
function miniPrizeMoney(t,place){const tbl=t.prizeTable||{};return tbl[place]||tbl[Object.keys(tbl).sort((a,b)=>b-a).pop()]||10;}

// ═══════════════════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════════════════
const C={bg:"#0a0c10",panel:"#13171f",panel2:"#1a1f29",line:"#272e3b",ink:"#e9edf3",dim:"#828c9d",faint:"#525c6b",acc:"#ff5c2e",gold:"#ffc24b",win:"#3ddc84",live:"#6aa3ff",ban:"#5a6273",red:"#ff4c4c",rival:"#e040fb"};
const mono="'JetBrains Mono',ui-monospace,Menlo,monospace";
const sans="'Inter',system-ui,sans-serif";
const GL=["A","B","C","D"];

// ═══════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════
export default function App(){
  const [phase,setPhase]=useState("loading"); // loading | saves | draft | season
  const [myTeam,setMyTeam]=useState(null);
  const [season,setSeason]=useState(null);
  const [t,setT]=useState(null);
  const [tab,setTab]=useState("hub");
  const [openMatch,setOpenMatch]=useState(null);
  const [veto,setVeto]=useState(null);
  const [reveal,setReveal]=useState(null);
  const [saves,setSaves]=useState([null,null,null,null]); // [auto, slot1, slot2, slot3]
  const [,force]=useState(0);
  const redraw=useCallback(()=>force(n=>n+1),[]);

  // ── Save/Load System ──────────────────────────────────────────────
  const SAVE_KEY="overtime-saves";

  async function loadSaves(){
    try{
      const result=await window.storage.get(SAVE_KEY);
      if(result&&result.value){
        const parsed=JSON.parse(result.value);
        setSaves(parsed);
        return parsed;
      }
    }catch(e){console.log("No saves found");}
    return [null,null,null,null];
  }

  async function writeSaves(newSaves){
    try{
      await window.storage.set(SAVE_KEY,JSON.stringify(newSaves));
      setSaves(newSaves);
    }catch(e){console.error("Save failed:",e);}
  }

  function buildSaveData(){
    if(!season||!myTeam)return null;
    return {
      myTeam,
      season:{...season,simState:undefined}, // simState saved separately
      simState:season.simState,
      // Tournament state NOT saved — too complex. Auto-save happens between events.
      savedAt:new Date().toISOString(),
      summary:{
        week:season.week,
        date:weekToLabel(season.week,season.year),year:season.year||2026,
        budget:season.budget,
        roster:rosterOf(season.simState,myTeam).map(p=>p.name),
        rank:(()=>{const r=getRankedTeams(season.simState,myTeam);return r.findIndex(x=>x.team===myTeam)+1;})(),
        events:season.history.length,
      }
    };
  }

  async function autoSave(){
    const data=buildSaveData();
    if(!data)return;
    const cur=[...saves];
    cur[0]=data;
    await writeSaves(cur);
  }

  async function saveToSlot(slot){
    const data=buildSaveData();
    if(!data)return;
    const cur=[...saves];
    cur[slot]=data;
    await writeSaves(cur);
  }

  function loadFromSave(save){
    if(!save)return;
    const s={...save.season,simState:save.simState};
    setMyTeam(save.myTeam);
    setSeason(s);
    setT(null);
    setPhase("season");
    setTab("calendar");
  }

  async function deleteSave(slot){
    const cur=[...saves];
    cur[slot]=null;
    await writeSaves(cur);
  }

  // Load saves on mount
  React.useEffect(()=>{
    loadSaves().then(s=>{
      const hasSave=s.some(x=>x!==null);
      setPhase(hasSave?"saves":"draft");
    });
  },[]);

  function onDraftComplete(teamName,simState,remaining){
    setMyTeam(teamName);
    simState.chemistry[teamName]=55;
    if(!simState.mapProf[teamName]) simState.mapProf[teamName]=profileFor(teamName);
    simState.rankings[teamName]=200;
    const s={simState,budget:remaining,eventNum:1,week:1,year:2026,history:[],weekLog:[],phase:"calendar",facilities:{},yearHistory:[]};
    setSeason(s);setPhase("season");setTab("calendar");
    // Auto-save after draft
    setTimeout(()=>{const data=buildSaveData();if(data){const cur=[...saves];cur[0]={...data,season:s,simState};writeSaves(cur);}},100);
  }

  function nextUserFx(){
    if(!t) return null;
    // Swiss stage
    if(t.stage==="swiss"&&t.swiss){
      const fx=nextSwissFix(t.swiss);
      if(fx) return {kind:"swiss",fx,bo:fx.bo};
      // Check if swiss is done — need to seed bracket
      const adv=t.swiss._advanceAt||3,eli=t.swiss._elimAt||3;
      const allDone=t.swiss.teams.every(tm=>t.swiss.records[tm].w>=adv||t.swiss.records[tm].l>=eli);
      if(allDone&&!t.bracket) return null; // trigger seedBracket
    }
    // Playoff stage
    if(t.bracket){
      const nf=nextPlayoffFix(t.bracket,myTeam);
      if(nf) return {kind:nf.round,fx:nf.fx,bo:nf.round==="final"?(t.bracket.bo5Final?5:t.bracket.bo3||3):t.bracket.bo3||3};
    }
    return null;
  }

  function beginVeto(fx,bo){
    const opp=fx.a===myTeam?fx.b:fx.a;
    setVeto({fixture:fx,bo:bo||fx.bo||1,remaining:[...MAPS],picked:[],log:[],opp});
  }

  function afterResult(){
    if(!t) return;
    if(t.stage==="swiss"&&t.swiss){
      // Check if user was just eliminated
      const userEliminated=t.swiss.eliminated.includes(myTeam);
      if(userEliminated){
        // User is out — sim remaining Swiss rounds and playoffs without them
        const adv=t.swiss._advanceAt||3,eli=t.swiss._elimAt||3;
        let si=0;
        while(!t.swiss.teams.every(tm=>t.swiss.records[tm].w>=adv||t.swiss.records[tm].l>=eli)&&si<30){
          si++;if(t.isMajor)swissRound(t.swiss);else swissRoundMini(t.swiss);
        }
        // Seed and auto-sim playoffs
        const advancers=t.swiss.advanced.slice(0,t.advanceCount||8);
        t.bracket=seedPlayoff(advancers,3,t.isMajor);
        resolvePlayoffAI(t.bracket,null,t.simState,t.rng); // null myTeam = resolve all
        // Find all unresolved
        const allFx=[...(t.bracket.qf||[]),...(t.bracket.sf||[]),t.bracket.final].filter(Boolean);
        let pi=0;
        while(!t.bracket.final.done&&pi<20){pi++;allFx.forEach(fx=>{if(!fx.done&&fx.a&&fx.b){const bo=fx===t.bracket.final?(t.isMajor?5:3):3;fx.res=playSeries(t.simState,fx.a,fx.b,bo,{stage:"playoffs"},t.rng);fx.done=true;}});resolvePlayoffAI(t.bracket,null,t.simState,t.rng);}
        if(t.bracket.final.done)t.champion=t.bracket.final.res.winnerName;
        t.stage="done";
        setT({...t});redraw();
        return;
      }

      const allDone=t.swiss.teams.every(tm=>t.swiss.records[tm].w>=(t.swiss._advanceAt||3)||t.swiss.records[tm].l>=(t.swiss._elimAt||3));
      if(allDone){
        t.stage="playoffs";
        const advancers=t.swiss.advanced.slice(0,t.advanceCount||8);
        t.bracket=seedPlayoff(advancers,3,t.isMajor);
        resolvePlayoffAI(t.bracket,myTeam,t.simState,t.rng);
      } else {
        if(t.isMajor) swissRound(t.swiss);
        else swissRoundMini(t.swiss);
      }
    } else if(t.stage==="playoffs"&&t.bracket){
      // Check if user was just eliminated from playoffs
      const userElimInPlayoffs=bracketElim(t.bracket,myTeam);
      if(userElimInPlayoffs){
        // Sim remaining playoff matches
        let pi=0;
        while(!t.bracket.final.done&&pi<20){pi++;const allFx=[...(t.bracket.qf||[]),...(t.bracket.sf||[]),t.bracket.final].filter(Boolean);allFx.forEach(fx=>{if(!fx.done&&fx.a&&fx.b){const bo=fx===t.bracket.final?(t.isMajor?5:3):3;fx.res=playSeries(t.simState,fx.a,fx.b,bo,{stage:"playoffs"},t.rng);fx.done=true;}});resolvePlayoffAI(t.bracket,null,t.simState,t.rng);}
        if(t.bracket.final.done)t.champion=t.bracket.final.res.winnerName;
        t.stage="done";
        setT({...t});redraw();
        return;
      }
      resolvePlayoffAI(t.bracket,myTeam,t.simState,t.rng);
      if(t.bracket.final.done){
        t.champion=t.bracket.final.res.winnerName;
        t.stage="done";
      }
    }
    setT({...t});redraw();
  }

  function endEvent(){
    // Force-complete tournament if not done (user was eliminated)
    if(t.stage!=="done"){
      // Sim remaining Swiss
      if(t.swiss&&!swissDone(t.swiss)){
        let si=0;while(!swissDone(t.swiss)&&si<30){si++;if(t.isMajor)swissRound(t.swiss);else swissRoundMini(t.swiss);}
      }
      // Seed and sim playoffs if needed
      if(!t.bracket&&t.swiss?.advanced?.length>0){
        t.bracket=seedPlayoff(t.swiss.advanced.slice(0,t.advanceCount||8),3,t.isMajor);
      }
      if(t.bracket&&!t.bracket.final.done){
        let pi=0;while(!t.bracket.final.done&&pi<20){pi++;
          const allFx=[...(t.bracket.qf||[]),...(t.bracket.sf||[]),t.bracket.final].filter(Boolean);
          allFx.forEach(fx=>{if(!fx.done&&fx.a&&fx.b){const bo=fx===t.bracket.final?(t.isMajor?5:3):3;fx.res=playSeries(t.simState,fx.a,fx.b,bo,{stage:"playoffs"},t.rng);fx.done=true;}});
          resolvePlayoffAI(t.bracket,null,t.simState,t.rng);
        }
      }
      if(t.bracket?.final?.done)t.champion=t.bracket.final.res.winnerName;
      t.stage="done";
    }
    const ev=season.currentEvent||{tier:"Major"};
    const isMajor=t.isMajor;
    const place=isMajor?placementOf(t):miniPlacement(t);
    const prize=isMajor?prizeMoney(place):miniPrizeMoney(t,place);
    season.budget+=prize;
    season.history.push({eventNum:season.eventNum,place,champion:t.champion,prize,salary:0,budgetAfter:season.budget,tier:ev.tier,label:ev.label||"Major"});
    // Update world rankings
    const placements={};
    if(t.bracket){
      const br=t.bracket;const fr=br.final?.res;
      if(fr){placements[fr.winnerName]=1;placements[fr.loserName]=2;}
      (br.sf||[]).forEach(s=>{if(s.done&&s.res&&!placements[s.res.loserName])placements[s.res.loserName]=4;});
      (br.qf||[]).forEach(q=>{if(q.done&&q.res&&!placements[q.res.loserName])placements[q.res.loserName]=9;});
    }
    if(t.swiss){
      t.swiss.eliminated.forEach(tm=>{if(!placements[tm])placements[tm]=t.teams?.length||16;});
    }
    updateRankings(season.simState,placements,ev.tier||"B");
    if(isMajor){
      decayFormBetweenEvents(season.simState);tickContracts(season.simState,myTeam);
      season.simState.players.forEach(p=>{if(Math.random()<0.33)p.age++;});
      const moves=aiRosterMoves(season.simState,myTeam);
      moves.forEach(m=>season.weekLog.push({week:season.week,activity:"news",event:m}));
    }
    if(!season.simState.rankings[myTeam])season.simState.rankings[myTeam]=0;
    season.eventNum++;season.week++;season.phase="calendar";season.currentEvent=null;
    setSeason({...season});setT(null);setTab("calendar");
    autoSave();
  }

  function paySalary(week){
    if(!isSalaryWeek(week)) return null;
    const roster=rosterOf(season.simState,myTeam);
    const coachPay=season.simState.coach?season.simState.coach.salary:0;
    const totalSalary=roster.reduce((s,p)=>s+p.salary,0)+coachPay;
    // Revenue streams
    const contentTier=season.facilities?.content||0;
    const contentIncome=[0,15,30][contentTier]||0;
    // Merch income: scales with world ranking
    const rank=(()=>{const r=getRankedTeams(season.simState,myTeam);return r.findIndex(x=>x.team===myTeam)+1;})();
    const merchIncome=rank<=3?40:rank<=6?25:rank<=10?15:rank<=16?8:3;
    // Org stipend: base income from investors
    const stipendIncome=rank<=5?30:rank<=10?20:rank<=16?12:5;
    // Streaming: sum of player popularity (star players = more viewers)
    const streamIncome=Math.round(roster.reduce((s,p)=>{
      const pop=playerOvr(p)/20+(season.simState.career?.[p.name]?.totalMvps||0)*0.5;
      return s+pop;
    },0));
    // Sponsorship income
    const sponsorIncome=(season.sponsorships||[]).reduce((s,sp)=>s+(sp.active?sp.monthly:0),0);
    const totalIncome=contentIncome+merchIncome+stipendIncome+streamIncome+sponsorIncome;
    const net=totalIncome-totalSalary;
    season.budget+=net;
    const dateStr=weekToLabel(week,season.year);
    const parts=[];
    if(contentIncome)parts.push(`content ${contentIncome}K`);
    if(merchIncome)parts.push(`merch ${merchIncome}K`);
    if(stipendIncome)parts.push(`stipend ${stipendIncome}K`);
    if(streamIncome)parts.push(`streams ${streamIncome}K`);
    if(sponsorIncome)parts.push(`sponsors ${sponsorIncome}K`);
    const incStr=parts.length?` | Income: ${parts.join(", ")} = ${totalIncome}K`:"";
    return `[$] ${dateStr} — Salary: ${totalSalary}K${incStr} | Net: ${net>=0?"+":""}${net}K${season.budget<0?" ! DEBT!":""}`;
  }

  function advanceWeek(activity,mapChoice){
    if(activity==="scout"&&mapChoice){
      // mapChoice is used as teamName for scouting
      scoutTeam(mapChoice);
    }
    applyActivity(season.simState,myTeam,activity,activity==="scout"?null:mapChoice,season.facilities);
    aiWeekActivity(season.simState);
    const evMsg=rollRandomEvent(season.simState,myTeam);
    // Academy: develop prospects each week
    if(season.academy){
      season.academy.weeksActive++;
      season.academy.prospects.forEach(p=>developProspect(p));
      // Generate new prospect every 6 weeks if room
      if(season.academy.weeksActive%6===0&&season.academy.prospects.length<4){
        season.academy.prospects.push(generateProspect(season.year||2026));
        season.weekLog.push({week:season.week,activity:"news",event:`[AC] New academy prospect discovered!`});
      }
    }
    // Sponsorship offers (~10% chance per week if none active)
    const activeSponsorCount=(season.sponsorships||[]).filter(s=>s.active).length;
    if(activeSponsorCount<2&&Math.random()<0.10){
      if(!season.sponsorships)season.sponsorships=[];
      const rank=(()=>{const r=getRankedTeams(season.simState,myTeam);return r.findIndex(x=>x.team===myTeam)+1;})();
      const offers=[
        {brand:"Red Bull",monthly:rank<=5?40:25,duration:6,condition:rank<=10?"Stay top 10":"Stay top 16",checkRank:rank<=10?10:16},
        {brand:"HyperX",monthly:rank<=8?30:15,duration:4,condition:"None",checkRank:99},
        {brand:"Intel",monthly:50,duration:3,condition:"Win an event",checkWin:true},
        {brand:"BMW",monthly:rank<=3?60:35,duration:6,condition:rank<=5?"Stay top 5":"Stay top 10",checkRank:rank<=5?5:10},
        {brand:"Monster",monthly:20,duration:8,condition:"None",checkRank:99},
        {brand:"Logitech",monthly:rank<=10?35:18,duration:5,condition:"Make a Major",checkMajor:true},
      ];
      const offer=offers[Math.floor(Math.random()*offers.length)];
      season.sponsorships.push({...offer,active:false,offered:true,weeksLeft:offer.duration*4,startWeek:season.week});
      season.weekLog.push({week:season.week,activity:"news",event:`[>] ${offer.brand} offers ${offer.monthly}K/month for ${offer.duration} months (${offer.condition})`});
    }
    // Tick active sponsorships
    (season.sponsorships||[]).forEach(sp=>{
      if(sp.active){sp.weeksLeft--;if(sp.weeksLeft<=0)sp.active=false;}
    });
    season.weekLog.push({week:season.week,activity,mapChoice,event:evMsg||null});
    season.week++;
    const salMsg=paySalary(season.week);
    if(salMsg) season.weekLog.push({week:season.week,activity:"salary",event:salMsg});
    checkWeekTransition();
    autoSave();
  }

  function simToNextEvent(){
    const nextEv=EVENTS.find(e=>e.week>=season.week);
    const target=nextEv?nextEv.week:SEASON_WEEKS+1;
    const log=autoSimWeeks(season.simState,myTeam,season.week,target);
    // Inject salary deductions into the log for each payday week
    const enriched=[];
    for(const entry of log){
      enriched.push(entry);
      if(isSalaryWeek(entry.week+1)){
        const roster=rosterOf(season.simState,myTeam);
        const coachPay=season.simState.coach?season.simState.coach.salary:5;
        const totalSalary=roster.reduce((s,p)=>s+p.salary,0)+coachPay;
        season.budget-=totalSalary;
        enriched.push({week:entry.week+1,activity:"salary",event:`[$] Payday (${weekToLabel(entry.week+1,season.year)}) — ${totalSalary}K salaries paid${season.budget<0?" ! DEBT!":""}`});
      }
    }
    season.weekLog.push(...enriched);
    season.week=target;
    checkWeekTransition();
    autoSave();
  }

  function checkWeekTransition(){
    const ev=EVENTS.find(e=>e.week===season.week);
    if(ev){
      season.phase="event";season.currentEvent=ev;
      if(ev.tier==="Major"){
        // Major qualification: top 8 = Legends (direct), 9-16 = Challengers (qualifier)
        const ranked=getRankedTeams(season.simState,myTeam);
        const myRank=ranked.findIndex(x=>x.team===myTeam)+1;
        if(myRank>16){
          // Outside top 16: miss the Major entirely
          season.weekLog.push({week:season.week,activity:"news",event:`[X] ${myTeam} (ranked #${myRank}) failed to qualify for ${ev.label}. Top 16 required.`});
          // Sim Major without user
          const majorT=newTournament(myTeam,season.simState);
          // Remove user's team and sim everything
          majorT.swiss.teams=majorT.swiss.teams.filter(t=>t!==myTeam);
          let si=0;while(!swissDone(majorT.swiss)&&si<30){si++;swissRound(majorT.swiss);}
          const advancers=majorT.swiss.advanced.slice(0,8);
          majorT.bracket=seedPlayoff(advancers,3,true);
          let pi=0;while(!majorT.bracket.final.done&&pi<20){pi++;const allFx=[...(majorT.bracket.qf||[]),...(majorT.bracket.sf||[]),majorT.bracket.final];allFx.forEach(fx=>{if(!fx.done&&fx.a&&fx.b){const bo=fx===majorT.bracket.final?5:3;fx.res=playSeries(majorT.simState,fx.a,fx.b,bo,{stage:"playoffs"},Math.random);fx.done=true;}});resolvePlayoffAI(majorT.bracket,null,majorT.simState,Math.random);}
          const champ=majorT.bracket.final.done?majorT.bracket.final.res.winnerName:"Unknown";
          season.weekLog.push({week:season.week,activity:"news",event:`[W] ${champ} win ${ev.label} (you were not qualified)`});
          season.history.push({eventNum:season.eventNum,place:99,champion:champ,prize:0,salary:0,budgetAfter:season.budget,tier:"Major",label:ev.label+" (DNQ)"});
          // Rankings update for participants
          const placements={};if(majorT.bracket.final.res){placements[majorT.bracket.final.res.winnerName]=1;placements[majorT.bracket.final.res.loserName]=2;}
          (majorT.bracket.sf||[]).forEach(s=>{if(s.done&&s.res)placements[s.res.loserName]=4;});
          (majorT.bracket.qf||[]).forEach(q=>{if(q.done&&q.res)placements[q.res.loserName]=9;});
          majorT.swiss.eliminated.forEach(tm=>{if(!placements[tm])placements[tm]=16;});
          updateRankings(season.simState,placements,"Major");
          decayFormBetweenEvents(season.simState);tickContracts(season.simState,myTeam);
          const moves=aiRosterMoves(season.simState,myTeam);
          moves.forEach(m=>season.weekLog.push({week:season.week,activity:"news",event:m}));
          season.eventNum++;season.week++;season.currentEvent=null;season.phase="calendar";
          setSeason({...season});setTab("calendar");
          return;
        }
        const isLegend=myRank<=8;
        if(!isLegend){
          season.weekLog.push({week:season.week,activity:"news",event:`[S] ${myTeam} (ranked #${myRank}) enters the Challenger Stage qualifier for ${ev.label}`});
        } else {
          season.weekLog.push({week:season.week,activity:"news",event:`[*] ${myTeam} (ranked #${myRank}) auto-qualified as Legends for ${ev.label}`});
        }
        // Sticker money for qualifying
        const stickerMoney=isLegend?Math.round(40+((17-myRank)*5)):Math.round(15+((17-myRank)*2));
        season.budget+=stickerMoney;
        season.weekLog.push({week:season.week,activity:"news",event:`[TK] Major sticker revenue: +${stickerMoney}K`});
        setSeason({...season});
        setT(newTournament(myTeam,season.simState));
        setTab("hub");
      } else {
        setSeason({...season});
        setT(newMiniTournament(myTeam,season.simState,ev));
        setTab("hub");
      }
    } else if(season.week>SEASON_WEEKS){
      season.phase="done";setSeason({...season});setTab("season");
    } else {
      setSeason({...season});redraw();
    }
  }

  function hireCoach(coach){
    season.simState.coach=coach;
    setSeason({...season});redraw();
  }
  function fireCoach(){
    season.simState.coach=null;
    setSeason({...season});redraw();
  }

  function doTransfer(action,playerName){
    const p=season.simState.players.find(x=>x.name===playerName);if(!p)return;
    if(action==="release"){season.budget+=Math.round(marketValue(p)*0.3);p.team="FA";p.contract=0;season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||70)-8);}
    else if(action==="sign"&&p.team==="FA"){p.team=myTeam;p.contract=2;season.budget-=marketValue(p);season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||70)-5);if(!season.simState.stats[p.name])season.simState.stats[p.name]={maps:0,rating:0,mvps:0,clutches:0};if(!season.simState.career[p.name])season.simState.career[p.name]={totalMaps:0,totalMvps:0,totalClutches:0,avgRating:0,bestRating:0,eventHistory:[],mapStats:{},origStats:{aim:p.aim,gameSense:p.gameSense,util:p.util,igl:p.igl,mentality:p.mentality,consistency:p.consistency,rifle:p.rifle,pistol:p.pistol,awp:p.awp,clutch:p.clutch,entry:p.entry,stamina:p.stamina,composure:p.composure,experience:p.experience},kills:0};}
    else if(action==="buy"){const buyout=Math.round(marketValue(p)*2);if(season.budget<buyout)return;const oldTeam=p.team;season.budget-=buyout;p.team=myTeam;p.contract=2;season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||70)-5);season.simState.chemistry[oldTeam]=Math.max(40,(season.simState.chemistry[oldTeam]||70)-5);const fas=freeAgents(season.simState);if(fas.length>0){const best=fas.sort((a,b)=>playerOvr(b)-playerOvr(a))[0];best.team=oldTeam;best.contract=2;}if(!season.simState.stats[p.name])season.simState.stats[p.name]={maps:0,rating:0,mvps:0,clutches:0};if(!season.simState.career[p.name])season.simState.career[p.name]={totalMaps:0,totalMvps:0,totalClutches:0,avgRating:0,bestRating:0,eventHistory:[],mapStats:{},origStats:{aim:p.aim,gameSense:p.gameSense,util:p.util,igl:p.igl,mentality:p.mentality,consistency:p.consistency,rifle:p.rifle,pistol:p.pistol,awp:p.awp,clutch:p.clutch,entry:p.entry,stamina:p.stamina,composure:p.composure,experience:p.experience},kills:0};}
    setSeason({...season});redraw();
  }

  function upgradeFacility(facId){
    const fac=FACILITIES[facId];if(!fac)return;
    const curTier=season.facilities[facId]||0;
    if(curTier>=fac.maxTier)return;
    const cost=fac.cost[curTier];
    if(season.budget<cost)return;
    season.budget-=cost;
    season.facilities={...season.facilities,[facId]:curTier+1};
    setSeason({...season});redraw();
  }

  function startNewYear(){
    // Year-end: save year summary, reset calendar, age players, generate rookies, decay rankings
    const yr=season.year||2026;
    season.yearHistory.push({
      year:yr,
      events:season.history.length,
      budgetEnd:season.budget,
      rank:(()=>{const r=getRankedTeams(season.simState,myTeam);return r.findIndex(x=>x.team===myTeam)+1;})(),
      trophies:season.history.filter(h=>h.place===1).length,
      roster:rosterOf(season.simState,myTeam).map(p=>p.name),
    });
    // Age all players +1
    season.simState.players.forEach(p=>{p.age++;});
    // Generate 5-8 rookies (young talents entering FA pool)
    const rookieCount=5+Math.floor(Math.random()*4);
    const roles=["IGL","AWP","Entry","Lurk","Support"];
    const rookieNames=["prodigy","wunderkid","flash","nova","zen","blitz","cipher","phantom","ace","bolt"];
    for(let i=0;i<rookieCount;i++){
      const role=roles[Math.floor(Math.random()*roles.length)];
      const name=rookieNames[Math.floor(Math.random()*rookieNames.length)]+(yr-2025)+"_"+i;
      const base=55+Math.floor(Math.random()*25);
      const p={team:"FA",name,role,aim:base+Math.floor(Math.random()*15),gameSense:base+Math.floor(Math.random()*10),util:base+Math.floor(Math.random()*10),igl:role==="IGL"?base+20:base-10,mentality:50+Math.floor(Math.random()*30),consistency:40+Math.floor(Math.random()*30),traits:Math.random()<0.2?["boom"]:Math.random()<0.1?["clutch"]:[],salary:5+Math.floor(Math.random()*5),contract:0,age:17+Math.floor(Math.random()*2),era:"current",form:0,fatigue:10,
        rifle:base+Math.floor(Math.random()*12),pistol:base+Math.floor(Math.random()*12),awp:role==="AWP"?base+15:base-5,clutch:40+Math.floor(Math.random()*20),entry:role==="Entry"?base+15:base,stamina:60+Math.floor(Math.random()*25),composure:40+Math.floor(Math.random()*25),experience:30+Math.floor(Math.random()*10),
      };
      season.simState.players.push(p);
      season.simState.stats[p.name]={maps:0,rating:0,mvps:0,clutches:0};
      season.simState.career[p.name]={totalMaps:0,totalMvps:0,totalClutches:0,avgRating:0,bestRating:0,eventHistory:[],mapStats:{},origStats:{aim:p.aim,gameSense:p.gameSense,util:p.util,igl:p.igl,mentality:p.mentality,consistency:p.consistency,rifle:p.rifle,pistol:p.pistol,awp:p.awp,clutch:p.clutch,entry:p.entry,stamina:p.stamina,composure:p.composure,experience:p.experience},kills:0};
    }
    // Decay rankings (off-season)
    Object.keys(season.simState.rankings).forEach(t=>{season.simState.rankings[t]=Math.round((season.simState.rankings[t]||0)*0.7);});
    // Expire more contracts
    tickContracts(season.simState,myTeam);
    // AI roster moves in off-season
    const moves=aiRosterMoves(season.simState,myTeam);
    // Reset season but keep everything else
    const newYear=yr+1;
    season.year=newYear;season.week=1;season.eventNum=1;season.history=[];
    season.weekLog=[{week:0,activity:"news",event:`> Welcome to the ${newYear} season! ${rookieCount} new rookies entered the market.`}];
    if(moves.length)moves.forEach(m=>season.weekLog.push({week:0,activity:"news",event:m}));
    season.phase="calendar";
    setSeason({...season});setT(null);setTab("calendar");
    autoSave();
  }

  function acceptSponsorship(idx){
    if(!season.sponsorships?.[idx])return;
    season.sponsorships[idx].active=true;
    season.sponsorships[idx].offered=false;
    setSeason({...season});redraw();
  }
  function declineSponsorship(idx){
    if(!season.sponsorships?.[idx])return;
    season.sponsorships[idx].offered=false;
    setSeason({...season});redraw();
  }

  // Contract negotiations
  function negotiateContract(playerName,offeredSalary){
    const p=season.simState.players.find(x=>x.name===playerName);if(!p||p.team!==myTeam)return{success:false,msg:"Player not on roster"};
    const ovr=playerOvr(p);
    const recentRating=season.simState.career?.[p.name]?.avgRating||0.9;
    // Player's desired salary based on performance
    const demandBase=p.salary*(recentRating>=1.1?1.4:recentRating>=1.0?1.15:recentRating>=0.9?1.0:0.85);
    const demand=Math.round(demandBase);
    if(offeredSalary>=demand){
      p.salary=offeredSalary;p.contract=3;
      return{success:true,msg:`${p.name} accepts ${offeredSalary}K/mo for 3 events. They wanted ${demand}K.`};
    }
    if(offeredSalary>=demand*0.85){
      // Counter-offer: split the difference
      const counter=Math.round((offeredSalary+demand)/2);
      p.salary=counter;p.contract=2;
      return{success:true,msg:`${p.name} countered at ${counter}K/mo for 2 events (wanted ${demand}K).`};
    }
    return{success:false,msg:`${p.name} rejected ${offeredSalary}K/mo. They demand at least $Math.round(demand*0.85)K.`};
  }

  // Role assignment
  function changeRole(playerName,newRole){
    const p=season.simState.players.find(x=>x.name===playerName);if(!p||p.team!==myTeam)return;
    if(p.role===newRole)return;
    p.role=newRole;
    season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||55)-3);
    season.weekLog.push({week:season.week,activity:"news",event:`[>] ${p.name} moved to ${newRole} role (-3 chemistry)`});
    setSeason({...season});redraw();
  }

  // Scout prep
  function scoutTeam(teamName){
    if(!season.scoutedTeams)season.scoutedTeams={};
    const roster=rosterOf(season.simState,teamName);
    const mapProf=getMapProf(season.simState,teamName);
    season.scoutedTeams[teamName]={
      roster:roster.map(p=>({name:p.name,ovr:playerOvr(p),role:p.role})),
      maps:Object.entries(mapProf).sort((a,b)=>b[1]-a[1]).map(([m,v])=>({map:m,prof:v})),
      scoutedAt:season.week
    };
    season.weekLog.push({week:season.week,activity:"news",event:`[SC] Scouted ${teamName} — map pool and roster intel acquired`});
    setSeason({...season});redraw();
  }

  // Academy
  function initAcademy(){
    if(season.academy)return;
    if(season.budget<100)return;
    season.budget-=100;
    season.academy={prospects:[],weeksActive:0};
    // Generate 2 initial prospects
    for(let i=0;i<2;i++) season.academy.prospects.push(generateProspect(season.year||2026));
    setSeason({...season});redraw();
  }

  function promoteProspect(idx){
    if(!season.academy?.prospects[idx])return;
    const roster=rosterOf(season.simState,myTeam);
    if(roster.length>=5)return;
    const p=season.academy.prospects[idx];
    p.team=myTeam;p.contract=3;
    season.simState.players.push(p);
    season.simState.stats[p.name]={maps:0,rating:0,mvps:0,clutches:0};
    season.simState.career[p.name]={totalMaps:0,totalMvps:0,totalClutches:0,avgRating:0,bestRating:0,eventHistory:[],mapStats:{},origStats:{aim:p.aim,gameSense:p.gameSense,util:p.util,igl:p.igl,mentality:p.mentality,consistency:p.consistency,rifle:p.rifle||60,pistol:p.pistol||50,awp:p.awp||40,clutch:p.clutch||40,entry:p.entry||50,stamina:p.stamina||60,composure:p.composure||40,experience:p.experience||30},kills:0};
    season.academy.prospects.splice(idx,1);
    season.simState.chemistry[myTeam]=Math.max(40,(season.simState.chemistry[myTeam]||55)-5);
    setSeason({...season});redraw();
  }

  function sellProspect(idx){
    if(!season.academy?.prospects[idx])return;
    if((season.academy.prospects[idx].weeksInAcademy||0)<8)return;
    const p=season.academy.prospects[idx];
    const value=Math.round(playerOvr(p)*0.8);
    season.budget+=value;
    season.academy.prospects.splice(idx,1);
    season.weekLog.push({week:season.week,activity:"news",event:`[$$] Sold academy prospect ${p.name} for ${value}K`});
    setSeason({...season});redraw();
  }

  function resetAll(){setPhase("saves");setMyTeam(null);setSeason(null);setT(null);setTab("hub");loadSaves();}

  if(phase==="loading") return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:sans,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <Gstyle/><div style={{textAlign:"center"}}><div style={{fontFamily:mono,fontWeight:700,fontSize:16,color:C.acc,letterSpacing:3}}>▸ OVERTIME</div><div style={{color:C.dim,fontSize:13,marginTop:8}}>Loading...</div></div>
    </div>);

  if(phase==="saves") return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:sans}}>
      <Gstyle/>
      <div style={{maxWidth:600,margin:"0 auto",padding:"60px 24px"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontFamily:mono,fontWeight:700,fontSize:20,color:C.acc,letterSpacing:3,marginBottom:8}}>▸ OVERTIME</div>
          <div style={{fontSize:14,color:C.dim}}>CS Major Team Management Simulator</div>
        </div>
        <button onClick={()=>setPhase("draft")} style={{width:"100%",background:C.acc,color:"#0a0c10",border:"none",borderRadius:10,padding:"16px",fontWeight:800,fontSize:17,marginBottom:24}}>NEW SEASON →</button>
        <div style={{fontFamily:mono,fontSize:11,color:C.dim,letterSpacing:1.5,marginBottom:12}}>SAVED GAMES</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {["Auto-Save","Slot 1","Slot 2","Slot 3"].map((label,i)=>{
            const save=saves[i];
            if(!save) return <div key={i} style={{background:C.panel,border:`1px dashed ${C.line}`,borderRadius:9,padding:"16px 18px",color:C.faint,fontFamily:mono,fontSize:12}}>{label} — Empty</div>;
            const s=save.summary||{};
            return(
            <div key={i} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:9,padding:"14px 18px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                <span style={{fontFamily:mono,fontSize:10,color:C.faint}}>{label}</span>
                <span style={{fontWeight:700,fontSize:15,color:C.acc}}>{save.myTeam}</span>
                <span style={{fontFamily:mono,fontSize:11,color:C.dim,marginLeft:"auto"}}>#{s.rank||"?"} ranked</span>
              </div>
              <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:10}}>
                <MiniStat label="DATE" value={`${s.date||"?"} 2026`} color={C.live}/>
                <MiniStat label="WEEK" value={s.week||"?"} color={C.dim}/>
                <MiniStat label="BUDGET" value={`$${s.budget||0}K`} color={(s.budget||0)>0?C.gold:C.red}/>
                <MiniStat label="EVENTS" value={s.events||0} color={C.dim}/>
              </div>
              <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginBottom:10}}>{(s.roster||[]).join(" · ")}</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>loadFromSave(save)} style={{flex:1,background:C.win,color:"#0a0c10",border:"none",borderRadius:7,padding:"9px",fontWeight:800,fontSize:13}}>CONTINUE</button>
                {i>0&&<button onClick={()=>deleteSave(i)} style={{background:"transparent",border:`1px solid ${C.red}`,color:C.red,borderRadius:7,padding:"9px 14px",fontFamily:mono,fontSize:11,fontWeight:700}}>DELETE</button>}
              </div>
            </div>);
          })}
        </div>
      </div>
    </div>);

  if(phase==="draft")return <DraftScreen onComplete={onDraftComplete}/>;

  // Calendar phase
  if(season?.phase==="calendar"&&!t) return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:sans}}>
      <Gstyle/><Header season={season} myTeam={myTeam} onReset={resetAll} onSave={saveToSlot} stageLabel={`${weekToLabel(season.week,season.year)} ${season.year||2026} · W${season.week}`}/>
      <Tabs tab={tab} setTab={setTab} calMode/>
      <main style={{maxWidth:1100,margin:"0 auto",padding:"22px 18px 80px"}}>
        {tab==="calendar"&&<CalendarView season={season} myTeam={myTeam} onAdvance={advanceWeek} onTransfer={doTransfer} onSim={simToNextEvent} onHireCoach={hireCoach} onFireCoach={fireCoach} onInitAcademy={initAcademy} onPromoteProspect={promoteProspect} onSellProspect={sellProspect} onAcceptSponsor={acceptSponsorship} onDeclineSponsor={declineSponsorship}/>}
        {tab==="roster"&&<RosterView2 state={season.simState} myTeam={myTeam} onNegotiate={negotiateContract} onChangeRole={changeRole}/>}
        {tab==="maps"&&<MapProfView state={season.simState} myTeam={myTeam}/>}
        {tab==="facility"&&<FacilitiesView season={season} onUpgrade={upgradeFacility}/>}
        {tab==="rankings"&&<RankingsView state={season.simState} myTeam={myTeam}/>}
        {tab==="rivals"&&<RivalryView state={season.simState} myTeam={myTeam}/>}
        {tab==="season"&&<SeasonHistory season={season} myTeam={myTeam}/>}
      </main>
    </div>);

  // Season done
  if(season?.phase==="done") return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:sans}}>
      <Gstyle/><Header season={season} myTeam={myTeam} onReset={resetAll} onSave={saveToSlot} stageLabel={`${season.year||2026} SEASON COMPLETE`}/>
      <main style={{maxWidth:1100,margin:"0 auto",padding:"40px 18px 80px",textAlign:"center"}}>
        <div style={{fontSize:28,fontWeight:800,color:C.gold,marginBottom:4}}>{season.year||2026} SEASON COMPLETE</div>
        <p style={{color:C.dim,fontSize:14,marginBottom:20}}>You managed {myTeam} through {season.history.length} events.</p>
        <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",marginBottom:24}}>
          <MiniStat label="TROPHIES" value={season.history.filter(h=>h.place===1).length} color={C.gold}/>
          <MiniStat label="WORLD RANK" value={`#${(()=>{const r=getRankedTeams(season.simState,myTeam);return r.findIndex(x=>x.team===myTeam)+1;})()}`} color={C.acc}/>
          <MiniStat label="BUDGET" value={`$${season.budget}K`} color={season.budget>0?C.gold:C.red}/>
          <MiniStat label="BEST FINISH" value={Math.min(...season.history.map(h=>h.place))||"—"} color={C.win}/>
        </div>
        <SeasonHistory season={season} myTeam={myTeam}/>
        {season.yearHistory?.length>0&&(<>
          <div style={{fontFamily:mono,fontSize:11,color:C.dim,letterSpacing:1.5,marginTop:24,marginBottom:8}}>PREVIOUS YEARS</div>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:16}}>
            {season.yearHistory.map((yh,i)=>(
              <div key={i} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,padding:"10px 14px",textAlign:"center",minWidth:100}}>
                <div style={{fontWeight:700,fontSize:15,color:C.acc}}>{yh.year}</div>
                <div style={{fontFamily:mono,fontSize:10,color:C.dim}}>#{yh.rank} ranked · {yh.trophies}[W]</div>
                <div style={{fontFamily:mono,fontSize:10,color:C.gold}}>${yh.budgetEnd}K</div>
              </div>
            ))}
          </div>
        </>)}
        <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:24}}>
          <button onClick={startNewYear} style={{background:C.acc,color:"#0a0c10",border:"none",borderRadius:10,padding:"16px 36px",fontWeight:800,fontSize:17}}>CONTINUE TO {(season.year||2026)+1} →</button>
          <button onClick={resetAll} style={{background:C.panel,color:C.dim,border:`1px solid ${C.line}`,borderRadius:10,padding:"16px 24px",fontWeight:700,fontSize:14}}>MAIN MENU</button>
        </div>
      </main>
    </div>);

  // Event phase
  const isMajor=t.isMajor;
  const nf=nextUserFx();
  const elimInSwiss=t.swiss?.eliminated?.includes(myTeam);
  const elimInPlayoffs=t.bracket?bracketElim(t.bracket,myTeam):false;
  const alive=t.stage==="done"?t.champion===myTeam:!elimInSwiss&&!elimInPlayoffs;
  const evLabel=season.currentEvent?.label||(isMajor?"MAJOR":"EVENT");
  const tierTag=season.currentEvent?.tier||"Major";
  const stageLabel={swiss:"GROUP STAGE",playoffs:"PLAYOFFS",done:"COMPLETE"}[t.stage]||"";
  const SEED=getSeed(myTeam,season?.simState);

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:sans}}>
      <Gstyle/><Header season={season} myTeam={myTeam} onReset={resetAll} onSave={saveToSlot} stageLabel={`${evLabel} · ${stageLabel}`}/>
      <Tabs tab={tab} setTab={setTab} miniMode={!isMajor}/>
      <main style={{maxWidth:1200,margin:"0 auto",padding:"16px 18px 80px"}}>
        <EventHLTV t={t} myTeam={myTeam} nf={nf} onPlay={(fx,bo)=>beginVeto(fx,bo)} alive={alive} onOpen={setOpenMatch} onEndEvent={(t.stage==="done"||!alive)?endEvent:null} season={season} SEED={SEED} evLabel={evLabel} tierTag={tierTag} tab={tab} setTab={setTab}/>
      </main>
      {veto&&<VetoOverlay session={veto} myTeam={myTeam} t={t} onClose={()=>setVeto(null)} onResolved={(res,fx)=>{
        setVeto(null);setReveal({res,fx});
      }}/>}
      {reveal&&<MatchReveal reveal={reveal} myTeam={myTeam} onDone={()=>{
        const{res,fx}=reveal;
        fx.res=res;fx.done=true;
        // Swiss: update records
        if(t.stage==="swiss"&&t.swiss) resolveSwissFix(t.swiss,fx);
        setReveal(null);afterResult();
      }}/>}
      {openMatch&&<MatchModal m={openMatch} onClose={()=>setOpenMatch(null)}/>}
    </div>);
}

// ═══════════════════════════════════════════════════════════════════════
// CALENDAR VIEW
// ═══════════════════════════════════════════════════════════════════════
function CalendarView({season,myTeam,onAdvance,onTransfer,onSim,onHireCoach,onFireCoach,onInitAcademy,onPromoteProspect,onSellProspect,onAcceptSponsor,onDeclineSponsor}){
  const [act,setAct]=useState(null);
  const [mapChoice,setMapChoice]=useState(MAPS[0]);
  const [showTransfer,setShowTransfer]=useState(false);
  const roster=rosterOf(season.simState,myTeam);
  const avgFatigue=roster.length?Math.round(roster.reduce((s,p)=>s+p.fatigue,0)/roster.length):0;
  const nextEvent=EVENTS.find(e=>e.week>=season.week);
  const weeksUntil=nextEvent?nextEvent.week-season.week:99;
  const totalSalary=roster.reduce((s,p)=>s+p.salary,0);

  function confirm(){if(!act)return;onAdvance(act,act==="practice"?mapChoice:null);setAct(null);}

  return(<div>
    <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap"}}>
      <MiniStat label="DATE" value={`${weekToLabel(season.week,season.year)} ${season.year||2026}`} color={C.acc}/>
      <MiniStat label="NEXT EVENT" value={weeksUntil===0?(nextEvent?.label||"EVENT"):`${weeksUntil}wk`} color={weeksUntil<=2?C.red:C.live}/>
      {nextEvent&&weeksUntil>0&&<MiniStat label="TYPE" value={nextEvent.tier} color={nextEvent.tier==="Major"?C.gold:nextEvent.tier==="A"?C.live:C.dim}/>}
      {(()=>{const nextPay=SALARY_WEEKS.find(w=>w>=season.week);const wksToPay=nextPay?nextPay-season.week:0;const roster=rosterOf(season.simState,myTeam);const coachPay=season.simState.coach?season.simState.coach.salary:5;const sal=roster.reduce((s,p)=>s+p.salary,0)+coachPay;return <MiniStat label={wksToPay===0?"PAYDAY":"NEXT PAY"} value={wksToPay===0?`${sal}K due!`:`${wksToPay}wk · ${sal}K`} color={wksToPay===0?C.red:wksToPay<=1?C.gold:C.dim}/>;})()}
      <MiniStat label="AVG FATIGUE" value={avgFatigue} color={avgFatigue>70?C.red:avgFatigue>50?C.gold:C.win}/>
      <MiniStat label="BUDGET" value={`$${season.budget}K`} color={season.budget>0?C.gold:C.red}/>
    </div>

    {/* Calendar grid */}
    <SL n="TME" t={`${season.year||2026} SEASON`}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:16}}>
      {(()=>{
        const months=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
        const monthGroups={};
        for(let w=1;w<=SEASON_WEEKS;w++){const m=weekToMonth(w);if(!monthGroups[m])monthGroups[m]=[];monthGroups[m].push(w);}
        return months.map((mName,mi)=>{
          const weeks=monthGroups[mi]||[];
          if(!weeks.length)return null;
          const isPast=weeks.every(w=>w<season.week);
          const isCurrent=weeks.some(w=>w===season.week);
          const hasEvent=weeks.some(w=>EVENTS.find(e=>e.week===w));
          return(
          <div key={mi} style={{background:isCurrent?C.acc+"11":C.panel,border:`1px solid ${isCurrent?C.acc:hasEvent?C.gold+"44":C.line}`,borderRadius:7,padding:"6px",opacity:isPast?0.6:1}}>
            <div style={{fontFamily:mono,fontSize:9,fontWeight:700,color:isCurrent?C.acc:hasEvent?C.gold:isPast?C.faint:C.dim,letterSpacing:1,marginBottom:4,textAlign:"center"}}>{mName}</div>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(weeks.length,5)},1fr)`,gap:2}}>
              {weeks.map(w=>{
                const ev=EVENTS.find(e=>e.week===w);
                const current=w===season.week;const past=w<season.week;
                const bg=current?C.acc:ev?(ev.tier==="Major"?C.gold+"33":ev.tier==="A"?C.live+"22":C.panel2):past?"transparent":C.panel2;
                const fg=current?"#0a0c10":ev?(ev.tier==="Major"?C.gold:ev.tier==="A"?C.live:C.dim):past?C.faint:C.dim;
                const bd=current?C.acc:ev?(ev.tier==="Major"?C.gold:ev.tier==="A"?C.live:C.line):"transparent";
                return(<div key={w} title={`W${w} ${weekToLabel(w,season.year)}${ev?" - "+ev.label:""}`}
                  style={{height:16,borderRadius:2,background:bg,border:`1px solid ${bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:6,fontFamily:mono,fontWeight:current||ev?700:400,color:fg}}>
                  {ev?(ev.tier==="Major"?"★":ev.tier[0]):current?"▸":""}
                </div>);
              })}
            </div>
            {/* Show event name if this month has one */}
            {weeks.map(w=>EVENTS.find(e=>e.week===w)).filter(Boolean).map((ev,i)=>(
              <div key={i} style={{fontFamily:mono,fontSize:7,color:ev.tier==="Major"?C.gold:ev.tier==="A"?C.live:C.dim,marginTop:2,textAlign:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ev.label}</div>
            ))}
          </div>);
        }).filter(Boolean);
      })()}
    </div>
    {/* Legend */}
    <div style={{display:"flex",gap:12,marginBottom:16,fontFamily:mono,fontSize:9,color:C.faint,justifyContent:"center"}}>
      <span style={{color:C.gold}}>★ Major</span><span style={{color:C.live}}>A A-Tier</span><span style={{color:C.dim}}>B B-Tier</span><span style={{color:C.acc}}>▸ Now</span>
    </div>

    {weeksUntil===0&&nextEvent?(
      <Banner c={nextEvent.tier==="Major"?C.gold:nextEvent.tier==="A"?C.live:C.dim}>
        <span style={{fontSize:15,fontWeight:700,color:nextEvent.tier==="Major"?C.gold:nextEvent.tier==="A"?C.live:C.ink}}>
          {nextEvent.label} -- {weekToLabel(season.week,season.year)}, {nextEvent.location||""}
        </span>
        <span style={{fontFamily:mono,fontSize:11,color:C.dim,display:"block",marginTop:3}}>
          {nextEvent.tier==="Major"?"Major - 16 teams":nextEvent.tier==="A"?`A-Tier - ${nextEvent.teams} teams - Bo${nextEvent.bo}`:`B-Tier - ${nextEvent.teams} teams - Bo${nextEvent.bo}`}
        </span>
      </Banner>
    ):(<>
    {/* Activity picker */}
    <SL n="ACT" t="WEEKLY ACTIVITY"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:16}}>
      {Object.entries(ACTIVITIES).map(([k,a])=>{
        const sel=act===k;
        const warn=a.fatigue>0&&avgFatigue+a.fatigue>70;
        return(
        <button key={k} onClick={()=>setAct(k)}
          style={{background:sel?C.acc+"22":C.panel,border:`1px solid ${sel?C.acc:C.line}`,borderRadius:9,padding:"12px 14px",textAlign:"left"}}>
          <div style={{fontSize:20,marginBottom:4}}>{a.icon}</div>
          <div style={{fontWeight:700,fontSize:13,color:sel?C.acc:C.ink}}>{a.label}</div>
          <div style={{fontSize:11,color:C.dim,lineHeight:1.4,marginTop:4}}>{a.desc}</div>
          {warn&&<div style={{fontFamily:mono,fontSize:9,color:C.red,marginTop:4}}>! HIGH FATIGUE</div>}
        </button>);
      })}
    </div>

    {act==="practice"&&(
      <div style={{marginBottom:16}}>
        <div style={{fontFamily:mono,fontSize:11,color:C.dim,marginBottom:8}}>CHOOSE MAP TO DRILL</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {MAPS.map(m=>{const prof=getMapProf(season.simState,myTeam)[m]||50;return(
            <button key={m} onClick={()=>setMapChoice(m)}
              style={{background:mapChoice===m?C.acc:C.panel,color:mapChoice===m?"#0a0c10":C.ink,border:`1px solid ${mapChoice===m?C.acc:C.line}`,borderRadius:7,padding:"8px 14px",fontFamily:mono,fontSize:12}}>
              {m} <span style={{fontSize:10,color:mapChoice===m?"#0a0c10aa":C.faint}}>{prof}</span>
            </button>);
          })}
        </div>
      </div>
    )}

    {act==="scout"&&(
      <div style={{marginBottom:16}}>
        <div style={{fontFamily:mono,fontSize:11,color:C.dim,marginBottom:8}}>CHOOSE TEAM TO SCOUT</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {AI_TEAMS.filter(t=>rosterOf(season.simState,t).length>0).map(t=>{
            const scouted=season.scoutedTeams?.[t];
            return(<button key={t} onClick={()=>setMapChoice(t)}
              style={{background:mapChoice===t?C.acc:C.panel,color:mapChoice===t?"#0a0c10":C.ink,border:`1px solid ${mapChoice===t?C.acc:scouted?C.win+"66":C.line}`,borderRadius:7,padding:"6px 12px",fontFamily:mono,fontSize:11}}>
              {t}{scouted?" ok":""}
            </button>);
          })}
        </div>
        {mapChoice&&season.scoutedTeams?.[mapChoice]&&(
          <div style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:8,padding:"8px 12px",marginTop:8,fontFamily:mono,fontSize:10,color:C.dim}}>
            Already scouted — re-scouting updates intel
          </div>
        )}
      </div>
    )}

    {act&&(
      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:24}}>
        <button onClick={confirm} disabled={act==="scout"&&!mapChoice} style={{background:(act==="scout"&&!mapChoice)?"#333":C.acc,color:(act==="scout"&&!mapChoice)?C.faint:"#0a0c10",border:"none",borderRadius:9,padding:"13px 26px",fontWeight:800,fontSize:15}}>
          ADVANCE WEEK →
        </button>
        <span style={{fontFamily:mono,fontSize:12,color:C.dim}}>Week {season.week} → {season.week+1}</span>
      </div>
    )}

    {/* Sim to next event */}
    {!act&&weeksUntil>1&&(
      <div style={{marginBottom:20}}>
        <button onClick={onSim} style={{background:C.panel2,border:`1px solid ${C.live}`,borderRadius:9,padding:"11px 22px",fontFamily:mono,fontSize:12,color:C.live,fontWeight:700}}>
          ⏩ SIM TO NEXT EVENT ({weeksUntil} weeks)
        </button>
        <span style={{fontFamily:mono,fontSize:10,color:C.faint,marginLeft:10}}>Auto-manages training, rest, and fatigue</span>
      </div>
    )}

    {/* Last random event */}
    {season.weekLog.length>0&&season.weekLog[season.weekLog.length-1]?.event&&(
      <div style={{background:"rgba(255,194,75,.08)",border:`1px solid ${C.gold}44`,borderRadius:8,padding:"10px 14px",marginBottom:16,fontFamily:mono,fontSize:12,color:C.gold}}>
        {season.weekLog[season.weekLog.length-1].event}
      </div>
    )}

    {/* Sponsorships */}
    {(season.sponsorships||[]).filter(sp=>sp.offered||sp.active).length>0&&(<>
      <SL n="SPO" t="SPONSORSHIPS"/>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
        {(season.sponsorships||[]).map((sp,i)=>{
          if(!sp.offered&&!sp.active) return null;
          if(sp.offered) return(
            <div key={i} style={{background:"rgba(255,194,75,.06)",border:`1px solid ${C.gold}44`,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{fontWeight:700,fontSize:13,color:C.gold}}>{sp.brand}</span>
              <span style={{fontFamily:mono,fontSize:11,color:C.ink}}>${sp.monthly}K/mo × {sp.duration}mo</span>
              <span style={{fontSize:11,color:C.dim}}>{sp.condition!=="None"?`Condition: ${sp.condition}`:"No conditions"}</span>
              <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                <button onClick={()=>onAcceptSponsor(i)} style={{background:C.win,color:"#0a0c10",border:"none",borderRadius:6,padding:"5px 12px",fontFamily:mono,fontSize:10,fontWeight:700}}>ACCEPT</button>
                <button onClick={()=>onDeclineSponsor(i)} style={{background:"transparent",border:`1px solid ${C.red}`,color:C.red,borderRadius:6,padding:"5px 10px",fontFamily:mono,fontSize:10,fontWeight:700}}>x</button>
              </div>
            </div>);
          return(
            <div key={i} style={{background:C.panel,border:`1px solid ${C.win}33`,borderRadius:8,padding:"8px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{fontWeight:600,fontSize:12,color:C.win}}>{sp.brand}</span>
              <span style={{fontFamily:mono,fontSize:10,color:C.dim}}>${sp.monthly}K/mo · {Math.ceil(sp.weeksLeft/4)}mo left</span>
              {sp.condition!=="None"&&<span style={{fontSize:10,color:C.gold}}>{sp.condition}</span>}
            </div>);
        })}
      </div>
    </>)}

    {/* Income overview */}
    {(()=>{
      const rank=(()=>{const r=getRankedTeams(season.simState,myTeam);return r.findIndex(x=>x.team===myTeam)+1;})();
      const merchIncome=rank<=3?40:rank<=6?25:rank<=10?15:rank<=16?8:3;
      const stipendIncome=rank<=5?30:rank<=10?20:rank<=16?12:5;
      const contentTier=season.facilities?.content||0;
      const contentIncome=[0,15,30][contentTier]||0;
      const streamIncome=Math.round(roster.reduce((s,p)=>{const pop=playerOvr(p)/20+(season.simState.career?.[p.name]?.totalMvps||0)*0.5;return s+pop;},0));
      const sponsorIncome=(season.sponsorships||[]).reduce((s,sp)=>s+(sp.active?sp.monthly:0),0);
      const totalIncome=contentIncome+merchIncome+stipendIncome+streamIncome+sponsorIncome;
      return(
      <div style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:8,padding:"10px 14px",marginBottom:16,display:"flex",gap:10,flexWrap:"wrap",fontFamily:mono,fontSize:10}}>
        <span style={{color:C.faint}}>MONTHLY:</span>
        <span style={{color:C.win}}>+${stipendIncome}K stipend</span>
        <span style={{color:C.win}}>+${merchIncome}K merch</span>
        {streamIncome>0&&<span style={{color:C.win}}>+${streamIncome}K streams</span>}
        {contentIncome>0&&<span style={{color:C.win}}>+${contentIncome}K content</span>}
        {sponsorIncome>0&&<span style={{color:C.win}}>+${sponsorIncome}K sponsors</span>}
        <span style={{color:C.gold}}>= ${totalIncome}K income</span>
        <span style={{color:C.red}}>- ${totalSalary}K salary</span>
        <span style={{color:totalIncome>=totalSalary?C.win:C.red,fontWeight:700}}>Net {totalIncome>=totalSalary?"+":""}{totalIncome-totalSalary}</span>
      </div>);
    })()}

    {/* Coach */}
    <SL n="CCH" t="COACH"/>
    {season.simState.coach?(
      <div style={{background:C.panel,border:`1px solid ${C.live}`,borderRadius:9,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        <div>
          <div style={{fontWeight:700,fontSize:14}}>{season.simState.coach.name}</div>
          <div style={{fontFamily:mono,fontSize:10,color:C.live}}>{season.simState.coach.style}</div>
        </div>
        <span style={{fontSize:12,color:C.dim,flex:1}}>{season.simState.coach.desc}</span>
        <span style={{fontFamily:mono,fontSize:11,color:C.gold}}>${season.simState.coach.salary}K/ev</span>
        <button onClick={onFireCoach} style={{background:"transparent",border:`1px solid ${C.red}`,color:C.red,borderRadius:6,padding:"5px 10px",fontFamily:mono,fontSize:10,fontWeight:700}}>FIRE</button>
      </div>
    ):(
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
        {COACHES.map(c=>(
          <div key={c.name} style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:8,padding:"9px 13px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <div style={{minWidth:70}}>
              <div style={{fontWeight:600,fontSize:13}}>{c.name}</div>
              <span style={{fontFamily:mono,fontSize:9,color:C.live}}>{c.style}</span>
            </div>
            <span style={{fontSize:11,color:C.dim,flex:1}}>{c.desc}</span>
            <span style={{fontFamily:mono,fontSize:11,color:C.gold}}>${c.salary}K/ev</span>
            <button onClick={()=>onHireCoach(c)} disabled={season.budget<c.salary}
              style={{background:C.win,color:"#0a0c10",border:"none",borderRadius:6,padding:"5px 12px",fontFamily:mono,fontSize:10,fontWeight:700}}>HIRE</button>
          </div>
        ))}
      </div>
    )}

    {/* Player fatigue overview */}
    <SL n="FTG" t="PLAYER STATUS"/>
    <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
      {roster.map(p=>{
        const fc=p.fatigue>80?C.red:p.fatigue>60?C.gold:p.fatigue>40?"#8bc99a":C.win;
        return(
        <div key={p.name} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <div style={{minWidth:90}}>
            <div style={{fontWeight:700,fontSize:13}}>{p.name}</div>
            <div style={{display:"flex",gap:3}}><Pill c={C.dim}>{p.role}</Pill><span style={{fontFamily:mono,fontSize:9,color:C.faint}}>age {p.age}</span></div>
          </div>
          <Stat l="OVR" v={playerOvr(p)}/>
          <FormArrow form={p.form}/>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:52}}>
            <span style={{fontFamily:mono,fontSize:9,color:C.faint}}>FATIGUE</span>
            <div style={{width:48,height:6,background:C.line,borderRadius:3,overflow:"hidden",marginTop:2}}>
              <div style={{width:`${p.fatigue}%`,height:"100%",background:fc,borderRadius:3}}/>
            </div>
            <span style={{fontFamily:mono,fontSize:10,color:fc}}>{p.fatigue}</span>
          </div>
          {p.fatigue>80&&<span style={{fontFamily:mono,fontSize:9,color:C.red,border:`1px solid ${C.red}`,borderRadius:4,padding:"1px 5px"}}>EXHAUSTED</span>}
        </div>);
      })}
    </div>

    {/* Transfer access */}
    <button onClick={()=>setShowTransfer(!showTransfer)}
      style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,padding:"10px 16px",fontFamily:mono,fontSize:12,color:C.dim,marginBottom:16}}>
      {showTransfer?"▾ HIDE":"▸ SHOW"} TRANSFER MARKET (roster {roster.length}/5, salary ${totalSalary}K)
    </button>
    {showTransfer&&<TransferPanel season={season} myTeam={myTeam} onTransfer={onTransfer}/>}

    {/* Academy */}
    <SL n="ACD" t="ACADEMY"/>
    {!season.academy?(
      <div style={{background:C.panel,border:`1px dashed ${C.line}`,borderRadius:9,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <span style={{fontSize:18}}>[AC]</span>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:13}}>Establish Academy</div>
          <div style={{fontSize:11,color:C.dim}}>Develop young talent for your roster or sell for profit.</div>
        </div>
        <button onClick={onInitAcademy} disabled={season.budget<100}
          style={{background:season.budget>=100?C.acc:"#333",color:season.budget>=100?"#0a0c10":C.faint,border:"none",borderRadius:7,padding:"8px 16px",fontWeight:700,fontSize:12}}>
          $100K
        </button>
      </div>
    ):(
      <div style={{marginBottom:20}}>
        <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginBottom:8}}>Developing for {season.academy.weeksActive} weeks · {season.academy.prospects.length}/4 prospects</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {season.academy.prospects.map((p,i)=>(
            <div key={i} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,padding:"9px 13px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <div style={{minWidth:80}}>
                <div style={{fontWeight:600,fontSize:12}}>{p.name}</div>
                <div style={{display:"flex",gap:3}}><Pill c={C.dim}>{p.role}</Pill><span style={{fontFamily:mono,fontSize:9,color:C.win}}>age {p.age}</span></div>
              </div>
              <Stat l="OVR" v={playerOvr(p)}/>
              <Stat l="AIM" v={p.aim}/>
              <span style={{fontFamily:mono,fontSize:9,color:C.faint}}>{p.weeksInAcademy||0}wk trained</span>
              <div style={{marginLeft:"auto",display:"flex",gap:4}}>
                <button onClick={()=>onPromoteProspect(i)} disabled={rosterOf(season.simState,myTeam).length>=5}
                  style={{background:C.win,color:"#0a0c10",border:"none",borderRadius:5,padding:"4px 10px",fontFamily:mono,fontSize:9,fontWeight:700}}>PROMOTE</button>
                <button onClick={()=>onSellProspect(i)} disabled={(p.weeksInAcademy||0)<8}
                  style={{background:(p.weeksInAcademy||0)>=8?C.panel2:"#222",color:(p.weeksInAcademy||0)>=8?C.gold:C.faint,border:`1px solid ${(p.weeksInAcademy||0)>=8?C.gold+"44":C.line}`,borderRadius:5,padding:"4px 10px",fontFamily:mono,fontSize:9,fontWeight:700}}>{(p.weeksInAcademy||0)>=8?`SELL $Math.round(playerOvr(p)*0.8)K`:`${8-(p.weeksInAcademy||0)}wk to sell`}</button>
              </div>
            </div>
          ))}
          {season.academy.prospects.length===0&&<div style={{fontFamily:mono,fontSize:11,color:C.faint,padding:"8px 0"}}>No prospects yet — new talent scouted every 6 weeks.</div>}
        </div>
      </div>
    )}
    </>)}

    {/* Week log with events */}
    {season.weekLog.length>0&&(<>
      <SL n="LOG" t="ACTIVITY LOG"/>
      <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:200,overflowY:"auto"}}>
        {[...season.weekLog].reverse().slice(0,15).map((w,i)=>(
          <div key={i} style={{fontFamily:mono,fontSize:11,color:w.event?C.gold:C.dim,padding:"4px 0"}}>
            <span style={{color:C.faint}}>W{w.week}</span>{" "}
            {w.event?w.event:(<>{ACTIVITIES[w.activity]?.icon} {ACTIVITIES[w.activity]?.label}{w.mapChoice?` (${w.mapChoice})`:""}</>)}
          </div>
        ))}
      </div>
    </>)}
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════
// MAP PROFICIENCY VIEW
// ═══════════════════════════════════════════════════════════════════════
function MapProfView({state,myTeam}){
  const prof=getMapProf(state,myTeam);
  return(<div>
    <Intro text="Your team's map pool. Practice maps during the calendar to improve proficiency."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12}}>
      {MAPS.map(m=>{const v=prof[m]||50;const c=v>=75?C.win:v>=60?C.gold:v>=45?C.dim:C.red;return(
        <div key={m} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:9,padding:"16px 14px",textAlign:"center"}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>{m}</div>
          <div style={{fontFamily:mono,fontSize:28,fontWeight:800,color:c}}>{v}</div>
          <div style={{height:6,background:C.line,borderRadius:3,overflow:"hidden",marginTop:8}}>
            <div style={{width:`${v}%`,height:"100%",background:c,borderRadius:3}}/>
          </div>
        </div>);
      })}
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════
// RANKINGS VIEW
// ═══════════════════════════════════════════════════════════════════════
function FacilitiesView({season,onUpgrade}){
  return(<div>
    <Intro text="Invest in permanent upgrades for your organization. Facilities provide passive bonuses every week."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
      {Object.entries(FACILITIES).map(([id,fac])=>{
        const tier=season.facilities?.[id]||0;
        const maxed=tier>=fac.maxTier;
        const nextCost=maxed?null:fac.cost[tier];
        const canAfford=nextCost&&season.budget>=nextCost;
        return(
        <div key={id} style={{background:C.panel,border:`1px solid ${tier>0?C.win+"44":C.line}`,borderRadius:10,padding:"14px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:22}}>{fac.icon}</span>
            <div>
              <div style={{fontWeight:700,fontSize:14}}>{fac.name}</div>
              <div style={{display:"flex",gap:3,marginTop:2}}>
                {Array.from({length:fac.maxTier},(_,i)=>(
                  <div key={i} style={{width:16,height:4,borderRadius:2,background:i<tier?C.win:C.line}}/>
                ))}
                <span style={{fontFamily:mono,fontSize:9,color:tier>0?C.win:C.faint,marginLeft:4}}>Tier {tier}/{fac.maxTier}</span>
              </div>
            </div>
          </div>
          {/* Current tier description */}
          {tier>0&&<div style={{fontSize:12,color:C.win,marginBottom:6,fontFamily:mono,fontSize:10}}>{fac.desc[tier-1]}</div>}
          {/* Next tier */}
          {!maxed?(
            <div style={{marginTop:6}}>
              <div style={{fontSize:11,color:C.dim,marginBottom:6}}>{tier===0?"Unlock:":"Upgrade:"} {fac.desc[tier]}</div>
              <button onClick={()=>onUpgrade(id)} disabled={!canAfford}
                style={{width:"100%",background:canAfford?C.acc:"#333",color:canAfford?"#0a0c10":C.faint,border:"none",borderRadius:7,padding:"8px",fontWeight:700,fontSize:12}}>
                {canAfford?`UPGRADE — ${nextCost}K`:`$${nextCost}K (need $${nextCost-season.budget}K more)`}
              </button>
            </div>
          ):(
            <div style={{fontFamily:mono,fontSize:10,color:C.gold,marginTop:6}}>ok MAX TIER</div>
          )}
        </div>);
      })}
    </div>
  </div>);
}

function RankingsView({state,myTeam}){
  const ranked=getRankedTeams(state,myTeam);
  const maxPts=ranked[0]?.pts||1;
  return(<div>
    <Intro text="World rankings based on event results. Majors award 3× points, A-tier 2×, B-tier 1×. Rankings determine seeding at events."/>
    <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"36px 1fr 70px 1fr",gap:8,padding:"8px 14px",fontFamily:mono,fontSize:10,color:C.faint,letterSpacing:1}}>
        <span>#</span><span>TEAM</span><span style={{textAlign:"right"}}>POINTS</span><span></span>
      </div>
      {ranked.map((r,i)=>{const me=r.team===myTeam;const pct=maxPts>0?r.pts/maxPts*100:0;
        const col=i===0?C.gold:i<=2?C.acc:i<=7?C.live:C.dim;
        return(
        <div key={r.team} style={{display:"grid",gridTemplateColumns:"36px 1fr 70px 1fr",gap:8,padding:"9px 14px",alignItems:"center",borderTop:`1px solid ${C.line}`,borderLeft:`3px solid ${me?C.acc:col}`,background:me?"rgba(255,92,46,.06)":"transparent"}}>
          <span style={{fontFamily:mono,fontWeight:700,fontSize:15,color:col}}>{i+1}</span>
          <span style={{fontWeight:me?700:600,fontSize:13,color:me?C.acc:C.ink}}>{r.team}{me?" ◂ you":""}</span>
          <span style={{fontFamily:mono,fontWeight:700,fontSize:13,textAlign:"right",color:col}}>{r.pts}</span>
          <div style={{height:6,background:C.line,borderRadius:3,overflow:"hidden"}}>
            <div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:3}}/>
          </div>
        </div>);
      })}
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════
// RIVALRY VIEW
// ═══════════════════════════════════════════════════════════════════════
function RivalryView({state,myTeam}){
  const rivals=Object.entries(state.rivalries).filter(([k,r])=>k.includes(myTeam)&&r.matches>0).sort((a,b)=>b[1].matches-a[1].matches);
  return(<div>
    <Intro text="Head-to-head records against teams you've faced. Rivalries form after 3+ meetings."/>
    {rivals.length===0?<Empty text="No match history yet. Play some games!"/>:(
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {rivals.map(([k,r])=>{
        const opp=k.split("|").find(t=>t!==myTeam);
        const myWins=r.wins[myTeam]||0;const theirWins=r.wins[opp]||0;
        return(
        <div key={k} style={{background:C.panel,border:`1px solid ${r.isRival?C.rival:C.line}`,borderRadius:9,padding:"12px 16px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
          {r.isRival&&<span style={{fontFamily:mono,fontSize:9,color:C.rival,border:`1px solid ${C.rival}`,borderRadius:4,padding:"2px 6px",fontWeight:700}}>RIVAL</span>}
          <span style={{fontWeight:700,fontSize:14}}>{opp}</span>
          <span style={{fontFamily:mono,fontSize:13,color:C.win,fontWeight:700}}>{myWins}W</span>
          <span style={{fontFamily:mono,fontSize:13,color:C.red}}>{theirWins}L</span>
          <span style={{fontFamily:mono,fontSize:11,color:C.faint}}>({r.matches} played)</span>
          {r.isRival&&<span style={{fontSize:11,color:C.rival,marginLeft:"auto"}}>+mentality boost in matchups</span>}
        </div>);
      })}
    </div>)}
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════
// TRANSFER PANEL (used inside calendar)
// ═══════════════════════════════════════════════════════════════════════
function TransferPanel({season,myTeam,onTransfer}){
  const [scoutTeam,setScoutTeam]=useState(null);
  const roster=rosterOf(season.simState,myTeam);
  const fas=freeAgents(season.simState).sort((a,b)=>playerOvr(b)-playerOvr(a));
  const rosterFull=roster.length>=5;
  return(<div style={{marginBottom:24}}>
    <SL n="FA" t="FREE AGENTS"/>
    {fas.length===0?<Empty text="No free agents available."/>:(
    <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
      {fas.slice(0,10).map(p=>(
        <div key={p.name} style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:8,padding:"9px 13px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <div style={{minWidth:80}}><span style={{fontWeight:600,fontSize:13}}>{p.name}</span><span style={{fontFamily:mono,fontSize:9,color:C.faint,marginLeft:4}}>age {p.age}</span></div>
          <Pill c={C.dim}>{p.role}</Pill>
          <Stat l="OVR" v={playerOvr(p)}/>
          <span style={{fontFamily:mono,fontSize:11,color:C.gold}}>${p.salary}K</span>
          <button onClick={()=>onTransfer("sign",p.name)} disabled={rosterFull||season.budget<p.salary}
            style={{marginLeft:"auto",background:C.win,color:"#0a0c10",border:"none",borderRadius:6,padding:"5px 12px",fontFamily:mono,fontSize:10,fontWeight:700}}>SIGN</button>
        </div>))}
    </div>)}
    <SL n="SCT" t="SCOUT TEAMS"/>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
      {AI_TEAMS.map(team=>(
        <button key={team} onClick={()=>setScoutTeam(scoutTeam===team?null:team)}
          style={{background:scoutTeam===team?C.acc:C.panel,color:scoutTeam===team?"#0a0c10":C.dim,border:`1px solid ${scoutTeam===team?C.acc:C.line}`,borderRadius:5,padding:"4px 10px",fontFamily:mono,fontSize:10,fontWeight:700}}>{team}</button>
      ))}
    </div>
    {scoutTeam&&(
      <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:9,padding:"12px"}}>
        {rosterOf(season.simState,scoutTeam).map(p=>{const buyout=Math.round(marketValue(p)*2);return(
          <div key={p.name} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderTop:`1px solid ${C.line}`,flexWrap:"wrap"}}>
            <span style={{fontWeight:600,fontSize:12,minWidth:80}}>{p.name}</span><Pill c={C.dim}>{p.role}</Pill>
            <Stat l="OVR" v={playerOvr(p)}/>
            <span style={{fontFamily:mono,fontSize:10,color:C.gold}}>${buyout}K</span>
            <button onClick={()=>onTransfer("buy",p.name)} disabled={rosterFull||season.budget<buyout}
              style={{marginLeft:"auto",background:C.live,color:"#0a0c10",border:"none",borderRadius:5,padding:"4px 10px",fontFamily:mono,fontSize:10,fontWeight:700}}>BUY</button>
          </div>);})}
      </div>)}
    {/* Release from roster */}
    {roster.length>0&&(<>
      <SL n="RLS" t="RELEASE PLAYER"/>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {roster.map(p=>(
          <div key={p.name} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0"}}>
            <span style={{fontWeight:600,fontSize:12,minWidth:80}}>{p.name}</span><Pill c={C.dim}>{p.role}</Pill>
            <Stat l="OVR" v={playerOvr(p)}/>
            <button onClick={()=>onTransfer("release",p.name)} disabled={roster.length<=4}
              style={{marginLeft:"auto",background:"transparent",border:`1px solid ${C.red}`,color:C.red,borderRadius:5,padding:"4px 10px",fontFamily:mono,fontSize:10,fontWeight:700}}>RELEASE</button>
          </div>))}
      </div>
    </>)}
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════
// DRAFT SCREEN
// ═══════════════════════════════════════════════════════════════════════
function DraftScreen({onComplete}){
  const [name,setName]=useState("");
  const [named,setNamed]=useState(false);
  const [eras,setEras]=useState(["current"]);
  const [simState,setSimState]=useState(null);
  const [budget,setBudget]=useState(DRAFT_BUDGET);
  const [roster,setRoster]=useState([]);
  const [filter,setFilter]=useState("ALL");
  const [sort,setSort]=useState("ovr");
  const teamName=name.trim()||"MY TEAM";

  const ERA_OPTIONS=[
    {id:"current",label:"Current",desc:"2024-25 rosters",color:C.acc},
    {id:"2018",label:"2018-21",desc:"s1mple, Astralis era, coldzera",color:C.live},
    {id:"2015",label:"2015-17",desc:"olof, kennyS, FalleN, fnatic",color:C.gold},
    {id:"2013",label:"2013-14",desc:"GeT_RiGhT, f0rest, NiP, VP",color:"#c9d2e0"},
  ];

  function toggleEra(id){
    const next=eras.includes(id)?eras.filter(e=>e!==id):[...eras,id];
    if(next.length===0) return; // must have at least one
    setEras(next);
  }

  function confirmSetup(){
    if(!name.trim()) return;
    const ss=initState(eras);
    setSimState(ss);
    setNamed(true);
  }

  function buyPlayer(p){
    const cost=draftCost(p);if(budget<cost||roster.length>=5)return;
    const oldTeam=p.team;p.team=teamName;p.contract=2;
    setBudget(b=>b-cost);setRoster(r=>[...r,p]);
    if(oldTeam!=="FA"){const fas=freeAgents(simState);if(fas.length>0){const best=[...fas].sort((a,b)=>playerOvr(b)-playerOvr(a))[0];best.team=oldTeam;best.contract=2;}}
    if(!simState.stats[p.name])simState.stats[p.name]={maps:0,rating:0,mvps:0,clutches:0};if(!simState.career[p.name])simState.career[p.name]={totalMaps:0,totalMvps:0,totalClutches:0,avgRating:0,bestRating:0,eventHistory:[],mapStats:{},origStats:{aim:p.aim,gameSense:p.gameSense,util:p.util,igl:p.igl,mentality:p.mentality,consistency:p.consistency,rifle:p.rifle,pistol:p.pistol,awp:p.awp,clutch:p.clutch,entry:p.entry,stamina:p.stamina,composure:p.composure,experience:p.experience},kills:0};
  }
  function releasePlayer(p){const refund=Math.round(draftCost(p)*0.5);p.team="FA";p.contract=0;setBudget(b=>b+refund);setRoster(r=>r.filter(x=>x.name!==p.name));}
  function startSeason(){if(roster.length!==5||!simState)return;onComplete(teamName,simState,budget);}

  const avail=simState?simState.players.filter(p=>p.team!==teamName):[];
  const filtered=filter==="ALL"?avail:filter==="FA"?avail.filter(p=>p.team==="FA"):filter==="LEGEND"?avail.filter(p=>(p.era||"current")!=="current"):avail.filter(p=>p.role===filter);
  const sorted=[...filtered].sort((a,b)=>sort==="ovr"?playerOvr(b)-playerOvr(a):sort==="aim"?b.aim-a.aim:sort==="cost"?draftCost(a)-draftCost(b):b.gameSense-a.gameSense);

  if(!named)return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:sans,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <Gstyle/>
      <div style={{maxWidth:520,padding:"40px 24px",textAlign:"center"}}>
        <div style={{fontFamily:mono,fontWeight:700,fontSize:16,color:C.acc,letterSpacing:3,marginBottom:8}}>▸ OVERTIME</div>
        <h1 style={{fontSize:32,fontWeight:800,margin:"0 0 8px",letterSpacing:-.5}}>Build Your Org</h1>
        <p style={{color:C.dim,fontSize:13,lineHeight:1.6,margin:"0 0 20px"}}>
          Name your organization, choose which player eras to include, then draft 5 players for a {SEASON_WEEKS}-week season.
        </p>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter org name…"
          onKeyDown={e=>{if(e.key==="Enter"&&name.trim())confirmSetup();}}
          style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,padding:"14px 18px",color:C.ink,fontFamily:mono,fontSize:15,fontWeight:700,width:"100%",maxWidth:300,outline:"none",marginBottom:20}}/>
        <div style={{fontFamily:mono,fontSize:11,color:C.dim,letterSpacing:1.5,marginBottom:10}}>PLAYER ERAS</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:24}}>
          {ERA_OPTIONS.map(e=>{const on=eras.includes(e.id);return(
            <button key={e.id} onClick={()=>toggleEra(e.id)}
              style={{background:on?e.color+"22":C.panel,border:`2px solid ${on?e.color:C.line}`,borderRadius:9,padding:"10px 14px",textAlign:"left",minWidth:110}}>
              <div style={{fontWeight:700,fontSize:13,color:on?e.color:C.dim}}>{e.label}</div>
              <div style={{fontSize:10,color:on?C.dim:C.faint,marginTop:2}}>{e.desc}</div>
              {on&&<div style={{fontFamily:mono,fontSize:9,color:e.color,marginTop:4}}>ok ACTIVE</div>}
            </button>);})}
        </div>
        <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginBottom:16}}>
          {PLAYERS_INIT.filter(p=>eras.includes(p.era||"current")).length} players available across {eras.length} era{eras.length>1?"s":""}
        </div>
        <button onClick={confirmSetup} disabled={!name.trim()}
          style={{background:C.acc,color:"#0a0c10",border:"none",borderRadius:8,padding:"14px 28px",fontWeight:800,fontSize:15}}>START DRAFT →</button>
      </div>
    </div>);

  if(!simState) return null; // shouldn't happen but guard

  return(
  <div style={{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:sans}}>
    <Gstyle/>
    <header style={{borderBottom:`1px solid ${C.line}`,padding:"13px 22px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",position:"sticky",top:0,background:C.bg,zIndex:20}}>
      <span style={{fontFamily:mono,fontWeight:700,fontSize:13,color:C.acc,letterSpacing:2}}>▸ OVERTIME</span>
      <span style={{fontFamily:mono,fontSize:11,color:C.dim,letterSpacing:1}}>DRAFT · {teamName}</span>
      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:14}}>
        <span style={{fontFamily:mono,fontSize:12,color:C.gold,fontWeight:700}}>{budget}K</span>
        <span style={{fontFamily:mono,fontSize:11,color:C.faint}}>ROSTER {roster.length}/5</span>
      </div>
    </header>
    <main style={{maxWidth:1100,margin:"0 auto",padding:"22px 18px 80px"}}>
      <SL n="RST" t={`${teamName} · YOUR PICKS`}/>
      {roster.length===0?<Empty text="No players drafted yet. Browse the market below."/>:(
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:8}}>
          {roster.map(p=>(
            <div key={p.name} style={{background:C.panel,border:`1px solid ${C.acc}33`,borderRadius:9,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <div style={{minWidth:100}}>
                <div style={{fontWeight:700,fontSize:14}}>{p.name}</div>
                <div style={{display:"flex",gap:4,marginTop:2}}><Pill c={C.dim}>{p.role}</Pill>{p.traits.map(tr=><TraitPill key={tr} t={tr}/>)}</div>
              </div>
              <Stat l="OVR" v={playerOvr(p)}/><Stat l="AIM" v={p.aim}/><Stat l="SENSE" v={p.gameSense}/>
              <span style={{fontFamily:mono,fontSize:11,color:C.gold}}>${p.salary}K/ev</span>
              <span style={{fontFamily:mono,fontSize:9,color:C.faint}}>age {p.age}</span>
              <button onClick={()=>releasePlayer(p)} style={{marginLeft:"auto",background:"transparent",border:`1px solid ${C.red}`,color:C.red,borderRadius:6,padding:"5px 10px",fontFamily:mono,fontSize:10,fontWeight:700}}>DROP</button>
            </div>))}
        </div>)}
      {roster.length===5&&<div style={{display:"flex",justifyContent:"center",padding:"16px 0 24px"}}>
        <button onClick={startSeason} style={{background:C.acc,color:"#0a0c10",border:"none",borderRadius:10,padding:"16px 36px",fontWeight:800,fontSize:17,letterSpacing:.5}}>START SEASON →</button>
      </div>}
      {roster.length>0&&roster.length<5&&<div style={{textAlign:"center",padding:"10px 0 20px",fontFamily:mono,fontSize:12,color:C.dim}}>Need {5-roster.length} more · ${budget}K remaining</div>}
      <SL n="MKT" t="PLAYER MARKET"/>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
        {["ALL","FA","LEGEND","IGL","AWP","Entry","Lurk","Support"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?C.acc:C.panel,color:filter===f?"#0a0c10":C.dim,border:`1px solid ${filter===f?C.acc:C.line}`,borderRadius:6,padding:"5px 10px",fontFamily:mono,fontSize:10,fontWeight:700}}>{f}</button>
        ))}
        <span style={{width:1,background:C.line,margin:"0 4px"}}/>
        {[["ovr","OVR"],["aim","AIM"],["cost","COST"]].map(([k,l])=>(
          <button key={k} onClick={()=>setSort(k)} style={{background:sort===k?C.live:C.panel,color:sort===k?"#0a0c10":C.dim,border:`1px solid ${sort===k?C.live:C.line}`,borderRadius:6,padding:"5px 10px",fontFamily:mono,fontSize:10,fontWeight:700}}>↕ {l}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {sorted.slice(0,40).map(p=>{const cost=draftCost(p);const canBuy=budget>=cost&&roster.length<5;const isFA=p.team==="FA";return(
          <div key={p.name} style={{background:(p.era&&p.era!=="current")?C.panel2+"":C.panel2,border:`1px solid ${p.era&&p.era!=="current"?C.gold+"44":C.line}`,borderRadius:8,padding:"9px 13px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <div style={{minWidth:85}}>
              <div style={{fontWeight:600,fontSize:13}}>{p.name}</div>
              <div style={{display:"flex",gap:3,marginTop:1}}>
                <Pill c={C.dim}>{p.role}</Pill>
                {p.traits.map(tr=><TraitPill key={tr} t={tr}/>)}
                {p.era&&p.era!=="current"&&<Pill c={p.era==="2018"?C.live:p.era==="2015"?C.gold:"#c9d2e0"}>{p.era}</Pill>}
              </div>
            </div>
            <Stat l="OVR" v={playerOvr(p)}/><Stat l="AIM" v={p.aim}/><Stat l="SENSE" v={p.gameSense}/><Stat l="CON" v={p.consistency}/>
            <span style={{fontFamily:mono,fontSize:9,color:C.faint}}>age {p.age}</span>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:55}}>
              <span style={{fontFamily:mono,fontSize:9,color:C.faint}}>{isFA?"TEAM":"FROM"}</span>
              <span style={{fontFamily:mono,fontSize:11,color:isFA?C.win:C.dim}}>{isFA?"Free Agent":p.team}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",marginLeft:"auto",minWidth:80}}>
              <span style={{fontFamily:mono,fontSize:9,color:C.faint}}>{isFA?"SIGN":"BUYOUT"}</span>
              <span style={{fontFamily:mono,fontSize:13,fontWeight:700,color:canBuy?C.gold:C.red}}>${cost}K</span>
            </div>
            <button onClick={()=>buyPlayer(p)} disabled={!canBuy}
              style={{background:canBuy?(isFA?C.win:C.live):"#333",color:canBuy?"#0a0c10":C.faint,border:"none",borderRadius:6,padding:"6px 14px",fontFamily:mono,fontSize:11,fontWeight:700}}>
              {isFA?"SIGN":"BUY"}
            </button>
          </div>);})}
      </div>
    </main>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════
// TOURNAMENT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════
function Gstyle(){return <style>{`*{box-sizing:border-box;}@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');button{cursor:pointer;font-family:${sans};transition:all .12s ease;}button:disabled{cursor:default;opacity:.5;}button:focus-visible{outline:2px solid ${C.acc};outline-offset:2px;}::-webkit-scrollbar{height:9px;width:9px;}::-webkit-scrollbar-thumb{background:${C.line};border-radius:4px;}@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.55;}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;}}`}</style>;}

function Header({season,myTeam,onReset,stageLabel,onSave}){
  const [showSave,setShowSave]=useState(false);
  return(
  <header style={{borderBottom:`1px solid ${C.line}`,padding:"13px 22px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",position:"sticky",top:0,background:C.bg,zIndex:20}}>
    <span style={{fontFamily:mono,fontWeight:700,fontSize:13,color:C.acc,letterSpacing:2}}>▸ OVERTIME</span>
    <span style={{fontFamily:mono,fontSize:11,color:C.dim,letterSpacing:1}}>{stageLabel}</span>
    <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontFamily:mono,fontSize:10,color:C.gold}}>${season.budget}K</span>
      <span style={{fontWeight:700,fontSize:13,color:C.acc}}>{myTeam}</span>
      <div style={{position:"relative"}}>
        <button onClick={()=>setShowSave(!showSave)} style={{background:C.panel,color:C.live,border:`1px solid ${C.line}`,borderRadius:6,padding:"7px 10px",fontSize:11,fontFamily:mono}}>[S]</button>
        {showSave&&<div style={{position:"absolute",right:0,top:"100%",marginTop:4,background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,padding:"8px",zIndex:30,minWidth:120,display:"flex",flexDirection:"column",gap:4}}>
          {[1,2,3].map(i=><button key={i} onClick={()=>{onSave(i);setShowSave(false);}} style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:5,padding:"6px 10px",fontFamily:mono,fontSize:10,color:C.ink,textAlign:"left"}}>Save Slot {i}</button>)}
        </div>}
      </div>
      <button onClick={onReset} style={{background:C.panel,color:C.dim,border:`1px solid ${C.line}`,borderRadius:6,padding:"7px 10px",fontSize:11,fontFamily:mono}}>MENU</button>
    </div>
  </header>);}

function Tabs({tab,setTab,calMode,miniMode}){
  const items=calMode
    ?[["calendar","CALENDAR"],["roster","ROSTER"],["maps","MAPS"],["facility","FACILITY"],["rankings","RANKINGS"],["rivals","RIVALS"],["season","SEASON"]]
    :miniMode
    ?[["hub","HUB"],["bracket","BRACKET"],["roster","ROSTER"],["stats","STATS"],["rivals","RIVALS"],["season","SEASON"]]
    :[["hub","HUB"],["groups","GROUPS"],["bracket","BRACKET"],["roster","ROSTER"],["stats","STATS"],["rivals","RIVALS"],["season","SEASON"]];
  return(
  <nav style={{display:"flex",gap:2,padding:"11px 22px 0",borderBottom:`1px solid ${C.line}`,flexWrap:"wrap",overflowX:"auto"}}>
    {items.map(([k,l])=>(
      <button key={k} onClick={()=>setTab(k)} style={{background:"transparent",border:"none",padding:"9px 12px",fontFamily:mono,fontSize:11,fontWeight:700,letterSpacing:1,color:tab===k?C.ink:C.dim,borderBottom:`2px solid ${tab===k?C.acc:"transparent"}`,marginBottom:-1,whiteSpace:"nowrap"}}>{l}</button>
    ))}
  </nav>);}

// ═══════════════════════════════════════════════════════════════════════
// HLTV-STYLE EVENT VIEW
// ═══════════════════════════════════════════════════════════════════════
function EventHLTV({t,myTeam,nf,onPlay,alive,onOpen,onEndEvent,season,SEED,evLabel,tierTag,tab,setTab}){
  const [evTab,setEvTab]=useState("results");
  const tierC=tierTag==="Major"?C.gold:tierTag==="A"?C.live:C.dim;
  const location=season?.currentEvent?.location||"";

  return(<div style={{fontFamily:sans}}>
    {/* HLTV-style event header */}
    <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,padding:"16px 20px",marginBottom:12}}>
      <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div style={{background:tierC+"22",border:`1px solid ${tierC}`,borderRadius:6,padding:"3px 10px",fontFamily:mono,fontSize:10,color:tierC,fontWeight:700}}>{tierTag.toUpperCase()}</div>
        <div>
          <div style={{fontWeight:800,fontSize:20}}>{evLabel}</div>
          <div style={{fontFamily:mono,fontSize:11,color:C.dim,marginTop:2}}>{location} · {weekToLabel(season?.week||1,season?.year)} ${season?.year||2026} · {t.teams?.length||t.participants?.length||16} Teams</div>
        </div>
        {t.stage==="done"&&t.champion&&(
          <div style={{marginLeft:"auto",textAlign:"right"}}>
            <div style={{fontFamily:mono,fontSize:9,color:C.gold}}>CHAMPION</div>
            <div style={{fontWeight:800,fontSize:16,color:C.gold}}>[W] {t.champion}</div>
          </div>
        )}
      </div>
    </div>

    {/* Action banner */}
    {t.stage==="done"?(
      <div style={{background:t.champion===myTeam?"linear-gradient(135deg,#2a2310,#1a1f29)":C.panel,border:`1px solid ${t.champion===myTeam?C.gold:C.line}`,borderRadius:10,padding:"14px 18px",marginBottom:12,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        {t.champion===myTeam?<span style={{color:C.gold,fontWeight:800,fontSize:18}}>[W] {myTeam} WIN {evLabel.toUpperCase()}!</span>:<span style={{color:C.dim,fontSize:15}}>{myTeam} finish {alive?"top":"eliminated"}.</span>}
        {onEndEvent&&<button onClick={onEndEvent} style={{marginLeft:"auto",background:t.champion===myTeam?C.gold:C.acc,color:"#0a0c10",border:"none",borderRadius:8,padding:"10px 20px",fontWeight:800,fontSize:14}}>BACK TO CALENDAR →</button>}
      </div>
    ):!alive?(
      <div style={{background:C.panel,border:`1px solid ${C.red}40`,borderRadius:10,padding:"14px 18px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
        <span style={{color:C.red,fontWeight:700}}>[X] {myTeam} eliminated</span>
        {onEndEvent&&<button onClick={onEndEvent} style={{marginLeft:"auto",background:C.panel2,color:C.acc,border:`1px solid ${C.acc}`,borderRadius:8,padding:"8px 16px",fontWeight:700,fontSize:13}}>BACK TO CALENDAR →</button>}
      </div>
    ):nf?(
      <NextMatchHLTV nf={nf} myTeam={myTeam} onPlay={onPlay} t={t} SEED={SEED}/>
    ):null}

    {/* Stage tabs */}
    <div style={{display:"flex",gap:1,marginBottom:12,background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,overflow:"hidden"}}>
      {["results","standings","bracket"].map(tb=>(
        <button key={tb} onClick={()=>setEvTab(tb)}
          style={{flex:1,background:evTab===tb?C.acc:"transparent",color:evTab===tb?"#0a0c10":C.dim,border:"none",padding:"9px 0",fontFamily:mono,fontSize:11,fontWeight:700,letterSpacing:1}}>
          {tb.toUpperCase()}
        </button>
      ))}
    </div>

    {evTab==="results"&&<SwissResults t={t} myTeam={myTeam} onOpen={onOpen}/>}
    {evTab==="standings"&&<SwissStandings t={t} myTeam={myTeam} SEED={SEED}/>}
    {evTab==="bracket"&&(t.bracket?<PlayoffBracket bracket={t.bracket} champion={t.champion} myTeam={myTeam} onOpen={onOpen} SEED={SEED}/>:<Locked text="Bracket unlocks when all group matches are complete."/>)}
  </div>);
}

function NextMatchHLTV({nf,myTeam,onPlay,t,SEED}){
  const opp=nf.fx.a===myTeam?nf.fx.b:nf.fx.a;
  const bo=nf.bo||nf.fx?.bo||1;
  const isSwiss=nf.kind==="swiss";
  const myRec=t.swiss?.records[myTeam];
  const oppRec=t.swiss?.records[opp];
  const rival=isRivalMatch(t.simState,myTeam,opp);
  const stageStr=isSwiss?`SWISS — Bo${bo}`:`${nf.kind.toUpperCase()} — Bo${bo}`;
  return(
  <div style={{background:`linear-gradient(135deg,#13171f,#1a1f29)`,border:`2px solid ${rival?C.rival:C.acc}`,borderRadius:10,padding:"16px 20px",marginBottom:12}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
      <span style={{width:7,height:7,borderRadius:7,background:C.acc,animation:"pulse 1.4s infinite"}}/>
      <span style={{fontFamily:mono,fontSize:10,color:C.acc,letterSpacing:1.5}}>▸ UP NEXT · {stageStr}</span>
      {rival&&<span style={{fontFamily:mono,fontSize:9,color:C.rival,border:`1px solid ${C.rival}`,borderRadius:4,padding:"2px 6px"}}>[!] RIVALRY</span>}
      {isSwiss&&myRec&&<span style={{fontFamily:mono,fontSize:10,color:C.faint,marginLeft:"auto"}}>{myRec.w}-{myRec.l} vs {oppRec?.w||0}-{oppRec?.l||0}</span>}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:16,alignItems:"center"}}>
      <div>
        <div style={{fontWeight:800,fontSize:18,color:C.acc}}>{myTeam}</div>
        <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginTop:2}}>#{SEED[myTeam]||"?"} seed · chem {t.simState.chemistry[myTeam]||55}</div>
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:mono,fontSize:22,color:C.faint,fontWeight:700}}>VS</div>
        <div style={{fontFamily:mono,fontSize:9,color:C.faint}}>Bo{bo}</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontWeight:700,fontSize:18}}>{opp}</div>
        <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginTop:2}}>#{SEED[opp]||"?"} seed · chem {t.simState.chemistry[opp]||70}</div>
      </div>
    </div>
    <button onClick={()=>onPlay(nf.fx,bo)} style={{width:"100%",marginTop:14,background:C.acc,color:"#0a0c10",border:"none",borderRadius:8,padding:"12px",fontWeight:800,fontSize:15,letterSpacing:.5}}>
      {bo===1?"PICK MAP →":"ENTER VETO →"}
    </button>
  </div>);
}

function SwissResults({t,myTeam,onOpen}){
  const swiss=t.swiss;if(!swiss)return null;
  const allMatches=swiss.rounds.flatMap((rd,ri)=>rd.fixtures.map(f=>({...f,roundIdx:ri})));
  if(!allMatches.length)return <Empty text="No matches played yet."/>;
  return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
    {swiss.rounds.map((rd,ri)=>{
      const done=rd.fixtures.every(f=>f.done);
      return(<div key={ri}>
        <div style={{fontFamily:mono,fontSize:10,color:C.faint,letterSpacing:1.5,marginBottom:6}}>ROUND {ri+1} {!done&&"(IN PROGRESS)"}</div>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {rd.fixtures.map((fx,fi)=>{
            const isMe=fx.a===myTeam||fx.b===myTeam;
            const myTeamIsA=fx.a===myTeam;
            if(!fx.done)return(
              <div key={fi} style={{background:isMe?C.acc+"22":C.panel,border:`1px solid ${isMe?C.acc:C.line}`,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontFamily:mono,fontSize:10,color:C.faint,width:28}}>Bo{fx.bo}</span>
                <span style={{flex:1,fontWeight:isMe?700:500,color:isMe?C.acc:C.ink}}>{fx.a}</span>
                <span style={{fontFamily:mono,fontSize:10,color:C.faint}}>vs</span>
                <span style={{flex:1,textAlign:"right",fontWeight:isMe?700:500,color:isMe?C.acc:C.ink}}>{fx.b}</span>
                {isMe&&<span style={{fontFamily:mono,fontSize:9,color:C.acc,border:`1px solid ${C.acc}`,borderRadius:4,padding:"2px 6px"}}>YOUR MATCH</span>}
              </div>
            );
            const wA=fx.res.winnerName===fx.a;
            return(
            <button key={fi} onClick={()=>onOpen({...fx.res,title:`Swiss R${ri+1} · Bo${fx.bo}`,a:fx.a,b:fx.b})}
              style={{background:isMe?(wA===myTeamIsA?"rgba(61,220,132,.06)":"rgba(255,76,76,.06)"):C.panel,border:`1px solid ${isMe?(wA===myTeamIsA?C.win+"44":C.red+"44"):C.line}`,borderRadius:8,padding:"10px 14px",textAlign:"left",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontFamily:mono,fontSize:9,color:C.faint,width:28}}>Bo{fx.bo}</span>
              <span style={{flex:1,fontWeight:700,color:wA?C.win:C.dim}}>{fx.a}</span>
              <span style={{fontFamily:mono,fontWeight:700,fontSize:13,color:C.ink}}>{fx.res.bo>=3?fx.res.seriesScore.join("–"):fx.res.scoreLine}</span>
              <span style={{flex:1,textAlign:"right",fontWeight:700,color:!wA?C.win:C.dim}}>{fx.b}</span>
              {isMe&&<span style={{fontFamily:mono,fontSize:9,color:wA===myTeamIsA?C.win:C.red,fontWeight:700,width:28}}>{wA===myTeamIsA?"W":"L"}</span>}
            </button>);
          })}
        </div>
      </div>);
    })}
    {t.stage==="playoffs"&&t.bracket&&<div style={{marginTop:8}}>
      <div style={{fontFamily:mono,fontSize:10,color:C.gold,letterSpacing:1.5,marginBottom:6}}>PLAYOFFS</div>
      <PlayoffMatchList bracket={t.bracket} myTeam={myTeam} onOpen={onOpen}/>
    </div>}
  </div>);
}

function PlayoffMatchList({bracket,myTeam,onOpen}){
  const rows=[];
  const rndNames={qf:"Quarterfinal",sf:"Semifinal",final:"Final"};
  const rounds=bracket.qf?["qf","sf","final"]:bracket.sf?["sf","final"]:["final"];
  for(const r of rounds){
    const list=r==="final"?[bracket.final]:bracket[r];
    list.forEach(fx=>{if(!fx.res)return;const isMe=fx.a===myTeam||fx.b===myTeam;const wA=fx.res.winnerName===fx.a;
      rows.push(<button key={r+fx.a} onClick={()=>onOpen({...fx.res,title:`${rndNames[r]} · Bo${fx.res.bo}`,a:fx.a,b:fx.b})}
        style={{background:isMe?(wA===(fx.a===myTeam)?"rgba(61,220,132,.06)":"rgba(255,76,76,.06)"):C.panel,border:`1px solid ${isMe?(wA===(fx.a===myTeam)?C.win+"44":C.red+"44"):C.line}`,borderRadius:8,padding:"10px 14px",textAlign:"left",display:"flex",alignItems:"center",gap:10,width:"100%"}}>
        <span style={{fontFamily:mono,fontSize:9,color:C.gold,width:60}}>{rndNames[r].toUpperCase()}</span>
        <span style={{flex:1,fontWeight:700,color:wA?C.win:C.dim}}>{fx.a}</span>
        <span style={{fontFamily:mono,fontWeight:700,fontSize:13}}>{fx.res.seriesScore?.join("–")||fx.res.scoreLine}</span>
        <span style={{flex:1,textAlign:"right",fontWeight:700,color:!wA?C.win:C.dim}}>{fx.b}</span>
      </button>);
    });
  }
  return <div style={{display:"flex",flexDirection:"column",gap:4}}>{rows}</div>;
}

function SwissStandings({t,myTeam,SEED}){
  const swiss=t.swiss;if(!swiss)return null;
  const adv=swiss._advanceAt||3,eli=swiss._elimAt||3;
  const teams=[...swiss.teams].sort((a,b)=>{
    const ra=swiss.records[a],rb=swiss.records[b];
    return (rb.w-ra.w)||(ra.l-rb.l);
  });
  const statusOf=team=>{
    const r=swiss.records[team];
    if(r.w>=adv)return "advanced";
    if(r.l>=eli)return "eliminated";
    if(r.w>=adv-1)return "match_adv"; // one win away from advancing
    if(r.l>=eli-1)return "match_eli"; // one loss from elimination
    return "active";
  };
  const statusColor={advanced:C.win,eliminated:C.red,match_adv:C.live,match_eli:C.gold,active:C.dim};
  const statusLabel={advanced:"ADVANCED",eliminated:"ELIMINATED",match_adv:"ADV MATCH",match_eli:"ELI MATCH",active:""};
  return(<div>
    <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"28px 1fr 60px 40px 40px 90px",gap:6,padding:"8px 14px",fontFamily:mono,fontSize:10,color:C.faint,letterSpacing:1}}>
        <span>#</span><span>TEAM</span><span style={{textAlign:"center"}}>W–L</span><span style={{textAlign:"center"}}>W</span><span style={{textAlign:"center"}}>L</span><span style={{textAlign:"right"}}>STATUS</span>
      </div>
      {teams.map((team,i)=>{
        const r=swiss.records[team];const me=team===myTeam;const st=statusOf(team);const sc=statusColor[st];
        return(
        <div key={team} style={{display:"grid",gridTemplateColumns:"28px 1fr 60px 40px 40px 90px",gap:6,padding:"9px 14px",alignItems:"center",borderTop:`1px solid ${C.line}`,borderLeft:`3px solid ${me?C.acc:st!=="active"?sc:"transparent"}`,background:me?"rgba(255,92,46,.06)":st==="advanced"?"rgba(61,220,132,.04)":st==="eliminated"?"rgba(255,76,76,.04)":"transparent"}}>
          <span style={{fontFamily:mono,fontSize:12,color:C.faint}}>{i+1}</span>
          <span style={{fontWeight:me?700:600,fontSize:13,color:me?C.acc:C.ink}}>{team}{me?" ◂":""}</span>
          <span style={{fontFamily:mono,fontWeight:700,fontSize:14,textAlign:"center",color:sc||C.ink}}>{r.w}–{r.l}</span>
          <span style={{fontFamily:mono,fontSize:12,textAlign:"center",color:C.win}}>{r.w}</span>
          <span style={{fontFamily:mono,fontSize:12,textAlign:"center",color:C.red}}>{r.l}</span>
          <span style={{fontFamily:mono,fontSize:9,textAlign:"right",color:sc||C.faint}}>{statusLabel[st]}</span>
        </div>);
      })}
    </div>
    {/* Legend */}
    <div style={{display:"flex",gap:14,marginTop:8,fontFamily:mono,fontSize:9,flexWrap:"wrap"}}>
      <span style={{color:C.win}}>● ADVANCED ({adv}W)</span>
      <span style={{color:C.live}}>● ADV MATCH</span>
      <span style={{color:C.gold}}>● ELI MATCH</span>
      <span style={{color:C.red}}>● ELIMINATED ({eli}L)</span>
    </div>
  </div>);
}

function PlayoffBracket({bracket,champion,myTeam,onOpen,SEED}){
  const rounds=bracket.qf?["qf","sf","final"]:bracket.sf?["sf","final"]:["final"];
  const roundNames={qf:"QUARTERFINALS",sf:"SEMIFINALS",final:"GRAND FINAL"};
  return(<div>
    <div style={{overflowX:"auto",paddingBottom:10}}>
      <div style={{display:"flex",gap:24,minWidth:bracket.qf?860:500,padding:"8px 4px"}}>
        {rounds.map(r=>{
          const list=r==="final"?[bracket.final]:bracket[r];
          const isFinale=r==="final";
          return(
          <div key={r} style={{flex:1,minWidth:220}}>
            <div style={{fontFamily:mono,fontSize:10,color:r==="final"?C.gold:C.acc,letterSpacing:1.5,fontWeight:700,marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${C.line}`}}>
              {roundNames[r]} {isFinale&&bracket.bo5Final?"· BO5":"· BO3"}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {list.map((fx,i)=>{
                const me=fx.a===myTeam||fx.b===myTeam;
                const A=fx.a,B=fx.b,done=fx.done,res=fx.res;
                const BracketTeam=({team,side})=>{
                  const won=done&&res?.winnerName===team;
                  const lost=done&&res?.loserName===team;
                  const sc=done?res.seriesScore[side]:null;
                  return(<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:won?"rgba(61,220,132,.06)":"transparent",borderRadius:4}}>
                    {SEED&&team&&<span style={{fontFamily:mono,fontSize:9,color:C.faint,width:16}}>{SEED[team]||"?"}</span>}
                    <span style={{flex:1,fontWeight:won?700:500,fontSize:13,color:!team?C.faint:team===myTeam?C.acc:won?C.ink:C.dim}}>{team||"TBD"}</span>
                    {sc!=null&&<span style={{fontFamily:mono,fontWeight:700,fontSize:14,color:won?C.win:C.faint}}>{sc}</span>}
                  </div>);
                };
                return(
                <button key={i} onClick={()=>done&&onOpen({...res,title:`${roundNames[r]} · Bo${res?.bo}`,a:A,b:B})} disabled={!done}
                  style={{background:C.panel,border:`2px solid ${isFinale&&champion?C.gold:me?C.acc:C.line}`,borderRadius:8,overflow:"hidden",padding:0,textAlign:"left",width:"100%"}}>
                  <BracketTeam team={A} side={0}/>
                  <div style={{height:1,background:C.line}}/>
                  <BracketTeam team={B} side={1}/>
                  {isFinale&&champion&&<div style={{padding:"6px 12px",background:"rgba(255,194,75,.08)",fontFamily:mono,fontSize:9,color:C.gold,textAlign:"center"}}>[W] {champion}</div>}
                </button>);
              })}
            </div>
          </div>);
        })}
      </div>
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════
// ROSTER, STATS, SEASON, VETO, MATCH MODAL, PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════
function RosterView2({state,myTeam,onNegotiate,onChangeRole}){
  const [profilePlayer,setProfilePlayer]=useState(null);
  const [negotiating,setNegotiating]=useState(null);
  const [negoResult,setNegoResult]=useState(null);
  const r=rosterOf(state,myTeam);const base=teamBase(state,myTeam);const chem=state.chemistry[myTeam]||55;
  const roleColor={IGL:C.live,AWP:"#e05050",Entry:C.acc,Lurk:C.gold,Support:C.win};

  return(<div>
    {/* Team overview header */}
    <div style={{background:`linear-gradient(180deg,${C.panel2},${C.panel})`,border:`1px solid ${C.line}`,borderRadius:12,padding:"20px 18px 14px",marginBottom:16,textAlign:"center"}}>
      <div style={{fontWeight:800,fontSize:20,color:C.acc,letterSpacing:1}}>{myTeam}</div>
      <div style={{fontFamily:mono,fontSize:11,color:C.dim,marginTop:4}}>Team overview</div>
      <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:12}}>
        <MiniStat label="RATING" value={base.toFixed(1)} color={C.acc}/>
        <MiniStat label="CHEMISTRY" value={chem} color={chem>=80?C.win:chem>=60?C.gold:C.red}/>
      </div>
    </div>

    {/* Player cards — HLTV fantasy style */}
    <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,marginBottom:16}}>
      {r.map(p=>{
        const ovr=playerOvr(p);const st=state.stats[p.name];const career=state.career?.[p.name];
        const fc=p.fatigue>80?C.red:p.fatigue>60?C.gold:p.fatigue>40?"#8bc99a":C.win;
        const rc=roleColor[p.role]||C.dim;
        return(
        <button key={p.name} onClick={()=>setProfilePlayer(p)}
          style={{background:`linear-gradient(180deg,${rc}18,${C.panel})`,border:`1px solid ${rc}55`,borderRadius:10,padding:0,minWidth:140,maxWidth:160,flex:"0 0 auto",textAlign:"center",overflow:"hidden"}}>
          {/* Role header */}
          <div style={{background:rc+"33",padding:"6px 8px",borderBottom:`1px solid ${rc}44`}}>
            <div style={{fontWeight:800,fontSize:11,color:rc,letterSpacing:1}}>{p.role}</div>
          </div>
          {/* Avatar placeholder */}
          <div style={{padding:"12px 10px 8px"}}>
            <div style={{width:56,height:56,borderRadius:28,background:C.panel2,border:`2px solid ${rc}66`,margin:"0 auto 8px",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:mono,fontSize:18,fontWeight:800,color:rc}}>
              {p.name.slice(0,2).toUpperCase()}
            </div>
            {/* Name */}
            <div style={{fontWeight:700,fontSize:14,color:C.ink,marginBottom:2}}>{p.name}</div>
            {/* OVR badge */}
            <div style={{display:"inline-block",background:ovr>=90?C.acc:ovr>=80?C.win:ovr>=70?C.live:C.dim,color:"#0a0c10",fontFamily:mono,fontSize:12,fontWeight:800,borderRadius:5,padding:"2px 10px",marginBottom:8}}>
              {ovr} OVR
            </div>
            {/* Key stats grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3,marginBottom:8}}>
              {[["AIM",p.aim],["SENSE",p.gameSense],["RIFLE",p.rifle||0],["CLUTCH",p.clutch||0]].map(([l,v])=>(
                <div key={l} style={{background:C.panel2,borderRadius:4,padding:"3px 0"}}>
                  <div style={{fontFamily:mono,fontSize:7,color:C.faint,letterSpacing:1}}>{l}</div>
                  <div style={{fontFamily:mono,fontSize:12,fontWeight:700,color:v>=90?C.acc:v>=75?C.win:C.ink}}>{v}</div>
                </div>
              ))}
            </div>
            {/* Status bar: form + fatigue */}
            <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:6}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:mono,fontSize:7,color:C.faint}}>FORM</div>
                <div style={{fontFamily:mono,fontSize:11,fontWeight:700,color:p.form>3?C.win:p.form<-3?C.red:C.faint}}>{p.form>0?"+":""}{p.form.toFixed(1)}</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:mono,fontSize:7,color:C.faint}}>FATIGUE</div>
                <div style={{width:30,height:4,background:C.line,borderRadius:2,overflow:"hidden",margin:"3px auto 0"}}>
                  <div style={{width:`${p.fatigue}%`,height:"100%",background:fc,borderRadius:2}}/>
                </div>
              </div>
            </div>
            {/* Contract + salary */}
            <div style={{fontFamily:mono,fontSize:9,color:C.faint}}>
              ${p.salary}K/mo · {p.contract<=1?<span style={{color:C.red}}>!{p.contract}ev</span>:<span>{p.contract}ev</span>}
            </div>
            {/* Age + traits */}
            <div style={{display:"flex",gap:3,justifyContent:"center",marginTop:4}}>
              <span style={{fontFamily:mono,fontSize:8,color:p.age>=29?C.gold:p.age<=22?C.win:C.faint}}>age {p.age}</span>
              {p.traits.map(tr=><TraitPill key={tr} t={tr}/>)}
            </div>
          </div>
          {/* Event stats footer */}
          {st&&st.maps>0&&(
            <div style={{background:C.panel2,padding:"6px 8px",borderTop:`1px solid ${C.line}`,display:"flex",justifyContent:"center",gap:10}}>
              <span style={{fontFamily:mono,fontSize:10,color:st.rating>=1.1?C.win:st.rating>=0.9?C.ink:C.red,fontWeight:700}}>{st.rating.toFixed(2)} RTG</span>
              <span style={{fontFamily:mono,fontSize:10,color:C.gold}}>{st.mvps} MVP</span>
            </div>
          )}
          {career&&career.totalMaps>0&&!(st&&st.maps>0)&&(
            <div style={{background:C.panel2,padding:"6px 8px",borderTop:`1px solid ${C.line}`,display:"flex",justifyContent:"center",gap:10}}>
              <span style={{fontFamily:mono,fontSize:10,color:career.avgRating>=1.1?C.win:career.avgRating>=0.9?C.ink:C.red}}>{career.avgRating.toFixed(2)} career</span>
              <span style={{fontFamily:mono,fontSize:10,color:C.gold}}>{career.totalMvps} MVPs</span>
            </div>
          )}
        </button>);
      })}
    </div>

    {/* Quick overview / actions */}
    <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,padding:"14px 16px",marginBottom:16}}>
      <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>Quick actions</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {r.map(p=>(
          <div key={p.name} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderTop:`1px solid ${C.line}`}}>
            <span style={{fontWeight:600,fontSize:12,minWidth:90,color:C.ink}}>{p.name}</span>
            {onChangeRole&&<select value={p.role} onChange={e=>onChangeRole(p.name,e.target.value)}
              style={{background:C.panel2,color:C.ink,border:`1px solid ${C.line}`,borderRadius:5,padding:"4px 8px",fontFamily:mono,fontSize:10}}>
              {["IGL","AWP","Entry","Lurk","Support"].map(rl=><option key={rl} value={rl}>{rl}</option>)}
            </select>}
            {p.contract<=1&&onNegotiate&&<button onClick={()=>setNegotiating({player:p,offer:p.salary})}
              style={{marginLeft:"auto",background:C.gold,color:"#0a0c10",border:"none",borderRadius:5,padding:"4px 10px",fontFamily:mono,fontSize:9,fontWeight:700}}>RENEW CONTRACT</button>}
          </div>
        ))}
      </div>
    </div>

    {/* Negotiation modal */}
    {negotiating&&(
      <Overlay onClose={()=>{setNegotiating(null);setNegoResult(null);}} title={`CONTRACT · ${negotiating.player.name}`}>
        {negoResult?(
          <div>
            <div style={{fontSize:14,color:negoResult.success?C.win:C.red,marginBottom:12}}>{negoResult.msg}</div>
            <button onClick={()=>{setNegotiating(null);setNegoResult(null);}} style={{background:C.acc,color:"#0a0c10",border:"none",borderRadius:8,padding:"10px 20px",fontWeight:700}}>OK</button>
          </div>
        ):(
          <div>
            <div style={{marginBottom:12}}>
              <span style={{fontFamily:mono,fontSize:12,color:C.dim}}>Current: ${negotiating.player.salary}/mo · {negotiating.player.contract} events left</span>
            </div>
            <div style={{fontFamily:mono,fontSize:11,color:C.dim,marginBottom:8}}>YOUR OFFER ($/month)</div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16}}>
              <button onClick={()=>setNegotiating(n=>({...n,offer:Math.max(5,n.offer-2)}))} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:5,padding:"6px 10px",fontFamily:mono,color:C.ink}}>−</button>
              <span style={{fontFamily:mono,fontSize:20,fontWeight:700,color:C.gold,minWidth:60,textAlign:"center"}}>${negotiating.offer}</span>
              <button onClick={()=>setNegotiating(n=>({...n,offer:n.offer+2}))} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:5,padding:"6px 10px",fontFamily:mono,color:C.ink}}>+</button>
            </div>
            <button onClick={()=>{const res=onNegotiate(negotiating.player.name,negotiating.offer);setNegoResult(res);}} style={{width:"100%",background:C.acc,color:"#0a0c10",border:"none",borderRadius:8,padding:"12px",fontWeight:800,fontSize:14}}>SUBMIT OFFER</button>
          </div>
        )}
      </Overlay>
    )}
    {profilePlayer&&<PlayerProfile p={profilePlayer} state={state} onClose={()=>setProfilePlayer(null)}/>}
  </div>);}

function PlayerProfile({p,state,onClose}){
  const c=state.career?.[p.name];
  const orig=c?.origStats||{};
  const statDiff=(key)=>p[key]-(orig[key]||p[key]);
  const coreStats=[["aim","AIM"],["gameSense","SENSE"],["util","UTIL"],["igl","IGL"],["consistency","CON"]];
  const combatStats=[["rifle","RIFLE"],["pistol","PISTOL"],["awp","AWP"],["clutch","CLUTCH"],["entry","ENTRY"]];
  const mentalStats=[["mentality","MENT"],["composure","COMP"],["stamina","STAM"],["experience","EXP"]];
  const mapEntries=Object.entries(c?.mapStats||{}).sort((a,b)=>b[1].maps-a[1].maps);
  const evHist=c?.eventHistory||[];
  const StatBars=({stats,label})=>(<>
    <SL n={label.slice(0,3).toUpperCase()} t={label}/>
    <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:16}}>
      {stats.map(([key,lbl])=>{const val=p[key]||0;const d=statDiff(key);return(
        <div key={key} style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontFamily:mono,fontSize:10,color:C.faint,width:48}}>{lbl}</span>
          <div style={{flex:1,height:7,background:C.line,borderRadius:4,overflow:"hidden"}}>
            <div style={{width:`${val}%`,height:"100%",background:val>=90?C.acc:val>=75?C.win:val>=60?C.live:C.dim,borderRadius:4}}/>
          </div>
          <span style={{fontFamily:mono,fontSize:12,fontWeight:700,width:28,textAlign:"right",color:val>=90?C.acc:C.ink}}>{val}</span>
          {d!==0?<span style={{fontFamily:mono,fontSize:10,color:d>0?C.win:C.red,width:30}}>{d>0?"+":""}{d}</span>:<span style={{width:30}}/>}
        </div>);})}
    </div>
  </>);
  return(
  <Overlay onClose={onClose} title={`${p.name} · PLAYER PROFILE`} wide>
    <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
      <div>
        <div style={{fontWeight:800,fontSize:22,color:C.acc}}>{p.name}</div>
        <div style={{display:"flex",gap:6,marginTop:4}}>
          <Pill c={C.dim}>{p.role}</Pill>
          {p.traits.map(tr=><TraitPill key={tr} t={tr}/>)}
          <span style={{fontFamily:mono,fontSize:10,color:p.age>=29?C.gold:p.age<=22?C.win:C.faint}}>age {p.age}</span>
        </div>
      </div>
      <div style={{marginLeft:"auto",display:"flex",gap:14,flexWrap:"wrap"}}>
        <MiniStat label="OVR" value={playerOvr(p)} color={playerOvr(p)>=85?C.acc:C.ink}/>
        <MiniStat label="SALARY" value={`${p.salary}K`} color={C.gold}/>
        <MiniStat label="CONTRACT" value={p.contract} color={p.contract<=1?C.red:C.dim}/>
      </div>
    </div>
    <StatBars stats={coreStats} label="CORE"/>
    <StatBars stats={combatStats} label="COMBAT"/>
    <StatBars stats={mentalStats} label="MENTAL / PHYSICAL"/>
    <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap"}}>
      <MiniStat label="FORM" value={p.form>0?"+"+p.form.toFixed(1):p.form.toFixed(1)} color={p.form>3?C.win:p.form<-3?C.red:C.faint}/>
      <MiniStat label="FATIGUE" value={p.fatigue} color={p.fatigue>70?C.red:p.fatigue>50?C.gold:C.win}/>
    </div>
    {c&&c.totalMaps>0&&(<>
      <SL n="CAR" t="CAREER STATS"/>
      <div style={{display:"flex",gap:14,marginBottom:16,flexWrap:"wrap"}}>
        <MiniStat label="MAPS" value={c.totalMaps} color={C.ink}/>
        <MiniStat label="AVG RTG" value={c.avgRating.toFixed(2)} color={c.avgRating>=1.1?C.win:c.avgRating>=0.9?C.ink:C.red}/>
        <MiniStat label="BEST" value={c.bestRating.toFixed(2)} color={C.gold}/>
        <MiniStat label="MVPs" value={c.totalMvps} color={C.gold}/>
        <MiniStat label="CLUTCH" value={c.totalClutches} color={C.live}/>
        <MiniStat label="~KILLS" value={c.kills} color={C.dim}/>
      </div>
    </>)}
    {mapEntries.length>0&&(<>
      <SL n="MAP" t="MAP PERFORMANCE"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8,marginBottom:16}}>
        {mapEntries.map(([map,ms])=>{const wr=ms.maps>0?Math.round(ms.wins/ms.maps*100):0;return(
          <div key={map} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:7,padding:"8px 10px",textAlign:"center"}}>
            <div style={{fontWeight:600,fontSize:12}}>{map}</div>
            <div style={{fontFamily:mono,fontSize:16,fontWeight:700,color:ms.avgRating>=1.1?C.win:ms.avgRating>=0.9?C.ink:C.red,marginTop:2}}>{ms.avgRating.toFixed(2)}</div>
            <div style={{fontFamily:mono,fontSize:9,color:C.faint}}>{ms.maps} maps · {wr}% WR</div>
          </div>);})}
      </div>
    </>)}
    {evHist.length>0&&(<>
      <SL n="EVT" t="EVENT HISTORY"/>
      <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"50px 60px 50px 50px",gap:6,padding:"6px 12px",fontFamily:mono,fontSize:9,color:C.faint}}>
          <span>EVENT</span><span style={{textAlign:"right"}}>RTG</span><span style={{textAlign:"right"}}>MVPs</span><span style={{textAlign:"right"}}>MAPS</span>
        </div>
        {evHist.map((e,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"50px 60px 50px 50px",gap:6,padding:"5px 12px",borderTop:`1px solid ${C.line}`}}>
            <span style={{fontFamily:mono,fontSize:10,color:C.acc}}>#{e.eventNum+1}</span>
            <span style={{fontFamily:mono,fontSize:12,fontWeight:700,textAlign:"right",color:e.rating>=1.1?C.win:e.rating>=0.9?C.ink:C.red}}>{e.rating.toFixed(2)}</span>
            <span style={{fontFamily:mono,fontSize:11,textAlign:"right",color:C.gold}}>{e.mvps}</span>
            <span style={{fontFamily:mono,fontSize:11,textAlign:"right",color:C.dim}}>{e.maps}</span>
          </div>))}
      </div>
    </>)}
  </Overlay>);}

function StatsView({t}){
  const all=Object.entries(t.simState.stats).filter(([,s])=>s.maps>0).sort((a,b)=>b[1].rating-a[1].rating);
  return(<div>
    <Intro text="Player performance this event."/>
    <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"30px 110px 1fr 55px 50px 45px 45px",gap:8,padding:"8px 14px",fontFamily:mono,fontSize:10,color:C.faint,letterSpacing:1}}>
        <span>#</span><span>PLAYER</span><span>TEAM</span><span style={{textAlign:"right"}}>RTG</span><span style={{textAlign:"right"}}>MAPS</span><span style={{textAlign:"right"}}>MVP</span><span style={{textAlign:"right"}}>CLT</span>
      </div>
      {all.slice(0,30).map(([name,s],i)=>{const p=t.simState.players.find(x=>x.name===name);return(
        <div key={name} style={{display:"grid",gridTemplateColumns:"30px 110px 1fr 55px 50px 45px 45px",gap:8,padding:"7px 14px",alignItems:"center",borderTop:`1px solid ${C.line}`}}>
          <span style={{fontFamily:mono,fontSize:12,color:C.faint}}>{i+1}</span>
          <span style={{fontWeight:600,fontSize:13}}>{name}</span>
          <span style={{fontSize:12,color:C.dim}}>{p?.team||"FA"}</span>
          <span style={{fontFamily:mono,fontSize:13,fontWeight:700,textAlign:"right",color:s.rating>=1.15?C.win:s.rating>=0.95?C.ink:C.red}}>{s.rating.toFixed(2)}</span>
          <span style={{fontFamily:mono,fontSize:12,textAlign:"right",color:C.dim}}>{s.maps}</span>
          <span style={{fontFamily:mono,fontSize:12,textAlign:"right",color:C.gold}}>{s.mvps}</span>
          <span style={{fontFamily:mono,fontSize:12,textAlign:"right",color:C.live}}>{s.clutches}</span>
        </div>);})}
    </div>
  </div>);}

function SeasonHistory({season,myTeam}){
  if(!season.history.length)return <Locked text="Season history appears after your first event."/>;
  const plCol=p=>p===1?C.gold:p===2?"#c9d2e0":p<=4?C.acc:p<=8?C.live:C.dim;
  // Calculate total salary paid (from weekLog)
  const totalSalaryPaid=season.weekLog.filter(e=>e.activity==="salary").reduce((s,e)=>{
    const m=e.event?.match(/\$(\d+)K/);return s+(m?parseInt(m[1]):0);
  },0);
  return(<div>
    <Intro text="Your results across all events this season."/>
    <div style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:8,padding:"10px 14px",marginBottom:12,display:"flex",gap:16,flexWrap:"wrap"}}>
      <MiniStat label="TOTAL SALARY PAID" value={`${totalSalaryPaid}K`} color={C.red}/>
      <MiniStat label="TOTAL PRIZE WON" value={`$season.history.reduce((s,h)=>s+h.prize,0)K`} color={C.win}/>
      <MiniStat label="CURRENT BUDGET" value={`$${season.budget}K`} color={season.budget>0?C.gold:C.red}/>
    </div>
    <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"40px 60px 1fr 80px 60px 70px",gap:6,padding:"8px 14px",fontFamily:mono,fontSize:10,color:C.faint,letterSpacing:1}}>
        <span>#</span><span>TYPE</span><span>CHAMPION</span><span style={{textAlign:"right"}}>PLACE</span><span style={{textAlign:"right"}}>PRIZE</span><span style={{textAlign:"right"}}>BUDGET</span>
      </div>
      {season.history.map((h,i)=>{
        const tierC=h.tier==="Major"?C.gold:h.tier==="A"?C.live:C.dim;
        return(
        <div key={i} style={{display:"grid",gridTemplateColumns:"40px 60px 1fr 80px 60px 70px",gap:6,padding:"9px 14px",alignItems:"center",borderTop:`1px solid ${C.line}`}}>
          <span style={{fontFamily:mono,fontWeight:700,color:C.acc}}>#{h.eventNum}</span>
          <span style={{fontFamily:mono,fontSize:9,color:tierC}}>{h.tier||"Major"}</span>
          <span style={{fontSize:12,color:h.champion===myTeam?C.gold:C.ink}}>{h.champion}{h.champion===myTeam?" [W]":""}</span>
          <span style={{fontFamily:mono,fontWeight:700,fontSize:13,textAlign:"right",color:plCol(h.place)}}>{h.place===1?"1st":h.place===2?"2nd":h.place<=4?"T"+h.place:"T"+h.place}</span>
          <span style={{fontFamily:mono,fontSize:11,textAlign:"right",color:C.win}}>+{h.prize}</span>
          <span style={{fontFamily:mono,fontSize:11,textAlign:"right",color:h.budgetAfter>0?C.gold:C.red}}>{h.budgetAfter}</span>
        </div>);})}
    </div>
  </div>);}

function VetoOverlay({session,myTeam,t,onClose,onResolved}){
  const opp=session.opp;
  const [remaining,setRemaining]=useState(session.remaining);
  const [picked,setPicked]=useState(session.picked);
  const [log,setLog]=useState(session.log);
  const [resolving,setResolving]=useState(false);
  const [stepIdx,setStepIdx]=useState(0);
  const bo=session.bo;
  const rival=isRivalMatch(t.simState,myTeam,opp);

  if(bo===1&&!resolving){
    const chooseBo1=(map)=>{setResolving(true);const res=playSeries(t.simState,myTeam,opp,1,{stage:"group"},t.rng,[map]);onResolved(res,session.fixture);};
    return(
    <Overlay onClose={onClose} title={`MAP PICK · BO1 · vs ${opp}${rival?" · [!] RIVALRY":""}`}>
      <p style={{color:C.dim,fontSize:13,margin:"0 0 14px",lineHeight:1.6}}>Pick your map. Green = favored.</p>
      <MapGrid maps={remaining} myTeam={myTeam} opp={opp} state={t.simState} onPick={chooseBo1}/>
    </Overlay>);}

  const steps=bo===5
    ?[[myTeam,"ban"],[opp,"ban"],[myTeam,"pick"],[opp,"pick"],[myTeam,"pick"],[opp,"pick"]]
    :[[myTeam,"ban"],[opp,"ban"],[myTeam,"pick"],[opp,"pick"],[myTeam,"ban"],[opp,"ban"]];
  const step=steps[stepIdx];const isYour=step&&step[0]===myTeam&&!resolving;

  function aiChoose(action,rem){
    let best=rem[0],bv=-Infinity;
    for(const m of rem){const v=action==="ban"?(mapRating(t.simState,myTeam,m)-mapRating(t.simState,opp,m)):(mapRating(t.simState,opp,m)-mapRating(t.simState,myTeam,m));if(v>bv){bv=v;best=m;}}
    return best;
  }
  function act(map){
    let rem=remaining.filter(m=>m!==map);const newLog=[...log,{who:myTeam,action:step[1],map}];const newPicked=step[1]==="pick"?[...picked,map]:[...picked];let idx=stepIdx+1;
    while(idx<steps.length&&steps[idx][0]!==myTeam){const s=steps[idx];const ai=aiChoose(s[1],rem);rem=rem.filter(m=>m!==ai);newLog.push({who:opp,action:s[1],map:ai});if(s[1]==="pick")newPicked.push(ai);idx++;}
    setRemaining(rem);setLog(newLog);setPicked(newPicked);setStepIdx(idx);
    if(idx>=steps.length){const decider=rem[0];const finalMaps=[...newPicked,decider];setResolving(true);
      const stage=session.fixture===t.bracket?.final?"final":bo===3?(t.stage||"qf"):"group";
      setTimeout(()=>{const res=playSeries(t.simState,myTeam,opp,bo,{stage},t.rng,finalMaps);onResolved(res,session.fixture);},200);
    }
  }
  return(
  <Overlay onClose={onClose} title={`MAP VETO · BO${bo} · vs ${opp}${rival?" · [!] RIVALRY":""}`} wide>
    <div style={{background:isYour?"rgba(255,92,46,.12)":C.panel2,border:`1px solid ${isYour?C.acc:C.line}`,borderRadius:8,padding:"11px 14px",marginBottom:16,fontFamily:mono,fontSize:13}}>
      {resolving?"Resolving series…":isYour?<span><b style={{color:C.acc}}>YOUR TURN</b> — {step[1]==="ban"?"ban a map":"pick a map"}</span>:"…"}
    </div>
    <MapGrid maps={remaining} myTeam={myTeam} opp={opp} state={t.simState} onPick={isYour?act:null} disabled={!isYour}/>
    <div style={{marginTop:16,fontFamily:mono,fontSize:12,color:C.dim,lineHeight:1.9}}>
      {log.map((l,i)=>(<div key={i}><span style={{color:l.who===myTeam?C.acc:C.dim}}>{l.who===myTeam?"YOU":opp.toUpperCase()}</span>{" "}{l.action==="ban"?"x banned":"ok picked"} {l.map}</div>))}
      {picked.length>=2&&remaining.length===1&&<div><span style={{color:C.live}}>DECIDER</span> ◆ {remaining[0]}</div>}
    </div>
  </Overlay>);}

function MapGrid({maps,myTeam,opp,state,onPick,disabled}){return(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10}}>
  {maps.map(m=>{const edge=mapRating(state,myTeam,m)-mapRating(state,opp,m);return(
    <button key={m} onClick={()=>onPick&&onPick(m)} disabled={disabled||!onPick}
      style={{background:C.panel,border:`1px solid ${edge>0?"#2f6b45":C.line}`,borderRadius:8,padding:"12px 13px",textAlign:"left"}}>
      <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{m}</div>
      <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginBottom:4}}>prof: {getMapProf(state,myTeam)[m]||50}</div>
      <EdgeBar edge={edge}/>
    </button>);})}
</div>);}

function MatchModal({m,onClose}){
  const [expandedMap,setExpandedMap]=useState(null);
  const isSeries=m.bo>=3;const topName=isSeries?(m.a||m.winnerName):m.winnerName;const botName=isSeries?(m.b||m.loserName):m.loserName;
  return(
  <Overlay onClose={onClose} title={m.title} wide>
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:16}}>
      <span style={{fontWeight:700,fontSize:16,color:m.winnerName===topName?C.win:C.ink}}>{topName}</span>
      {isSeries?<span style={{fontFamily:mono,fontWeight:700,fontSize:18}}>{m.seriesScore[0]} – {m.seriesScore[1]}</span>:<span style={{fontFamily:mono,color:C.dim,fontSize:13}}>vs</span>}
      <span style={{fontWeight:700,fontSize:16,color:m.winnerName===botName?C.win:C.ink}}>{botName}</span>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {m.maps.map((mp,i)=>{const w=Math.max(...mp.score),l=Math.min(...mp.score);const expanded=expandedMap===i;
        const tA=mp.teamA||mp.winnerName,tB=mp.teamB||mp.loserName;
        return(
        <div key={i} style={{background:C.panel2,border:`1px solid ${C.line}`,borderRadius:8,overflow:"hidden"}}>
          <button onClick={()=>setExpandedMap(expanded?null:i)} style={{width:"100%",background:"transparent",border:"none",padding:"11px 13px",textAlign:"left",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontFamily:mono,fontSize:10,color:C.faint,width:34}}>{isSeries?(i===m.maps.length-1&&i>=2?"DEC":`M${i+1}`):"MAP"}</span>
            <span style={{flex:1,fontWeight:600,fontSize:13}}>{mp.map}</span>
            {mp.rival&&<span style={{fontFamily:mono,fontSize:9,color:C.rival}}>[!]</span>}
            <span style={{fontFamily:mono,fontWeight:700,fontSize:13,color:C.win}}>{w}-{l}</span>
            <span style={{fontFamily:mono,fontSize:10,color:C.faint}}>{expanded?"▾":"▸"}</span>
          </button>
          <div style={{padding:"0 13px 8px"}}>
            <div style={{fontSize:12,color:C.dim,lineHeight:1.55}}>{recapLine(mp)}</div>
            <div style={{display:"flex",gap:8,marginTop:5,flexWrap:"wrap"}}>
              <span style={{fontFamily:mono,fontSize:10,color:C.win}}>★ {mp.carry}</span>
              <span style={{fontFamily:mono,fontSize:10,color:C.red}}>▼ {mp.anchor}</span>
              {mp.triggers?.map((tr,ti)=><span key={ti} style={{fontFamily:mono,fontSize:9,color:tr.what==="rivalry_win"?C.rival:tr.what==="eco_heroes"?C.live:C.gold,border:`1px solid ${tr.what==="rivalry_win"?C.rival:C.gold}33`,borderRadius:4,padding:"1px 5px"}}>{tr.what==="clutch_carry"?"CLUTCH":tr.what==="supernova"?"SUPERNOVA":tr.what==="rivalry_win"?"RIVALRY WIN":tr.what==="eco_heroes"?"ECO HEROES":"TILTED"} · {tr.who}</span>)}
            </div>
          </div>
          {expanded&&mp.rounds&&(
            <div style={{borderTop:`1px solid ${C.line}`,padding:"8px 10px",maxHeight:340,overflowY:"auto"}}>
              {/* Scoreboard header */}
              <div style={{display:"grid",gridTemplateColumns:"26px 60px 22px 8px 22px 60px 1fr",gap:4,padding:"4px 0",fontFamily:mono,fontSize:9,color:C.faint,alignItems:"center"}}>
                <span>RND</span><span>{tA}</span><span style={{textAlign:"center"}}></span><span></span><span style={{textAlign:"center"}}></span><span>{tB}</span><span>PLAY</span>
              </div>
              {mp.rounds.map((rd,ri)=>{
                const halfBreak=ri>0&&mp.rounds[ri-1]?.side!==rd.side;
                const buyIcon=(b)=>b==="awp_buy"?"++ AWP":b==="full"?"++":b==="force"?"~":b==="eco"?"--":"";
                const isHighlight=rd.isClutch||rd.isEcoUpset||rd.isAce;
                return(<React.Fragment key={ri}>
                  {halfBreak&&<div style={{padding:"3px 0",textAlign:"center",fontFamily:mono,fontSize:9,color:C.gold,borderTop:`1px dashed ${C.gold}44`}}>— HALF TIME —</div>}
                  <div style={{display:"grid",gridTemplateColumns:"26px 60px 22px 8px 22px 60px 1fr",gap:4,padding:"3px 0",alignItems:"center",fontFamily:mono,fontSize:10,background:isHighlight?"rgba(255,92,46,.06)":"transparent",borderRadius:3}}>
                    <span style={{color:C.faint,fontSize:9}}>{rd.round}</span>
                    <span style={{fontSize:8,color:C.dim}}>{buyIcon(rd.buyA)}</span>
                    <span style={{textAlign:"center",fontWeight:700,color:rd.winner===tA?C.win:C.dim}}>{rd.scoreA}</span>
                    <span style={{textAlign:"center",color:C.faint,fontSize:8}}>:</span>
                    <span style={{textAlign:"center",fontWeight:700,color:rd.winner===tB?C.win:C.dim}}>{rd.scoreB}</span>
                    <span style={{fontSize:8,color:C.dim}}>{buyIcon(rd.buyB)}</span>
                    <span style={{fontSize:9,color:isHighlight?C.acc:C.dim,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{rd.narrative}</span>
                  </div>
                </React.Fragment>);
              })}
            </div>
          )}
        </div>);})}
    </div>
  </Overlay>);}

// ── Match Reveal (live round-by-round) ───────────────────────────────
function MatchReveal({reveal,myTeam,onDone}){
  const {res}=reveal;
  const [mapIdx,setMapIdx]=useState(0);
  const [roundIdx,setRoundIdx]=useState(0);
  const [done,setDone]=useState(false);
  const [speed,setSpeed]=useState(400);
  const mp=res.maps[mapIdx];
  const tA=mp?.teamA||res.winnerName,tB=mp?.teamB||res.loserName;

  React.useEffect(()=>{
    if(done||!mp) return;
    if(roundIdx>=mp.rounds.length){
      // Map finished — pause then move to next map or done
      const timer=setTimeout(()=>{
        if(mapIdx<res.maps.length-1){setMapIdx(i=>i+1);setRoundIdx(0);}
        else setDone(true);
      },1200);
      return ()=>clearTimeout(timer);
    }
    const timer=setTimeout(()=>setRoundIdx(i=>i+1),speed);
    return ()=>clearTimeout(timer);
  },[roundIdx,mapIdx,done,mp,speed,res.maps.length]);

  const visibleRounds=mp?mp.rounds.slice(0,roundIdx):[];
  const curScore=visibleRounds.length>0?visibleRounds[visibleRounds.length-1]:{scoreA:0,scoreB:0};
  const mapDone=roundIdx>=((mp?.rounds?.length)||0);

  // Only show narrative for notable rounds
  function isNotable(rd,idx,rounds){
    if(rd.isClutch||rd.isEcoUpset||rd.isAce) return true;
    if(rd.round===1) return true; // pistol round
    // half-time
    if(idx>0&&rounds[idx-1]?.side!==rd.side) return true;
    // match point
    if(rd.scoreA===12||rd.scoreB===12) return true;
    // close round (within 2)
    if(Math.abs(rd.scoreA-rd.scoreB)<=1&&rd.scoreA>=8) return true;
    return false;
  }

  return(
  <Overlay onClose={onDone} title={`${res.bo>=3?"BO"+res.bo+" · ":""}${tA} vs ${tB}`} wide>
    {/* Series score for Bo3/Bo5 */}
    {res.bo>=3&&(
      <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:12}}>
        {res.maps.map((m,mi)=>{
          const played=mi<mapIdx||(mi===mapIdx&&mapDone);
          return(<div key={mi} style={{fontFamily:mono,fontSize:11,color:mi===mapIdx?C.acc:played?C.dim:C.faint,textAlign:"center"}}>
            <div>{m.map}</div>
            {played&&<div style={{fontWeight:700,fontSize:14,color:m.winnerName===myTeam?C.win:C.red}}>{m.score.join("-")}</div>}
            {!played&&mi>mapIdx&&<div style={{color:C.faint}}>—</div>}
          </div>);
        })}
      </div>
    )}

    {/* Current map */}
    {mp&&(<>
    <div style={{textAlign:"center",marginBottom:8}}>
      <span style={{fontFamily:mono,fontSize:12,color:C.gold,letterSpacing:2}}>{mp.map}</span>
      {res.bo>=3&&<span style={{fontFamily:mono,fontSize:10,color:C.faint,marginLeft:8}}>MAP {mapIdx+1}</span>}
    </div>

    {/* Big scoreboard */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20,marginBottom:16,padding:"16px 0"}}>
      <div style={{textAlign:"right",flex:1}}>
        <div style={{fontWeight:800,fontSize:18,color:tA===myTeam?C.acc:C.ink}}>{tA}</div>
      </div>
      <div style={{fontFamily:mono,fontWeight:800,fontSize:42,color:C.ink,minWidth:100,textAlign:"center",letterSpacing:4}}>
        {curScore.scoreA} <span style={{color:C.faint,fontSize:24}}>:</span> {curScore.scoreB}
      </div>
      <div style={{textAlign:"left",flex:1}}>
        <div style={{fontWeight:800,fontSize:18,color:tB===myTeam?C.acc:C.ink}}>{tB}</div>
      </div>
    </div>

    {/* Round ticker */}
    <div style={{display:"flex",gap:3,justifyContent:"center",marginBottom:14,flexWrap:"wrap"}}>
      {visibleRounds.map((rd,i)=>{
        const halfBreak=i>0&&visibleRounds[i-1]?.side!==rd.side;
        return(<React.Fragment key={i}>
          {halfBreak&&<div style={{width:2,height:20,background:C.gold,margin:"0 4px",borderRadius:1}}/>}
          <div style={{width:18,height:20,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:9,fontFamily:mono,fontWeight:700,
            background:rd.winner===tA?(tA===myTeam?"rgba(61,220,132,.25)":"rgba(106,163,255,.2)"):(tB===myTeam?"rgba(61,220,132,.25)":"rgba(106,163,255,.2)"),
            color:rd.winner===tA?(tA===myTeam?C.win:C.live):(tB===myTeam?C.win:C.live),
            border:`1px solid ${rd.isEcoUpset||rd.isClutch||rd.isAce?C.gold+"88":"transparent"}`}}>
            {rd.winner===tA?"◀":"▶"}
          </div>
        </React.Fragment>);
      })}
      {!mapDone&&<div style={{width:18,height:20,borderRadius:3,background:C.panel2,animation:"pulse 0.8s infinite"}}/>}
    </div>

    {/* Notable events feed */}
    <div style={{maxHeight:140,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}}>
      {visibleRounds.filter((rd,i)=>isNotable(rd,i,visibleRounds)).slice(-5).map((rd,i)=>(
        <div key={i} style={{fontFamily:mono,fontSize:11,padding:"4px 8px",borderRadius:4,
          background:rd.isEcoUpset?"rgba(255,92,46,.1)":rd.isClutch?"rgba(61,220,132,.1)":rd.isAce?"rgba(255,194,75,.1)":"transparent",
          color:rd.isEcoUpset?C.acc:rd.isClutch?C.win:rd.isAce?C.gold:C.dim}}>
          <span style={{color:C.faint,marginRight:6}}>R{rd.round}</span>
          <span style={{fontSize:8,marginRight:4}}>{rd.buyA==="awp_buy"||rd.buyA==="full"?"++":rd.buyA==="force"?"~":"--"}</span>
          vs
          <span style={{fontSize:8,marginLeft:4,marginRight:6}}>{rd.buyB==="awp_buy"||rd.buyB==="full"?"++":rd.buyB==="force"?"~":"--"}</span>
          {rd.narrative}
        </div>
      ))}
    </div>
    </>)}

    {/* Speed controls + Continue */}
    <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:16,alignItems:"center"}}>
      {!done&&(<>
        <button onClick={()=>setSpeed(s=>Math.max(50,s-150))} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:6,padding:"6px 12px",fontFamily:mono,fontSize:11,color:C.dim}}>⏩ Faster</button>
        <button onClick={()=>{setRoundIdx(mp?.rounds?.length||0);}} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:6,padding:"6px 12px",fontFamily:mono,fontSize:11,color:C.dim}}>⏭ Skip Map</button>
        <button onClick={()=>{setMapIdx(res.maps.length-1);setRoundIdx(res.maps[res.maps.length-1]?.rounds?.length||0);setDone(true);}} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:6,padding:"6px 12px",fontFamily:mono,fontSize:11,color:C.dim}}>⏭⏭ Skip All</button>
      </>)}
      {done&&(
        <button onClick={onDone} style={{background:C.acc,color:"#0a0c10",border:"none",borderRadius:9,padding:"13px 26px",fontWeight:800,fontSize:15}}>
          {res.winnerName===myTeam?"[W] VICTORY — Continue":"Continue →"}
        </button>
      )}
    </div>
  </Overlay>);
}

// ── Primitives ───────────────────────────────────────────────────────
function Overlay({children,onClose,title,wide}){return(
  <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.72)",display:"flex",alignItems:"center",justifyContent:"center",padding:18,zIndex:50}}>
    <div onClick={e=>e.stopPropagation()} style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:12,maxWidth:wide?600:480,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.line}`,display:"flex",alignItems:"center",position:"sticky",top:0,background:C.panel,zIndex:2}}>
        <span style={{fontFamily:mono,fontSize:11,color:C.acc,letterSpacing:1}}>{title}</span>
        <button onClick={onClose} style={{marginLeft:"auto",background:"transparent",border:"none",color:C.dim,fontSize:22,lineHeight:1}}>×</button>
      </div>
      <div style={{padding:"16px 18px"}}>{children}</div>
    </div>
  </div>);}
function SL({n,t}){return(<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{fontFamily:mono,fontSize:11,color:C.acc,fontWeight:700}}>{n}</span><span style={{fontFamily:mono,fontSize:11,color:C.dim,letterSpacing:1.5}}>{t}</span><span style={{flex:1,height:1,background:C.line}}/></div>);}
function Banner({children,c}){return <div style={{background:C.panel,border:`1px solid ${c}`,borderRadius:12,padding:"18px 20px"}}>{children}</div>;}
function Locked({text}){return <div style={{background:C.panel,border:`1px dashed ${C.line}`,borderRadius:12,padding:"40px 20px",textAlign:"center",color:C.dim,fontSize:14}}>{text}</div>;}
function Empty({text}){return <div style={{color:C.faint,fontSize:13,padding:"12px 0"}}>{text}</div>;}
function Intro({text}){return <p style={{color:C.dim,fontSize:13,lineHeight:1.6,margin:"0 0 18px",maxWidth:740}}>{text}</p>;}
function ColHead({children}){return <div style={{fontFamily:mono,fontSize:11,fontWeight:700,color:C.acc,letterSpacing:1.5,paddingBottom:6,borderBottom:`1px solid ${C.line}`}}>{children}</div>;}
function Pill({children,c}){return <span style={{fontFamily:mono,fontSize:9,color:c,border:`1px solid ${c}`,borderRadius:4,padding:"1px 6px"}}>{children}</span>;}
function TraitPill({t}){const m={clutch:["CLUTCH",C.win],boom:["BOOM/BUST",C.acc],leader:["LEADER",C.live]};const[l,c]=m[t]||[t,C.dim];return <Pill c={c}>{l}</Pill>;}
function Stat({l,v}){return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:34}}><span style={{fontFamily:mono,fontSize:9,color:C.faint}}>{l}</span><span style={{fontFamily:mono,fontSize:13,fontWeight:700,color:v>=90?C.acc:C.ink}}>{v}</span></div>);}
function MiniStat({label,value,color,small}){return(<div style={{display:"flex",flexDirection:"column",alignItems:small?"flex-end":"flex-start"}}><span style={{fontFamily:mono,fontSize:9,color:C.faint,letterSpacing:1}}>{label}</span><span style={{fontFamily:mono,fontSize:small?13:22,fontWeight:700,color}}>{value}</span></div>);}
function FormArrow({form}){const col=form>3?C.win:form>0?"#8bc99a":form<-3?C.red:form<0?"#c98b8b":C.faint;const arrow=form>3?"▲▲":form>0?"▲":form<-3?"▼▼":form<0?"▼":"–";return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:38}}><span style={{fontFamily:mono,fontSize:9,color:C.faint}}>FORM</span><span style={{fontFamily:mono,fontSize:14,fontWeight:700,color:col}}>{arrow}</span><span style={{fontFamily:mono,fontSize:10,color:col}}>{form>0?"+":""}{form.toFixed(1)}</span></div>);}
function EdgeBar({edge}){const pct=Math.max(-1,Math.min(1,edge/8));return(
  <div style={{height:6,background:C.line,borderRadius:3,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:`${Math.abs(pct)*50}%`,background:pct>=0?C.win:C.ban,transform:pct>=0?"none":"translateX(-100%)"}}/>
    <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:C.dim}}/>
  </div>);}

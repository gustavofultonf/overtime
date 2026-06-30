export const MAPS = ["Mirage","Inferno","Nuke","Ancient","Dust2","Anubis","Train"];
export const RESERVE_MAPS = ["Vertigo","Overpass","Cache","Cobblestone","Tuscan","Mills"];
export const AI_TEAMS = ["Vitality","Spirit","FaZe","G2","MOUZ","NAVI","FURIA","Falcons","Liquid","Astralis","Heroic","Complexity","paiN","3DMAX","GamerLegion","Eternal Fire","TheMongolz","NIP","Cloud9","Virtus.pro","ENCE","BIG","Fnatic","OG","MIBR","Imperial","Monte","Lynn Vision","Apeks","SAW","Wildcard"];

export const PLAYERS_INIT = [
  // ── Vitality ──────────────────────────────────────────────────────────
  // ZywOo is THE AWPer, apEX is captain/IGL
  {team:"Vitality",name:"ZywOo",role:"AWP",aim:98,gameSense:99,util:84,igl:60,mentality:97,consistency:91,traits:["boom","clutch"],salary:22,contract:3,age:24,era:"current"},
  {team:"Vitality",name:"apEX",role:"IGL",aim:74,gameSense:90,util:83,igl:91,mentality:93,consistency:76,traits:["leader"],salary:17,contract:2,age:32,era:"current"},
  {team:"Vitality",name:"flameZ",role:"Entry",aim:92,gameSense:86,util:80,igl:52,mentality:88,consistency:78,traits:["boom"],salary:18,contract:2,age:23,era:"current"},
  {team:"Vitality",name:"mezii",role:"Lurk",aim:87,gameSense:88,util:90,igl:54,mentality:86,consistency:84,traits:[],salary:16,contract:3,age:25,era:"current"},
  {team:"Vitality",name:"Spinx",role:"Support",aim:88,gameSense:87,util:91,igl:62,mentality:88,consistency:86,traits:[],salary:17,contract:2,age:23,era:"current"},
  // ── Spirit ────────────────────────────────────────────────────────────
  // chopper is captain/IGL, donk is the HLTV #1 2024 star fragger (not IGL!)
  {team:"Spirit",name:"chopper",role:"IGL",aim:72,gameSense:93,util:88,igl:92,mentality:93,consistency:80,traits:["leader"],salary:17,contract:3,age:28,era:"current"},
  {team:"Spirit",name:"donk",role:"Entry",aim:98,gameSense:97,util:86,igl:58,mentality:97,consistency:80,traits:["boom","clutch"],salary:23,contract:3,age:18,era:"current"},
  {team:"Spirit",name:"sh1ro",role:"AWP",aim:96,gameSense:93,util:78,igl:62,mentality:92,consistency:88,traits:["clutch"],salary:18,contract:2,age:23,era:"current"},
  {team:"Spirit",name:"zont1x",role:"Entry",aim:92,gameSense:87,util:83,igl:56,mentality:87,consistency:70,traits:["boom"],salary:17,contract:2,age:20,era:"current"},
  {team:"Spirit",name:"magixx",role:"Support",aim:83,gameSense:88,util:92,igl:55,mentality:88,consistency:83,traits:[],salary:15,contract:2,age:21,era:"current"},
  // ── FaZe ─────────────────────────────────────────────────────────────
  // karrigan legendary IGL, broky is AWP, ropz is lurker (not AWP)
  {team:"FaZe",name:"karrigan",role:"IGL",aim:72,gameSense:95,util:86,igl:97,mentality:99,consistency:88,traits:["leader","clutch"],salary:18,contract:3,age:35,era:"current"},
  {team:"FaZe",name:"broky",role:"AWP",aim:93,gameSense:91,util:82,igl:54,mentality:91,consistency:86,traits:["clutch"],salary:16,contract:3,age:24,era:"current"},
  {team:"FaZe",name:"ropz",role:"Lurk",aim:94,gameSense:93,util:82,igl:52,mentality:94,consistency:95,traits:[],salary:18,contract:2,age:25,era:"current"},
  {team:"FaZe",name:"frozen",role:"Entry",aim:92,gameSense:86,util:80,igl:64,mentality:84,consistency:88,traits:[],salary:15,contract:2,age:23,era:"current"},
  {team:"FaZe",name:"rain",role:"Entry",aim:88,gameSense:85,util:80,igl:46,mentality:90,consistency:74,traits:["boom","clutch"],salary:14,contract:2,age:30,era:"current"},
  // ── G2 ───────────────────────────────────────────────────────────────
  // HooXi is IGL, m0NESY is AWP (not entry!), NiKo is star rifler
  {team:"G2",name:"HooXi",role:"IGL",aim:70,gameSense:86,util:88,igl:88,mentality:86,consistency:68,traits:["leader","boom"],salary:14,contract:3,age:26,era:"current"},
  {team:"G2",name:"m0NESY",role:"AWP",aim:98,gameSense:93,util:82,igl:58,mentality:90,consistency:82,traits:["boom","clutch"],salary:20,contract:2,age:19,era:"current"},
  {team:"G2",name:"NiKo",role:"Entry",aim:97,gameSense:96,util:88,igl:80,mentality:99,consistency:90,traits:["clutch"],salary:22,contract:3,age:27,era:"current"},
  {team:"G2",name:"huNter-",role:"Lurk",aim:91,gameSense:85,util:78,igl:54,mentality:84,consistency:78,traits:[],salary:14,contract:2,age:30,era:"current"},
  {team:"G2",name:"Snax",role:"Support",aim:82,gameSense:88,util:88,igl:68,mentality:82,consistency:74,traits:[],salary:14,contract:2,age:30,era:"current"},
  // ── MOUZ ─────────────────────────────────────────────────────────────
  // torzsi is AWP (not Jimpphat), Brollan is IGL/captain
  {team:"MOUZ",name:"Brollan",role:"IGL",aim:77,gameSense:89,util:84,igl:85,mentality:90,consistency:72,traits:["leader"],salary:16,contract:3,age:22,era:"current"},
  {team:"MOUZ",name:"torzsi",role:"AWP",aim:94,gameSense:90,util:80,igl:56,mentality:87,consistency:72,traits:["boom"],salary:16,contract:2,age:23,era:"current"},
  {team:"MOUZ",name:"xertioN",role:"Entry",aim:91,gameSense:88,util:84,igl:52,mentality:90,consistency:80,traits:[],salary:16,contract:3,age:19,era:"current"},
  {team:"MOUZ",name:"Jimpphat",role:"Lurk",aim:88,gameSense:84,util:78,igl:60,mentality:84,consistency:68,traits:["boom"],salary:14,contract:2,age:18,era:"current"},
  {team:"MOUZ",name:"sdy",role:"Support",aim:74,gameSense:82,util:88,igl:58,mentality:80,consistency:74,traits:[],salary:11,contract:2,age:24,era:"current"},
  // ── NAVI ─────────────────────────────────────────────────────────────
  // Aleksib IGL, w0nderful AWP, b1t is rifler/entry (not AWP!)
  {team:"NAVI",name:"Aleksib",role:"IGL",aim:70,gameSense:91,util:84,igl:93,mentality:92,consistency:72,traits:["leader"],salary:17,contract:3,age:28,era:"current"},
  {team:"NAVI",name:"w0nderful",role:"AWP",aim:90,gameSense:89,util:84,igl:60,mentality:87,consistency:78,traits:[],salary:15,contract:2,age:20,era:"current"},
  {team:"NAVI",name:"b1t",role:"Entry",aim:96,gameSense:91,util:78,igl:56,mentality:86,consistency:90,traits:["boom"],salary:18,contract:2,age:22,era:"current"},
  {team:"NAVI",name:"jL",role:"Lurk",aim:88,gameSense:85,util:80,igl:60,mentality:80,consistency:72,traits:[],salary:14,contract:2,age:23,era:"current"},
  {team:"NAVI",name:"iM",role:"Support",aim:80,gameSense:84,util:96,igl:60,mentality:82,consistency:83,traits:[],salary:13,contract:3,age:25,era:"current"},
  // ── FURIA ─────────────────────────────────────────────────────────────
  // FalleN is IGL/AWP legend (NOT entry!), KSCERATO is the star rifler, YEKINDAR is aggressive entry
  {team:"FURIA",name:"FalleN",role:"IGL",aim:86,gameSense:95,util:88,igl:96,mentality:96,consistency:80,traits:["leader","clutch"],salary:16,contract:3,age:33,era:"current"},
  {team:"FURIA",name:"KSCERATO",role:"Entry",aim:90,gameSense:90,util:88,igl:64,mentality:93,consistency:90,traits:["clutch"],salary:17,contract:3,age:26,era:"current"},
  {team:"FURIA",name:"yuurih",role:"Lurk",aim:88,gameSense:85,util:80,igl:48,mentality:88,consistency:78,traits:["boom"],salary:15,contract:2,age:25,era:"current"},
  {team:"FURIA",name:"molodoy",role:"Support",aim:78,gameSense:82,util:86,igl:46,mentality:82,consistency:80,traits:[],salary:13,contract:3,age:22,era:"current"},
  {team:"FURIA",name:"YEKINDAR",role:"Entry",aim:90,gameSense:90,util:86,igl:55,mentality:92,consistency:74,traits:["boom","clutch"],salary:17,contract:2,age:24,era:"current"},
  // ── Falcons ───────────────────────────────────────────────────────────
  {team:"Falcons",name:"TeSeS",role:"IGL",aim:72,gameSense:84,util:85,igl:87,mentality:92,consistency:86,traits:["leader"],salary:15,contract:3,age:26,era:"current"},
  {team:"Falcons",name:"kyxsan",role:"AWP",aim:93,gameSense:88,util:78,igl:52,mentality:88,consistency:72,traits:["boom"],salary:15,contract:2,age:25,era:"current"},
  {team:"Falcons",name:"nicoodoz",role:"Entry",aim:87,gameSense:82,util:78,igl:62,mentality:80,consistency:88,traits:[],salary:13,contract:2,age:25,era:"current"},
  {team:"Falcons",name:"flamie",role:"Lurk",aim:84,gameSense:82,util:80,igl:55,mentality:78,consistency:72,traits:[],salary:12,contract:2,age:28,era:"current"},
  {team:"Falcons",name:"Kaze",role:"Support",aim:76,gameSense:84,util:94,igl:62,mentality:84,consistency:68,traits:[],salary:12,contract:3,age:23,era:"current"},
  // ── Liquid ────────────────────────────────────────────────────────────
  // siuhy is IGL, Twistzz is entry fragger (not AWP!), NAF is veteran lurker (not IGL!)
  {team:"Liquid",name:"siuhy",role:"IGL",aim:75,gameSense:83,util:88,igl:86,mentality:86,consistency:90,traits:["leader"],salary:14,contract:3,age:24,era:"current"},
  {team:"Liquid",name:"Twistzz",role:"Entry",aim:94,gameSense:88,util:80,igl:58,mentality:92,consistency:84,traits:["clutch"],salary:17,contract:2,age:26,era:"current"},
  {team:"Liquid",name:"NAF",role:"Lurk",aim:86,gameSense:88,util:84,igl:68,mentality:87,consistency:94,traits:["leader"],salary:16,contract:3,age:28,era:"current"},
  {team:"Liquid",name:"ultimate",role:"AWP",aim:88,gameSense:84,util:80,igl:56,mentality:82,consistency:68,traits:["boom"],salary:14,contract:2,age:21,era:"current"},
  {team:"Liquid",name:"NertZ",role:"Support",aim:84,gameSense:78,util:78,igl:64,mentality:77,consistency:86,traits:[],salary:12,contract:2,age:24,era:"current"},
  // ── Astralis ──────────────────────────────────────────────────────────
  // device is AWP legend (not IGL!), stavn is rifler (not AWP)
  {team:"Astralis",name:"Malb",role:"IGL",aim:72,gameSense:82,util:82,igl:88,mentality:82,consistency:72,traits:["leader"],salary:13,contract:3,age:26,era:"current"},
  {team:"Astralis",name:"device",role:"AWP",aim:92,gameSense:95,util:90,igl:75,mentality:99,consistency:84,traits:["clutch"],salary:20,contract:2,age:30,era:"current"},
  {team:"Astralis",name:"stavn",role:"Entry",aim:88,gameSense:83,util:78,igl:60,mentality:80,consistency:90,traits:[],salary:14,contract:2,age:23,era:"current"},
  {team:"Astralis",name:"jabbi",role:"Entry",aim:90,gameSense:78,util:78,igl:62,mentality:74,consistency:92,traits:[],salary:13,contract:2,age:22,era:"current"},
  {team:"Astralis",name:"Staehr",role:"Lurk",aim:87,gameSense:90,util:84,igl:47,mentality:87,consistency:64,traits:["boom"],salary:13,contract:2,age:21,era:"current"},
  // ── Heroic ────────────────────────────────────────────────────────────
  // SunPayus is AWP (not Lurk!)
  {team:"Heroic",name:"xfl0ud",role:"IGL",aim:72,gameSense:82,util:84,igl:85,mentality:90,consistency:64,traits:["leader","boom"],salary:13,contract:3,age:24,era:"current"},
  {team:"Heroic",name:"SunPayus",role:"AWP",aim:90,gameSense:84,util:78,igl:64,mentality:80,consistency:80,traits:[],salary:13,contract:2,age:25,era:"current"},
  {team:"Heroic",name:"yxngstxr",role:"Entry",aim:87,gameSense:82,util:74,igl:62,mentality:74,consistency:74,traits:[],salary:12,contract:2,age:22,era:"current"},
  {team:"Heroic",name:"tN1R",role:"Lurk",aim:80,gameSense:78,util:76,igl:52,mentality:72,consistency:82,traits:[],salary:11,contract:2,age:23,era:"current"},
  {team:"Heroic",name:"kyuubii",role:"Support",aim:78,gameSense:80,util:92,igl:51,mentality:84,consistency:94,traits:[],salary:12,contract:3,age:22,era:"current"},
  // ── Complexity ────────────────────────────────────────────────────────
  {team:"Complexity",name:"JT",role:"IGL",aim:66,gameSense:76,util:78,igl:90,mentality:83,consistency:68,traits:["leader","boom"],salary:12,contract:3,age:28,era:"current"},
  {team:"Complexity",name:"hallzerk",role:"AWP",aim:86,gameSense:80,util:68,igl:56,mentality:79,consistency:66,traits:["boom"],salary:11,contract:2,age:24,era:"current"},
  {team:"Complexity",name:"Grim",role:"Entry",aim:84,gameSense:76,util:72,igl:64,mentality:73,consistency:66,traits:["boom"],salary:10,contract:2,age:25,era:"current"},
  {team:"Complexity",name:"EliGE",role:"Lurk",aim:82,gameSense:85,util:82,igl:62,mentality:80,consistency:76,traits:[],salary:12,contract:2,age:27,era:"current"},
  {team:"Complexity",name:"Cybermaniac",role:"Support",aim:72,gameSense:80,util:90,igl:60,mentality:82,consistency:72,traits:[],salary:11,contract:3,age:24,era:"current"},
  // ── paiN ─────────────────────────────────────────────────────────────
  {team:"paiN",name:"dav1deuS",role:"IGL",aim:70,gameSense:80,util:77,igl:83,mentality:88,consistency:94,traits:["leader"],salary:13,contract:3,age:27,era:"current"},
  {team:"paiN",name:"biguzera",role:"AWP",aim:86,gameSense:81,util:74,igl:57,mentality:77,consistency:64,traits:["boom"],salary:11,contract:2,age:22,era:"current"},
  {team:"paiN",name:"snow",role:"Entry",aim:88,gameSense:74,util:77,igl:60,mentality:76,consistency:70,traits:["boom"],salary:11,contract:2,age:24,era:"current"},
  {team:"paiN",name:"dgt",role:"Lurk",aim:84,gameSense:86,util:78,igl:68,mentality:78,consistency:88,traits:[],salary:12,contract:2,age:23,era:"current"},
  {team:"paiN",name:"nqz",role:"Support",aim:72,gameSense:80,util:87,igl:56,mentality:80,consistency:94,traits:[],salary:11,contract:3,age:26,era:"current"},
  // ── 3DMAX ─────────────────────────────────────────────────────────────
  // Maka is real IGL for 3DMAX, Lucky is AWP
  {team:"3DMAX",name:"Maka",role:"IGL",aim:72,gameSense:84,util:76,igl:90,mentality:84,consistency:66,traits:["leader","boom"],salary:14,contract:3,age:27,era:"current"},
  {team:"3DMAX",name:"Lucky",role:"AWP",aim:88,gameSense:78,util:72,igl:50,mentality:78,consistency:68,traits:["boom"],salary:12,contract:2,age:26,era:"current"},
  {team:"3DMAX",name:"Djoko",role:"Entry",aim:84,gameSense:76,util:74,igl:66,mentality:75,consistency:90,traits:[],salary:12,contract:2,age:29,era:"current"},
  {team:"3DMAX",name:"Graviti",role:"Lurk",aim:78,gameSense:82,util:76,igl:66,mentality:80,consistency:88,traits:[],salary:12,contract:2,age:24,era:"current"},
  {team:"3DMAX",name:"ALEX",role:"Support",aim:68,gameSense:76,util:80,igl:50,mentality:74,consistency:94,traits:[],salary:10,contract:3,age:30,era:"current"},
  // ── GamerLegion ───────────────────────────────────────────────────────
  {team:"GamerLegion",name:"tiziaN",role:"IGL",aim:68,gameSense:78,util:78,igl:86,mentality:78,consistency:80,traits:["leader"],salary:11,contract:3,age:26,era:"current"},
  {team:"GamerLegion",name:"Tauson",role:"AWP",aim:82,gameSense:82,util:68,igl:54,mentality:78,consistency:90,traits:[],salary:11,contract:2,age:22,era:"current"},
  {team:"GamerLegion",name:"ztr",role:"Entry",aim:84,gameSense:78,util:70,igl:62,mentality:74,consistency:66,traits:["boom"],salary:10,contract:2,age:21,era:"current"},
  {team:"GamerLegion",name:"spooke",role:"Lurk",aim:80,gameSense:80,util:74,igl:48,mentality:80,consistency:68,traits:[],salary:10,contract:2,age:23,era:"current"},
  {team:"GamerLegion",name:"Kursy",role:"Support",aim:72,gameSense:78,util:86,igl:54,mentality:76,consistency:84,traits:[],salary:10,contract:3,age:24,era:"current"},
  // ── Eternal Fire ─────────────────────────────────────────────────────
  // Turkish superteam; woxic is one of the most mechanical AWPs ever but wildly inconsistent
  {team:"Eternal Fire",name:"imoRR",role:"IGL",aim:73,gameSense:85,util:82,igl:87,mentality:85,consistency:76,traits:["leader"],salary:14,contract:3,age:23,era:"current"},
  {team:"Eternal Fire",name:"woxic",role:"AWP",aim:96,gameSense:86,util:73,igl:50,mentality:78,consistency:58,traits:["boom","clutch"],salary:17,contract:2,age:25,era:"current"},
  {team:"Eternal Fire",name:"XANTARES",role:"Entry",aim:95,gameSense:82,util:72,igl:46,mentality:80,consistency:64,traits:["boom"],salary:15,contract:2,age:27,era:"current"},
  {team:"Eternal Fire",name:"Calyx",role:"Lurk",aim:90,gameSense:86,util:78,igl:52,mentality:83,consistency:74,traits:[],salary:14,contract:2,age:26,era:"current"},
  {team:"Eternal Fire",name:"paz",role:"Support",aim:75,gameSense:82,util:88,igl:58,mentality:82,consistency:78,traits:[],salary:12,contract:3,age:24,era:"current"},
  // ── TheMongolz ───────────────────────────────────────────────────────
  // Rising Mongolian force, genuine Major contenders; buster is an elite entry fragger
  {team:"TheMongolz",name:"Techno",role:"IGL",aim:76,gameSense:86,util:84,igl:87,mentality:88,consistency:82,traits:["leader"],salary:14,contract:3,age:25,era:"current"},
  {team:"TheMongolz",name:"Senzu",role:"AWP",aim:91,gameSense:84,util:74,igl:52,mentality:80,consistency:70,traits:["boom"],salary:14,contract:2,age:22,era:"current"},
  {team:"TheMongolz",name:"buster",role:"Entry",aim:91,gameSense:83,util:79,igl:54,mentality:85,consistency:74,traits:["boom","clutch"],salary:15,contract:3,age:23,era:"current"},
  {team:"TheMongolz",name:"ark",role:"Entry",aim:87,gameSense:79,util:75,igl:50,mentality:81,consistency:72,traits:["boom"],salary:12,contract:2,age:22,era:"current"},
  {team:"TheMongolz",name:"mzinho",role:"Lurk",aim:84,gameSense:82,util:77,igl:56,mentality:79,consistency:68,traits:[],salary:12,contract:2,age:25,era:"current"},
  // ── NIP ──────────────────────────────────────────────────────────────
  // Swedish legend org; hampus is a crafty IGL, headtr1ck the young AWP hope
  {team:"NIP",name:"hampus",role:"IGL",aim:76,gameSense:83,util:81,igl:87,mentality:84,consistency:76,traits:["leader"],salary:14,contract:3,age:26,era:"current"},
  {team:"NIP",name:"headtr1ck",role:"AWP",aim:88,gameSense:80,util:71,igl:49,mentality:77,consistency:68,traits:["boom"],salary:13,contract:2,age:22,era:"current"},
  {team:"NIP",name:"Plopski",role:"Entry",aim:86,gameSense:79,util:73,igl:50,mentality:76,consistency:76,traits:[],salary:12,contract:2,age:25,era:"current"},
  {team:"NIP",name:"maxster",role:"Lurk",aim:82,gameSense:77,util:71,igl:46,mentality:73,consistency:64,traits:["boom"],salary:11,contract:2,age:21,era:"current"},
  {team:"NIP",name:"l00m1natii",role:"Support",aim:72,gameSense:76,util:87,igl:52,mentality:78,consistency:80,traits:[],salary:10,contract:3,age:23,era:"current"},
  // ── Cloud9 ────────────────────────────────────────────────────────────
  // CIS/International superteam roster; Ax1Le is a mechanical monster, HObbit veteran
  {team:"Cloud9",name:"interz",role:"IGL",aim:71,gameSense:83,util:81,igl:87,mentality:83,consistency:72,traits:["leader"],salary:14,contract:3,age:27,era:"current"},
  {team:"Cloud9",name:"degster",role:"AWP",aim:90,gameSense:83,util:71,igl:47,mentality:77,consistency:64,traits:["boom"],salary:14,contract:2,age:24,era:"current"},
  {team:"Cloud9",name:"Ax1Le",role:"Entry",aim:91,gameSense:85,util:77,igl:51,mentality:83,consistency:70,traits:["boom","clutch"],salary:16,contract:3,age:25,era:"current"},
  {team:"Cloud9",name:"HObbit",role:"Lurk",aim:82,gameSense:86,util:81,igl:60,mentality:85,consistency:82,traits:[],salary:14,contract:2,age:28,era:"current"},
  {team:"Cloud9",name:"n0rb3r7",role:"Support",aim:74,gameSense:78,util:84,igl:54,mentality:76,consistency:70,traits:[],salary:11,contract:2,age:23,era:"current"},
  // ── Virtus.pro ───────────────────────────────────────────────────────
  // Russian powerhouse; Jame famous for deliberate time-wasting AWP style
  {team:"Virtus.pro",name:"fame",role:"IGL",aim:72,gameSense:82,util:80,igl:86,mentality:83,consistency:73,traits:["leader"],salary:13,contract:3,age:25,era:"current"},
  {team:"Virtus.pro",name:"Jame",role:"AWP",aim:88,gameSense:88,util:75,igl:82,mentality:90,consistency:76,traits:["leader","clutch"],salary:16,contract:2,age:27,era:"current"},
  {team:"Virtus.pro",name:"FL1T",role:"Entry",aim:89,gameSense:82,util:75,igl:50,mentality:80,consistency:68,traits:["boom"],salary:13,contract:2,age:24,era:"current"},
  {team:"Virtus.pro",name:"qikert",role:"Lurk",aim:83,gameSense:80,util:74,igl:52,mentality:78,consistency:68,traits:[],salary:11,contract:2,age:25,era:"current"},
  {team:"Virtus.pro",name:"SANJI",role:"Support",aim:74,gameSense:80,util:86,igl:56,mentality:80,consistency:76,traits:[],salary:12,contract:3,age:26,era:"current"},
  // ── ENCE ─────────────────────────────────────────────────────────────
  // Finnish org; Snappi is a veteran IGL, dycha a flashy Polish AWPer
  {team:"ENCE",name:"Snappi",role:"IGL",aim:74,gameSense:84,util:84,igl:88,mentality:86,consistency:77,traits:["leader"],salary:13,contract:3,age:28,era:"current"},
  {team:"ENCE",name:"dycha",role:"AWP",aim:90,gameSense:79,util:70,igl:46,mentality:74,consistency:60,traits:["boom"],salary:13,contract:2,age:26,era:"current"},
  {team:"ENCE",name:"HENU",role:"Entry",aim:85,gameSense:77,util:71,igl:51,mentality:74,consistency:70,traits:["boom"],salary:11,contract:2,age:23,era:"current"},
  {team:"ENCE",name:"hades",role:"Lurk",aim:82,gameSense:80,util:75,igl:52,mentality:77,consistency:72,traits:[],salary:11,contract:2,age:24,era:"current"},
  {team:"ENCE",name:"O'Sullivan",role:"Support",aim:73,gameSense:77,util:85,igl:50,mentality:79,consistency:79,traits:[],salary:10,contract:3,age:25,era:"current"},
  // ── BIG ──────────────────────────────────────────────────────────────
  // German org; syrson is a streaky rifler/AWPer, faveN solid entry
  {team:"BIG",name:"prosus",role:"IGL",aim:70,gameSense:81,util:80,igl:86,mentality:81,consistency:72,traits:["leader"],salary:12,contract:3,age:24,era:"current"},
  {team:"BIG",name:"syrson",role:"AWP",aim:88,gameSense:79,util:68,igl:44,mentality:73,consistency:60,traits:["boom"],salary:12,contract:2,age:27,era:"current"},
  {team:"BIG",name:"faveN",role:"Entry",aim:83,gameSense:76,util:73,igl:53,mentality:71,consistency:72,traits:[],salary:11,contract:2,age:25,era:"current"},
  {team:"BIG",name:"k1to",role:"Lurk",aim:79,gameSense:76,util:73,igl:47,mentality:71,consistency:74,traits:[],salary:10,contract:2,age:24,era:"current"},
  {team:"BIG",name:"krimbo",role:"Support",aim:71,gameSense:75,util:83,igl:50,mentality:77,consistency:78,traits:[],salary:10,contract:3,age:23,era:"current"},
  // ── Fnatic ───────────────────────────────────────────────────────────
  // Swedish legend brand rebuilding; FASHR emerging AWP talent
  {team:"Fnatic",name:"roeJ",role:"IGL",aim:74,gameSense:80,util:82,igl:85,mentality:83,consistency:75,traits:["leader"],salary:12,contract:3,age:27,era:"current"},
  {team:"Fnatic",name:"FASHR",role:"AWP",aim:86,gameSense:78,util:69,igl:46,mentality:73,consistency:62,traits:["boom"],salary:12,contract:2,age:21,era:"current"},
  {team:"Fnatic",name:"Sulya",role:"Entry",aim:84,gameSense:75,util:71,igl:50,mentality:74,consistency:70,traits:["boom"],salary:11,contract:2,age:22,era:"current"},
  {team:"Fnatic",name:"afro",role:"Lurk",aim:78,gameSense:76,util:73,igl:45,mentality:73,consistency:70,traits:[],salary:10,contract:2,age:24,era:"current"},
  {team:"Fnatic",name:"EC1S",role:"Support",aim:70,gameSense:76,util:84,igl:54,mentality:77,consistency:78,traits:[],salary:10,contract:3,age:26,era:"current"},
  // ── OG ───────────────────────────────────────────────────────────────
  // European org with mix of veterans; nexa crafty lurker-fragger
  {team:"OG",name:"niko",role:"IGL",aim:73,gameSense:80,util:78,igl:85,mentality:80,consistency:71,traits:["leader"],salary:12,contract:3,age:26,era:"current"},
  {team:"OG",name:"F1KU",role:"AWP",aim:85,gameSense:76,util:67,igl:42,mentality:69,consistency:58,traits:["boom"],salary:11,contract:2,age:22,era:"current"},
  {team:"OG",name:"nexa",role:"Lurk",aim:78,gameSense:82,util:78,igl:68,mentality:80,consistency:70,traits:[],salary:11,contract:2,age:28,era:"current"},
  {team:"OG",name:"Maden",role:"Entry",aim:84,gameSense:77,util:73,igl:52,mentality:74,consistency:70,traits:["boom"],salary:11,contract:2,age:25,era:"current"},
  {team:"OG",name:"Flammie",role:"Support",aim:71,gameSense:74,util:82,igl:48,mentality:72,consistency:76,traits:[],salary:9,contract:3,age:22,era:"current"},
  // ── MIBR ─────────────────────────────────────────────────────────────
  // Brazilian legend org; drop and Insani are young guns, exit veteran IGL
  {team:"MIBR",name:"exit",role:"IGL",aim:68,gameSense:78,util:76,igl:84,mentality:82,consistency:74,traits:["leader"],salary:12,contract:3,age:27,era:"current"},
  {team:"MIBR",name:"chelo",role:"AWP",aim:85,gameSense:75,util:68,igl:42,mentality:71,consistency:60,traits:["boom"],salary:11,contract:2,age:26,era:"current"},
  {team:"MIBR",name:"drop",role:"Entry",aim:84,gameSense:73,util:70,igl:48,mentality:73,consistency:68,traits:["boom"],salary:11,contract:2,age:22,era:"current"},
  {team:"MIBR",name:"Insani",role:"Entry",aim:86,gameSense:73,util:69,igl:46,mentality:71,consistency:64,traits:["boom"],salary:11,contract:2,age:21,era:"current"},
  {team:"MIBR",name:"brnz4n",role:"Support",aim:70,gameSense:73,util:81,igl:52,mentality:71,consistency:76,traits:[],salary:9,contract:3,age:23,era:"current"},
  // ── Imperial ─────────────────────────────────────────────────────────
  // Brazilian squad; felps veteran lurker, HEN1 AWP
  {team:"Imperial",name:"decenty",role:"IGL",aim:71,gameSense:78,util:76,igl:85,mentality:80,consistency:72,traits:["leader"],salary:12,contract:3,age:25,era:"current"},
  {team:"Imperial",name:"HEN1",role:"AWP",aim:86,gameSense:77,util:69,igl:44,mentality:72,consistency:62,traits:["boom","clutch"],salary:12,contract:2,age:28,era:"current"},
  {team:"Imperial",name:"JOTA",role:"Entry",aim:84,gameSense:74,util:71,igl:48,mentality:73,consistency:70,traits:["boom"],salary:11,contract:2,age:24,era:"current"},
  {team:"Imperial",name:"felps",role:"Lurk",aim:82,gameSense:80,util:76,igl:58,mentality:76,consistency:70,traits:["clutch"],salary:11,contract:2,age:29,era:"current"},
  {team:"Imperial",name:"boltz",role:"Support",aim:72,gameSense:74,util:80,igl:52,mentality:74,consistency:76,traits:[],salary:9,contract:3,age:28,era:"current"},
  // ── Monte ─────────────────────────────────────────────────────────────
  // CIS/Ukrainian team; SELLTER aggressive entry, 255 tactical IGL
  {team:"Monte",name:"255",role:"IGL",aim:70,gameSense:79,util:78,igl:84,mentality:81,consistency:71,traits:["leader"],salary:11,contract:3,age:24,era:"current"},
  {team:"Monte",name:"Sdaim",role:"AWP",aim:84,gameSense:77,util:68,igl:44,mentality:74,consistency:62,traits:["boom"],salary:11,contract:2,age:23,era:"current"},
  {team:"Monte",name:"SELLTER",role:"Entry",aim:85,gameSense:74,util:70,igl:46,mentality:73,consistency:66,traits:["boom"],salary:11,contract:2,age:22,era:"current"},
  {team:"Monte",name:"relaxa",role:"Lurk",aim:78,gameSense:76,util:72,igl:44,mentality:71,consistency:68,traits:[],salary:9,contract:2,age:23,era:"current"},
  {team:"Monte",name:"cynic",role:"Support",aim:68,gameSense:74,util:80,igl:50,mentality:72,consistency:74,traits:[],salary:9,contract:3,age:22,era:"current"},
  // ── Lynn Vision ──────────────────────────────────────────────────────
  // Chinese team; Westmelon is a star AWPer, EmiliaQAQ mechanical fragger
  {team:"Lynn Vision",name:"Mercury",role:"IGL",aim:69,gameSense:78,util:77,igl:84,mentality:80,consistency:70,traits:["leader"],salary:10,contract:3,age:25,era:"current"},
  {team:"Lynn Vision",name:"Westmelon",role:"AWP",aim:88,gameSense:80,util:68,igl:44,mentality:74,consistency:66,traits:["boom"],salary:12,contract:2,age:23,era:"current"},
  {team:"Lynn Vision",name:"EmiliaQAQ",role:"Entry",aim:86,gameSense:73,util:68,igl:46,mentality:70,consistency:62,traits:["boom"],salary:11,contract:2,age:22,era:"current"},
  {team:"Lynn Vision",name:"Aaron",role:"Lurk",aim:76,gameSense:74,util:72,igl:48,mentality:70,consistency:68,traits:[],salary:9,contract:2,age:24,era:"current"},
  {team:"Lynn Vision",name:"reck",role:"Support",aim:67,gameSense:72,util:79,igl:48,mentality:70,consistency:72,traits:[],salary:8,contract:3,age:22,era:"current"},
  // ── Apeks ─────────────────────────────────────────────────────────────
  // Norwegian team; Kylar rising AWP star, MICHU veteran IGL
  {team:"Apeks",name:"MICHU",role:"IGL",aim:72,gameSense:79,util:78,igl:85,mentality:80,consistency:72,traits:["leader"],salary:11,contract:3,age:28,era:"current"},
  {team:"Apeks",name:"Kylar",role:"AWP",aim:87,gameSense:78,util:68,igl:44,mentality:72,consistency:64,traits:["boom"],salary:12,contract:2,age:22,era:"current"},
  {team:"Apeks",name:"REDSTAR",role:"Entry",aim:82,gameSense:73,util:68,igl:48,mentality:70,consistency:66,traits:["boom"],salary:10,contract:2,age:23,era:"current"},
  {team:"Apeks",name:"nerz",role:"Lurk",aim:76,gameSense:74,util:70,igl:44,mentality:69,consistency:64,traits:[],salary:8,contract:2,age:22,era:"current"},
  {team:"Apeks",name:"Cobra",role:"Support",aim:66,gameSense:72,util:78,igl:48,mentality:70,consistency:70,traits:[],salary:8,contract:3,age:23,era:"current"},
  // ── SAW ───────────────────────────────────────────────────────────────
  // Portuguese team punching above weight; ewjerkz mechanical fragger
  {team:"SAW",name:"arrozdoce",role:"IGL",aim:70,gameSense:78,util:76,igl:84,mentality:79,consistency:72,traits:["leader"],salary:11,contract:3,age:24,era:"current"},
  {team:"SAW",name:"just1ce",role:"AWP",aim:86,gameSense:77,util:67,igl:42,mentality:71,consistency:62,traits:["boom"],salary:11,contract:2,age:24,era:"current"},
  {team:"SAW",name:"ewjerkz",role:"Entry",aim:88,gameSense:76,util:71,igl:46,mentality:74,consistency:68,traits:["boom","clutch"],salary:13,contract:2,age:23,era:"current"},
  {team:"SAW",name:"story",role:"Lurk",aim:76,gameSense:74,util:70,igl:44,mentality:70,consistency:66,traits:[],salary:9,contract:2,age:22,era:"current"},
  {team:"SAW",name:"MUTiRiS",role:"Support",aim:67,gameSense:72,util:78,igl:48,mentality:70,consistency:68,traits:[],salary:8,contract:3,age:23,era:"current"},
  // ── Wildcard ──────────────────────────────────────────────────────────
  // NA/International roster; k0nfig elite mechanical entry, Swisher crafty NA IGL
  {team:"Wildcard",name:"Swisher",role:"IGL",aim:73,gameSense:79,util:78,igl:84,mentality:80,consistency:72,traits:["leader"],salary:11,contract:3,age:26,era:"current"},
  {team:"Wildcard",name:"cxzi",role:"AWP",aim:86,gameSense:77,util:67,igl:42,mentality:71,consistency:62,traits:["boom"],salary:11,contract:2,age:23,era:"current"},
  {team:"Wildcard",name:"k0nfig",role:"Entry",aim:92,gameSense:83,util:74,igl:50,mentality:79,consistency:68,traits:["boom","clutch"],salary:14,contract:2,age:27,era:"current"},
  {team:"Wildcard",name:"WolfY",role:"Lurk",aim:79,gameSense:77,util:73,igl:48,mentality:72,consistency:70,traits:[],salary:10,contract:2,age:25,era:"current"},
  {team:"Wildcard",name:"slaxz-",role:"Support",aim:68,gameSense:73,util:80,igl:50,mentality:72,consistency:72,traits:[],salary:9,contract:3,age:24,era:"current"},
  // ── Free Agents (current era) ─────────────────────────────────────────
  {team:"FA",name:"tabseN",role:"IGL",aim:74,gameSense:78,util:76,igl:86,mentality:82,consistency:78,traits:["leader"],salary:12,contract:0,age:29,era:"current"},
  {team:"FA",name:"AcoR",role:"AWP",aim:91,gameSense:79,util:70,igl:45,mentality:72,consistency:62,traits:["boom"],salary:11,contract:0,age:25,era:"current"},
  {team:"FA",name:"JDC",role:"Entry",aim:87,gameSense:77,util:73,igl:51,mentality:78,consistency:92,traits:[],salary:11,contract:0,age:22,era:"current"},
  {team:"FA",name:"refrezh",role:"Entry",aim:89,gameSense:84,util:78,igl:55,mentality:80,consistency:76,traits:["clutch"],salary:12,contract:0,age:27,era:"current"},
  {team:"FA",name:"valde",role:"Lurk",aim:86,gameSense:90,util:84,igl:72,mentality:86,consistency:82,traits:[],salary:14,contract:0,age:29,era:"current"},
  {team:"FA",name:"Magisk",role:"Support",aim:83,gameSense:91,util:93,igl:78,mentality:93,consistency:88,traits:["leader"],salary:16,contract:0,age:29,era:"current"},
  {team:"FA",name:"es3tag",role:"Support",aim:80,gameSense:83,util:91,igl:61,mentality:84,consistency:86,traits:[],salary:12,contract:0,age:28,era:"current"},
  {team:"FA",name:"Boombl4",role:"IGL",aim:72,gameSense:87,util:83,igl:91,mentality:85,consistency:70,traits:["leader"],salary:13,contract:0,age:26,era:"current"},
  {team:"FA",name:"nbk",role:"Support",aim:76,gameSense:89,util:91,igl:76,mentality:91,consistency:84,traits:["leader"],salary:14,contract:0,age:31,era:"current"},
  {team:"FA",name:"poizon",role:"AWP",aim:93,gameSense:82,util:72,igl:44,mentality:76,consistency:65,traits:["boom"],salary:12,contract:0,age:25,era:"current"},
  {team:"FA",name:"hyped",role:"Lurk",aim:76,gameSense:84,util:74,igl:56,mentality:76,consistency:68,traits:["boom"],salary:10,contract:0,age:21,era:"current"},
  {team:"FA",name:"REZ",role:"Entry",aim:86,gameSense:82,util:76,igl:54,mentality:80,consistency:78,traits:["boom"],salary:12,contract:0,age:27,era:"current"},
  {team:"FA",name:"kjaerbye",role:"Entry",aim:87,gameSense:79,util:73,igl:48,mentality:71,consistency:60,traits:["boom"],salary:10,contract:0,age:28,era:"current"},
  {team:"FA",name:"RUSH",role:"Lurk",aim:80,gameSense:81,util:78,igl:52,mentality:82,consistency:80,traits:[],salary:10,contract:0,age:29,era:"current"},
  // ── 2018-2021 ERA ─────────────────────────────────────────────────────
  // s1mple: arguably the greatest player ever, peak ~1.35 HLTV rating
  {team:"FA",name:"s1mple★",role:"AWP",aim:99,gameSense:99,util:88,igl:70,mentality:99,consistency:72,traits:["clutch","boom"],salary:24,contract:0,age:22,era:"2018"},
  {team:"FA",name:"electronic★",role:"Entry",aim:97,gameSense:94,util:87,igl:55,mentality:93,consistency:82,traits:["clutch"],salary:19,contract:0,age:22,era:"2018"},
  // NiKo★ 2018 era — peak mechanical skill, one of the best aimers ever
  {team:"FA",name:"NiKo★",role:"Entry",aim:99,gameSense:97,util:88,igl:60,mentality:97,consistency:76,traits:["boom","clutch"],salary:22,contract:0,age:23,era:"2018"},
  // coldzera★ — 2x HLTV #1, godlike lurker
  {team:"FA",name:"coldzera★",role:"Lurk",aim:96,gameSense:99,util:92,igl:65,mentality:99,consistency:90,traits:["clutch"],salary:22,contract:0,age:24,era:"2018"},
  // dev1ce★ — most consistent AWP ever, 4x Major winner
  {team:"FA",name:"dev1ce★",role:"AWP",aim:95,gameSense:98,util:93,igl:80,mentality:99,consistency:97,traits:["leader","clutch"],salary:22,contract:0,age:25,era:"2018"},
  {team:"FA",name:"dupreeh★",role:"Entry",aim:93,gameSense:92,util:90,igl:60,mentality:95,consistency:88,traits:["clutch"],salary:18,contract:0,age:27,era:"2018"},
  // gla1ve★ — one of the greatest IGLs of all time, 2x Major winner
  {team:"FA",name:"gla1ve★",role:"IGL",aim:78,gameSense:98,util:95,igl:99,mentality:97,consistency:85,traits:["leader"],salary:19,contract:0,age:25,era:"2018"},
  // Xyp9x★ — "the clutch minister", support god
  {team:"FA",name:"Xyp9x★",role:"Support",aim:82,gameSense:96,util:97,igl:65,mentality:99,consistency:95,traits:["clutch"],salary:18,contract:0,age:25,era:"2018"},
  {team:"FA",name:"Twistzz★",role:"Entry",aim:97,gameSense:90,util:82,igl:50,mentality:90,consistency:88,traits:[],salary:17,contract:0,age:21,era:"2018"},
  {team:"FA",name:"EliGE★",role:"Entry",aim:95,gameSense:92,util:85,igl:62,mentality:88,consistency:85,traits:[],salary:17,contract:0,age:22,era:"2018"},
  {team:"FA",name:"ZywOo★",role:"AWP",aim:99,gameSense:98,util:90,igl:68,mentality:95,consistency:76,traits:["boom","clutch"],salary:21,contract:0,age:19,era:"2018"},
  {team:"FA",name:"Brehze★",role:"Lurk",aim:96,gameSense:90,util:82,igl:48,mentality:85,consistency:80,traits:["boom"],salary:16,contract:0,age:22,era:"2018"},
  {team:"FA",name:"NAF★",role:"Support",aim:90,gameSense:93,util:90,igl:70,mentality:92,consistency:90,traits:["leader"],salary:16,contract:0,age:23,era:"2018"},
  {team:"FA",name:"blameF★",role:"IGL",aim:88,gameSense:94,util:88,igl:95,mentality:90,consistency:82,traits:["leader"],salary:17,contract:0,age:24,era:"2018"},
  {team:"FA",name:"ropz★",role:"Lurk",aim:97,gameSense:95,util:85,igl:48,mentality:90,consistency:96,traits:[],salary:18,contract:0,age:21,era:"2018"},
  // ── 2015-2017 ERA ─────────────────────────────────────────────────────
  // olofmeister★ — fnatic's star entry/playmaker (the "olofboost", Overpass clutch)
  {team:"FA",name:"olofmeister★",role:"Entry",aim:96,gameSense:98,util:90,igl:70,mentality:99,consistency:80,traits:["clutch","leader"],salary:21,contract:0,age:24,era:"2015"},
  // flusha★ — fnatic's lurker with elite game sense (not a support)
  {team:"FA",name:"flusha★",role:"Lurk",aim:89,gameSense:99,util:95,igl:82,mentality:96,consistency:85,traits:["clutch"],salary:19,contract:0,age:23,era:"2015"},
  {team:"FA",name:"KRiMZ★",role:"Support",aim:90,gameSense:95,util:94,igl:55,mentality:96,consistency:92,traits:[],salary:18,contract:0,age:22,era:"2015"},
  // kennyS★ — peak: the most mechanical AWP ever, legendary flicks
  {team:"FA",name:"kennyS★",role:"AWP",aim:99,gameSense:90,util:72,igl:45,mentality:88,consistency:62,traits:["boom","clutch"],salary:20,contract:0,age:22,era:"2015"},
  {team:"FA",name:"GuardiaN★",role:"AWP",aim:97,gameSense:93,util:80,igl:55,mentality:92,consistency:78,traits:["clutch"],salary:18,contract:0,age:25,era:"2015"},
  {team:"FA",name:"shox★",role:"Entry",aim:97,gameSense:95,util:82,igl:78,mentality:90,consistency:65,traits:["boom","clutch"],salary:19,contract:0,age:24,era:"2015"},
  {team:"FA",name:"Happy★",role:"IGL",aim:82,gameSense:95,util:85,igl:96,mentality:88,consistency:70,traits:["leader"],salary:16,contract:0,age:25,era:"2015"},
  // FalleN★ — legendary AWPing IGL, 2x Major winner with LG/SK Gaming
  {team:"FA",name:"FalleN★",role:"IGL",aim:95,gameSense:97,util:90,igl:99,mentality:98,consistency:83,traits:["leader","clutch"],salary:21,contract:0,age:25,era:"2015"},
  {team:"FA",name:"fer★",role:"Entry",aim:95,gameSense:88,util:78,igl:45,mentality:92,consistency:62,traits:["boom"],salary:17,contract:0,age:24,era:"2015"},
  {team:"FA",name:"TACO★",role:"Support",aim:76,gameSense:88,util:93,igl:60,mentality:90,consistency:88,traits:[],salary:13,contract:0,age:24,era:"2015"},
  {team:"FA",name:"rain★",role:"Entry",aim:95,gameSense:88,util:82,igl:48,mentality:92,consistency:76,traits:["clutch"],salary:16,contract:0,age:22,era:"2015"},
  {team:"FA",name:"dennis★",role:"Entry",aim:94,gameSense:85,util:78,igl:55,mentality:85,consistency:72,traits:["boom"],salary:14,contract:0,age:23,era:"2015"},
  {team:"FA",name:"NBK★",role:"Support",aim:86,gameSense:92,util:92,igl:78,mentality:93,consistency:82,traits:["leader"],salary:16,contract:0,age:22,era:"2015"},
  // ── 2013-2014 LEGENDS ─────────────────────────────────────────────────
  // GeT_RiGhT★ — NiP legend, peak possibly the best player in CS history at the time
  {team:"FA",name:"GeT_RiGhT★",role:"Lurk",aim:96,gameSense:99,util:85,igl:60,mentality:97,consistency:88,traits:["clutch"],salary:20,contract:0,age:23,era:"2013"},
  {team:"FA",name:"f0rest★",role:"Entry",aim:97,gameSense:95,util:82,igl:55,mentality:93,consistency:82,traits:["clutch","boom"],salary:19,contract:0,age:25,era:"2013"},
  {team:"FA",name:"friberg★",role:"Entry",aim:88,gameSense:85,util:82,igl:50,mentality:90,consistency:80,traits:[],salary:13,contract:0,age:23,era:"2013"},
  // Xizt★ — NiP IGL for many years
  {team:"FA",name:"Xizt★",role:"IGL",aim:80,gameSense:90,util:85,igl:92,mentality:88,consistency:80,traits:["leader"],salary:14,contract:0,age:23,era:"2013"},
  // ScreaM★ — "the headshot machine", mechanical god
  {team:"FA",name:"ScreaM★",role:"Entry",aim:99,gameSense:80,util:70,igl:40,mentality:78,consistency:56,traits:["boom"],salary:16,contract:0,age:21,era:"2013"},
  {team:"FA",name:"JW★",role:"AWP",aim:93,gameSense:88,util:75,igl:48,mentality:90,consistency:62,traits:["boom","clutch"],salary:16,contract:0,age:20,era:"2013"},
  // pronax★ — tactical mastermind, invented many utility lineups, fnatic IGL
  {team:"FA",name:"pronax★",role:"IGL",aim:70,gameSense:95,util:88,igl:99,mentality:95,consistency:78,traits:["leader"],salary:15,contract:0,age:24,era:"2013"},
  // Snax★ — legendary VP lurker
  {team:"FA",name:"Snax★",role:"Lurk",aim:96,gameSense:93,util:82,igl:55,mentality:88,consistency:68,traits:["boom","clutch"],salary:17,contract:0,age:22,era:"2013"},
  {team:"FA",name:"pasha★",role:"Entry",aim:93,gameSense:82,util:78,igl:42,mentality:95,consistency:70,traits:["boom"],salary:15,contract:0,age:25,era:"2013"},
  // NEO★ — the greatest tactical player, VP IGL
  {team:"FA",name:"NEO★",role:"IGL",aim:86,gameSense:96,util:90,igl:97,mentality:95,consistency:80,traits:["leader","clutch"],salary:17,contract:0,age:27,era:"2013"},
  {team:"FA",name:"TaZ★",role:"Support",aim:80,gameSense:90,util:88,igl:75,mentality:96,consistency:82,traits:["leader"],salary:14,contract:0,age:27,era:"2013"},
  // markeloff★ — early CS:GO AWP god, NaVi legend
  {team:"FA",name:"markeloff★",role:"AWP",aim:95,gameSense:90,util:78,igl:50,mentality:85,consistency:72,traits:["clutch"],salary:16,contract:0,age:24,era:"2013"},
];

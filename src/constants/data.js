export const MAPS = ["Mirage","Inferno","Nuke","Ancient","Dust2","Anubis","Train"];
export const RESERVE_MAPS = ["Vertigo","Overpass","Cache","Cobblestone","Tuscan","Mills"];
export const AI_TEAMS = ["Vitality","Spirit","FaZe","G2","MOUZ","NAVI","FURIA","Falcons","Liquid","Astralis","Heroic","Complexity","paiN","3DMAX","GamerLegion","Eternal Fire","TheMongolz","NIP","Cloud9","Virtus.pro","ENCE","BIG","Fnatic","OG","MIBR","Imperial","Monte","Lynn Vision","Apeks","SAW","Wildcard"];

export const PLAYERS_INIT = [
  // ── Vitality ──────────────────────────────────────────────────────────
  // ZywOo is THE AWPer, apEX is captain/IGL
  {team:"Vitality",name:"ZywOo",role:"AWP",aim:96,gameSense:99,util:78,igl:58,mentality:93,consistency:84,traits:["boom","clutch"],salary:22,contract:3,age:24,era:"current"},
  {team:"Vitality",name:"apEX",role:"IGL",aim:70,gameSense:83,util:77,igl:84,mentality:85,consistency:71,traits:["leader"],salary:17,contract:2,age:32,era:"current"},
  {team:"Vitality",name:"flameZ",role:"Entry",aim:84,gameSense:80,util:75,igl:52,mentality:81,consistency:73,traits:["boom"],salary:18,contract:2,age:23,era:"current"},
  {team:"Vitality",name:"mezii",role:"Lurk",aim:80,gameSense:81,util:83,igl:53,mentality:80,consistency:78,traits:[],salary:16,contract:3,age:25,era:"current"},
  {team:"Vitality",name:"Spinx",role:"Support",aim:81,gameSense:80,util:84,igl:60,mentality:81,consistency:80,traits:[],salary:17,contract:2,age:23,era:"current"},
  // ── Spirit ────────────────────────────────────────────────────────────
  // chopper is captain/IGL, donk is the HLTV #1 2024 star fragger (not IGL!)
  {team:"Spirit",name:"chopper",role:"IGL",aim:68,gameSense:85,util:81,igl:84,mentality:85,consistency:75,traits:["leader"],salary:17,contract:3,age:28,era:"current"},
  {team:"Spirit",name:"donk",role:"Entry",aim:99,gameSense:93,util:80,igl:57,mentality:93,consistency:75,traits:["boom","clutch"],salary:23,contract:3,age:18,era:"current"},
  {team:"Spirit",name:"sh1ro",role:"AWP",aim:90,gameSense:85,util:73,igl:60,mentality:84,consistency:81,traits:["clutch"],salary:18,contract:2,age:23,era:"current"},
  {team:"Spirit",name:"zont1x",role:"Entry",aim:84,gameSense:80,util:77,igl:55,mentality:80,consistency:66,traits:["boom"],salary:17,contract:2,age:20,era:"current"},
  {team:"Spirit",name:"magixx",role:"Support",aim:77,gameSense:81,util:84,igl:54,mentality:81,consistency:77,traits:[],salary:15,contract:2,age:21,era:"current"},
  // ── FaZe ─────────────────────────────────────────────────────────────
  // karrigan legendary IGL, broky is AWP, ropz is lurker (not AWP)
  {team:"FaZe",name:"karrigan",role:"IGL",aim:68,gameSense:87,util:80,igl:93,mentality:99,consistency:81,traits:["leader","clutch"],salary:18,contract:3,age:35,era:"current"},
  {team:"FaZe",name:"broky",role:"AWP",aim:85,gameSense:84,util:76,igl:53,mentality:84,consistency:80,traits:["clutch"],salary:16,contract:3,age:24,era:"current"},
  {team:"FaZe",name:"ropz",role:"Lurk",aim:86,gameSense:85,util:76,igl:52,mentality:86,consistency:87,traits:[],salary:18,contract:2,age:25,era:"current"},
  {team:"FaZe",name:"frozen",role:"Entry",aim:84,gameSense:80,util:75,igl:61,mentality:78,consistency:81,traits:[],salary:15,contract:2,age:23,era:"current"},
  {team:"FaZe",name:"rain",role:"Entry",aim:81,gameSense:79,util:75,igl:47,mentality:83,consistency:70,traits:["boom","clutch"],salary:14,contract:2,age:30,era:"current"},
  // ── G2 ───────────────────────────────────────────────────────────────
  // HooXi is IGL, m0NESY is AWP (not entry!), NiKo is star rifler
  {team:"G2",name:"HooXi",role:"IGL",aim:66,gameSense:80,util:81,igl:81,mentality:80,consistency:65,traits:["leader","boom"],salary:14,contract:3,age:26,era:"current"},
  {team:"G2",name:"m0NESY",role:"AWP",aim:96,gameSense:85,util:76,igl:57,mentality:83,consistency:76,traits:["boom","clutch"],salary:20,contract:2,age:19,era:"current"},
  {team:"G2",name:"NiKo",role:"Entry",aim:93,gameSense:90,util:81,igl:75,mentality:99,consistency:83,traits:["clutch"],salary:22,contract:3,age:27,era:"current"},
  {team:"G2",name:"huNter-",role:"Lurk",aim:84,gameSense:79,util:73,igl:53,mentality:78,consistency:73,traits:[],salary:14,contract:2,age:30,era:"current"},
  {team:"G2",name:"Snax",role:"Support",aim:76,gameSense:81,util:81,igl:65,mentality:76,consistency:70,traits:[],salary:14,contract:2,age:30,era:"current"},
  // ── MOUZ ─────────────────────────────────────────────────────────────
  // torzsi is AWP (not Jimpphat), Brollan is IGL/captain
  {team:"MOUZ",name:"Brollan",role:"IGL",aim:72,gameSense:82,util:78,igl:79,mentality:83,consistency:68,traits:["leader"],salary:16,contract:3,age:22,era:"current"},
  {team:"MOUZ",name:"torzsi",role:"AWP",aim:86,gameSense:83,util:75,igl:55,mentality:80,consistency:68,traits:["boom"],salary:16,contract:2,age:23,era:"current"},
  {team:"MOUZ",name:"xertioN",role:"Entry",aim:84,gameSense:81,util:78,igl:52,mentality:83,consistency:75,traits:[],salary:16,contract:3,age:19,era:"current"},
  {team:"MOUZ",name:"Jimpphat",role:"Lurk",aim:81,gameSense:78,util:73,igl:58,mentality:78,consistency:65,traits:["boom"],salary:14,contract:2,age:18,era:"current"},
  {team:"MOUZ",name:"sdy",role:"Support",aim:70,gameSense:76,util:81,igl:57,mentality:75,consistency:70,traits:[],salary:11,contract:2,age:24,era:"current"},
  // ── NAVI ─────────────────────────────────────────────────────────────
  // Aleksib IGL, w0nderful AWP, b1t is rifler/entry (not AWP!)
  {team:"NAVI",name:"Aleksib",role:"IGL",aim:66,gameSense:84,util:78,igl:85,mentality:84,consistency:68,traits:["leader"],salary:17,contract:3,age:28,era:"current"},
  {team:"NAVI",name:"w0nderful",role:"AWP",aim:83,gameSense:82,util:78,igl:58,mentality:80,consistency:73,traits:[],salary:15,contract:2,age:20,era:"current"},
  {team:"NAVI",name:"b1t",role:"Entry",aim:90,gameSense:84,util:73,igl:55,mentality:80,consistency:83,traits:["boom"],salary:18,contract:2,age:22,era:"current"},
  {team:"NAVI",name:"jL",role:"Lurk",aim:81,gameSense:79,util:75,igl:58,mentality:75,consistency:68,traits:[],salary:14,contract:2,age:23,era:"current"},
  {team:"NAVI",name:"iM",role:"Support",aim:75,gameSense:78,util:90,igl:58,mentality:76,consistency:77,traits:[],salary:13,contract:3,age:25,era:"current"},
  // ── FURIA ─────────────────────────────────────────────────────────────
  // FalleN is IGL/AWP legend (NOT entry!), KSCERATO is the star rifler, YEKINDAR is aggressive entry
  {team:"FURIA",name:"FalleN",role:"IGL",aim:80,gameSense:87,util:81,igl:90,mentality:90,consistency:75,traits:["leader","clutch"],salary:16,contract:3,age:33,era:"current"},
  {team:"FURIA",name:"KSCERATO",role:"Entry",aim:83,gameSense:83,util:81,igl:61,mentality:85,consistency:83,traits:["clutch"],salary:17,contract:3,age:26,era:"current"},
  {team:"FURIA",name:"yuurih",role:"Lurk",aim:81,gameSense:79,util:75,igl:48,mentality:81,consistency:73,traits:["boom"],salary:15,contract:2,age:25,era:"current"},
  {team:"FURIA",name:"molodoy",role:"Support",aim:73,gameSense:76,util:80,igl:47,mentality:76,consistency:75,traits:[],salary:13,contract:3,age:22,era:"current"},
  {team:"FURIA",name:"YEKINDAR",role:"Entry",aim:83,gameSense:83,util:80,igl:54,mentality:84,consistency:70,traits:["boom","clutch"],salary:17,contract:2,age:24,era:"current"},
  // ── Falcons ───────────────────────────────────────────────────────────
  {team:"Falcons",name:"TeSeS",role:"IGL",aim:68,gameSense:78,util:79,igl:80,mentality:84,consistency:80,traits:["leader"],salary:15,contract:3,age:26,era:"current"},
  {team:"Falcons",name:"kyxsan",role:"AWP",aim:85,gameSense:81,util:73,igl:52,mentality:81,consistency:68,traits:["boom"],salary:15,contract:2,age:25,era:"current"},
  {team:"Falcons",name:"nicoodoz",role:"Entry",aim:80,gameSense:76,util:73,igl:60,mentality:75,consistency:81,traits:[],salary:13,contract:2,age:25,era:"current"},
  {team:"Falcons",name:"flamie",role:"Lurk",aim:78,gameSense:76,util:75,igl:54,mentality:73,consistency:68,traits:[],salary:12,contract:2,age:28,era:"current"},
  {team:"Falcons",name:"Kaze",role:"Support",aim:71,gameSense:78,util:86,igl:60,mentality:78,consistency:65,traits:[],salary:12,contract:3,age:23,era:"current"},
  // ── Liquid ────────────────────────────────────────────────────────────
  // siuhy is IGL, Twistzz is entry fragger (not AWP!), NAF is veteran lurker (not IGL!)
  {team:"Liquid",name:"siuhy",role:"IGL",aim:71,gameSense:77,util:81,igl:80,mentality:80,consistency:83,traits:["leader"],salary:14,contract:3,age:24,era:"current"},
  {team:"Liquid",name:"Twistzz",role:"Entry",aim:86,gameSense:81,util:75,igl:57,mentality:84,consistency:78,traits:["clutch"],salary:17,contract:2,age:26,era:"current"},
  {team:"Liquid",name:"NAF",role:"Lurk",aim:80,gameSense:81,util:78,igl:65,mentality:80,consistency:86,traits:["leader"],salary:16,contract:3,age:28,era:"current"},
  {team:"Liquid",name:"ultimate",role:"AWP",aim:81,gameSense:78,util:75,igl:55,mentality:76,consistency:65,traits:["boom"],salary:14,contract:2,age:21,era:"current"},
  {team:"Liquid",name:"NertZ",role:"Support",aim:78,gameSense:73,util:73,igl:61,mentality:72,consistency:80,traits:[],salary:12,contract:2,age:24,era:"current"},
  // ── Astralis ──────────────────────────────────────────────────────────
  // device is AWP legend (not IGL!), stavn is rifler (not AWP)
  {team:"Astralis",name:"Malb",role:"IGL",aim:68,gameSense:76,util:76,igl:81,mentality:76,consistency:68,traits:["leader"],salary:13,contract:3,age:26,era:"current"},
  {team:"Astralis",name:"device",role:"AWP",aim:84,gameSense:87,util:83,igl:71,mentality:99,consistency:78,traits:["clutch"],salary:20,contract:2,age:30,era:"current"},
  {team:"Astralis",name:"stavn",role:"Entry",aim:81,gameSense:77,util:73,igl:58,mentality:75,consistency:83,traits:[],salary:14,contract:2,age:23,era:"current"},
  {team:"Astralis",name:"jabbi",role:"Entry",aim:83,gameSense:73,util:73,igl:60,mentality:70,consistency:84,traits:[],salary:13,contract:2,age:22,era:"current"},
  {team:"Astralis",name:"Staehr",role:"Lurk",aim:80,gameSense:83,util:78,igl:48,mentality:80,consistency:61,traits:["boom"],salary:13,contract:2,age:21,era:"current"},
  // ── Heroic ────────────────────────────────────────────────────────────
  // SunPayus is AWP (not Lurk!)
  {team:"Heroic",name:"xfl0ud",role:"IGL",aim:68,gameSense:76,util:78,igl:79,mentality:83,consistency:61,traits:["leader","boom"],salary:13,contract:3,age:24,era:"current"},
  {team:"Heroic",name:"SunPayus",role:"AWP",aim:83,gameSense:78,util:73,igl:61,mentality:75,consistency:75,traits:[],salary:13,contract:2,age:25,era:"current"},
  {team:"Heroic",name:"yxngstxr",role:"Entry",aim:80,gameSense:76,util:70,igl:60,mentality:70,consistency:70,traits:[],salary:12,contract:2,age:22,era:"current"},
  {team:"Heroic",name:"tN1R",role:"Lurk",aim:75,gameSense:73,util:71,igl:52,mentality:68,consistency:76,traits:[],salary:11,contract:2,age:23,era:"current"},
  {team:"Heroic",name:"kyuubii",role:"Support",aim:73,gameSense:75,util:84,igl:51,mentality:78,consistency:86,traits:[],salary:12,contract:3,age:22,era:"current"},
  // ── Complexity ────────────────────────────────────────────────────────
  {team:"Complexity",name:"JT",role:"IGL",aim:63,gameSense:71,util:73,igl:83,mentality:77,consistency:65,traits:["leader","boom"],salary:12,contract:3,age:28,era:"current"},
  {team:"Complexity",name:"hallzerk",role:"AWP",aim:80,gameSense:75,util:65,igl:55,mentality:74,consistency:63,traits:["boom"],salary:11,contract:2,age:24,era:"current"},
  {team:"Complexity",name:"Grim",role:"Entry",aim:78,gameSense:71,util:68,igl:61,mentality:69,consistency:63,traits:["boom"],salary:10,contract:2,age:25,era:"current"},
  {team:"Complexity",name:"EliGE",role:"Lurk",aim:76,gameSense:79,util:76,igl:60,mentality:75,consistency:71,traits:[],salary:12,contract:2,age:27,era:"current"},
  {team:"Complexity",name:"Cybermaniac",role:"Support",aim:68,gameSense:75,util:83,igl:58,mentality:76,consistency:68,traits:[],salary:11,contract:3,age:24,era:"current"},
  // ── paiN ─────────────────────────────────────────────────────────────
  {team:"paiN",name:"dav1deuS",role:"IGL",aim:66,gameSense:75,util:72,igl:77,mentality:81,consistency:86,traits:["leader"],salary:13,contract:3,age:27,era:"current"},
  {team:"paiN",name:"biguzera",role:"AWP",aim:80,gameSense:75,util:70,igl:56,mentality:72,consistency:61,traits:["boom"],salary:11,contract:2,age:22,era:"current"},
  {team:"paiN",name:"snow",role:"Entry",aim:81,gameSense:70,util:72,igl:58,mentality:71,consistency:66,traits:["boom"],salary:11,contract:2,age:24,era:"current"},
  {team:"paiN",name:"dgt",role:"Lurk",aim:78,gameSense:80,util:73,igl:65,mentality:73,consistency:81,traits:[],salary:12,contract:2,age:23,era:"current"},
  {team:"paiN",name:"nqz",role:"Support",aim:68,gameSense:75,util:80,igl:55,mentality:75,consistency:86,traits:[],salary:11,contract:3,age:26,era:"current"},
  // ── 3DMAX ─────────────────────────────────────────────────────────────
  // Maka is real IGL for 3DMAX, Lucky is AWP
  {team:"3DMAX",name:"Maka",role:"IGL",aim:68,gameSense:78,util:71,igl:83,mentality:78,consistency:63,traits:["leader","boom"],salary:14,contract:3,age:27,era:"current"},
  {team:"3DMAX",name:"Lucky",role:"AWP",aim:81,gameSense:73,util:68,igl:50,mentality:73,consistency:65,traits:["boom"],salary:12,contract:2,age:26,era:"current"},
  {team:"3DMAX",name:"Djoko",role:"Entry",aim:78,gameSense:71,util:70,igl:63,mentality:71,consistency:83,traits:[],salary:12,contract:2,age:29,era:"current"},
  {team:"3DMAX",name:"Graviti",role:"Lurk",aim:73,gameSense:76,util:71,igl:63,mentality:75,consistency:81,traits:[],salary:12,contract:2,age:24,era:"current"},
  {team:"3DMAX",name:"ALEX",role:"Support",aim:65,gameSense:71,util:75,igl:50,mentality:70,consistency:86,traits:[],salary:10,contract:3,age:30,era:"current"},
  // ── GamerLegion ───────────────────────────────────────────────────────
  {team:"GamerLegion",name:"tiziaN",role:"IGL",aim:65,gameSense:73,util:73,igl:80,mentality:73,consistency:75,traits:["leader"],salary:11,contract:3,age:26,era:"current"},
  {team:"GamerLegion",name:"Tauson",role:"AWP",aim:76,gameSense:76,util:65,igl:53,mentality:73,consistency:83,traits:[],salary:11,contract:2,age:22,era:"current"},
  {team:"GamerLegion",name:"ztr",role:"Entry",aim:78,gameSense:73,util:66,igl:60,mentality:70,consistency:63,traits:["boom"],salary:10,contract:2,age:21,era:"current"},
  {team:"GamerLegion",name:"spooke",role:"Lurk",aim:75,gameSense:75,util:70,igl:48,mentality:75,consistency:65,traits:[],salary:10,contract:2,age:23,era:"current"},
  {team:"GamerLegion",name:"Kursy",role:"Support",aim:68,gameSense:73,util:80,igl:53,mentality:71,consistency:78,traits:[],salary:10,contract:3,age:24,era:"current"},
  // ── Eternal Fire ─────────────────────────────────────────────────────
  // Turkish superteam; woxic is one of the most mechanical AWPs ever but wildly inconsistent
  {team:"Eternal Fire",name:"imoRR",role:"IGL",aim:69,gameSense:79,util:76,igl:80,mentality:79,consistency:71,traits:["leader"],salary:14,contract:3,age:23,era:"current"},
  {team:"Eternal Fire",name:"woxic",role:"AWP",aim:90,gameSense:80,util:69,igl:50,mentality:73,consistency:57,traits:["boom","clutch"],salary:17,contract:2,age:25,era:"current"},
  {team:"Eternal Fire",name:"XANTARES",role:"Entry",aim:87,gameSense:76,util:68,igl:47,mentality:75,consistency:61,traits:["boom"],salary:15,contract:2,age:27,era:"current"},
  {team:"Eternal Fire",name:"Calyx",role:"Lurk",aim:83,gameSense:80,util:73,igl:52,mentality:77,consistency:70,traits:[],salary:14,contract:2,age:26,era:"current"},
  {team:"Eternal Fire",name:"paz",role:"Support",aim:71,gameSense:76,util:81,igl:57,mentality:76,consistency:73,traits:[],salary:12,contract:3,age:24,era:"current"},
  // ── TheMongolz ───────────────────────────────────────────────────────
  // Rising Mongolian force, genuine Major contenders; buster is an elite entry fragger
  {team:"TheMongolz",name:"Techno",role:"IGL",aim:71,gameSense:80,util:78,igl:80,mentality:81,consistency:76,traits:["leader"],salary:14,contract:3,age:25,era:"current"},
  {team:"TheMongolz",name:"Senzu",role:"AWP",aim:84,gameSense:78,util:70,igl:52,mentality:75,consistency:66,traits:["boom"],salary:14,contract:2,age:22,era:"current"},
  {team:"TheMongolz",name:"buster",role:"Entry",aim:84,gameSense:77,util:74,igl:53,mentality:79,consistency:70,traits:["boom","clutch"],salary:15,contract:3,age:23,era:"current"},
  {team:"TheMongolz",name:"ark",role:"Entry",aim:80,gameSense:74,util:71,igl:50,mentality:75,consistency:68,traits:["boom"],salary:12,contract:2,age:22,era:"current"},
  {team:"TheMongolz",name:"mzinho",role:"Lurk",aim:78,gameSense:76,util:72,igl:55,mentality:74,consistency:65,traits:[],salary:12,contract:2,age:25,era:"current"},
  // ── NIP ──────────────────────────────────────────────────────────────
  // Swedish legend org; hampus is a crafty IGL, headtr1ck the young AWP hope
  {team:"NIP",name:"hampus",role:"IGL",aim:71,gameSense:77,util:75,igl:80,mentality:78,consistency:71,traits:["leader"],salary:14,contract:3,age:26,era:"current"},
  {team:"NIP",name:"headtr1ck",role:"AWP",aim:81,gameSense:75,util:67,igl:49,mentality:72,consistency:65,traits:["boom"],salary:13,contract:2,age:22,era:"current"},
  {team:"NIP",name:"Plopski",role:"Entry",aim:80,gameSense:74,util:69,igl:50,mentality:71,consistency:71,traits:[],salary:12,contract:2,age:25,era:"current"},
  {team:"NIP",name:"maxster",role:"Lurk",aim:76,gameSense:72,util:67,igl:47,mentality:69,consistency:61,traits:["boom"],salary:11,contract:2,age:21,era:"current"},
  {team:"NIP",name:"l00m1natii",role:"Support",aim:68,gameSense:71,util:80,igl:52,mentality:73,consistency:75,traits:[],salary:10,contract:3,age:23,era:"current"},
  // ── Cloud9 ────────────────────────────────────────────────────────────
  // CIS/International superteam roster; Ax1Le is a mechanical monster, HObbit veteran
  {team:"Cloud9",name:"interz",role:"IGL",aim:67,gameSense:77,util:75,igl:80,mentality:77,consistency:68,traits:["leader"],salary:14,contract:3,age:27,era:"current"},
  {team:"Cloud9",name:"degster",role:"AWP",aim:83,gameSense:77,util:67,igl:48,mentality:72,consistency:61,traits:["boom"],salary:14,contract:2,age:24,era:"current"},
  {team:"Cloud9",name:"Ax1Le",role:"Entry",aim:84,gameSense:79,util:72,igl:51,mentality:77,consistency:66,traits:["boom","clutch"],salary:16,contract:3,age:25,era:"current"},
  {team:"Cloud9",name:"HObbit",role:"Lurk",aim:76,gameSense:80,util:75,igl:58,mentality:79,consistency:76,traits:[],salary:14,contract:2,age:28,era:"current"},
  {team:"Cloud9",name:"n0rb3r7",role:"Support",aim:70,gameSense:73,util:78,igl:53,mentality:71,consistency:66,traits:[],salary:11,contract:2,age:23,era:"current"},
  // ── Virtus.pro ───────────────────────────────────────────────────────
  // Russian powerhouse; Jame famous for deliberate time-wasting AWP style
  {team:"Virtus.pro",name:"fame",role:"IGL",aim:68,gameSense:76,util:75,igl:80,mentality:77,consistency:69,traits:["leader"],salary:13,contract:3,age:25,era:"current"},
  {team:"Virtus.pro",name:"Jame",role:"AWP",aim:81,gameSense:81,util:71,igl:76,mentality:83,consistency:71,traits:["leader","clutch"],salary:16,contract:2,age:27,era:"current"},
  {team:"Virtus.pro",name:"FL1T",role:"Entry",aim:82,gameSense:76,util:71,igl:50,mentality:75,consistency:65,traits:["boom"],salary:13,contract:2,age:24,era:"current"},
  {team:"Virtus.pro",name:"qikert",role:"Lurk",aim:77,gameSense:75,util:70,igl:52,mentality:73,consistency:65,traits:[],salary:11,contract:2,age:25,era:"current"},
  {team:"Virtus.pro",name:"SANJI",role:"Support",aim:70,gameSense:75,util:80,igl:55,mentality:75,consistency:71,traits:[],salary:12,contract:3,age:26,era:"current"},
  // ── ENCE ─────────────────────────────────────────────────────────────
  // Finnish org; Snappi is a veteran IGL, dycha a flashy Polish AWPer
  {team:"ENCE",name:"Snappi",role:"IGL",aim:70,gameSense:78,util:78,igl:81,mentality:80,consistency:72,traits:["leader"],salary:13,contract:3,age:28,era:"current"},
  {team:"ENCE",name:"dycha",role:"AWP",aim:83,gameSense:74,util:66,igl:47,mentality:70,consistency:58,traits:["boom"],salary:13,contract:2,age:26,era:"current"},
  {team:"ENCE",name:"HENU",role:"Entry",aim:79,gameSense:72,util:67,igl:51,mentality:70,consistency:66,traits:["boom"],salary:11,contract:2,age:23,era:"current"},
  {team:"ENCE",name:"hades",role:"Lurk",aim:76,gameSense:75,util:71,igl:52,mentality:72,consistency:68,traits:[],salary:11,contract:2,age:24,era:"current"},
  {team:"ENCE",name:"O'Sullivan",role:"Support",aim:69,gameSense:72,util:79,igl:50,mentality:74,consistency:74,traits:[],salary:10,contract:3,age:25,era:"current"},
  // ── BIG ──────────────────────────────────────────────────────────────
  // German org; syrson is a streaky rifler/AWPer, faveN solid entry
  {team:"BIG",name:"prosus",role:"IGL",aim:66,gameSense:75,util:75,igl:80,mentality:75,consistency:68,traits:["leader"],salary:12,contract:3,age:24,era:"current"},
  {team:"BIG",name:"syrson",role:"AWP",aim:81,gameSense:74,util:65,igl:45,mentality:69,consistency:58,traits:["boom"],salary:12,contract:2,age:27,era:"current"},
  {team:"BIG",name:"faveN",role:"Entry",aim:77,gameSense:71,util:69,igl:52,mentality:67,consistency:68,traits:[],salary:11,contract:2,age:25,era:"current"},
  {team:"BIG",name:"k1to",role:"Lurk",aim:74,gameSense:71,util:69,igl:48,mentality:67,consistency:70,traits:[],salary:10,contract:2,age:24,era:"current"},
  {team:"BIG",name:"krimbo",role:"Support",aim:67,gameSense:71,util:77,igl:50,mentality:72,consistency:73,traits:[],salary:10,contract:3,age:23,era:"current"},
  // ── Fnatic ───────────────────────────────────────────────────────────
  // Swedish legend brand rebuilding; FASHR emerging AWP talent
  {team:"Fnatic",name:"roeJ",role:"IGL",aim:70,gameSense:75,util:76,igl:79,mentality:77,consistency:71,traits:["leader"],salary:12,contract:3,age:27,era:"current"},
  {team:"Fnatic",name:"FASHR",role:"AWP",aim:80,gameSense:73,util:66,igl:47,mentality:69,consistency:60,traits:["boom"],salary:12,contract:2,age:21,era:"current"},
  {team:"Fnatic",name:"Sulya",role:"Entry",aim:78,gameSense:71,util:67,igl:50,mentality:70,consistency:66,traits:["boom"],salary:11,contract:2,age:22,era:"current"},
  {team:"Fnatic",name:"afro",role:"Lurk",aim:73,gameSense:71,util:69,igl:46,mentality:69,consistency:66,traits:[],salary:10,contract:2,age:24,era:"current"},
  {team:"Fnatic",name:"EC1S",role:"Support",aim:66,gameSense:71,util:78,igl:53,mentality:72,consistency:73,traits:[],salary:10,contract:3,age:26,era:"current"},
  // ── OG ───────────────────────────────────────────────────────────────
  // European org with mix of veterans; nexa crafty lurker-fragger
  {team:"OG",name:"niko",role:"IGL",aim:69,gameSense:75,util:73,igl:79,mentality:75,consistency:67,traits:["leader"],salary:12,contract:3,age:26,era:"current"},
  {team:"OG",name:"F1KU",role:"AWP",aim:79,gameSense:71,util:64,igl:43,mentality:66,consistency:57,traits:["boom"],salary:11,contract:2,age:22,era:"current"},
  {team:"OG",name:"nexa",role:"Lurk",aim:73,gameSense:76,util:73,igl:65,mentality:75,consistency:66,traits:[],salary:11,contract:2,age:28,era:"current"},
  {team:"OG",name:"Maden",role:"Entry",aim:78,gameSense:72,util:69,igl:52,mentality:70,consistency:66,traits:["boom"],salary:11,contract:2,age:25,era:"current"},
  {team:"OG",name:"Flammie",role:"Support",aim:67,gameSense:70,util:76,igl:48,mentality:68,consistency:71,traits:[],salary:9,contract:3,age:22,era:"current"},
  // ── MIBR ─────────────────────────────────────────────────────────────
  // Brazilian legend org; drop and Insani are young guns, exit veteran IGL
  {team:"MIBR",name:"exit",role:"IGL",aim:65,gameSense:73,util:71,igl:78,mentality:76,consistency:70,traits:["leader"],salary:12,contract:3,age:27,era:"current"},
  {team:"MIBR",name:"chelo",role:"AWP",aim:79,gameSense:71,util:65,igl:43,mentality:67,consistency:58,traits:["boom"],salary:11,contract:2,age:26,era:"current"},
  {team:"MIBR",name:"drop",role:"Entry",aim:78,gameSense:69,util:66,igl:48,mentality:69,consistency:65,traits:["boom"],salary:11,contract:2,age:22,era:"current"},
  {team:"MIBR",name:"Insani",role:"Entry",aim:80,gameSense:69,util:66,igl:47,mentality:67,consistency:61,traits:["boom"],salary:11,contract:2,age:21,era:"current"},
  {team:"MIBR",name:"brnz4n",role:"Support",aim:66,gameSense:69,util:75,igl:52,mentality:67,consistency:71,traits:[],salary:9,contract:3,age:23,era:"current"},
  // ── Imperial ─────────────────────────────────────────────────────────
  // Brazilian squad; felps veteran lurker, HEN1 AWP
  {team:"Imperial",name:"decenty",role:"IGL",aim:67,gameSense:73,util:71,igl:79,mentality:75,consistency:68,traits:["leader"],salary:12,contract:3,age:25,era:"current"},
  {team:"Imperial",name:"HEN1",role:"AWP",aim:80,gameSense:72,util:66,igl:45,mentality:68,consistency:60,traits:["boom","clutch"],salary:12,contract:2,age:28,era:"current"},
  {team:"Imperial",name:"JOTA",role:"Entry",aim:78,gameSense:70,util:67,igl:48,mentality:69,consistency:66,traits:["boom"],salary:11,contract:2,age:24,era:"current"},
  {team:"Imperial",name:"felps",role:"Lurk",aim:76,gameSense:75,util:71,igl:57,mentality:71,consistency:66,traits:["clutch"],salary:11,contract:2,age:29,era:"current"},
  {team:"Imperial",name:"boltz",role:"Support",aim:68,gameSense:70,util:75,igl:52,mentality:70,consistency:71,traits:[],salary:9,contract:3,age:28,era:"current"},
  // ── Monte ─────────────────────────────────────────────────────────────
  // CIS/Ukrainian team; SELLTER aggressive entry, 255 tactical IGL
  {team:"Monte",name:"255",role:"IGL",aim:66,gameSense:74,util:73,igl:78,mentality:75,consistency:67,traits:["leader"],salary:11,contract:3,age:24,era:"current"},
  {team:"Monte",name:"Sdaim",role:"AWP",aim:78,gameSense:72,util:65,igl:45,mentality:70,consistency:60,traits:["boom"],salary:11,contract:2,age:23,era:"current"},
  {team:"Monte",name:"SELLTER",role:"Entry",aim:79,gameSense:70,util:66,igl:47,mentality:69,consistency:63,traits:["boom"],salary:11,contract:2,age:22,era:"current"},
  {team:"Monte",name:"relaxa",role:"Lurk",aim:73,gameSense:71,util:68,igl:45,mentality:67,consistency:65,traits:[],salary:9,contract:2,age:23,era:"current"},
  {team:"Monte",name:"cynic",role:"Support",aim:65,gameSense:70,util:75,igl:50,mentality:68,consistency:70,traits:[],salary:9,contract:3,age:22,era:"current"},
  // ── Lynn Vision ──────────────────────────────────────────────────────
  // Chinese team; Westmelon is a star AWPer, EmiliaQAQ mechanical fragger
  {team:"Lynn Vision",name:"Mercury",role:"IGL",aim:66,gameSense:73,util:72,igl:78,mentality:75,consistency:66,traits:["leader"],salary:10,contract:3,age:25,era:"current"},
  {team:"Lynn Vision",name:"Westmelon",role:"AWP",aim:81,gameSense:75,util:65,igl:45,mentality:70,consistency:63,traits:["boom"],salary:12,contract:2,age:23,era:"current"},
  {team:"Lynn Vision",name:"EmiliaQAQ",role:"Entry",aim:80,gameSense:69,util:65,igl:47,mentality:66,consistency:60,traits:["boom"],salary:11,contract:2,age:22,era:"current"},
  {team:"Lynn Vision",name:"Aaron",role:"Lurk",aim:71,gameSense:70,util:68,igl:48,mentality:66,consistency:65,traits:[],salary:9,contract:2,age:24,era:"current"},
  {team:"Lynn Vision",name:"reck",role:"Support",aim:64,gameSense:68,util:74,igl:48,mentality:66,consistency:68,traits:[],salary:8,contract:3,age:22,era:"current"},
  // ── Apeks ─────────────────────────────────────────────────────────────
  // Norwegian team; Kylar rising AWP star, MICHU veteran IGL
  {team:"Apeks",name:"MICHU",role:"IGL",aim:68,gameSense:74,util:73,igl:79,mentality:75,consistency:68,traits:["leader"],salary:11,contract:3,age:28,era:"current"},
  {team:"Apeks",name:"Kylar",role:"AWP",aim:80,gameSense:73,util:65,igl:45,mentality:68,consistency:61,traits:["boom"],salary:12,contract:2,age:22,era:"current"},
  {team:"Apeks",name:"REDSTAR",role:"Entry",aim:76,gameSense:69,util:65,igl:48,mentality:66,consistency:63,traits:["boom"],salary:10,contract:2,age:23,era:"current"},
  {team:"Apeks",name:"nerz",role:"Lurk",aim:71,gameSense:70,util:66,igl:45,mentality:66,consistency:61,traits:[],salary:8,contract:2,age:22,era:"current"},
  {team:"Apeks",name:"Cobra",role:"Support",aim:63,gameSense:68,util:73,igl:48,mentality:66,consistency:66,traits:[],salary:8,contract:3,age:23,era:"current"},
  // ── SAW ───────────────────────────────────────────────────────────────
  // Portuguese team punching above weight; ewjerkz mechanical fragger
  {team:"SAW",name:"arrozdoce",role:"IGL",aim:66,gameSense:73,util:71,igl:78,mentality:74,consistency:68,traits:["leader"],salary:11,contract:3,age:24,era:"current"},
  {team:"SAW",name:"just1ce",role:"AWP",aim:80,gameSense:72,util:64,igl:43,mentality:67,consistency:60,traits:["boom"],salary:11,contract:2,age:24,era:"current"},
  {team:"SAW",name:"ewjerkz",role:"Entry",aim:81,gameSense:71,util:67,igl:47,mentality:70,consistency:65,traits:["boom","clutch"],salary:13,contract:2,age:23,era:"current"},
  {team:"SAW",name:"story",role:"Lurk",aim:71,gameSense:70,util:66,igl:45,mentality:66,consistency:63,traits:[],salary:9,contract:2,age:22,era:"current"},
  {team:"SAW",name:"MUTiRiS",role:"Support",aim:64,gameSense:68,util:73,igl:48,mentality:66,consistency:65,traits:[],salary:8,contract:3,age:23,era:"current"},
  // ── Wildcard ──────────────────────────────────────────────────────────
  // NA/International roster; k0nfig elite mechanical entry, Swisher crafty NA IGL
  {team:"Wildcard",name:"Swisher",role:"IGL",aim:69,gameSense:74,util:73,igl:78,mentality:75,consistency:68,traits:["leader"],salary:11,contract:3,age:26,era:"current"},
  {team:"Wildcard",name:"cxzi",role:"AWP",aim:80,gameSense:72,util:64,igl:43,mentality:67,consistency:60,traits:["boom"],salary:11,contract:2,age:23,era:"current"},
  {team:"Wildcard",name:"k0nfig",role:"Entry",aim:84,gameSense:77,util:70,igl:50,mentality:74,consistency:65,traits:["boom","clutch"],salary:14,contract:2,age:27,era:"current"},
  {team:"Wildcard",name:"WolfY",role:"Lurk",aim:74,gameSense:72,util:69,igl:48,mentality:68,consistency:66,traits:[],salary:10,contract:2,age:25,era:"current"},
  {team:"Wildcard",name:"slaxz-",role:"Support",aim:65,gameSense:69,util:75,igl:50,mentality:68,consistency:68,traits:[],salary:9,contract:3,age:24,era:"current"},
  // ── Free Agents (current era) ─────────────────────────────────────────
  {team:"FA",name:"tabseN",role:"IGL",aim:70,gameSense:73,util:71,igl:80,mentality:76,consistency:73,traits:["leader"],salary:12,contract:0,age:29,era:"current"},
  {team:"FA",name:"AcoR",role:"AWP",aim:84,gameSense:74,util:66,igl:46,mentality:68,consistency:60,traits:["boom"],salary:11,contract:0,age:25,era:"current"},
  {team:"FA",name:"JDC",role:"Entry",aim:80,gameSense:72,util:69,igl:51,mentality:73,consistency:84,traits:[],salary:11,contract:0,age:22,era:"current"},
  {team:"FA",name:"refrezh",role:"Entry",aim:82,gameSense:78,util:73,igl:54,mentality:75,consistency:71,traits:["clutch"],salary:12,contract:0,age:27,era:"current"},
  {team:"FA",name:"valde",role:"Lurk",aim:80,gameSense:83,util:78,igl:68,mentality:80,consistency:76,traits:[],salary:14,contract:0,age:29,era:"current"},
  {team:"FA",name:"Magisk",role:"Support",aim:77,gameSense:84,util:85,igl:73,mentality:85,consistency:81,traits:["leader"],salary:16,contract:0,age:29,era:"current"},
  {team:"FA",name:"es3tag",role:"Support",aim:75,gameSense:77,util:84,igl:59,mentality:78,consistency:80,traits:[],salary:12,contract:0,age:28,era:"current"},
  {team:"FA",name:"Boombl4",role:"IGL",aim:68,gameSense:80,util:77,igl:84,mentality:79,consistency:66,traits:["leader"],salary:13,contract:0,age:26,era:"current"},
  {team:"FA",name:"nbk",role:"Support",aim:71,gameSense:82,util:84,igl:71,mentality:84,consistency:78,traits:["leader"],salary:14,contract:0,age:31,era:"current"},
  {team:"FA",name:"poizon",role:"AWP",aim:85,gameSense:76,util:68,igl:45,mentality:71,consistency:62,traits:["boom"],salary:12,contract:0,age:25,era:"current"},
  {team:"FA",name:"hyped",role:"Lurk",aim:71,gameSense:78,util:70,igl:55,mentality:71,consistency:65,traits:["boom"],salary:10,contract:0,age:21,era:"current"},
  {team:"FA",name:"REZ",role:"Entry",aim:80,gameSense:76,util:71,igl:53,mentality:75,consistency:73,traits:["boom"],salary:12,contract:0,age:27,era:"current"},
  {team:"FA",name:"kjaerbye",role:"Entry",aim:80,gameSense:74,util:69,igl:48,mentality:67,consistency:58,traits:["boom"],salary:10,contract:0,age:28,era:"current"},
  {team:"FA",name:"RUSH",role:"Lurk",aim:75,gameSense:75,util:73,igl:52,mentality:76,consistency:75,traits:[],salary:10,contract:0,age:29,era:"current"},
  // ── 2018-2021 ERA ─────────────────────────────────────────────────────
  // s1mple: arguably the greatest player ever, peak ~1.35 HLTV rating
  {team:"FA",name:"s1mple★",role:"AWP",aim:99,gameSense:99,util:81,igl:66,mentality:99,consistency:68,traits:["clutch","boom"],salary:24,contract:0,age:22,era:"2018"},
  {team:"FA",name:"electronic★",role:"Entry",aim:93,gameSense:86,util:80,igl:54,mentality:85,consistency:76,traits:["clutch"],salary:19,contract:0,age:22,era:"2018"},
  // NiKo★ 2018 era — peak mechanical skill, one of the best aimers ever
  {team:"FA",name:"NiKo★",role:"Entry",aim:99,gameSense:93,util:81,igl:58,mentality:93,consistency:71,traits:["boom","clutch"],salary:22,contract:0,age:23,era:"2018"},
  // coldzera★ — 2x HLTV #1, godlike lurker
  {team:"FA",name:"coldzera★",role:"Lurk",aim:90,gameSense:99,util:84,igl:62,mentality:99,consistency:83,traits:["clutch"],salary:22,contract:0,age:24,era:"2018"},
  // dev1ce★ — most consistent AWP ever, 4x Major winner
  {team:"FA",name:"dev1ce★",role:"AWP",aim:87,gameSense:96,util:85,igl:75,mentality:99,consistency:93,traits:["leader","clutch"],salary:22,contract:0,age:25,era:"2018"},
  {team:"FA",name:"dupreeh★",role:"Entry",aim:85,gameSense:84,util:83,igl:58,mentality:87,consistency:81,traits:["clutch"],salary:18,contract:0,age:27,era:"2018"},
  // gla1ve★ — one of the greatest IGLs of all time, 2x Major winner
  {team:"FA",name:"gla1ve★",role:"IGL",aim:73,gameSense:96,util:87,igl:99,mentality:93,consistency:79,traits:["leader"],salary:19,contract:0,age:25,era:"2018"},
  // Xyp9x★ — "the clutch minister", support god
  {team:"FA",name:"Xyp9x★",role:"Support",aim:76,gameSense:90,util:93,igl:62,mentality:99,consistency:87,traits:["clutch"],salary:18,contract:0,age:25,era:"2018"},
  {team:"FA",name:"Twistzz★",role:"Entry",aim:93,gameSense:83,util:76,igl:50,mentality:83,consistency:81,traits:[],salary:17,contract:0,age:21,era:"2018"},
  {team:"FA",name:"EliGE★",role:"Entry",aim:87,gameSense:84,util:79,igl:60,mentality:81,consistency:79,traits:[],salary:17,contract:0,age:22,era:"2018"},
  {team:"FA",name:"ZywOo★",role:"AWP",aim:99,gameSense:96,util:83,igl:65,mentality:87,consistency:71,traits:["boom","clutch"],salary:21,contract:0,age:19,era:"2018"},
  {team:"FA",name:"Brehze★",role:"Lurk",aim:90,gameSense:83,util:76,igl:48,mentality:79,consistency:75,traits:["boom"],salary:16,contract:0,age:22,era:"2018"},
  {team:"FA",name:"NAF★",role:"Support",aim:83,gameSense:85,util:83,igl:66,mentality:84,consistency:83,traits:["leader"],salary:16,contract:0,age:23,era:"2018"},
  {team:"FA",name:"blameF★",role:"IGL",aim:81,gameSense:86,util:81,igl:87,mentality:83,consistency:76,traits:["leader"],salary:17,contract:0,age:24,era:"2018"},
  {team:"FA",name:"ropz★",role:"Lurk",aim:93,gameSense:87,util:79,igl:48,mentality:83,consistency:90,traits:[],salary:18,contract:0,age:21,era:"2018"},
  // ── 2015-2017 ERA ─────────────────────────────────────────────────────
  // olofmeister★ — fnatic's star entry/playmaker (the "olofboost", Overpass clutch)
  {team:"FA",name:"olofmeister★",role:"Entry",aim:90,gameSense:96,util:83,igl:66,mentality:99,consistency:75,traits:["clutch","leader"],salary:21,contract:0,age:24,era:"2015"},
  // flusha★ — fnatic's lurker with elite game sense (not a support)
  {team:"FA",name:"flusha★",role:"Lurk",aim:82,gameSense:99,util:87,igl:76,mentality:90,consistency:79,traits:["clutch"],salary:19,contract:0,age:23,era:"2015"},
  {team:"FA",name:"KRiMZ★",role:"Support",aim:83,gameSense:87,util:86,igl:54,mentality:90,consistency:84,traits:[],salary:18,contract:0,age:22,era:"2015"},
  // kennyS★ — peak: the most mechanical AWP ever, legendary flicks
  {team:"FA",name:"kennyS★",role:"AWP",aim:99,gameSense:83,util:68,igl:46,mentality:81,consistency:60,traits:["boom","clutch"],salary:20,contract:0,age:22,era:"2015"},
  {team:"FA",name:"GuardiaN★",role:"AWP",aim:93,gameSense:85,util:75,igl:54,mentality:84,consistency:73,traits:["clutch"],salary:18,contract:0,age:25,era:"2015"},
  {team:"FA",name:"shox★",role:"Entry",aim:93,gameSense:87,util:76,igl:73,mentality:83,consistency:62,traits:["boom","clutch"],salary:19,contract:0,age:24,era:"2015"},
  {team:"FA",name:"Happy★",role:"IGL",aim:76,gameSense:87,util:79,igl:90,mentality:81,consistency:66,traits:["leader"],salary:16,contract:0,age:25,era:"2015"},
  // FalleN★ — legendary AWPing IGL, 2x Major winner with LG/SK Gaming
  {team:"FA",name:"FalleN★",role:"IGL",aim:87,gameSense:93,util:83,igl:99,mentality:96,consistency:77,traits:["leader","clutch"],salary:21,contract:0,age:25,era:"2015"},
  {team:"FA",name:"fer★",role:"Entry",aim:87,gameSense:81,util:73,igl:46,mentality:84,consistency:60,traits:["boom"],salary:17,contract:0,age:24,era:"2015"},
  {team:"FA",name:"TACO★",role:"Support",aim:71,gameSense:81,util:85,igl:58,mentality:83,consistency:81,traits:[],salary:13,contract:0,age:24,era:"2015"},
  {team:"FA",name:"rain★",role:"Entry",aim:87,gameSense:81,util:76,igl:48,mentality:84,consistency:71,traits:["clutch"],salary:16,contract:0,age:22,era:"2015"},
  {team:"FA",name:"dennis★",role:"Entry",aim:86,gameSense:79,util:73,igl:54,mentality:79,consistency:68,traits:["boom"],salary:14,contract:0,age:23,era:"2015"},
  {team:"FA",name:"NBK★",role:"Support",aim:80,gameSense:84,util:84,igl:73,mentality:85,consistency:76,traits:["leader"],salary:16,contract:0,age:22,era:"2015"},
  // ── 2013-2014 LEGENDS ─────────────────────────────────────────────────
  // GeT_RiGhT★ — NiP legend, peak possibly the best player in CS history at the time
  {team:"FA",name:"GeT_RiGhT★",role:"Lurk",aim:90,gameSense:99,util:79,igl:58,mentality:93,consistency:81,traits:["clutch"],salary:20,contract:0,age:23,era:"2013"},
  {team:"FA",name:"f0rest★",role:"Entry",aim:93,gameSense:87,util:76,igl:54,mentality:85,consistency:76,traits:["clutch","boom"],salary:19,contract:0,age:25,era:"2013"},
  {team:"FA",name:"friberg★",role:"Entry",aim:81,gameSense:79,util:76,igl:50,mentality:83,consistency:75,traits:[],salary:13,contract:0,age:23,era:"2013"},
  // Xizt★ — NiP IGL for many years
  {team:"FA",name:"Xizt★",role:"IGL",aim:75,gameSense:83,util:79,igl:84,mentality:81,consistency:75,traits:["leader"],salary:14,contract:0,age:23,era:"2013"},
  // ScreaM★ — "the headshot machine", mechanical god
  {team:"FA",name:"ScreaM★",role:"Entry",aim:99,gameSense:75,util:66,igl:42,mentality:73,consistency:55,traits:["boom"],salary:16,contract:0,age:21,era:"2013"},
  {team:"FA",name:"JW★",role:"AWP",aim:85,gameSense:81,util:71,igl:48,mentality:83,consistency:60,traits:["boom","clutch"],salary:16,contract:0,age:20,era:"2013"},
  // pronax★ — tactical mastermind, invented many utility lineups, fnatic IGL
  {team:"FA",name:"pronax★",role:"IGL",aim:66,gameSense:87,util:81,igl:99,mentality:87,consistency:73,traits:["leader"],salary:15,contract:0,age:24,era:"2013"},
  // Snax★ — legendary VP lurker
  {team:"FA",name:"Snax★",role:"Lurk",aim:90,gameSense:85,util:76,igl:54,mentality:81,consistency:65,traits:["boom","clutch"],salary:17,contract:0,age:22,era:"2013"},
  {team:"FA",name:"pasha★",role:"Entry",aim:85,gameSense:76,util:73,igl:43,mentality:87,consistency:66,traits:["boom"],salary:15,contract:0,age:25,era:"2013"},
  // NEO★ — the greatest tactical player, VP IGL
  {team:"FA",name:"NEO★",role:"IGL",aim:80,gameSense:90,util:83,igl:93,mentality:87,consistency:75,traits:["leader","clutch"],salary:17,contract:0,age:27,era:"2013"},
  {team:"FA",name:"TaZ★",role:"Support",aim:75,gameSense:83,util:81,igl:71,mentality:90,consistency:76,traits:["leader"],salary:14,contract:0,age:27,era:"2013"},
  // markeloff★ — early CS:GO AWP god, NaVi legend
  {team:"FA",name:"markeloff★",role:"AWP",aim:87,gameSense:83,util:73,igl:50,mentality:79,consistency:68,traits:["clutch"],salary:16,contract:0,age:24,era:"2013"},
];

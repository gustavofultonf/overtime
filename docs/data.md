# Data Reference

## constants/data.js

### MAPS
```js
["Mirage","Inferno","Nuke","Ancient","Dust2","Anubis","Train"]
```

### AI_TEAMS (15 teams)
```js
["Vitality","Spirit","FaZe","G2","MOUZ","NAVI","FURIA","Falcons",
 "Liquid","Astralis","Heroic","Complexity","paiN","3DMAX","GamerLegion"]
```

### PLAYERS_INIT
130 players total across 4 eras. Each:
```js
{
  team: "Vitality" | "FA",  // FA = free agent
  name: string,             // legend suffix ★ for non-current era
  role: "IGL"|"AWP"|"Entry"|"Lurk"|"Support",
  aim, gameSense, util, igl, mentality, consistency,  // 0-99 base stats
  traits: ("clutch"|"boom"|"leader")[],
  salary: number,           // monthly $K (5-24 range after scaling)
  contract: number,         // events remaining (0=FA, 1=expiring, 2-3=healthy)
  age: number,
  era: "current"|"2018"|"2015"|"2013",
}
```
**Era counts:** current=90, 2018=15, 2015=13, 2013=12

**Duplicate handling:** When multiple eras active, ★ version wins over same-named current player (e.g. ZywOo★ replaces ZywOo). 9 players have cross-era duplicates.

## constants/events.js

### EVENTS (9 per season)
```js
{
  week: number,       // 1-52 (when it occurs)
  tier: "Major"|"A"|"B",
  label: string,
  location: string,
  teams: number,      // 16 for Major, 8 for A/B
  bo: number,         // base Bo for non-Swiss matches
  prize: {place: $K} // {1:500, 2:300, 4:180, 8:100, 12:50, 16:30} for Majors
}
```

2026 schedule:
| Week | Event | Tier |
|------|-------|------|
| 4 | DreamHack Open (Leipzig) | B |
| 7 | IEM Katowice | A |
| 13 | BLAST Bounty (Online) | B |
| 18 | PGL Shanghai Major | Major |
| 24 | ESL Challenger (Malta) | B |
| 30 | ESL Pro League S22 (Malta) | A |
| 35 | Elisa Masters (Helsinki) | B |
| 41 | BLAST Fall Major (Copenhagen) | Major |
| 48 | BLAST Premier Finals (Abu Dhabi) | A |

### ACTIVITIES
```js
{
  practice: { fatigue: 8 },   // +4 map proficiency on chosen map
  bootcamp: { fatigue: 15 },  // +1-2 all stats, affected by bootcamp_center tier
  scrim:    { fatigue: 10 },  // +form, +chemistry
  vod:      { fatigue: 5 },   // +gameSense, +util, affected by analytics tier
  scout:    { fatigue: 3 },   // records target team's map pool + roster
  rest:     { fatigue: -15 }, // fatigue recovery
  vacation: { fatigue: -30 }, // max recovery, +chemistry
}
```

### COACHES (5 available)
```js
{ name, bonus, salary, desc }
// bonus: "tactical"|"motivator"|"analyst"|"veteran"|"fitness"
// salary: monthly $K (deducted at payday)
```
Coach effect in applyActivity: tactical→gameSense+1 on bootcamp, motivator→chemistry+2 on scrim, analyst→mapProf+2 on practice, veteran→mentality+1 on bootcamp, fitness→fatigue recovery-5 on rest.

### FACILITIES
```js
{
  gaming_house:     { maxTier:3, cost:[200,400,800] },   // -2/-4/-6 fatigue per activity
  bootcamp_center:  { maxTier:3, cost:[150,350,700] },   // +1/+2/+3 stat gains from bootcamp
  psychologist:     { maxTier:2, cost:[250,500] },        // +1 composure on bootcamp
  analytics:        { maxTier:2, cost:[200,450] },        // +1/+2 gameSense from VOD
  content:          { maxTier:2, cost:[150,300] },        // +$15K/+$30K monthly income
  medbay:           { maxTier:2, cost:[200,400] },        // -5/-8 extra fatigue on rest
}
```
Stored as `season.facilities = { gaming_house: 0-3, ... }` (0 = not built).

## Revenue streams (paySalary, called monthly)

| Stream | Amount | Source |
|--------|--------|--------|
| Org stipend | $5-30K | World rank (#1-5: $30K, …, unranked: $5K) |
| Merchandise | $3-40K | World rank |
| Player streaming | varies | Sum of (playerOvr/20 + totalMvps*0.5) per player |
| Content studio | $0/$15/$30K | Facility tier 0/1/2 |
| Sponsorships | varies | Active deals monthly rate |

## Sponsorship object
```js
{
  brand: string,
  monthly: number,
  duration: number,     // months
  weeksLeft: number,    // countdown
  active: boolean,      // accepted and running
  offered: boolean,     // pending accept/decline
  condition: string,    // human-readable, e.g. "Stay top 10"
  checkRank: number,    // rank threshold or 99 for none
  checkWin: boolean,    // true if condition is "win an event"
  checkMajor: boolean,  // true if condition is "make a Major"
}
```

## Major qualification (checkWeekTransition)
- **Rank 1-8** → Legends: auto-qualify, sticker money = `$40 + (17-rank)*5`K
- **Rank 9-16** → Challengers: qualify, sticker money = `$15 + (17-rank)*2`K  
- **Rank 17+** → DNQ: Major simmed without user, logged as news

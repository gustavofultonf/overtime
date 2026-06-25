# How-To Guide

Common tasks for AI contributors. Always check which module owns each concern before editing.

## Add a new player

Edit `src/constants/data.js`, append to `PLAYERS_INIT`:
```js
{
  team:"FA", name:"playerName", role:"Entry",
  aim:85, gameSense:82, util:75, igl:45, mentality:88, consistency:80,
  traits:["clutch"],
  salary:14, contract:0, age:22, era:"current",
  // Note: rifle/pistol/awp/clutch/entry/stamina/composure/experience
  // are DERIVED at initState from base stats — don't set them here
}
```
Era legend players use `era:"2018"|"2015"|"2013"` and `name:"Name★"`.

## Add a new event

Edit `src/constants/events.js`, add to `EVENTS` array:
```js
{week:15, tier:"A", label:"New Event", location:"City", teams:8, bo:3,
 prize:{1:200, 2:100, 3:50, 4:30, 5:15}}
```
Weeks must be 1-52 and not conflict with existing events. Prize keys are placement numbers.

## Add a new activity

1. `src/constants/events.js` → add to `ACTIVITIES`:
```js
newActivity: { label:"new activity", desc:"what it does", fatigue:10, icon:"x" }
```

2. `src/engine/match.js` → add case in `applyActivity`:
```js
} else if(activity==="newActivity"){
  roster.forEach(p=>{ /* mutate stats */ });
```

3. `src/ui/CalendarView.jsx` → the activity button renders automatically from ACTIVITIES.
   Add any extra picker UI (like scout's team picker) after the practice map picker block.

## Add a new facility

1. `src/constants/events.js` → add to `FACILITIES`:
```js
newFacility: { name:"Name", icon:"x", maxTier:2, cost:[200,400],
  desc:["Tier 1 effect","Tier 2 effect"] }
```

2. `src/engine/match.js` in `applyActivity` — read facility tier and apply bonus:
```js
const newFacTier = fac.new_facility || 0;
// use newFacTier in appropriate activity branch
```

3. UI renders automatically in `FacilitiesView.jsx` — no UI change needed.

## Add a new revenue stream

Edit `paySalary` function in `src/App.jsx`:
```js
const newIncome = calculateNewIncome(season, myTeam);
const totalIncome = contentIncome + merchIncome + stipendIncome + streamIncome + sponsorIncome + newIncome;
// Also update the income breakdown bar (parts.push(...))
```

## Add a new random event

Edit `RANDOM_EVENTS` in `src/constants/events.js`:
```js
{
  id:"uniqueId",
  text:"Display text",
  weight:5,                    // relative probability (nothing=20, rare=2-4)
  apply:(state, team, rng) => {
    // mutate state, return log string or null
    return "log message";
  }
}
```

## Change tournament format

All tournament logic is in `src/engine/tournament.js`.
- Swiss thresholds: `newSwiss._advanceAt` and `._elimAt` (default 3/3 for Major, set to 2/2 for mini)
- Advance count: `t.advanceCount` (8 for Major, 4 for A/B)
- Playoff depth: `seedPlayoff(advancers, bo3, bo5Final)` — length of advancers drives QF/SF/Final

## Add a new UI tab (calendar phase)

1. `src/ui/Header.jsx` in `Tabs` component, add to calMode items array:
```js
["newTab","NEW TAB"]
```

2. `src/App.jsx` in the calendar phase render block:
```jsx
{tab==="newTab"&&<NewTabView season={season} myTeam={myTeam}/>}
```

3. Create `src/ui/NewTabView.jsx` with named export `NewTabView`.

## Debug a match result

In `src/engine/match.js`, `resolveMap` returns:
```js
{winnerName, loserName, score:[a,b], rounds:[...], mvp, mvpStats, recap}
```
Each round has `{round, winner, btA, btB, narrative, isClutch, isEcoUpset, isAce}`.

To see raw probability: log `pA` after `Math.max(0.05, Math.min(0.95, pA+skillEdge))`.

## Save system debugging

Saves stored at key `"overtime-saves"` via `window.storage` (localStorage in standalone).
Shape: `[autoSave, slot1, slot2, slot3]` — array of 4, nulls for empty slots.

To inspect: `JSON.parse(localStorage.getItem("overtime-saves"))` in browser console.
To clear: `localStorage.removeItem("overtime-saves")` then reload.

## Common pitfalls

- **Don't mutate season/simState without calling setSeason({...season})** — React won't re-render
- **Don't add JSX to .js files** — Vite treats them differently; UI components must be .jsx
- **RANDOM_EVENTS uses rosterOf** — events.js imports from engine/state.js (circular-safe since state.js doesn't import events.js)
- **playerOvr is in engine/utils.js** — not state.js or player.js; both re-export it
- **All money amounts are in $K** — displayed as `$500K` (K suffix, not prefix)
- **Facilities stored on season, not simState** — they belong to the user's org, not the world state

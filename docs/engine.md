# Engine Reference

## utils.js — no deps

```js
playerOvr(p) → number          // weighted avg of 14 stats, 0-99
marketValue(p) → number        // OVR-tiered base price in $K
draftCost(p) → number          // marketValue * 1.5 if on AI team, else marketValue
```

## state.js

### initState(eras)
Creates fresh simState. `eras` is `["current","2018","2015","2013"]` subset.
- Filters PLAYERS_INIT by era, deduplicates (★ legend version wins)
- Derives 14 stats from base stats with role bonuses + noise
- Auto-rosters AI teams from FA pool when "current" era is absent

### Key exports
```js
rosterOf(state, team) → Player[]
freeAgents(state) → Player[]
teamBase(state, team) → number          // average playerOvr of roster
getMapProf(state, team) → {mapName: 0-95}
profileFor(teamName) → {mapName: random}
recordMatch(state, winner, loser)       // updates rivalry state
isRivalMatch(state, a, b) → boolean    // true if 3+ meetings with 2:1+ record
nervesModifier(state, A, B, ctx) → number  // composure/experience stage pressure
autoVeto(state, A, B, bo) → string[]   // AI veto logic, returns map list
```

## match.js

### resolveMap(state, map, A, B, ctx, rng) → MapResult
Simulates one CS map round-by-round.
- Economy: $800 start, win bonus $3250, loss bonuses $1400-$3400
- Buy types: eco / force / full / awp_buy based on team money
- Win probability: buy-matchup table + combat stats (rifle, pistol, awp) + skill edge
- Returns `{winnerName, loserName, score:[a,b], rounds:[{round, winner, btA, btB, narrative, isClutch, isEcoUpset, isAce}], mvp, ...}`

### playSeries(state, A, B, bo, ctx, rng, fixedMaps?) → SeriesResult
Runs Bo1/Bo3/Bo5 series. Uses autoVeto unless fixedMaps provided.
- Returns `{winnerName, loserName, maps:MapResult[], bo, seriesScore:[a,b], scoreLine}`

### applyActivity(state, team, activity, mapChoice, facilities)
Applies one week of training. Mutations: player stats, form, fatigue, chemistry.
- Facility bonuses: ghTier reduces fatigue, bcTier boosts stat gains, anTier boosts VOD
- Coach bonuses: applied per coach.bonus string ("tactical","motivator","fitness","analyst","veteran")

### rollRandomEvent(state, team) → string | null
10% chance of triggering a RANDOM_EVENTS entry. Returns log string or null.

## activity.js

### autoSimWeeks(state, team, fromWeek, toWeek) → LogEntry[]
Simulates weeks between events. Picks rest/scrim based on fatigue threshold (70).
Returns log entries for salary paydays and random events.

### aiWeekActivity(state)
Applies random activity to each AI team roster weekly.

### generateProspect(year) → Player
Creates a 16-17 year old FA player with random stats (talent 40-70 base).

### developProspect(p)
Call weekly. Gains stats only every 4 weeks (`weeksInAcademy % 4 === 0`).

### snapshotEventStats(simState, eventNum)
Copies current `stats` into each player's `career.eventHistory`.

## tournament.js

### Swiss Engine
```js
newSwiss(myTeam, simState, teams) → SwissState
swissRound(s)          // Major: 3W/3L thresholds
swissRoundMini(s)      // A/B-tier: uses s._advanceAt / s._elimAt (both 2)
swissDone(s) → boolean
nextSwissFix(s) → Fixture | null   // returns user's pending match
resolveSwissFix(s, fx)             // call after user match is done
```

**Bo rules:** `swissBo(w, l)` returns 1 (early rounds) or 3 (elimination/advancement matches, when either team has 2W or 2L).

### Playoff Bracket
```js
seedPlayoff(advancers, bo3, bo5Final) → Bracket
// advancers.length = 8 → QF/SF/Final; 4 → SF/Final; 2 → Final only
resolvePlayoffAI(bracket, myTeam, simState, rng)
nextPlayoffFix(bracket, myTeam) → {fx, round} | null
```

### Tournament constructors
```js
newTournament(myTeam, simState)
// Major: 16 teams, swiss 3W/3L, top 8 → playoffs, Bo5 final

newMiniTournament(myTeam, simState, eventInfo)
// A/B-tier: 8 teams, swiss 2W/2L, top 4 → playoffs, Bo3 final
```

### Placement & prizes
```js
placementOf(t) → number      // 1,2,4,9,16 based on bracket result
prizeMoney(place) → number   // {1:500, 2:300, 4:180, 8:100, 9:50, 16:30}
miniPlacement(t) → number
miniPrizeMoney(t, place) → number
```

## player.js

### Rankings
```js
RANKING_POINTS = {1:1000, 2:600, 3-4:350, 5-8:150, 9-16:50}
TIER_MULT = {Major:3, A:2, B:1}

updateRankings(state, placements, tier)
// placements = {teamName: place}, decays existing points by 0.85 then adds new

getRankedTeams(state, myTeam) → [{team, pts}]  // sorted desc
getTeamOrder(myTeam, state) → string[]          // ranked order, filters empty teams
getSeed(myTeam, state) → {teamName: seedNum}
```

### AI Roster Moves
```js
aiRosterMoves(state, myTeam) → string[]
// ~35% chance per AI team to drop worst-rated player and sign best FA of same role
// ~8% chance top-5 teams poach from bottom-5 teams
// Returns log strings describing each move
```

## Player object schema
```js
{
  name, team, role,           // role: "IGL"|"AWP"|"Entry"|"Lurk"|"Support"
  age, era, salary, contract, // contract in events remaining
  traits,                     // ["clutch","boom","leader"]
  form,                       // -12 to +12, affects match perf
  fatigue,                    // 0-100, high = more variance
  // Core stats (0-99)
  aim, gameSense, util, igl, mentality, consistency,
  // Derived combat stats (computed at initState from base + noise)
  rifle, pistol, awp, clutch, entry,
  // Mental/physical stats
  stamina, composure, experience,
}
```

# OVERTIME — AI Contributor Guide

CS Major team management simulator. React + Vite, no external UI libraries, all styling inline.

## Stack
- **React 18** (functional components, hooks only)
- **Vite 5** build
- **window.storage** for saves (polyfilled to localStorage in main.jsx)
- All styles: inline `style={{}}` objects using constants from `ui/theme.js`

## Repo layout
```
src/
  App.jsx              # Top-level state, all handler functions, phase routing
  constants/
    data.js            # Static data: PLAYERS_INIT, MAPS, AI_TEAMS
    events.js          # Season config: EVENTS, ACTIVITIES, FACILITIES, COACHES, calendar utils
  engine/
    utils.js           # playerOvr, marketValue, draftCost  (no deps)
    state.js           # initState, rosterOf, getMapProf, rivalry, autoVeto
    player.js          # rankings, seeding, aiRosterMoves
    match.js           # resolveMap, playSeries, applyActivity, rollRandomEvent
    activity.js        # weekly training, autoSimWeeks, generateProspect
    tournament.js      # Swiss engine, playoff bracket, prize money
  ui/
    theme.js           # C (colors), sans, mono, GL
    primitives.jsx     # Shared atoms: SL, Banner, Pill, MiniStat, Overlay, etc.
    Gstyle.jsx         # Global <style> injection
    Header.jsx         # Header + Tabs components
    DraftScreen.jsx    # Era selection + player draft
    CalendarView.jsx   # Main calendar + weekly activity picker + academy + sponsors
    EventHLTV.jsx      # Tournament view: Swiss results, standings, bracket
    RosterView.jsx     # Player cards, PlayerProfile, StatsView, contract negotiation
    VetoOverlay.jsx    # Map veto process
    MatchReveal.jsx    # Round-by-round match animation
    MatchModal.jsx     # Past match detail viewer
    SeasonHistory.jsx  # End-of-season results table
    MapProfView.jsx    # Map proficiency radar
    FacilitiesView.jsx # Facility upgrade shop
    RankingsView.jsx   # World rankings table
    RivalryView.jsx    # Head-to-head records
```

## App phases
```
"loading" → checks window.storage for saves
"saves"   → save slot screen (continue / new season)
"draft"   → DraftScreen (era select → player market)
"season"  → calendar / event / done
```

Within "season", `season.phase` is `"calendar"` or `"event"`. During an event, `t` (tournament state) drives the EventHLTV view.

## Key state objects

### `season` (in App useState)
```js
{
  simState,          // see below
  budget,            // number (in $K)
  year,              // 2026, 2027, ...
  week,              // 1-52
  eventNum,          // 1-9 per season
  history,           // [{eventNum, place, champion, prize, tier, label, budgetAfter}]
  yearHistory,       // [{year, rank, trophies, budgetEnd, roster}]
  weekLog,           // [{week, activity, event}] — activity log entries
  facilities,        // {gaming_house:0-3, bootcamp_center:0-3, ...}
  sponsorships,      // [{brand, monthly, duration, active, offered, weeksLeft, condition}]
  academy,           // null | {prospects:[], weeksActive:0}
  scoutedTeams,      // {teamName: {roster, maps, scoutedAt}}
  phase,             // "calendar" | "event" | "done"
  currentEvent,      // EVENTS entry | null
}
```

### `simState` (inside season.simState)
```js
{
  players,     // Player[] — all players including FA and AI team rosters
  chemistry,   // {teamName: 0-100}
  stats,       // {playerName: {maps, rating, mvps, clutches}}
  career,      // {playerName: {totalMaps, totalMvps, avgRating, eventHistory, mapStats, origStats}}
  mapProf,     // {teamName: {Mirage:0-95, ...}}
  rivalries,   // {"TeamA|TeamB": {wins:{A,B}, matches, isRival}}
  rankings,    // {teamName: points}
  coach,       // null | COACHES entry
  pendingBonus,// null | {condition, amount}
}
```

### Tournament state `t`
```js
{
  swiss,         // Swiss state (see engine/tournament.js)
  bracket,       // null until Swiss done, then {qf?, sf?, final, bo3, bo5Final}
  stage,         // "swiss" | "playoffs" | "done"
  champion,      // string | null
  isMajor,       // boolean
  advanceCount,  // 8 for Major, 4 for A/B-tier
  prizeTable,    // {1:500, 2:300, ...}
  simState,      // reference to season.simState
  myTeam,        // string
}
```

## Docs index
- [docs/engine.md](docs/engine.md) — simulation engine reference
- [docs/ui.md](docs/ui.md) — UI components and data flow
- [docs/data.md](docs/data.md) — player/event data schemas
- [docs/howto.md](docs/howto.md) — common tasks (add player, add event, add facility)

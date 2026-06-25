# UI Reference

## Theme (ui/theme.js)

```js
C = {
  bg, panel, panel2,    // background layers: #0a0c10, #13171f, #1a1f29
  line,                 // border: #272e3b
  ink, dim, faint,      // text: #e9edf3, #828c9d, #525c6b
  acc,                  // orange accent: #ff5c2e
  gold,                 // #ffc24b
  win,                  // green: #3ddc84
  live,                 // blue: #6aa3ff
  red,                  // #ff4c4c
  rival,                // purple: #e040fb
}
sans = "'Inter',system-ui,sans-serif"
mono = "'JetBrains Mono',ui-monospace,Menlo,monospace"
```

All components import C, sans, mono from theme.js. Never hardcode color hex values.

## Primitives (ui/primitives.jsx)

```jsx
<SL n="SHT" t="SECTION TITLE"/>       // Section label with horizontal rule
<Banner c={C.gold}>{children}</Banner> // Colored border box
<Locked text="..."/>                   // Dimmed placeholder (feature not yet available)
<Empty text="..."/>                    // Inline empty state text
<Intro text="..."/>                    // Descriptive paragraph, max-width 740
<Pill c={C.dim}>{label}</Pill>        // Small monospace badge
<TraitPill t="clutch|boom|leader"/>   // Role-colored trait badge
<Stat l="AIM" v={90}/>               // Vertical stat column (label + number)
<MiniStat label="BUDGET" value="$500K" color={C.gold}/>  // Label + large number
<FormArrow form={4.2}/>              // ▲▲ / ▲ / – / ▼ / ▼▼ with color
<EdgeBar edge={3.5}/>                // Horizontal advantage bar
<Overlay onClose={fn} title="...">{children}</Overlay>  // Modal overlay
```

## App.jsx — phase routing

```jsx
phase === "loading"  → spinner (checks storage)
phase === "saves"    → save slot screen
phase === "draft"    → <DraftScreen onComplete={onDraftComplete}/>
phase === "season"   → season views (below)
```

Season sub-routing by `season.phase` and `tab`:
```
season.phase === "calendar" → CalendarView + tab-based views (roster, maps, facility, rankings, rivals, season)
season.phase === "event"    → EventHLTV (t drives inner Swiss/bracket tabs)
season.phase === "done"     → Year-end summary + CONTINUE TO {year+1}
```

## App.jsx — handler functions

All live in App, passed as props:

| Handler | Called from | Effect |
|---|---|---|
| `onDraftComplete(teamName, simState, budget)` | DraftScreen | Creates season, sets phase="season" |
| `advanceWeek(activity, mapChoice)` | CalendarView | Applies activity, ticks week, auto-saves |
| `simToNextEvent()` | CalendarView | Auto-sims to next event week |
| `endEvent()` | EventHLTV | Awards prize, updates rankings, returns to calendar |
| `afterResult()` | MatchReveal | Applies match result, advances Swiss/bracket |
| `beginVeto(fx, bo)` | EventHLTV | Opens VetoOverlay |
| `upgradeFacility(facId)` | FacilitiesView | Deducts cost, increments facility tier |
| `startNewYear()` | Year-end screen | Ages players, generates rookies, resets calendar |
| `negotiateContract(name, salary)` | RosterView | Returns {success, msg} |
| `changeRole(name, role)` | RosterView | Mutates player.role, -3 chemistry |
| `scoutTeam(name)` | CalendarView | Records map/roster intel in season.scoutedTeams |
| `initAcademy()` | CalendarView | Deducts $100K, creates season.academy |
| `promoteProspect(idx)` | CalendarView | Moves prospect to main roster |
| `sellProspect(idx)` | CalendarView | Requires 8+ weeks, adds budget |
| `acceptSponsorship(idx)` | CalendarView | Sets sponsorship.active = true |
| `saveToSlot(slot)` | Header | Writes full season state to storage slot 1-3 |
| `autoSave()` | advanceWeek, simToNextEvent, endEvent | Writes to slot 0 |

## CalendarView.jsx

Largest UI file. Props:
```
season, myTeam, onAdvance, onTransfer, onSim, onHireCoach, onFireCoach,
onInitAcademy, onPromoteProspect, onSellProspect, onAcceptSponsor, onDeclineSponsor
```

Internal state:
```js
const [act, setAct] = useState(null)     // selected activity key
const [mapChoice, setMapChoice] = useState(null)  // map name OR team name (for scout)
const [showTransfer, setShowTransfer] = useState(false)
```

Sections (in render order):
1. Stats bar (date, next event, next payday, fatigue, budget)
2. Calendar grid (4×3 month cards, week tiles)
3. Event banner (if weeksUntil === 0)
4. Activity picker (buttons for each ACTIVITIES key)
5. Map picker (if act === "practice") or Team picker (if act === "scout")
6. Advance / Sim-to-next buttons
7. Sponsorship offers + income breakdown
8. Academy panel
9. Coach panel
10. Transfer panel (toggle)
11. Week log

## EventHLTV.jsx

```jsx
<EventHLTV t={t} myTeam season SEED evLabel tierTag tab setTab
  nf={nextUserFx()} onPlay={beginVeto} alive onOpen={setOpenMatch}
  onEndEvent={endEvent|null}/>
```

Inner tabs: "results" | "standings" | "bracket"
- `<SwissResults>` — round-by-round match list
- `<SwissStandings>` — W-L table with status colors
- `<PlayoffBracket>` — side-by-side bracket columns

`<NextMatchHLTV>` shows current pending match with VS card + ENTER VETO button.

## RosterView.jsx

`<RosterView2>` — 5 horizontal player cards (scroll on mobile), plus Quick Actions panel below.

Card sections (top→bottom):
1. Role color header
2. Avatar circle (initials)
3. Name + OVR badge
4. 2×2 stats grid (AIM/SENSE/RIFLE/CLUTCH)
5. Form number + fatigue bar
6. Contract info
7. Age + trait pills
8. Footer: event rating or career stats

Click card → opens `<PlayerProfile>` overlay (full 14-stat bars grouped as Core/Combat/Mental).

Quick Actions panel: role dropdowns + RENEW CONTRACT buttons for expiring players.

## Save system

```js
SAVE_KEY = "overtime-saves"
saves = [autoSave, slot1, slot2, slot3]  // array of 4

// Save object shape:
{
  myTeam,
  season,      // without simState
  simState,    // stored separately
  savedAt,     // ISO string
  summary: { week, date, budget, roster, rank, events }
}
```

`buildSaveData()` in App assembles current state. `loadFromSave(save)` reassembles `season.simState` and restores phase.

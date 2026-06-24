# OVERTIME

**CS Major Team Management Simulator**

Draft players from 4 eras of Counter-Strike history, manage your org through a 52-week season, compete in Swiss-format tournaments, and build a dynasty across multiple years.

## Features

### Draft & Roster
- 130 players across 4 eras: Current (2024-25), 2018-21, 2015-17, 2013-14
- Legend players (★) with prime-era stats — draft peak s1mple alongside current donk
- 14-stat player system: 5 core, 5 combat, 4 mental/physical
- Contract negotiations, role assignment, free agent market

### Tournaments
- Swiss group stage (3W advance / 3L eliminated for Majors, 2W/2L for A/B-tier)
- Bo1 early rounds, Bo3 elimination/advancement matches, Bo5 Grand Finals
- Round-by-round match engine with CS economy simulation
- HLTV-style event UI with Results / Standings / Bracket tabs

### Season Management
- 52-week calendar mapped to real 2026 dates
- 9 events: 4 B-tier, 3 A-tier, 2 Majors
- Weekly activities: practice, bootcamp, scrim, vod review, scout rival, rest, vacation
- Monthly salary payments with multiple revenue streams

### Business
- Sponsorship deals with conditions ("stay top 10 for $40K/mo")
- Merch, streaming, org stipend income scaling with world ranking
- 6 upgradeable facilities: Gaming House, Bootcamp Center, Sports Psychologist, Analytics Lab, Content Studio, Medical Bay
- Academy system for developing young talent

### Competitive
- World rankings with points from event placements (Majors 3x, A-tier 2x, B-tier 1x)
- Major qualification: top 8 = Legends (auto-qualify), 9-16 = Challengers, 17+ = DNQ
- AI roster moves: teams drop underperformers, sign FAs, poach stars
- Rivalry system tracking head-to-head records

### Multi-Year
- Continue to 2027, 2028... with aging rosters and rookie generations
- Facilities, budget, rankings carry over with off-season decay
- Year-end summaries with trophy count and history cards
- Persistent saves (auto-save + 3 manual slots)

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Built With

- React 18
- Vite
- No external UI libraries — all custom components

## Note

This game was originally built as a Claude artifact. The `window.storage` API used for saves is polyfilled with `localStorage` for standalone deployment.

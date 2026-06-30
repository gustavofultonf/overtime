# OVERTIME — AI Contributor Guide

CS Major team management simulator. React + Vite, no external UI libraries, all styling inline.

## Workflow rules

- **Do NOT run the dev server or take screenshots.** Assume code changes are correct unless explicitly told there's a problem.
- Debug by reading code, console logs, and browser devtools — not by visually inspecting the running app.
- If you need to verify behavior, add `console.log` statements rather than asking for screenshots.

## Stack
- **React 18** (functional components, hooks only)
- **Vite 5** build
- **window.storage** for saves (polyfilled to localStorage in main.jsx)
- **Firebase (Firestore + Anonymous Auth)** mirrors saves to the cloud, optionally — see `src/cloud/firebase.js`. No-op with zero config; enabled by populating `.env.local` from `.env.local.example`. Local storage remains the source of truth; cloud is best-effort sync.
- All styles: inline `style={{}}` objects using constants from `ui/theme.js`

## Repo layout


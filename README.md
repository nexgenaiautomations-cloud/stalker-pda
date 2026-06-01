# STALKER PDA

A PWA-installable, in-browser tribute to the STALKER Anomaly PDA — Map, Tasks, Contacts, Messages, Journal, Radio, Stats.

> Fan project / homage. No copyrighted game assets are shipped. UI is a clean-room recreation of the general look-and-feel (warm-amber CRT, vertical icon nav, status strip, operator panel).

## Features
- **Map** — Leaflet + free OpenStreetMap tiles, recolored to an amber "Zone" tint; player marker w/ heading + ping ring, anomalies, stashes, camps, traders, hostile contacts, extraction points, task targets, and pinned journal entries. Bottom filter chips.
- **Tasks** — Track / Show on map / Mark complete / Message giver, faction-colored.
- **Contacts** — Faction filter chips, dossier with online status & coords.
- **Messages** — NPC threads with simulated auto-reply, plus **PDA-to-PDA messaging across browser tabs** via `BroadcastChannel`.
- **Journal** — Notes/Logs/Rumors/Discoveries with type filter, pin/delete, auto-tagged with current coordinates and shown on the map.
- **Radio** — Faction frequencies with a live signal visualizer canvas and rotating chatter ticker.
- **Stats** — Ranking + vitals snapshot.
- **PWA** — Service worker via `vite-plugin-pwa`, runtime cache for OSM tiles, installable from the address bar.

## Stack
React 18 · TypeScript · Vite · TailwindCSS · Zustand (persist) · Leaflet + react-leaflet · vite-plugin-pwa

## Develop
```bash
npm install
npm run dev      # http://localhost:5173
```

## Build
```bash
npm run build
npm run preview
```

## Cross-tab messaging
Open the app in two browser tabs. Each tab gets its own `pdaId`; tabs auto-discover each other via heartbeat and appear in the other's Messages thread list as `[pda]`. Typing in one transmits via `BroadcastChannel` to the other.

## Map data
Tiles: © OpenStreetMap contributors (CC-BY-SA, ODbL). Tile pane is CSS-filtered into a sand/amber tone — no derivative-tile redistribution.

## Notes
- "STALKER" and "Anomaly" are trademarks of their respective owners. This project is non-commercial fan work.
- Default seed location is Rexburg, ID. Edit `src/store/pda.ts` to relocate.

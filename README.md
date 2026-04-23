# Plot — Collaborative Whiteboard

A real-time multi-user whiteboard built for Itransition internship task #6. Anyone with the link can draw together: live cursors, persistent strokes, multiple pages, and granular permissions — no signup.

**Stack:** ASP.NET Core 10 (minimal APIs + SignalR) · EF Core 10 (SQLite / Postgres) · React 19 + Vite + TypeScript · Tailwind v4 · Konva · Zustand · `@microsoft/signalr`

---

## Features

- No-auth display-name entry — your name sits next to your cursor
- Dashboard with your boards, SVG previews, sort/search, one-click creation
- Workspace with full-viewport Konva canvas, dot-grid background, pan + zoom
- Tools: pen, rectangle, ellipse, arrow, text, sticky note, eraser, clear page
- 8-swatch color palette + stroke-width slider
- Multi-page boards (thumbnail strip with add/delete, live preview)
- Granular permissions — default role (Viewer/Editor/Manager) + per-user overrides + fine-grained toggles
- Live cursors with name labels, presence avatar-stack
- Live in-progress stroke preview while someone else is drawing
- Share modal with copy-link, Export modal with JPEG/PNG + quality slider
- Saved indicator, inline title rename, soft-erase with broadcast

---

## Local development

Requires **Node 22+** and **.NET 10 SDK**.

```powershell
# 1. Backend — ASP.NET on http://localhost:5080, SQLite at iTransitionTask6/plot.db
dotnet run --project iTransitionTask6

# 2. Frontend — Vite dev server on http://localhost:5173 with /api + /hubs proxied to :5080
cd client
npm install          # first time only
npm run dev
```

Open `http://localhost:5173`. Multi-user works out of the box — open the same board in another browser/profile.

## Production build (single host)

```powershell
cd client
npm run build        # writes ../iTransitionTask6/wwwroot/dist

cd ..
dotnet publish iTransitionTask6 -c Release -o publish
dotnet publish\Plot.dll
```

The backend serves `wwwroot/dist/index.html` as SPA fallback, so all routes work without hash-based routing.

## Deploy — Fly.io (free tier)

Prerequisites: [install flyctl](https://fly.io/docs/hands-on/install-flyctl/), then `fly auth signup` (or `login`).

```bash
# Create the app (pick a unique name or accept the generated one)
fly apps create plot-whiteboard

# Provision a free Postgres cluster and attach it (sets DATABASE_URL)
fly postgres create --name plot-db --region ams --initial-cluster-size 1 --vm-size shared-cpu-1x --volume-size 1
fly postgres attach plot-db --app plot-whiteboard

# Deploy
fly deploy --app plot-whiteboard
```

Fly reads `Dockerfile` (multi-stage: Node build → .NET publish → ASP.NET runtime). Machine auto-suspends when idle, so the free tier stays free.

Visit your URL at `https://plot-whiteboard.fly.dev` (substitute your app name).

### Switching providers

The backend works with any Postgres provider via `DATABASE_URL` (`postgres://…` or Npgsql keyword format). To run against Postgres locally:

```powershell
$env:Database__Provider = "Postgres"
$env:ConnectionStrings__Default = "Host=localhost;Username=postgres;Password=postgres;Database=plot"
dotnet run --project iTransitionTask6
```

Omit those env vars to fall back to SQLite at `iTransitionTask6/plot.db`.

---

## Project layout

```
iTransitionTask6.sln
├─ iTransitionTask6/              ← ASP.NET Core Web API (namespace Plot, assembly Plot)
│  ├─ Program.cs                  ← DI, SignalR, EF migration, SPA fallback
│  ├─ Api/                        ← Minimal-API endpoint groups
│  ├─ Hubs/                       ← BoardHub + PresenceStore
│  ├─ Domain/                     ← Board, Page, Stroke, BoardMember + enums
│  ├─ Data/                       ← PlotDbContext + migrations
│  └─ wwwroot/dist/               ← Vite prod build output (gitignored)
└─ client/                        ← React + Vite + TS frontend
   ├─ src/
   │  ├─ routes/                  ← EntryRoute, DashboardRoute, WorkspaceRoute
   │  ├─ components/              ← PlotLogo, Avatar, BoardCard …
   │  ├─ components/workspace/    ← CanvasStage, Toolbar, PagesStrip, ShareModal …
   │  ├─ stores/                  ← useUserStore, useWorkspaceStore (zustand)
   │  └─ lib/                     ← api client, SignalR wrapper, stroke payload, tokens
   ├─ vite.config.ts              ← proxy /api + /hubs to :5080; build.outDir → ../iTransitionTask6/wwwroot/dist
   └─ package.json
```

## Submission

- **Repo:** this URL
- **Deployed:** `https://plot-whiteboard.fly.dev` (once `fly deploy` succeeds)
- **Silent demo video:** record a screen walkthrough hitting all features (two browsers side-by-side helps show realtime)

Email the submission to `p.lebedev@itransition.com`.

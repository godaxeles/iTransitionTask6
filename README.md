# Plot — Collaborative Whiteboard

Real-time multi-user whiteboard. Anyone with the link joins by entering a display name and draws together — live cursors, persistent strokes, multiple pages, granular permissions, no signup.

**Stack:** ASP.NET Core 10 · SignalR · EF Core 10 (SQLite / Postgres) · React 19 · Vite · TypeScript · Tailwind v4 · Konva · Zustand

## Run locally

Requires Node 22+ and .NET 10 SDK.

```powershell
# Terminal 1 — backend on :5080, SQLite in iTransitionTask6/plot.db
dotnet run --project iTransitionTask6

# Terminal 2 — frontend on :5173
cd client
npm install
npm run dev
```

Open http://localhost:5173. Open a second browser profile on the same board URL to see real-time collaboration.

## Build for production

```powershell
cd client
npm run build
cd ..
dotnet publish iTransitionTask6 -c Release -o publish
```

The backend serves the built SPA from `wwwroot/dist` and provides the API + SignalR hub on the same host.

## Database

Defaults to SQLite (`iTransitionTask6/plot.db`). For Postgres:

```powershell
$env:Database__Provider = "Postgres"
$env:ConnectionStrings__Default = "postgres://user:pass@host:5432/dbname"
dotnet run --project iTransitionTask6
```

The backend accepts either `postgres://` URL format or Npgsql keyword format via `ConnectionStrings__Default` or the `DATABASE_URL` environment variable.

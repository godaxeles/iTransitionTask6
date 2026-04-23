import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Home, Search } from "lucide-react";
import { PlotLogo } from "../components/PlotLogo";
import { Avatar } from "../components/Avatar";
import { BoardCard } from "../components/BoardCard";
import { NewBoardCard } from "../components/NewBoardCard";
import { useUserStore, USER_COLORS } from "../stores/userStore";
import { createBoard, deleteBoard, listBoards } from "../lib/api/boards";
import type { BoardSummary } from "../lib/types";
import { cn } from "../lib/cn";

const DAY_MS = 24 * 60 * 60 * 1000;

const RECENT_WINDOW_DAYS = 7;

const RECENT_WINDOW_MS = RECENT_WINDOW_DAYS * DAY_MS;

const MINUTE_MS = 60_000;

const MINUTES_PER_HOUR = 60;

const HOURS_PER_DAY = 24;

const LOGO_SIZE = 26;

const HEADER_USER_AVATAR_SIZE = 24;

const SEARCH_ICON_SIZE = 15;

const SIDEBAR_ICON_SIZE = 15;

const ICON_STROKE_WIDTH = 1.75;

const LOADING_PLACEHOLDER_COUNT = 5;

const PLACEHOLDER_DELAY_STEP_MS = 60;

const DEFAULT_UNTITLED_TITLE = "Untitled board";

type SortKey = "recent" | "active" | "alphabetical";

type Filter = "all" | "recent";

export function DashboardRoute() {
  const navigate = useNavigate();

  const name = useUserStore((s) => s.displayName);

  const colorIndex = useUserStore((s) => s.colorIndex);

  const color = USER_COLORS[colorIndex];

  const [boards, setBoards] = useState<BoardSummary[] | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);

  const [search, setSearch] = useState("");

  const [sort, setSort] = useState<SortKey>("recent");

  const [filter, setFilter] = useState<Filter>("all");

  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    const ac = new AbortController();
    setError(null);
    listBoards(ac.signal)
      .then((list) => {
        if (!ac.signal.aborted) setBoards(list);
      })
      .catch((err) => {
        if (ac.signal.aborted) return;
        setError(err?.message ?? "Failed to load boards");
      });
    return () => ac.abort();
  }, [reloadTick]);

  const retry = () => setReloadTick((n) => n + 1);

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const board = await createBoard(DEFAULT_UNTITLED_TITLE);
      navigate(`/boards/${board.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const before = boards;
    setBoards((list) => list?.filter((b) => b.id !== id) ?? null);
    try {
      await deleteBoard(id);
    } catch (err) {
      setBoards(before);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const filteredBoards = useMemo(() => {
    if (!boards) return null;
    const q = search.trim().toLowerCase();
    const now = Date.now();
    let list = [...boards];
    if (filter === "recent") {
      list = list.filter((b) => now - new Date(b.updatedAt).getTime() < RECENT_WINDOW_MS);
    }
    if (q) list = list.filter((b) => b.title.toLowerCase().includes(q));
    switch (sort) {
      case "alphabetical":
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case "active":
        return list.sort((a, b) => b.collaboratorCount - a.collaboratorCount);
      default:
        return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  }, [boards, search, sort, filter]);

  const recentCount = useMemo(() => {
    if (!boards) return null;
    const now = Date.now();
    return boards.filter((b) => now - new Date(b.updatedAt).getTime() < RECENT_WINDOW_MS).length;
  }, [boards]);

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-paper px-5">
        <PlotLogo size={LOGO_SIZE} />
        <span className="text-ink-6">/</span>
        <button className="btn btn-ghost !px-2 !py-1 text-[13px]">Workspace ▾</button>

        <div className="relative mx-auto w-full max-w-[440px]">
          <Search
            size={SEARCH_ICON_SIZE}
            strokeWidth={ICON_STROKE_WIDTH}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-5"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search boards, pages, people…"
            className="input !pl-10 text-[13.5px]"
          />
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="btn btn-accent disabled:opacity-60"
        >
          + New board
        </button>

        <div className="flex items-center gap-2 rounded-full border border-border bg-paper py-1 pl-1 pr-3 shadow-1">
          <Avatar name={name} color={color} size={HEADER_USER_AVATAR_SIZE} />
          <span className="text-[13px] font-medium text-ink-1">{name || "Guest"}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-[220px] shrink-0 flex-col gap-8 border-r border-border bg-paper/60 p-6 lg:flex">
          <section>
            <h4 className="t-xs mb-3 font-medium uppercase tracking-[0.14em] text-ink-5">Library</h4>
            <SidebarItem
              icon={<Home size={SIDEBAR_ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} />}
              label="All boards"
              count={boards !== null ? boards.length : null}
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <SidebarItem
              icon={<Clock size={SIDEBAR_ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} />}
              label="Recent"
              count={recentCount}
              active={filter === "recent"}
              onClick={() => setFilter("recent")}
            />
          </section>
        </aside>

        <main className="flex-1 overflow-y-auto px-8 py-10 lg:px-10">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-1 flex items-baseline justify-between">
              <h1 className="t-h2">{filter === "recent" ? "Recent boards" : "All boards"}</h1>
              <span className="t-sm text-ink-4">
                {boards?.length ?? 0} {boards?.length === 1 ? "board" : "boards"}
                {boards && boards.length > 0 && ` · Last edit ${relativeForMostRecent(boards)}`}
              </span>
            </div>

            <div className="mb-7 mt-5 flex items-center gap-2">
              <SortChip active={sort === "recent"} onClick={() => setSort("recent")}>Recent</SortChip>
              <SortChip active={sort === "active"} onClick={() => setSort("active")}>Most active</SortChip>
              <SortChip active={sort === "alphabetical"} onClick={() => setSort("alphabetical")}>Alphabetical</SortChip>
            </div>

            {error && (
              <div className="mb-5 flex items-start justify-between gap-3 rounded-md border border-danger/20 bg-[color:var(--accent-soft)] px-4 py-3 text-[13px] text-danger">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={retry}
                  className="shrink-0 rounded-md border border-danger/30 bg-paper px-2.5 py-1 font-medium text-danger hover:bg-[color:var(--accent-tint)]"
                >
                  Retry
                </button>
              </div>
            )}

            <div
              className="grid gap-[18px]"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
            >
              <NewBoardCard onClick={handleCreate} pending={creating} />
              {filteredBoards === null && !error ? (
                <LoadingPlaceholders />
              ) : filteredBoards && filteredBoards.length === 0 && search.length > 0 ? (
                <EmptyState message={`No boards match "${search}"`} />
              ) : (
                filteredBoards?.map((b) => <BoardCard key={b.id} board={b} onDelete={handleDelete} />)
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number | null;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] transition",
        active ? "bg-ink-9 font-medium text-ink-0" : "text-ink-2 hover:bg-ink-9",
      )}
    >
      <span className={cn("flex h-5 w-5 items-center justify-center", active ? "text-ink-0" : "text-ink-4")}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      <span className="text-[11px] text-ink-5">{count ?? "—"}</span>
    </button>
  );
}

function SortChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={cn("chip", active && "is-active")}>
      {children}
    </button>
  );
}

function LoadingPlaceholders() {
  return (
    <>
      {Array.from({ length: LOADING_PLACEHOLDER_COUNT }).map((_, i) => (
        <div
          key={i}
          className="aspect-[16/9] animate-pulse rounded-lg border border-border bg-ink-9"
          style={{ animationDelay: `${i * PLACEHOLDER_DELAY_STEP_MS}ms` }}
        />
      ))}
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-full flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-paper/50 text-[13px] text-ink-4">
      {message}
    </div>
  );
}

function relativeForMostRecent(boards: BoardSummary[]): string {
  const latest = boards.reduce(
    (acc, b) => (new Date(b.updatedAt) > new Date(acc) ? b.updatedAt : acc),
    boards[0].updatedAt,
  );
  const diff = Date.now() - new Date(latest).getTime();
  const mins = Math.max(1, Math.round(diff / MINUTE_MS));
  if (mins < MINUTES_PER_HOUR) return `${mins}m ago`;
  if (mins < MINUTES_PER_HOUR * HOURS_PER_DAY) return `${Math.round(mins / MINUTES_PER_HOUR)}h ago`;
  return `${Math.round(mins / (MINUTES_PER_HOUR * HOURS_PER_DAY))}d ago`;
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type Konva from "konva";
import { getBoard } from "../lib/api/boards";
import { BoardRole as BoardRoleEnum, type BoardDetail, type BoardRole, type Stroke } from "../lib/types";
import { CanvasStage, type StageView, type TextPlaceInput } from "../components/workspace/CanvasStage";
import { TextEditor, type TextDraft } from "../components/workspace/TextEditor";
import { Toolbar } from "../components/workspace/Toolbar";
import { TitleBar } from "../components/workspace/TitleBar";
import { ActionsBar } from "../components/workspace/ActionsBar";
import { PresenceOverlay } from "../components/workspace/PresenceOverlay";
import { PagesStrip } from "../components/workspace/PagesStrip";
import { ShareModal } from "../components/workspace/ShareModal";
import { ExportModal } from "../components/workspace/ExportModal";
import { BoardHub, type PresenceEntry } from "../lib/boardHub";
import { ApiError } from "../lib/api";
import { kindOf, parsePayload, serializePayload, type StrokePayload } from "../lib/strokePayload";
import { useUserStore } from "../stores/userStore";
import { useConfirm } from "../stores/useConfirm";
import { HubConnectionState } from "@microsoft/signalr";

const CURSOR_SEND_MS = 50;

const LIVE_DRAFT_TTL_MS = 600;

const LIVE_DRAFT_POLL_MS = 250;

const CONNECTION_POLL_MS = 1500;

const SAVING_FLASH_MS = 600;

const HTTP_NOT_FOUND = 404;

const BOARDS_ROUTE = "/boards";

const DEFAULT_VIEW: StageView = { scale: 1, offsetX: 0, offsetY: 0 };

const DEFAULT_CURSOR_COLOR = "#5BA3FF";

const DEFAULT_SELF_COLOR = "#1A1A18";

interface LiveDraft {
  id: string;
  payload: StrokePayload;
  color: string;
  userName: string;
  expiresAt: number;
}

interface CursorState {
  userName: string;
  color: string;
  x: number;
  y: number;
}

export function WorkspaceRoute() {
  const { boardId } = useParams<{ boardId: string }>();

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const displayName = useUserStore((s) => s.displayName);

  const ask = useConfirm((s) => s.ask);

  const [board, setBoard] = useState<BoardDetail | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [activePageId, setActivePageId] = useState<string | null>(null);

  const [extraStrokes, setExtraStrokes] = useState<Record<string, Stroke[]>>({});

  const [erasedIds, setErasedIds] = useState<Set<string>>(new Set());

  const [liveDrafts, setLiveDrafts] = useState<Map<string, LiveDraft>>(new Map());

  const [presence, setPresence] = useState<PresenceEntry[]>([]);

  const [cursors, setCursors] = useState<Map<string, CursorState>>(new Map());

  const [saving, setSaving] = useState(false);

  const [myRole, setMyRole] = useState<BoardRole | null>(null);

  const [view, setView] = useState<StageView>(DEFAULT_VIEW);

  const [showShare, setShowShare] = useState(false);

  const [showExport, setShowExport] = useState(false);

  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const [textDraft, setTextDraft] = useState<TextDraft | null>(null);

  const [connectionState, setConnectionState] = useState<
    "connecting" | "connected" | "reconnecting" | "disconnected"
  >("connecting");

  const stageRef = useRef<Konva.Stage>(null);

  const hubRef = useRef<BoardHub | null>(null);

  const lastCursorSentRef = useRef(0);

  const selfNameRef = useRef(displayName);

  const savingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!boardId || !displayName) return;

    const ac = new AbortController();
    let disposed = false;

    getBoard(boardId, ac.signal)
      .then((detail) => {
        if (disposed) return;
        setBoard(detail);
        const queryPage = searchParams.get("page");
        const match = queryPage ? detail.pages.find((p) => p.id === queryPage) : null;
        setActivePageId((id) => id ?? match?.id ?? detail.pages[0]?.id ?? null);
      })
      .catch((err) => {
        if (ac.signal.aborted) return;
        if (err instanceof ApiError) setErrorStatus(err.status);
        setError(err?.message ?? "Failed to load board");
      });

    const hub = new BoardHub({
      onStrokeCommitted: (pageId, stroke) => {
        setExtraStrokes((prev) => {
          const list = prev[pageId] ?? [];
          if (list.some((s) => s.id === stroke.id)) return prev;
          return { ...prev, [pageId]: [...list, stroke] };
        });
        setLiveDrafts((prev) => {
          if (!prev.has(stroke.id)) return prev;
          const next = new Map(prev);
          next.delete(stroke.id);
          return next;
        });
      },
      onStrokeLive: (strokeId, kind, payloadJson, userName, color) => {
        if (userName === selfNameRef.current) return;
        const payload = parsePayload(kind, payloadJson);
        if (!payload) return;
        setLiveDrafts((prev) => {
          const next = new Map(prev);
          next.set(strokeId, {
            id: strokeId,
            payload,
            color,
            userName,
            expiresAt: Date.now() + LIVE_DRAFT_TTL_MS,
          });
          return next;
        });
      },
      onStrokesErased: (ids) => {
        setErasedIds((prev) => {
          const next = new Set(prev);
          for (const id of ids) next.add(id);
          return next;
        });
      },
      onStrokesRestored: (ids) => {
        setErasedIds((prev) => {
          const next = new Set(prev);
          for (const id of ids) next.delete(id);
          return next;
        });
      },
      onBoardRenamed: (title) => {
        setBoard((b) => (b ? { ...b, title } : b));
      },
      onPageAdded: (p) => {
        setBoard((b) => {
          if (!b) return b;
          if (b.pages.some((x) => x.id === p.id)) return b;
          return { ...b, pages: [...b.pages, { ...p, strokes: [] }] };
        });
        setActivePageId(p.id);
      },
      onPageDeleted: (pageId) => {
        setBoard((b) => {
          if (!b) return b;
          const nextPages = b.pages.filter((p) => p.id !== pageId);
          return { ...b, pages: nextPages };
        });
        setActivePageId((prev) => {
          if (prev !== pageId) return prev;
          const remaining = board?.pages.find((p) => p.id !== pageId);
          return remaining?.id ?? null;
        });
      },
      onPagesReordered: (ids) => {
        setBoard((b) => {
          if (!b) return b;
          const byId = new Map(b.pages.map((p) => [p.id, p]));
          const ordered = ids
            .map((id, i) => {
              const p = byId.get(id);
              return p ? { ...p, order: i } : null;
            })
            .filter((x): x is NonNullable<typeof x> => x !== null);
          return { ...b, pages: ordered };
        });
      },
      onCursorMoved: (userName, x, y) => {
        if (userName === selfNameRef.current) return;
        setCursors((prev) => {
          const existing = prev.get(userName);
          const color = existing?.color ?? DEFAULT_CURSOR_COLOR;
          const next = new Map(prev);
          next.set(userName, { userName, color, x, y });
          return next;
        });
      },
      onReconnecting: () => setConnectionState("reconnecting"),
      onReconnected: () => setConnectionState("connected"),
      onClosed: () => setConnectionState("disconnected"),
      onPresence: (snap) => {
        setPresence(snap);
        setCursors((prev) => {
          const names = new Set(snap.map((p) => p.userName));
          const next = new Map(prev);
          for (const name of next.keys()) if (!names.has(name)) next.delete(name);
          for (const p of snap) {
            if (p.userName === selfNameRef.current) continue;
            const existing = next.get(p.userName);
            next.set(p.userName, {
              userName: p.userName,
              color: p.color,
              x: existing?.x ?? p.x,
              y: existing?.y ?? p.y,
            });
          }
          return next;
        });
      },
    });

    hubRef.current = hub;
    setConnectionState("connecting");
    hub
      .start()
      .then(() => hub.joinBoard(boardId, displayName))
      .then((join) => {
        if (disposed) return;
        selfNameRef.current = join.userName;
        setMyRole(join.role);
        setConnectionState("connected");
      })
      .catch((err) => {
        if (disposed) return;
        setConnectionState("disconnected");
        setError(
          err?.message?.includes("Bad Gateway") || err?.message?.includes("Status code")
            ? "Can't reach the realtime server. Is the backend running on :5080?"
            : err?.message ?? "Failed to connect",
        );
      });

    return () => {
      disposed = true;
      ac.abort();
      hubRef.current = null;
      hub.stop().catch(() => {});
    };
  }, [boardId, displayName]);

  useEffect(() => {
    if (!activePageId) return;
    const current = searchParams.get("page");
    if (current === activePageId) return;
    const next = new URLSearchParams(searchParams);
    next.set("page", activePageId);
    setSearchParams(next, { replace: true });
  }, [activePageId, searchParams, setSearchParams]);

  useEffect(() => {
    const t = window.setInterval(() => {
      const s = hubRef.current?.state;
      if (s === HubConnectionState.Connected) {
        setConnectionState((prev) => (prev === "connected" ? prev : "connected"));
      } else if (s === HubConnectionState.Reconnecting) {
        setConnectionState("reconnecting");
      } else if (s === HubConnectionState.Disconnected) {
        setConnectionState("disconnected");
      } else if (s === HubConnectionState.Connecting) {
        setConnectionState("connecting");
      }
    }, CONNECTION_POLL_MS);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (liveDrafts.size === 0) return;
    const t = window.setInterval(() => {
      setLiveDrafts((prev) => {
        const now = Date.now();
        let changed = false;
        const next = new Map(prev);
        for (const [id, d] of prev) {
          if (d.expiresAt < now) {
            next.delete(id);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, LIVE_DRAFT_POLL_MS);
    return () => window.clearInterval(t);
  }, [liveDrafts.size]);

  const page = board?.pages.find((p) => p.id === activePageId) ?? board?.pages[0];

  const pageExtra = useMemo(() => (page ? extraStrokes[page.id] ?? [] : []), [extraStrokes, page]);

  const liveDraftList = useMemo(() => Array.from(liveDrafts.values()), [liveDrafts]);

  const canEdit = myRole !== null && myRole >= BoardRoleEnum.Editor;

  const flagSaving = useCallback(() => {
    setSaving(true);
    if (savingTimerRef.current) window.clearTimeout(savingTimerRef.current);
    savingTimerRef.current = window.setTimeout(() => setSaving(false), SAVING_FLASH_MS);
  }, []);

  const handleCommit = useCallback(
    async ({ pageId, payload }: { pageId: string; payload: StrokePayload }) => {
      const hub = hubRef.current;
      if (!hub) return;
      try {
        flagSaving();
        await hub.commitStroke(pageId, kindOf(payload), serializePayload(payload));
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [flagSaving],
  );

  const handleLiveStroke = useCallback((id: string, payload: StrokePayload) => {
    const hub = hubRef.current;
    if (!hub) return;
    hub.liveStroke(id, kindOf(payload), serializePayload(payload)).catch(() => {});
  }, []);

  const handleErase = useCallback(
    async ({ strokeIds }: { strokeIds: string[] }) => {
      const hub = hubRef.current;
      if (!hub) return;
      try {
        flagSaving();
        await hub.eraseStrokes(strokeIds);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [flagSaving],
  );

  const handlePointerGlobal = useCallback((x: number, y: number) => {
    const hub = hubRef.current;
    if (!hub) return;
    const now = Date.now();
    if (now - lastCursorSentRef.current < CURSOR_SEND_MS) return;
    lastCursorSentRef.current = now;
    hub.sendCursor(x, y).catch(() => {});
  }, []);

  const handleClear = useCallback(async () => {
    if (!page) return;
    const ids: string[] = [];
    for (const s of page.strokes) ids.push(s.id);
    for (const s of pageExtra) ids.push(s.id);
    if (ids.length === 0) return;
    const ok = await ask({
      title: "Clear this page?",
      message: `All ${ids.length} strokes on "${page.name}" will be erased for everyone.`,
      confirmLabel: "Clear page",
    });
    if (!ok) return;
    handleErase({ strokeIds: ids });
  }, [page, pageExtra, handleErase, ask]);

  const handleTextPlace = useCallback((input: TextPlaceInput) => {
    setTextDraft(input);
  }, []);

  const handleTextCommit = useCallback(
    (text: string) => {
      if (!textDraft || !page) {
        setTextDraft(null);
        return;
      }
      const payload: StrokePayload = {
        kind: "text",
        x: textDraft.x,
        y: textDraft.y,
        text,
        color: textDraft.color,
        fontSize: textDraft.fontSize,
      };
      setTextDraft(null);
      handleCommit({ pageId: page.id, payload });
    },
    [textDraft, page, handleCommit],
  );

  const handleAddPage = useCallback(async () => {
    const hub = hubRef.current;
    if (!hub) return;
    try {
      await hub.addPage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const handleDeletePage = useCallback(async (pageId: string) => {
    const hub = hubRef.current;
    if (!hub) return;
    try {
      await hub.deletePage(pageId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const handleRename = useCallback(
    async (title: string) => {
      const hub = hubRef.current;
      if (!hub || !board) return;
      flagSaving();
      try {
        await hub.renameBoard(title);
        setBoard((b) => (b ? { ...b, title } : b));
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [board, flagSaving],
  );

  const otherPeople = useMemo(
    () => presence.filter((p) => p.userName !== selfNameRef.current),
    [presence],
  );

  const disabledReason =
    myRole === BoardRoleEnum.Viewer
      ? "You're a viewer on this board. Ask a manager to make you an editor."
      : connectionState === "disconnected"
        ? "You're offline. Your edits won't sync until you reconnect."
        : connectionState === "connecting" || connectionState === "reconnecting"
          ? "Connecting to the board…"
          : undefined;

  if (error && !board) {
    const is404 = errorStatus === HTTP_NOT_FOUND;
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-canvas px-6 text-center">
        <p className="t-h3">{is404 ? "Board not found" : "Couldn't load the board"}</p>
        <p className="t-sm max-w-md text-ink-4">
          {is404 ? "The link might be broken or the board was deleted." : error}
        </p>
        <div className="mt-2 flex gap-2">
          <button onClick={() => navigate(BOARDS_ROUTE)} className="btn btn-outline">
            Back to boards
          </button>
          {!is404 && (
            <button
              onClick={() => {
                setError(null);
                setErrorStatus(null);
                setBoard(null);
                navigate(`/boards/${boardId}`, { replace: true });
              }}
              className="btn btn-primary"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!board || !page) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <p className="t-sm text-ink-4">Loading board…</p>
      </div>
    );
  }

  const cursorList = Array.from(cursors.values());

  const selfColor = presence.find((p) => p.userName === selfNameRef.current)?.color ?? DEFAULT_SELF_COLOR;

  const canAddPages = canEdit && (myRole === BoardRoleEnum.Manager || board.canAddPages);

  const canDeletePages = canEdit && (myRole === BoardRoleEnum.Manager || board.canDeletePages);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-canvas">
      <CanvasStage
        page={page}
        extraStrokes={pageExtra}
        liveDrafts={liveDraftList}
        erasedIds={erasedIds}
        canEdit={canEdit}
        onPointerGlobal={handlePointerGlobal}
        onCommit={handleCommit}
        onErase={handleErase}
        onLiveStroke={handleLiveStroke}
        onTextPlace={handleTextPlace}
        stageRef={stageRef}
        view={view}
        onViewChange={setView}
        overlay={
          <>
            <PresenceOverlay
              cursors={cursorList}
              scale={view.scale}
              offsetX={view.offsetX}
              offsetY={view.offsetY}
            />
            {textDraft && (
              <TextEditor
                draft={textDraft}
                scale={view.scale}
                offsetX={view.offsetX}
                offsetY={view.offsetY}
                onCommit={handleTextCommit}
                onCancel={() => setTextDraft(null)}
              />
            )}
          </>
        }
      />
      <PagesStrip
        pages={board.pages}
        activePageId={page.id}
        strokesByPage={extraStrokes}
        erasedIds={erasedIds}
        canAddPages={canAddPages}
        canDeletePages={canDeletePages}
        onSelect={setActivePageId}
        onAdd={handleAddPage}
        onDelete={handleDeletePage}
      />
      <TitleBar
        title={board.title}
        saving={saving}
        onRename={handleRename}
        canEdit={canEdit}
        connection={connectionState}
      />
      <ActionsBar
        people={otherPeople.map((p) => ({ name: p.userName, color: p.color }))}
        selfName={selfNameRef.current || displayName}
        selfColor={selfColor}
        role={myRole}
        onShare={() => setShowShare(true)}
        onExport={() => setShowExport(true)}
      />
      <Toolbar onClear={handleClear} disabled={!canEdit} disabledReason={disabledReason} />
      {showShare && (
        <ShareModal
          boardId={board.id}
          selfName={selfNameRef.current}
          onClose={() => setShowShare(false)}
        />
      )}
      {showExport && (
        <ExportModal
          boardTitle={board.title}
          pages={board.pages}
          activePageId={page.id}
          strokesByPage={extraStrokes}
          erasedIds={erasedIds}
          stageRef={stageRef}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layer, Stage } from "react-konva";
import type Konva from "konva";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { parsePayload, shapeHit, type StrokePayload } from "../../lib/strokePayload";
import type { Page, Stroke } from "../../lib/types";
import { StrokeShape } from "./StrokeShape";

const LIVE_THROTTLE_MS = 50;

const ZOOM_STEP = 1.1;

const ZOOM_MIN = 0.2;

const ZOOM_MAX = 4;

const ERASER_HIT_RADIUS = 14;

const ERASE_PREVIEW_OPACITY = 0.25;

const DRAFT_OPACITY = 0.85;

const LIVE_DRAFT_OPACITY = 0.6;

const MIN_PEN_POINTS = 4;

const STICKY_DEFAULT_SIZE = 160;

const STICKY_DEFAULT_COLOR = "#FFF1D8";

const MOUSE_BUTTON_LEFT = 0;

const MOUSE_BUTTON_MIDDLE = 1;

const MOUSE_BUTTON_RIGHT = 2;

const DEFAULT_VIEW: StageView = { scale: 1, offsetX: 0, offsetY: 0 };

const CURSOR_BY_TOOL: Record<string, string> = {
  hand: "grab",
  pen: "crosshair",
  eraser: "crosshair",
  rect: "crosshair",
  ellipse: "crosshair",
  arrow: "crosshair",
  text: "text",
  sticky: "copy",
};

export interface CommitStrokeInput {
  pageId: string;
  payload: StrokePayload;
}

export interface EraseStrokesInput {
  strokeIds: string[];
}

export interface TextPlaceInput {
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export interface StageView {
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface Props {
  page: Page;
  extraStrokes?: Stroke[];
  liveDrafts?: Array<{ id: string; payload: StrokePayload; color: string }>;
  erasedIds?: Set<string>;
  canEdit: boolean;
  onPointerGlobal?: (x: number, y: number) => void;
  onCommit?: (input: CommitStrokeInput) => void;
  onErase?: (input: EraseStrokesInput) => void;
  onLiveStroke?: (id: string, payload: StrokePayload) => void;
  onDraftEnd?: () => void;
  onTextPlace?: (input: TextPlaceInput) => void;
  stageRef?: React.RefObject<Konva.Stage | null>;
  view?: StageView;
  onViewChange?: (view: StageView) => void;
  overlay?: React.ReactNode;
}

export function CanvasStage({
  page,
  extraStrokes,
  liveDrafts,
  erasedIds,
  canEdit,
  onPointerGlobal,
  onCommit,
  onErase,
  onLiveStroke,
  onDraftEnd,
  onTextPlace,
  stageRef,
  view,
  onViewChange,
  overlay,
}: Props) {
  const tool = useWorkspaceStore((s) => s.tool);

  const color = useWorkspaceStore((s) => s.color);

  const strokeWidth = useWorkspaceStore((s) => s.strokeWidth);

  const fontSize = useWorkspaceStore((s) => s.fontSize);

  const fill = useWorkspaceStore((s) => s.fill);

  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });

  const [localView, setLocalView] = useState<StageView>(DEFAULT_VIEW);

  const currentView = view ?? localView;

  const scale = currentView.scale;

  const offset = { x: currentView.offsetX, y: currentView.offsetY };

  const commitView = (next: StageView) => {
    if (view) onViewChange?.(next);
    else setLocalView(next);
  };

  const [draft, setDraft] = useState<StrokePayload | null>(null);

  const draftIdRef = useRef<string>("");

  const lastLiveRef = useRef(0);

  const panningRef = useRef<{ startX: number; startY: number; origin: { x: number; y: number } } | null>(null);

  const eraseBufferRef = useRef<Set<string>>(new Set());

  const toolRef = useRef(tool);

  const colorRef = useRef(color);

  const fontSizeRef = useRef(fontSize);

  const canEditRef = useRef(canEdit);

  toolRef.current = tool;
  colorRef.current = color;
  fontSizeRef.current = fontSize;
  canEditRef.current = canEdit;

  useEffect(() => {
    const handle = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  useEffect(() => {
    const el = stageRef?.current?.container();
    if (!el) return;

    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (!e.ctrlKey && !e.metaKey) {
        commitView({
          scale: currentView.scale,
          offsetX: currentView.offsetX - e.deltaX,
          offsetY: currentView.offsetY - e.deltaY,
        });
        return;
      }

      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const scaleBy = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      const nextScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, currentView.scale * scaleBy));
      if (nextScale === currentView.scale) return;

      const worldX = (px - currentView.offsetX) / currentView.scale;
      const worldY = (py - currentView.offsetY) / currentView.scale;
      commitView({
        scale: nextScale,
        offsetX: px - worldX * nextScale,
        offsetY: py - worldY * nextScale,
      });
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView.scale, currentView.offsetX, currentView.offsetY, stageRef]);

  useEffect(() => {
    const el = stageRef?.current?.container();
    if (!el) return;

    const handler = (e: MouseEvent) => {
      if (!canEditRef.current) return;

      const currentTool = toolRef.current;
      if (currentTool !== "text" && currentTool !== "sticky") return;
      if (e.button !== MOUSE_BUTTON_LEFT) return;

      const target = e.target as HTMLElement | null;
      if (target && target.tagName !== "CANVAS") return;

      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const worldX = (px - currentView.offsetX) / currentView.scale;
      const worldY = (py - currentView.offsetY) / currentView.scale;

      if (currentTool === "text") {
        onTextPlace?.({
          x: worldX,
          y: worldY,
          fontSize: fontSizeRef.current,
          color: colorRef.current,
        });
      } else if (currentTool === "sticky") {
        onCommit?.({
          pageId: page.id,
          payload: {
            kind: "sticky",
            x: worldX,
            y: worldY,
            width: STICKY_DEFAULT_SIZE,
            height: STICKY_DEFAULT_SIZE,
            text: "",
            color: STICKY_DEFAULT_COLOR,
          },
        });
      }
    };

    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageRef, currentView.scale, currentView.offsetX, currentView.offsetY, page.id, onTextPlace, onCommit]);

  const existingParsed = useMemo(() => {
    const all = [...page.strokes, ...(extraStrokes ?? [])];
    return all
      .filter((s) => !erasedIds?.has(s.id))
      .map((s) => ({ id: s.id, payload: parsePayload(s.kind, s.payloadJson) }))
      .filter((x): x is { id: string; payload: StrokePayload } => x.payload !== null);
  }, [page.strokes, extraStrokes, erasedIds]);

  const screenToWorld = useCallback(
    (sx: number, sy: number) => ({
      x: (sx - offset.x) / scale,
      y: (sy - offset.y) / scale,
    }),
    [offset, scale],
  );

  const getStagePointer = (stage: Konva.Stage) => {
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    return screenToWorld(pos.x, pos.y);
  };

  const startDraft = (payload: StrokePayload) => {
    draftIdRef.current = crypto.randomUUID();
    setDraft(payload);
  };

  const extendDraft = (next: StrokePayload) => {
    setDraft(next);
    const now = Date.now();
    if (onLiveStroke && now - lastLiveRef.current > LIVE_THROTTLE_MS) {
      lastLiveRef.current = now;
      onLiveStroke(draftIdRef.current, next);
    }
  };

  const commitDraft = (payload: StrokePayload) => {
    setDraft(null);
    onCommit?.({ pageId: page.id, payload });
  };

  const testEraseAt = (px: number, py: number) => {
    for (const s of existingParsed) {
      if (eraseBufferRef.current.has(s.id)) continue;
      if (shapeHit(s.payload, px, py, ERASER_HIT_RADIUS)) {
        eraseBufferRef.current.add(s.id);
      }
    }
  };

  const handlePointerDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const evt = e.evt;

    if (
      evt.button === MOUSE_BUTTON_MIDDLE ||
      evt.button === MOUSE_BUTTON_RIGHT ||
      (evt.button === MOUSE_BUTTON_LEFT && tool === "hand")
    ) {
      panningRef.current = {
        startX: evt.clientX,
        startY: evt.clientY,
        origin: { ...offset },
      };
      stage.container().style.cursor = "grabbing";
      evt.preventDefault();
      return;
    }

    if (!canEdit || tool === "hand") return;

    const p = getStagePointer(stage);
    if (!p) return;

    if (tool === "pen") {
      startDraft({ kind: "pen", points: [p.x, p.y], color, width: strokeWidth });
    } else if (tool === "rect") {
      startDraft({
        kind: "rect",
        x: p.x,
        y: p.y,
        width: 0,
        height: 0,
        color,
        fill,
        strokeWidth,
      });
    } else if (tool === "ellipse") {
      startDraft({
        kind: "ellipse",
        x: p.x,
        y: p.y,
        radiusX: 0,
        radiusY: 0,
        color,
        fill,
        strokeWidth,
      });
    } else if (tool === "arrow") {
      startDraft({
        kind: "arrow",
        points: [p.x, p.y, p.x, p.y],
        color,
        strokeWidth,
      });
    } else if (tool === "eraser") {
      eraseBufferRef.current = new Set();
      testEraseAt(p.x, p.y);
    }
  };

  const handlePointerMove = (e: Konva.KonvaEventObject<PointerEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    if (panningRef.current) {
      const dx = e.evt.clientX - panningRef.current.startX;
      const dy = e.evt.clientY - panningRef.current.startY;
      commitView({
        scale: currentView.scale,
        offsetX: panningRef.current.origin.x + dx,
        offsetY: panningRef.current.origin.y + dy,
      });
      return;
    }

    const p = getStagePointer(stage);
    if (!p) return;
    onPointerGlobal?.(p.x, p.y);

    if (!canEdit) return;

    if (draft) {
      if (draft.kind === "pen") {
        extendDraft({ ...draft, points: [...draft.points, p.x, p.y] });
      } else if (draft.kind === "rect") {
        extendDraft({ ...draft, width: p.x - draft.x, height: p.y - draft.y });
      } else if (draft.kind === "ellipse") {
        extendDraft({ ...draft, radiusX: Math.abs(p.x - draft.x), radiusY: Math.abs(p.y - draft.y) });
      } else if (draft.kind === "arrow") {
        const [x1, y1] = draft.points;
        extendDraft({ ...draft, points: [x1, y1, p.x, p.y] });
      }
    } else if (tool === "eraser" && e.evt.buttons) {
      testEraseAt(p.x, p.y);
    }
  };

  const handlePointerUp = () => {
    if (panningRef.current) {
      panningRef.current = null;
      const stage = stageRef?.current;
      if (stage) stage.container().style.cursor = "";
      return;
    }

    if (draft) {
      const zero =
        (draft.kind === "rect" && draft.width === 0 && draft.height === 0) ||
        (draft.kind === "ellipse" && draft.radiusX === 0 && draft.radiusY === 0) ||
        (draft.kind === "arrow" &&
          draft.points[0] === draft.points[2] &&
          draft.points[1] === draft.points[3]) ||
        (draft.kind === "pen" && draft.points.length < MIN_PEN_POINTS);
      if (!zero) commitDraft(draft);
      else setDraft(null);
      onDraftEnd?.();
      return;
    }

    if (tool === "eraser" && eraseBufferRef.current.size > 0) {
      onErase?.({ strokeIds: Array.from(eraseBufferRef.current) });
      eraseBufferRef.current = new Set();
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="dot-grid absolute inset-0"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
      />
      <Stage
        ref={stageRef}
        width={viewport.w}
        height={viewport.h}
        scaleX={scale}
        scaleY={scale}
        x={offset.x}
        y={offset.y}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ cursor: panningRef.current ? "grabbing" : CURSOR_BY_TOOL[tool] ?? "default" }}
      >
        <Layer listening={false}>
          {existingParsed.map((s) => (
            <StrokeShape
              key={s.id}
              payload={s.payload}
              opacity={eraseBufferRef.current.has(s.id) ? ERASE_PREVIEW_OPACITY : 1}
            />
          ))}
          {liveDrafts?.map((d) => (
            <StrokeShape key={`live-${d.id}`} payload={d.payload} opacity={LIVE_DRAFT_OPACITY} />
          ))}
          {draft && <StrokeShape payload={draft} opacity={DRAFT_OPACITY} />}
        </Layer>
      </Stage>

      {overlay}
    </div>
  );
}

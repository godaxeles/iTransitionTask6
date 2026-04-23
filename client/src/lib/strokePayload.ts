import { StrokeKind } from "./types";

const DEFAULT_TEXT_WIDTH = 120;

const DEFAULT_TEXT_HEIGHT = 20;

const MIN_LENGTH_SQUARED = 1;

const MIN_DIMENSION_GUARD = 1;

export interface PenPayload {
  kind: "pen";
  points: number[];
  color: string;
  width: number;
}

export interface RectPayload {
  kind: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fill: string | null;
  strokeWidth: number;
}

export interface EllipsePayload {
  kind: "ellipse";
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  color: string;
  fill: string | null;
  strokeWidth: number;
}

export interface ArrowPayload {
  kind: "arrow";
  points: [number, number, number, number];
  color: string;
  strokeWidth: number;
}

export interface TextPayload {
  kind: "text";
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

export interface StickyPayload {
  kind: "sticky";
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
}

export type StrokePayload =
  | PenPayload
  | RectPayload
  | EllipsePayload
  | ArrowPayload
  | TextPayload
  | StickyPayload;

export function parsePayload(kind: StrokeKind, json: string): StrokePayload | null {
  try {
    const data = JSON.parse(json);
    switch (kind) {
      case StrokeKind.Pen:
        return { kind: "pen", ...data } as PenPayload;
      case StrokeKind.Rectangle:
        return { kind: "rect", ...data } as RectPayload;
      case StrokeKind.Ellipse:
        return { kind: "ellipse", ...data } as EllipsePayload;
      case StrokeKind.Arrow:
        return { kind: "arrow", ...data } as ArrowPayload;
      case StrokeKind.Text:
        return { kind: "text", ...data } as TextPayload;
      case StrokeKind.Sticky:
        return { kind: "sticky", ...data } as StickyPayload;
      default:
        return null;
    }
  } catch {
    return null;
  }
}

export function kindOf(payload: StrokePayload): StrokeKind {
  switch (payload.kind) {
    case "pen":
      return StrokeKind.Pen;
    case "rect":
      return StrokeKind.Rectangle;
    case "ellipse":
      return StrokeKind.Ellipse;
    case "arrow":
      return StrokeKind.Arrow;
    case "text":
      return StrokeKind.Text;
    case "sticky":
      return StrokeKind.Sticky;
  }
}

export function serializePayload(payload: StrokePayload): string {
  const clone: Record<string, unknown> = { ...payload };
  delete clone.kind;
  return JSON.stringify(clone);
}

function penStrokeHitTest(pen: PenPayload, px: number, py: number, radius: number): boolean {
  const pts = pen.points;
  for (let i = 0; i + 1 < pts.length; i += 2) {
    const dx = pts[i] - px;
    const dy = pts[i + 1] - py;
    if (dx * dx + dy * dy <= radius * radius) return true;
  }
  return false;
}

export function shapeHit(payload: StrokePayload, px: number, py: number, radius: number): boolean {
  switch (payload.kind) {
    case "pen":
      return penStrokeHitTest(payload, px, py, radius);
    case "rect": {
      const x0 = Math.min(payload.x, payload.x + payload.width);
      const x1 = Math.max(payload.x, payload.x + payload.width);
      const y0 = Math.min(payload.y, payload.y + payload.height);
      const y1 = Math.max(payload.y, payload.y + payload.height);
      return px >= x0 - radius && px <= x1 + radius && py >= y0 - radius && py <= y1 + radius;
    }
    case "ellipse": {
      const nx = (px - payload.x) / Math.max(payload.radiusX + radius, MIN_DIMENSION_GUARD);
      const ny = (py - payload.y) / Math.max(payload.radiusY + radius, MIN_DIMENSION_GUARD);
      return nx * nx + ny * ny <= 1;
    }
    case "arrow": {
      const [x1, y1, x2, y2] = payload.points;
      const relX = px - x1;
      const relY = py - y1;
      const segX = x2 - x1;
      const segY = y2 - y1;
      const dot = relX * segX + relY * segY;
      const lenSq = segX * segX + segY * segY || MIN_LENGTH_SQUARED;
      const t = Math.max(0, Math.min(1, dot / lenSq));
      const hx = x1 + t * segX;
      const hy = y1 + t * segY;
      const dx = px - hx;
      const dy = py - hy;
      return dx * dx + dy * dy <= radius * radius;
    }
    case "text":
    case "sticky": {
      const w = "width" in payload ? payload.width : DEFAULT_TEXT_WIDTH;
      const h = "height" in payload ? payload.height : payload.fontSize ?? DEFAULT_TEXT_HEIGHT;
      return px >= payload.x && px <= payload.x + w && py >= payload.y && py <= payload.y + h;
    }
  }
}

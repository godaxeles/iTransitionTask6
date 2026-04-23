import { parsePayload } from "../../lib/strokePayload";
import type { Stroke } from "../../lib/types";

const DEFAULT_WIDTH = 58;

const DEFAULT_HEIGHT = 44;

const PADDING = 8;

const MIN_DIMENSION = 1;

const TEXT_WIDTH_RATIO = 0.5;

const TEXT_MIN_WIDTH = 40;

const TEXT_BASELINE_RATIO = 0.8;

const RECT_RADIUS = 2;

interface Props {
  strokes: Stroke[];
  width?: number;
  height?: number;
}

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function PagePreview({ strokes, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT }: Props) {
  const parsed = strokes
    .map((s) => parsePayload(s.kind, s.payloadJson))
    .filter((p): p is NonNullable<typeof p> => p !== null);

  if (parsed.length === 0) {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        <rect width={width} height={height} fill="var(--paper)" />
      </svg>
    );
  }

  const bbox: BoundingBox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

  for (const p of parsed) {
    switch (p.kind) {
      case "pen":
        for (let i = 0; i < p.points.length; i += 2) {
          bbox.minX = Math.min(bbox.minX, p.points[i]);
          bbox.maxX = Math.max(bbox.maxX, p.points[i]);
          bbox.minY = Math.min(bbox.minY, p.points[i + 1]);
          bbox.maxY = Math.max(bbox.maxY, p.points[i + 1]);
        }
        break;
      case "rect": {
        const x0 = Math.min(p.x, p.x + p.width);
        const x1 = Math.max(p.x, p.x + p.width);
        const y0 = Math.min(p.y, p.y + p.height);
        const y1 = Math.max(p.y, p.y + p.height);
        bbox.minX = Math.min(bbox.minX, x0);
        bbox.maxX = Math.max(bbox.maxX, x1);
        bbox.minY = Math.min(bbox.minY, y0);
        bbox.maxY = Math.max(bbox.maxY, y1);
        break;
      }
      case "ellipse":
        bbox.minX = Math.min(bbox.minX, p.x - p.radiusX);
        bbox.maxX = Math.max(bbox.maxX, p.x + p.radiusX);
        bbox.minY = Math.min(bbox.minY, p.y - p.radiusY);
        bbox.maxY = Math.max(bbox.maxY, p.y + p.radiusY);
        break;
      case "arrow":
        bbox.minX = Math.min(bbox.minX, p.points[0], p.points[2]);
        bbox.maxX = Math.max(bbox.maxX, p.points[0], p.points[2]);
        bbox.minY = Math.min(bbox.minY, p.points[1], p.points[3]);
        bbox.maxY = Math.max(bbox.maxY, p.points[1], p.points[3]);
        break;
      case "text":
        bbox.minX = Math.min(bbox.minX, p.x);
        bbox.maxX = Math.max(bbox.maxX, p.x + Math.max(p.text.length * p.fontSize * TEXT_WIDTH_RATIO, TEXT_MIN_WIDTH));
        bbox.minY = Math.min(bbox.minY, p.y);
        bbox.maxY = Math.max(bbox.maxY, p.y + p.fontSize);
        break;
      case "sticky":
        bbox.minX = Math.min(bbox.minX, p.x);
        bbox.maxX = Math.max(bbox.maxX, p.x + p.width);
        bbox.minY = Math.min(bbox.minY, p.y);
        bbox.maxY = Math.max(bbox.maxY, p.y + p.height);
        break;
    }
  }

  if (!Number.isFinite(bbox.minX)) {
    bbox.minX = 0;
    bbox.maxX = width;
    bbox.minY = 0;
    bbox.maxY = height;
  }

  const bbW = Math.max(MIN_DIMENSION, bbox.maxX - bbox.minX);

  const bbH = Math.max(MIN_DIMENSION, bbox.maxY - bbox.minY);

  const viewBox = `${bbox.minX - PADDING} ${bbox.minY - PADDING} ${bbW + PADDING * 2} ${bbH + PADDING * 2}`;

  return (
    <svg viewBox={viewBox} width={width} height={height} preserveAspectRatio="xMidYMid slice">
      <rect
        x={bbox.minX - PADDING}
        y={bbox.minY - PADDING}
        width={bbW + PADDING * 2}
        height={bbH + PADDING * 2}
        fill="var(--paper)"
      />
      {parsed.map((p, i) => {
        switch (p.kind) {
          case "pen": {
            const pts: string[] = [];
            for (let k = 0; k < p.points.length; k += 2) {
              pts.push(`${p.points[k]},${p.points[k + 1]}`);
            }
            return (
              <polyline
                key={i}
                points={pts.join(" ")}
                stroke={p.color}
                strokeWidth={p.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          }
          case "rect":
            return (
              <rect
                key={i}
                x={Math.min(p.x, p.x + p.width)}
                y={Math.min(p.y, p.y + p.height)}
                width={Math.abs(p.width)}
                height={Math.abs(p.height)}
                stroke={p.color}
                strokeWidth={p.strokeWidth}
                fill={p.fill ?? "transparent"}
                rx={RECT_RADIUS}
              />
            );
          case "ellipse":
            return (
              <ellipse
                key={i}
                cx={p.x}
                cy={p.y}
                rx={Math.abs(p.radiusX)}
                ry={Math.abs(p.radiusY)}
                stroke={p.color}
                strokeWidth={p.strokeWidth}
                fill={p.fill ?? "transparent"}
              />
            );
          case "arrow":
            return (
              <line
                key={i}
                x1={p.points[0]}
                y1={p.points[1]}
                x2={p.points[2]}
                y2={p.points[3]}
                stroke={p.color}
                strokeWidth={p.strokeWidth}
                strokeLinecap="round"
              />
            );
          case "text":
            return (
              <text
                key={i}
                x={p.x}
                y={p.y + p.fontSize * TEXT_BASELINE_RATIO}
                fill={p.color}
                fontSize={p.fontSize}
                fontFamily="Geist, Inter, sans-serif"
              >
                {p.text}
              </text>
            );
          case "sticky":
            return (
              <rect
                key={i}
                x={p.x}
                y={p.y}
                width={p.width}
                height={p.height}
                fill={p.color}
                rx={RECT_RADIUS}
              />
            );
        }
      })}
    </svg>
  );
}

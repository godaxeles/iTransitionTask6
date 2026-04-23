import { Arrow, Ellipse, Line, Rect, Text, Group } from "react-konva";
import type { StrokePayload } from "../../lib/strokePayload";

const PEN_TENSION = 0.3;

const RECT_CORNER_RADIUS = 4;

const ARROW_POINTER_SIZE = 7;

const STICKY_CORNER_RADIUS = 6;

const STICKY_SHADOW_BLUR = 8;

const STICKY_SHADOW_OFFSET_Y = 2;

const STICKY_SHADOW_COLOR = "rgba(16, 14, 10, 0.18)";

const STICKY_TEXT_INSET = 10;

const STICKY_TEXT_PAD = 20;

const STICKY_TEXT_FONT_SIZE = 14;

const STICKY_TEXT_COLOR = "#1A1A18";

const FONT_FAMILY = "Geist, Inter, sans-serif";

interface Props {
  payload: StrokePayload;
  opacity?: number;
}

export function StrokeShape({ payload, opacity = 1 }: Props) {
  switch (payload.kind) {
    case "pen":
      return (
        <Line
          points={payload.points}
          stroke={payload.color}
          strokeWidth={payload.width}
          lineCap="round"
          lineJoin="round"
          tension={PEN_TENSION}
          opacity={opacity}
          listening={false}
        />
      );
    case "rect":
      return (
        <Rect
          x={Math.min(payload.x, payload.x + payload.width)}
          y={Math.min(payload.y, payload.y + payload.height)}
          width={Math.abs(payload.width)}
          height={Math.abs(payload.height)}
          stroke={payload.color}
          strokeWidth={payload.strokeWidth}
          fill={payload.fill ?? undefined}
          cornerRadius={RECT_CORNER_RADIUS}
          opacity={opacity}
          listening={false}
        />
      );
    case "ellipse":
      return (
        <Ellipse
          x={payload.x}
          y={payload.y}
          radiusX={Math.abs(payload.radiusX)}
          radiusY={Math.abs(payload.radiusY)}
          stroke={payload.color}
          strokeWidth={payload.strokeWidth}
          fill={payload.fill ?? undefined}
          opacity={opacity}
          listening={false}
        />
      );
    case "arrow":
      return (
        <Arrow
          points={payload.points as unknown as number[]}
          stroke={payload.color}
          fill={payload.color}
          strokeWidth={payload.strokeWidth}
          pointerLength={ARROW_POINTER_SIZE}
          pointerWidth={ARROW_POINTER_SIZE}
          lineCap="round"
          opacity={opacity}
          listening={false}
        />
      );
    case "text":
      return (
        <Text
          x={payload.x}
          y={payload.y}
          text={payload.text}
          fill={payload.color}
          fontSize={payload.fontSize}
          fontFamily={FONT_FAMILY}
          opacity={opacity}
          listening={false}
        />
      );
    case "sticky":
      return (
        <Group x={payload.x} y={payload.y} opacity={opacity} listening={false}>
          <Rect
            width={payload.width}
            height={payload.height}
            fill={payload.color}
            cornerRadius={STICKY_CORNER_RADIUS}
            shadowColor={STICKY_SHADOW_COLOR}
            shadowBlur={STICKY_SHADOW_BLUR}
            shadowOffsetY={STICKY_SHADOW_OFFSET_Y}
          />
          <Text
            x={STICKY_TEXT_INSET}
            y={STICKY_TEXT_INSET}
            text={payload.text}
            fill={STICKY_TEXT_COLOR}
            fontSize={STICKY_TEXT_FONT_SIZE}
            fontFamily={FONT_FAMILY}
            width={payload.width - STICKY_TEXT_PAD}
            height={payload.height - STICKY_TEXT_PAD}
          />
        </Group>
      );
  }
}

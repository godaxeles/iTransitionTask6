const CURSOR_WIDTH = 20;

const CURSOR_HEIGHT = 22;

const LABEL_SHADOW = "drop-shadow(0 2px 4px rgba(16,14,10,0.18))";

interface Cursor {
  userName: string;
  color: string;
  x: number;
  y: number;
}

interface Props {
  cursors: Cursor[];
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function PresenceOverlay({ cursors, scale, offsetX, offsetY }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {cursors.map((c) => {
        const sx = c.x * scale + offsetX;
        const sy = c.y * scale + offsetY;
        return (
          <div
            key={c.userName}
            className="absolute transition-[transform] duration-75 ease-linear"
            style={{ transform: `translate3d(${sx}px, ${sy}px, 0)` }}
          >
            <svg
              width={CURSOR_WIDTH}
              height={CURSOR_HEIGHT}
              viewBox={`0 0 ${CURSOR_WIDTH} ${CURSOR_HEIGHT}`}
              style={{ filter: LABEL_SHADOW }}
            >
              <path
                d="M2 2 L2 18 L7 13 L11 20 L13 19 L9 12 L16 12 Z"
                fill={c.color}
                stroke="#fff"
                strokeWidth="1.25"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="ml-3 inline-block -translate-y-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-white shadow-1"
              style={{ background: c.color }}
            >
              {c.userName}
            </span>
          </div>
        );
      })}
    </div>
  );
}

import {
  ArrowUpRight,
  Circle,
  Eraser,
  Hand,
  PenLine,
  Square,
  StickyNote,
  Trash2,
  Type,
} from "lucide-react";
import { SWATCHES, useWorkspaceStore, type Tool } from "../../stores/workspaceStore";
import { cn } from "../../lib/cn";

const ICON_SIZE = 17;

const ICON_STROKE_WIDTH = 1.75;

const STROKE_WIDTH_MIN = 1;

const STROKE_WIDTH_MAX = 14;

const STROKE_WIDTH_STEP = 1;

const WHITE_SWATCH = "#FFFFFF";

interface Props {
  onClear: () => void;
  disabled?: boolean;
  disabledReason?: string;
}

const TOOL_DEFS: Array<{ tool: Tool; label: string; icon: React.ReactNode }> = [
  { tool: "hand",    label: "Hand — drag to pan", icon: <Hand         size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} /> },
  { tool: "pen",     label: "Pen",                 icon: <PenLine      size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} /> },
  { tool: "eraser",  label: "Eraser",              icon: <Eraser       size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} /> },
  { tool: "rect",    label: "Rectangle",           icon: <Square       size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} /> },
  { tool: "ellipse", label: "Ellipse",             icon: <Circle       size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} /> },
  { tool: "arrow",   label: "Arrow",               icon: <ArrowUpRight size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} /> },
  { tool: "text",    label: "Text",                icon: <Type         size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} /> },
  { tool: "sticky",  label: "Sticky",              icon: <StickyNote   size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} /> },
];

const TOOLS_WITH_STYLE_ROW: ReadonlySet<Tool> = new Set<Tool>(["pen", "rect", "ellipse", "arrow", "text"]);

export function Toolbar({ onClear, disabled = false, disabledReason }: Props) {
  const tool = useWorkspaceStore((s) => s.tool);

  const setTool = useWorkspaceStore((s) => s.setTool);

  const color = useWorkspaceStore((s) => s.color);

  const setColor = useWorkspaceStore((s) => s.setColor);

  const strokeWidth = useWorkspaceStore((s) => s.strokeWidth);

  const setStrokeWidth = useWorkspaceStore((s) => s.setStrokeWidth);

  const showStyleRow = TOOLS_WITH_STYLE_ROW.has(tool);

  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
      {disabled && disabledReason && (
        <div
          className="mb-2 rounded-full border border-border bg-paper/90 px-3 py-1.5 text-center text-[12px] text-ink-3 shadow-1 backdrop-blur-md"
          role="status"
        >
          {disabledReason}
        </div>
      )}
      {!disabled && showStyleRow && (
        <div className="mb-2 flex items-center gap-3 rounded-[14px] border border-border bg-paper/85 px-3 py-2 shadow-glass backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            {SWATCHES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setColor(s)}
                className={cn(
                  "h-5 w-5 rounded-full border transition",
                  color === s
                    ? "border-ink-0 ring-2 ring-offset-2 ring-offset-paper"
                    : "border-border-strong hover:scale-110",
                )}
                style={{
                  background: s,
                  boxShadow: s === WHITE_SWATCH ? "inset 0 0 0 1px var(--border)" : undefined,
                }}
                aria-label={`Color ${s}`}
              />
            ))}
          </div>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={STROKE_WIDTH_MIN}
              max={STROKE_WIDTH_MAX}
              step={STROKE_WIDTH_STEP}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value, 10))}
              className="accent-accent"
              aria-label="Stroke width"
            />
            <span className="t-mono w-6 text-right">{strokeWidth}</span>
          </div>
        </div>
      )}

      <div
        className={cn(
          "flex items-center gap-1 rounded-[14px] border border-border bg-paper/85 p-1.5 shadow-glass backdrop-blur-md",
          disabled && "pointer-events-none opacity-50",
        )}
        aria-disabled={disabled}
      >
        {TOOL_DEFS.map((t) => (
          <button
            key={t.tool}
            type="button"
            onClick={() => setTool(t.tool)}
            disabled={disabled}
            className={cn(
              "flex h-[38px] w-[38px] items-center justify-center rounded-[10px] transition",
              tool === t.tool
                ? "bg-ink-0 text-paper shadow-1"
                : "text-ink-2 hover:bg-ink-9 hover:text-ink-0",
            )}
            aria-label={t.label}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}
        <div className="mx-1 h-6 w-px bg-border" />
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] text-ink-3 transition hover:bg-[color:var(--accent-soft)] hover:text-danger"
          aria-label="Clear page"
          title="Clear page"
        >
          <Trash2 size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} />
        </button>
      </div>
    </div>
  );
}

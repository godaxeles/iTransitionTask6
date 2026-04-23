import { Plus, Trash2 } from "lucide-react";
import type { Page, Stroke } from "../../lib/types";
import { PagePreview } from "./PagePreview";
import { cn } from "../../lib/cn";
import { useConfirm } from "../../stores/useConfirm";

const PREVIEW_WIDTH = 58;

const PREVIEW_HEIGHT = 44;

const DELETE_ICON_SIZE = 11;

const DELETE_ICON_STROKE_WIDTH = 2;

const ADD_ICON_SIZE = 18;

const ADD_ICON_STROKE_WIDTH = 1.75;

const PAGE_INDEX_PAD = 2;

interface Props {
  pages: Page[];
  activePageId: string;
  strokesByPage: Record<string, Stroke[]>;
  erasedIds: Set<string>;
  canAddPages: boolean;
  canDeletePages: boolean;
  onSelect: (pageId: string) => void;
  onAdd: () => void;
  onDelete: (pageId: string) => void;
}

export function PagesStrip({
  pages,
  activePageId,
  strokesByPage,
  erasedIds,
  canAddPages,
  canDeletePages,
  onSelect,
  onAdd,
  onDelete,
}: Props) {
  const ask = useConfirm((s) => s.ask);

  return (
    <div className="pointer-events-auto absolute left-3 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-2 rounded-[14px] border border-border bg-paper/85 p-2 shadow-glass backdrop-blur-md">
      <div className="flex max-h-[68vh] flex-col gap-2 overflow-y-auto hide-scrollbar">
        {pages.map((p, i) => {
          const isActive = p.id === activePageId;
          const strokes = [...p.strokes, ...(strokesByPage[p.id] ?? [])].filter(
            (s) => !erasedIds.has(s.id),
          );
          return (
            <div key={p.id} className="group/page relative">
              <button
                type="button"
                onClick={() => onSelect(p.id)}
                className={cn(
                  "group flex flex-col items-center gap-1 rounded-lg transition",
                  isActive && "ring-[2px] ring-accent ring-offset-2 ring-offset-paper",
                )}
                aria-label={`${p.name} (page ${i + 1})`}
                title={p.name}
              >
                <div
                  className="relative overflow-hidden rounded-[6px] border border-border bg-paper"
                  style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
                >
                  <PagePreview strokes={strokes} width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} />
                </div>
                <span className={cn("t-mono leading-none", isActive ? "text-ink-0" : "text-ink-4")}>
                  {String(i + 1).padStart(PAGE_INDEX_PAD, "0")}
                </span>
              </button>

              {canDeletePages && pages.length > 1 && (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const ok = await ask({
                      title: "Delete page?",
                      message: `Strokes on "${p.name}" will be lost.`,
                      confirmLabel: "Delete page",
                    });
                    if (ok) onDelete(p.id);
                  }}
                  className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-ink-0 text-paper opacity-0 shadow-2 transition hover:bg-danger group-hover/page:opacity-100 focus:opacity-100"
                  aria-label="Delete page"
                  title="Delete page"
                >
                  <Trash2 size={DELETE_ICON_SIZE} strokeWidth={DELETE_ICON_STROKE_WIDTH} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {canAddPages && (
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center justify-center rounded-[6px] border-[1.5px] border-dashed border-border-strong text-ink-4 transition hover:border-ink-4 hover:text-ink-0"
          style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
          aria-label="Add page"
          title="Add page"
        >
          <Plus size={ADD_ICON_SIZE} strokeWidth={ADD_ICON_STROKE_WIDTH} />
        </button>
      )}
    </div>
  );
}

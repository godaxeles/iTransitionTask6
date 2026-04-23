import { Clock, MoreHorizontal, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { BoardThumbnail } from "./BoardThumbnail";
import { formatRelative } from "../lib/formatRelative";
import type { BoardSummary } from "../lib/types";
import { useConfirm } from "../stores/useConfirm";

const META_ICON_SIZE = 12;

const META_STROKE_WIDTH = 1.75;

const MENU_ICON_SIZE = 16;

const DELETE_ICON_SIZE = 14;

interface Props {
  board: BoardSummary;
  onDelete?: (id: string) => void;
}

export function BoardCard({ board, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const ask = useConfirm((s) => s.ask);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    const ok = await ask({
      title: "Delete board?",
      message: `"${board.title}" and all its pages will be gone. This can't be undone.`,
      confirmLabel: "Delete board",
    });
    if (ok) onDelete?.(board.id);
  };

  return (
    <div className="group relative">
      <Link
        to={`/boards/${board.id}`}
        className="flex flex-col overflow-hidden rounded-lg border border-border bg-paper shadow-1 transition duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-3"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-ink-9">
          {board.thumbnailDataUrl ? (
            <img
              src={board.thumbnailDataUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <BoardThumbnail seed={board.id} className="h-full w-full" />
          )}
        </div>

        <div className="flex items-start justify-between gap-2 p-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[14.5px] font-medium text-ink-1">{board.title}</h3>
            <div className="mt-1.5 flex items-center gap-3 text-ink-4">
              <span className="inline-flex items-center gap-1 text-[12px]">
                <Users size={META_ICON_SIZE} strokeWidth={META_STROKE_WIDTH} />
                {board.collaboratorCount}
              </span>
              <span className="inline-flex items-center gap-1 text-[12px]">
                <Clock size={META_ICON_SIZE} strokeWidth={META_STROKE_WIDTH} />
                {formatRelative(board.updatedAt)}
              </span>
              <span className="text-[12px]">
                {board.pageCount} {board.pageCount === 1 ? "page" : "pages"}
              </span>
            </div>
          </div>
          {onDelete && <span className="h-7 w-7 shrink-0" aria-hidden />}
        </div>
      </Link>

      {onDelete && (
        <>
          <button
            type="button"
            className="absolute right-2 top-2 z-10 rounded-md bg-paper/85 p-1.5 text-ink-3 opacity-0 shadow-1 backdrop-blur-sm transition hover:bg-paper hover:text-ink-0 group-hover:opacity-100 focus:opacity-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            aria-label="Board options"
          >
            <MoreHorizontal size={MENU_ICON_SIZE} strokeWidth={META_STROKE_WIDTH} />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div className="absolute right-2 top-10 z-30 w-44 overflow-hidden rounded-lg border border-border bg-paper shadow-3">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-danger hover:bg-[color:var(--accent-soft)]"
                  onClick={handleDelete}
                >
                  <Trash2 size={DELETE_ICON_SIZE} strokeWidth={META_STROKE_WIDTH} />
                  Delete board
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

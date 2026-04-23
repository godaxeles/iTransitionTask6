import { ChevronLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PlotLogo } from "../PlotLogo";
import { cn } from "../../lib/cn";

const BACK_ICON_SIZE = 16;

const BACK_ICON_STROKE_WIDTH = 2;

const LOGO_SIZE = 20;

const MIN_INPUT_WIDTH_CH = 8;

const MAX_TITLE_LENGTH = 120;

interface Props {
  title: string;
  saving: boolean;
  onRename: (title: string) => void;
  canEdit: boolean;
  connection?: "connecting" | "connected" | "reconnecting" | "disconnected";
}

export function TitleBar({ title, saving, onRename, canEdit, connection = "connected" }: Props) {
  const [editing, setEditing] = useState(false);

  const [draft, setDraft] = useState(title);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(title);
  }, [title, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed.length > 0 && trimmed !== title) onRename(trimmed);
    else setDraft(title);
    setEditing(false);
  };

  return (
    <div className="pointer-events-auto absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-border bg-paper py-1.5 pl-2 pr-3 shadow-1">
      <Link
        to="/boards"
        className="flex h-7 w-7 items-center justify-center rounded-full text-ink-3 hover:bg-ink-9 hover:text-ink-0"
        aria-label="Back to boards"
      >
        <ChevronLeft size={BACK_ICON_SIZE} strokeWidth={BACK_ICON_STROKE_WIDTH} />
      </Link>
      <PlotLogo size={LOGO_SIZE} withWordmark={false} />
      <span className="text-ink-6">/</span>
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            else if (e.key === "Escape") {
              setDraft(title);
              setEditing(false);
            }
          }}
          className="bg-transparent text-[13.5px] font-medium text-ink-0 outline-none"
          style={{ width: `${Math.max(MIN_INPUT_WIDTH_CH, draft.length + 1)}ch` }}
          maxLength={MAX_TITLE_LENGTH}
        />
      ) : (
        <button
          type="button"
          onClick={() => canEdit && setEditing(true)}
          className={cn(
            "text-[13.5px] font-medium text-ink-0",
            canEdit && "cursor-text hover:text-ink-2",
          )}
          disabled={!canEdit}
          title={canEdit ? "Click to rename" : undefined}
        >
          {title}
        </button>
      )}
      <span className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-ink-9 px-2 py-0.5 text-[11px] text-ink-3">
        <span
          className={cn(
            "inline-block h-1.5 w-1.5 rounded-full",
            connection === "disconnected" && "bg-danger",
            connection === "reconnecting" && "animate-pulse bg-warn",
            connection === "connecting" && "animate-pulse bg-warn",
            connection === "connected" && saving && "animate-pulse bg-warn",
            connection === "connected" && !saving && "bg-success",
          )}
        />
        {connection === "disconnected" && "Offline"}
        {connection === "reconnecting" && "Reconnecting…"}
        {connection === "connecting" && "Connecting…"}
        {connection === "connected" && (saving ? "Saving…" : "Saved")}
      </span>
    </div>
  );
}

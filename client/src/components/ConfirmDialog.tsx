import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "../lib/cn";

const ICON_SIZE = 18;

const CLOSE_ICON_SIZE = 16;

const ICON_STROKE_WIDTH = 1.75;

interface Props {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "neutral";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
}: Props) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmBtnRef.current?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: "rgba(10,10,10,0.4)", backdropFilter: "blur(6px)" }}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="w-[420px] max-w-full overflow-hidden rounded-[14px] bg-paper shadow-4"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start gap-3 p-5">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              tone === "danger" ? "bg-[color:var(--accent-soft)] text-danger" : "bg-ink-9 text-ink-2",
            )}
          >
            <AlertTriangle size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 id="confirm-title" className="t-h3">
              {title}
            </h3>
            {message && <p className="t-sm mt-1 text-ink-3">{message}</p>}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md p-1 text-ink-4 hover:bg-ink-9 hover:text-ink-0"
            aria-label="Close"
          >
            <X size={CLOSE_ICON_SIZE} />
          </button>
        </header>
        <footer className="flex items-center justify-end gap-2 border-t border-border bg-ink-9 px-5 py-3">
          <button type="button" onClick={onCancel} className="btn btn-outline">
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className={cn(
              "btn inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-[13.5px] font-medium text-white transition",
              tone === "danger"
                ? "bg-danger shadow-1 hover:brightness-[0.92] active:brightness-[0.85]"
                : "bg-ink-0 shadow-1 hover:bg-ink-1",
            )}
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}

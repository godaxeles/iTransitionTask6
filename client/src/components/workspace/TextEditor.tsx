import { useEffect, useRef, useState } from "react";

const Z_INDEX = 40;

const MIN_WIDTH_PX = 140;

const HEIGHT_PADDING_PX = 12;

const BORDER_RADIUS_PX = 4;

const PADDING = "4px 6px";

const BACKGROUND = "rgba(255,255,255,0.95)";

const BORDER = "1.5px dashed var(--accent)";

const BOX_SHADOW = "var(--shadow-2)";

const FONT_FAMILY = "Geist, Inter, sans-serif";

export interface TextDraft {
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

interface Props {
  draft: TextDraft;
  scale: number;
  offsetX: number;
  offsetY: number;
  onCommit: (text: string) => void;
  onCancel: () => void;
}

export function TextEditor({ draft, scale, offsetX, offsetY, onCommit, onCancel }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const [value, setValue] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.select();
  }, []);

  const submit = (commit: boolean) => {
    const trimmed = value.trim();
    if (commit && trimmed.length > 0) onCommit(trimmed);
    else onCancel();
  };

  return (
    <textarea
      ref={ref}
      autoFocus
      value={value}
      placeholder="Type…"
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => submit(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          submit(true);
        } else if (e.key === "Escape") {
          e.preventDefault();
          submit(false);
        }
      }}
      style={{
        position: "absolute",
        zIndex: Z_INDEX,
        left: draft.x * scale + offsetX,
        top: draft.y * scale + offsetY,
        fontSize: draft.fontSize * scale,
        color: draft.color,
        background: BACKGROUND,
        border: BORDER,
        borderRadius: BORDER_RADIUS_PX,
        outline: "none",
        padding: PADDING,
        minWidth: MIN_WIDTH_PX,
        minHeight: draft.fontSize * scale + HEIGHT_PADDING_PX,
        fontFamily: FONT_FAMILY,
        resize: "none",
        overflow: "hidden",
        pointerEvents: "auto",
        boxShadow: BOX_SHADOW,
        caretColor: draft.color,
      }}
    />
  );
}

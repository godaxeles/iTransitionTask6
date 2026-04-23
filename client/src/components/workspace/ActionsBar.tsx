import { Download, Share2 } from "lucide-react";
import { AvatarStack } from "../Avatar";
import { BoardRole } from "../../lib/types";

const AVATAR_SIZE = 24;

const AVATAR_STACK_MAX = 4;

const BUTTON_ICON_SIZE = 14;

const BUTTON_ICON_STROKE_WIDTH = 1.75;

const ROLE_LABEL: Record<number, string> = {
  [BoardRole.Viewer]: "Viewer",
  [BoardRole.Editor]: "Editor",
  [BoardRole.Manager]: "Manager",
};

interface Props {
  people: { name: string; color: string }[];
  selfName: string;
  selfColor: string;
  role: BoardRole | null;
  onShare: () => void;
  onExport: () => void;
}

export function ActionsBar({ people, selfName, selfColor, role, onShare, onExport }: Props) {
  const everyone = [{ name: selfName, color: selfColor }, ...people];

  const total = everyone.length;

  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-20 flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-full border border-border bg-paper py-1 pl-2 pr-3 shadow-1">
        <AvatarStack people={everyone} size={AVATAR_SIZE} max={AVATAR_STACK_MAX} />
        <span className="text-[12px] text-ink-3">
          {total} {total === 1 ? "person" : "people"}
        </span>
        {role !== null && (
          <span
            className="ml-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
            style={{
              background: role === BoardRole.Viewer ? "var(--ink-9)" : "var(--accent-soft)",
              color: role === BoardRole.Viewer ? "var(--ink-4)" : "var(--accent-press)",
            }}
            title={`Your role on this board: ${ROLE_LABEL[role]}`}
          >
            {ROLE_LABEL[role]}
          </span>
        )}
      </div>
      <button type="button" onClick={onShare} className="btn btn-outline">
        <Share2 size={BUTTON_ICON_SIZE} strokeWidth={BUTTON_ICON_STROKE_WIDTH} />
        Share
      </button>
      <button type="button" onClick={onExport} className="btn btn-accent">
        <Download size={BUTTON_ICON_SIZE} strokeWidth={BUTTON_ICON_STROKE_WIDTH} />
        Export
      </button>
    </div>
  );
}

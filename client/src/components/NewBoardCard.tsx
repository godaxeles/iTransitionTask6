import { Plus } from "lucide-react";

const PLUS_ICON_SIZE = 22;

const PLUS_STROKE_WIDTH = 1.75;

interface Props {
  onClick: () => void;
  pending?: boolean;
}

export function NewBoardCard({ onClick, pending }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="group flex aspect-[16/9] flex-col items-center justify-center gap-3 rounded-lg border-[1.5px] border-dashed border-border-strong bg-paper/60 transition duration-200 hover:-translate-y-0.5 hover:border-ink-4 hover:bg-paper disabled:cursor-progress disabled:opacity-60"
      style={{ minHeight: 0 }}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-9 text-ink-3 transition group-hover:bg-ink-0 group-hover:text-paper">
        <Plus size={PLUS_ICON_SIZE} strokeWidth={PLUS_STROKE_WIDTH} />
      </span>
      <span className="t-sm font-medium text-ink-2">
        {pending ? "Creating…" : "New board"}
      </span>
    </button>
  );
}

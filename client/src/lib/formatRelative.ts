const SECOND_MS = 1_000;

const MINUTE_MS = 60 * SECOND_MS;

const HOUR_MS = 60 * MINUTE_MS;

const DAY_MS = 24 * HOUR_MS;

const WEEK_MS = 7 * DAY_MS;

const JUST_NOW_THRESHOLD_MS = 30 * SECOND_MS;

const MAX_WEEKS_BEFORE_DATE = 5;

export function formatRelative(iso: string, now = Date.now()): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "—";

  const diff = now - ts;
  if (diff < JUST_NOW_THRESHOLD_MS) return "just now";
  if (diff < HOUR_MS) return `${Math.round(diff / MINUTE_MS)}m ago`;
  if (diff < DAY_MS) return `${Math.round(diff / HOUR_MS)}h ago`;
  if (diff < WEEK_MS) return `${Math.round(diff / DAY_MS)}d ago`;

  const weeks = Math.round(diff / WEEK_MS);
  if (weeks < MAX_WEEKS_BEFORE_DATE) return `${weeks}w ago`;

  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

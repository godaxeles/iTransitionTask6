import { cn } from "../lib/cn";

const DEFAULT_SIZE = 28;

const WORDMARK_FONT_RATIO = 0.64;

interface PlotLogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export function PlotLogo({ size = DEFAULT_SIZE, withWordmark = true, className }: PlotLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="32" height="32" rx="9" fill="var(--ink-0)" />
        <path
          d="M10 22V10h5.4c2.9 0 4.6 1.6 4.6 4.1 0 2.6-1.7 4.2-4.6 4.2h-2.2V22H10Zm3.2-6.2h1.9c1.3 0 2.1-.6 2.1-1.7s-.8-1.7-2.1-1.7h-1.9v3.4Z"
          fill="var(--paper)"
        />
        <circle cx="23" cy="10" r="2.4" fill="var(--accent)" />
      </svg>
      {withWordmark && (
        <span
          className="font-semibold tracking-tight"
          style={{ fontSize: size * WORDMARK_FONT_RATIO, color: "var(--ink-0)", letterSpacing: "-0.01em" }}
        >
          Plot
        </span>
      )}
    </span>
  );
}

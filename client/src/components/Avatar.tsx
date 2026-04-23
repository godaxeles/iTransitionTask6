import { initialsOf } from "../stores/userStore";
import { cn } from "../lib/cn";

const DEFAULT_AVATAR_SIZE = 28;

const MIN_FONT_SIZE = 10;

const FONT_RATIO = 0.4;

const OVERFLOW_FONT_RATIO = 0.38;

const DEFAULT_STACK_MAX = 4;

interface AvatarProps {
  name: string;
  color: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, color, size = DEFAULT_AVATAR_SIZE, className }: AvatarProps) {
  return (
    <span
      className={cn("avatar", className)}
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: Math.max(MIN_FONT_SIZE, size * FONT_RATIO),
      }}
      title={name}
    >
      {initialsOf(name)}
    </span>
  );
}

interface AvatarStackProps {
  people: { name: string; color: string }[];
  max?: number;
  size?: number;
}

export function AvatarStack({ people, max = DEFAULT_STACK_MAX, size = DEFAULT_AVATAR_SIZE }: AvatarStackProps) {
  const shown = people.slice(0, max);
  const overflow = people.length - shown.length;

  return (
    <div className="flex -space-x-2">
      {shown.map((p, i) => (
        <Avatar key={i} name={p.name} color={p.color} size={size} />
      ))}
      {overflow > 0 && (
        <span
          className="avatar"
          style={{
            width: size,
            height: size,
            background: "var(--ink-8)",
            color: "var(--ink-2)",
            fontSize: Math.max(MIN_FONT_SIZE, size * OVERFLOW_FONT_RATIO),
          }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

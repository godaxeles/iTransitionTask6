const PALETTES: Array<[string, string, string]> = [
  ["#FFE8E4", "#FFCFC7", "#FF6B5B"],
  ["#EAE1FF", "#D7C4FF", "#9B7BFF"],
  ["#E2F3FF", "#C5E4FF", "#5BA3FF"],
  ["#E2F9EE", "#C4F0DD", "#4FD1A5"],
  ["#FFF1D8", "#FFDFA8", "#F5B455"],
  ["#FFE4EF", "#FFC9DE", "#FF7BB5"],
];

const FNV_OFFSET_BASIS = 2166136261;

const FNV_PRIME = 16777619;

const LCG_MULTIPLIER = 9301;

const LCG_INCREMENT = 49297;

const LCG_MODULUS = 233280;

const VIEWBOX_WIDTH = 260;

const VIEWBOX_HEIGHT = 146;

const PATH_COUNT = 3;

const BASE_DOT_COUNT = 4;

const DOT_COUNT_MASK = 3;

const STROKE_BASE_WIDTH = 2;

const STROKE_STEP_WIDTH = 0.6;

const STROKE_BASE_OPACITY = 0.75;

const STROKE_OPACITY_STEP = 0.15;

const DOT_FILL_OPACITY = 0.35;

function hash(str: string): number {
  let h = FNV_OFFSET_BASIS;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, FNV_PRIME);
  }
  return h >>> 0;
}

function seedRand(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * LCG_MULTIPLIER + LCG_INCREMENT) % LCG_MODULUS;
    return s / LCG_MODULUS;
  };
}

interface Props {
  seed: string;
  className?: string;
}

export function BoardThumbnail({ seed, className }: Props) {
  const h = hash(seed);
  const palette = PALETTES[h % PALETTES.length];
  const rand = seedRand(h);

  const paths: string[] = [];
  for (let i = 0; i < PATH_COUNT; i++) {
    const y0 = 30 + rand() * 50;
    const cp1x = 40 + rand() * 60;
    const cp1y = 10 + rand() * 80;
    const cp2x = 120 + rand() * 60;
    const cp2y = 10 + rand() * 80;
    const y1 = 30 + rand() * 50;
    paths.push(`M10 ${y0} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, 250 ${y1}`);
  }

  const dotCount = BASE_DOT_COUNT + (h & DOT_COUNT_MASK);
  const dots: Array<{ x: number; y: number; r: number }> = [];
  for (let i = 0; i < dotCount; i++) {
    dots.push({ x: 20 + rand() * 220, y: 20 + rand() * 100, r: 2 + rand() * 3 });
  }

  const gradId = `thumb-grad-${h}`;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette[0]} />
          <stop offset="100%" stopColor={palette[1]} />
        </linearGradient>
      </defs>
      <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill={`url(#${gradId})`} />
      {dots.map((d, i) => (
        <circle key={`d-${i}`} cx={d.x} cy={d.y} r={d.r} fill={palette[2]} fillOpacity={DOT_FILL_OPACITY} />
      ))}
      {paths.map((d, i) => (
        <path
          key={`p-${i}`}
          d={d}
          stroke={palette[2]}
          strokeWidth={STROKE_BASE_WIDTH + i * STROKE_STEP_WIDTH}
          strokeLinecap="round"
          fill="none"
          opacity={STROKE_BASE_OPACITY - i * STROKE_OPACITY_STEP}
        />
      ))}
    </svg>
  );
}

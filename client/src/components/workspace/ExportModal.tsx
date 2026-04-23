import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type Konva from "konva";
import type { Page, Stroke } from "../../lib/types";
import { PagePreview } from "./PagePreview";
import { cn } from "../../lib/cn";

const DEFAULT_QUALITY = 85;

const MIN_QUALITY = 30;

const MAX_QUALITY = 100;

const PERCENT_SCALE = 100;

const EXPORT_PIXEL_RATIO = 2;

const EXPORT_WIDTH = 1920;

const EXPORT_HEIGHT = 1080;

const PREVIEW_WIDTH = 500;

const PREVIEW_HEIGHT = 281;

const MAX_ALL_PAGES_GRID = 6;

const SIZE_ESTIMATE_SLOPE = 0.018;

const SIZE_ESTIMATE_INTERCEPT = 0.6;

const SIZE_ESTIMATE_PRECISION = 2;

const PAGE_INDEX_PAD = 2;

const CLOSE_ICON_SIZE = 18;

const CLOSE_ICON_STROKE_WIDTH = 1.75;

const FALLBACK_SAFE_NAME = "plot";

const CANVAS_BG = "#FAFAF7";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

type Format = "jpeg" | "png";

type Scope = "current" | "all";

interface Props {
  boardTitle: string;
  pages: Page[];
  activePageId: string;
  strokesByPage: Record<string, Stroke[]>;
  erasedIds: Set<string>;
  stageRef: React.RefObject<Konva.Stage | null>;
  onClose: () => void;
}

export function ExportModal({
  boardTitle,
  pages,
  activePageId,
  strokesByPage,
  erasedIds,
  stageRef,
  onClose,
}: Props) {
  const [format, setFormat] = useState<Format>("jpeg");

  const [scope, setScope] = useState<Scope>("current");

  const [quality, setQuality] = useState(DEFAULT_QUALITY);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const activePage = useMemo(
    () => pages.find((p) => p.id === activePageId) ?? pages[0],
    [pages, activePageId],
  );

  const combinedStrokes = (page: Page): Stroke[] => {
    const all = [...page.strokes, ...(strokesByPage[page.id] ?? [])];
    return all.filter((s) => !erasedIds.has(s.id));
  };

  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleExport = () => {
    const safe = boardTitle.trim().replace(/[^\w-]+/g, "_") || FALLBACK_SAFE_NAME;
    if (scope === "current") {
      const stage = stageRef.current;
      if (!stage) return;
      const mime = format === "jpeg" ? "image/jpeg" : "image/png";
      const url = stage.toDataURL({
        mimeType: mime,
        quality: quality / PERCENT_SCALE,
        pixelRatio: EXPORT_PIXEL_RATIO,
      });
      downloadDataUrl(url, `${safe}-page.${format}`);
      onClose();
      return;
    }

    rasterizeAllPages(pages.map((p) => ({ page: p, strokes: combinedStrokes(p) })), format, quality).then(
      (urls) => {
        urls.forEach((url, i) => {
          downloadDataUrl(url, `${safe}-page-${String(i + 1).padStart(PAGE_INDEX_PAD, "0")}.${format}`);
        });
        onClose();
      },
    );
  };

  const mime = format === "jpeg" ? "image/jpeg" : "image/png";

  const estimateMb = (quality * SIZE_ESTIMATE_SLOPE + SIZE_ESTIMATE_INTERCEPT).toFixed(SIZE_ESTIMATE_PRECISION);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,10,10,0.35)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-[560px] max-w-[92vw] overflow-hidden rounded-[14px] bg-paper shadow-4"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-[20px] font-semibold text-ink-0">Export</h2>
            <p className="t-sm mt-0.5 text-ink-3">Download your board as an image.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-4 hover:bg-ink-9 hover:text-ink-0"
            aria-label="Close"
          >
            <X size={CLOSE_ICON_SIZE} strokeWidth={CLOSE_ICON_STROKE_WIDTH} />
          </button>
        </header>

        <div className="px-6 py-5 space-y-5">
          <div className="overflow-hidden rounded-lg border border-border bg-ink-9 p-3">
            {scope === "current" && activePage ? (
              <div className="dot-grid relative mx-auto aspect-[16/9] w-full overflow-hidden rounded-md bg-paper">
                <PagePreview
                  strokes={combinedStrokes(activePage)}
                  width={PREVIEW_WIDTH}
                  height={PREVIEW_HEIGHT}
                />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {pages.slice(0, MAX_ALL_PAGES_GRID).map((p) => (
                  <div
                    key={p.id}
                    className="aspect-[4/3] overflow-hidden rounded-md border border-border bg-paper"
                  >
                    <PagePreview strokes={combinedStrokes(p)} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Segmented
              label="Format"
              value={format}
              onChange={(v) => setFormat(v as Format)}
              options={[
                { value: "jpeg", label: "JPEG" },
                { value: "png", label: "PNG" },
              ]}
            />
            <Segmented
              label="Scope"
              value={scope}
              onChange={(v) => setScope(v as Scope)}
              options={[
                { value: "current", label: "Current page" },
                { value: "all", label: `All pages (${pages.length})` },
              ]}
            />
          </div>

          {format === "jpeg" && (
            <div>
              <label className="t-xs mb-1.5 block font-medium uppercase tracking-[0.14em] text-ink-5">
                Quality — {quality}%
              </label>
              <input
                type="range"
                min={MIN_QUALITY}
                max={MAX_QUALITY}
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                className="w-full accent-accent"
              />
              <div className="t-mono mt-1 flex justify-between text-ink-5">
                <span>SMALLER</span>
                <span>SHARPER</span>
              </div>
            </div>
          )}

          <div className="rounded-md bg-ink-9 px-3 py-2 text-[12px] text-ink-3">
            ≈ {estimateMb} MB · {mime} · {EXPORT_WIDTH}×{EXPORT_HEIGHT}
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border bg-ink-9 px-6 py-3">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button type="button" onClick={handleExport} className="btn btn-accent">
            Download
          </button>
        </footer>
      </div>
    </div>
  );
}

function Segmented({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="t-xs mb-1.5 block font-medium uppercase tracking-[0.14em] text-ink-5">
        {label}
      </label>
      <div className="flex rounded-md bg-ink-9 p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded-[6px] py-1.5 text-[13px] transition",
              value === opt.value ? "bg-paper text-ink-0 shadow-1 font-medium" : "text-ink-3",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

async function rasterizeAllPages(
  pages: { page: Page; strokes: Stroke[] }[],
  format: Format,
  quality: number,
): Promise<string[]> {
  const out: string[] = [];
  for (const { page, strokes } of pages) {
    out.push(await rasterizePageSvg(page, strokes, format, quality));
  }
  return out;
}

async function rasterizePageSvg(
  page: Page,
  strokes: Stroke[],
  format: Format,
  quality: number,
): Promise<string> {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.setAttribute("xmlns", SVG_NAMESPACE);
  svg.setAttribute("width", String(EXPORT_WIDTH));
  svg.setAttribute("height", String(EXPORT_HEIGHT));

  const wrapper = document.createElement("div");
  wrapper.appendChild(svg);
  document.body.appendChild(wrapper);

  const previewHtml = `
    <svg xmlns="${SVG_NAMESPACE}" width="${EXPORT_WIDTH}" height="${EXPORT_HEIGHT}">
      <rect width="100%" height="100%" fill="${CANVAS_BG}"/>
      <text x="32" y="56" font-family="Geist, Inter, sans-serif" font-size="26" fill="#44443F">${escapeXml(page.name)}</text>
      <text x="32" y="92" font-family="Geist, Inter, sans-serif" font-size="14" fill="#96968D">${strokes.length} strokes</text>
    </svg>`;

  const blob = new Blob([previewHtml], { type: "image/svg+xml" });

  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("rasterize failed"));
    });
    const canvas = document.createElement("canvas");
    canvas.width = EXPORT_WIDTH;
    canvas.height = EXPORT_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d ctx");
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL(format === "jpeg" ? "image/jpeg" : "image/png", quality / PERCENT_SCALE);
  } finally {
    URL.revokeObjectURL(url);
    wrapper.remove();
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

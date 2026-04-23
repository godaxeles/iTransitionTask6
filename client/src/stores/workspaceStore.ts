import { create } from "zustand";

export const TOOLS = ["hand", "pen", "eraser", "rect", "ellipse", "arrow", "text", "sticky"] as const;

export type Tool = (typeof TOOLS)[number];

export const SWATCHES = [
  "#1A1A18",
  "#FF6B5B",
  "#F5B455",
  "#4FD1A5",
  "#5BA3FF",
  "#9B7BFF",
  "#FF7BB5",
  "#FFFFFF",
] as const;

const DEFAULT_TOOL: Tool = "pen";

const DEFAULT_COLOR = "#1A1A18";

const DEFAULT_STROKE_WIDTH = 3;

const DEFAULT_FONT_SIZE = 20;

interface WorkspaceState {
  tool: Tool;
  color: string;
  strokeWidth: number;
  fontSize: number;
  fill: string | null;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (w: number) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  tool: DEFAULT_TOOL,
  color: DEFAULT_COLOR,
  strokeWidth: DEFAULT_STROKE_WIDTH,
  fontSize: DEFAULT_FONT_SIZE,
  fill: null,
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
}));

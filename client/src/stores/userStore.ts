import { create } from "zustand";
import { persist } from "zustand/middleware";

export const USER_COLORS = [
  "#FF6B5B",
  "#F5B455",
  "#4FD1A5",
  "#5BA3FF",
  "#9B7BFF",
  "#FF7BB5",
] as const;

const STORAGE_KEY = "plot.user";

const INITIALS_FALLBACK = "?";

const MAX_INITIALS_FROM_SINGLE_WORD = 2;

interface UserState {
  displayName: string;
  colorIndex: number;
  setDisplayName: (name: string) => void;
  rollColor: () => void;
}

function randomColorIndex(): number {
  return Math.floor(Math.random() * USER_COLORS.length);
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      displayName: "",
      colorIndex: randomColorIndex(),
      setDisplayName: (name) => set({ displayName: name.trim() }),
      rollColor: () => set({ colorIndex: randomColorIndex() }),
    }),
    { name: STORAGE_KEY },
  ),
);

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return INITIALS_FALLBACK;
  if (parts.length === 1) return parts[0].slice(0, MAX_INITIALS_FROM_SINGLE_WORD).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

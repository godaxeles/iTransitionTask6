import { create } from "zustand";

export interface ConfirmRequest {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "neutral";
}

interface ConfirmState {
  request: ConfirmRequest | null;
  resolver: ((ok: boolean) => void) | null;
  ask: (req: ConfirmRequest) => Promise<boolean>;
  resolve: (ok: boolean) => void;
}

export const useConfirm = create<ConfirmState>()((set, get) => ({
  request: null,
  resolver: null,
  ask: (req) =>
    new Promise((resolve) => {
      set({ request: req, resolver: resolve });
    }),
  resolve: (ok) => {
    const { resolver } = get();
    resolver?.(ok);
    set({ request: null, resolver: null });
  },
}));

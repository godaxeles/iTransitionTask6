import { Navigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import type { ReactNode } from "react";

export function NameGuard({ children }: { children: ReactNode }) {
  const ready = useUserStore((s) => s.displayName.trim().length > 0);
  if (!ready) return <Navigate to="/" replace />;
  return <>{children}</>;
}

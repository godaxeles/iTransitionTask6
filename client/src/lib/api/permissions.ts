import { api } from "../api";
import type { BoardRole, Permissions } from "../types";

export async function getPermissions(boardId: string, signal?: AbortSignal): Promise<Permissions> {
  return api<Permissions>(`/boards/${boardId}/permissions`, { signal });
}

export interface UpdatePermissionsRequest {
  defaultRole?: BoardRole | null;
  canAddPages?: boolean | null;
  canDeletePages?: boolean | null;
  canManagePermissions?: boolean | null;
  canExport?: boolean | null;
  memberOverrides?: Array<{ userName: string; role: BoardRole }> | null;
}

export async function updatePermissions(boardId: string, req: UpdatePermissionsRequest): Promise<void> {
  await api<void>(`/boards/${boardId}/permissions`, {
    method: "PATCH",
    body: req,
  });
}

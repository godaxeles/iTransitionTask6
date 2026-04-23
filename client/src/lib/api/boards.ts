import { api } from "../api";
import type { BoardDetail, BoardSummary } from "../types";

export async function listBoards(signal?: AbortSignal): Promise<BoardSummary[]> {
  return api<BoardSummary[]>("/boards", { signal });
}

export async function getBoard(id: string, signal?: AbortSignal): Promise<BoardDetail> {
  return api<BoardDetail>(`/boards/${id}`, { signal });
}

export async function createBoard(title?: string): Promise<BoardDetail> {
  return api<BoardDetail>("/boards", { method: "POST", body: { title: title ?? null } });
}

export async function renameBoard(id: string, title: string): Promise<void> {
  await api<void>(`/boards/${id}`, { method: "PATCH", body: { title, thumbnailDataUrl: null } });
}

export async function deleteBoard(id: string): Promise<void> {
  await api<void>(`/boards/${id}`, { method: "DELETE" });
}

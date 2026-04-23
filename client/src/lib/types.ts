export const BoardRole = {
  Viewer: 0,
  Editor: 1,
  Manager: 2,
} as const;
export type BoardRole = (typeof BoardRole)[keyof typeof BoardRole];

export const StrokeKind = {
  Pen: 0,
  Rectangle: 1,
  Ellipse: 2,
  Arrow: 3,
  Text: 4,
  Sticky: 5,
  Image: 6,
} as const;
export type StrokeKind = (typeof StrokeKind)[keyof typeof StrokeKind];

export interface BoardSummary {
  id: string;
  title: string;
  thumbnailDataUrl: string | null;
  updatedAt: string;
  pageCount: number;
  collaboratorCount: number;
}

export interface Stroke {
  id: string;
  kind: StrokeKind;
  payloadJson: string;
  authorName: string;
  authorColor: string;
  createdAt: string;
}

export interface Page {
  id: string;
  order: number;
  name: string;
  strokes: Stroke[];
}

export interface BoardDetail {
  id: string;
  title: string;
  updatedAt: string;
  defaultRole: BoardRole;
  canAddPages: boolean;
  canDeletePages: boolean;
  canManagePermissions: boolean;
  canExport: boolean;
  pages: Page[];
}

export interface Member {
  userName: string;
  role: BoardRole;
  color: string;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface Permissions {
  defaultRole: BoardRole;
  canAddPages: boolean;
  canDeletePages: boolean;
  canManagePermissions: boolean;
  canExport: boolean;
  members: Member[];
}

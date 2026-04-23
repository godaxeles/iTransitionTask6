import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type ILogger,
} from "@microsoft/signalr";
import type { BoardRole, Stroke, StrokeKind } from "./types";

const HUB_URL = "/hubs/board";

const LOG_PREFIX = "[signalr]";

const QUIET_PATTERNS = [
  "stopped during negotiation",
  "connection was stopped",
  "Failed to complete negotiation",
  "Failed to start the connection",
  "Failed to start the transport",
  "WebSocket closed with status code: 1006",
];

class QuietLogger implements ILogger {
  log(logLevel: LogLevel, message: string): void {
    if (logLevel === LogLevel.Critical || logLevel === LogLevel.Error) {
      if (QUIET_PATTERNS.some((p) => message.includes(p))) {

        console.debug(LOG_PREFIX, message);
        return;
      }

      console.error(LOG_PREFIX, message);
    } else if (logLevel === LogLevel.Warning) {

      console.warn(LOG_PREFIX, message);
    }
  }
}

export interface JoinResult {
  userName: string;
  color: string;
  role: BoardRole;
}

export interface PresenceEntry {
  userName: string;
  color: string;
  x: number;
  y: number;
}

export interface HubEventHandlers {
  onStrokeCommitted?: (pageId: string, stroke: Stroke) => void;
  onStrokeLive?: (
    strokeId: string,
    kind: StrokeKind,
    payloadJson: string,
    userName: string,
    color: string,
  ) => void;
  onStrokesErased?: (strokeIds: string[]) => void;
  onStrokesRestored?: (strokeIds: string[]) => void;
  onPageAdded?: (page: { id: string; order: number; name: string }) => void;
  onPageDeleted?: (pageId: string) => void;
  onPagesReordered?: (pageIds: string[]) => void;
  onBoardRenamed?: (title: string) => void;
  onCursorMoved?: (userName: string, x: number, y: number) => void;
  onPresence?: (snapshot: PresenceEntry[]) => void;
  onReconnecting?: () => void;
  onReconnected?: () => void;
  onClosed?: (err?: Error) => void;
}

export class BoardHub {
  private readonly connection: HubConnection;

  constructor(handlers: HubEventHandlers) {
    this.connection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(new QuietLogger())
      .build();

    this.connection.on("StrokeCommitted", (pageId: string, stroke: Stroke) =>
      handlers.onStrokeCommitted?.(pageId, stroke),
    );

    this.connection.on(
      "StrokeLive",
      (strokeId: string, kind: StrokeKind, payloadJson: string, userName: string, color: string) =>
        handlers.onStrokeLive?.(strokeId, kind, payloadJson, userName, color),
    );

    this.connection.on("StrokesErased", (ids: string[]) => handlers.onStrokesErased?.(ids));

    this.connection.on("StrokesRestored", (ids: string[]) => handlers.onStrokesRestored?.(ids));

    this.connection.on("PageAdded", (p) => handlers.onPageAdded?.(p));

    this.connection.on("PageDeleted", (id: string) => handlers.onPageDeleted?.(id));

    this.connection.on("PagesReordered", (ids: string[]) => handlers.onPagesReordered?.(ids));

    this.connection.on("BoardRenamed", (title: string) => handlers.onBoardRenamed?.(title));

    this.connection.on("CursorMoved", (userName: string, x: number, y: number) =>
      handlers.onCursorMoved?.(userName, x, y),
    );

    this.connection.on("PresenceUpdated", (snap: PresenceEntry[]) => handlers.onPresence?.(snap));

    this.connection.onreconnecting(() => handlers.onReconnecting?.());

    this.connection.onreconnected(() => handlers.onReconnected?.());

    this.connection.onclose((err) => handlers.onClosed?.(err));
  }

  get state(): HubConnectionState {
    return this.connection.state;
  }

  async start(): Promise<void> {
    if (this.connection.state === HubConnectionState.Disconnected) {
      await this.connection.start();
    }
  }

  async stop(): Promise<void> {
    if (this.connection.state !== HubConnectionState.Disconnected) {
      await this.connection.stop();
    }
  }

  joinBoard(boardId: string, userName: string): Promise<JoinResult> {
    return this.connection.invoke<JoinResult>("JoinBoard", boardId, userName);
  }

  sendCursor(x: number, y: number): Promise<void> {
    return this.connection.send("SendCursor", x, y);
  }

  liveStroke(strokeId: string, kind: StrokeKind, payloadJson: string): Promise<void> {
    return this.connection.send("LiveStroke", strokeId, kind, payloadJson);
  }

  commitStroke(pageId: string, kind: StrokeKind, payloadJson: string): Promise<Stroke> {
    return this.connection.invoke<Stroke>("CommitStroke", pageId, kind, payloadJson);
  }

  eraseStrokes(strokeIds: string[]): Promise<void> {
    return this.connection.invoke("EraseStrokes", strokeIds);
  }

  addPage(name: string | null): Promise<{ id: string; order: number; name: string }> {
    return this.connection.invoke("AddPage", name);
  }

  deletePage(pageId: string): Promise<void> {
    return this.connection.invoke("DeletePage", pageId);
  }

  renameBoard(title: string): Promise<void> {
    return this.connection.invoke("RenameBoard", title);
  }
}

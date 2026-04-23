const API_BASE = "/api";

const STATUS_UNAUTHORIZED = 401;

const STATUS_FORBIDDEN = 403;

const STATUS_NOT_FOUND = 404;

const SERVER_ERROR_MIN = 500;

const SERVER_ERROR_MAX = 600;

const NETWORK_ERROR_STATUS = 0;

const BACKEND_PORT_HINT = 5080;

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  status: number;

  body: unknown;

  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  let payload: BodyInit | undefined;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: payload, signal });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new ApiError(NETWORK_ERROR_STATUS, null, friendlyError(NETWORK_ERROR_STATUS, method, path));
  }

  const text = await res.text();
  const parsed = text ? safeJson(text) : null;

  if (!res.ok) {
    const serverMessage =
      parsed && typeof parsed === "object" && "message" in parsed && typeof parsed.message === "string"
        ? parsed.message
        : null;
    const message = serverMessage ?? friendlyError(res.status, method, path);
    throw new ApiError(res.status, parsed, message);
  }

  return parsed as T;
}

function friendlyError(status: number, method: HttpMethod, path: string): string {
  if (status === STATUS_NOT_FOUND) return "Not found.";
  if (status === STATUS_FORBIDDEN) return "You don't have permission for that.";
  if (status === STATUS_UNAUTHORIZED) return "Please enter your name first.";
  if (status >= SERVER_ERROR_MIN && status < SERVER_ERROR_MAX) {
    return `The backend is unreachable. Make sure \`dotnet run --project iTransitionTask6\` is running on port ${BACKEND_PORT_HINT}.`;
  }
  if (status === NETWORK_ERROR_STATUS) return "Network error. Check your connection.";
  return `${method} ${path} failed with ${status}.`;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

import { Check, Copy, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getPermissions, updatePermissions } from "../../lib/api/permissions";
import { BoardRole, type Permissions } from "../../lib/types";
import { Avatar } from "../Avatar";
import { cn } from "../../lib/cn";

const COPIED_FEEDBACK_MS = 1500;

const AVATAR_SIZE = 28;

const CLOSE_ICON_SIZE = 18;

const CLOSE_ICON_STROKE_WIDTH = 1.75;

const COPY_ICON_SIZE = 14;

const ROLE_LABELS: Record<number, string> = {
  [BoardRole.Viewer]: "Viewer",
  [BoardRole.Editor]: "Editor",
  [BoardRole.Manager]: "Manager",
};

const ROLE_DESCRIPTIONS: Record<number, string> = {
  [BoardRole.Viewer]: "Can see the canvas but cannot draw or edit.",
  [BoardRole.Editor]: "Can draw, erase, and contribute to the board.",
  [BoardRole.Manager]: "Full access — can add/delete pages and change permissions.",
};

interface Props {
  boardId: string;
  selfName: string;
  onClose: () => void;
}

export function ShareModal({ boardId, selfName, onClose }: Props) {
  const [perms, setPerms] = useState<Permissions | null>(null);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    getPermissions(boardId, ac.signal)
      .then(setPerms)
      .catch((e) => {
        if (!ac.signal.aborted) setError(e?.message ?? "Failed to load permissions");
      });
    return () => ac.abort();
  }, [boardId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const persist = async (patch: Partial<Permissions>) => {
    if (!perms) return;
    const next = { ...perms, ...patch };
    setPerms(next);
    setSaving(true);
    try {
      await updatePermissions(boardId, {
        defaultRole: patch.defaultRole,
        canAddPages: patch.canAddPages,
        canDeletePages: patch.canDeletePages,
        canManagePermissions: patch.canManagePermissions,
        canExport: patch.canExport,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPerms(perms);
    } finally {
      setSaving(false);
    }
  };

  const setMemberRole = async (userName: string, role: BoardRole) => {
    if (!perms) return;
    const next = {
      ...perms,
      members: perms.members.map((m) =>
        m.userName.toLowerCase() === userName.toLowerCase() ? { ...m, role } : m,
      ),
    };
    setPerms(next);
    setSaving(true);
    try {
      await updatePermissions(boardId, { memberOverrides: [{ userName, role }] });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPerms(perms);
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);

    const url = window.location.href;
    try {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    } catch {
      /* ignore */
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,10,10,0.35)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-[720px] max-w-[90vw] overflow-hidden rounded-[14px] bg-paper shadow-4"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-[20px] font-semibold text-ink-0">Share board</h2>
            <p className="t-sm mt-0.5 text-ink-3">
              Anyone with the link can join instantly — no signup.
            </p>
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

        {error && (
          <div className="mx-6 mt-4 rounded-md border border-danger/20 bg-[color:var(--accent-soft)] px-3 py-2 text-[12px] text-danger">
            {error}
          </div>
        )}

        <div className="grid grid-cols-[1fr_260px] gap-6 p-6">
          <section className="space-y-5">
            <div>
              <label className="t-xs mb-1.5 block font-medium uppercase tracking-[0.14em] text-ink-5">
                Public link
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={window.location.href}
                  className="input !font-mono !text-[12px]"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="btn btn-outline shrink-0"
                  aria-label="Copy link"
                >
                  {copied ? <Check size={COPY_ICON_SIZE} /> : <Copy size={COPY_ICON_SIZE} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div>
              <label className="t-xs mb-1.5 block font-medium uppercase tracking-[0.14em] text-ink-5">
                Default role for new joiners
              </label>
              <div className="flex rounded-md bg-ink-9 p-1">
                {[BoardRole.Viewer, BoardRole.Editor, BoardRole.Manager].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => persist({ defaultRole: r })}
                    className={cn(
                      "flex-1 rounded-[6px] py-1.5 text-[13px] transition",
                      perms?.defaultRole === r
                        ? "bg-paper text-ink-0 shadow-1 font-medium"
                        : "text-ink-3",
                    )}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
              {perms && (
                <p className="t-xs mt-2 text-ink-4">{ROLE_DESCRIPTIONS[perms.defaultRole]}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <PermToggle
                label="Editors can add pages"
                value={perms?.canAddPages ?? false}
                onChange={(v) => persist({ canAddPages: v })}
              />
              <PermToggle
                label="Editors can delete pages"
                value={perms?.canDeletePages ?? false}
                onChange={(v) => persist({ canDeletePages: v })}
              />
              <PermToggle
                label="Editors can manage permissions"
                value={perms?.canManagePermissions ?? false}
                onChange={(v) => persist({ canManagePermissions: v })}
              />
              <PermToggle
                label="Editors can export"
                value={perms?.canExport ?? true}
                onChange={(v) => persist({ canExport: v })}
              />
            </div>
          </section>

          <aside className="flex flex-col overflow-hidden rounded-lg border border-border bg-paper">
            <div className="border-b border-border px-3 py-2">
              <h3 className="t-xs font-medium uppercase tracking-[0.14em] text-ink-5">
                People with access
              </h3>
            </div>
            <div className="flex max-h-[320px] flex-col overflow-y-auto">
              {perms?.members.length === 0 && (
                <p className="t-sm px-3 py-6 text-center text-ink-4">No collaborators yet.</p>
              )}
              {perms?.members.map((m) => {
                const isSelf = m.userName.toLowerCase() === selfName.toLowerCase();
                return (
                  <div
                    key={m.userName}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5",
                      isSelf && "bg-ink-9",
                    )}
                  >
                    <Avatar name={m.userName} color={m.color} size={AVATAR_SIZE} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink-1">
                        {m.userName} {isSelf && <span className="text-ink-4 font-normal">(you)</span>}
                      </p>
                    </div>
                    <select
                      value={m.role}
                      onChange={(e) => setMemberRole(m.userName, Number(e.target.value) as BoardRole)}
                      disabled={isSelf}
                      className="t-sm rounded-md border border-border bg-paper px-1.5 py-1 text-ink-2 disabled:opacity-60"
                    >
                      <option value={BoardRole.Viewer}>Viewer</option>
                      <option value={BoardRole.Editor}>Editor</option>
                      <option value={BoardRole.Manager}>Manager</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>

        <footer className="flex items-center justify-between border-t border-border bg-ink-9 px-6 py-3">
          <span className="t-xs text-ink-4">{saving ? "Saving…" : "All changes saved"}</span>
          <button type="button" onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}

function PermToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-md border border-border px-3 py-2.5 hover:bg-ink-9">
      <span className="text-[13.5px] text-ink-1">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition",
          value ? "bg-accent" : "bg-ink-7",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition",
            value ? "left-4" : "left-0.5",
          )}
        />
      </button>
    </label>
  );
}

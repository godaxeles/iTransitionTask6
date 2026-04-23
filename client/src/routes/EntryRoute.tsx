import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore, USER_COLORS } from "../stores/userStore";
import { PlotLogo } from "../components/PlotLogo";
import { Avatar } from "../components/Avatar";

const MAX_NAME_LENGTH = 32;

const AVATAR_PREVIEW_SIZE = 40;

const AVATAR_PLACEHOLDER = "?";

const HOME_ROUTE = "/boards";

const ABOUT_URL = "https://github.com";

export function EntryRoute() {
  const navigate = useNavigate();

  const setDisplayName = useUserStore((s) => s.setDisplayName);

  const existingName = useUserStore((s) => s.displayName);

  const colorIndex = useUserStore((s) => s.colorIndex);

  const rollColor = useUserStore((s) => s.rollColor);

  const [name, setName] = useState(existingName);

  const color = USER_COLORS[colorIndex];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 1) return;
    setDisplayName(trimmed);
    navigate(HOME_ROUTE);
  };

  const isDisabled = name.trim().length === 0;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="aurora-bg" aria-hidden />
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <PlotLogo />
        <a
          href={ABOUT_URL}
          target="_blank"
          rel="noreferrer"
          className="t-sm text-ink-4 hover:text-ink-1"
        >
          About
        </a>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-6">
        <div className="glass-card w-full max-w-[460px] rounded-2xl p-10">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <span className="t-mono uppercase tracking-[0.18em] text-ink-4">Welcome to Plot</span>
            <h1 className="t-h1">What should we call you?</h1>
            <p className="t-body text-ink-3 max-w-[340px]">
              Your name shows up next to your cursor so collaborators know who's drawing what.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={rollColor}
                className="shrink-0 rounded-full p-0.5 transition hover:scale-105"
                style={{ background: color, boxShadow: "var(--shadow-2)" }}
                aria-label="Change cursor color"
              >
                <Avatar name={name || AVATAR_PLACEHOLDER} color={color} size={AVATAR_PREVIEW_SIZE} />
              </button>
              <input
                autoFocus
                className="input"
                placeholder="Enter your display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={MAX_NAME_LENGTH}
              />
            </div>
            <button
              type="submit"
              className="btn btn-accent justify-center py-3 text-[15px]"
              disabled={isDisabled}
              style={{ opacity: isDisabled ? 0.5 : 1 }}
            >
              Enter Plot
            </button>
          </form>

          <p className="t-xs mt-6 text-center text-ink-4">
            No account needed. Your name lives on this device.
          </p>
        </div>
      </main>
    </div>
  );
}

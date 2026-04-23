# Handoff: Plot — Collaborative Whiteboard

## Overview
**Plot** is a real-time collaborative whiteboard web app (Miro × FigJam × Excalidraw, simpler and more refined). Users enter a display name (no auth), land on a list of boards, create/join boards, draw together in real-time, switch pages, manage per-user permissions, and export to JPEG/PNG.

Target vibe: **calm, confident, creative**. Product-grade, startup-ready polish. References: Linear's clarity, FigJam's warmth, Raycast's precision.

## About the Design Files
The files in this bundle are **design references created in HTML** — interactive prototypes showing intended look, layout, and behavior. They are NOT production code to copy directly.

Your task is to **recreate these designs in the target codebase's environment** (React, Vue, SwiftUI, native, etc.) using its established patterns, component libraries, and conventions. If the project has no environment yet, choose the most appropriate framework (recommended: React + Vite + TypeScript, plus a real-time layer like Liveblocks/Yjs/custom WebSocket).

The HTML prototypes use inline React via Babel standalone for convenience — in production you should use a proper build toolchain.

## Fidelity
**High-fidelity (hifi).** These are pixel-perfect mockups with final colors, typography, spacing, motion and interactions. Recreate UI with exact design-token values. All tokens are centralized in `tokens.css`.

## Screens / Views

### 1. Entry Screen (`components/entry.jsx`, mood="aurora")
- **Purpose**: Capture a display name; land user in the app with no signup.
- **Layout**: Full-bleed animated aurora gradient background (3 radial-gradient blobs + subtle SVG noise overlay). Top bar with logo (left) and online-count pill (right). Centered glass card (440px wide, 44px padding, radius 20, backdrop-blur(18px), rgba(255,255,255,0.78) background). Footer text at bottom.
- **Components**:
  - **Logo + wordmark** (top-left, 40px from top/left): 28px logo mark, "Plot" at 18px/600.
  - **Online indicator** (top-right): 6px green dot + mono text "24 online" at 12px.
  - **Card hero**: "Draw together. Instantly." at 36px/600, letter-spacing −0.028em. "Instantly" is italic serif (Georgia) in `--accent` color.
  - **Subcopy**: "A shared canvas for teams that think better with a marker in hand." at 15px, `--ink-3`.
  - **Input**: label "YOUR NAME" (12px uppercase, `--ink-4`, tracking 0.02em), input 48px tall, radius 10, left user icon (16px), placeholder "e.g. Nina Petrov". On focus: coral border + 3px `--accent-tint` ring; "press ↵" mono hint appears right-side with 1.4s blink.
  - **CTA button**: Full-width ink (#0A0A0A) button with "Continue" + right arrow icon. Hover: translateY(−1px) + shadow-2.
  - **Avatar row**: 5 avatars at 22px + "joined today" text at 12px `--ink-4`.
  - **Easter egg**: on input focus, a 2px coral line draws across the top of the card over 700ms.
  - **Footer**: mono "No signup · No tracking · Just draw." at 12px `--ink-4`.

### 2. Dashboard (`components/dashboard.jsx`)
- **Purpose**: List all user's boards; create/open boards; search and filter.
- **Layout**:
  - **Top bar**: 56px tall, white background, 1px bottom border. Contains logo, "Workspace" dropdown, centered search (400px wide, ⌘K hint right side), "+ New board" accent button, user avatar-chip (rounded-999 pill).
  - **Sidebar**: 220px wide, left, with "LIBRARY" section (My boards, Shared with me, Recent — with icon + count) and "TAGS" section (4 colored dots).
  - **Main**: 32px/40px padding. H1 "My boards" (28px/600, −0.02em), subtext "{count} boards · Last edit 5m ago". Row of sort chips (Recent / Most active / Alphabetical). Grid (auto-fill, minmax(260px, 1fr), 18px gap): first card is dashed "New board" placeholder; rest are BoardCards.
- **BoardCard**:
  - 16:9 SVG thumbnail preview (rendered from mock canvas state)
  - "Pinned" pill top-left if pinned (rgba-white backdrop-blur)
  - Title (14.5px/500), stacked avatars (3 max at 22px) + "N collaborators" text, clock + "Edited Xm ago"
  - Hover: translateY(−2px) + shadow-3 + stronger border
- **New board card**: 1.5px dashed border, 44px plus-icon in `--ink-9` circle.

### 3. Workspace (`components/workspace.jsx`) — light + dark
- **Purpose**: Core canvas for drawing, with real-time multi-user collaboration.
- **Layout**:
  - **Canvas**: full-viewport, dot-grid background (24px spacing, 1px rgba black dots).
  - **Top-left cluster**: rounded white chip with back-arrow, logo, "/" separator, inline-editable title (auto-width). Next to it: "Saved" chip with pulsing green dot.
  - **Top-right cluster**: presence chip (avatar-stack max 4 + "+N" overflow at 24px), outline "Share" button, accent "Export" button.
  - **Left edge (vertical center)**: floating pages panel — 58px-wide page thumbnails (aspect 4:3), active has 2px coral border, index label below. Add-page button at bottom (dashed).
  - **Bottom-center toolbar** (glassmorphism): 9 tools (Select/Pen/Eraser/Rectangle/Ellipse/Arrow/Text/Sticky/Image) at 38×38px, plus a trash/clear. Active tool: ink-black pill. Contextual color+stroke row appears above when drawing tools active: 8 color swatches (20px circles) + stroke slider with mono number label. Glass background: rgba(255,255,255,0.85) + backdrop-blur(24px) saturate(1.4), radius 14, shadow-glass. Dark mode: rgba(40,38,34,0.85).
  - **Bottom-right**: 160×100 minimap (dot-grid + coral viewport rect + colored user markers) + zoom controls (+/%/−).
  - **Live cursors**: animated SVG arrow (distinct user color) + colored label pill with user name, drop-shadow. Positions animate via requestAnimationFrame sine/cosine curves.
- **Drawing**: Pen creates SVG paths with round line-caps, Rect/Ellipse drag-to-create, Arrow with polygon head, Sticky notes (rotated), Text placements. Eraser removes pen strokes whose points are within 14px of the eraser path.
- **Dark theme**: Apply `.theme-dark` class — all tokens flip (canvas → #0E0E0C, paper → #1A1A18, ink scale inverts, border → #2A2A27). Remote cursor colors stay vibrant.

### 4. Share/Permissions Modal (`components/workspace.jsx` — ShareModal)
- 720px wide, 14px radius, shadow-4. Backdrop: rgba(10,10,10,0.35) + backdrop-blur(6px).
- **Header**: "Share board" (20px/600) + close X. Subtext "Anyone with the link can join instantly — no signup."
- **Two-column body**:
  - **Left**: Public link input (mono, with Copy button — shows checkmark "Copied" for 1.5s). Default role tab bar (Viewer / Editor / Manager — segmented in `--ink-9`, active has white background + shadow-1). Role description below. Granular toggles section with 4 toggle rows (Can add pages, Can delete pages, Can manage permissions, Can export).
  - **Right**: "People with access" list (bordered card). Each row: 32px avatar, name + "(you)" tag, email, role dropdown. "You" row is `--ink-9` background.
- **Footer**: Ghost Cancel + Primary Done (aligned right, on `--ink-9` strip).

### 5. Export Modal (`components/workspace.jsx` — ExportModal)
- 560px wide.
- **Header**: "Export" (20px/600) + close. "Download your board as an image."
- **Preview**: Current-page preview (16:9, dot-grid, with sample artwork) OR 3×1 grid of all-pages thumbnails — toggled by Scope.
- **Two segmented controls**: Format (JPEG / PNG), Scope (Current page / All pages).
- **Quality slider**: 30–100%, coral accent, with "SMALLER ↔ SHARPER" mono labels.
- **Size estimate**: `{quality*0.018+0.6} MB · 1920×1080` in ink-9 info strip.
- **Footer**: Ghost Cancel + Accent Download.

### 6. Design System Page (`components/design-system.jsx`)
Living reference: Typography specimens, color swatch grids, radii + shadow samples, button variants, input states, chips, avatars, toolbar primitives, card variants, motion timing comparisons. Use this to build Storybook stories or equivalent in the target codebase.

## Interactions & Behavior

### Global
- **Keyboard shortcuts** (workspace): V Select, P Pen, E Eraser, R Rectangle, O Ellipse, A Arrow, T Text, N Sticky, I Image.
- **Autosave**: indicator with pulsing green dot; should animate every ~2s (1.8s ease-in-out infinite).

### Drawing (workspace)
- Pen: pointerdown starts a path, pointermove appends points, pointerup commits. Render via SVG `<path>` with `stroke-linecap: round`.
- Shapes: click+drag sets bbox; if w<4 or h<4, discard. Transparent fill by default.
- Arrow: line + polygon head (calculated from angle, size 8px).
- Sticky note: click to place (120×120, rotation ±3deg random), editable text.
- Eraser: find pen strokes whose points are within 14px of erase path; remove.

### Realtime
- **Cursors**: each remote user has a color, name, and smoothly animated position. Animate with `requestAnimationFrame` using sine/cosine over a phase offset (simulated in prototype — real impl uses WebSocket/CRDT).
- **Presence**: show up to 4 avatars + overflow counter.

### Animations & Transitions
- **UI**: 150ms (fast), 200ms (medium), 280ms (slow) with `cubic-bezier(0.2, 0.7, 0.3, 1)` ease-out.
- **Playful (new board, add page)**: spring `cubic-bezier(0.34, 1.56, 0.64, 1)`.
- **Modal enter**: fade 150ms + `pop` keyframe 180ms spring (translateY 8px → 0, scale 0.98 → 1).
- **Toolbar contextual row**: rises 200ms spring from translateY(8px) + opacity 0.
- **Board card hover**: translateY(-2px) 180ms ease-out.
- **Color swatch active**: scale(1.1) with 120ms spring transition.

### Form Validation
- Name input: nonempty required to enable Continue (current prototype accepts empty → "Guest"). In production: trim, min 1 char.

## State Management

Recommended shape (React + Zustand/Redux or server sync via Liveblocks/Yjs):

```ts
// Global
user: { id, name, color, avatar }
boards: Board[]            // dashboard
currentBoardId: string

// Per-board (synced, CRDT-backed for realtime)
type Board = {
  id, title, thumbnail,
  pages: Page[],
  permissions: { defaultRole, perUser: Record<userId, role>, toggles: {...} },
  editedAt, collaborators: User[],
}
type Page = { id, name, strokes: Stroke[] }
type Stroke =
  | { tool: 'pen', color, width, pts: [x,y][] }
  | { tool: 'rect'|'ellipse', color, width, x,y,w,h, fill }
  | { tool: 'arrow', color, width, x1,y1,x2,y2 }
  | { tool: 'text', x,y, text, color, size, weight }
  | { tool: 'sticky', x,y,w,h, text, color, rotate }

// Workspace local state
tool: 'select'|'pen'|..., color, stroke, zoom,
presence: Record<userId, { x, y, color, name, tool? }>
modal: null | 'share' | 'export'
```

## Design Tokens

All tokens live in `tokens.css`. Highlights:

### Colors
```
--canvas:      #FAFAF7   (main bg)
--paper:       #FFFFFF   (cards)
--ink-0:       #0A0A0A   (primary text, primary btn bg)
--ink-1..9:    warm gray scale (see tokens.css — 9 = lightest)
--accent:      #FF6B5B   (warm coral — CTAs, highlights)
--accent-hover:#F55747
--accent-press:#E04436
--accent-tint: #FFE8E4   (focus rings, soft fills)
--accent-soft: #FFF5F3
--border:      #EAE9E1
--border-strong:#D7D6CC

User colors (cursors):
--user-coral: #FF6B5B
--user-amber: #F5B455
--user-mint:  #4FD1A5
--user-sky:   #5BA3FF
--user-lilac: #9B7BFF
--user-rose:  #FF7BB5

Semantic:
--success: #2FA16D
--warn:    #D98A22
--danger:  #D94848
```

Dark theme overrides: `.theme-dark` class inverts the ink scale and changes canvas/paper/border. See `tokens.css`.

### Typography
- **Sans**: Geist (fallback: Inter, system). Tight tracking on headings.
- **Mono**: Geist Mono (fallback: JetBrains Mono, ui-monospace).
- Scale: Display 56/1.04/−0.025em/600 · H1 40/1.08/−0.022em/600 · H2 28/1.15/−0.018em/600 · H3 20/1.3/−0.012em/600 · Body 15/1.55 · Small 13/1.5 · Micro 12/1.45 · Mono 12.

### Spacing
4 / 6 / 8 / 10 / 12 / 14 / 16 / 20 / 24 / 28 / 32 / 40 / 48 / 56 / 64 / 80 (use 4-unit scale)

### Radii
`--r-xs: 4 · --r-sm: 6 · --r-md: 8 · --r-lg: 12 · --r-xl: 16 · --r-pill: 999`
Convention: **12px cards · 8px buttons · 999px pills/chips**.

### Shadows (soft, layered)
```
--shadow-1:    1 + 1
--shadow-2:    2 + 4
--shadow-3:    4 + 12
--shadow-4:    12 + 32
--shadow-glass: 1 + 6 + 18 (layered for glass toolbars/modals)
```
All use warm-black (rgba(16,14,10,...)) instead of cool black.

### Motion
```
--ease-out:   cubic-bezier(0.2, 0.7, 0.3, 1)
--ease-spring:cubic-bezier(0.34, 1.56, 0.64, 1)
--dur-fast:   150ms
--dur-med:    200ms
--dur-slow:   280ms
```

## Assets
- **Icons**: all icons are Lucide paths drawn at 1.5px stroke, 24×24 viewBox. See `components/icons.jsx` for the custom `<Icon name="..."/>` mini-library. In the target codebase, swap for `lucide-react` (or platform equivalent) and match the stroke/size conventions.
- **Logo**: Custom "P" mark in `components/icons.jsx` as `<PlotLogo/>`. 32px rounded square with white "P" + coral dot. Reproduce as SVG.
- **Fonts**: Load Geist and Geist Mono from Google Fonts (`https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap`).
- **Thumbnails in dashboard**: hand-authored tiny SVGs per board (planning/flow/brainstorm/review/retro/journeys/arch/notes). In production, render actual board state to <canvas>, then `toDataURL('image/jpeg', 0.6)` and cache.

## Files in this Bundle
- `README.md` — this file
- `Plot — Canvas.html` — main entry (design canvas presenting all screens side-by-side)
- `tokens.css` — all design tokens (copy as-is or port to CSS modules / Tailwind config / theme)
- `design-canvas.jsx` — pan/zoom presentation shell (reference only; don't port)
- `components/icons.jsx` — Icon library + Avatar + AvatarStack + PlotLogo
- `components/entry.jsx` — Entry screen (Aurora)
- `components/dashboard.jsx` — Boards dashboard + thumbnails + BoardCard
- `components/workspace.jsx` — Workspace, toolbar, cursors, Share & Export modals
- `components/design-system.jsx` — Full design-system specimen page

## Implementation Checklist (for Claude Code)
1. Set up project (React + Vite + TypeScript recommended).
2. Install Lucide icons, a realtime layer (Liveblocks / Yjs + y-websocket / PartyKit), and a router.
3. Port `tokens.css` to your styling solution (CSS modules, Tailwind `theme.extend`, or CSS-in-JS theme).
4. Load Geist + Geist Mono.
5. Build primitives from design-system.jsx spec: Button (primary/accent/outline/ghost), Input, Chip, Avatar, AvatarStack, Toggle, ModalShell.
6. Build screens in order: Entry → Dashboard → Workspace (light) → Dark mode → Share modal → Export modal.
7. Wire realtime: presence (cursors, avatar stack), CRDT of strokes, page sync.
8. Implement export: canvas composition of strokes → JPEG/PNG via `<canvas>` `.toBlob()`.
9. Add keyboard shortcuts, autosave indicator, undo/redo stack.
10. Match motion: all transitions use the tokens above.

// Plot — shared icons (Lucide-style, 1.5px stroke)
const Icon = ({ name, size = 18, color = 'currentColor', strokeWidth = 1.5, style = {} }) => {
  const paths = {
    plus: 'M12 5v14M5 12h14',
    x: 'M18 6L6 18M6 6l12 12',
    check: 'M20 6L9 17l-5-5',
    arrow_right: 'M5 12h14M13 6l6 6-6 6',
    arrow_left: 'M19 12H5M11 6l-6 6 6 6',
    chevron_down: 'M6 9l6 6 6-6',
    chevron_right: 'M9 6l6 6-6 6',
    search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
    user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
    users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
    clock: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
    edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    trash: 'M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2',
    share: 'M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13',
    download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
    copy: 'M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1',
    link: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
    // Tools
    cursor: 'M13 13l6 6M5 2l7 20 2.5-9L22 10.5 5 2z',
    pen: 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z',
    eraser: 'M20 20H7l-4-4a2 2 0 010-3l10-10a2 2 0 013 0l7 7a2 2 0 010 3l-7 7zM14 6l7 7',
    rect: 'M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z',
    circle: 'M12 22a10 10 0 100-20 10 10 0 000 20z',
    line: 'M4 20L20 4',
    arrow: 'M4 20L20 4M11 4h9v9',
    text: 'M4 7V4h16v3M9 20h6M12 4v16',
    sticky: 'M21 15l-6 6H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10z M21 15h-4a2 2 0 00-2 2v4',
    image: 'M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21',
    hand: 'M18 11V6a2 2 0 10-4 0v5M14 10V4a2 2 0 10-4 0v6M10 10.5V6a2 2 0 10-4 0v8M18 8a2 2 0 114 0v6a8 8 0 01-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 012.83-2.82L7 15',
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    zoom_in: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3M11 8v6M8 11h6',
    zoom_out: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3M8 11h6',
    minus: 'M5 12h14',
    more_h: 'M12 13a1 1 0 100-2 1 1 0 000 2zM19 13a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2z',
    sun: 'M12 17a5 5 0 100-10 5 5 0 000 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
    moon: 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',
    layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    pages: 'M8 2H4a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2v-4M14 2h6v6M10 14l10-10',
    settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
    logo: 'M4 20L10 4M10 4l6 16M7 13h11',
  };
  const d = paths[name] || paths.cursor;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {d.split('M').filter(Boolean).map((p, i) => <path key={i} d={'M' + p} />)}
    </svg>
  );
};

// Logo mark — stylized "P" with a plotting dot
const PlotLogo = ({ size = 28, color = 'var(--ink-0)' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect x="2" y="2" width="28" height="28" rx="7" fill={color} />
    <path d="M10 8 L10 24 M10 8 L18 8 C21 8 23 10 23 13 C23 16 21 18 18 18 L10 18" stroke="#FFFAF5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="22" cy="22" r="2.2" fill="var(--accent)" />
  </svg>
);

// Avatar with initial + color
const Avatar = ({ name = 'U', color = 'var(--user-coral)', size = 28, ring = true }) => {
  const letters = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, letterSpacing: '0.02em',
      border: ring ? `2px solid var(--paper)` : 'none',
      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
      flexShrink: 0,
    }}>{letters}</div>
  );
};

// Stacked avatars with overflow
const AvatarStack = ({ users = [], max = 4, size = 28 }) => {
  const shown = users.slice(0, max);
  const overflow = users.length - max;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((u, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -size * 0.32 }}>
          <Avatar {...u} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div style={{ marginLeft: -size * 0.32 }}>
          <div style={{
            width: size, height: size, borderRadius: '50%',
            background: 'var(--ink-8)', color: 'var(--ink-2)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.36, fontWeight: 600,
            border: `2px solid var(--paper)`,
          }}>+{overflow}</div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { Icon, PlotLogo, Avatar, AvatarStack });

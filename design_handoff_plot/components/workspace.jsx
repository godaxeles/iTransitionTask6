// Plot — Workspace (canvas + toolbar + cursors + modals)

const TOOLS = [
  { id: 'select', icon: 'cursor', label: 'Select', shortcut: 'V' },
  { id: 'pen', icon: 'pen', label: 'Pen', shortcut: 'P' },
  { id: 'eraser', icon: 'eraser', label: 'Eraser', shortcut: 'E' },
  { id: 'rect', icon: 'rect', label: 'Rectangle', shortcut: 'R' },
  { id: 'ellipse', icon: 'circle', label: 'Ellipse', shortcut: 'O' },
  { id: 'arrow', icon: 'arrow', label: 'Arrow', shortcut: 'A' },
  { id: 'text', icon: 'text', label: 'Text', shortcut: 'T' },
  { id: 'sticky', icon: 'sticky', label: 'Sticky note', shortcut: 'N' },
  { id: 'image', icon: 'image', label: 'Image', shortcut: 'I' },
];

const COLORS = ['#0A0A0A', '#FF6B5B', '#F5B455', '#4FD1A5', '#5BA3FF', '#9B7BFF', '#FF7BB5', '#96968D'];

const REMOTE_USERS = [
  { id: 'u1', name: 'Ira K',   color: '#4FD1A5', tx: 0.18, ty: 0.34, phase: 0 },
  { id: 'u2', name: 'Dan Pike', color: '#F5B455', tx: 0.62, ty: 0.58, phase: 1.2 },
  { id: 'u3', name: 'Yu',       color: '#5BA3FF', tx: 0.78, ty: 0.22, phase: 2.4 },
];

const SEED_STROKES = (dark) => [
  // A playful arrow
  { tool: 'pen', color: dark ? '#FAFAF7' : '#0A0A0A', width: 2.5, pts: [
    [140, 320],[168,300],[200,286],[240,280],[280,286],[320,308],[340,340],[348,376],[338,410],[310,434],[272,442],[232,438],[198,420],[174,394]
  ]},
  { tool: 'rect', color: '#FF6B5B', width: 2, x: 420, y: 220, w: 220, h: 130, fill: '#FFE8E4' },
  { tool: 'rect', color: '#4FD1A5', width: 2, x: 680, y: 260, w: 180, h: 110, fill: '#E7F7EE' },
  { tool: 'arrow', color: dark ? '#BDBDB4' : '#44443F', width: 1.5, x1: 640, y1: 285, x2: 680, y2: 315 },
  { tool: 'text', x: 440, y: 250, text: 'Problem', color: dark ? '#FAFAF7' : '#0A0A0A', size: 18, weight: 600 },
  { tool: 'text', x: 440, y: 280, text: 'Users struggle to collaborate\nasynchronously on visual work.', color: dark ? '#DEDED6' : '#2A2A27', size: 13 },
  { tool: 'text', x: 700, y: 290, text: 'Insight', color: dark ? '#FAFAF7' : '#0A0A0A', size: 18, weight: 600 },
  { tool: 'text', x: 700, y: 320, text: 'Most talk happens\nat the whiteboard.', color: dark ? '#DEDED6' : '#2A2A27', size: 13 },
  { tool: 'sticky', x: 920, y: 220, w: 140, h: 140, text: 'Ship v1 by Fri 🚀', color: '#FEF2DA' },
  { tool: 'sticky', x: 940, y: 380, w: 140, h: 140, text: 'Check with Legal', color: '#FFD3CC', rotate: 3 },
  { tool: 'ellipse', color: '#9B7BFF', width: 2, x: 180, y: 540, w: 180, h: 110, fill: 'transparent' },
  { tool: 'text', x: 230, y: 590, text: 'explore later', color: '#9B7BFF', size: 14, weight: 500 },
];

const Workspace = ({ dark = false, onBack, boardTitle = 'Untitled board' }) => {
  const [tool, setTool] = React.useState('pen');
  const [color, setColor] = React.useState(dark ? '#FAFAF7' : '#0A0A0A');
  const [stroke, setStroke] = React.useState(2.5);
  const [strokes, setStrokes] = React.useState(() => SEED_STROKES(dark));
  const [zoom, setZoom] = React.useState(100);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [title, setTitle] = React.useState(boardTitle);
  const [pages, setPages] = React.useState([
    { id: 'p1', name: 'Overview' },
    { id: 'p2', name: 'Research' },
    { id: 'p3', name: 'Sketches' },
  ]);
  const [activePage, setActivePage] = React.useState('p1');
  const [cursorPositions, setCursorPositions] = React.useState({});

  const canvasRef = React.useRef(null);
  const drawing = React.useRef(null);

  // Animate remote cursors (gentle floating motion)
  React.useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const dt = (t - start) / 1000;
      const w = canvasRef.current?.offsetWidth || 1200;
      const h = canvasRef.current?.offsetHeight || 700;
      const pos = {};
      REMOTE_USERS.forEach(u => {
        const x = u.tx * w + Math.sin(dt * 0.5 + u.phase) * 40 + Math.cos(dt * 0.3 + u.phase) * 20;
        const y = u.ty * h + Math.cos(dt * 0.4 + u.phase) * 24 + Math.sin(dt * 0.7 + u.phase) * 12;
        pos[u.id] = { x, y };
      });
      setCursorPositions(pos);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const getRelativePoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const onPointerDown = (e) => {
    if (tool === 'select' || tool === 'image') return;
    const [x, y] = getRelativePoint(e);
    if (tool === 'pen') {
      drawing.current = { tool, color, width: stroke, pts: [[x, y]] };
    } else if (tool === 'eraser') {
      drawing.current = { erase: true, pts: [[x, y]] };
    } else if (tool === 'rect' || tool === 'ellipse') {
      drawing.current = { tool, color, width: stroke, x, y, w: 0, h: 0, startX: x, startY: y, fill: 'transparent' };
    } else if (tool === 'arrow') {
      drawing.current = { tool: 'arrow', color, width: stroke, x1: x, y1: y, x2: x, y2: y };
    } else if (tool === 'sticky') {
      setStrokes(s => [...s, { tool: 'sticky', x: x - 60, y: y - 60, w: 120, h: 120, text: 'Type here…', color: '#FEF2DA' }]);
      return;
    } else if (tool === 'text') {
      setStrokes(s => [...s, { tool: 'text', x, y, text: 'Double-click to edit', color, size: 14 }]);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!drawing.current) return;
    const [x, y] = getRelativePoint(e);
    const d = drawing.current;
    if (d.tool === 'pen') {
      d.pts = [...d.pts, [x, y]];
    } else if (d.erase) {
      d.pts = [...d.pts, [x, y]];
    } else if (d.tool === 'rect' || d.tool === 'ellipse') {
      d.w = x - d.startX; d.h = y - d.startY;
      d.x = d.w < 0 ? x : d.startX; d.y = d.h < 0 ? y : d.startY;
      d.w = Math.abs(d.w); d.h = Math.abs(d.h);
    } else if (d.tool === 'arrow') {
      d.x2 = x; d.y2 = y;
    }
    drawing.current = { ...d };
    // force rerender by toggling a dummy key — use strokes slice
    setStrokes(s => [...s]);
  };

  const onPointerUp = () => {
    if (!drawing.current) return;
    if (drawing.current.erase) {
      // erase any stroke whose simple bbox overlaps erase points
      const pts = drawing.current.pts;
      setStrokes(s => s.filter(st => {
        if (st.tool === 'pen') {
          return !pts.some(([ex, ey]) => st.pts.some(([px, py]) => Math.hypot(px-ex, py-ey) < 14));
        }
        return true;
      }));
    } else {
      const d = drawing.current;
      if ((d.tool === 'rect' || d.tool === 'ellipse') && (d.w < 4 || d.h < 4)) {
        drawing.current = null; setStrokes(s => [...s]); return;
      }
      setStrokes(s => [...s, drawing.current]);
    }
    drawing.current = null;
  };

  const renderStroke = (s, i) => {
    if (s.tool === 'pen') {
      const d = s.pts.reduce((acc, [x, y], idx) => acc + (idx === 0 ? `M${x},${y}` : ` L${x},${y}`), '');
      return <path key={i} d={d} stroke={s.color} strokeWidth={s.width} fill="none" strokeLinecap="round" strokeLinejoin="round"/>;
    }
    if (s.tool === 'rect') return <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx="3" stroke={s.color} strokeWidth={s.width} fill={s.fill || 'transparent'}/>;
    if (s.tool === 'ellipse') return <ellipse key={i} cx={s.x + s.w/2} cy={s.y + s.h/2} rx={s.w/2} ry={s.h/2} stroke={s.color} strokeWidth={s.width} fill={s.fill || 'transparent'}/>;
    if (s.tool === 'arrow') {
      const ang = Math.atan2(s.y2 - s.y1, s.x2 - s.x1);
      const ah = 8;
      return <g key={i}>
        <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.color} strokeWidth={s.width} strokeLinecap="round"/>
        <polygon points={`${s.x2},${s.y2} ${s.x2 - ah * Math.cos(ang - 0.4)},${s.y2 - ah * Math.sin(ang - 0.4)} ${s.x2 - ah * Math.cos(ang + 0.4)},${s.y2 - ah * Math.sin(ang + 0.4)}`} fill={s.color}/>
      </g>;
    }
    if (s.tool === 'text') return (
      <foreignObject key={i} x={s.x} y={s.y - (s.size || 14)} width={400} height={100}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontFamily: 'var(--font-sans)', fontSize: s.size || 14, fontWeight: s.weight || 400, color: s.color, whiteSpace: 'pre-line', letterSpacing: '-0.005em', lineHeight: 1.35 }}>{s.text}</div>
      </foreignObject>
    );
    if (s.tool === 'sticky') return (
      <foreignObject key={i} x={s.x} y={s.y} width={s.w} height={s.h}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{
          width: '100%', height: '100%', background: s.color, padding: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)',
          fontFamily: 'var(--font-sans)', fontSize: 13, color: '#5a4a2a',
          transform: s.rotate ? `rotate(${s.rotate}deg)` : 'none', lineHeight: 1.35,
        }}>{s.text}</div>
      </foreignObject>
    );
    return null;
  };

  return (
    <div className={dark ? 'theme-dark' : ''} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: 'var(--canvas)', fontFamily: 'var(--font-sans)' }}>
      {/* Canvas */}
      <div
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="dot-grid"
        style={{ position: 'absolute', inset: 0, cursor: tool === 'pen' ? 'crosshair' : tool === 'eraser' ? 'cell' : 'default', touchAction: 'none' }}
      >
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {strokes.map(renderStroke)}
          {drawing.current && !drawing.current.erase && renderStroke(drawing.current, 'live')}
        </svg>

        {/* Remote cursors */}
        {REMOTE_USERS.map(u => {
          const pos = cursorPositions[u.id];
          if (!pos) return null;
          return (
            <div key={u.id} style={{
              position: 'absolute', left: pos.x, top: pos.y, pointerEvents: 'none',
              transition: 'transform 80ms linear', zIndex: 4,
            }}>
              <svg width="20" height="22" viewBox="0 0 20 22" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}>
                <path d="M3 2 L17 12 L10 13 L14 20 L11 21 L7 14 L3 17 Z" fill={u.color} stroke="#fff" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
              <div style={{ position: 'absolute', top: 18, left: 14, background: u.color, color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 7px', borderRadius: 4, whiteSpace: 'nowrap', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>{u.name}</div>
            </div>
          );
        })}
      </div>

      {/* Top-left: breadcrumb + title */}
      <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 10, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 10px 6px 8px', boxShadow: 'var(--shadow-1)' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--ink-3)', padding: 4, borderRadius: 4 }}>
            <Icon name="arrow_left" size={15} />
          </button>
          <PlotLogo size={20} />
          <span style={{ fontSize: 12, color: 'var(--ink-4)', margin: '0 4px' }}>/</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: 13.5, fontWeight: 500, color: 'var(--ink-0)', fontFamily: 'inherit', outline: 'none', padding: '4px 6px', borderRadius: 4, width: Math.max(title.length * 8 + 20, 120) }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-1)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', animation: 'plot-pulse 1.8s ease-in-out infinite' }}/>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Saved</span>
        </div>
      </div>

      {/* Top-right */}
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 10, zIndex: 10 }}>
        {/* Presence */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px 6px 8px', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-1)' }}>
          <AvatarStack users={[
            { name: 'Nina Petrov', color: 'var(--user-coral)' },
            { name: 'Ira K', color: 'var(--user-mint)' },
            { name: 'Dan Pike', color: 'var(--user-amber)' },
            { name: 'Yu', color: 'var(--user-sky)' },
            { name: 'Sam', color: 'var(--user-lilac)' },
            { name: 'Eva', color: 'var(--user-rose)' },
            { name: 'Max', color: 'var(--user-coral)' },
          ]} max={4} size={24}/>
        </div>

        <button className="btn btn-outline" onClick={() => setShareOpen(true)}>
          <Icon name="share" size={14} />
          Share
        </button>
        <button className="btn btn-accent" onClick={() => setExportOpen(true)}>
          <Icon name="download" size={14} />
          Export
        </button>
      </div>

      {/* Pages panel */}
      <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 12, padding: 6, display: 'flex', flexDirection: 'column', gap: 6, boxShadow: 'var(--shadow-2)', zIndex: 10 }}>
        {pages.map((p, i) => (
          <div key={p.id} onClick={() => setActivePage(p.id)} className="page-thumb" style={{
            width: 58, position: 'relative', borderRadius: 6, overflow: 'hidden', cursor: 'pointer',
            border: activePage === p.id ? `2px solid var(--accent)` : '2px solid transparent',
            padding: 0,
          }}>
            <div style={{ background: 'var(--ink-9)', aspectRatio: '4/3', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 4, background: 'var(--paper)', borderRadius: 2 }}>
                {i === 0 && <svg viewBox="0 0 58 44" style={{ width: '100%', height: '100%' }}><rect x="6" y="6" width="14" height="10" fill="#FFD3CC"/><rect x="24" y="8" width="14" height="8" fill="#E7F7EE"/><line x1="6" y1="22" x2="48" y2="22" stroke="#44443F" strokeWidth="0.6"/><circle cx="42" cy="32" r="4" fill="#E9E6FF"/></svg>}
                {i === 1 && <svg viewBox="0 0 58 44" style={{ width: '100%', height: '100%' }}><line x1="4" y1="8" x2="24" y2="8" stroke="#0A0A0A" strokeWidth="1.5"/><line x1="4" y1="14" x2="40" y2="14" stroke="#BDBDB4" strokeWidth="0.8"/><line x1="4" y1="20" x2="36" y2="20" stroke="#BDBDB4" strokeWidth="0.8"/><line x1="4" y1="26" x2="44" y2="26" stroke="#BDBDB4" strokeWidth="0.8"/></svg>}
                {i === 2 && <svg viewBox="0 0 58 44" style={{ width: '100%', height: '100%' }}><path d="M 6 34 Q 14 10, 24 24 T 44 18" stroke="#FF6B5B" strokeWidth="1.2" fill="none"/></svg>}
              </div>
            </div>
            <div style={{ fontSize: 10, color: activePage === p.id ? 'var(--ink-0)' : 'var(--ink-4)', fontWeight: activePage === p.id ? 600 : 400, textAlign: 'center', padding: '3px 0 1px', fontVariantNumeric: 'tabular-nums' }}>{i+1}</div>
          </div>
        ))}
        <button
          onClick={() => setPages(p => [...p, { id: 'p' + Date.now(), name: 'Untitled' }])}
          style={{ width: 58, height: 44, borderRadius: 6, border: `1.5px dashed var(--border-strong)`, background: 'transparent', color: 'var(--ink-4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="plus" size={14} />
        </button>
      </div>

      {/* Bottom-center toolbar */}
      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {/* Contextual row (color + stroke) */}
        {(tool === 'pen' || tool === 'rect' || tool === 'ellipse' || tool === 'arrow' || tool === 'text') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: dark ? 'rgba(40,38,34,0.82)' : 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px) saturate(1.3)', border: '1px solid var(--border)', borderRadius: 999, padding: '6px 12px', boxShadow: 'var(--shadow-glass)', animation: 'plot-rise 200ms var(--ease-spring)' }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} style={{
                width: 20, height: 20, borderRadius: 10, background: c, border: color === c ? `2px solid var(--ink-0)` : '2px solid transparent', padding: 0, cursor: 'pointer', transition: 'transform 120ms var(--ease-spring)', transform: color === c ? 'scale(1.1)' : 'scale(1)',
              }}/>
            ))}
            <div style={{ width: 1, height: 20, background: 'var(--border)' }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>{stroke.toFixed(1)}</span>
              <input type="range" min="1" max="12" step="0.5" value={stroke} onChange={e => setStroke(parseFloat(e.target.value))} style={{ width: 90, accentColor: 'var(--accent)' }}/>
            </div>
          </div>
        )}

        {/* Main tool row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: dark ? 'rgba(40,38,34,0.85)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(1.4)', border: '1px solid var(--border)', borderRadius: 14, padding: 6, boxShadow: 'var(--shadow-glass)' }}>
          {TOOLS.map(t => {
            const active = tool === t.id;
            return (
              <button key={t.id} onClick={() => setTool(t.id)} title={`${t.label} (${t.shortcut})`} style={{
                width: 38, height: 38, borderRadius: 9, border: 'none', cursor: 'pointer',
                background: active ? 'var(--ink-0)' : 'transparent',
                color: active ? 'var(--paper)' : 'var(--ink-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 120ms var(--ease-out)', position: 'relative',
              }} onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--ink-9)'; }}
                 onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                <Icon name={t.icon} size={17} />
              </button>
            );
          })}
          <div style={{ width: 1, height: 20, margin: '0 4px', background: 'var(--border)' }}/>
          <button onClick={() => setStrokes([])} title="Clear" style={{ width: 38, height: 38, borderRadius: 9, border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="trash" size={16} />
          </button>
        </div>
      </div>

      {/* Bottom-right: zoom + minimap */}
      <div style={{ position: 'absolute', bottom: 20, right: 20, display: 'flex', alignItems: 'center', gap: 10, zIndex: 10 }}>
        <div style={{ width: 160, height: 100, background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-2)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, var(--ink-7) 0.8px, transparent 0.8px)', backgroundSize: '6px 6px' }}/>
          <div style={{ position: 'absolute', left: '20%', top: '25%', width: '45%', height: '45%', border: `2px solid var(--accent)`, borderRadius: 3, background: 'rgba(255,107,91,0.08)' }}/>
          <div style={{ position: 'absolute', left: '15%', top: '22%', width: 14, height: 8, background: 'var(--user-coral)', opacity: 0.4, borderRadius: 1 }}/>
          <div style={{ position: 'absolute', left: '45%', top: '45%', width: 10, height: 6, background: 'var(--user-mint)', opacity: 0.5, borderRadius: 1 }}/>
          <div style={{ position: 'absolute', left: '60%', top: '55%', width: 8, height: 8, background: 'var(--user-amber)', opacity: 0.4, borderRadius: 1 }}/>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, boxShadow: 'var(--shadow-2)' }}>
          <button onClick={() => setZoom(z => Math.min(400, z + 10))} style={{ width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 6, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={14}/></button>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{zoom}%</div>
          <button onClick={() => setZoom(z => Math.max(10, z - 10))} style={{ width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 6, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="minus" size={14}/></button>
        </div>
      </div>

      {shareOpen && <ShareModal onClose={() => setShareOpen(false)} />}
      {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}

      <style>{`
        @keyframes plot-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes plot-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
};

// ─────────────── Share modal ───────────────
const ShareModal = ({ onClose }) => {
  const [role, setRole] = React.useState('Editor');
  const [copied, setCopied] = React.useState(false);
  const users = [
    { name: 'Nina Petrov', color: 'var(--user-coral)', email: 'nina@plot.dev', role: 'Manager', you: true },
    { name: 'Ira Kolesnik', color: 'var(--user-mint)', email: 'ira@plot.dev', role: 'Editor' },
    { name: 'Dan Pike', color: 'var(--user-amber)', email: 'dan@plot.dev', role: 'Editor' },
    { name: 'Yu Chen', color: 'var(--user-sky)', email: 'yu@plot.dev', role: 'Viewer' },
  ];
  return (
    <ModalShell onClose={onClose} width={720}>
      <div style={{ padding: '24px 28px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--ink-0)' }}>Share board</h2>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 14, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink-4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={16}/></button>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>Anyone with the link can join instantly — no signup.</div>
      </div>

      <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left: link + role */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Public link</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1, padding: '9px 12px', background: 'var(--ink-9)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>plot.so/b/q2-planning</div>
            <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="btn btn-outline">
              {copied ? <><Icon name="check" size={14}/>Copied</> : <><Icon name="copy" size={14}/>Copy</>}
            </button>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 22, marginBottom: 8 }}>Default role</div>
          <div style={{ display: 'flex', gap: 0, padding: 4, background: 'var(--ink-9)', borderRadius: 8, border: '1px solid var(--border)' }}>
            {['Viewer', 'Editor', 'Manager'].map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                flex: 1, padding: '7px 10px', border: 'none', borderRadius: 6,
                background: role === r ? 'var(--paper)' : 'transparent',
                color: role === r ? 'var(--ink-0)' : 'var(--ink-3)', fontWeight: role === r ? 600 : 400,
                fontSize: 13, cursor: 'pointer', boxShadow: role === r ? 'var(--shadow-1)' : 'none', transition: 'all 120ms var(--ease-out)'
              }}>{r}</button>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-4)', lineHeight: 1.5 }}>
            {role === 'Viewer' && 'Can view and comment, but not change content.'}
            {role === 'Editor' && 'Can draw, add pages, and manage content.'}
            {role === 'Manager' && 'Full control including permissions.'}
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 22, marginBottom: 10 }}>Granular permissions</div>
          {[
            { label: 'Can add pages', on: true },
            { label: 'Can delete pages', on: false },
            { label: 'Can manage permissions', on: false },
            { label: 'Can export', on: true },
          ].map(t => (
            <div key={t.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: 13.5, color: 'var(--ink-1)', borderBottom: '1px solid var(--border)' }}>
              <span>{t.label}</span>
              <Toggle initial={t.on}/>
            </div>
          ))}
        </div>

        {/* Right: users list */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>People with access</div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            {users.map((u, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none', background: u.you ? 'var(--ink-9)' : 'transparent' }}>
                <Avatar name={u.name} color={u.color} size={32} ring={false}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink-0)' }}>{u.name} {u.you && <span style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 400 }}>(you)</span>}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-4)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                </div>
                <select defaultValue={u.role} style={{ border: '1px solid var(--border)', background: 'var(--paper)', borderRadius: 6, padding: '5px 8px', fontSize: 12.5, color: 'var(--ink-2)', fontFamily: 'inherit', cursor: 'pointer' }}>
                  <option>Viewer</option><option>Editor</option><option>Manager</option>
                </select>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-4)' }}>4 people · 2 active now</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '16px 28px', borderTop: '1px solid var(--border)', background: 'var(--ink-9)' }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary">Done</button>
      </div>
    </ModalShell>
  );
};

// ─────────────── Export modal ───────────────
const ExportModal = ({ onClose }) => {
  const [fmt, setFmt] = React.useState('JPEG');
  const [quality, setQuality] = React.useState(92);
  const [scope, setScope] = React.useState('current');
  return (
    <ModalShell onClose={onClose} width={560}>
      <div style={{ padding: '24px 28px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--ink-0)' }}>Export</h2>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 14, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink-4)' }}><Icon name="x" size={16}/></button>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>Download your board as an image.</div>
      </div>

      <div style={{ padding: '20px 28px' }}>
        {/* Preview */}
        <div style={{ background: 'var(--ink-9)', borderRadius: 10, padding: 16, marginBottom: 20, border: '1px solid var(--border)' }}>
          {scope === 'current' ? (
            <div style={{ aspectRatio: '16/9', background: '#FDFBF4', borderRadius: 6, border: '1px solid var(--border)', boxShadow: 'var(--shadow-1)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0 }} className="dot-grid"/>
              <svg viewBox="0 0 400 225" style={{ width: '100%', height: '100%', position: 'relative' }}>
                <rect x="60" y="40" width="120" height="60" rx="4" fill="#FFE8E4" stroke="#FF6B5B"/>
                <rect x="220" y="50" width="100" height="50" rx="4" fill="#E7F7EE" stroke="#4FD1A5"/>
                <line x1="180" y1="70" x2="220" y2="75" stroke="#44443F" strokeWidth="1"/>
                <rect x="80" y="140" width="70" height="60" fill="#FEF2DA" transform="rotate(-3 115 170)"/>
                <path d="M 260 140 Q 300 180 340 150" stroke="#9B7BFF" strokeWidth="2" fill="none"/>
              </svg>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ aspectRatio: '4/3', background: '#FDFBF4', borderRadius: 4, border: '1px solid var(--border)' }} className="dot-grid"/>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Format</div>
            <div style={{ display: 'flex', gap: 0, padding: 4, background: 'var(--ink-9)', borderRadius: 8, border: '1px solid var(--border)' }}>
              {['JPEG', 'PNG'].map(f => (
                <button key={f} onClick={() => setFmt(f)} style={{
                  flex: 1, padding: '7px 10px', border: 'none', borderRadius: 6,
                  background: fmt === f ? 'var(--paper)' : 'transparent',
                  color: fmt === f ? 'var(--ink-0)' : 'var(--ink-3)', fontWeight: fmt === f ? 600 : 400,
                  fontSize: 13, cursor: 'pointer', boxShadow: fmt === f ? 'var(--shadow-1)' : 'none',
                }}>{f}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Scope</div>
            <div style={{ display: 'flex', gap: 0, padding: 4, background: 'var(--ink-9)', borderRadius: 8, border: '1px solid var(--border)' }}>
              {[{id:'current',label:'Current page'},{id:'all',label:'All pages'}].map(s => (
                <button key={s.id} onClick={() => setScope(s.id)} style={{
                  flex: 1, padding: '7px 10px', border: 'none', borderRadius: 6,
                  background: scope === s.id ? 'var(--paper)' : 'transparent',
                  color: scope === s.id ? 'var(--ink-0)' : 'var(--ink-3)', fontWeight: scope === s.id ? 600 : 400,
                  fontSize: 13, cursor: 'pointer', boxShadow: scope === s.id ? 'var(--shadow-1)' : 'none',
                }}>{s.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Quality</span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{quality}%</span>
          </div>
          <input type="range" min="30" max="100" value={quality} onChange={e => setQuality(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-5)', marginTop: 4, fontFamily: 'var(--font-mono)' }}><span>Smaller</span><span>Sharper</span></div>
        </div>

        <div style={{ marginTop: 20, padding: '12px 14px', background: 'var(--ink-9)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--ink-3)' }}>
          <Icon name="image" size={15} color="var(--ink-4)"/>
          <span>Estimated size: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-1)' }}>{(quality * 0.018 + 0.6).toFixed(1)} MB</span> · 1920×1080</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '16px 28px', borderTop: '1px solid var(--border)', background: 'var(--ink-9)' }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-accent"><Icon name="download" size={14}/>Download</button>
      </div>
    </ModalShell>
  );
};

const ModalShell = ({ children, onClose, width = 560 }) => {
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,10,10,0.35)', backdropFilter: 'blur(6px)', animation: 'plot-fade 150ms ease-out' }}>
      <div onClick={e => e.stopPropagation()} style={{ width, maxWidth: 'calc(100% - 40px)', background: 'var(--paper)', borderRadius: 14, boxShadow: 'var(--shadow-4)', overflow: 'hidden', animation: 'plot-pop 180ms var(--ease-spring)', border: '1px solid var(--border)' }}>
        {children}
      </div>
      <style>{`
        @keyframes plot-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes plot-pop { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
};

const Toggle = ({ initial = false }) => {
  const [on, setOn] = React.useState(initial);
  return (
    <button onClick={() => setOn(o => !o)} style={{
      width: 34, height: 20, borderRadius: 10, border: 'none', padding: 2,
      background: on ? 'var(--ink-0)' : 'var(--ink-7)', cursor: 'pointer',
      transition: 'background 180ms var(--ease-out)', display: 'flex', alignItems: 'center',
    }}>
      <span style={{ width: 16, height: 16, borderRadius: 8, background: '#fff', transform: on ? 'translateX(14px)' : 'translateX(0)', transition: 'transform 180ms var(--ease-spring)', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }}/>
    </button>
  );
};

Object.assign(window, { Workspace, ShareModal, ExportModal, ModalShell, Toggle });

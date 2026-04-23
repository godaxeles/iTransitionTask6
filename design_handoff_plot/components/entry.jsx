// Plot — Entry Screen (3 moods)

const EntryScreen = ({ mood = 'aurora' }) => {
  const [name, setName] = React.useState('');
  const [focused, setFocused] = React.useState(false);

  const Bg = () => {
    if (mood === 'aurora') {
      return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'var(--canvas)' }}>
          <div style={{
            position: 'absolute', width: '70%', height: '60%', top: '-10%', left: '-10%',
            background: 'radial-gradient(closest-side, rgba(255,107,91,0.35), transparent)',
            filter: 'blur(40px)', animation: 'plot-aurora-1 14s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute', width: '60%', height: '70%', bottom: '-15%', right: '-10%',
            background: 'radial-gradient(closest-side, rgba(245,180,85,0.28), transparent)',
            filter: 'blur(50px)', animation: 'plot-aurora-2 18s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute', width: '45%', height: '55%', top: '25%', right: '25%',
            background: 'radial-gradient(closest-side, rgba(155,123,255,0.22), transparent)',
            filter: 'blur(60px)', animation: 'plot-aurora-3 22s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0.3 0'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.5'/></svg>")`,
            opacity: 0.15, mixBlendMode: 'multiply',
          }} />
        </div>
      );
    }
    if (mood === 'grid') {
      return (
        <div style={{ position: 'absolute', inset: 0, background: '#F7F5EE' }}>
          <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.9 }} />
          {/* Floating doodle marks */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <path d="M 120 180 Q 180 140, 240 200 T 360 220" stroke="var(--accent)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.55" style={{ animation: 'plot-draw 4s ease-out infinite alternate' }} />
            <circle cx="1140" cy="180" r="28" stroke="var(--user-lilac)" strokeWidth="2.5" fill="none" opacity="0.55" />
            <rect x="80" y="620" width="80" height="80" rx="8" stroke="var(--user-mint)" strokeWidth="2.5" fill="none" opacity="0.55" style={{ transform: 'rotate(-8deg)', transformOrigin: 'center' }} />
            <path d="M 1200 700 L 1280 640 L 1320 720 Z" stroke="var(--user-amber)" strokeWidth="2.5" fill="none" opacity="0.55" strokeLinejoin="round" />
            <path d="M 1040 520 Q 1100 500 1120 560" stroke="var(--ink-3)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.25" />
          </svg>
        </div>
      );
    }
    // editorial — bold type + warm paper
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #F3EFE5 0%, #E9E3D3 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at top, rgba(255,255,255,0.6), transparent 60%)' }} />
        <div style={{
          position: 'absolute', top: '8%', left: '-4%', fontSize: 480, fontWeight: 600,
          letterSpacing: '-0.05em', color: 'rgba(10,10,10,0.04)', lineHeight: 0.9,
          fontFamily: 'var(--font-display)', userSelect: 'none'
        }}>plot.</div>
      </div>
    );
  };

  const onCTA = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.__plotNav) window.__plotNav('dashboard', { name: name || 'Guest' });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', fontFamily: 'var(--font-sans)' }}>
      <Bg />

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 28, left: 40, right: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PlotLogo size={28} />
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>Plot</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)' }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', marginRight: 4 }}/>
          <span className="t-mono">24 online</span>
        </div>
      </div>

      {/* Centered card */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
        <div style={{ width: 440, padding: '44px 44px 36px', background: mood === 'editorial' ? 'rgba(255,253,248,0.82)' : 'rgba(255,255,255,0.78)', backdropFilter: 'blur(18px)', borderRadius: 20, boxShadow: 'var(--shadow-glass)', border: '1px solid rgba(255,255,255,0.6)', position: 'relative' }}>
          {/* Easter egg drawn line on focus */}
          <svg style={{ position: 'absolute', top: -2, left: 44, right: 44, height: 2, pointerEvents: 'none', width: 'calc(100% - 88px)' }}>
            <line x1="0" y1="1" x2={focused ? '100%' : '0%'} y2="1" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" style={{ transition: 'all 700ms var(--ease-out)' }} />
          </svg>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-0.028em', lineHeight: 1.08, color: 'var(--ink-0)' }}>
              Draw together.<br/><span style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif', fontWeight: 500, color: 'var(--accent)' }}>Instantly</span>.
            </div>
            <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.55 }}>
              A shared canvas for teams that think better with a marker in hand.
            </div>
          </div>

          <form onSubmit={onCTA}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-4)', marginBottom: 8, letterSpacing: '0.02em', textTransform: 'uppercase' }}>Your name</label>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="e.g. Nina Petrov"
                className="input"
                style={{ fontSize: 15, padding: '13px 14px 13px 42px', borderRadius: 10 }}
                autoFocus
              />
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }}>
                <Icon name="user" size={16} />
              </div>
              {focused && (
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-5)', animation: 'plot-blink 1.4s ease-in-out infinite' }}>press ↵</div>
              )}
            </div>

            <button type="submit" style={{
              width: '100%', padding: '13px 14px', background: 'var(--ink-0)', color: 'var(--paper)',
              border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.08)',
              transition: 'all var(--dur-fast) var(--ease-out)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-2)';}}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.08)';}}
            >
              Continue <Icon name="arrow_right" size={16} />
            </button>
          </form>

          <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            {[
              { name: 'Ira', color: 'var(--user-coral)' },
              { name: 'Max Rothko', color: 'var(--user-mint)' },
              { name: 'Yu', color: 'var(--user-sky)' },
              { name: 'Dan Pike', color: 'var(--user-amber)' },
              { name: 'Eva', color: 'var(--user-lilac)' },
            ].map((u, i) => <Avatar key={i} name={u.name} color={u.color} size={22} />)}
            <span style={{ fontSize: 12, color: 'var(--ink-4)', marginLeft: 4 }}>joined today</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, textAlign: 'center', zIndex: 2 }}>
        <div className="t-mono" style={{ fontSize: 12, color: 'var(--ink-4)' }}>
          No signup &nbsp;·&nbsp; No tracking &nbsp;·&nbsp; Just draw.
        </div>
      </div>

      <style>{`
        @keyframes plot-aurora-1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(5%, 8%) scale(1.15); } }
        @keyframes plot-aurora-2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-8%, -4%) scale(1.1); } }
        @keyframes plot-aurora-3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(10%, -10%) scale(0.95); } }
        @keyframes plot-blink { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes plot-draw { 0% { stroke-dashoffset: 200; } 100% { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
};

Object.assign(window, { EntryScreen });

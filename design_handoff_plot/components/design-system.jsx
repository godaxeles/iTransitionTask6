// Plot — Design System page

const DSSection = ({ title, subtitle, children }) => (
  <section style={{ marginBottom: 56 }}>
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>{subtitle}</div>}
    </div>
    {children}
  </section>
);

const Swatch = ({ name, value, dark }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <div style={{ width: '100%', aspectRatio: '1.4', borderRadius: 8, background: value, border: '1px solid var(--border)' }}/>
    <div style={{ fontSize: 12.5, color: 'var(--ink-1)', fontWeight: 500 }}>{name}</div>
    <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>{value}</div>
  </div>
);

const DesignSystem = () => {
  return (
    <div style={{ width: '100%', minHeight: '100%', background: 'var(--canvas)', fontFamily: 'var(--font-sans)', padding: '48px 56px 80px', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <PlotLogo size={32} />
            <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Plot</span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'var(--ink-9)', border: '1px solid var(--border)', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginLeft: 4 }}>v0.1</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 40, fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--ink-0)' }}>Design system</h1>
          <div style={{ marginTop: 10, fontSize: 15, color: 'var(--ink-3)', maxWidth: 620, lineHeight: 1.5 }}>
            Tokens, primitives and patterns for a calm, confident, creative whiteboarding surface. Warm off-white foundation, deep ink, and a single warm-coral accent carry every screen.
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', textAlign: 'right', lineHeight: 1.6 }}>
          <div>updated · apr 22, 2026</div>
          <div>tokens · 76</div>
          <div>components · 18</div>
        </div>
      </div>

      {/* Typography */}
      <DSSection title="Typography" subtitle="Geist Sans for UI, Geist Mono for numerics & tags. Tight tracking on headings, generous line-height on body.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { cls: 't-display', label: 'Display / 56 / 600', sample: 'Draw together.' },
              { cls: 't-h1', label: 'H1 / 40 / 600', sample: 'My boards' },
              { cls: 't-h2', label: 'H2 / 28 / 600', sample: 'Share board' },
              { cls: 't-h3', label: 'H3 / 20 / 600', sample: 'People with access' },
              { cls: 't-body', label: 'Body / 15 / 400', sample: 'Anyone with the link can join instantly — no signup.' },
              { cls: 't-sm', label: 'Small / 13 / 400', sample: 'Edited 5m ago by Nina Petrov' },
              { cls: 't-xs', label: 'Micro / 12 / 400', sample: 'NO SIGNUP · NO TRACKING' },
              { cls: 't-mono', label: 'Mono / 12', sample: 'plot.so/b/q2-planning' },
            ].map(t => (
              <div key={t.cls}>
                <div className="t-mono" style={{ marginBottom: 4 }}>{t.label}</div>
                <div className={t.cls}>{t.sample}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 12, padding: 32 }}>
              <div style={{ fontSize: 120, fontWeight: 600, lineHeight: 0.9, letterSpacing: '-0.04em', color: 'var(--ink-0)' }}>Aa</div>
              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--ink-3)' }}>Geist Sans · Variable</div>
              <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 15 }}>
                {['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz', '0123456789', '—()./:;"\'?!@#$%&*'].map((s, i) => (
                  <div key={i} style={{ color: 'var(--ink-2)' }}>{s}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DSSection>

      {/* Colors */}
      <DSSection title="Color" subtitle="Warm ink & paper. A single coral accent, amber + mint + sky + lilac + rose for collaborative identity.">
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-3)', marginBottom: 10 }}>Neutral · warm ink scale</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6 }}>
            {[
              ['Ink 0', '#0A0A0A'],['Ink 1', '#1A1A18'],['Ink 2', '#2A2A27'],['Ink 3', '#44443F'],['Ink 4', '#6B6B64'],
              ['Ink 5', '#96968D'],['Ink 6', '#BDBDB4'],['Ink 7', '#DEDED6'],['Ink 8', '#EEEDE6'],['Canvas', '#FAFAF7'],
            ].map(([n, v]) => <Swatch key={n} name={n} value={v}/>)}
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-3)', marginBottom: 10 }}>Accent · warm coral</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, maxWidth: 480 }}>
            {[
              ['Accent soft', '#FFF5F3'],
              ['Accent tint', '#FFE8E4'],
              ['Accent', '#FF6B5B'],
              ['Accent hover', '#F55747'],
              ['Accent press', '#E04436'],
            ].map(([n, v]) => <Swatch key={n} name={n} value={v}/>)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-3)', marginBottom: 10 }}>User colors · cursors & chips</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, maxWidth: 580 }}>
            {[
              ['Coral', '#FF6B5B'],
              ['Amber', '#F5B455'],
              ['Mint', '#4FD1A5'],
              ['Sky', '#5BA3FF'],
              ['Lilac', '#9B7BFF'],
              ['Rose', '#FF7BB5'],
            ].map(([n, v]) => <Swatch key={n} name={n} value={v}/>)}
          </div>
        </div>
      </DSSection>

      {/* Radii & shadows */}
      <DSSection title="Radii & Shadows" subtitle="12px for cards, 8px for buttons, 999px for pills. Soft, layered elevation — never harsh.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-3)', marginBottom: 10 }}>Radii</div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {[['4',4],['6',6],['8',8],['12',12],['16',16],['999',999]].map(([l,r]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ width: 72, height: 72, background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: r }}/>
                  <div className="t-mono" style={{ marginTop: 6 }}>{l}px</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-3)', marginBottom: 10 }}>Shadows</div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {[
                { label: 'sh-1', sh: 'var(--shadow-1)' },
                { label: 'sh-2', sh: 'var(--shadow-2)' },
                { label: 'sh-3', sh: 'var(--shadow-3)' },
                { label: 'sh-4', sh: 'var(--shadow-4)' },
                { label: 'glass', sh: 'var(--shadow-glass)' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ width: 72, height: 72, background: 'var(--paper)', borderRadius: 10, boxShadow: s.sh }}/>
                  <div className="t-mono" style={{ marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DSSection>

      {/* Buttons */}
      <DSSection title="Buttons" subtitle="Primary (ink), Accent (coral), Outline, Ghost. 150–250ms ease-out on all states.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Primary', btn: <button className="btn btn-primary">Continue <Icon name="arrow_right" size={14}/></button> },
            { label: 'Accent', btn: <button className="btn btn-accent"><Icon name="plus" size={14}/>New board</button> },
            { label: 'Outline', btn: <button className="btn btn-outline"><Icon name="share" size={14}/>Share</button> },
            { label: 'Ghost', btn: <button className="btn btn-ghost">Cancel</button> },
          ].map(v => (
            <div key={v.label} style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14 }}>
              <div className="t-mono">{v.label}</div>
              {v.btn}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {['default', 'hover', 'disabled', 'loading'].map(s => (
            <div key={s} style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14 }}>
              <div className="t-mono">state · {s}</div>
              <button className="btn btn-primary" style={
                s === 'hover' ? { background: 'var(--ink-1)', transform: 'translateY(-0.5px)', boxShadow: 'var(--shadow-2)' } :
                s === 'disabled' ? { opacity: 0.4, cursor: 'not-allowed' } :
                {}
              }>
                {s === 'loading' && <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 6, border: '1.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'plot-spin 700ms linear infinite' }}/>}
                Continue
              </button>
            </div>
          ))}
        </div>
      </DSSection>

      {/* Inputs */}
      <DSSection title="Inputs" subtitle="Subtle borders, coral focus ring.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'default', style: {} },
            { label: 'focus', style: { borderColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-tint)' } },
            { label: 'filled', v: 'Nina Petrov', style: {} },
          ].map(i => (
            <div key={i.label} style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
              <div className="t-mono" style={{ marginBottom: 8 }}>input · {i.label}</div>
              <input className="input" defaultValue={i.v || ''} placeholder="Your name" style={i.style}/>
            </div>
          ))}
        </div>
      </DSSection>

      {/* Chips */}
      <DSSection title="Chips & tags">
        <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span className="chip is-active">Recent</span>
          <span className="chip">Most active</span>
          <span className="chip">Alphabetical</span>
          <span className="chip" style={{ background: 'var(--accent-tint)', color: 'var(--accent-press)', border: '1px solid transparent' }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent)' }}/> Planning
          </span>
          <span className="chip"><Icon name="clock" size={11}/>Edited 5m ago</span>
          <span className="chip" style={{ background: '#E7F7EE', color: '#217954', border: '1px solid transparent' }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--user-mint)' }}/> 2 online
          </span>
        </div>
      </DSSection>

      {/* Avatars */}
      <DSSection title="Avatars & presence">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
            <div className="t-mono" style={{ marginBottom: 12 }}>sizes</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Avatar name="Nina" color="var(--user-coral)" size={20}/>
              <Avatar name="Ira" color="var(--user-mint)" size={24}/>
              <Avatar name="Dan Pike" color="var(--user-amber)" size={28}/>
              <Avatar name="Yu Chen" color="var(--user-sky)" size={36}/>
              <Avatar name="Max Rothko" color="var(--user-lilac)" size={48}/>
            </div>
          </div>
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
            <div className="t-mono" style={{ marginBottom: 12 }}>stack</div>
            <AvatarStack users={[
              { name: 'Nina', color: 'var(--user-coral)' },
              { name: 'Ira', color: 'var(--user-mint)' },
              { name: 'Dan', color: 'var(--user-amber)' },
              { name: 'Yu', color: 'var(--user-sky)' },
              { name: 'Max', color: 'var(--user-lilac)' },
              { name: 'Eva', color: 'var(--user-rose)' },
              { name: 'Sam', color: 'var(--user-coral)' },
            ]} max={4} size={28}/>
          </div>
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
            <div className="t-mono" style={{ marginBottom: 12 }}>cursor label</div>
            <div style={{ position: 'relative', paddingLeft: 22 }}>
              <svg width="20" height="22" viewBox="0 0 20 22" style={{ position: 'absolute', left: 0, top: 0 }}>
                <path d="M3 2 L17 12 L10 13 L14 20 L11 21 L7 14 L3 17 Z" fill="var(--user-mint)" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
              <span style={{ display: 'inline-block', marginTop: 16, marginLeft: -8, background: 'var(--user-mint)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 7px', borderRadius: 4 }}>Ira K</span>
            </div>
          </div>
        </div>
      </DSSection>

      {/* Tool swatches + tool buttons */}
      <DSSection title="Toolbar primitives">
        <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div className="t-mono" style={{ marginBottom: 10 }}>tool button · states</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['default', 'hover', 'active'].map(s => (
                <div key={s} style={{ textAlign: 'center' }}>
                  <button style={{
                    width: 38, height: 38, borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: s === 'active' ? 'var(--ink-0)' : s === 'hover' ? 'var(--ink-9)' : 'transparent',
                    color: s === 'active' ? 'var(--paper)' : 'var(--ink-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Icon name="pen" size={17}/></button>
                  <div className="t-mono" style={{ marginTop: 6 }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="t-mono" style={{ marginBottom: 10 }}>color swatch · 8 presets + custom</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {['#0A0A0A', '#FF6B5B', '#F5B455', '#4FD1A5', '#5BA3FF', '#9B7BFF', '#FF7BB5', '#96968D'].map((c, i) => (
                <div key={c} style={{ width: 22, height: 22, borderRadius: 11, background: c, border: i === 1 ? `2px solid var(--ink-0)` : '2px solid transparent', transform: i === 1 ? 'scale(1.1)' : 'none' }}/>
              ))}
              <div style={{ width: 22, height: 22, borderRadius: 11, border: '1.5px dashed var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)' }}>
                <Icon name="plus" size={10}/>
              </div>
            </div>
          </div>
        </div>
      </DSSection>

      {/* Cards */}
      <DSSection title="Cards & page thumbnails">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
            <div className="t-mono" style={{ marginBottom: 12 }}>board card</div>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ aspectRatio: '16/9', background: '#FDFBF4', borderBottom: '1px solid var(--border)' }} className="dot-grid"/>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Q2 Planning — Growth</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-4)' }}>
                  <AvatarStack users={[
                    { name: 'N', color: 'var(--user-coral)' },
                    { name: 'I', color: 'var(--user-mint)' },
                  ]} max={3} size={20}/>
                  <span>5m ago</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
            <div className="t-mono" style={{ marginBottom: 12 }}>page thumbnail</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[true, false, false].map((active, i) => (
                <div key={i} style={{ width: 58 }}>
                  <div style={{ background: 'var(--ink-9)', aspectRatio: '4/3', borderRadius: 6, border: active ? '2px solid var(--accent)' : '2px solid transparent' }}/>
                  <div style={{ fontSize: 10, color: active ? 'var(--ink-0)' : 'var(--ink-4)', textAlign: 'center', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{i+1}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
            <div className="t-mono" style={{ marginBottom: 12 }}>sticky note</div>
            <div style={{ width: 140, height: 100, background: '#FEF2DA', padding: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transform: 'rotate(-2deg)', fontSize: 13, color: '#5a4a2a' }}>
              Ship v1 by Friday 🚀
            </div>
          </div>
        </div>
      </DSSection>

      {/* Motion */}
      <DSSection title="Motion" subtitle="150ms fast, 200ms medium, 280ms slow. ease-out for UI, spring for playful moments.">
        <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {[
            { label: '150ms · ease-out', dur: '1.5s' },
            { label: '200ms · ease-out', dur: '2s' },
            { label: '280ms · spring', dur: '2.8s', easing: 'cubic-bezier(0.34,1.56,0.64,1)' },
          ].map(m => (
            <div key={m.label}>
              <div className="t-mono" style={{ marginBottom: 10 }}>{m.label}</div>
              <div style={{ width: 140, height: 28, background: 'var(--ink-9)', borderRadius: 14, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 4, left: 4, width: 20, height: 20, borderRadius: 10, background: 'var(--accent)', animation: `plot-slide ${m.dur} ${m.easing || 'cubic-bezier(0.2,0.7,0.3,1)'} infinite` }}/>
              </div>
            </div>
          ))}
        </div>
      </DSSection>

      <style>{`
        @keyframes plot-spin { to { transform: rotate(360deg); } }
        @keyframes plot-slide { 0%,100% { left: 4px; } 50% { left: calc(100% - 24px); } }
      `}</style>

      <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', display: 'flex', justifyContent: 'space-between' }}>
        <span>plot · design-system.md</span>
        <span>Nina Petrov, Apr 22</span>
      </div>
    </div>
  );
};

Object.assign(window, { DesignSystem });

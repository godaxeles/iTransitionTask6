// Plot — Boards Dashboard

const MOCK_BOARDS = [
  { id: 'b1', title: 'Q2 Planning — Growth', pinned: true, edited: '5m ago', activity: 94, collaborators: [
    { name: 'Nina Petrov', color: 'var(--user-coral)' },
    { name: 'Ira K', color: 'var(--user-mint)' },
    { name: 'Dan Pike', color: 'var(--user-amber)' },
  ], preview: 'planning' },
  { id: 'b2', title: 'Onboarding Flow v3', pinned: true, edited: '1h ago', activity: 62, collaborators: [
    { name: 'Max', color: 'var(--user-lilac)' },
    { name: 'Yu', color: 'var(--user-sky)' },
  ], preview: 'flow' },
  { id: 'b3', title: 'Brainstorm — Feature X', edited: '3h ago', activity: 40, collaborators: [
    { name: 'Nina', color: 'var(--user-coral)' },
    { name: 'Dan', color: 'var(--user-amber)' },
    { name: 'Eva', color: 'var(--user-lilac)' },
    { name: 'Sam', color: 'var(--user-sky)' },
    { name: 'Ira', color: 'var(--user-mint)' },
  ], preview: 'brainstorm' },
  { id: 'b4', title: 'Design Review · Nov', edited: '1d ago', activity: 28, collaborators: [
    { name: 'Max', color: 'var(--user-lilac)' },
  ], preview: 'review' },
  { id: 'b5', title: 'Retro — Sprint 12', edited: '2d ago', activity: 22, collaborators: [
    { name: 'Yu', color: 'var(--user-sky)' },
    { name: 'Eva', color: 'var(--user-lilac)' },
  ], preview: 'retro' },
  { id: 'b6', title: 'Customer journeys', edited: '5d ago', activity: 10, collaborators: [
    { name: 'Dan', color: 'var(--user-amber)' },
  ], preview: 'journeys' },
  { id: 'b7', title: 'Architecture sketches', edited: '1w ago', activity: 8, collaborators: [
    { name: 'Sam', color: 'var(--user-sky)' },
    { name: 'Ira', color: 'var(--user-mint)' },
  ], preview: 'arch' },
  { id: 'b8', title: 'Weekly standup notes', edited: '2w ago', activity: 4, collaborators: [
    { name: 'Nina', color: 'var(--user-coral)' },
  ], preview: 'notes' },
];

// Tiny thumbnail illustrations (SVG) — suggestive, not literal
const Thumb = ({ kind }) => {
  const common = { width: '100%', height: '100%', viewBox: '0 0 320 180', preserveAspectRatio: 'xMidYMid slice' };
  if (kind === 'planning') return (
    <svg {...common}>
      <rect width="320" height="180" fill="#FDFBF4"/>
      <g opacity="0.6">
        {Array.from({length: 12}).map((_,i) => <line key={i} x1={0} y1={i*16} x2={320} y2={i*16} stroke="#EFE9DB" strokeWidth="0.5"/>)}
      </g>
      <rect x="28" y="28" width="88" height="48" rx="3" fill="#FFE3DE" stroke="#FF6B5B" strokeWidth="1.2"/>
      <rect x="128" y="28" width="72" height="48" rx="3" fill="#E7F7EE" stroke="#4FD1A5" strokeWidth="1.2"/>
      <rect x="212" y="28" width="80" height="48" rx="3" fill="#FEF2DA" stroke="#F5B455" strokeWidth="1.2"/>
      <line x1="72" y1="76" x2="72" y2="110" stroke="#44443F" strokeWidth="1"/>
      <line x1="72" y1="110" x2="164" y2="110" stroke="#44443F" strokeWidth="1"/>
      <line x1="164" y1="110" x2="252" y2="110" stroke="#44443F" strokeWidth="1"/>
      <line x1="164" y1="110" x2="164" y2="76" stroke="#44443F" strokeWidth="1"/>
      <line x1="252" y1="110" x2="252" y2="76" stroke="#44443F" strokeWidth="1"/>
      <rect x="52" y="120" width="40" height="32" rx="3" fill="#E9E6FF" stroke="#9B7BFF" strokeWidth="1.2"/>
      <rect x="108" y="120" width="56" height="32" rx="3" fill="#FFE3DE" stroke="#FF6B5B" strokeWidth="1.2"/>
      <rect x="180" y="120" width="40" height="32" rx="3" fill="#E7F7EE" stroke="#4FD1A5" strokeWidth="1.2"/>
      <rect x="236" y="120" width="48" height="32" rx="3" fill="#FEF2DA" stroke="#F5B455" strokeWidth="1.2"/>
      <line x1="20" y1="14" x2="44" y2="14" stroke="#FF6B5B" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
  if (kind === 'flow') return (
    <svg {...common}>
      <rect width="320" height="180" fill="#FDFBF4"/>
      <g fill="none" stroke="#0A0A0A" strokeWidth="1.3">
        <rect x="20" y="70" width="56" height="40" rx="4" fill="#fff"/>
        <rect x="96" y="70" width="56" height="40" rx="4" fill="#fff"/>
        <rect x="172" y="70" width="56" height="40" rx="4" fill="#fff"/>
        <rect x="248" y="50" width="56" height="30" rx="4" fill="#FFE3DE" stroke="#FF6B5B"/>
        <rect x="248" y="98" width="56" height="30" rx="4" fill="#E7F7EE" stroke="#4FD1A5"/>
        <path d="M76 90 L96 90 M152 90 L172 90 M228 90 L248 65 M228 90 L248 113" strokeWidth="1.3"/>
        <polygon points="246,63 252,65 246,67" fill="#0A0A0A"/>
        <polygon points="246,111 252,113 246,115" fill="#0A0A0A"/>
        <polygon points="94,88 100,90 94,92" fill="#0A0A0A"/>
        <polygon points="170,88 176,90 170,92" fill="#0A0A0A"/>
      </g>
      <circle cx="48" cy="90" r="4" fill="#FF6B5B"/>
      <circle cx="124" cy="90" r="4" fill="#5BA3FF"/>
      <circle cx="200" cy="90" r="4" fill="#9B7BFF"/>
    </svg>
  );
  if (kind === 'brainstorm') return (
    <svg {...common}>
      <rect width="320" height="180" fill="#FDFBF4"/>
      {[
        [28,22,'#FFE8B8',-4], [108,30,'#FFD3CC',2], [192,20,'#D5F0E2',-2], [254,38,'#E9E6FF',6],
        [40,92,'#D8E8FF',3], [120,94,'#FFE8B8',-5], [200,100,'#FFD3CC',1], [260,108,'#D5F0E2',4],
        [64,146,'#E9E6FF',-3], [160,148,'#D8E8FF',2],
      ].map(([x,y,c,r],i) => (
        <g key={i} transform={`translate(${x},${y}) rotate(${r})`}>
          <rect width="54" height="42" fill={c} stroke="rgba(0,0,0,0.08)" strokeWidth="0.5"/>
          <line x1="8" y1="14" x2="42" y2="14" stroke="#44443F" strokeWidth="0.8" opacity="0.4"/>
          <line x1="8" y1="22" x2="38" y2="22" stroke="#44443F" strokeWidth="0.8" opacity="0.4"/>
          <line x1="8" y1="30" x2="30" y2="30" stroke="#44443F" strokeWidth="0.8" opacity="0.4"/>
        </g>
      ))}
    </svg>
  );
  if (kind === 'review') return (
    <svg {...common}>
      <rect width="320" height="180" fill="#FDFBF4"/>
      <rect x="60" y="26" width="80" height="130" rx="8" fill="#fff" stroke="#D7D6CC" strokeWidth="1"/>
      <rect x="160" y="26" width="100" height="130" rx="8" fill="#fff" stroke="#D7D6CC" strokeWidth="1"/>
      <rect x="68" y="34" width="64" height="90" rx="4" fill="#F4F3ED"/>
      <circle cx="100" cy="70" r="10" fill="#D7D6CC"/>
      <path d="M80 100 L92 86 L110 104 L122 94 L130 104 L130 118 L80 118 Z" fill="#D7D6CC"/>
      <rect x="168" y="34" width="84" height="10" rx="2" fill="#0A0A0A"/>
      <rect x="168" y="52" width="60" height="4" rx="1" fill="#BDBDB4"/>
      <rect x="168" y="62" width="76" height="4" rx="1" fill="#BDBDB4"/>
      <rect x="168" y="72" width="52" height="4" rx="1" fill="#BDBDB4"/>
      <circle cx="252" cy="48" r="14" fill="#FFE3DE" stroke="#FF6B5B"/>
      <text x="252" y="52" textAnchor="middle" fontSize="10" fill="#FF6B5B" fontWeight="600">3</text>
    </svg>
  );
  if (kind === 'retro') return (
    <svg {...common}>
      <rect width="320" height="180" fill="#FDFBF4"/>
      <line x1="110" y1="20" x2="110" y2="160" stroke="#D7D6CC" strokeWidth="1"/>
      <line x1="220" y1="20" x2="220" y2="160" stroke="#D7D6CC" strokeWidth="1"/>
      <rect x="20" y="30" width="16" height="4" fill="#4FD1A5"/>
      <rect x="130" y="30" width="16" height="4" fill="#F5B455"/>
      <rect x="240" y="30" width="16" height="4" fill="#FF6B5B"/>
      {[[30,46,'#D5F0E2'],[30,80,'#D5F0E2'],[30,114,'#D5F0E2'],
        [140,46,'#FEF2DA'],[140,80,'#FEF2DA'],
        [250,46,'#FFD3CC'],[250,88,'#FFD3CC'],[250,126,'#FFD3CC']].map(([x,y,c],i) => (
          <rect key={i} x={x} y={y} width="60" height="26" rx="2" fill={c}/>
        ))}
    </svg>
  );
  if (kind === 'journeys') return (
    <svg {...common}>
      <rect width="320" height="180" fill="#FDFBF4"/>
      <path d="M 30 130 Q 90 40, 160 90 T 290 60" fill="none" stroke="#FF6B5B" strokeWidth="2" strokeLinecap="round"/>
      {[[30,130],[90,80],[160,90],[220,72],[290,60]].map(([x,y],i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="6" fill="#fff" stroke="#0A0A0A" strokeWidth="1.2"/>
          <rect x={x-22} y={y+12} width="44" height="14" rx="2" fill="#fff" stroke="#D7D6CC" strokeWidth="0.8"/>
        </g>
      ))}
    </svg>
  );
  if (kind === 'arch') return (
    <svg {...common}>
      <rect width="320" height="180" fill="#FDFBF4"/>
      <g fill="none" stroke="#0A0A0A" strokeWidth="1.2">
        <rect x="130" y="20" width="60" height="28" rx="3"/>
        <rect x="40" y="72" width="60" height="28" rx="3"/>
        <rect x="130" y="72" width="60" height="28" rx="3"/>
        <rect x="220" y="72" width="60" height="28" rx="3"/>
        <rect x="85" y="128" width="60" height="28" rx="3"/>
        <rect x="175" y="128" width="60" height="28" rx="3"/>
        <path d="M160 48 L70 72 M160 48 L160 72 M160 48 L250 72 M70 100 L115 128 M160 100 L115 128 M160 100 L205 128 M250 100 L205 128"/>
      </g>
      <circle cx="160" cy="34" r="3" fill="#FF6B5B"/>
    </svg>
  );
  if (kind === 'notes') return (
    <svg {...common}>
      <rect width="320" height="180" fill="#FDFBF4"/>
      {[20,40,60,80,100,120,140].map(y => <line key={y} x1="30" y1={y} x2="290" y2={y} stroke="#EFE9DB" strokeWidth="0.8"/>)}
      <rect x="30" y="24" width="140" height="3" fill="#0A0A0A"/>
      <rect x="30" y="44" width="180" height="2" fill="#BDBDB4"/>
      <rect x="30" y="64" width="160" height="2" fill="#BDBDB4"/>
      <rect x="30" y="84" width="200" height="2" fill="#BDBDB4"/>
      <rect x="30" y="104" width="120" height="2" fill="#BDBDB4"/>
    </svg>
  );
  return <rect width="320" height="180" fill="#FDFBF4"/>;
};

const BoardCard = ({ board, onOpen }) => {
  return (
    <div
      className="board-card"
      onClick={onOpen}
      style={{
        background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 12,
        overflow: 'hidden', cursor: 'pointer', transition: 'all 180ms var(--ease-out)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ aspectRatio: '16 / 9', background: '#FDFBF4', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <Thumb kind={board.preview} />
        {board.pinned && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 500, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="9" height="9" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0 L7.5 4.5 L12 5 L8.5 8 L9.5 12 L6 10 L2.5 12 L3.5 8 L0 5 L4.5 4.5 Z"/></svg>
            Pinned
          </div>
        )}
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--ink-0)', letterSpacing: '-0.005em', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{board.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AvatarStack users={board.collaborators} max={3} size={22} />
            <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>
              {board.collaborators.length} {board.collaborators.length === 1 ? 'collaborator' : 'collaborators'}
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="clock" size={12} />
            {board.edited}
          </span>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ userName = 'Nina Petrov' }) => {
  const [query, setQuery] = React.useState('');
  const [sort, setSort] = React.useState('recent');
  const [scope, setScope] = React.useState('mine');

  const filtered = MOCK_BOARDS
    .filter(b => b.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'alpha') return a.title.localeCompare(b.title);
      if (sort === 'active') return b.activity - a.activity;
      return 0;
    });

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--canvas)', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ height: 56, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, background: 'var(--paper)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PlotLogo size={24} />
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.015em' }}>Plot</span>
        </div>
        <div style={{ width: 1, height: 20, background: 'var(--border)' }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--ink-3)' }}>
          <span>Workspace</span>
          <Icon name="chevron_down" size={14} />
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 400, maxWidth: '100%' }}>
            <Icon name="search" size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search boards…" className="input" style={{ paddingLeft: 36, background: 'var(--ink-9)', border: '1px solid transparent', fontSize: 13.5 }}/>
            <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-5)', background: 'var(--paper)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>⌘K</span>
          </div>
        </div>

        <button onClick={() => window.__plotNav && window.__plotNav('workspace')} className="btn btn-accent">
          <Icon name="plus" size={15} />New board
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 4px', borderRadius: 999, border: '1px solid var(--border)', cursor: 'pointer' }}>
          <Avatar name={userName} color="var(--user-coral)" size={24} ring={false} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-1)' }}>{userName.split(' ')[0]}</span>
          <Icon name="chevron_down" size={12} style={{ color: 'var(--ink-4)' }} />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Sidebar */}
        <aside style={{ width: 220, borderRight: '1px solid var(--border)', padding: '20px 12px', flexShrink: 0, background: 'var(--canvas)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0 10px 10px' }}>Library</div>
          {[
            { id: 'mine', label: 'My boards', icon: 'layers', count: 8 },
            { id: 'shared', label: 'Shared with me', icon: 'users', count: 12 },
            { id: 'recent', label: 'Recent', icon: 'clock', count: 5 },
          ].map(item => (
            <div key={item.id} onClick={() => setScope(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, fontSize: 13.5,
              cursor: 'pointer', color: scope === item.id ? 'var(--ink-0)' : 'var(--ink-3)',
              background: scope === item.id ? 'var(--ink-8)' : 'transparent', fontWeight: scope === item.id ? 500 : 400,
              transition: 'all 120ms var(--ease-out)', marginBottom: 2,
            }}>
              <Icon name={item.icon} size={15} />
              <span style={{ flex: 1 }}>{item.label}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-5)', fontVariantNumeric: 'tabular-nums' }}>{item.count}</span>
            </div>
          ))}

          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '24px 10px 10px' }}>Tags</div>
          {[
            { label: 'Planning', color: 'var(--user-coral)' },
            { label: 'Design', color: 'var(--user-lilac)' },
            { label: 'Retros', color: 'var(--user-mint)' },
            { label: 'Research', color: 'var(--user-amber)' },
          ].map(t => (
            <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 6, fontSize: 13, color: 'var(--ink-3)', cursor: 'pointer' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color }}/>
              {t.label}
            </div>
          ))}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflow: 'auto', padding: '32px 40px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0, letterSpacing: '-0.02em', color: 'var(--ink-0)' }}>
                {scope === 'mine' ? 'My boards' : scope === 'shared' ? 'Shared with me' : 'Recent'}
              </h1>
              <div style={{ fontSize: 14, color: 'var(--ink-4)', marginTop: 4 }}>
                {filtered.length} boards · Last edit 5m ago
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 22, marginBottom: 24, alignItems: 'center' }}>
            {[
              { id: 'recent', label: 'Recent' },
              { id: 'active', label: 'Most active' },
              { id: 'alpha', label: 'Alphabetical' },
            ].map(s => (
              <button key={s.id} onClick={() => setSort(s.id)} className={`chip ${sort === s.id ? 'is-active' : ''}`}>{s.label}</button>
            ))}
            <div style={{ flex: 1 }}/>
            <button className="chip" style={{ background: 'transparent', border: '1px solid var(--border)' }}>
              <Icon name="grid" size={12} />
              Grid
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
            {/* Create new card */}
            <div
              onClick={() => window.__plotNav && window.__plotNav('workspace')}
              className="board-card-new"
              style={{
                aspectRatio: 'auto', minHeight: 256, borderRadius: 12, border: '1.5px dashed var(--border-strong)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', cursor: 'pointer', transition: 'all 200ms var(--ease-out)', color: 'var(--ink-3)'
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--ink-9)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon name="plus" size={20} color="var(--ink-2)" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-1)' }}>New board</div>
              <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>Blank canvas</div>
            </div>
            {filtered.map(b => <BoardCard key={b.id} board={b} onOpen={() => window.__plotNav && window.__plotNav('workspace', { boardId: b.id, title: b.title })}/>)}
          </div>
        </main>
      </div>

      <style>{`
        .board-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-3); border-color: var(--border-strong); }
        .board-card-new:hover { background: var(--ink-9); border-color: var(--ink-5); }
      `}</style>
    </div>
  );
};

Object.assign(window, { Dashboard });

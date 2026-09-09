/** Concept diagrams only: these paths are not experimental measurements. */
export function ProjectVisual({ kind }: { kind: 'voice' | 'retrieval' | 'classification' }) {
  return <div className={`project-visual visual-${kind}`}>
    <span className="visual-label">{kind === 'voice' ? '01 / VOICE' : kind === 'retrieval' ? '02 / CONTEXT' : '03 / PATTERNS'}</span>
    <svg viewBox="0 0 240 130" aria-hidden="true">
      {kind === 'voice' ? <g className="voice-bars">{Array.from({ length: 27 }, (_, i) => {
        const h = 8 + 65 * Math.abs(Math.sin(i * .71)) * Math.sin((i + 1) / 29 * Math.PI);
        return <line key={i} x1={16 + i * 8} x2={16 + i * 8} y1={65 - h / 2} y2={65 + h / 2} style={{ animationDelay: `${i * 35}ms` }} />;
      })}</g> : kind === 'retrieval' ? <g fill="none" strokeWidth="3" strokeLinecap="round">
        <path className="reference-curve" d="M15 82 L37 76 L57 86 L79 46 L99 58 L119 40 L139 48 L159 23 L181 35 L204 18 L225 26" />
        <path className="query-curve" d="M15 98 L37 92 L57 102 L79 62 L99 74 L119 56 L139 64 L159 39 L181 51 L204 34 L225 42" />
      </g> : <g fill="none" strokeWidth="3" strokeLinecap="round">
        {[0, 1, 2].map(i => <g key={i} transform={`translate(0 ${i * 36})`}><path d={i === 1 ? 'M18 27 L37 13 L56 27 L75 13 L94 27 L113 13' : 'M18 27 L37 24 L56 28 L75 14 L94 18 L113 8'} /><path className="class-link" d="M130 20 H170" strokeDasharray="3 5" /><circle cx="195" cy="20" r="9" className={i === 1 ? 'class-b' : 'class-a'} /></g>)}
      </g>}
    </svg>
    <span className="visual-caption">{kind === 'voice' ? 'A voice, made personal.' : kind === 'retrieval' ? 'Similar shapes. Richer context.' : 'From patterns to decisions.'}</span>
    <span className="diagram-note">Concept illustration</span>
  </div>;
}

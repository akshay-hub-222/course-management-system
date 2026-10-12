/** Tiny dependency-free SVG/CSS charts. All of them render real data passed in by the caller. */

export function HBars({ rows, unit = '' }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="hbars">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="hbars-head">
            <span className="hbars-label" title={r.label}>{r.label}</span>
            <span className="hbars-val">{r.value}{r.total != null ? ` / ${r.total}` : ''}{unit}</span>
          </div>
          <div className="hbars-track">
            <div className="hbars-fill" style={{ width: r.total != null ? `${(r.value / (r.total || 1)) * 100}%` : `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Columns({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const H = 150;
  const step = 100 / data.length;
  return (
    <svg className="columns" viewBox={`0 0 100 ${H + 22}`} preserveAspectRatio="none" role="img" aria-label="Enrollments per day">
      {[0, 0.5, 1].map((g) => (
        <line key={g} x1="0" x2="100" y1={H - g * (H - 8)} y2={H - g * (H - 8)} className="columns-grid" vectorEffect="non-scaling-stroke" />
      ))}
      {data.map((d, i) => {
        const h = d.value ? Math.max(4, (d.value / max) * (H - 14)) : 0;
        return (
          <g key={d.label}>
            <rect x={i * step + step * 0.2} y={H - h} width={step * 0.6} height={h} rx="1" className="columns-bar">
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({ slices, centerLabel }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const R = 52;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 140 140" width="150" height="150" role="img" aria-label="Courses by category">
        <circle cx="70" cy="70" r={R} fill="none" className="donut-bg" strokeWidth="16" />
        {slices.map((s, i) => {
          const len = (s.value / total) * C;
          const el = (
            <circle
              key={s.label}
              cx="70" cy="70" r={R} fill="none" strokeWidth="16"
              stroke={`var(--shade-${Math.min(i, 5)})`}
              strokeDasharray={`${Math.max(0, len - 2)} ${C}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
            />
          );
          offset += len;
          return el;
        })}
        <text x="70" y="68" textAnchor="middle" className="donut-num">{total}</text>
        <text x="70" y="85" textAnchor="middle" className="donut-cap">{centerLabel}</text>
      </svg>
      <ul className="legend">
        {slices.map((s, i) => (
          <li key={s.label}><i style={{ background: `var(--shade-${Math.min(i, 5)})` }} />{s.label}<b>{s.value}</b></li>
        ))}
      </ul>
    </div>
  );
}

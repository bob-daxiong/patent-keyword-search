export function SkeletonCard() {
  return (
    <div
      role="status"
      aria-label="加载中"
      style={{
        background: 'var(--bg-card)',
        borderRadius: 12,
        border: '1px solid var(--border-default)',
        padding: 24,
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
      }}
    >
      <div style={{
        height: 20,
        width: '40%',
        background: 'var(--bg-hover)',
        borderRadius: 6,
        marginBottom: 16,
      }} />
      <div style={{
        height: 14,
        width: '100%',
        background: 'var(--bg-hover)',
        borderRadius: 4,
        marginBottom: 10,
      }} />
      <div style={{
        height: 14,
        width: '85%',
        background: 'var(--bg-hover)',
        borderRadius: 4,
        marginBottom: 10,
      }} />
      <div style={{
        height: 14,
        width: '60%',
        background: 'var(--bg-hover)',
        borderRadius: 4,
      }} />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-label="加载中" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} index={i} />
      ))}
    </div>
  )
}

function SkeletonRow({ index }: { index: number }) {
  const widths = [65, 45, 55, 38, 70, 50, 42, 58]
  const w = widths[index % widths.length]
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: '12px 16px',
        background: 'var(--bg-card)',
        borderRadius: 8,
        border: '1px solid var(--border-default)',
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <div style={{ width: 16, height: 16, borderRadius: 3, background: 'var(--bg-hover)', flexShrink: 0 }} />
      <div style={{ height: 14, width: `${w}%`, background: 'var(--bg-hover)', borderRadius: 4 }} />
      <div style={{ height: 14, width: 60, background: 'var(--bg-hover)', borderRadius: 4, marginLeft: 'auto' }} />
      <div style={{ height: 14, width: 120, background: 'var(--bg-hover)', borderRadius: 4 }} />
    </div>
  )
}

import Link from 'next/link'

export default function EventsFeature() {
  return (
    <section className="home-menu">
      <h2 className="home-menu-title">企画を探す</h2>
      <p style={{ padding: '0 0 1rem', color: '#555' }}>
        準備中です。公開までしばらくお待ちください。
      </p>
      <Link href="/timetable" className="home-menu-item" style={{ display: 'inline-flex', maxWidth: '100%' }}>
        <span className="home-menu-label">タイムテーブルへ</span>
      </Link>
    </section>
  )
}

import Link from 'next/link'

export default function HomeFeature() {
  return (
    <section className="home-menu">
      <h2 className="home-menu-title">メニュー</h2>
      <div className="home-menu-grid">
        <Link href="/map" className="home-menu-item">
          <span className="home-menu-label">マップ</span>
        </Link>
        <Link href="/timetable" className="home-menu-item">
          <span className="home-menu-label">タイムテーブル</span>
        </Link>
        <Link href="/events" className="home-menu-item">
          <span className="home-menu-label">企画を探す</span>
        </Link>
        <Link href="/about" className="home-menu-item">
          <span className="home-menu-label">お知らせ</span>
        </Link>
      </div>
    </section>
  )
}

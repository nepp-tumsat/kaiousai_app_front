import Link from 'next/link'

export default function AboutFeature() {
  return (
    <section className="home-menu">
      <h2 className="home-menu-title">お知らせ</h2>
      <p style={{ padding: '0 0 1rem', color: '#555' }}>
        現在、お知らせはありません。最新情報はこのページで案内します。
      </p>
      <Link href="/" className="home-menu-item" style={{ display: 'inline-flex', maxWidth: '100%' }}>
        <span className="home-menu-label">トップへ</span>
      </Link>
    </section>
  )
}

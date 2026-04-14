/**
 * GitHub Pages のサブパス配信時も public アセットを正しく参照する。
 * ローカルでは NEXT_PUBLIC_BASE_PATH 未設定のため先頭スラッシュのみ。
 */
export function assetUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

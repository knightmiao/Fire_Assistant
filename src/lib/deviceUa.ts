/**
 * 根据 User-Agent 粗判是否为手机/平板环境，用于侧栏「全宽展开 vs 图标窄轨」。
 * 不替代触控/视口检测；桌面 UA 在窄屏下仍走原有抽屉逻辑。
 */
export function isMobileUserAgent(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return true;
  if (/\biPad\b/i.test(ua)) return true;
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
  return false;
}

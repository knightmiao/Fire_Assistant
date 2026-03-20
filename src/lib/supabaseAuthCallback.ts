import { supabase } from './supabaseClient';

/**
 * 魔术链接 / PKCE 回跳时 URL 常带 ?code=…，需在首屏用 code 换 session 并清理地址栏。
 */
export async function consumeSupabaseAuthCallback(): Promise<void> {
  if (!supabase) return;

  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  if (!code) return;

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.warn('Supabase 登录回调失败:', error.message);
    return;
  }

  url.searchParams.delete('code');
  const rest = url.searchParams.toString();
  const cleanPath = url.pathname + (rest ? `?${rest}` : '') + url.hash;
  window.history.replaceState({}, document.title, cleanPath || url.pathname);
}

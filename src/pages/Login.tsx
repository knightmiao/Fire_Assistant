import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useToast } from '../components/ToastProvider';

const RESEND_COOLDOWN_SEC = 60;

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function sanitizeOtp(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 8);
}

export function Login() {
  const showToast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get('next')?.trim() || '/dashboard';
  const safeNext = nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/dashboard';

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [phase, setPhase] = useState<'email' | 'code'>('email');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const sendCode = useCallback(async () => {
    if (!supabase) {
      showToast('未配置 Supabase（检查 .env.local）', 'error');
      return;
    }
    const trimmed = normalizeEmail(email);
    if (!trimmed) {
      showToast('请输入邮箱', 'error');
      return;
    }
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}${safeNext}`,
      },
    });
    setSending(false);
    if (error) {
      showToast(`发送失败：${error.message}`, 'error');
      return;
    }
    setEmail(trimmed);
    setPhase('code');
    setOtp('');
    setCooldown(RESEND_COOLDOWN_SEC);
    showToast('验证码已发送，请查收邮件');
  }, [email, safeNext, showToast]);

  const verify = useCallback(async () => {
    if (!supabase) return;
    const trimmedEmail = normalizeEmail(email);
    const token = sanitizeOtp(otp);
    if (!trimmedEmail) {
      showToast('请先填写邮箱并发送验证码', 'error');
      return;
    }
    if (token.length < 6) {
      showToast('请输入邮件中的验证码（至少 6 位）', 'error');
      return;
    }
    setVerifying(true);
    const { error } = await supabase.auth.verifyOtp({
      email: trimmedEmail,
      token,
      type: 'email',
    });
    setVerifying(false);
    if (error) {
      showToast(`验证失败：${error.message}`, 'error');
      return;
    }
    showToast('登录成功');
    navigate(safeNext, { replace: true });
  }, [email, navigate, otp, safeNext, showToast]);

  if (!isSupabaseConfigured()) {
    return (
      <div className="login-page">
        <div className="login-card card">
          <h2 className="login-title">登录</h2>
          <p className="hint">
            请在 <code>.env.local</code> 中配置 <code>VITE_SUPABASE_URL</code> 与{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> 后重启开发服务。
          </p>
          <Link to="/dashboard" className="btn">
            返回看板
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card card">
        <h2 className="login-title">邮箱验证码登录</h2>
        <p className="hint login-lead">新用户将自动注册；验证码会发到您的邮箱，请注意查收。</p>

        {phase === 'email' ? (
          <div className="login-fields">
            <label className="login-label">
              邮箱
              <input
                type="email"
                className="login-input"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <button type="button" className="btn primary login-submit" onClick={sendCode} disabled={sending}>
              {sending ? '发送中…' : '发送验证码'}
            </button>
          </div>
        ) : (
          <div className="login-fields">
            <p className="hint login-sent">
              验证码已发送至 <strong>{email}</strong>
            </p>
            <label className="login-label">
              验证码
              <input
                type="text"
                className="login-input login-input-otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6–8 位数字"
                value={otp}
                onChange={(e) => setOtp(sanitizeOtp(e.target.value))}
                maxLength={8}
              />
            </label>
            <button type="button" className="btn primary login-submit" onClick={verify} disabled={verifying}>
              {verifying ? '验证中…' : '登录'}
            </button>
            <div className="login-row">
              <button
                type="button"
                className="btn btn-text"
                onClick={() => {
                  setPhase('email');
                  setOtp('');
                }}
              >
                更换邮箱
              </button>
              <button
                type="button"
                className="btn btn-text"
                onClick={sendCode}
                disabled={sending || cooldown > 0}
              >
                {cooldown > 0 ? `${cooldown}s 后可重发` : sending ? '发送中…' : '重新发送'}
              </button>
            </div>
          </div>
        )}
        <div className="login-footer-links">
          <Link to="/dashboard">返回应用</Link>
        </div>
      </div>
    </div>
  );
}

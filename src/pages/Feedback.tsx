import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useToast } from '../components/ToastProvider';

const FEEDBACK_TYPES = [
  { value: 'issue', label: '问题 / Bug' },
  { value: 'suggestion', label: '功能建议' },
  { value: 'other', label: '其它' },
] as const;

type FeedbackType = (typeof FEEDBACK_TYPES)[number]['value'];

export function Feedback() {
  const showToast = useToast();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion');
  const [body, setBody] = useState('');
  const [contact, setContact] = useState('');

  const fromState = (location.state as { from?: string } | null)?.from;
  const pagePathHidden =
    typeof fromState === 'string' && fromState.length > 0
      ? fromState
      : `${location.pathname}${location.search}`;
  useEffect(() => {
    if (!supabase) {
      setLoadingUser(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingUser(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = body.trim();
      if (!trimmed) {
        showToast('请填写反馈内容', 'error');
        return;
      }
      if (!isSupabaseConfigured() || !supabase) {
        showToast('未配置 Supabase（检查 .env.local）', 'error');
        return;
      }
      const { data: u, error: userErr } = await supabase.auth.getUser();
      if (userErr || !u.user) {
        showToast('请先登录后再提交反馈', 'error');
        return;
      }
      setSubmitting(true);
      const contactTrimmed = contact.trim() || null;
      const { error } = await supabase.from('feedback').insert({
        user_id: u.user.id,
        feedback_type: feedbackType,
        body: trimmed,
        contact: contactTrimmed,
        page_path: pagePathHidden,
      });
      setSubmitting(false);
      if (error) {
        showToast(`提交失败：${error.message}`, 'error');
        return;
      }
      showToast('已收到，感谢你的反馈！');
      setBody('');
      setContact('');
    },
    [body, contact, feedbackType, pagePathHidden, showToast]
  );

  if (!isSupabaseConfigured()) {
    return (
      <div className="page">
        <h2>反馈与建议</h2>
        <section className="card">
          <p className="hint">请在 <code>.env.local</code> 中配置 Supabase 后再使用反馈功能。</p>
        </section>
      </div>
    );
  }

  if (loadingUser) {
    return (
      <div className="page">
        <h2>反馈与建议</h2>
        <p className="hint">加载中…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page">
        <h2>反馈与建议</h2>
        <section className="card">
          <p className="hint">提交反馈前请先使用邮箱验证码登录，以便我们必要时联系你。</p>
          <p style={{ marginTop: '0.75rem' }}>
            <Link to="/login?next=/feedback" className="btn primary">
              前往登录
            </Link>
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>反馈与建议</h2>
      <p className="hint page-lead">
        描述越具体越好（例如：在哪个页面、期望怎样）。
      </p>

      <section className="card">
        <form onSubmit={handleSubmit} className="feedback-form">
          <label>
            类型
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
            >
              {FEEDBACK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            反馈内容
            <textarea
              required
              rows={6}
              placeholder="请描述你遇到的问题或建议…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <label>
            联系方式（选填）
            <input
              type="text"
              placeholder="邮箱或微信号，便于回访"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              autoComplete="email"
            />
          </label>
          <div className="feedback-form-actions">
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? '提交中…' : '提交反馈'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

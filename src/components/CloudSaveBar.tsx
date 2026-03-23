import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { parseFireStatePayload } from '../lib/parseFireStatePayload';
import { useFireStore } from '../store/fireStore';
import { useToast } from './ToastProvider';

export function CloudSaveBar() {
  const showToast = useToast();
  const getStateForExport = useFireStore((s) => s.getStateForExport);
  const loadFullState = useFireStore((s) => s.loadFullState);
  const [user, setUser] = useState<User | null>(null);
  const [uploading, setUploading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    showToast('已退出登录');
  }, [showToast]);

  const handleUpload = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      showToast('未配置 Supabase（检查 .env.local）', 'error');
      return;
    }
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) {
      showToast('请先登录后再保存到云端', 'error');
      return;
    }
    const state = getStateForExport();
    setUploading(true);
    const { error } = await supabase.from('fire_app_snapshot').upsert(
      {
        user_id: u.id,
        payload: state,
        schema_version: 1,
      },
      { onConflict: 'user_id' }
    );
    setUploading(false);
    if (error) {
      showToast(`保存失败：${error.message}`, 'error');
      return;
    }
    showToast('已保存到 Supabase');
  }, [getStateForExport, showToast]);

  const handleRestore = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      showToast('未配置 Supabase（检查 .env.local）', 'error');
      return;
    }
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) {
      showToast('请先登录后再从云端恢复', 'error');
      return;
    }
    setRestoring(true);
    const { data: row, error } = await supabase
      .from('fire_app_snapshot')
      .select('payload, updated_at')
      .eq('user_id', u.id)
      .maybeSingle();
    setRestoring(false);
    if (error) {
      showToast(`读取失败：${error.message}`, 'error');
      return;
    }
    if (!row?.payload) {
      showToast('云端暂无备份，请先上传保存一次', 'error');
      return;
    }
    const state = parseFireStatePayload(row.payload);
    if (!state) {
      showToast('云端数据格式异常，无法恢复', 'error');
      return;
    }
    loadFullState(state);
    const t =
      row.updated_at && typeof row.updated_at === 'string'
        ? new Date(row.updated_at).toLocaleString()
        : '';
    showToast(t ? `已从云端恢复（备份时间 ${t}）` : '已从云端恢复');
  }, [loadFullState, showToast]);

  if (!isSupabaseConfigured()) {
    return (
      <div className="cloud-save-bar">
        <p className="cloud-save-hint">
          请在 <code>.env.local</code> 中配置 <code>VITE_SUPABASE_URL</code> 与{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> 后重启开发服务，即可使用云端保存。
        </p>
      </div>
    );
  }

  return (
    <div className="cloud-save-bar">
      <div className="cloud-save-row">
        {user ? (
          <>
            <span className="cloud-save-user" title={user.email ?? undefined}>
              已登录 {user.email ?? user.id.slice(0, 8)}…
            </span>
            <button type="button" className="btn" onClick={handleSignOut}>
              退出
            </button>
            <button
              type="button"
              className="btn"
              onClick={handleRestore}
              disabled={restoring}
            >
              {restoring ? '恢复中…' : '从云端恢复'}
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? '上传中…' : '上传保存'}
            </button>
          </>
        ) : (
          <>
            <span className="cloud-save-user">未登录，无法读写云端备份</span>
            <Link to="/login?next=/dashboard" className="btn primary">
              前往登录（邮箱验证码）
            </Link>
          </>
        )}
      </div>
      <p className="cloud-save-hint">
        在 <Link to="/login">登录页</Link> 使用邮箱验证码登录。登录状态保存在本机浏览器；已登录时可「从云端恢复」（会覆盖本地数据）。
      </p>
    </div>
  );
}

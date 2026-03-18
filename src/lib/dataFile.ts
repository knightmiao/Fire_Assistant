import type { FireState } from '../types';

const DATA_FILE_NAME = 'fire-assistant-data.json';

/** 导出当前状态为 JSON 并触发浏览器下载，建议保存到项目 data/ 或 public/ 目录 */
export function exportToDataFile(getState: () => FireState): void {
  const state = getState();
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = DATA_FILE_NAME;
  a.click();
  URL.revokeObjectURL(url);
}

/** 校验是否为合法的 FireState 结构（简易） */
function isFireStateLike(obj: unknown): obj is FireState {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.profile === 'object' &&
    typeof o.config === 'object' &&
    Array.isArray(o.assets) &&
    Array.isArray(o.liabilities) &&
    typeof o.expense === 'object'
  );
}

/** 从 JSON 解析并校验，返回 FireState 或 null */
export function parseDataFile(json: string): FireState | null {
  try {
    const obj = JSON.parse(json) as unknown;
    if (!isFireStateLike(obj)) return null;
    return obj as FireState;
  } catch {
    return null;
  }
}

/** 尝试从 public 路径获取本地数据文件（开发时若将导出文件放在 public 下可被检测到） */
export async function fetchLocalDataFile(): Promise<FireState | null> {
  try {
    const res = await fetch(`/${DATA_FILE_NAME}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const text = await res.text();
    return parseDataFile(text);
  } catch {
    return null;
  }
}

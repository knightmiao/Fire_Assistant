import type { FireState } from '../types';

/** 校验 Supabase `payload` 是否大致符合 FireState，避免把脏数据写进 store */
export function parseFireStatePayload(value: unknown): FireState | null {
  if (!value || typeof value !== 'object') return null;
  const o = value as Record<string, unknown>;
  if (
    typeof o.profile !== 'object' ||
    o.profile === null ||
    typeof o.config !== 'object' ||
    o.config === null ||
    typeof o.shenzhenTax !== 'object' ||
    o.shenzhenTax === null ||
    !Array.isArray(o.assets) ||
    !Array.isArray(o.liabilities) ||
    typeof o.salary !== 'object' ||
    o.salary === null ||
    typeof o.bonus !== 'object' ||
    o.bonus === null ||
    !Array.isArray(o.rsuGrants) ||
    typeof o.expense !== 'object' ||
    o.expense === null
  ) {
    return null;
  }
  return value as FireState;
}

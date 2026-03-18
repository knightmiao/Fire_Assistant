import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Profile,
  GlobalConfig,
  ShenzhenTaxConfig,
  AssetItem,
  LiabilityItem,
  SalaryConfig,
  BonusConfig,
  RSUGrant,
  ExpenseConfig,
  FireState,
} from '../types';
import {
  DEFAULT_GLOBAL_CONFIG,
  DEFAULT_SHENZHEN_TAX,
} from '../lib/constants';

const defaultProfile: Profile = {
  currentAge: 30,
  targetRetireAge: 45,
  currency: 'CNY',
};

const defaultSalary: SalaryConfig = {
  monthlyGross: 0,
  isAfterTax: false,
  raiseRatePerYear: 0.05,
  salaryBaseYear: new Date().getFullYear(),
};

const defaultBonus: BonusConfig = {
  amount: 0,
  growsWithSalary: false,
  monthsOfSalary: undefined,
};

const defaultExpense: ExpenseConfig = {
  currentAnnual: 0,
  targetAnnual: 0,
};

type FireStore = FireState & {
  setProfile: (p: Partial<Profile>) => void;
  setConfig: (c: Partial<GlobalConfig>) => void;
  setShenzhenTax: (t: Partial<ShenzhenTaxConfig>) => void;
  setAssets: (a: AssetItem[]) => void;
  addAsset: (a: Omit<AssetItem, 'id'>) => void;
  updateAsset: (id: string, a: Partial<AssetItem>) => void;
  removeAsset: (id: string) => void;
  setLiabilities: (l: LiabilityItem[]) => void;
  addLiability: (l: Omit<LiabilityItem, 'id'>) => void;
  updateLiability: (id: string, l: Partial<LiabilityItem>) => void;
  removeLiability: (id: string) => void;
  setSalary: (s: Partial<SalaryConfig>) => void;
  setBonus: (b: Partial<BonusConfig>) => void;
  setRsuGrants: (r: RSUGrant[]) => void;
  addRsuGrant: (r: Omit<RSUGrant, 'id'>) => void;
  updateRsuGrant: (id: string, r: Partial<RSUGrant>) => void;
  removeRsuGrant: (id: string) => void;
  setExpense: (e: Partial<ExpenseConfig>) => void;
  /** 用本地文件或备份的完整数据覆盖当前状态（会同步到 localStorage） */
  loadFullState: (state: FireState) => void;
  /** 获取当前状态用于导出（仅数据字段，不含方法） */
  getStateForExport: () => FireState;
};

function genId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export const useFireStore = create<FireStore>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      config: DEFAULT_GLOBAL_CONFIG,
      shenzhenTax: DEFAULT_SHENZHEN_TAX,
      assets: [],
      liabilities: [],
      salary: defaultSalary,
      bonus: defaultBonus,
      rsuGrants: [],
      expense: defaultExpense,
      lastUpdated: new Date().toISOString(),

      setProfile: (p) =>
        set((s) => ({
          profile: { ...s.profile, ...p },
          lastUpdated: new Date().toISOString(),
        })),

      setConfig: (c) =>
        set((s) => ({
          config: { ...s.config, ...c },
          lastUpdated: new Date().toISOString(),
        })),

      setShenzhenTax: (t) =>
        set((s) => ({
          shenzhenTax: { ...s.shenzhenTax, ...t },
          lastUpdated: new Date().toISOString(),
        })),

      setAssets: (assets) =>
        set({ assets, lastUpdated: new Date().toISOString() }),

      addAsset: (a) =>
        set((s) => ({
          assets: [...s.assets, { ...a, id: genId(), snapshotDate: a.snapshotDate || new Date().toISOString().slice(0, 10) }],
          lastUpdated: new Date().toISOString(),
        })),

      updateAsset: (id, a) =>
        set((s) => ({
          assets: s.assets.map((x) => (x.id === id ? { ...x, ...a } : x)),
          lastUpdated: new Date().toISOString(),
        })),

      removeAsset: (id) =>
        set((s) => ({
          assets: s.assets.filter((x) => x.id !== id),
          lastUpdated: new Date().toISOString(),
        })),

      setLiabilities: (liabilities) =>
        set({ liabilities, lastUpdated: new Date().toISOString() }),

      addLiability: (l) =>
        set((s) => ({
          liabilities: [...s.liabilities, { ...l, id: genId(), snapshotDate: l.snapshotDate || new Date().toISOString().slice(0, 10) }],
          lastUpdated: new Date().toISOString(),
        })),

      updateLiability: (id, l) =>
        set((s) => ({
          liabilities: s.liabilities.map((x) => (x.id === id ? { ...x, ...l } : x)),
          lastUpdated: new Date().toISOString(),
        })),

      removeLiability: (id) =>
        set((s) => ({
          liabilities: s.liabilities.filter((x) => x.id !== id),
          lastUpdated: new Date().toISOString(),
        })),

      setSalary: (s) =>
        set((state) => ({
          salary: { ...state.salary, ...s },
          lastUpdated: new Date().toISOString(),
        })),

      setBonus: (b) =>
        set((s) => ({
          bonus: { ...s.bonus, ...b },
          lastUpdated: new Date().toISOString(),
        })),

      setRsuGrants: (rsuGrants) =>
        set({ rsuGrants, lastUpdated: new Date().toISOString() }),

      addRsuGrant: (r) =>
        set((s) => ({
          rsuGrants: [...s.rsuGrants, { ...r, id: genId() }],
          lastUpdated: new Date().toISOString(),
        })),

      updateRsuGrant: (id, r) =>
        set((s) => ({
          rsuGrants: s.rsuGrants.map((x) => (x.id === id ? { ...x, ...r } : x)),
          lastUpdated: new Date().toISOString(),
        })),

      removeRsuGrant: (id) =>
        set((s) => ({
          rsuGrants: s.rsuGrants.filter((x) => x.id !== id),
          lastUpdated: new Date().toISOString(),
        })),

      setExpense: (e) =>
        set((s) => ({
          expense: { ...s.expense, ...e },
          lastUpdated: new Date().toISOString(),
        })),

      loadFullState: (state) =>
        set({
          ...state,
          lastUpdated: new Date().toISOString(),
        }),

      getStateForExport: (): FireState => {
        const s = get();
        return {
          profile: s.profile,
          config: s.config,
          shenzhenTax: s.shenzhenTax,
          assets: s.assets,
          liabilities: s.liabilities,
          salary: s.salary,
          bonus: s.bonus,
          rsuGrants: s.rsuGrants,
          expense: s.expense,
          lastUpdated: new Date().toISOString(),
        };
      },
    }),
    { name: 'fire-assistant-state' }
  )
);

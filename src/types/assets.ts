export type AssetType =
  | 'cash'
  | 'housing_fund'
  | 'stock_a'
  | 'stock_hk'
  | 'stock_us'
  | 'fund'
  | 'receivable'
  | 'rsu_vested'
  | 'rsu_unvested'
  | 'bond_etc'
  | 'property';

export interface AssetItem {
  id: string;
  type: AssetType;
  name?: string;
  amountCNY: number;
  snapshotDate: string; // ISO date
  countInFire: boolean;
  amountOriginal?: number;
  currency?: 'CNY' | 'HKD' | 'USD';
  rateToCNY?: number;
}

export interface LiabilityItem {
  id: string;
  name: string;
  amountCNY: number;
  snapshotDate: string;
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  cash: '现金及等价物',
  housing_fund: '公积金',
  stock_a: 'A 股',
  stock_hk: '港股',
  stock_us: '美股',
  fund: '基金',
  receivable: '应收（别人欠我钱）',
  rsu_vested: 'RSU 已归属',
  rsu_unvested: 'RSU 未归属',
  bond_etc: '债券/理财',
  property: '房产',
};

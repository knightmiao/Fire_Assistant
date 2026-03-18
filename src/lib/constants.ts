import type { GlobalConfig, ShenzhenTaxConfig } from '../types';

/** 深圳五险一金默认比例（参考值，以实际工资条为准） */
export const DEFAULT_SHENZHEN_TAX: ShenzhenTaxConfig = {
  pension: 0.08, // 养老个人 8%
  medical: 0.02, // 医疗个人 2%
  unemployment: 0.005, // 失业 0.5%
  housingFund: 0.05, // 公积金 5%，用户可调 5%~12%
  housingFundWithdrawRate: 0.8, // 公积金每月提取比例（如 0.8 = 80% 提取并入现金）
  taxThreshold: 5000, // 个税起征点
};

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  swr: 0.04,
  expectedReturn: 0.06,
  postRetireReturn: 0.06,
  inflationRate: 0.03,
  rateHKDToCNY: 0.92, // 示例，用户可改
  rateUSDToCNY: 7.25,
  manualFireTarget: 0,
};

/** 个税累计预扣税率表（应纳税所得额区间，税率，速算扣除数） */
export const TAX_BRACKETS: [number, number, number][] = [
  [0, 0.03, 0],
  [36000, 0.1, 2520],
  [144000, 0.2, 16920],
  [300000, 0.25, 31920],
  [420000, 0.3, 52920],
  [660000, 0.35, 85920],
  [960000, 0.45, 181920],
];

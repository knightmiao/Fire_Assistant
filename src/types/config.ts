export interface GlobalConfig {
  swr: number; // 安全提取率，如 0.04
  expectedReturn: number; // 积累期预期年化回报
  postRetireReturn: number; // 退休后预期回报
  inflationRate: number;
  rateHKDToCNY: number;
  rateUSDToCNY: number;
  manualFireTarget?: number; // 手动 FIRE 目标（可选，0 表示关闭）
}

export interface ShenzhenTaxConfig {
  pension: number; // 养老 8%
  medical: number; // 医疗 2%
  unemployment: number; // 失业
  housingFund: number; // 公积金个人缴存比例 5%~12%
  /** 单位缴存比例；省略时按与个人相同（提取基数 = 个人+单位按月入账） */
  housingFundEmployer?: number;
  /** 公积金每月提取比例 0~1，提取部分并入现金（如 0.8 = 80%） */
  housingFundWithdrawRate?: number;
  taxThreshold: number; // 起征点 5000
}

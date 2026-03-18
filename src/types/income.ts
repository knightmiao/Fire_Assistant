export interface SalaryConfig {
  monthlyGross: number; // 当前月薪（税前或税后）
  isAfterTax: boolean; // true = 用户填的是税后，不再扣减
  raiseRatePerYear: number; // 年度调薪比例
  salaryBaseYear: number; // 月薪基准年份
}

export interface BonusConfig {
  amount: number;
  growsWithSalary: boolean; // 年终奖是否随调薪增长
  monthsOfSalary?: number; // 若 true，年终奖 = 该年月薪 * monthsOfSalary
}

export interface RSUGrant {
  id: string;
  grantDate: string; // ISO date
  vestYears: number;
  vestSchedule: number[]; // 每年归属比例，如 [0.25,0.25,0.25,0.25]
  unvestedShares: number;
  pricePerShare: number;
  currency: 'HKD' | 'USD';
  rateToCNY: number;
}

export interface ExpenseConfig {
  currentAnnual: number;
  targetAnnual: number; // 退休后期望年支出
}

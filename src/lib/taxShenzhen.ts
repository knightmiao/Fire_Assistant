import type { ShenzhenTaxConfig } from '../types';
import { TAX_BRACKETS } from './constants';

/**
 * 计算月薪扣除五险一金后的应纳税所得额（累计预扣法简化：单月）
 * 应纳税所得额 = 月薪 - 五险一金 - 起征点
 */
function monthlyTaxable(
  monthlyGross: number,
  socialAndFund: number,
  taxThreshold: number
): number {
  return Math.max(0, monthlyGross - socialAndFund - taxThreshold);
}

/**
 * 根据应纳税所得额计算个税（按累计预扣法单月等效）
 * 简化：直接用当月应纳税所得额 × 对应税率 - 速算扣除数
 */
function incomeTax(taxable: number): number {
  if (taxable <= 0) return 0;
  let bracket: [number, number, number] = TAX_BRACKETS[0];
  for (let i = TAX_BRACKETS.length - 1; i >= 0; i--) {
    if (taxable > TAX_BRACKETS[i][0]) {
      bracket = TAX_BRACKETS[i];
      break;
    }
  }
  return taxable * bracket[1] - bracket[2];
}

/**
 * 月薪五险一金扣款（深圳比例）
 */
export function monthlySocialAndFund(
  monthlyGross: number,
  config: ShenzhenTaxConfig
): number {
  const { pension, medical, unemployment, housingFund } = config;
  const base = monthlyGross; // 简化：基数=月薪，实际有上下限
  return base * (pension + medical + unemployment + housingFund);
}

/**
 * 月薪税后（税前 - 五险一金 - 个税）
 */
export function monthlyAfterTax(
  monthlyGross: number,
  config: ShenzhenTaxConfig
): number {
  const social = monthlySocialAndFund(monthlyGross, config);
  const taxable = monthlyTaxable(monthlyGross, social, config.taxThreshold);
  const tax = incomeTax(taxable);
  return monthlyGross - social - tax;
}

/**
 * 年终奖个税（单独计税）：应纳税额 = 年终奖 × 税率 - 速算扣除数
 * 年终奖/12 确定税率档位
 */
export function bonusTaxSeparate(
  bonus: number,
  _config: ShenzhenTaxConfig
): number {
  if (bonus <= 0) return 0;
  const monthly = bonus / 12;
  let rate = 0.03;
  let deduct = 0;
  if (monthly > 960000 / 12) {
    rate = 0.45;
    deduct = 181920;
  } else if (monthly > 660000 / 12) {
    rate = 0.35;
    deduct = 85920;
  } else if (monthly > 420000 / 12) {
    rate = 0.3;
    deduct = 52920;
  } else if (monthly > 300000 / 12) {
    rate = 0.25;
    deduct = 31920;
  } else if (monthly > 144000 / 12) {
    rate = 0.2;
    deduct = 16920;
  } else if (monthly > 36000 / 12) {
    rate = 0.1;
    deduct = 2520;
  }
  return bonus * rate - deduct;
}

/**
 * 年终奖税后
 */
export function bonusAfterTax(
  bonus: number,
  config: ShenzhenTaxConfig
): number {
  return bonus - bonusTaxSeparate(bonus, config);
}

/**
 * 某年月薪税后（考虑调薪）
 */
export function yearlySalaryAfterTax(
  monthlyGrossBase: number,
  raiseRate: number,
  yearOffset: number, // 0 = 当前年
  config: ShenzhenTaxConfig,
  isAfterTax: boolean
): number {
  const monthlyThatYear = monthlyGrossBase * Math.pow(1 + raiseRate, yearOffset);
  if (isAfterTax) return monthlyThatYear * 12;
  const monthlyNet = monthlyAfterTax(monthlyThatYear, config);
  return monthlyNet * 12;
}

/**
 * 某年年终奖税后（可选随调薪增长）；与月薪同口径，若用户填税后则不再扣税
 */
export function yearlyBonusAfterTax(
  bonusBase: number,
  monthlyGrossBase: number,
  raiseRate: number,
  yearOffset: number,
  growsWithSalary: boolean,
  monthsOfSalary: number | undefined,
  config: ShenzhenTaxConfig,
  salaryIsAfterTax: boolean
): number {
  let bonus = bonusBase;
  if (growsWithSalary && monthsOfSalary !== undefined && monthsOfSalary > 0) {
    const monthlyThatYear = monthlyGrossBase * Math.pow(1 + raiseRate, yearOffset);
    bonus = monthlyThatYear * monthsOfSalary;
  }
  if (salaryIsAfterTax) return bonus;
  return bonusAfterTax(bonus, config);
}

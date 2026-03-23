import type { FireState } from '../types';
import {
  yearlySalaryAfterTax,
  yearlyBonusAfterTax,
} from './taxShenzhen';

/**
 * FIRE 目标 = 退休后期望年支出 / 安全提取率（如 25 倍年支出）
 */
export function fireTarget(
  targetAnnualExpense: number,
  swr: number,
  manualFireTarget?: number
): number {
  if ((manualFireTarget ?? 0) > 0) return manualFireTarget ?? 0;
  if (swr <= 0) return 0;
  return targetAnnualExpense / swr;
}

/**
 * 当前可投资净资产 = 计入 FIRE 的资产之和 - 负债之和
 */
export function netWorthCountInFire(
  assets: { amountCNY: number; countInFire: boolean }[],
  liabilities: { amountCNY: number }[]
): number {
  const assetSum = assets
    .filter((a) => a.countInFire)
    .reduce((s, a) => s + a.amountCNY, 0);
  const liabilitySum = liabilities.reduce((s, l) => s + l.amountCNY, 0);
  return assetSum - liabilitySum;
}

/**
 * 某年 RSU 归属收入（CNY）
 * 未归属股数对应「从当前年起」尚未归属的部分；用剩余比例和反推总股数，再算该年归属
 */
export function yearlyRSUVestIncomeSimple(
  rsuGrants: { vestYears: number; vestSchedule: number[]; unvestedShares: number; pricePerShare: number; rateToCNY: number; grantDate: string }[],
  baseYear: number,
  targetYearOffset: number
): number {
  const calendarYear = baseYear + targetYearOffset;
  let total = 0;
  for (const g of rsuGrants) {
    const grantYear = new Date(g.grantDate).getFullYear();
    const yearFromGrant = calendarYear - grantYear;
    if (yearFromGrant < 0 || yearFromGrant >= g.vestSchedule.length) continue;
    const ratio = g.vestSchedule[yearFromGrant] ?? 0;
    const currentYearFromGrant = baseYear - grantYear;
    if (currentYearFromGrant < 0) continue;
    if (currentYearFromGrant >= g.vestSchedule.length) continue; // 已全部归属
    const remainingSchedule = g.vestSchedule.slice(currentYearFromGrant);
    const remainingSum = remainingSchedule.reduce((a, b) => a + b, 0);
    const totalGrantShares = remainingSum > 0 ? g.unvestedShares / remainingSum : 0;
    const vestThisYear = totalGrantShares * ratio;
    total += vestThisYear * g.pricePerShare * g.rateToCNY;
  }
  return total;
}

/** 月支出 = 年支出 / 12（按年通胀后除以 12） */
const MONTHS_PER_YEAR = 12;
/** 年终奖发放月份：2 月（春节前） */
const BONUS_CALENDAR_MONTH = 1; // 0=Jan, 1=Feb
/** 调薪月份：7 月（0-based 为 6） */
const SALARY_RAISE_CALENDAR_MONTH0 = 6;

/**
 * 按月递推：每月 5 号发薪、每年 2 月发年终，月支出 = 年支出/12
 * 返回达成 FIRE 的精确年月及按年汇总表
 */
export function projectToFireMonthly(state: FireState): {
  yearsToFire: number;
  fireYear: number;
  fireMonth: number; // 1-12 日历月
  fireAge: number;
  yearly: { year: number; netWorth: number; income: number; expense: number; savings: number; investmentReturn: number }[];
  yearlyMonths: { year: number; months: { month: number; netWorth: number; income: number; expense: number; savings: number; investmentReturn: number }[] }[];
} {
  const { profile, config, salary, bonus, rsuGrants, expense, shenzhenTax } = state;
  const baseYear = new Date().getFullYear();
  const startMonth = new Date().getMonth(); // 0-11，当前月
  const currentNet = netWorthCountInFire(state.assets, state.liabilities);
  const target = fireTarget(expense.targetAnnual, config.swr, config.manualFireTarget);
  const r = config.expectedReturn;
  const inf = config.inflationRate;
  const monthlyReturn = Math.pow(1 + r, 1 / MONTHS_PER_YEAR);

  const monthlyData: {
    yearIndex: number;
    calendarYear: number;
    calendarMonth: number;
    salary: number;
    bonus: number;
    rsu: number;
    housingFundExtract: number;
    expense: number;
    netWorth: number;
    investmentReturn: number;
  }[] = [];
  let A = currentNet;
  let m = 0;
  const maxMonths = 80 * MONTHS_PER_YEAR;
  let fireAtMonth: number | null = null;

  while (A < target && m < maxMonths) {
    const yearIndex = Math.floor(m / MONTHS_PER_YEAR);
    const calendarMonth0 = (startMonth + m) % MONTHS_PER_YEAR; // 0=Jan, 1=Feb, ...
    const calendarMonth = calendarMonth0 + 1; // 1-12 显示用
    const calendarYear = baseYear + Math.floor((startMonth + m) / MONTHS_PER_YEAR);
    /** 调薪在每年 7 月：7 月及之后用当年调薪档位，7 月之前用上一年档位 */
    const salaryYearOffset =
      calendarMonth0 >= SALARY_RAISE_CALENDAR_MONTH0
        ? calendarYear - baseYear
        : Math.max(0, calendarYear - baseYear - 1);

    const salaryYear = yearlySalaryAfterTax(
      salary.monthlyGross,
      salary.raiseRatePerYear,
      salaryYearOffset,
      shenzhenTax,
      salary.isAfterTax
    );
    const salaryThisMonth = salaryYear / MONTHS_PER_YEAR;

    const bonusThisMonth = calendarMonth0 === BONUS_CALENDAR_MONTH
      ? yearlyBonusAfterTax(
          bonus.amount,
          salary.monthlyGross,
          salary.raiseRatePerYear,
          salaryYearOffset,
          bonus.growsWithSalary,
          bonus.monthsOfSalary,
          shenzhenTax,
          salary.isAfterTax
        )
      : 0;

    const rsuThisMonth = m % MONTHS_PER_YEAR === 0
      ? yearlyRSUVestIncomeSimple(rsuGrants, baseYear, yearIndex)
      : 0;

    /** 公积金每月提取并入现金：基数为个人+单位缴存（单位比例默认与个人相同，常见为各 12% 合计 24%） */
    const housingFundWithdrawRate = shenzhenTax.housingFundWithdrawRate ?? 0;
    const monthlyGrossThisMonth =
      salary.monthlyGross * Math.pow(1 + salary.raiseRatePerYear, salaryYearOffset);
    const personalHf = shenzhenTax.housingFund;
    const employerHf = shenzhenTax.housingFundEmployer ?? personalHf;
    const housingFundMonthlyAccrual = (personalHf + employerHf) * monthlyGrossThisMonth;
    const housingFundExtract =
      !salary.isAfterTax && housingFundWithdrawRate > 0
        ? housingFundWithdrawRate * housingFundMonthlyAccrual
        : 0;

    const expenseThisMonth = (expense.currentAnnual / MONTHS_PER_YEAR) * Math.pow(1 + inf, yearIndex);

    const incomeThisMonth = salaryThisMonth + bonusThisMonth + rsuThisMonth + housingFundExtract;
    const savingsThisMonth = incomeThisMonth - expenseThisMonth;
    /** 当月理财预估收益：月初净资产 × 月化收益率（年化 8% 折到月） */
    const investmentReturnThisMonth = A * (monthlyReturn - 1);
    A = A * monthlyReturn + savingsThisMonth;

    monthlyData.push({
      yearIndex,
      calendarYear,
      calendarMonth,
      salary: salaryThisMonth,
      bonus: bonusThisMonth,
      rsu: rsuThisMonth,
      housingFundExtract,
      expense: expenseThisMonth,
      netWorth: Math.round(A),
      investmentReturn: Math.round(investmentReturnThisMonth),
    });
    if (A >= target && fireAtMonth == null) fireAtMonth = m;
    m++;
  }

  const yearsToFire = fireAtMonth != null ? (fireAtMonth + 1) / MONTHS_PER_YEAR : m / MONTHS_PER_YEAR;
  const totalMonths = fireAtMonth ?? Math.max(0, m - 1);
  const fireCalendarMonth0 = (startMonth + totalMonths) % MONTHS_PER_YEAR;
  const fireCalendarYear = baseYear + Math.floor((startMonth + totalMonths) / MONTHS_PER_YEAR);
  const fireMonth = fireCalendarMonth0 + 1; // 1-12 显示用
  const fireAge = Math.floor((profile.currentAge + (totalMonths + 1) / MONTHS_PER_YEAR) * 10) / 10;

  const yearlyAggregate: { year: number; netWorth: number; income: number; expense: number; savings: number; investmentReturn: number }[] = [];
  const yearlyMonths: { year: number; months: { month: number; netWorth: number; income: number; expense: number; savings: number; investmentReturn: number }[] }[] = [];

  /** 按公历年汇总，避免「从当前月起的 12 个月」与日历年份错位（不再出现 3–12 月后又接已过去的 1–2 月误标同年） */
  const calendarYears = Array.from(new Set(monthlyData.map((d) => d.calendarYear))).sort((a, b) => a - b);
  for (const cy of calendarYears) {
    const monthsInCalYear = monthlyData
      .filter((d) => d.calendarYear === cy)
      .sort((a, b) => a.calendarMonth - b.calendarMonth);
    if (monthsInCalYear.length === 0) continue;
    const income = monthsInCalYear.reduce(
      (s, d) => s + d.salary + d.bonus + d.rsu + d.housingFundExtract,
      0
    );
    const expenseSum = monthsInCalYear.reduce((s, d) => s + d.expense, 0);
    const investmentReturnSum = monthsInCalYear.reduce((s, d) => s + d.investmentReturn, 0);
    const last = monthsInCalYear[monthsInCalYear.length - 1];
    yearlyAggregate.push({
      year: cy,
      netWorth: last.netWorth,
      income: Math.round(income),
      expense: Math.round(expenseSum),
      savings: Math.round(income - expenseSum),
      investmentReturn: Math.round(investmentReturnSum),
    });
    yearlyMonths.push({
      year: cy,
      months: monthsInCalYear.map((d) => {
        const inc = d.salary + d.bonus + d.rsu + d.housingFundExtract;
        return {
          month: d.calendarMonth,
          netWorth: d.netWorth,
          income: Math.round(inc),
          expense: Math.round(d.expense),
          savings: Math.round(inc - d.expense),
          investmentReturn: d.investmentReturn,
        };
      }),
    });
  }

  return {
    yearsToFire,
    fireYear: fireCalendarYear,
    fireMonth,
    fireAge,
    yearly: yearlyAggregate,
    yearlyMonths,
  };
}

/**
 * 逐年递推（保留兼容）：内部改为调用按月结果
 */
export function projectToFire(state: FireState): {
  yearsToFire: number;
  fireYear: number;
  fireAge: number;
  yearly: { year: number; netWorth: number; income: number; expense: number; savings: number; investmentReturn: number }[];
} {
  const monthly = projectToFireMonthly(state);
  return {
    yearsToFire: monthly.yearsToFire,
    fireYear: monthly.fireYear,
    fireAge: monthly.fireAge,
    yearly: monthly.yearly,
  };
}

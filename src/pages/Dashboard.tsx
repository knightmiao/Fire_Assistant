import { useState, Fragment } from 'react';
import { useFireStore } from '../store/fireStore';
import { fireTarget, netWorthCountInFire, projectToFireMonthly } from '../lib/fireCalc';

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export function Dashboard() {
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const state = useFireStore();
  const netWorth = netWorthCountInFire(state.assets, state.liabilities);
  const target = fireTarget(
    state.expense.targetAnnual,
    state.config.swr,
    state.config.manualFireTarget
  );
  const hasManualTarget = (state.config.manualFireTarget ?? 0) > 0;
  const progress = target > 0 ? Math.min(100, (netWorth / target) * 100) : 0;
  const projection = projectToFireMonthly(state);

  return (
    <div className="page">
      <h2>FIRE 看板</h2>

      <section className="card">
        <h3>关键数字</h3>
        <dl className="key-figures">
          <div>
            <dt>当前净资产</dt>
            <dd>{formatCNY(netWorth)}</dd>
          </div>
          <div>
            <dt>
              FIRE 目标
              {hasManualTarget ? '（手动）' : `（${state.config.swr * 100}% 法则）`}
            </dt>
            <dd>{formatCNY(target)}</dd>
          </div>
          <div>
            <dt>进度</dt>
            <dd>{progress.toFixed(1)}%</dd>
          </div>
          {projection.yearly.length > 0 && (
            <>
              <div>
                <dt>预计达成时间</dt>
                <dd>{projection.fireYear} 年 {projection.fireMonth} 月</dd>
              </div>
              <div>
                <dt>达成时年龄</dt>
                <dd>{projection.fireAge} 岁</dd>
              </div>
              <div>
                <dt>还需</dt>
                <dd>{projection.yearsToFire.toFixed(1)} 年</dd>
              </div>
            </>
          )}
        </dl>
      </section>

      <section className="card">
        <h3>进度条</h3>
        <p className="progress-percent">当前进度：{progress.toFixed(1)}%</p>
        <div className="progress-bar-wrap">
          <div
            className="progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="progress-hint">
          {hasManualTarget ? '当前使用手动 FIRE 目标。' : null}
          {target > 0 && netWorth < target
            ? `还差 ${formatCNY(target - netWorth)} 达到 FIRE 目标`
            : target > 0 && netWorth >= target
              ? '已达成 FIRE 目标'
              : '请先填写「个人与参数」和「收入与支出」中的退休后期望年支出'}
        </p>
      </section>

      {projection.yearly.length > 0 && (
        <section className="card">
          <h3>未来几年净资产预测</h3>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '2rem' }} />
                <th>年份</th>
                <th>年末净资产</th>
                <th>年收入</th>
                <th>年支出</th>
                <th>年储蓄</th>
                <th>预估收益</th>
              </tr>
            </thead>
            <tbody>
              {projection.yearly.slice(0, 15).map((y) => {
                const isExpanded = expandedYear === y.year;
                const yearMonths = projection.yearlyMonths.find((ym) => ym.year === y.year)?.months ?? [];
                return (
                  <Fragment key={y.year}>
                    <tr
                      className="table-row-clickable"
                      onClick={() => setExpandedYear(isExpanded ? null : y.year)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setExpandedYear(isExpanded ? null : y.year)}
                    >
                      <td className="table-expand-icon">{isExpanded ? '▼' : '▶'}</td>
                      <td>{y.year}</td>
                      <td>{formatCNY(y.netWorth)}</td>
                      <td>{formatCNY(y.income)}</td>
                      <td>{formatCNY(y.expense)}</td>
                      <td>{formatCNY(y.savings)}</td>
                      <td>{formatCNY(y.investmentReturn)}</td>
                    </tr>
                    {isExpanded && yearMonths.length > 0 && (
                      <tr key={`${y.year}-detail`}>
                        <td colSpan={7} className="table-expand-cell">
                          <table className="table table-nested">
                            <thead>
                              <tr>
                                <th>月份</th>
                                <th>月末净资产</th>
                                <th>月收入</th>
                                <th>月支出</th>
                                <th>月储蓄</th>
                                <th>预估收益</th>
                              </tr>
                            </thead>
                            <tbody>
                              {yearMonths.map((mo) => (
                                <tr key={mo.month}>
                                  <td>{y.year}年{MONTH_NAMES[mo.month - 1]}</td>
                                  <td>{formatCNY(mo.netWorth)}</td>
                                  <td>{formatCNY(mo.income)}</td>
                                  <td>{formatCNY(mo.expense)}</td>
                                  <td>{formatCNY(mo.savings)}</td>
                                  <td>{formatCNY(mo.investmentReturn)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

function formatCNY(n: number): string {
  if (Number.isNaN(n) || !Number.isFinite(n)) return '—';
  return `¥ ${(n / 10000).toFixed(1)} 万`;
}

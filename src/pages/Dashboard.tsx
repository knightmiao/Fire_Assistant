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
  const progress = target > 0 ? Math.min(100, (netWorth / target) * 100) : 0;
  const projection = projectToFireMonthly(state);
  const badgeAlign = alignBubbleOnProgress(progress);

  return (
    <div className="page">
      <h2>FIRE 看板</h2>

      <section className="card">
        <h3>关键数字与进度</h3>
        {target > 0 ? (
          <div className="fire-goal-scale" aria-label="从零到 FIRE 目标的进度">
            <div className="fire-goal-scale-track-area">
              <div
                className="fire-goal-scale-badge fire-goal-scale-badge--pct"
                style={{ left: badgeAlign.left, transform: badgeAlign.transform }}
              >
                {progress.toFixed(1)}%
              </div>
              <div className="fire-goal-scale-bar">
                <div
                  className="fire-goal-scale-fill"
                  style={{
                    flexGrow: 0,
                    flexShrink: 0,
                    flexBasis: `${progress}%`,
                  }}
                >
                  <span className="fire-goal-scale-in-fill" title="当前净资产">
                    当前{formatCNYCompact(netWorth)}
                  </span>
                </div>
                <div className="fire-goal-scale-remain">
                  {netWorth < target ? (
                    <span className="fire-goal-scale-in-remain" title="距离 FIRE 目标">
                      差{formatCNYCompact(target - netWorth)}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="fire-goal-scale-ends">
                <span>¥0</span>
                <span>{formatCNYCompact(target)}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="progress-hint">
            请先在「FIRE 计划设置」中填写退休后期望年支出等指标，并在「财务数据」中补充资产与收支
          </p>
        )}

        {projection.yearly.length > 0 && (
          <div className="fire-time-merge" aria-label="到达 FIRE 的时间线">
            <p className="fire-time-merge-title">时间线</p>
            <div className="fire-time-merge-rail">
              <div className="fire-time-merge-node fire-time-merge-node--start">
                <span className="fire-time-merge-dot" />
                <span>今</span>
              </div>
              <div className="fire-time-merge-span">
                <div className="fire-time-merge-span-line" aria-hidden />
                <div className="fire-time-merge-span-label">
                  <strong>{projection.yearsToFire.toFixed(1)}</strong>
                  <span> 年</span>
                </div>
              </div>
              <div className="fire-time-merge-node fire-time-merge-node--end">
                <span className="fire-time-merge-dot fire-time-merge-dot--goal" />
                <div>
                  <div className="fire-time-merge-end-date">
                    {projection.fireYear} 年 {projection.fireMonth} 月
                  </div>
                  <div className="fire-time-merge-end-age">约 {projection.fireAge} 岁</div>
                </div>
              </div>
            </div>
          </div>
        )}
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

/** 表格等场景：带空格的「¥ x.x 万」 */
function formatCNY(n: number): string {
  if (Number.isNaN(n) || !Number.isFinite(n)) return '—';
  return `¥ ${(n / 10000).toFixed(1)} 万`;
}

/** 刻度条标签 / 气泡：无空格「¥x.x万」 */
function formatCNYCompact(n: number): string {
  if (Number.isNaN(n) || !Number.isFinite(n)) return '—';
  return `¥${(n / 10000).toFixed(1)}万`;
}

/** 单气泡对齐填充末端；靠右略早贴边，避免压住右下角目标金额 */
function alignBubbleOnProgress(progress: number): { left: string; transform: string } {
  if (progress <= 4) {
    return { left: '0%', transform: 'translateX(0)' };
  }
  if (progress >= 88) {
    return { left: '100%', transform: 'translateX(-100%)' };
  }
  return { left: `${progress}%`, transform: 'translateX(-50%)' };
}

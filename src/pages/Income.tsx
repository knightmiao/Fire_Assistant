import { IconTrash } from '../components/PixelIcons';
import { useFireStore } from '../store/fireStore';
import type { RSUGrant } from '../types';

export function Income() {
  const {
    salary,
    bonus,
    rsuGrants,
    config,
    setSalary,
    setBonus,
    addRsuGrant,
    updateRsuGrant,
    removeRsuGrant,
  } = useFireStore();

  const handleAddRSU = () => {
    addRsuGrant({
      grantDate: new Date().toISOString().slice(0, 10),
      vestYears: 4,
      vestSchedule: [0.25, 0.25, 0.25, 0.25],
      unvestedShares: 0,
      pricePerShare: 0,
      currency: 'HKD',
      rateToCNY: config.rateHKDToCNY,
    });
  };

  return (
    <div className="page">
      <h2>收入与支出</h2>

      <section className="card">
        <h3>工资与调薪</h3>
        <div className="data-table-wrap">
          <table className="data-table data-table--kv">
            <tbody>
              <tr>
                <th scope="row">当前月薪（元，税前或税后由下项决定）</th>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={salary.monthlyGross || ''}
                    onChange={(e) => setSalary({ monthlyGross: Number(e.target.value) || 0 })}
                  />
                </td>
              </tr>
              <tr>
                <th scope="row">是否税后月薪</th>
                <td>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={salary.isAfterTax}
                      onChange={(e) => setSalary({ isAfterTax: e.target.checked })}
                    />
                    勾选表示上列为税后金额
                  </label>
                </td>
              </tr>
              <tr>
                <th scope="row">年度调薪比例（如 0.05 = 5%）</th>
                <td>
                  <input
                    type="number"
                    step={0.01}
                    min={0}
                    value={salary.raiseRatePerYear ?? ''}
                    onChange={(e) => setSalary({ raiseRatePerYear: Number(e.target.value) ?? 0.05 })}
                  />
                </td>
              </tr>
              <tr>
                <th scope="row">月薪基准年份</th>
                <td>
                  <input
                    type="number"
                    min={2000}
                    max={2100}
                    value={salary.salaryBaseYear ?? ''}
                    onChange={(e) => setSalary({ salaryBaseYear: Number(e.target.value) || new Date().getFullYear() })}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h3>年终奖</h3>
        <div className="data-table-wrap">
          <table className="data-table data-table--kv">
            <tbody>
              <tr>
                <th scope="row">年终奖金额（元，与月薪同口径）</th>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={bonus.amount || ''}
                    onChange={(e) => setBonus({ amount: Number(e.target.value) || 0 })}
                  />
                </td>
              </tr>
              <tr>
                <th scope="row">年终奖随调薪增长</th>
                <td>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={bonus.growsWithSalary}
                      onChange={(e) => setBonus({ growsWithSalary: e.target.checked })}
                    />
                    勾选表示按「相当于几个月月薪」随年薪变化
                  </label>
                </td>
              </tr>
              {bonus.growsWithSalary && (
                <tr>
                  <th scope="row">相当于几个月月薪</th>
                  <td>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={bonus.monthsOfSalary ?? ''}
                      onChange={(e) => setBonus({ monthsOfSalary: Number(e.target.value) || undefined })}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h3>RSU 授予与归属计划</h3>
          <button type="button" className="btn primary" onClick={handleAddRSU}>+ 添加 RSU Grant</button>
        </div>
        <p className="hint">未归属 RSU 会计入资产（在资产页添加「RSU 未归属」并填金额）；此处用于计算未来各年归属收入参与现金流。</p>
        <div className="data-table-wrap data-table-scroll">
          <table className="data-table data-table--wide">
            <thead>
              <tr>
                <th>授予日</th>
                <th className="data-table-col-narrow">归属年数</th>
                <th>未归属股数</th>
                <th>每股价格</th>
                <th className="data-table-col-narrow">币种</th>
                <th>兑人民币汇率</th>
                <th className="data-table-col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {rsuGrants.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                    暂无 RSU 记录，点击「添加 RSU Grant」录入。
                  </td>
                </tr>
              ) : (
                rsuGrants.map((g: RSUGrant) => (
                  <tr key={g.id}>
                    <td>
                      <input type="date" value={g.grantDate} onChange={(e) => updateRsuGrant(g.id, { grantDate: e.target.value })} />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={g.vestYears}
                        onChange={(e) => updateRsuGrant(g.id, { vestYears: Number(e.target.value) || 4 })}
                      />
                    </td>
                    <td className="data-table-col-num">
                      <input
                        type="number"
                        min={0}
                        value={g.unvestedShares || ''}
                        onChange={(e) => updateRsuGrant(g.id, { unvestedShares: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td className="data-table-col-num">
                      <input
                        type="number"
                        min={0}
                        value={g.pricePerShare || ''}
                        onChange={(e) => updateRsuGrant(g.id, { pricePerShare: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td>
                      <select
                        value={g.currency}
                        onChange={(e) => updateRsuGrant(g.id, { currency: e.target.value as 'HKD' | 'USD' })}
                        aria-label="币种"
                      >
                        <option value="HKD">HKD</option>
                        <option value="USD">USD</option>
                      </select>
                    </td>
                    <td className="data-table-col-num">
                      <input
                        type="number"
                        step={0.01}
                        min={0}
                        value={g.rateToCNY ?? ''}
                        onChange={(e) =>
                          updateRsuGrant(g.id, {
                            rateToCNY: Number(e.target.value) ?? (g.currency === 'HKD' ? config.rateHKDToCNY : config.rateUSDToCNY),
                          })
                        }
                      />
                    </td>
                    <td className="data-table-col-actions">
                      <button
                        type="button"
                        className="btn btn-icon btn-icon-delete"
                        onClick={() => removeRsuGrant(g.id)}
                        aria-label="删除此 RSU"
                        title="删除"
                      >
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

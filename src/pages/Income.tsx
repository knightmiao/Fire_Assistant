import { useFireStore } from '../store/fireStore';

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
        <div className="form-grid">
          <label>
            当前月薪（元，税前或税后由下勾选）
            <input
              type="number"
              min={0}
              value={salary.monthlyGross || ''}
              onChange={(e) => setSalary({ monthlyGross: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={salary.isAfterTax}
              onChange={(e) => setSalary({ isAfterTax: e.target.checked })}
            />
            我填的是税后月薪（不再扣五险一金与个税）
          </label>
          <label>
            年度调薪比例（如 0.05 = 5%）
            <input
              type="number"
              step={0.01}
              min={0}
              value={salary.raiseRatePerYear ?? ''}
              onChange={(e) => setSalary({ raiseRatePerYear: Number(e.target.value) ?? 0.05 })}
            />
          </label>
          <label>
            月薪基准年份
            <input
              type="number"
              min={2000}
              max={2100}
              value={salary.salaryBaseYear ?? ''}
              onChange={(e) => setSalary({ salaryBaseYear: Number(e.target.value) || new Date().getFullYear() })}
            />
          </label>
        </div>
      </section>

      <section className="card">
        <h3>年终奖</h3>
        <div className="form-grid">
          <label>
            年终奖金额（元，与月薪同口径）
            <input
              type="number"
              min={0}
              value={bonus.amount || ''}
              onChange={(e) => setBonus({ amount: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={bonus.growsWithSalary}
              onChange={(e) => setBonus({ growsWithSalary: e.target.checked })}
            />
            年终奖随调薪增长（即 N 个月月薪）
          </label>
          {bonus.growsWithSalary && (
            <label>
              相当于几个月月薪
              <input
                type="number"
                min={0}
                step={0.5}
                value={bonus.monthsOfSalary ?? ''}
                onChange={(e) => setBonus({ monthsOfSalary: Number(e.target.value) || undefined })}
              />
            </label>
          )}
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h3>RSU 授予与归属计划</h3>
          <button type="button" className="btn primary" onClick={handleAddRSU}>+ 添加 RSU Grant</button>
        </div>
        <p className="hint">未归属 RSU 会计入资产（在资产页添加「RSU 未归属」并填金额）；此处用于计算未来各年归属收入参与现金流。</p>
        <ul className="list">
          {rsuGrants.map((g: import('../types').RSUGrant) => (
            <li key={g.id} className="list-item rsu-row">
              <label>授予日 <input type="date" value={g.grantDate} onChange={(e) => updateRsuGrant(g.id, { grantDate: e.target.value })} /></label>
              <label>归属年数 <input type="number" min={1} value={g.vestYears} onChange={(e) => updateRsuGrant(g.id, { vestYears: Number(e.target.value) || 4 })} /></label>
              <label>未归属股数 <input type="number" min={0} value={g.unvestedShares || ''} onChange={(e) => updateRsuGrant(g.id, { unvestedShares: Number(e.target.value) || 0 })} /></label>
              <label>每股价格 <input type="number" min={0} value={g.pricePerShare || ''} onChange={(e) => updateRsuGrant(g.id, { pricePerShare: Number(e.target.value) || 0 })} /></label>
              <label>
                币种
                <select value={g.currency} onChange={(e) => updateRsuGrant(g.id, { currency: e.target.value as 'HKD' | 'USD' })}>
                  <option value="HKD">HKD</option>
                  <option value="USD">USD</option>
                </select>
              </label>
              <label>兑人民币汇率 <input type="number" step={0.01} min={0} value={g.rateToCNY ?? ''} onChange={(e) => updateRsuGrant(g.id, { rateToCNY: Number(e.target.value) ?? (g.currency === 'HKD' ? config.rateHKDToCNY : config.rateUSDToCNY) })} /></label>
              <button type="button" className="btn danger" onClick={() => removeRsuGrant(g.id)}>删除</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

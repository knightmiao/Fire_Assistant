import { useFireStore } from '../store/fireStore';
import { DEFAULT_SHENZHEN_TAX } from '../lib/constants';

export function Profile() {
  const {
    profile,
    config,
    shenzhenTax,
    expense,
    setProfile,
    setConfig,
    setShenzhenTax,
    setExpense,
  } = useFireStore();

  return (
    <div className="page">
      <h2>FIRE 计划设置</h2>
      <p className="hint page-lead">
        个人档案、安全提取率、通胀、汇率与税务等假设；影响看板目标与预测。
      </p>

      <section className="card">
        <h3>个人档案</h3>
        <div className="form-grid">
          <label>
            当前年龄
            <input
              type="number"
              min={18}
              max={100}
              value={profile.currentAge || ''}
              onChange={(e) => setProfile({ currentAge: Number(e.target.value) || 0 })}
            />
          </label>
          <label>
            目标退休年龄
            <input
              type="number"
              min={0}
              max={100}
              value={profile.targetRetireAge || ''}
              onChange={(e) => setProfile({ targetRetireAge: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
      </section>

      <section className="card">
        <h3>全局参数</h3>
        <div className="form-grid">
          <label>
            安全提取率 SWR（如 0.04 = 4%）
            <input
              type="number"
              step={0.01}
              min={0.01}
              max={0.2}
              value={config.swr || ''}
              onChange={(e) => setConfig({ swr: Number(e.target.value) || 0.04 })}
            />
          </label>
          <label>
            FIRE 目标金额（单位，元）
            <input
              type="number"
              min={0}
              value={config.manualFireTarget ?? ''}
              onChange={(e) => setConfig({ manualFireTarget: Number(e.target.value) || 0 })}
            />
          </label>
          <p className="hint">
            留空或填 0 时，FIRE 目标按「退休后期望年支出 ÷ SWR」自动计算；填入金额后，会优先使用这个手动目标。
          </p>
          <label>
            预期年化回报率（如 0.06 = 6%）
            <input
              type="number"
              step={0.01}
              min={0}
              value={config.expectedReturn || ''}
              onChange={(e) => setConfig({ expectedReturn: Number(e.target.value) || 0.06 })}
            />
          </label>
          <label>
            通胀率（如 0.03 = 3%）
            <input
              type="number"
              step={0.01}
              min={0}
              value={config.inflationRate ?? ''}
              onChange={(e) => setConfig({ inflationRate: Number(e.target.value) ?? 0.03 })}
            />
          </label>
          <label>
            港币兑人民币
            <input
              type="number"
              step={0.01}
              min={0}
              value={config.rateHKDToCNY ?? ''}
              onChange={(e) => setConfig({ rateHKDToCNY: Number(e.target.value) ?? 0.92 })}
            />
          </label>
          <label>
            美元兑人民币
            <input
              type="number"
              step={0.01}
              min={0}
              value={config.rateUSDToCNY ?? ''}
              onChange={(e) => setConfig({ rateUSDToCNY: Number(e.target.value) ?? 7.25 })}
            />
          </label>
        </div>
      </section>

      <section className="card">
        <h3>深圳五险一金（可调）</h3>
        <p className="hint">仅供参考，以实际工资条为准。公积金提取比例：每月提取并入现金的部分，仅在填写「税前月薪」时参与预测。</p>
        <div className="form-grid">
          <label>
            养老个人比例（如 0.08 = 8%）
            <input
              type="number"
              step={0.01}
              min={0}
              max={1}
              value={shenzhenTax.pension ?? ''}
              onChange={(e) => setShenzhenTax({ pension: Number(e.target.value) ?? DEFAULT_SHENZHEN_TAX.pension })}
            />
          </label>
          <label>
            医疗个人比例（如 0.02 = 2%）
            <input
              type="number"
              step={0.01}
              min={0}
              max={1}
              value={shenzhenTax.medical ?? ''}
              onChange={(e) => setShenzhenTax({ medical: Number(e.target.value) ?? DEFAULT_SHENZHEN_TAX.medical })}
            />
          </label>
          <label>
            失业比例（如 0.005）
            <input
              type="number"
              step={0.001}
              min={0}
              max={1}
              value={shenzhenTax.unemployment ?? ''}
              onChange={(e) => setShenzhenTax({ unemployment: Number(e.target.value) ?? DEFAULT_SHENZHEN_TAX.unemployment })}
            />
          </label>
          <label>
            公积金比例（如 0.12 = 12%，可调 5%~12%）
            <input
              type="number"
              step={0.01}
              min={0}
              max={0.12}
              value={shenzhenTax.housingFund ?? ''}
              onChange={(e) => setShenzhenTax({ housingFund: Number(e.target.value) ?? DEFAULT_SHENZHEN_TAX.housingFund })}
            />
          </label>
          <label>
            公积金提取比例（如 0.8 = 80%，每月提取并入现金）
            <input
              type="number"
              step={0.1}
              min={0}
              max={1}
              value={shenzhenTax.housingFundWithdrawRate ?? ''}
              onChange={(e) => setShenzhenTax({ housingFundWithdrawRate: Number(e.target.value) ?? DEFAULT_SHENZHEN_TAX.housingFundWithdrawRate })}
            />
          </label>
          <label>
            个税起征点
            <input
              type="number"
              min={0}
              value={shenzhenTax.taxThreshold ?? ''}
              onChange={(e) => setShenzhenTax({ taxThreshold: Number(e.target.value) ?? 5000 })}
            />
          </label>
        </div>
      </section>

      <section className="card">
        <h3>支出</h3>
        <div className="form-grid">
          <label>
            当前年支出（元）
            <input
              type="number"
              min={0}
              value={expense.currentAnnual || ''}
              onChange={(e) => setExpense({ currentAnnual: Number(e.target.value) || 0 })}
            />
          </label>
          <label>
            退休后期望年支出（元，用于计算 FIRE 目标）
            <input
              type="number"
              min={0}
              value={expense.targetAnnual || ''}
              onChange={(e) => setExpense({ targetAnnual: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
      </section>
    </div>
  );
}

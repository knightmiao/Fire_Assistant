import { useFireStore } from '../store/fireStore';
import { ASSET_TYPE_LABELS, type AssetType, type AssetItem, type LiabilityItem } from '../types';
import { netWorthCountInFire } from '../lib/fireCalc';

const assetTypes: AssetType[] = [
  'cash',
  'housing_fund',
  'stock_a',
  'stock_hk',
  'stock_us',
  'fund',
  'receivable',
  'rsu_vested',
  'rsu_unvested',
  'bond_etc',
  'property',
];

export function Assets() {
  const { assets, liabilities, config, addAsset, updateAsset, removeAsset, addLiability, updateLiability, removeLiability } = useFireStore();
  const netWorth = netWorthCountInFire(assets, liabilities);
  const totalAssets = assets.reduce((s: number, a: AssetItem) => s + a.amountCNY, 0);
  const totalLiabilities = liabilities.reduce((s: number, l: LiabilityItem) => s + l.amountCNY, 0);

  const handleForeignAmountChange = (
    id: string,
    type: 'stock_hk' | 'stock_us',
    amountRaw: number,
    rateRaw: number
  ) => {
    const rate = rateRaw > 0 ? rateRaw : type === 'stock_hk' ? config.rateHKDToCNY : config.rateUSDToCNY;
    const amount = amountRaw >= 0 ? amountRaw : 0;
    updateAsset(id, {
      amountOriginal: amount,
      currency: type === 'stock_hk' ? 'HKD' : 'USD',
      rateToCNY: rate,
      amountCNY: Math.round(amount * rate),
    });
  };

  const handleAddAsset = () => {
    addAsset({
      type: 'cash',
      amountCNY: 0,
      snapshotDate: new Date().toISOString().slice(0, 10),
      countInFire: true,
    });
  };

  const handleAddLiability = () => {
    addLiability({
      name: '负债',
      amountCNY: 0,
      snapshotDate: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="page">
      <h2>资产与负债</h2>
      <p className="hint">全部手动录入。港股可直接填港币、美股可直接填美元，系统按汇率折算为人民币；其他资产填人民币金额。</p>

      <section className="card">
        <h3>汇总</h3>
        <p>资产合计：¥ {(totalAssets / 10000).toFixed(1)} 万 · 负债合计：¥ {(totalLiabilities / 10000).toFixed(1)} 万 · 净资产（计入 FIRE）：¥ {(netWorth / 10000).toFixed(1)} 万</p>
        {assets.length > 0 && totalAssets === 0 && assets.some((a) => a.name && /^\d+(\.\d+)?$/.test(String(a.name))) && (
          <p className="data-file-hint">
            检测到部分资产可能把金额填在了「名称」里（名称为数字但金额为 0），请在各行把正确数字填到「金额（元）」中，或点击该行「用名称填金额」修正。
          </p>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <h3>资产</h3>
          <button type="button" className="btn primary" onClick={handleAddAsset}>+ 添加资产</button>
        </div>
        <ul className="list">
          {assets.map((a: AssetItem) => {
            const isHk = a.type === 'stock_hk';
            const isUs = a.type === 'stock_us';
            const useForeign = isHk || isUs;
            const currencyLabel = isHk ? '港币' : isUs ? '美元' : '元';
            const defaultRate = isHk ? config.rateHKDToCNY : config.rateUSDToCNY;
            const origAmount = a.currency && (a.currency === 'HKD' || a.currency === 'USD') && a.amountOriginal != null
              ? a.amountOriginal
              : (a.rateToCNY && a.rateToCNY > 0 ? a.amountCNY / a.rateToCNY : 0);
            const rate = a.rateToCNY ?? defaultRate;

            return (
              <li key={a.id} className="list-item">
                <select
                  value={a.type}
                  onChange={(e) => updateAsset(a.id, { type: e.target.value as AssetType })}
                  title="资产类型"
                >
                  {assetTypes.map((t) => (
                    <option key={t} value={t}>{ASSET_TYPE_LABELS[t]}</option>
                  ))}
                </select>
                {useForeign ? (
                  <>
                    <label className="list-item-inline">
                      <span className="list-item-inline-tag">金额（{currencyLabel}）</span>
                      <input
                        type="number"
                        placeholder="0"
                        min={0}
                        step={isHk || isUs ? 0.01 : 1}
                        value={origAmount === 0 ? '' : origAmount}
                        onChange={(e) => handleForeignAmountChange(a.id, a.type as 'stock_hk' | 'stock_us', Number(e.target.value) || 0, rate)}
                      />
                    </label>
                    <label className="list-item-inline">
                      <span className="list-item-inline-tag">汇率→¥</span>
                      <input
                        type="number"
                        placeholder="0"
                        min={0}
                        step={0.01}
                        value={rate === 0 ? '' : rate}
                        onChange={(e) => handleForeignAmountChange(a.id, a.type as 'stock_hk' | 'stock_us', origAmount, Number(e.target.value) || 0)}
                      />
                    </label>
                    <span className="list-item-cny-hint">≈ ¥ {(a.amountCNY / 10000).toFixed(1)} 万</span>
                  </>
                ) : (
                  <label className="list-item-inline">
                    <span className="list-item-inline-tag">金额（元）</span>
                    <input
                      type="number"
                      placeholder="0"
                      min={0}
                      step={1}
                      value={a.amountCNY === 0 ? '' : a.amountCNY}
                      onChange={(e) => updateAsset(a.id, { amountCNY: Number(e.target.value) || 0 })}
                    />
                  </label>
                )}
                <label className="list-item-inline">
                  <span className="list-item-inline-tag">名称（选填）</span>
                  <input
                    type="text"
                    placeholder="如：某银行卡"
                    value={a.name ?? ''}
                    onChange={(e) => updateAsset(a.id, { name: e.target.value || undefined })}
                  />
                </label>
                {!useForeign && a.amountCNY === 0 && a.name != null && /^\d+(\.\d+)?$/.test(String(a.name)) && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => updateAsset(a.id, { amountCNY: Number(a.name) || 0, name: '' })}
                    title="将名称中的数字填入金额"
                  >
                    用名称填金额
                  </button>
                )}
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={a.countInFire}
                    onChange={(e) => updateAsset(a.id, { countInFire: e.target.checked })}
                  />
                  计入 FIRE
                </label>
                <button type="button" className="btn danger" onClick={() => removeAsset(a.id)}>删除</button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card">
        <div className="card-head">
          <h3>负债</h3>
          <button type="button" className="btn primary" onClick={handleAddLiability}>+ 添加负债</button>
        </div>
        <ul className="list">
          {liabilities.map((l: LiabilityItem) => (
            <li key={l.id} className="list-item">
              <label className="list-item-inline">
                <span className="list-item-inline-tag">金额（元）</span>
                <input
                  type="number"
                  placeholder="0"
                  min={0}
                  step={1}
                  value={l.amountCNY === 0 ? '' : l.amountCNY}
                  onChange={(e) => updateLiability(l.id, { amountCNY: Number(e.target.value) || 0 })}
                />
              </label>
              <label className="list-item-inline">
                <span className="list-item-inline-tag">名称</span>
                <input
                  type="text"
                  placeholder="如：房贷"
                  value={l.name}
                  onChange={(e) => updateLiability(l.id, { name: e.target.value })}
                />
              </label>
              <button type="button" className="btn danger" onClick={() => removeLiability(l.id)}>删除</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

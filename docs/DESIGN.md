# FIRE 工具 — 技术设计文档

> 基于 PRD v0.3 定稿，MVP 范围与约束见 PRD。

---

## 一、技术栈

| 类别 | 选型 | 说明 |
|------|------|------|
| 框架 | React 18 + TypeScript | 类型安全、生态成熟 |
| 构建 | Vite | 快速 HMR、ESM |
| 样式 | Tailwind CSS | 快速布局与响应式 |
| 状态与持久化 | Zustand + localStorage | 轻量、可序列化；数据结构预留迁 IndexedDB |
| 路由 | React Router v6 | 单页多视图 |
| 公式/工具函数 | 纯函数模块 | 无外部依赖，便于单测 |

---

## 二、项目结构

```
Fire_Assistant/
├── docs/                    # PRD、设计文档
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/               # 全局类型定义
│   │   ├── profile.ts
│   │   ├── assets.ts
│   │   ├── income.ts
│   │   ├── config.ts
│   │   └── index.ts
│   ├── store/               # Zustand store + 持久化
│   │   └── fireStore.ts
│   ├── lib/                 # 核心计算与工具
│   │   ├── fireCalc.ts      # FIRE 目标、达成年限、逐年递推
│   │   ├── taxShenzhen.ts   # 深圳五险一金与个税
│   │   └── constants.ts    # 默认参数（深圳比例等）
│   ├── components/         # 通用组件
│   │   ├── Layout.tsx
│   │   ├── NumberInput.tsx
│   │   └── ...
│   └── pages/               # 页面/模块
│       ├── Profile.tsx      # 个人档案 + 全局参数
│       ├── Assets.tsx       # 资产与负债
│       ├── Income.tsx       # 收入与支出（含 RSU、五险一金）
│       └── Dashboard.tsx    # FIRE 看板（进度、达成年限、关键数字）
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 三、数据模型（MVP）

### 3.1 个人档案与全局参数

```ts
// 个人档案
interface Profile {
  currentAge: number;           // 当前年龄
  targetRetireAge: number;     // 目标退休年龄，0 表示“越早越好”由计算得出
  currency: 'CNY';
}

// 全局参数
interface GlobalConfig {
  swr: number;                  // 安全提取率，如 0.04
  expectedReturn: number;     // 积累期预期年化回报，如 0.06
  postRetireReturn?: number;   // 退休后预期回报，默认同 expectedReturn
  inflationRate: number;      // 通胀率，如 0.03
  rateHKDToCNY: number;       // 港币兑人民币
  rateUSDToCNY: number;       // 美元兑人民币
}
```

### 3.2 深圳五险一金与个税（可调）

```ts
interface ShenzhenTaxConfig {
  // 五险一金比例（占缴费基数比例，可调）
  pension: number;             // 养老 8%
  medical: number;             // 医疗 2%
  unemployment: number;       // 失业 0.5%
  housingFund: number;         // 公积金 5%～12%，用户可调
  // 个税
  taxThreshold: number;       // 起征点 5000
  // 可选：用户覆盖为“税后”时不再用此配置
}
```

### 3.3 资产与负债

- **资产类型**：现金、公积金、A股、港股、美股、基金、应收（别人欠我钱）、RSU 已归属、RSU 未归属、债券/理财、房产等。
- 每条资产：`id, type, name?, amountCNY, snapshotDate, countInFire (是否计入 FIRE)`；港股/美股可存 `amountOriginal, currency, rateToCNY` 或直接 `amountCNY`。
- **RSU 未归属**：`id, grantId, unvestedShares, pricePerShare, currency, rateToCNY`，或合并到「资产」一条用 type=RSU_UNVESTED，金额=未归属股数×单价×汇率。
- **负债**：`id, name, amountCNY, snapshotDate`。
- 为预留多时间点快照，资产/负债可带 `snapshotId` 或当前仅一条“当前”快照。

```ts
type AssetType = 'cash' | 'housing_fund' | 'stock_a' | 'stock_hk' | 'stock_us' | 'fund' | 'receivable' | 'rsu_vested' | 'rsu_unvested' | 'bond_etc' | 'property';

interface AssetItem {
  id: string;
  type: AssetType;
  name?: string;
  amountCNY: number;          // 折算后人民币，手动录入
  snapshotDate: string;        // ISO date
  countInFire: boolean;
  // 多币种时可选
  amountOriginal?: number;
  currency?: 'CNY' | 'HKD' | 'USD';
  rateToCNY?: number;
}

interface LiabilityItem {
  id: string;
  name: string;
  amountCNY: number;
  snapshotDate: string;
}
```

### 3.4 收入与 RSU

- **工资**：当前月薪（税前/税后）、年度调薪比例、月薪生效年份（用于递推）。
- **年终奖**：金额（与月薪同口径）、是否随调薪增长（如 N 个月月薪）。
- **RSU 授予**：多笔；每笔：授予日、归属周期（年）、归属节奏（如每年 25%）、未归属股数、当前每股估值、币种与汇率。归属计划用于生成「未来各年归属收入」参与现金流。
- **五险一金/个税**：由深圳配置从税前推算税后；或用户选“税后”则直接录月薪/年终奖税后。

```ts
interface SalaryConfig {
  monthlyGross: number;        // 当前月薪（税前）
  isAfterTax: boolean;         // false=税前，用深圳公式算税后；true=税后，不再扣减
  raiseRatePerYear: number;    // 年度调薪比例，如 0.05
  salaryBaseYear: number;      // 月薪基准年份，如 2025
}

interface BonusConfig {
  amount: number;              // 年终奖（与月薪同口径）
  growsWithSalary: boolean;   // 是否随调薪增长（如 =  N 个月月薪）
  monthsOfSalary?: number;    // 若 true，年终奖 = 该年月薪 * monthsOfSalary
}

interface RSUGrant {
  id: string;
  grantDate: string;           // ISO date
  vestYears: number;           // 归属周期（年）
  vestSchedule: number[];     // 每年归属比例，如 [0.25,0.25,0.25,0.25]
  unvestedShares: number;
  pricePerShare: number;
  currency: 'HKD' | 'USD';
  rateToCNY: number;
}
// 归属收入：由计算得出，未来某年 = 该年归属股数 * 估值（可用当前价或用户设的增长率，MVP 简化为当前价）
```

### 3.5 支出

```ts
interface ExpenseConfig {
  currentAnnual: number;       // 当前年支出
  targetAnnual: number;        // 退休后期望年支出（FIRE 目标基于此）
}
```

### 3.6 汇总 Store 形状（持久化）

```ts
interface FireState {
  profile: Profile;
  config: GlobalConfig;
  shenzhenTax: ShenzhenTaxConfig;
  assets: AssetItem[];
  liabilities: LiabilityItem[];
  salary: SalaryConfig;
  bonus: BonusConfig;
  rsuGrants: RSUGrant[];
  expense: ExpenseConfig;
  lastUpdated: string;         // ISO
}
```

---

## 四、核心计算（lib）

### 4.1 深圳五险一金与个税（lib/taxShenzhen.ts）

- 输入：税前月薪、年终奖、五险一金比例、起征点。
- 输出：月薪税后、年终奖税后。
- 规则：社保基数一般为月薪（封顶按当地社平 3 倍）；公积金基数同；个税按累计预扣，年终奖单独计税（或并入综合所得，MVP 用单独计税）。
- 公式参考：深圳比例默认值 + 用户可调。

### 4.2 FIRE 目标与达成年限（lib/fireCalc.ts）

- **FIRE 目标**：`targetAnnualExpense / swr`（如 25 倍年支出）。
- **逐年递推**：
  - 第 t 年：月薪_t = 当前月薪 × (1 + 调薪)^t；年工资 = 月薪_t × 12；年终奖_t 按配置（固定或 N 个月月薪）；RSU 归属收入_t 由各 Grant 归属计划算出；税后收入_t = 税后(年工资 + 年终奖_t) + RSU 归属_t（RSU 归属部分可按税后近似或简化）。
  - 支出_t = 当前年支出 × (1+通胀)^t（或退休前用 currentAnnual，退休后用 targetAnnual；MVP 可简化为积累期用 currentAnnual）。
  - 储蓄_t = 收入_t - 支出_t。
  - 资产_t = 资产_{t-1} × (1 + expectedReturn) + 储蓄_t。
  - 找到最小 t 使 资产_t >= FIRE 目标，得到达成年份与年龄。
- **净资产**：当前可投资净资产 = Σ(计入 FIRE 的资产) - Σ(负债)；RSU 未归属 = Σ(未归属股数 × 单价 × 汇率)。

### 4.3 预留扩展

- 快照：`assets/liabilities` 可改为按 `snapshotId` + `snapshotDate` 存多条，便于后续「每月快照」与趋势图。
- 多情景：复制一份 state 或增加 `scenarios: { name, config }[]` 在 v0.3 使用。

---

## 五、页面与路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 重定向到 `/dashboard` 或 `/profile` | 首次进入引导填写档案 |
| `/profile` | Profile | 个人档案 + 全局参数 + 深圳五险一金可调 |
| `/assets` | Assets | 资产与负债列表，手动录入、是否计入 FIRE |
| `/income` | Income | 月薪、调薪、年终奖、RSU 多笔授予 |
| `/expense` | 可合并到 Profile 或 Income | 当前年支出、退休后期望年支出 |
| `/dashboard` | Dashboard | FIRE 目标、进度条、达成年限、关键数字一览 |

导航：顶部或侧边 Tab/链接，响应式。

---

## 六、持久化与初始化

- 使用 Zustand 的 `persist` 中间件，存到 `localStorage`，key 如 `fire-assistant-state`。
- 首次进入无数据时，展示默认值（深圳比例、SWR 4%、回报 6% 等），用户填写后保存。
- 数据结构保持可扩展，后续可切换为 IndexedDB（同一 `FireState` 形状）。

---

## 七、MVP 交付清单

- [ ] 个人档案 + 全局参数 + 深圳五险一金可调
- [ ] 资产与负债 CRUD，类型含应收、RSU 已归属/未归属，全部手动录入
- [ ] 收入：月薪、调薪、年终奖、多笔 RSU 授予与归属计划
- [ ] 支出：当前年支出、退休后期望年支出
- [ ] FIRE 目标计算、当前进度条、逐年递推达成年限
- [ ] 数据持久化到 localStorage
- [ ] 响应式布局

---

**文档结束。开发按此设计实现，PRD 变更时同步更新本文档。**

# FIRE 规划助手

个人 FIRE（Financial Independence, Retire Early）规划与追踪工具，面向中国大陆大厂场景：支持工资、调薪、年终奖、RSU、五险一金（深圳比例可调）、多市场资产（A 股/港股/美股/基金/应收等），算清 FIRE 目标与达成年限。

## 功能（MVP）

- **FIRE 看板**：当前净资产、FIRE 目标、进度条、预计达成年份与年龄、未来几年净资产预测表
- **财务数据**（子页）：**资产与负债** — 现金、公积金、A 股/港股/美股/基金、应收、RSU 已归属/未归属、负债等；**收入与支出** — 月薪（税前或税后）、调薪、年终奖、多笔 RSU 授予
- **FIRE 计划设置**：年龄、目标退休年龄、安全提取率、预期回报、通胀、汇率；深圳五险一金比例；当前/退休后期望年支出

## 技术栈

- React 18 + TypeScript + Vite
- React Router、Zustand（持久化到 localStorage）
- 纯前端，数据仅存本地

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`。

## 构建

```bash
npm run build
```

产物在 `dist/`，可部署到任意静态托管。

## 文档

- [PRD 产品需求文档](docs/PRD-Fire工具产品需求文档.md)
- [技术设计文档](docs/DESIGN.md)

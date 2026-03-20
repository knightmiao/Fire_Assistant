# Supabase 单设备备份 — 建表建议

## 设计思路

- 前端状态集中在 `FireState`（见 `src/types/index.ts`：档案、全局参数、深圳个税、资产/负债、薪资/奖金/RSU、支出、`lastUpdated`）。
- **单设备、仅自己备份**：用 **一行 JSONB** 存整包数据即可，不必拆多张业务表；导出/导入 JSON 的逻辑仍可并行保留。
- 浏览器里使用的是 **anon key**，数据库必须开 **RLS**。即使只有你自己用，也建议用 **Supabase Auth（邮箱魔术链接即可）**：表里用 `user_id = auth.uid()`，避免匿名客户端能读写全表。

## 表结构（推荐）

| 列 | 类型 | 说明 |
|----|------|------|
| `user_id` | `uuid` | 主键，等于 `auth.users.id` |
| `payload` | `jsonb` | 与 `FireState` 同结构的 JSON |
| `schema_version` | `int` | 可选，便于以后改 JSON 形状时做迁移 |
| `updated_at` | `timestamptz` | 上次写入时间 |

每个登录用户最多一行；上传备份用 `upsert`（`onConflict: 'user_id'`）。

## 操作步骤

1. Supabase 控制台 → **Authentication** → 打开 **Email**（魔术链接或密码，按你喜好）。
2. 在数据库里执行建表 SQL（二选一，内容一致）：
   - **SQL Editor**：打开 `docs/supabase-fire-app-snapshot.sql` 全选复制 → 粘贴 → **Run**。
   - **Supabase CLI**（已 `supabase init`）：在项目根执行 `npx supabase link` 绑定项目后，再 `npx supabase db push`，会应用 `supabase/migrations/20250320140000_fire_app_snapshot.sql`。
3. 前端：登录后把当前 `getStateForExport()` 的结果（或 persist 里的纯数据）序列化进 `payload`，调用 `upsert`；恢复时 `select` 一行再 `loadFullState`。

## `payload` 与类型的关系

`payload` 建议直接对应 `FireState` 字段名与嵌套结构，便于 `JSON.parse` 后交给现有的 `loadFullState`。若你后来在类型里增删字段，可 bump `schema_version` 并在客户端做兼容。

## 不做 Auth 的说明（不推荐）

若坚持不登录，anon 客户端无法在 RLS 下安全区分「只有你」；把表对匿名放开等于公开读写。**单设备备份**仍强烈建议至少一个邮箱账号 + 上面 RLS 方案。

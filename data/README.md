# 数据说明

应用内数据默认保存在浏览器 **localStorage**（随站点域名持久化）。

云端备份请使用顶栏 **「上传到 Supabase 保存」**（需配置 `.env.local` 并完成邮箱登录），数据写入 Supabase 表 `fire_app_snapshot`。

本目录可继续用于你自行存放导出的 JSON 备份（若你用手动方式备份），应用不再提供内置的导入/导出按钮。

# 本地数据文件

可将 FIRE 规划助手导出的数据存于此目录，便于备份与调试。

## 使用方式

1. **导出**：在应用内点击「导出到本地文件」，会下载 `fire-assistant-data.json`。  
   将该文件保存到本目录，例如：`data/fire-assistant-data.json`。

2. **导入**：重新打开应用后，点击「从文件导入」，选择 `data/fire-assistant-data.json` 即可恢复数据。  
   应用也会将导入的数据写回浏览器 localStorage，下次直接打开无需再导入。

3. **自动检测（可选）**：若将导出的文件另存为项目根目录下的 `public/fire-assistant-data.json`，运行 `npm run dev` 后，应用会在启动时检测到该文件并询问是否导入。

建议将 `data/fire-assistant-data.json` 加入版本管理或定期备份，以便在不同环境或重装后快速恢复。

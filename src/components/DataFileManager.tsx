import { useState, useEffect, useRef } from 'react';
import { useFireStore } from '../store/fireStore';
import type { FireState } from '../types';
import {
  exportToDataFile,
  parseDataFile,
  fetchLocalDataFile,
} from '../lib/dataFile';

export function DataFileManager() {
  const getStateForExport = useFireStore((s: { getStateForExport: () => FireState }) => s.getStateForExport);
  const loadFullState = useFireStore((s: { loadFullState: (state: FireState) => void }) => s.loadFullState);
  const [localFileData, setLocalFileData] = useState<FireState | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 启动时检测 public 下是否有数据文件
  useEffect(() => {
    fetchLocalDataFile().then((data) => {
      if (data) setLocalFileData(data);
    });
  }, []);

  const handleExport = () => {
    exportToDataFile(getStateForExport);
  };

  const handleImportFromLocal = () => {
    if (!localFileData) return;
    loadFullState(localFileData);
    setLocalFileData(null);
  };

  const handleDismissLocal = () => {
    setLocalFileData(null);
  };

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const state = parseDataFile(text);
      if (state) {
        loadFullState(state);
      } else {
        setImportError('文件格式无效，请选择导出的 fire-assistant-data.json');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="data-file-manager">
      <div className="data-file-actions">
        <button type="button" className="btn primary" onClick={handleExport}>
          导出到本地文件
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => fileInputRef.current?.click()}
        >
          从文件导入
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden-file-input"
          onChange={handleSelectFile}
          aria-label="选择数据文件"
        />
      </div>
      <p className="data-file-hint">
        导出后会下载 <code>fire-assistant-data.json</code>，请保存到项目的{' '}
        <code>data/</code> 或 <code>public/</code> 目录便于备份与调试；重新打开时可用「从文件导入」选择该文件恢复，或将文件放在 public 目录下由应用自动检测。
      </p>
      {importError && (
        <p className="data-file-error" role="alert">
          {importError}
        </p>
      )}
      {localFileData && (
        <div className="data-file-banner">
          <p>检测到本地数据文件（public/fire-assistant-data.json），是否导入覆盖当前数据？</p>
          <div className="data-file-banner-actions">
            <button type="button" className="btn primary" onClick={handleImportFromLocal}>
              导入并覆盖
            </button>
            <button type="button" className="btn" onClick={handleDismissLocal}>
              忽略
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

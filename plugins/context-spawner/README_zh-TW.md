# Claude Code Context Spawner

[English](README.md) | [繁體中文](README_zh-TW.md)

> 當 context 達到 10% 閾值時，自動儲存並恢復 Claude Code 會話狀態。
>
> **安裝：** `/plugin install context-spawner@Rockman-X`

## 功能特色

- **自動狀態捕獲** - 偵測 context window 達到閾值時自動觸發（預設：10%）
- **儲存庫隔離** - 每個儲存庫維護獨立的狀態
- **完整狀態保存** - 任務、git 狀態、檔案變更，一個都不漏
- **無縫恢復** - 新會話自動恢復上一次的狀態
- **自動清理** - 自動移除舊的狀態檔案以節省磁碟空間

## 快速開始

### 安裝

```bash
# 新增 Rockman-X marketplace
/plugin marketplace add https://github.com/Phlegonlabs/Rockman-X.git

# 安裝 plugin
/plugin install context-spawner@Rockman-X

# 重新啟動 Claude Code
```

### 就這樣！

外掛會在背景自動運作。

## 運作原理

```
會話 A（context 達到 10%）
    |
    v
[自動儲存狀態到 .claude-context/]
    |
    v
會話 B（新會話）
    |
    v
[自動從 .claude-context/ 恢復]
    |
    v
從上次中斷的地方繼續！
```

## 儲存內容

| 資料 | 說明 |
|------|------|
| 任務 | 所有 TODO 項目及其狀態 |
| 檔案 | 已修改的檔案和 git 狀態 |
| 上下文 | 關鍵決策和程式碼變更 |
| 偏好設定 | 你的編碼偏好 |
| 錯誤記錄 | 遇到的問題和嘗試過的解決方案 |

## 設定

在 `~/.claude/config.json` 中新增（可選）：

```json
{
  "contextSpawner": {
    "threshold": 10,
    "maxStates": 3,
    "autoCleanup": true,
    "notificationStyle": "compact",
    "restoreOnNewSession": true
  }
}
```

| 選項 | 預設值 | 說明 |
|------|--------|------|
| `threshold` | 10 | 觸發儲存的 context 使用率 % |
| `maxStates` | 3 | 保留的狀態檔案數量 |
| `autoCleanup` | true | 自動刪除舊狀態 |
| `notificationStyle` | compact | 通知顯示樣式 |
| `restoreOnNewSession` | true | 新會話時自動恢復 |

## 狀態檔案位置

狀態按儲存庫分別儲存：

```
your-project/
└── .claude-context/
    └── state-2025-01-15-14-30.json
```

## 手動指令

```bash
# 手動載入上一次的狀態
.context-load
```

## 開發

```bash
# 安裝依賴
npm install

# 執行測試
npm test

# 執行特定測試
npm test -- tests/config.test.js
```

## 文件

- [安裝指南](docs/INSTALLATION.md)
- [架構說明](docs/ARCHITECTURE.md)

## 授權

MIT

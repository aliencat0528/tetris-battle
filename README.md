# Tetris - 俄羅斯方塊

一個現代化的單人俄羅斯方塊遊戲，使用純 HTML5 + CSS3 + JavaScript 實現。

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 遊戲特色

### 核心機制
- **Ghost Piece** - 半透明預覽方塊落點位置
- **Hold 系統** - 按 C 暫存方塊，每次落下可用一次
- **3-Piece Next 預覽** - 顯示接下來 3 個方塊
- **Wall Kick** - SRS 旋轉系統，碰壁自動位移調整
- **Lock Delay** - 觸底後 500ms 延遲，可移動/旋轉重置（最多 15 次）
- **7-Bag 隨機系統** - 確保方塊分布公平

### 計分系統
| 消除行數 | 基本分數 |
|---------|---------|
| 1 行 (Single) | 100 |
| 2 行 (Double) | 300 |
| 3 行 (Triple) | 500 |
| 4 行 (Tetris) | 800 |

- 等級加成：分數 × 當前等級
- Soft Drop：每格 +1 分
- Hard Drop：每格 +2 分
- 連擊 (Combo)：額外 50 × 連擊數 × 等級

### 等級系統
- 每消除 10 行升一級
- 等級提升加快下落速度
- 最高 15 級

## 操作說明

### 鍵盤控制
| 按鍵 | 功能 |
|-----|------|
| ← / A | 左移 |
| → / D | 右移 |
| ↓ / S | Soft Drop（快速下降） |
| ↑ / W / X | 順時針旋轉 |
| Z | 逆時針旋轉 |
| 空白鍵 | Hard Drop（瞬間落下） |
| C / Shift | Hold（暫存方塊） |
| P / Esc | 暫停/繼續 |
| R | 重新開始 |
| Enter | 開始遊戲 |

## 專案架構

```
Tetris battle/
├── index.html              # 遊戲主頁面（含所有 JS 邏輯）
├── styles/
│   └── game.css            # 遊戲樣式
├── src/                    # 模組化原始碼（ES6 模組版本）
│   ├── main.js             # 程式入口
│   ├── constants.js        # 常數定義
│   ├── Piece.js            # 方塊類別
│   ├── Board.js            # 棋盤類別
│   ├── Renderer.js         # Canvas 渲染器
│   ├── InputHandler.js     # 輸入處理
│   ├── ScoreManager.js     # 計分與排行榜
│   └── Game.js             # 遊戲主控制器
├── .devcontainer/          # DevContainer 配置
│   └── devcontainer.json
└── README.md
```

### 模組說明

| 模組 | 功能 |
|-----|------|
| **Game** | 遊戲主控制器，管理遊戲狀態、迴圈、方塊生成 |
| **Board** | 棋盤邏輯，碰撞檢測、消行、Ghost 位置計算 |
| **Piece** | 方塊類別，形狀、旋轉、Wall Kick 資料 |
| **PieceBag** | 7-bag 隨機生成器 |
| **Renderer** | Canvas 渲染，繪製棋盤、方塊、UI |
| **InputHandler** | 鍵盤/觸控輸入處理，按鍵重複 |
| **ScoreManager** | 計分、等級、LocalStorage 高分榜 |

## 使用方式

### 方法一：直接開啟（推薦）
```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

### 方法二：本地伺服器
```bash
# 使用 Python
python3 -m http.server 8100

# 使用 Node.js (需安裝 http-server)
npx http-server -p 8100

# 訪問
open http://localhost:8100
```

### 方法三：DevContainer
1. 在 VS Code 中打開專案
2. 按 F1 → "Dev Containers: Reopen in Container"
3. 執行 `python3 -m http.server 8100`
4. 訪問 `http://localhost:8100`

## 端口配置

| 用途 | 端口 |
|-----|------|
| Tetris 遊戲 | 8100 |

本專案使用端口 **8100**，屬於 `claude prototype` 專案段（8100-8199）。

## 技術規格

- **渲染**：HTML5 Canvas 2D API
- **語言**：純 JavaScript (ES6+)
- **樣式**：CSS3（Flexbox、漸層、動畫）
- **儲存**：LocalStorage（高分榜）
- **無外部依賴**

## 視覺設計

### 配色
- 背景：深色漸層 (#1a1a2e → #16213e)
- I 方塊：青色 (#00d4ff)
- O 方塊：黃色 (#ffd700)
- T 方塊：紫色 (#9b59b6)
- S 方塊：綠色 (#2ecc71)
- Z 方塊：紅色 (#e74c3c)
- J 方塊：藍色 (#3498db)
- L 方塊：橘色 (#e67e22)

## 測試清單

- [ ] 按 Enter 開始遊戲
- [ ] 測試方向鍵移動
- [ ] 測試旋轉（含 Wall Kick）
- [ ] 測試 Soft Drop / Hard Drop
- [ ] 測試 Hold 功能
- [ ] 測試 Ghost Piece 位置
- [ ] 測試消行與計分
- [ ] 測試連擊 (Combo)
- [ ] 測試等級升級與速度
- [ ] 測試暫停 (P)
- [ ] 測試重新開始 (R)
- [ ] 測試 Game Over
- [ ] 測試高分榜儲存

## 版本歷史

### v2.0.0 (2026-01-20)
- 重新設計為單人模式
- 新增 Hold 系統
- 新增 3-Piece Next 預覽
- 新增 Ghost Piece
- 實現 SRS Wall Kick 旋轉系統
- 新增 Lock Delay 機制
- 新增 Combo 連擊系統
- 新增 LocalStorage 高分榜
- 模組化架構重構

### v1.0.0 (2026-01-09)
- 初始發布（雙人對戰版本）

## 授權

MIT License

## 作者

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

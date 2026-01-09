# Tetris Battle - 俄罗斯方块对战游戏

一个基于 HTML5 Canvas 的双人本地对战俄罗斯方块游戏。

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ 游戏特色

### 核心玩法
- 🎮 **双人本地对战** - 在同一台电脑上与朋友对战
- 🎯 **7种经典方块** - I, J, L, O, S, T, Z 全部俄罗斯方块类型
- ⚔️ **攻击系统** - 消除多行向对手发送垃圾行
- 👻 **幽灵方块** - 显示方块最终落点
- 🔮 **方块预览** - 提前看到下一个方块

### 游戏系统
- 📊 **计分系统** - 消除越多，得分越高
- 📈 **等级系统** - 每消除10行提升一级，速度递增
- ⏸️ **游戏控制** - 暂停、继续、重新开始
- 🏆 **胜负判定** - 方块堆到顶部即判负

### Battle 攻击机制
```
消除 2 行 → 对手底部增加 1 行垃圾
消除 3 行 → 对手底部增加 2 行垃圾
消除 4 行 → 对手底部增加 3 行垃圾
```

## 🎯 操作说明

### 玩家 1（左侧）
| 按键 | 功能 |
|------|------|
| `A` | 向左移动 |
| `D` | 向右移动 |
| `S` | 快速下落 |
| `W` | 旋转方块 |
| `Space` | 瞬间下落 |

### 玩家 2（右侧）
| 按键 | 功能 |
|------|------|
| `←` | 向左移动 |
| `→` | 向右移动 |
| `↓` | 快速下落 |
| `↑` | 旋转方块 |
| `Enter` | 瞬间下落 |

## 🚀 快速开始

### 方法 1：直接打开（推荐）

直接双击 `tetris-battle.html` 文件，或者：

```bash
open tetris-battle.html
```

### 方法 2：使用本地服务器

```bash
# 启动服务器
python3 -m http.server 8100

# 在浏览器中访问
# http://localhost:8100/tetris-battle.html
```

## 🛠️ 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式设计（渐变、动画、响应式布局）
- **JavaScript (ES6+)** - 游戏逻辑
- **Canvas 2D** - 图形渲染

## 📁 项目结构

```
claude prototype/
├── .gitignore              # Git 忽略文件
├── README.md               # 项目说明文档
├── PORT_ALLOCATION.md      # 端口分配管理文档
├── tetris-battle.html      # 游戏主页面
└── tetris-battle.js        # 游戏核心逻辑
```

## 🎨 游戏架构

### 核心类：TetrisGame

```javascript
class TetrisGame {
    constructor(canvasId, nextCanvasId, playerId)
    createBoard()           // 创建游戏棋盘
    createPiece()           // 生成随机方块
    rotate()                // 旋转方块
    move(dir)               // 移动方块
    drop()                  // 方块下落
    hardDrop()              // 瞬间下落
    collides()              // 碰撞检测
    merge()                 // 合并方块到棋盘
    clearLines()            // 消除完整行
    receiveAttack(lines)    // 接收攻击
    draw()                  // 渲染游戏画面
}
```

### 方块类型定义

```javascript
const SHAPES = {
    I: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    J: [[1,0,0], [1,1,1], [0,0,0]],
    L: [[0,0,1], [1,1,1], [0,0,0]],
    O: [[1,1], [1,1]],
    S: [[0,1,1], [1,1,0], [0,0,0]],
    T: [[0,1,0], [1,1,1], [0,0,0]],
    Z: [[1,1,0], [0,1,1], [0,0,0]]
};
```

## 🔧 配置说明

### 游戏参数

- **棋盘大小**: 10列 × 20行
- **方块尺寸**: 24×24 像素
- **初始速度**: 1000ms（等级1）
- **速度递增**: 每级减少100ms
- **最快速度**: 100ms

### 端口配置

本项目使用端口 **8100**，为 `claude prototype` 文件夹专属端口段（8100-8199）。

详细端口分配规则请查看 [PORT_ALLOCATION.md](./PORT_ALLOCATION.md)

## 🎯 未来计划

- [ ] 添加音效和背景音乐
- [ ] 支持触摸屏操作（移动端）
- [ ] 添加单人模式（对战 AI）
- [ ] 保存最高分记录
- [ ] 添加更多游戏模式
- [ ] 在线多人对战功能
- [ ] 自定义键位设置
- [ ] 主题切换功能

## 📝 版本历史

### v1.0.0 (2026-01-09)
- ✨ 初始发布
- ✅ 双人本地对战功能
- ✅ 完整的游戏逻辑
- ✅ 攻击系统
- ✅ 计分和等级系统
- ✅ 响应式 UI 设计

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>

---

**享受游戏！祝你和朋友对战愉快！** 🎮✨

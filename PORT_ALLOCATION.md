# Claude Prototype - 端口分配规则

## 专属端口段：8100-8199

为避免与主要项目冲突，`claude prototype` 文件夹下的所有项目统一使用 **8100-8199** 端口段。

## 当前端口分配

| 端口 | 项目 | 状态 | 说明 |
|------|------|------|------|
| 8100 | Tetris Battle | ✅ 使用中 | 俄罗斯方块对战游戏 |
| 8101 | - | ⭕ 可用 | 保留给下一个项目 |
| 8102 | - | ⭕ 可用 | 保留给下一个项目 |
| 8103-8199 | - | ⭕ 可用 | 保留给未来项目 |

## 系统已占用端口（请勿使用）

### 主要项目端口（绝对不可占用）
- **8000**: 🚨 **tagtoo/ad-track API 服务** - 重要后端服务
- **10001**: tagtoo/ad-track config-api (Docker 映射)
- **10002**: tagtoo/ad-track api (Docker 映射)

### 系统服务端口
- **5000, 7000**: ControlCenter 服务
- **9090-9101**: Electron 应用
- **23275, 50900**: Antigravity Language Server (claude prototype)
- **50916, 50917, 50924**: Antigravity Language Server (其他工作区)
- **60210, 60213, 60214, 60242, 63470**: Antigravity Language Server (tagtoo_product_service)
- **53545**: DBeaver 数据库工具
- **65141**: LINE 应用

### 常用开发端口（建议避免）
- **3000**: React/Next.js 默认端口
- **5173**: Vite 默认端口
- **8080**: 常用备用端口
- **4200**: Angular 默认端口

## 快速启动命令

### Tetris Battle 游戏
```bash
# 方法 1: 直接打开（推荐）
open "/Users/angelchang/Desktop/claude prototype/tetris-battle.html"

# 方法 2: 使用本地服务器
cd "/Users/angelchang/Desktop/claude prototype"
python3 -m http.server 8100
# 访问: http://localhost:8100/tetris-battle.html
```

## 端口管理命令

### 查看所有监听端口
```bash
lsof -i -P | grep LISTEN | sort -t: -k2 -n
```

### 查看特定端口占用
```bash
lsof -i :8100
```

### 停止特定端口服务
```bash
# 先查找进程 PID
lsof -i :8100
# 然后停止进程
kill <PID>
```

## 注意事项

1. ⚠️ **优先级原则**：主要项目的端口设置优先，`claude prototype` 为次要项目
2. ✅ **避免冲突**：新项目启动前务必检查端口是否已被占用
3. 📝 **及时更新**：分配新端口后请更新本文档
4. 🔒 **不要修改**：切勿修改或删除主要项目的端口配置

## 端口冲突历史记录

### 2026-01-09 - 端口 8000 冲突已解决
- **问题**：初次启动时误用 8000 端口（tagtoo 项目专用）
- **解决**：停止 Python HTTP Server (PID 79449)，释放端口
- **当前状态**：✅ 8000 端口已恢复，可供 tagtoo 项目使用
- **新分配**：Tetris Battle 游戏改用 8100 端口

---

最后更新时间: 2026-01-09 14:55

# If-I-Held

一个轻量有趣的股票复盘小工具：  
输入“当时卖出的价格和数量”，快速计算“如果没卖，现在会怎样”。

## 功能简介

- 选择股票代码（当前内置 AAPL、TSLA、MSFT、GOOGL、META、NVDA）
- 输入卖出数量和卖出价格
- 拉取当前价格（优先 Yahoo Finance 实时数据，失败时自动使用本地兜底价格）
- 计算并展示：
  - 卖出价值
  - 当前价值
  - 差额
  - 收益率
- 趣味化展示：
  - 后悔等级与情绪 emoji
  - 结果金句
  - 机会成本换算（奶茶/汉堡/电影票）

## 技术栈

- React 18
- TypeScript
- Vite
- Axios

## 本地运行

### 方式 1：使用 bat 脚本（Windows）

双击项目根目录下的 `start.bat` 即可。

脚本会自动：
- 检查 Node.js / npm
- 首次安装依赖（`npm install`）
- 启动开发服务器（`npm run dev`）

### 方式 2：手动命令

```bash
npm install
npm run dev
```

启动后按终端提示访问本地地址（通常是 `http://localhost:5123`）。

## 打包构建

```bash
npm run build
npm run preview
```

## 项目结构

```text
.
├─ src/
│  ├─ App.tsx        # 主页面与核心计算逻辑
│  ├─ main.tsx       # 入口
│  └─ index.css      # 全局样式
├─ start.bat         # Windows 一键启动脚本
├─ index.html
├─ package.json
└─ vite.config.ts
```

## 注意事项

- 当前股票列表是内置的下拉选项，不是任意代码输入。
- 实时价格来源于公开接口，请求可能受网络或跨域策略影响；失败时会自动切到兜底价格。
- 本项目偏复盘娱乐和演示用途，不构成任何投资建议。

## License

MIT

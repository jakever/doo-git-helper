# GitLab 版本管理工具

一个基于 Vue 3 + Electron 的 GitLab 版本管理工具，支持分支比较、批量 Cherry Pick 等功能。

## 功能特性

### 主页
- **分支管理**: 支持切换当前分支和远程目标分支
- **提交记录管理**: 查看当前分支的所有提交记录，支持分页
- **搜索功能**: 支持按作者、提交信息、hash 搜索
- **分支差异比较**: 比较当前分支和目标分支的差异
- **批量 Cherry Pick**: 批量勾选进行 Cherry Pick 操作

### 设置页面
- **仓库选择**: 选择 Git 仓库路径
- **Token 配置**: 设置 GitLab Access Token

## 技术栈

- 前端框架: Vue 3 + Vite + TypeScript
- UI 组件库: Element Plus
- 状态管理: Pinia
- 桌面应用: Electron
- Git 操作: simple-git
- 请求框架: Axios

## 开发环境

- Node.js v22.x
- macOS (Apple M1 芯片)

## 安装和运行

1. 安装依赖
```bash
npm install
```

2. 启动开发服务器
```bash
npm run dev
```

3. 构建项目
```bash
npm run build
```

## 使用说明

1. 首次使用需要在设置页面配置：
   - 选择本地 Git 仓库路径
   - 设置 GitLab Access Token

2. 在主页面：
   - 选择当前分支和目标分支
   - 点击"比较差异"查看分支差异
   - 勾选需要 Cherry Pick 的提交
   - 点击"Cherry Pick"执行批量操作

## 注意事项

- 请确保 Git 仓库路径正确
- GitLab Token 需要具有 read_repository 和 read_api 权限
- Cherry Pick 操作会切换到目标分支，请确保工作区干净

## 开发计划

- [ ] 添加 Electron 桌面应用支持
- [ ] 优化文件选择对话框
- [ ] 添加更多 Git 操作功能
- [ ] 支持多仓库管理

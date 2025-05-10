# Diary Audit 项目

这是一个基于 React 和 Ant Design 的游记审核管理系统。

## 项目结构

audiit/ ├── public/ # 静态资源文件 │ ├── index.html # HTML 模板 │ ├── manifest.json # PWA 配置 │ └── robots.txt # 爬虫配置 ├── src/ # 源代码 │ ├── App.js # 应用主组件 │ ├── index.js # 应用入口文件 │ ├── index.css # 全局样式 │ ├── pages/ # 页面组件 │ │ └── Home.jsx # 首页组件 │ └── components/ # 可复用组件（目前为空） ├── .gitignore # Git 忽略文件 ├── package.json # 项目依赖和脚本 ├── README.md # 自述文件 └── ...

## 技术栈

- **React**: 用于构建用户界面。
- **React Router**: 用于路由管理。
- **Ant Design**: 用于 UI 组件库。
- **Create React App**: 用于快速搭建 React 项目。

## 环境要求

- Node.js >= 14.x
- npm >= 6.x 或 yarn >= 1.x

## 安装依赖

在项目根目录下运行以下命令安装依赖：

```bash
npm install
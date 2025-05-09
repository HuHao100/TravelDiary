# Travel Diary Backend

本项目为旅游日记系统的后端服务，基于 Node.js、Express 和 Sequelize 开发，使用 MySQL 作为数据库。

## 依赖安装

```bash
npm install express body-parser cors sequelize mysql2 dotenv
```

## 配置

在项目根目录下创建 `.env` 文件，内容示例：

```
DB_NAME=traveldiary
DB_USER=root
DB_PASS=你的数据库密码
DB_HOST=localhost
PORT=3000
```

## 数据库初始化

请先在 MySQL 中创建数据库，并导入 `traveldiary.sql` 文件。

## 启动项目

```bash
node app.js
```

启动后，服务默认运行在 `http://localhost:3000/`。

## 测试接口

你可以通过如下接口测试获取所有日记：

```
GET http://localhost:3000/api/diaries
```

## 目录结构

```
.
├── app.js
├── config
│   └── db.js
├── models
│   ├── index.js
│   ├── users.js
│   ├── diaries.js
│   ├── diary_comments.js
│   ├── diary_images.js
│   ├── diary_likes.js
│   └── diary_videos.js
├── routes
│   └── diaries.js
├── traveldiary.sql
└── .env
```

## 说明

- 请确保 MySQL 服务已启动，并且 `.env` 配置正确。
- 其他接口和功能可根据需要自行扩展。

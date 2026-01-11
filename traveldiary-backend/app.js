console.log('启动程序');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
 
const sequelize = require('./config/db');
require('dotenv').config();



const app = express();
app.use(express.json({ type: 'application/json' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 静态文件
app.use(express.static('public'));
app.use('/api/avatars', express.static('public/avatars/'));
app.use('/api/diary_images', express.static('public/diary_images'));
app.use('/api/diary_videos', express.static('public/diary_videos'));

app.use(bodyParser.json());

app.use('/api/diaries', require('./routes/diaries'));
app.use('/api/users', require('./routes/users'));

// 点赞  评论
app.use('/api/likes', require('./routes/diary_likes'));
app.use('/api/comments', require('./routes/diary_comments'));


// 同步数据库并启动服务
sequelize.sync().then(() => {
  console.log('数据库连接成功');
  app.listen(process.env.PORT, () => {
    console.log(`服务启动，监听端口: ${process.env.PORT}`);
  });
}).catch(err => {
  console.error('数据库连接失败:', err);
});

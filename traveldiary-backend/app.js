console.log('App starting...');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
 
const sequelize = require('./config/db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/diaries', require('./routes/diaries'));
// app.use('/api/admin', require('./routes/admin'));
app.use('/api/diaries', require('./routes/diaries'));
// 同步数据库并启动服务
sequelize.sync().then(() => {
  console.log('数据库连接成功');
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT}`);
  });
}).catch(err => {
  console.error('数据库连接失败:', err);
});

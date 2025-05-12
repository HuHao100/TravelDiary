const router = require('express').Router();
const multer = require('multer');
const { User } = require('../models');
const { v4: uuidv4 } = require('uuid');

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/avatars/');
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${uuidv4()}.${ext}`);
  }
});
const upload = multer({ storage });

// 用户注册
router.post('/register', upload.single('avatar'), async (req, res) => {
  try {
    const { username, password, nickname } = req.body;

    if (!username || !password || !nickname) {
      return res.status(400).json({ message: '请填写完整信息' });
    }

    // 校验用户名唯一性
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ message: '该用户名已被使用' });
    }

    // 直接存储明文密码
    const newUser = await User.create({
      username,
      password: password,
      nickname,
      avatar_url: req.file ? `/avatars/${req.file.filename}` : '/avatars/default.png',
      created_at: new Date()
    });

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      nickname: newUser.nickname,
      avatar_url: newUser.avatar_url
    });
  } catch (error) {
    res.status(500)
       .set('Content-Type', 'application/json; charset=utf-8')
       .json({ 
         message: '注册失败：' + error.message 
       });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 直接比较明文密码
    if (password !== user.password) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    res.json({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar_url: user.avatar_url
    });
  } catch (error) {
    res.status(500)
       .set('Content-Type', 'application/json; charset=utf-8')
       .json({ 
         message: '登录失败：' + error.message 
       });
  }
});

module.exports = router;
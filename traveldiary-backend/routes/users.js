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

// 更新用户资料（昵称/头像）
router.put('/:id/profile', upload.single('avatar'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { nickname } = req.body;

    if (nickname !== undefined && (nickname.trim().length === 0 || nickname.trim().length > 20)) {
      return res.status(400).json({ message: '昵称长度须在1到20个字符之间' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (nickname) {
      user.nickname = nickname;
    }

    if (req.file) {
      user.avatar_url = `/avatars/${req.file.filename}`;
    }

    await user.save();

    res.json({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar_url: user.avatar_url
    });
  } catch (error) {
    res.status(500)
       .set('Content-Type', 'application/json; charset=utf-8')
       .json({ message: '更新资料失败：' + error.message });
  }
});

// 修改密码
router.put('/:id/password', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: '请填写完整信息' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (user.password !== oldPassword) {
      return res.status(401).json({ message: '原密码不正确' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: '密码修改成功' });
  } catch (error) {
    res.status(500)
       .set('Content-Type', 'application/json; charset=utf-8')
       .json({ message: '修改密码失败：' + error.message });
  }
});

module.exports = router;

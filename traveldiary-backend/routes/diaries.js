const express = require('express');
const router = express.Router();
const { Diary } = require('../models');

// 获取所有日记
router.get('/', async (req, res) => {
  try {
    const diaries = await Diary.findAll();
    res.json(diaries);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
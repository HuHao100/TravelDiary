const express = require('express');
const router = express.Router();
const { Diary } = require('../models');
const { DiaryImage } = require('../models');

// 获取所有日记
router.get('/getAll', async (req, res) => {
  try {
    const diaries = await Diary.findAll({
        where: { is_deleted: false }, // 只显示未删除的
        include: [{
          model: DiaryImage,
          attributes: ['image_url'],
          limit: 1, // 只取第一张图片
          required: false // 允许无图片
        }],
        order: [['created_at', 'DESC']] // 按时间倒序
    });

    // 格式化返回数据
    const formatted = diaries.map(diary => ({
      id: diary.id,
      user_id: diary.user_id,
      title: diary.title,
      content: diary.content,
      status: diary.status,
      reject_reason: diary.rejection_reason,

      image_url: diary.DiaryImages[0]?.image_url
      ? `/diary_images/${diary.DiaryImages[0].image_url}` // 添加完整路径前缀
      : '/diary_images/default.png', // 直接返回默认图路径

      created_at: diary.created_at
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: '获取游记失败' });
  }
});

// 删除接口
router.delete('/:id', async (req, res) => {
  try {
    await Diary.update(
      { is_deleted: true },
      { where: { id: req.params.id } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;
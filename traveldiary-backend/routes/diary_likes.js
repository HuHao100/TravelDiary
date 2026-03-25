const router = require('express').Router();
const { DiaryLike, User, Diary } = require('../models');

// 查询用户是否已点赞
router.get('/:diaryId', async (req, res) => {
  try {
    const { userId } = req.query;
    const { diaryId } = req.params;

    const count = await DiaryLike.count({ where: { diary_id: diaryId } });

    if (!userId) {
      return res.json({ liked: false, count });
    }

    const existingLike = await DiaryLike.findOne({
      where: { user_id: userId, diary_id: diaryId }
    });

    res.json({ liked: !!existingLike, count });
  } catch (error) {
    res.status(500).json({ error: '查询失败' });
  }
});

// 点赞/取消点赞
router.post('/:diaryId', async (req, res) => {
  try {
    const userId = req.body.userId;
    const diaryId = req.params.diaryId;

    const existingLike = await DiaryLike.findOne({
      where: { user_id: userId, diary_id: diaryId }
    });

    if (existingLike) {
      await existingLike.destroy();
    } else {
      await DiaryLike.create({
        user_id: userId,
        diary_id: diaryId
      });
    }

    const newCount = await DiaryLike.count({
      where: { diary_id: diaryId }
    });

    res.json({ success: true, count: newCount });
  } catch (error) {
    res.status(500).json({ error: '操作失败' });
  }
});

module.exports = router;
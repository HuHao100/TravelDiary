const router = require('express').Router();
const { DiaryComment, User, Diary } = require('../models');

// 发表评论
router.post('/:diaryId', async (req, res) => {
  try {
    const { content, userId } = req.body; // 需要前端传递用户ID和内容
    
    const newComment = await DiaryComment.create({
      diary_id: req.params.diaryId,
      user_id: userId,
      content: content
    });

    const commentWithUser = await DiaryComment.findByPk(newComment.id, {
      include: [{
        model: User,
        attributes: ['id', 'nickname', 'avatar_url']
      }]
    });

    res.json({
      id: commentWithUser.id,
      user: commentWithUser.User.nickname,
      avatar: commentWithUser.User.avatar_url,
      content: commentWithUser.content,
      created_at: commentWithUser.created_at // 添加创建时间
    });
  } catch (error) {
    res.status(500).json({ error: '发表评论失败' });
  }
});

module.exports = router;
const router = require('express').Router();
const { DiaryComment, User, Diary } = require('../models');

// ��������
router.post('/:diaryId', async (req, res) => {
  try {
    const { content, userId } = req.body; // ��Ҫǰ�˴����û�ID������
    
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
      created_at: commentWithUser.created_at // ��Ӵ���ʱ��
    });
  } catch (error) {
    res.status(500).json({ error: '��������ʧ��' });
  }
});

module.exports = router;
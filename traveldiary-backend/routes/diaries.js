const express = require('express');
const router = express.Router();
const { Diary } = require('../models');
const { DiaryImage } = require('../models');
const { Op } = require('sequelize');
const { User } = require('../models');
const { DiaryVideo } = require('../models');
const { DiaryComment } = require('../models');
const { DiaryLike } = require('../models'); // Added DiaryLike import

// 获取所有日记
router.get('/getAll', async (req, res) => {
  try {
    const diaries = await Diary.findAll({
      where: { 
        status: { 
          [Op.ne]: 'deleted'
        } 
      },
      include: [
        {
          model: User,
          attributes: ['id', 'nickname', 'avatar_url'], // 添加id字段
          required: true
        },
        {
          model: DiaryImage,
          attributes: ['image_url'],
          limit: 1,
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formatted = diaries.map(diary => ({
      id: diary.id,
      user_id: diary.User.id, // 添加user_id字段
      title: diary.title,
      content: diary.content, // 添加content字段
      status: diary.status,
      image_url: diary.DiaryImages[0]?.image_url 
        ? `${diary.DiaryImages[0].image_url}`
        : '/diary_images/default.png',
      user: {
        nickname: diary.User.nickname,
        avatar_url: `${diary.User.avatar_url}`
      },
      created_at: diary.created_at // 添加创建时间
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取游记失败' });
  }
});
router.get('/getDeleted', async (req, res) => {
  try {
    const diaries = await Diary.findAll({
      where: { 
        status: 'deleted'
      },
      include: [
        {
          model: User,
          attributes: ['id', 'nickname', 'avatar_url'],
          required: true
        },
        {
          model: DiaryImage,
          attributes: ['image_url'],
          limit: 1,
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formatted = diaries.map(diary => ({
      id: diary.id,
      user_id: diary.User.id,
      title: diary.title,
      content: diary.content,
      status: diary.status,
      image_url: diary.DiaryImages[0]?.image_url 
        ? `${diary.DiaryImages[0].image_url}`
        : '/diary_images/default.png',
      user: {
        nickname: diary.User.nickname,
        avatar_url: `${diary.User.avatar_url}`
      },
      created_at: diary.created_at
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取已删除游记失败' });
  }
});
// 获取单个日记详情
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching diary with ID:', req.params.id);
    const diary = await Diary.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'nickname', 'avatar_url'],
          required: true
        },
        {
          model: DiaryImage,
          attributes: ['image_url'],
        },
        {
          model: DiaryVideo,
          attributes: ['video_url'],
          required: false
        },
        {
          model: DiaryComment,
          attributes: ['id', 'content', 'created_at'], // 保留需要的字段
          include: [{
            model: User,
            attributes: ['id', 'nickname', 'avatar_url']
          }]
        },
        {
          model: DiaryLike,
          attributes: ['user_id']
        }
      ],
      order: [
        [DiaryImage, 'sort_order', 'ASC'],
        [DiaryComment, 'created_at', 'DESC']
      ]
    });

    if (!diary) {
      return res.status(404).json({ error: '游记不存在' });
    }

    // 构建响应数据结构
    const response = {
      id: diary.id,
      author: {
        id: diary.User.id,
        nickname: diary.User.nickname,
        avatar: diary.User.avatar_url
      },
      title: diary.title,
      content: diary.content,
      status: diary.status,
      media: [
        ...(diary.DiaryVideo
          ? [{ type: 'video', url: diary.DiaryVideo.video_url }]
          : []),
        ...(diary.DiaryImages || []).map(img => ({
          type: 'image',
          url: img.image_url
        }))
      ],
      likes: diary.DiaryLikes.length,
      comments: diary.DiaryComments.map(comment => ({
        id: comment.id,
        user: comment.User.nickname,
        avatar: comment.User.avatar_url,
        content: comment.content,
        created_at: comment.created_at
      })),
      created_at: diary.created_at,
      updated_at: diary.updated_at
    };
    res.json(response);
  } catch (err) {
    console.error('Error fetching diary:', err);
    res.status(500).json({ error: '获取游记详情失败', details: err.message });
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

// 更改帖子状态
router.patch('/updateStatus/:id', async (req, res) => {
  const { id } = req.params; // 获取帖子 ID
  const { status, rejection_reason } = req.body; // 获取新的状态和拒绝原因

  // 检查状态是否合法
  const validStatuses = ['pending', 'approved', 'rejected', 'deleted'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: '无效的状态值' });
  }

  // 如果状态是 rejected，必须提供 rejection_reason
  if (status === 'rejected' && (!rejection_reason || rejection_reason.trim() === '')) {
    return res.status(400).json({ error: '拒绝原因不能为空' });
  }

  try {
    // 查找并更新帖子状态
    const diary = await Diary.findByPk(id);
    if (!diary) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    diary.status = status;
    if (status === 'rejected') {
      diary.rejection_reason = rejection_reason; // 更新拒绝原因
    } else {
      diary.rejection_reason = null; // 如果不是 rejected，清空拒绝原因
    }
    await diary.save();

    res.json({ message: '状态更新成功', diary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
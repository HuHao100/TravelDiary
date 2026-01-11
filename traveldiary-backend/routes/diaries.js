const express = require('express');
const sequelize = require('../config/db');
const { Op } = require('sequelize');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Diary, User, DiaryImage, DiaryVideo, DiaryComment, DiaryLike } = require('../models');

// 获取当前用户日记
router.get('/getMy', async (req, res) => {
  try {
    const diaries = await Diary.findAll({
      where: { 
        status: { 
          [Op.ne]: 'deleted'
        } 
      },
        include: [{
          model: DiaryImage,
          attributes: ['image_url'],
          limit: 1, // 只取第一张图片
          required: false // 允许无图片
        }],
        order: [['created_at', 'DESC']]
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
      ? `${diary.DiaryImages[0].image_url}` // 添加完整路径前缀
      : '/diary_images/default.png', // 直接返回默认图路径

      created_at: diary.created_at
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: '获取游记失败' });
  }
});

// 获取所有日记
router.get('/getAll', async (req, res) => {
  try {
    const diaries = await Diary.findAll({
      where: { 
        status: {
          [Op.notIn]: ['deleted', 'rejected']
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
      }
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取游记失败' });
  }
});

// 获取已删除状态的日记（管理员使用）
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

// 搜索游记（按标题和内容）
router.get('/search/query', async (req, res) => {
  try {
    const keyword = req.query.keyword || '';
    
    if (!keyword.trim()) {
      return res.status(400).json({ error: '搜索关键词不能为空' });
    }

    const diaries = await Diary.findAll({
      where: { 
        status: {
          [Op.notIn]: ['deleted', 'rejected']
        },
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${keyword}%`
            }
          },
          {
            content: {
              [Op.like]: `%${keyword}%`
            }
          }
        ]
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
    res.status(500).json({ error: '搜索游记失败' });
  }
});

// 按点赞数排序获取游记
router.get('/sorted/byLikes', async (req, res) => {
  try {
    const diaries = await Diary.findAll({
      where: { 
        status: {
          [Op.notIn]: ['deleted', 'rejected']
        } 
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
        },
        {
          model: DiaryLike,
          attributes: [],
          required: false
        }
      ],
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('DiaryLikes.id')), 'likeCount']
        ]
      },
      group: ['Diary.id'],
      raw: false,
      subQuery: false,
      order: [[sequelize.literal('likeCount'), 'DESC']]
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
      likeCount: parseInt(diary.dataValues.likeCount) || 0
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取游记失败' });
  }
});

// 按发布时间排序获取游记（从新到旧）
router.get('/sorted/byTime', async (req, res) => {
  try {
    const diaries = await Diary.findAll({
      where: { 
        status: {
          [Op.notIn]: ['deleted', 'rejected']
        } 
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
    res.status(500).json({ error: '获取游记失败' });
  }
});

// 更新游记状态（审核/删除/恢复）
router.patch('/updateStatus/:id', async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;
    const validStatus = ['pending', 'approved', 'rejected', 'deleted'];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: '非法的状态值' });
    }

    const diary = await Diary.findByPk(req.params.id);
    if (!diary) {
      return res.status(404).json({ error: '游记不存在' });
    }

    diary.status = status;

    // 如果是拒绝，记录拒绝原因；其他状态清空拒绝原因
    if (status === 'rejected') {
      diary.rejection_reason = rejection_reason || '';
    } else {
      diary.rejection_reason = null;
    }

    await diary.save();

    res.json({
      success: true,
      id: diary.id,
      status: diary.status,
      rejection_reason: diary.rejection_reason
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '更新游记状态失败' });
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

    console.log(response)
    res.json(response);
  } catch (err) {
    console.error('Error fetching diary:', err);
    res.status(500).json({ error: '获取游记详情失败', details: err.message });
  }
});

// 删除
router.delete('/:id', async (req, res) => {
  try {
    // 直接删除记录
    await Diary.destroy({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

//----------------------------------------------------------------------------

const storageImages = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/diary_images/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const storageVideo = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/diary_videos/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});


const uploadImages = multer({ storage: storageImages }).array('images');
const uploadVideo = multer({ storage: storageVideo }).single('video');

router.post('/publish', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    console.log('收到发布请求，body:', req.body);
    const { userId, title, content } = req.body;

    // 验证必填字段
    if (!userId || !title || !content) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: '缺少必填字段',
        missing: {
          userId: !userId,
          title: !title,
          content: !content
        }
      });
    }

    const diary = await Diary.create({
      user_id: userId,
      title,
      content,
      status: 'pending'
    }, { transaction });

    await transaction.commit();
    console.log('游记创建成功，ID:', diary.id);
    res.status(201).json({ 
      diaryId: diary.id,
      message: '游记创建成功，待审核' 
    });
  } catch (error) {
    console.error('创建游记失败:', error);
    await transaction.rollback();
    res.status(500).json({ 
      error: '创建游记失败',
      details: error.message 
    });
  }
});

// 图片上传接口
router.post('/uploadImages', uploadImages, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const diaryId = req.body.diaryId;
    console.log('收到图片上传请求，diaryId:', diaryId, '文件数量:', req.files?.length);
    
    if (!diaryId) {
      await transaction.rollback();
      return res.status(400).json({ error: 'diaryId不能为空' });
    }
    
    if (req.files?.length) {
      const images = req.files.map((file) => ({
        diary_id: diaryId,
        image_url: `/diary_images/${file.filename}`,
        sort_order: 0
      }));
      
      await DiaryImage.bulkCreate(images, { transaction });
    }

    await transaction.commit();
    console.log('图片上传成功');
    res.json({ message: '图片上传成功' });
  } catch (error) {
    console.error('图片上传失败:', error);
    await transaction.rollback();
    res.status(500).json({ error: '图片上传失败', details: error.message });
  }
});

// 视频上传接口
router.post('/uploadVideo', uploadVideo, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { diaryId } = req.body;
    console.log('收到视频上传请求，diaryId:', diaryId, '文件:', req.file?.filename);  

    if (!diaryId) {
      await transaction.rollback();
      return res.status(400).json({ error: 'diaryId不能为空' });
    }

    if (req.file) {
      await DiaryVideo.create({
        diary_id: diaryId,
        video_url: `/diary_videos/${req.file.filename}`
      }, { transaction });
    }

    await transaction.commit();
    console.log('视频上传成功');
    res.json({ message: '视频上传成功' });
  } catch (error) {
    console.error('视频上传失败:', error);
    await transaction.rollback();
    res.status(500).json({ error: '视频上传失败', details: error.message });
  }
});

module.exports = router;
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
    const { userId, title, content } = req.body;

    const diary = await Diary.create({
      user_id: userId,
      title,
      content,
      status: 'pending'
    }, { transaction });

    await transaction.commit();
    console.log(diary.id);
    res.status(201).json({ 
      diaryId: diary.id,
      message: '游记创建成功，待审核' 
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: '创建游记失败' });
  }
});

// 图片上传接口
router.post('/uploadImages', uploadImages, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const diaryId = req.body.diaryId;
    
    if (req.files?.length) {
      const images = req.files.map((file) => ({
        diary_id: diaryId,
        image_url: `/diary_images/${file.filename}`,
        sort_order: 0
      }));
      
      await DiaryImage.bulkCreate(images, { transaction });
    }

    await transaction.commit();
    res.json({ message: '图片上传成功' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: '图片上传失败' });
  }
});

// 视频上传接口
router.post('/uploadVideo', uploadVideo, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { diaryId } = req.body;
    console.log('Received video file:', req.file);  

    if (req.file) {
      await DiaryVideo.create({
        diary_id: diaryId,
        video_url: `/diary_videos/${req.file.filename}`
      }, { transaction });
    }

    await transaction.commit();
    res.json({ message: '视频上传成功' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: '视频上传失败' });
  }
});

module.exports = router;
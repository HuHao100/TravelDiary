'use strict';

// Mock the database config before any model or route is loaded
const mockTransaction = {
  commit: jest.fn().mockResolvedValue(undefined),
  rollback: jest.fn().mockResolvedValue(undefined)
};

jest.mock('../config/db', () => ({
  define: jest.fn().mockReturnValue({}),
  sync: jest.fn().mockResolvedValue(undefined),
  transaction: jest.fn().mockResolvedValue(mockTransaction),
  fn: jest.fn((name, col) => `${name}(${col})`),
  col: jest.fn((col) => col),
  literal: jest.fn((val) => val),
  Op: {}
}));

jest.mock('sequelize', () => {
  const actual = jest.requireActual('sequelize');
  return { ...actual, DataTypes: actual.DataTypes };
});

// Mock multer to avoid filesystem access during tests
jest.mock('multer', () => {
  const multerMock = () => ({
    single: () => (req, res, next) => next(),
    array: () => (req, res, next) => next()
  });
  multerMock.diskStorage = jest.fn().mockReturnValue({});
  return multerMock;
});

jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

// Build mockable model objects
const mockDiaryInstance = {
  id: 1,
  user_id: 10,
  title: 'Test Diary',
  content: 'Test content',
  status: 'pending',
  rejection_reason: null,
  save: jest.fn().mockResolvedValue(undefined)
};

jest.mock('../models', () => ({
  User: { findOne: jest.fn(), create: jest.fn() },
  Diary: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  },
  DiaryImage: { bulkCreate: jest.fn() },
  DiaryVideo: { create: jest.fn() },
  DiaryComment: {},
  DiaryLike: {}
}));

const express = require('express');
const request = require('supertest');
const { Diary, DiaryImage, DiaryVideo } = require('../models');
const db = require('../config/db');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/diaries', require('../routes/diaries'));

// Helper: a minimal diary with associations
function makeDiary(overrides = {}) {
  return {
    id: 1,
    user_id: 10,
    title: 'Title',
    content: 'Content',
    status: 'pending',
    rejection_reason: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    DiaryImages: [],
    DiaryVideo: null,
    DiaryLikes: [],
    DiaryComments: [],
    User: { id: 10, nickname: 'Alice', avatar_url: '/avatars/alice.png' },
    dataValues: { likeCount: 0 },
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  // Re-establish default transaction mock after clearAllMocks
  db.transaction.mockResolvedValue(mockTransaction);
  mockTransaction.commit.mockResolvedValue(undefined);
  mockTransaction.rollback.mockResolvedValue(undefined);
});

// ──────────────────────────────────────────────────
// GET /api/diaries/getMy
// ──────────────────────────────────────────────────
describe('GET /api/diaries/getMy', () => {
  it('returns a formatted list of non-deleted diaries', async () => {
    const diary = makeDiary({ DiaryImages: [{ image_url: '/diary_images/img1.jpg' }] });
    Diary.findAll.mockResolvedValueOnce([diary]);

    const res = await request(app).get('/api/diaries/getMy');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      id: 1,
      title: 'Title',
      status: 'pending',
      image_url: '/diary_images/img1.jpg'
    });
  });

  it('uses default image when no DiaryImages exist', async () => {
    const diary = makeDiary({ DiaryImages: [] });
    Diary.findAll.mockResolvedValueOnce([diary]);

    const res = await request(app).get('/api/diaries/getMy');

    expect(res.status).toBe(200);
    expect(res.body[0].image_url).toBe('/diary_images/default.png');
  });

  it('returns 500 on database error', async () => {
    Diary.findAll.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/diaries/getMy');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('获取游记失败');
  });
});

// ──────────────────────────────────────────────────
// GET /api/diaries/getAll
// ──────────────────────────────────────────────────
describe('GET /api/diaries/getAll', () => {
  it('returns formatted diaries with user info', async () => {
    const diary = makeDiary({ status: 'approved' });
    Diary.findAll.mockResolvedValueOnce([diary]);

    const res = await request(app).get('/api/diaries/getAll');

    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({
      user_id: 10,
      title: 'Title',
      user: { nickname: 'Alice', avatar_url: '/avatars/alice.png' }
    });
  });

  it('returns 500 on database error', async () => {
    Diary.findAll.mockRejectedValueOnce(new Error('fail'));

    const res = await request(app).get('/api/diaries/getAll');

    expect(res.status).toBe(500);
  });
});

// ──────────────────────────────────────────────────
// GET /api/diaries/getDeleted
// ──────────────────────────────────────────────────
describe('GET /api/diaries/getDeleted', () => {
  it('returns deleted diaries with user info', async () => {
    const diary = makeDiary({ status: 'deleted' });
    Diary.findAll.mockResolvedValueOnce([diary]);

    const res = await request(app).get('/api/diaries/getDeleted');

    expect(res.status).toBe(200);
    expect(res.body[0].status).toBe('deleted');
  });

  it('returns 500 on database error', async () => {
    Diary.findAll.mockRejectedValueOnce(new Error('fail'));

    const res = await request(app).get('/api/diaries/getDeleted');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('获取已删除游记失败');
  });
});

// ──────────────────────────────────────────────────
// GET /api/diaries/search/query
// ──────────────────────────────────────────────────
describe('GET /api/diaries/search/query', () => {
  it('returns 400 when keyword is empty', async () => {
    const res = await request(app).get('/api/diaries/search/query?keyword=');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('搜索关键词不能为空');
  });

  it('returns 400 when keyword is only whitespace', async () => {
    const res = await request(app).get('/api/diaries/search/query?keyword=   ');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('搜索关键词不能为空');
  });

  it('returns matching diaries when keyword is provided', async () => {
    const diary = makeDiary({ status: 'approved' });
    Diary.findAll.mockResolvedValueOnce([diary]);

    const res = await request(app).get('/api/diaries/search/query?keyword=travel');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('returns 500 on database error', async () => {
    Diary.findAll.mockRejectedValueOnce(new Error('fail'));

    const res = await request(app).get('/api/diaries/search/query?keyword=travel');

    expect(res.status).toBe(500);
  });
});

// ──────────────────────────────────────────────────
// GET /api/diaries/sorted/byTime
// ──────────────────────────────────────────────────
describe('GET /api/diaries/sorted/byTime', () => {
  it('returns diaries with created_at field', async () => {
    const diary = makeDiary({ status: 'approved', created_at: '2024-06-01' });
    Diary.findAll.mockResolvedValueOnce([diary]);

    const res = await request(app).get('/api/diaries/sorted/byTime');

    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty('created_at');
  });
});

// ──────────────────────────────────────────────────
// PATCH /api/diaries/updateStatus/:id
// ──────────────────────────────────────────────────
describe('PATCH /api/diaries/updateStatus/:id', () => {
  it('returns 400 for an invalid status value', async () => {
    const res = await request(app)
      .patch('/api/diaries/updateStatus/1')
      .send({ status: 'unknown_status' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('非法的状态值');
  });

  it('returns 404 when diary does not exist', async () => {
    Diary.findByPk.mockResolvedValueOnce(null);

    const res = await request(app)
      .patch('/api/diaries/updateStatus/999')
      .send({ status: 'approved' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('游记不存在');
  });

  it('approves a diary and clears rejection_reason', async () => {
    const diary = {
      id: 1,
      status: 'pending',
      rejection_reason: 'old reason',
      save: jest.fn().mockResolvedValue(undefined)
    };
    Diary.findByPk.mockResolvedValueOnce(diary);

    const res = await request(app)
      .patch('/api/diaries/updateStatus/1')
      .send({ status: 'approved' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
    expect(diary.rejection_reason).toBeNull();
    expect(diary.save).toHaveBeenCalled();
  });

  it('rejects a diary and sets rejection_reason', async () => {
    const diary = {
      id: 2,
      status: 'pending',
      rejection_reason: null,
      save: jest.fn().mockResolvedValue(undefined)
    };
    Diary.findByPk.mockResolvedValueOnce(diary);

    const res = await request(app)
      .patch('/api/diaries/updateStatus/2')
      .send({ status: 'rejected', rejection_reason: 'Contains inappropriate content' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('rejected');
    expect(diary.rejection_reason).toBe('Contains inappropriate content');
  });

  it('marks diary as deleted', async () => {
    const diary = {
      id: 3,
      status: 'approved',
      rejection_reason: null,
      save: jest.fn().mockResolvedValue(undefined)
    };
    Diary.findByPk.mockResolvedValueOnce(diary);

    const res = await request(app)
      .patch('/api/diaries/updateStatus/3')
      .send({ status: 'deleted' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('deleted');
  });

  it('returns 500 on unexpected error', async () => {
    Diary.findByPk.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .patch('/api/diaries/updateStatus/1')
      .send({ status: 'approved' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('更新游记状态失败');
  });
});

// ──────────────────────────────────────────────────
// GET /api/diaries/:id
// ──────────────────────────────────────────────────
describe('GET /api/diaries/:id', () => {
  it('returns 404 when diary is not found', async () => {
    Diary.findByPk.mockResolvedValueOnce(null);

    const res = await request(app).get('/api/diaries/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('游记不存在');
  });

  it('returns full diary detail on success', async () => {
    const diary = makeDiary({
      status: 'approved',
      DiaryImages: [{ image_url: '/diary_images/img1.jpg' }],
      DiaryLikes: [{ user_id: 2 }],
      DiaryComments: [
        {
          id: 10,
          content: 'Great post!',
          created_at: '2024-01-02',
          User: { nickname: 'Bob', avatar_url: '/avatars/bob.png' }
        }
      ]
    });
    Diary.findByPk.mockResolvedValueOnce(diary);

    const res = await request(app).get('/api/diaries/1');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      title: 'Title',
      likes: 1
    });
    expect(res.body.comments).toHaveLength(1);
    expect(res.body.comments[0].content).toBe('Great post!');
    expect(res.body.author.nickname).toBe('Alice');
  });

  it('returns 500 on database error', async () => {
    Diary.findByPk.mockRejectedValueOnce(new Error('fail'));

    const res = await request(app).get('/api/diaries/1');

    expect(res.status).toBe(500);
  });
});

// ──────────────────────────────────────────────────
// DELETE /api/diaries/:id
// ──────────────────────────────────────────────────
describe('DELETE /api/diaries/:id', () => {
  it('deletes a diary and returns success', async () => {
    Diary.destroy.mockResolvedValueOnce(1);

    const res = await request(app).delete('/api/diaries/1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Diary.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('returns 500 on delete failure', async () => {
    Diary.destroy.mockRejectedValueOnce(new Error('fail'));

    const res = await request(app).delete('/api/diaries/1');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('删除失败');
  });
});

// ──────────────────────────────────────────────────
// POST /api/diaries/publish
// ──────────────────────────────────────────────────
describe('POST /api/diaries/publish', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/diaries/publish')
      .send({ userId: 1 }); // missing title and content

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('缺少必填字段');
    expect(res.body.missing.title).toBe(true);
    expect(res.body.missing.content).toBe(true);
  });

  it('creates a diary and returns 201 on success', async () => {
    Diary.create.mockResolvedValueOnce({ id: 99 });

    const res = await request(app)
      .post('/api/diaries/publish')
      .send({ userId: 1, title: 'My Trip', content: 'Day 1 ...' });

    expect(res.status).toBe(201);
    expect(res.body.diaryId).toBe(99);
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('rolls back and returns 500 on create error', async () => {
    Diary.create.mockRejectedValueOnce(new Error('insert fail'));

    const res = await request(app)
      .post('/api/diaries/publish')
      .send({ userId: 1, title: 'My Trip', content: 'Day 1 ...' });

    expect(res.status).toBe(500);
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────────
// POST /api/diaries/uploadImages
// ──────────────────────────────────────────────────
describe('POST /api/diaries/uploadImages', () => {
  it('returns 400 when diaryId is missing', async () => {
    const res = await request(app)
      .post('/api/diaries/uploadImages')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('diaryId不能为空');
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('returns success when diaryId is provided', async () => {
    const res = await request(app)
      .post('/api/diaries/uploadImages')
      .send({ diaryId: '5' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('图片上传成功');
    expect(mockTransaction.commit).toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────────
// POST /api/diaries/uploadVideo
// ──────────────────────────────────────────────────
describe('POST /api/diaries/uploadVideo', () => {
  it('returns 400 when diaryId is missing', async () => {
    const res = await request(app)
      .post('/api/diaries/uploadVideo')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('diaryId不能为空');
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('returns success when diaryId is provided but no file', async () => {
    const res = await request(app)
      .post('/api/diaries/uploadVideo')
      .send({ diaryId: '5' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('视频上传成功');
  });
});

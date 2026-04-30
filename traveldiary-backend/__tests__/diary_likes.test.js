'use strict';

jest.mock('../config/db', () => ({
  define: jest.fn().mockReturnValue({}),
  sync: jest.fn().mockResolvedValue(undefined),
  transaction: jest.fn(),
  fn: jest.fn(),
  col: jest.fn(),
  literal: jest.fn()
}));

jest.mock('sequelize', () => {
  const actual = jest.requireActual('sequelize');
  return { ...actual, DataTypes: actual.DataTypes };
});

jest.mock('../models', () => ({
  DiaryLike: {
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
  },
  User: {},
  Diary: {}
}));

const express = require('express');
const request = require('supertest');
const { DiaryLike } = require('../models');

const app = express();
app.use(express.json());
app.use('/api/likes', require('../routes/diary_likes'));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/likes/:diaryId', () => {
  it('creates a new like when none exists and returns updated count', async () => {
    DiaryLike.findOne.mockResolvedValueOnce(null);
    DiaryLike.create.mockResolvedValueOnce({ id: 1, user_id: 5, diary_id: 10 });
    DiaryLike.count.mockResolvedValueOnce(3);

    const res = await request(app)
      .post('/api/likes/10')
      .send({ userId: 5 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(3);
    expect(DiaryLike.create).toHaveBeenCalledWith({ user_id: 5, diary_id: '10' });
  });

  it('removes an existing like (toggle off) and returns updated count', async () => {
    const existingLike = { destroy: jest.fn().mockResolvedValue(undefined) };
    DiaryLike.findOne.mockResolvedValueOnce(existingLike);
    DiaryLike.count.mockResolvedValueOnce(2);

    const res = await request(app)
      .post('/api/likes/10')
      .send({ userId: 5 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(2);
    expect(existingLike.destroy).toHaveBeenCalled();
    expect(DiaryLike.create).not.toHaveBeenCalled();
  });

  it('returns 500 on unexpected database error', async () => {
    DiaryLike.findOne.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/api/likes/10')
      .send({ userId: 5 });

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

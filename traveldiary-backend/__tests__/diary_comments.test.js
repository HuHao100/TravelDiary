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
  DiaryComment: {
    create: jest.fn(),
    findByPk: jest.fn()
  },
  User: {},
  Diary: {}
}));

const express = require('express');
const request = require('supertest');
const { DiaryComment } = require('../models');

const app = express();
app.use(express.json());
app.use('/api/comments', require('../routes/diary_comments'));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/comments/:diaryId', () => {
  it('creates a comment and returns it with user info', async () => {
    DiaryComment.create.mockResolvedValueOnce({ id: 7 });
    DiaryComment.findByPk.mockResolvedValueOnce({
      id: 7,
      content: 'Beautiful scenery!',
      created_at: '2024-06-15T10:00:00Z',
      User: {
        id: 3,
        nickname: 'Charlie',
        avatar_url: '/avatars/charlie.png'
      }
    });

    const res = await request(app)
      .post('/api/comments/42')
      .send({ content: 'Beautiful scenery!', userId: 3 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 7,
      user: 'Charlie',
      avatar: '/avatars/charlie.png',
      content: 'Beautiful scenery!'
    });
    expect(res.body.created_at).toBeDefined();
    expect(DiaryComment.create).toHaveBeenCalledWith({
      diary_id: '42',
      user_id: 3,
      content: 'Beautiful scenery!'
    });
  });

  it('returns 500 on database error', async () => {
    DiaryComment.create.mockRejectedValueOnce(new Error('insert failed'));

    const res = await request(app)
      .post('/api/comments/42')
      .send({ content: 'Nice!', userId: 3 });

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

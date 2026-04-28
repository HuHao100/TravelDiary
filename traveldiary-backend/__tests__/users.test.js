'use strict';

// Mock the database config before models are loaded
jest.mock('../config/db', () => ({
  define: jest.fn().mockReturnValue({}),
  sync: jest.fn().mockResolvedValue(undefined),
  transaction: jest.fn(),
  fn: jest.fn(),
  col: jest.fn(),
  literal: jest.fn()
}));

// Mock Sequelize so model definitions don't try to connect
jest.mock('sequelize', () => {
  const actual = jest.requireActual('sequelize');
  return { ...actual, DataTypes: actual.DataTypes };
});

// Mock multer to avoid filesystem writes during tests
jest.mock('multer', () => {
  const multerMock = () => ({
    single: () => (req, res, next) => next(),
    array: () => (req, res, next) => next()
  });
  multerMock.diskStorage = jest.fn().mockReturnValue({});
  return multerMock;
});

// Mock uuid to produce predictable filenames
jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

// Mock the models module
jest.mock('../models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn()
  },
  Diary: {},
  DiaryComment: {},
  DiaryImage: {},
  DiaryLike: {},
  DiaryVideo: {}
}));

const express = require('express');
const request = require('supertest');
const { User } = require('../models');

// Build a minimal Express app that mounts the users router
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/users', require('../routes/users'));

describe('POST /api/users/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser' }); // missing password and nickname

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('请填写完整信息');
  });

  it('returns 400 when username is already taken', async () => {
    User.findOne.mockResolvedValueOnce({ id: 1, username: 'existing' });

    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'existing', password: 'pass123', nickname: 'Nick' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('该用户名已被使用');
  });

  it('creates a new user and returns 201 on success', async () => {
    User.findOne.mockResolvedValueOnce(null);
    User.create.mockResolvedValueOnce({
      id: 42,
      username: 'newuser',
      nickname: 'NewNick',
      avatar_url: '/avatars/default.png'
    });

    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'newuser', password: 'pass123', nickname: 'NewNick' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 42,
      username: 'newuser',
      nickname: 'NewNick',
      avatar_url: '/avatars/default.png'
    });
  });

  it('returns 500 when an unexpected error occurs', async () => {
    User.findOne.mockRejectedValueOnce(new Error('DB connection lost'));

    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'u', password: 'p', nickname: 'n' });

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/注册失败/);
  });
});

describe('POST /api/users/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user does not exist', async () => {
    User.findOne.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'ghost', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('用户名或密码错误');
  });

  it('returns 401 when password does not match', async () => {
    User.findOne.mockResolvedValueOnce({
      id: 1,
      username: 'alice',
      password: 'correctpass',
      nickname: 'Alice',
      avatar_url: '/avatars/alice.png'
    });

    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'alice', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('用户名或密码错误');
  });

  it('returns user data on successful login', async () => {
    User.findOne.mockResolvedValueOnce({
      id: 5,
      username: 'alice',
      password: 'secret',
      nickname: 'Alice',
      avatar_url: '/avatars/alice.png'
    });

    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'alice', password: 'secret' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 5,
      username: 'alice',
      nickname: 'Alice',
      avatar_url: '/avatars/alice.png'
    });
    // Password must not be returned
    expect(res.body.password).toBeUndefined();
  });

  it('returns 500 on unexpected database error', async () => {
    User.findOne.mockRejectedValueOnce(new Error('query timeout'));

    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'alice', password: 'secret' });

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/登录失败/);
  });
});

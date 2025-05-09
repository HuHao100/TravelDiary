const User = require('./users');
const Diary = require('./diaries');
const DiaryComment = require('./diary_comments');
const DiaryImage = require('./diary_images');
const DiaryLike = require('./diary_likes');
const DiaryVideo = require('./diary_videos');

// 用户与日记
User.hasMany(Diary, { foreignKey: 'user_id' });
Diary.belongsTo(User, { foreignKey: 'user_id' });

// 日记与评论
Diary.hasMany(DiaryComment, { foreignKey: 'diary_id' });
DiaryComment.belongsTo(Diary, { foreignKey: 'diary_id' });

// 用户与评论
User.hasMany(DiaryComment, { foreignKey: 'user_id' });
DiaryComment.belongsTo(User, { foreignKey: 'user_id' });

// 评论的父子关系
DiaryComment.hasMany(DiaryComment, { as: 'Replies', foreignKey: 'parent_id' });
DiaryComment.belongsTo(DiaryComment, { as: 'Parent', foreignKey: 'parent_id' });

// 日记与图片
Diary.hasMany(DiaryImage, { foreignKey: 'diary_id' });
DiaryImage.belongsTo(Diary, { foreignKey: 'diary_id' });

// 日记与点赞
Diary.hasMany(DiaryLike, { foreignKey: 'diary_id' });
DiaryLike.belongsTo(Diary, { foreignKey: 'diary_id' });

// 用户与点赞
User.hasMany(DiaryLike, { foreignKey: 'user_id' });
DiaryLike.belongsTo(User, { foreignKey: 'user_id' });

// 日记与视频
Diary.hasOne(DiaryVideo, { foreignKey: 'diary_id' });
DiaryVideo.belongsTo(Diary, { foreignKey: 'diary_id' });

module.exports = {
  User,
  Diary,
  DiaryComment,
  DiaryImage,
  DiaryLike,
  DiaryVideo
};
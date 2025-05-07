import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Image, ImageViewer, List, Button, Toast, Input } from 'antd-mobile';
import { MessageFill, HeartOutline, HeartFill, LeftOutline } from 'antd-mobile-icons'
import { FaShare } from 'react-icons/fa';

// Mock数据
const detailData = {
  id: 1,
  author: {
    avatar: 'https://picsum.photos/50',
    nickname: '旅行达人小王'
  },
  content: '这是一篇详细的游记内容，包含美丽的风景描述和旅行建议...6666666666666666666666666666',
  media: [
    { type: 'video', url: 'https://example.com/video.mp4' },
    { type: 'image', url: 'https://picsum.photos/300/400' },
    { type: 'image', url: 'https://picsum.photos/300/401' }
  ],
  likes: 123,
  comments: [
    { id: 1, user: '用户A', avatar: 'https://picsum.photos/30', content: '很棒！' },
    { id: 2, user: '用户B', avatar: 'https://picsum.photos/31', content: '我也想去！' }
  ]
};

export default function Details() {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(detailData.likes);
  const [comments, setComments] = useState(detailData.comments);
  const [commentText, setCommentText] = useState('');
  const [imageVisible, setImageVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // 隐藏导航栏
  useEffect(() => {
    const navBar = document.querySelector('.bottom-nav');
    if (navBar) navBar.style.display = 'none';
    return () => {
      if (navBar) navBar.style.display = 'flex';
    };
  }, []);

  // 点赞处理
  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  // 提交评论
  const handleComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      user: '当前用户',
      avatar: 'https://picsum.photos/32',
      content: commentText
    };
    setComments([...comments, newComment]);
    setCommentText('');
    Toast.show('评论成功');
  };

  // 媒体查看处理
  const openImageViewer = (index) => {
    if (detailData.media[index].type === 'video') {
      const videoUrl = detailData.media[index].url;
      window.open(videoUrl, '_blank'); // 更可靠的视频播放方式
    } else {
      setActiveIndex(index);
      setImageVisible(true);
    }
  };

  return (
    <div style={styles.container}>
      {/* 导航栏 */}
      <NavBar
        left={<LeftOutline fontSize={20} />}
        onBack={() => navigate('/')}
        style={styles.navBar}
      />

      {/* 内容区域 */}
      <div style={styles.content}>
        {/* 作者信息 */}
        <div style={styles.authorInfo}>
          <Image src={detailData.author.avatar} style={styles.avatar} />
          <span style={styles.nickname}>{detailData.author.nickname}</span>
        </div>

        {/* 媒体展示 */}
        <div style={styles.mediaContainer}>
          {detailData.media.map((item, index) => (
            <div
              key={index}
              style={styles.mediaItem}
              onClick={() => openImageViewer(index)}
            >
              {item.type === 'video' && (
                <div style={styles.videoTag}>视频</div>
              )}
              <Image src={item.url} style={styles.media} />
            </div>
          ))}
        </div>

        {/* 游记内容 */}
        <div style={styles.textContent}>{detailData.content}</div>

        {/* 互动操作 */}
        <div style={styles.actions}>

          <Button shape='rounded' onClick={handleLike}>
            {liked ? <HeartFill color='var(--adm-color-danger)' /> : <HeartOutline />}
            {likeCount}
          </Button>

          <Button shape='rounded'>
            <MessageFill /> {comments.length}
          </Button>


          {/* 分享功能需完善 */}
          <Button shape = "rectangular"
            onClick={() => Toast.show('还没做')}>
             <FaShare size={24} color="#333" />
             分享
          </Button>


          
          <Input
            style={styles.commentInput}
            placeholder='分享你的看法'
            value={commentText}
            onChange={setCommentText}
            onEnterPress={handleComment}
          />
        </div>

        {/* 评论列表 */}
        <List header='全部评论'>
          {comments.map(comment => (
            <List.Item
              key={comment.id}
              prefix={<Image src={comment.avatar} style={styles.commentAvatar} />}
              description={comment.content}
            >
              {comment.user}
            </List.Item>
          ))}
        </List>
      </div>

      {/* 图片查看器 */}
      <ImageViewer
        imageUrls={detailData.media.filter(m => m.type === 'image').map(m => m.url)}
        visible={imageVisible}
        onClose={() => setImageVisible(false)}
        index={activeIndex}
      />
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    overflow: 'auto',
    backgroundColor: '#fff'
  },
  navBar: {
    '--height': '45px',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  content: {
    padding: '0 12px'
  },
  authorInfo: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    marginRight: 12
  },
  nickname: {
    fontSize: 16,
    fontWeight: 500
  },
  mediaContainer: {
    height: '300px',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    marginBottom: 12
  },
  mediaItem: {
    display: 'inline-block',
    width: '100%',
    height: 300,
    position: 'relative',
    marginRight: 12
  },
  media: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 8
  },
  videoTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: 4,
    zIndex: 10
  },
  textContent: {
    lineHeight: 1.6,
    marginBottom: 16
  },
  actions: {
    display: 'flex',
    gap: 8,
    marginBottom: 16
  },
  commentInput: {
    flex: 1,
    '--padding-left': '12px',
    marginLeft: 'auto'
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: '50%'
  }
};
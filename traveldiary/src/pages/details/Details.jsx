import React, { useState, useEffect } from 'react';
import { NavBar, Image, List, Button, Toast, Input, ImageViewer } from 'antd-mobile';
import { MessageFill, HeartFill, LeftOutline } from 'antd-mobile-icons'
import { FaShare } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config';

const getVideoThumbnail = (videoUrl) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous'; // 处理跨域问题
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      video.currentTime = 0.1; // 设置到开始位置
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      resolve(dataUrl);
    };

    video.onerror = () => {
      resolve(`${API_BASE_URL}/avatars/default.png`); // 失败时使用默认封面
    };

    video.src = videoUrl;
  });
};

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detailData, setDetailData] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [videoVisible, setVideoVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/diaries/${id}`);
        const data = response.data;

        if (!data.author || !Array.isArray(data.media)) {
          throw new Error('接口返回数据格式异常');
        }
        
        const media = await Promise.all(data.media.map(async item => {
          const baseItem = {
            ...item,
            url: item.url.startsWith('http') ? item.url : `${API_BASE_URL}${item.url}`
          };
        
          if (item.type === 'video') {
            try {
              const thumbnail = await getVideoThumbnail(baseItem.url);
              return { ...baseItem, thumbnail };
            } catch (error) {
              return { ...baseItem, thumbnail: `${API_BASE_URL}/default-video-thumb.jpg` };
            }
          }
          return baseItem;
        }));

        const fetchLikeStatus = async () => {
          try {
            const likeRes = await axios.get(
              `${API_BASE_URL}/likes/${id}/status?userId=${user.id}`
            );
            setLiked(likeRes.data.liked);
          } catch (error) {
            console.warn('获取点赞状态失败:', error);
          }
        };

        if (user) await fetchLikeStatus();
  
        setDetailData({
          ...data,
          media
        });
        setLikeCount(data.likes);
        setComments(data.comments);
      } catch (error) {
        Toast.show('加载游记失败');
        navigate(-1);
      }
    };

    fetchData();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      Toast.show('请先登录');
      return;
    }
  
    try {
      const response = await axios.post(`${API_BASE_URL}/likes/${id}`, {
        userId: user.id
      });
  
      setLiked(!liked);
      setLikeCount(response.data.count);
      
      const likeBtn = document.querySelector('.like-button');
      likeBtn.style.animation = 'likeScale 0.6s ease';
      setTimeout(() => {
        likeBtn.style.animation = '';
      }, 600);
    } catch (error) {
      Toast.show('操作失败');
    }
  };

  const handleComment = async () => {
    if (!user) {
      Toast.show('请先登录');
      return;
    }
  
    if (!commentText.trim()) {
      Toast.show('评论内容不能为空');
      return;
    }
  
    try {
      const response = await axios.post(`${API_BASE_URL}/comments/${id}`, {
        content: commentText,
        userId: user.id
      });
  
      setComments([...comments, {
        ...response.data,
        created_at: new Date().toISOString(),
        user: user.nickname,
        avatar: user.avatar_url
      }]);
      setCommentText('');
      Toast.show('评论成功');
    } catch (error) {
      Toast.show('评论失败');
    }
  };

  const handleMediaClick = (index) => {
    const item = detailData.media[index];
    if (item.type === 'video') {
      setCurrentVideoUrl(item.url);
      setVideoVisible(true);
    } else {
      // 计算实际图片索引
      const imageIndex = detailData.media
        .slice(0, index + 1)
        .filter(m => m.type === 'image').length - 1;
        
      setCurrentImageIndex(imageIndex);
      setImageViewerVisible(true);
    }
  };

  if (!detailData) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        fontSize: '0.32rem',
        color: '#666'
      }}>
        正在加载游记详情...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <NavBar
        backArrow={<LeftOutline fontSize={20} />}
        onBack={() => navigate('/')}
        style={styles.navBar}
      />

      <div style={styles.content}>
        <div style={styles.authorInfo}>
            <Image src={
              detailData.author.avatar.startsWith('http') 
              ? detailData.author.avatar 
              : `${API_BASE_URL}${detailData.author.avatar}`
            } style={styles.avatar} />
            <span style={styles.nickname}>{detailData.author?.nickname || '未知用户'}</span>
        </div>
        
        <h2 style={styles.title}>{detailData?.title}</h2>
      
      {detailData?.media?.length > 0 && (
        <div style={styles.mediaContainer}>
            {detailData.media.map((item, index) => (
              <div
                key={index}
                style={styles.mediaItem}
                onClick={() => handleMediaClick(index)}
              >
                {item.type === 'video' && (
                  <div style={styles.videoTag}>
                    视频
                  </div>
                )}
                <Image
                  src={item.type === 'video' ? item.thumbnail : item.url}
                  style={styles.media}
                  onClick={() => handleMediaClick(index)}
                />
              </div>
            ))}
        </div>
      )}

        <div style={{
          ...styles.textContent,
          marginTop: detailData?.media?.length ? 0 : '-16px' // 当没有媒体时上移
        }}>
          {detailData?.content || '暂无内容'}
        </div>

        <div style={styles.actions}>
          <Button 
            shape='rounded' 
            onClick={handleLike}
            className="like-button"
            style={styles.actionButton}
          >
            <HeartFill color={liked ? 'var(--adm-color-danger)' : undefined} />
            <span style={{ marginLeft: 4 }}>{likeCount}</span>
          </Button>

          <Button 
            shape='rounded'
            style={styles.actionButton}
          >
            <MessageFill />
            <span style={{ marginLeft: 4 }}>{comments.length}</span>
          </Button>

          <Button 
            shape='rounded'
            onClick={() => Toast.show('分享功能暂未实现')}
            style={styles.actionButton}
          >
            <FaShare size={20} color="#333" />
          </Button>

          <div style={styles.commentSection}>
          <Input
            style={styles.commentInput}
            placeholder='写个评论走个心'
            value={commentText}
            onChange={setCommentText}
            onEnterPress={handleComment}
          />
          </div>
        </div>

        <List header='全部评论'>
          {comments?.map(comment => (
            <List.Item
              key={comment.id}
              prefix={
                <Image 
                  src={
                    comment.avatar.startsWith('http') 
                    ? comment.avatar 
                    : `${API_BASE_URL}${comment.avatar}`
                  } 
                  style={styles.commentAvatar} />}
                  description={<>
                <div>{comment.content}</div>
                <div style={styles.commentTime}>
                    {new Date(comment.created_at).toLocaleDateString()}
                </div>
              </>}
            >
              {comment.user}
            </List.Item>
          ))}
        </List>
      </div>

      <ImageViewer
        image={detailData.media
          .filter(item => item.type === 'image')
          .map(item => item.url)}
        visible={imageViewerVisible}
        onClose={() => setImageViewerVisible(false)}
        defaultIndex={currentImageIndex}
      />

      {videoVisible && (
        <div style={styles.videoModal}>
          <video 
            controls
            autoPlay
            style={styles.videoPlayer}
            src={currentVideoUrl}
          />
          <Button 
            style={styles.closeButton}
            onClick={() => setVideoVisible(false)}
          >
            关闭
          </Button>
        </div>
      )}

      <style>{`
        @keyframes likeScale {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
    `}</style>
    </div>
  );
}

const colors = {
  primary: '#4CAF50', 
  secondary: '#FF9800',
  background: '#F5F5F5',
  textPrimary: '#2E2E2E',
  textSecondary: '#757575'
};

const styles = {
  videoModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoPlayer: {
    width: '100%',
    maxWidth: '800px',
    outline: 'none'
  },
  closeButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    color: '#fff',
    background: 'rgba(255,255,255,0.2)'
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: colors.textPrimary,
    margin: '16px 0',
    paddingBottom: '12px',
    borderBottom: `2px solid ${colors.primary}30`,
    lineHeight: 1.3,
    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },

  commentTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4
  },
  container: {
    backgroundColor: colors.background,
    height: '100vh',
    overflow: 'auto'
  },
  navBar: {
    '--height': '45px',
    '--background-color': `linear-gradient(135deg, ${colors.primary} 0%,rgb(21, 44, 220) 100%)`,
    '--color': 'white',
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
    padding: '16px 0',
    borderBottom: `1px solid ${colors.primary}20`,
    marginBottom: 16
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
    marginBottom: 16,
    borderRadius: 16,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  mediaItem: {
    display: 'inline-block',
    width: '85%',
    height: 300,
    position: 'relative',
    marginRight: 12,
    transition: 'transform 0.3s ease',
    ':hover': {
      transform: 'scale(0.98)'
    }
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
    zIndex: 10,
    PointerEvents: 'none'
  },
  textContent: {
    lineHeight: 1.8,
    fontSize: 16,
    color: colors.textPrimary,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  actions: {
    display: 'flex',
    gap: 12,
    marginBottom: 16,
    alignItems: 'center'
  },
  commentInput: {
    flex: 1,
    '--padding-left': '12px',
    transition: 'all 0.3s ease',
    '&:focus-within': {
      transform: 'scale(1.02)',
      boxShadow: `0 0 0 2px ${colors.primary}20`
    }
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: '50%'
  },
  actionButton: {
    '--background-color': 'rgba(255,255,255,0.9)',
    '--border-color': colors.primary,
    '--text-color': colors.textPrimary,
    '--border-radius': '20px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    padding: '8px 16px',
    fontSize: '14px',
    width: '100px', // 统一宽度
    height: '40px', // 统一高度
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  commentSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 16
  },
  submitButton: {
    '--background-color': colors.primary,
    '--text-color': '#fff',
    '--border-radius': '20px',
    padding: '8px 16px',
    fontSize: '14px'
  },
  videoModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoPlayer: {
    width: '100%',
    maxWidth: '800px',
    outline: 'none'
  },
  closeButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    color: '#fff',
    background: 'rgba(255,255,255,0.2)'
  },
  imageViewerFooter: {
    position: 'absolute',
    bottom: '30px',
    width: '100%',
    zIndex: 1001
  }
};
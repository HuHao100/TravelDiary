import React, { useState, useEffect, useCallback } from 'react';
import { NavBar, Image, List, Button, Toast, Input, ImageViewer } from 'antd-mobile';
import { MessageFill, HeartFill } from 'antd-mobile-icons';
import { FaShare } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config';

// 常量定义
const CONSTANTS = {
  DEFAULT_AVATAR: `${API_BASE_URL}/avatars/default.png`,
  DEFAULT_VIDEO_THUMB: `${API_BASE_URL}/default-video-thumb.jpg`,
  VIDEO_SEEK_TIME: 0.1,
  LIKE_ANIMATION_DURATION: 600,
};

// 错误信息
const ERROR_MESSAGES = {
  LOAD_FAILED: '加载游记失败',
  LOGIN_REQUIRED: '请先登录',
  OPERATION_FAILED: '操作失败',
  COMMENT_EMPTY: '评论内容不能为空',
  COMMENT_FAILED: '评论失败',
  SHARE_NOT_IMPLEMENTED: '分享功能暂未实现',
  DATA_FORMAT_ERROR: '接口返回数据格式异常',
};

/**
 * 生成视频缩略图
 * @param {string} videoUrl 视频URL
 * @returns {Promise<string>} 缩略图DataURL
 */
const getVideoThumbnail = (videoUrl) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      video.currentTime = CONSTANTS.VIDEO_SEEK_TIME;
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
      resolve(CONSTANTS.DEFAULT_AVATAR);
    };

    video.src = videoUrl;
  });
};

/**
 * 游记详情页组件
 * 显示游记的详细信息，包括媒体文件、评论、点赞等功能
 */
export default function Details() {
  // 路由相关
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 数据状态
  const [detailData, setDetailData] = useState(null);
  const [comments, setComments] = useState([]);
  
  // 交互状态
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  
  // 媒体查看器状态
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [videoVisible, setVideoVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  
  // 用户信息
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch (error) {
      console.warn('Failed to parse user data from localStorage:', error);
      return null;
    }
  });

  /**
   * 处理媒体URL，确保使用完整的URL
   */
  const processMediaUrl = useCallback((url) => {
    return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  }, []);

  /**
   * 处理媒体数据，生成视频缩略图
   */
  const processMediaData = useCallback(async (mediaList) => {
    return Promise.all(mediaList.map(async (item) => {
      const baseItem = {
        ...item,
        url: processMediaUrl(item.url)
      };

      if (item.type === 'video') {
        try {
          const thumbnail = await getVideoThumbnail(baseItem.url);
          return { ...baseItem, thumbnail };
        } catch (error) {
          console.warn('生成视频缩略图失败:', error);
          return { ...baseItem, thumbnail: CONSTANTS.DEFAULT_VIDEO_THUMB };
        }
      }
      return baseItem;
    }));
  }, [processMediaUrl]);

  /**
   * 获取游记详情数据
   */
  const fetchDetailData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/diaries/${id}`);
      const data = response.data;

      // 数据格式验证
      if (!data.author || !Array.isArray(data.media)) {
        throw new Error(ERROR_MESSAGES.DATA_FORMAT_ERROR);
      }

      // 处理媒体数据
      const processedMedia = await processMediaData(data.media);

      // 设置状态
      setDetailData({ ...data, media: processedMedia });
      setLikeCount(data.likes);
      // 初始化用户是否已点赞状态（从后端返回的userLiked或liked字段）
      if (data.userLiked !== undefined) {
        setLiked(data.userLiked);
      } else if (data.liked !== undefined) {
        setLiked(data.liked);
      } else {
        setLiked(false);
      }
      setComments(data.comments || []);
    } catch (error) {
      console.error('获取游记详情失败:', error);
      Toast.show(ERROR_MESSAGES.LOAD_FAILED);
      navigate(-1);
    }
  }, [id, navigate, processMediaData]);

  // 初始化数据
  useEffect(() => {
    fetchDetailData();
  }, [fetchDetailData]);

  /**
   * 添加点赞动画效果
   */
  const addLikeAnimation = useCallback(() => {
    const likeBtn = document.querySelector('.like-button');
    if (likeBtn) {
      likeBtn.style.animation = 'likeScale 0.6s ease';
      setTimeout(() => {
        likeBtn.style.animation = '';
      }, CONSTANTS.LIKE_ANIMATION_DURATION);
    }
  }, []);

  /**
   * 处理点赞操作
   */
  const handleLike = useCallback(async () => {
    if (!user) {
      Toast.show(ERROR_MESSAGES.LOGIN_REQUIRED);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/likes/${id}`, {
        userId: user.id
      });

      setLiked(!liked);
      setLikeCount(response.data.count);
      addLikeAnimation();
    } catch (error) {
      console.error('点赞操作失败:', error);
      Toast.show(ERROR_MESSAGES.OPERATION_FAILED);
    }
  }, [user, id, liked, addLikeAnimation]);

  /**
   * 处理评论操作
   */
  const handleComment = useCallback(async () => {
    if (!user) {
      Toast.show(ERROR_MESSAGES.LOGIN_REQUIRED);
      return;
    }

    if (!commentText.trim()) {
      Toast.show(ERROR_MESSAGES.COMMENT_EMPTY);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/comments/${id}`, {
        content: commentText,
        userId: user.id
      });

      const newComment = {
        ...response.data,
        created_at: new Date().toISOString(),
        user: user.nickname,
        avatar: user.avatar_url
      };

      setComments(prevComments => [...prevComments, newComment]);
      setCommentText('');
      Toast.show('评论成功');
    } catch (error) {
      console.error('评论失败:', error);
      Toast.show(ERROR_MESSAGES.COMMENT_FAILED);
    }
  }, [user, commentText, id]);

  /**
   * 处理媒体点击事件
   */
  const handleMediaClick = useCallback((index) => {
    if (!detailData?.media?.[index]) return;

    const item = detailData.media[index];
    
    if (item.type === 'video') {
      setCurrentVideoUrl(item.url);
      setVideoVisible(true);
    } else {
      // 计算图片在纯图片列表中的索引
      const imageIndex = detailData.media
        .slice(0, index + 1)
        .filter(media => media.type === 'image').length - 1;
        
      setCurrentImageIndex(Math.max(0, imageIndex));
      setImageViewerVisible(true);
    }
  }, [detailData?.media]);

  /**
   * 处理分享操作
   */
  const handleShare = useCallback(() => {
    Toast.show(ERROR_MESSAGES.SHARE_NOT_IMPLEMENTED);
  }, []);

  // 加载状态
  if (!detailData) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        fontSize: '16px',
        color: '#666',
        backgroundColor: '#F5F5F5',
        height: '100vh'
      }}>
        正在加载游记详情...
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#F5F5F5",
      paddingBottom: "env(safe-area-inset-bottom)"
    }}>
      {/* 顶部导航栏 */}
      <div style={{
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        zIndex: 100,
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #f0f0f0"
      }}>
        <NavBar
          onBack={() => navigate(-1)}
          style={{
            '--height': '50px',
            '--background-color': '#FFFFFF',
            '--color': '#333333',
            '--font-size': '16px'
          }}
        >
          游记详情
        </NavBar>
      </div>

      {/* 内容区域 */}
      <div style={{
        paddingTop: "50px",
        paddingBottom: "20px"
      }}>
        {/* 媒体内容区域 - 放在最上方 */}
        {detailData?.media?.length > 0 && (
          <div style={{
            margin: "0 0 0 0"
          }}>
            {detailData.media.length === 1 ? (
              // 单个媒体文件
              <div 
                style={{
                  width: "100%",
                  position: "relative",
                  cursor: "pointer",
                  backgroundColor: "#FFFFFF"
                }}
                onClick={() => handleMediaClick(0)}
              >
                {detailData.media[0].type === 'video' && (
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    zIndex: 10,
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    📹 视频
                  </div>
                )}
                <Image
                  src={detailData.media[0].type === 'video' ? detailData.media[0].thumbnail : detailData.media[0].url}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    objectFit: "cover"
                  }}
                />
              </div>
            ) : (
              // 多个媒体文件 - 网格布局
              <div style={{
                display: "grid",
                gridTemplateColumns: detailData.media.length === 2 ? "1fr 1fr" : "repeat(auto-fit, minmax(120px, 1fr))",
                gap: "8px",
                padding: "8px"
              }}>
                {detailData.media.map((item, index) => (
                  <div
                    key={`${item.type}-${index}`}
                    style={{
                      aspectRatio: "1",
                      borderRadius: "8px",
                      overflow: "hidden",
                      position: "relative",
                      cursor: "pointer",
                      backgroundColor: "#FFFFFF",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
                    }}
                    onClick={() => handleMediaClick(index)}
                  >
                    {item.type === 'video' && (
                      <div style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        zIndex: 10,
                        fontSize: '10px'
                      }}>
                        📹
                      </div>
                    )}
                    <Image
                      src={item.type === 'video' ? item.thumbnail : item.url}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 标题、发布者、正文内容区域 - 合并为一个卡片 */}
        <div style={{
          backgroundColor: "#FFFFFF",
          margin: "0 0 8px 0",
          borderRadius: "0px",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
          overflow: "hidden"
        }}>
          {/* 游记标题 */}
          <div style={{
            padding: "24px 20px 16px 20px",
            borderBottom: "1px solid #f8f9fa"
          }}>
            <h1 style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#333333",
              margin: 0,
              lineHeight: 1.4
            }}>
              {detailData?.title || '无标题'}
            </h1>
          </div>

          {/* 发布者信息 */}
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f8f9fa",
            display: "flex",
            alignItems: "center"
          }}>
            <Image 
              src={processMediaUrl(detailData.author.avatar)} 
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                marginRight: 12,
                border: "2px solid #f0f0f0"
              }}
            />
            <div>
              <div style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#333333",
                marginBottom: "2px"
              }}>
                {detailData.author?.nickname || '未知用户'}
              </div>
              <div style={{
                fontSize: "12px",
                color: "#999999"
              }}>
                {new Date(detailData.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* 游记正文内容 */}
          <div style={{
            padding: "20px"
          }}>
            <div style={{
              lineHeight: 1.8,
              fontSize: "16px",
              color: "#333333",
              whiteSpace: "pre-wrap"
            }}>
              {detailData?.content || '暂无内容'}
            </div>
          </div>
        </div>

        {/* 操作栏 */}
        <div style={{
          backgroundColor: "#FFFFFF",
          margin: "0 0 8px 0",
          borderRadius: "0px",
          padding: "16px 20px",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <Button 
            fill="none"
            onClick={handleLike}
            className="like-button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: liked ? "#ff4757" : "#666",
              fontSize: "14px",
              padding: "8px 16px",
              borderRadius: "20px",
              backgroundColor: liked ? "#fff5f5" : "#f8f9fa",
              border: "none",
              transition: "all 0.3s ease"
            }}
          >
            <HeartFill color={liked ? "#ff4757" : "#666"} size={18} />
            <span>{likeCount}</span>
          </Button>

          <Button 
            fill="none"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#666",
              fontSize: "14px",
              padding: "8px 16px",
              borderRadius: "20px",
              backgroundColor: "#f8f9fa",
              border: "none"
            }}
          >
            <MessageFill size={18} />
            <span>{comments.length}</span>
          </Button>

          <Button 
            fill="none"
            onClick={handleShare}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#666",
              fontSize: "14px",
              padding: "8px 16px",
              borderRadius: "20px",
              backgroundColor: "#f8f9fa",
              border: "none"
            }}
          >
            <FaShare size={16} />
            <span>分享</span>
          </Button>
        </div>

        {/* 评论输入区域 */}
        <div style={{
          backgroundColor: "#FFFFFF",
          margin: "0 0 8px 0",
          borderRadius: "0px",
          padding: "16px",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            {user && (
              <Image 
                src={processMediaUrl(user.avatar_url || '/default-avatar.png')} 
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  flexShrink: 0
                }}
              />
            )}
            <Input
              placeholder='写个评论走个心...'
              value={commentText}
              onChange={setCommentText}
              onEnterPress={handleComment}
              style={{
                '--border-radius': '20px',
                '--background-color': '#f8f9fa',
                '--border-width': '0',
                '--padding-left': '16px',
                '--padding-right': '16px',
                flex: 1
              }}
            />
          </div>
        </div>

        {/* 评论列表 */}
        {comments.length > 0 && (
          <div style={{
            backgroundColor: "#FFFFFF",
            margin: "0 0 32px 0",
            borderRadius: "0px",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
            overflow: "hidden"
          }}>
            <div style={{
              padding: "16px 20px 8px 20px",
              borderBottom: "1px solid #f0f0f0",
              fontSize: "16px",
              fontWeight: 600,
              color: "#333333"
            }}>
              全部评论 ({comments.length})
            </div>
            {comments.map((comment, index) => (
              <div
                key={comment.id || index}
                style={{
                  padding: "16px 20px",
                  borderBottom: index < comments.length - 1 ? "1px solid #f8f9fa" : "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <Image 
                    src={processMediaUrl(comment.avatar)} 
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#333333",
                      marginBottom: "4px"
                    }}>
                      {comment.user}
                    </div>
                    <div style={{
                      fontSize: "15px",
                      color: "#333333",
                      lineHeight: 1.5,
                      marginBottom: "8px"
                    }}>
                      {comment.content}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: '#999',
                    }}>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 图片查看器 */}
      <ImageViewer
        image={detailData.media
          .filter(item => item.type === 'image')
          .map(item => item.url)}
        visible={imageViewerVisible}
        onClose={() => setImageViewerVisible(false)}
        defaultIndex={currentImageIndex}
      />

      {/* 视频播放器 */}
      {videoVisible && (
        <div style={{
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
        }}>
          <video 
            controls
            autoPlay
            style={{
              width: '90%',
              maxWidth: '800px',
              outline: 'none'
            }}
            src={currentVideoUrl}
          />
          <Button 
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              color: '#fff',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '8px'
            }}
            onClick={() => setVideoVisible(false)}
          >
            关闭
          </Button>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Toast, Empty } from 'antd-mobile';
import { SearchOutline } from 'antd-mobile-icons';
import axios from 'axios';
import API_BASE_URL from '../../config';
import NoteCard from '../../components/notecard/Notecard';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const initialKeyword = searchParams.get('keyword') || '';

  // 执行搜索
  const performSearch = async (keyword) => {
    if (!keyword.trim()) {
      Toast.show({
        content: '请输入搜索关键词',
        position: 'bottom'
      });
      return;
    }

    try {
      setLoading(true);
      const searchUrl = `${API_BASE_URL}/diaries/search/query`;
      console.log('搜索请求地址:', searchUrl);
      console.log('搜索关键词:', keyword);
      
      const response = await axios.get(searchUrl, {
        params: { keyword }
      });

      const formattedData = response.data.map(item => ({
        id: item.id,
        title: item.title,
        cover: item.image_url,
        username: item.user.nickname,
        avatar: item.user.avatar_url
      }));

      setResults(formattedData);
      
      if (formattedData.length === 0) {
        Toast.show({
          content: '未找到相关游记',
          position: 'bottom'
        });
      }
    } catch (error) {
      console.error('搜索失败:', error);
      console.error('错误状态码:', error.response?.status);
      console.error('错误详情:', error.response?.data);
      Toast.show({
        content: error.response?.status === 404 ? '搜索接口未找到，请检查后端配置' : '搜索失败，请重试',
        position: 'bottom'
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始化时执行搜索
  useEffect(() => {
    if (initialKeyword) {
      setSearchInput(initialKeyword);
      performSearch(initialKeyword);
    }
  }, [initialKeyword]);

  // 处理搜索提交
  const handleSearch = (value) => {
    if (value.trim()) {
      performSearch(value);
      navigate(`/search?keyword=${encodeURIComponent(value)}`);
    }
  };

  // 处理返回首页
  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#F5F5F5',
      overflow: 'hidden'
    }}>
      {/* 搜索框 */}
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '12px 16px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          backgroundColor: '#f8f9fa',
          borderRadius: '20px',
          border: '1px solid #e8e8e8',
          transition: 'all 0.3s ease'
        }}>
          <SearchOutline style={{ color: '#999', fontSize: '18px', flexShrink: 0 }} />
          <input
            type="text"
            placeholder='输入游记标题或内容'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchInput);
              }
            }}
            style={{
              flex: 1,
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '14px',
              outline: 'none',
              color: '#333'
            }}
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#d9d9d9',
                border: 'none',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer',
                flexShrink: 0,
                padding: 0,
                lineHeight: 1
              }}
            >
              ×
            </button>
          )}
        </div>
        <button
          onClick={handleGoBack}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#1890ff',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          取消
        </button>
      </div>

      {/* 搜索结果 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        width: '100%'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
            color: '#999'
          }}>
            加载中...
          </div>
        ) : results.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            padding: '8px',
            backgroundColor: '#F5F5F5'
          }}>
            {results.map((note) => (
              <NoteCard
                key={note.id}
                title={note.title}
                username={note.username}
                cover={`${API_BASE_URL}${note.cover}`}
                avatar={`${API_BASE_URL}${note.avatar}`}
                onClick={() => navigate(`/details/${note.id}`)}
              />
            ))}
          </div>
        ) : searchInput ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px'
          }}>
            <Empty description="未找到相关游记" />
          </div>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
            color: '#999'
          }}>
            输入内容开始搜索
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

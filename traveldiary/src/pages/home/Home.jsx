import React, { useEffect, useState, useMemo } from "react";
import { Tabs, Toast } from "antd-mobile";
import { SearchOutline } from 'antd-mobile-icons';
import { useNavigate } from "react-router-dom";
import NoteCard from "../../components/notecard/Notecard";
import axios from "axios";
import API_BASE_URL from "../../config";
import { useAppContext } from "../../context/AppContext";

export default function Home() {
  // 改进1: 分开存储三个标签页的数据
  const [notesData, setNotesData] = useState({
    recommended: [],
    trending: [],
    nearest: []
  });
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommended');
  
  // 改进2: 用 Set 追踪已加载的标签页
  const [loadedTabs, setLoadedTabs] = useState(new Set(['recommended']));
  
  const navigate = useNavigate();
  const { t } = useAppContext();

  // 获取发现页数据
  const fetchAllDiaries = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/diaries/getAll`);
      const formattedData = response.data.map(item => ({
        id: item.id,
        title: item.title,
        cover: item.image_url,
        username: item.user.nickname,
        avatar: item.user.avatar_url,
        likeCount: item.likeCount
      }));
      // 只更新对应标签页的数据
      setNotesData(prev => ({ ...prev, recommended: formattedData }));
    } catch (error) {
      Toast.show({ content: t('home.load.failed'), position: 'bottom' });
    } finally {
      setLoading(false);
    }
  };

  // 获取热门游记
  const fetchTrendingDiaries = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/diaries/sorted/byLikes`);
      const formattedData = response.data.map(item => ({
        id: item.id,
        title: item.title,
        cover: item.image_url,
        username: item.user.nickname,
        avatar: item.user.avatar_url,
        likeCount: item.likeCount
      }));
      setNotesData(prev => ({ ...prev, trending: formattedData }));
    } catch (error) {
      Toast.show({ content: t('home.trending.failed'), position: 'bottom' });
    } finally {
      setLoading(false);
    }
  };

  // 获取最新游记
  const fetchNewestDiaries = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/diaries/sorted/byTime`);
      const formattedData = response.data.map(item => ({
        id: item.id,
        title: item.title,
        cover: item.image_url,
        username: item.user.nickname,
        avatar: item.user.avatar_url,
        likeCount: item.likeCount,
        created_at: item.created_at
      }));
      setNotesData(prev => ({ ...prev, nearest: formattedData }));
    } catch (error) {
      Toast.show({ content: t('home.newest.failed'), position: 'bottom' });
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchAllDiaries();
  }, []);

  const handleSearchClick = () => {
    navigate('/search');
  };

  // 改进3: 使用 useMemo 避免不必要的重新计算
  const currentNotes = useMemo(() => {
    return notesData[activeTab] || [];
  }, [activeTab, notesData]);

  // 改进2: 标签页切换 - 只在首次访问时加载
  const handleTabChange = (key) => {
    setActiveTab(key);
    
    // 如果已经加载过，直接切换（不显示加载动画）
    if (!loadedTabs.has(key)) {
      setLoading(true);
      setLoadedTabs(prev => new Set([...prev, key]));
      
      if (key === 'trending') {
        fetchTrendingDiaries();
      } else if (key === 'nearest') {
        fetchNewestDiaries();
      }
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 改进5: 合并 fixed 容器，避免层级混乱 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: "var(--color-bg-primary)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
        }}
      >
        {/* 搜索框 */}
        <div style={{ padding: "12px 16px" }}>
          <div
            onClick={handleSearchClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: 'var(--color-bg-input)',
              borderRadius: '20px',
              cursor: 'pointer',
              border: '1px solid var(--color-border-deep)',
              transition: 'all 0.3s ease'
            }}
          >
            <SearchOutline style={{ color: 'var(--color-text-tertiary)', fontSize: '18px' }} />
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: '14px', flex: 1 }}>
              {t('home.search.placeholder')}
            </span>
          </div>
        </div>

        {/* 标签页 */}
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <Tabs.Tab title={t('home.tab.recommended')} key='recommended' />
          <Tabs.Tab title={t('home.tab.trending')} key='trending' />
          <Tabs.Tab title={t('home.tab.nearest')} key='nearest' />
        </Tabs>
      </div>

      {/* 改进1 + 改进4: Masonry 布局 + willChange 优化滚动 */}
      <div
        style={{
          marginTop: "100px",
          flex: 1,
          overflow: "auto",
          backgroundColor: "var(--color-bg-secondary)",
          paddingBottom: "80px",
          willChange: "scroll-position"  // 告诉浏览器优化滚动
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
            {t('home.loading')}
          </div>
        ) : (
          <div
            style={{
              columnCount: 2,  // 2列瀑布流
              columnGap: "8px",
              padding: "8px",
              backgroundColor: "var(--color-bg-secondary)"
            }}
          >
            {currentNotes.map((note) => (
              <div
                key={note.id}
                style={{
                  breakInside: "avoid",  // 防止卡片被分割
                  marginBottom: "8px"
                }}
              >
                <NoteCard
                  title={note.title}
                  username={note.username}
                  cover={`${API_BASE_URL}${note.cover}`}
                  avatar={`${API_BASE_URL}${note.avatar}`}
                  likeCount={note.likeCount}
                  onClick={() => navigate(`/details/${note.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
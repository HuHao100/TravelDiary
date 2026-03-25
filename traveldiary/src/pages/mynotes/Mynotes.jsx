import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Toast, Image, Button } from 'antd-mobile'
import { SearchOutline, SetOutline } from 'antd-mobile-icons';
import axios from 'axios';
import API_BASE_URL from '../../config';

const Mynotes = () => {
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
    const [user, setUser] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' 或 'oldest'
    const [allNotes, setAllNotes] = useState([]); // 保存所有原始数据

    // 获取游记列表
    const getDiaries = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('user'));
            if (!userInfo) {
                Toast.show('请先登录');
                navigate('/login');
                return;
            }
            setUser(userInfo);
            const response = await axios.get(`${API_BASE_URL}/diaries/getMy`);
            
            // 前端过滤当前用户游记
            const userNotes = response.data.filter(note => 
                note.user_id === userInfo.id
            );
        
            const formattedNotes = userNotes.map(note => ({
                ...note,
                status: note.status === 'pending' ? '待审核' 
                      : note.status === 'approved' ? '已通过' 
                      : '未通过',
                description: note.content.substring(0, 30) + '...'
            }));
            
            setAllNotes(formattedNotes);
            setNotes(formattedNotes);
            } catch (error) {
                Toast.show('获取游记失败');
            }
    };

    // 初始化加载
    useEffect(() => {
        getDiaries();
    }, []);

    // 搜索和筛选逻辑
    useEffect(() => {
        let filtered = allNotes;

        // 按标题或描述搜索
        if (searchText.trim()) {
            filtered = filtered.filter(note =>
                note.title.toLowerCase().includes(searchText.toLowerCase()) ||
                note.content.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // 按时间排序
        filtered = filtered.sort((a, b) => {
            const timeA = new Date(a.created_at);
            const timeB = new Date(b.created_at);
            return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
        });

        setNotes(filtered);
    }, [searchText, sortOrder, allNotes]);

    // 删除
    const handleDelete = async (id) => {
        const result = await Dialog.confirm({
          content: '确定要删除这篇游记吗？',
        });
        
        if (result) {
          try {
            await axios.delete(`${API_BASE_URL}/diaries/${id}`);
            Toast.show('删除成功');
            getDiaries();
          } catch (error) {
            Toast.show('删除失败');
          }
        }
    };

    // 修改后的编辑处理
    const handleEdit = (id) => {
        
    };

    // 新增游记
    const handleAddNew = () => {
        navigate('/publish');
    };

    // 登出处理
    const handleLogout = () => {
        localStorage.removeItem('user');
        Toast.show('已退出登录');
        navigate('/login');
    };

    // 处理切换账号
    const handleSwitchAccount = () => {
        handleLogout();
    };

    // 跳转到游记详情
    const handleViewDetail = (id) => {
        navigate(`/details/${id}`);
    };

    return (
        <div style={{ 
            backgroundColor: '#F5F5F5',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden'
        }}>
            {/* 顶部导航栏 */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                backgroundColor: '#FFFFFF',
                borderBottom: '1px solid #f0f0f0',
                padding: '0 16px',
                flexShrink: 0
            }}>
                <div style={{
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#333333'
                }}>
                    <div style={{ width: '32px' }}></div>
                    <span>我的游记</span>
                    <button
                        onClick={() => navigate('/settings')}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#666'
                        }}
                        aria-label="设置"
                    >
                        <SetOutline style={{ fontSize: '22px' }} />
                    </button>
                </div>
            </div>

            {/* 内容区域 */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                paddingBottom: '80px',
                paddingTop: '50px'
            }}>
                {/* 用户信息卡片 */}
                {user && (
                    <div style={{
                        margin: '16px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            flex: 1
                        }}>
                            <Image
                                src={user.avatar_url?.startsWith('http') 
                                    ? user.avatar_url 
                                    : `${API_BASE_URL}${user.avatar_url}`}
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '50%',
                                    marginRight: 16,
                                    border: '2px solid #f0f0f0'
                                }}
                            />
                            <div>
                                <div style={{
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: '#333333',
                                    marginBottom: '4px'
                                }}>
                                    {user.nickname || '未知用户'}
                                </div>
                                <div style={{
                                    fontSize: '13px',
                                    color: '#999999'
                                }}>
                                    共 {notes.length} 篇游记
                                </div>
                            </div>
                        </div>
                        <Button
                            fill="none"
                            onClick={handleSwitchAccount}
                            style={{
                                color: '#1890ff',
                                fontSize: '14px',
                                padding: '8px 16px',
                                border: '1px solid #1890ff',
                                borderRadius: '20px'
                            }}
                        >
                            切换账号
                        </Button>
                    </div>
                )}

                {/* 发布新游记按钮 */}
                <div style={{ margin: '16px' }}>
                    <Button
                        block
                        color="primary"
                        size="large"
                        onClick={handleAddNew}
                        style={{
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 600
                        }}
                    >
                        + 发布新游记
                    </Button>
                </div>

                {/* 搜索和筛选栏 */}
                <div style={{
                    margin: '12px 16px',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                }}>
                    {/* 搜索框 */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '20px',
                        border: '1px solid #e8e8e8'
                    }}>
                        <SearchOutline style={{ color: '#999', fontSize: '16px' }} />
                        <input
                            type="text"
                            placeholder='搜索我的游记'
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{
                                flex: 1,
                                border: 'none',
                                backgroundColor: 'transparent',
                                fontSize: '14px',
                                outline: 'none',
                                color: '#333'
                            }}
                        />
                        {searchText && (
                            <button
                                onClick={() => setSearchText('')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: '#d9d9d9',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    padding: 0,
                                    lineHeight: 1
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {/* 筛选按钮 */}
                    <button
                        onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                        style={{
                            padding: '10px 14px',
                            backgroundColor: sortOrder === 'newest' ? '#1890ff' : '#f0f0f0',
                            color: sortOrder === 'newest' ? '#fff' : '#333',
                            border: 'none',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {sortOrder === 'newest' ? '最新' : '最早'}
                    </button>
                </div>

                {/* 游记列表 */}
                {notes.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#999999'
                    }}>
                        <div style={{
                            fontSize: '48px',
                            marginBottom: '16px'
                        }}>
                            📝
                        </div>
                        <div style={{
                            fontSize: '16px',
                            marginBottom: '12px'
                        }}>
                            暂无游记
                        </div>
                        <div style={{
                            fontSize: '13px',
                            color: '#cccccc'
                        }}>
                            快去分享你的旅行故事吧
                        </div>
                    </div>
                ) : (
                    notes.map((note) => (
                        <div key={note.id} style={{
                            margin: '0 16px 16px 16px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }} onClick={() => handleViewDetail(note.id)}>
                            {/* 游记卡片内容 */}
                            <div style={{
                                display: 'flex',
                                padding: '16px'
                            }} onClick={(e) => e.stopPropagation()}>
                                <Image
                                    src={note.image_url 
                                        ? `${API_BASE_URL}${note.image_url}`
                                        : `${API_BASE_URL}/diary_images/default.png`}
                                    alt="Note Image"
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '8px',
                                        marginRight: 16,
                                        objectFit: 'cover',
                                        flexShrink: 0,
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleViewDetail(note.id)}
                                />
                                <div style={{
                                    flex: 1,
                                    cursor: 'pointer'
                                }} onClick={() => handleViewDetail(note.id)}>
                                    <h3 style={{
                                        margin: '0 0 8px 0',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        color: '#333333'
                                    }}>
                                        {note.title}
                                    </h3>
                                    <p style={{
                                        margin: '0 0 8px 0',
                                        fontSize: '13px',
                                        color: '#666666',
                                        lineHeight: 1.5
                                    }}>
                                        {note.description}
                                    </p>
                                    {note.status === '未通过' && (
                                        <p style={{
                                            margin: '8px 0 0',
                                            fontSize: '12px',
                                            color: '#f5222d'
                                        }}>
                                            ❌ 拒绝原因：{note.reject_reason}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* 操作栏 */}
                            <div style={{
                                padding: '12px 16px',
                                borderTop: '1px solid #f0f0f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }} onClick={(e) => e.stopPropagation()}>
                                <div>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        backgroundColor: note.status === '已通过' ? '#f6ffed'
                                                      : note.status === '待审核' ? '#e6f7ff'
                                                      : '#fff1f0',
                                        color: note.status === '已通过' ? '#52c41a'
                                              : note.status === '待审核' ? '#1890ff'
                                              : '#ff4d4f'
                                    }}>
                                        {note.status === '已通过' ? '✓ ' : note.status === '待审核' ? '⏳ ' : '✗ '}
                                        {note.status}
                                    </span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: '8px'
                                }}>
                                    {note.status !== '已通过' && (
                                        <Button
                                            size="mini"
                                            fill="none"
                                            onClick={() => handleEdit(note.id)}
                                            style={{
                                                color: '#1890ff',
                                                fontSize: '13px',
                                                border: '1px solid #1890ff',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            编辑
                                        </Button>
                                    )}
                                    <Button
                                        size="mini"
                                        fill="none"
                                        onClick={() => handleDelete(note.id)}
                                        style={{
                                            color: '#ff4d4f',
                                            fontSize: '13px',
                                            border: '1px solid #ff4d4f',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        删除
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Mynotes;
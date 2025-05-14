import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Toast} from 'antd-mobile'
import axios from 'axios';
import API_BASE_URL from '../../config';

const Mynotes = () => {
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);

    // 获取游记列表
    const getDiaries = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                Toast.show('请先登录');
                navigate('/login');
                return;
            }
            const response = await axios.get(`${API_BASE_URL}/diaries/getMy`);
            
            // 前端过滤当前用户游记
            const userNotes = response.data.filter(note => 
                note.user_id === user.id
            );
        
            const formattedNotes = userNotes.map(note => ({
                ...note,
                status: note.status === 'pending' ? '待审核' 
                      : note.status === 'approved' ? '已通过' 
                      : '未通过',
                description: note.content.substring(0, 30) + '...'
            }));
            
            setNotes(formattedNotes);
            } catch (error) {
                Toast.show('获取游记失败');
            }
    };

    // 初始化加载
    useEffect(() => {
        getDiaries();
    }, []);

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

    // 返回键
    const handleBack = () => {
        navigate('/');
    };

    return (
        <div style={{ padding: '16px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <button onClick={handleBack} style={{ border: 'none', background: 'none', color: 'blue' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1890ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-left">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>我的</h2>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                        onClick={() => navigate('/login')}
                        style={{ 
                        border: 'none', 
                        background: 'none', 
                        color: 'blue', 
                        fontSize: '16px',
                        padding: '4px 8px',
                        fontWeight: 'bold'
                        }}
                    >
                        切换账号
                    </button>
                    <button onClick={handleAddNew} style={{ border: 'none', background: 'none', color: 'blue', fontSize: '16px', fontWeight: 'bold' }}>
                        + 新增
                    </button>
                </div>
            </div>

            {notes.map((note) => (
                <div key={note.id} style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <img src={note.image_url 
                        ? `${API_BASE_URL}${note.image_url}`
                        : `${API_BASE_URL}/diary_images/default.png`} 
                        alt="Note Image" style={{ width: '60px', height: '60px', marginRight: '16px', borderRadius: '4px' }} />
                        <div>
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>{note.title}</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#666' }}>{note.description}</p>
                            {note.status === '未通过' && (
                                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#f5222d' }}>拒绝原因：{note.reject_reason}</p>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button style={{ 
                            border: '1px solid #d9d9d9',
                            background: note.status === '已通过' ? '#52c41a' 
                                        :note.status === '待审核' ? '#ffffff' 
                                        : '#ff4d4f',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            marginRight: '8px'
                        }}>
                            {note.status}
                        </button>
                    
                    {note.status !== '已通过' && (
                        <button
                            onClick={() => handleEdit(note.id)} style={{ border: '1px solid #d9d9d9', background: 'none', color: '#1890ff', padding: '8px 16px', borderRadius: '4px', marginRight: '8px' }}>
                            编辑
                        </button>
                    )}

                        <button onClick={() => handleDelete(note.id)} style={{ border: '1px solid #d9d9d9', background: 'none', color: '#1890ff', padding: '8px 16px', borderRadius: '4px' }}>
                            删除
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Mynotes;
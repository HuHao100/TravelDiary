import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, Toast} from 'antd-mobile'

// Mock 数据
const mockNotes = [
    {
        id: 1,
        title: '标题标题标题标题',
        description: '描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述...',
        status: '已通过',
        rejectReason: ''
    },
    {
        id: 2,
        title: '标题标题标题标题',
        description: '描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述...',
        status: '待审核',
        rejectReason: ''
    },
    {
        id: 3,
        title: '标题标题标题标题',
        description: '描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述...',
        status: '未通过',
        rejectReason: '内容不符合规范'
    }
];

const Mynotes = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [notes, setNotes] = useState(mockNotes);

    // 登录校验
    // useEffect(() => {
    //     const isLoggedIn = localStorage.getItem('isLoggedIn');
    //     if (!isLoggedIn) {
    //         alert('请先登录！');
    //         navigate('/login');
    //     }
    // }, [navigate]);

    // 删除
    const handleDelete = (id) => {
      Dialog.confirm({
        content: '确定要删除这篇游记吗？',
        confirmText: '确认删除',
        cancelText: '再想想',
        onConfirm: () => {
          const updatedNotes = notes.filter(note => note.id !== id)
          setNotes(updatedNotes)
        }
      })
    };

    // 编辑, 需要后续完善
    const handleEdit = (id) => {
        console.log(`Editing note with id: ${id}`);
        Toast.show('需要根据游记ID和编辑页面的逻辑实现');
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
                <button onClick={handleAddNew} style={{ border: 'none', background: 'none', color: 'blue', fontSize: '16px', fontWeight: 'bold' }}>
                    + 新增
                </button>
            </div>

            {notes.map((note) => (
                <div key={note.id} style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                        <img src="https://picsum.photos/50" alt="Note Image" style={{ width: '100px', height: '60px', marginRight: '16px', borderRadius: '4px' }} />
                        <div>
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>{note.title}</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#666' }}>{note.description}</p>
                            {note.status === '未通过' && (
                                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#f5222d' }}>拒绝原因：{note.rejectReason}</p>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button style={{ 
                            border: '1px solid #d9d9d9',
                            background: note.status === '已通过' ? '#52c41a' 
                                      : note.status === '待审核' ? '#ffffff' 
                                      : '#ff4d4f',
                            color: note.status === '待审核' ? '#333' : '#fff',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            marginRight: '8px'
                        }}>
                            {note.status}
                        </button>

                        <button onClick={() => handleEdit(note.id)} style={{ border: '1px solid #d9d9d9', background: 'none', color: '#1890ff', padding: '8px 16px', borderRadius: '4px', marginRight: '8px', cursor: note.status === '已通过' ? 'not-allowed' : 'pointer' }}>
                            编辑
                        </button>

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
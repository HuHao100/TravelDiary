import React from "react";

// 添加onClick参数
export default function Notecard({ title, username, cover, avatar, onClick }) {
  return (
    <div 
      style={{
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: '10px',
        marginBottom: '0.1rem',
        overflow: 'hidden',
        boxShadow: '0 8px 8px rgba(0,0,0,0.05)',
        cursor: 'pointer', // 添加鼠标手势
        position: 'relative' // 确保层级
      }}
      onClick={onClick} // 绑定点击事件
      role="button" // 增强可访问性
      tabIndex={0} // 允许键盘聚焦
    >
      <img 
        src={cover} 
        alt="封面" 
        style={{ 
          width: '100%', 
          display: 'block',
          height: 'auto',
          objectFit: 'contain',
        }}
      />
      <div style={{ padding: '0.2rem' }}>
        <div style={{ fontWeight: 'bold', fontSize: '0.2rem', marginBottom: '0.2rem' }}>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src={avatar} 
            alt="头像" 
            style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              marginRight: '0.1rem' 
            }} 
          />
          <span style={{ fontSize: '0.15rem', color: '#666' }}>{username}</span>
        </div>
      </div>
    </div>
  )
}
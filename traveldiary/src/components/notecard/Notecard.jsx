import React from "react";

export default function Notecard({title,username,cover,avatar}){ 
    return(
        <div style={{
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: '10px',
            marginBottom: '0.1rem',
            overflow: 'hidden',
            boxShadow: '0 8px 8px rgba(0,0,0,0.05)',
          }}>
        <img src={cover} alt={"封面"} style={{ width: '100%', display: 'block',height: 'auto',objectFit: 'contain',}}/>
        <div style={{ padding: '0.3rem' }}>
        <div style={{ fontWeight: 'bold', fontSize: '0.3rem', marginBottom: '0.2rem' }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={avatar} alt={"头像"} style={{ width: '24px', height: '24px', borderRadius: '50%', marginRight: '0.2rem' }} />
          <span style={{ fontSize: '0.2rem', color: '#666' }}>{username}</span>
        </div>
      </div>
    </div>
    )

}
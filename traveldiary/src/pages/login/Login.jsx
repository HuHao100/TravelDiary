import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('用户名和密码不能为空');
      return;
    }
    
    // Mock登录逻辑
    const mockUsers = [
      { username: 'user1', password: '123456' },
      { username: 'test', password: 'test123' }
    ];
    
    const user = mockUsers.find(u => u.username === username && u.password === password);
    if (user) {
      navigate('/');
    } else {
      setError('用户名或密码错误');
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '20px'
  };

  const formStyle = {
    width: '100%',
    maxWidth: '400px',
    background: 'white',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div style={containerStyle}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>登录</h2>
        
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button type="submit" style={buttonStyle}>
          登录
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/register" style={{ color: '#3498db', textDecoration: 'none' }}>
            没有账号？立即注册
          </Link>
        </div>
      </form>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '16px',
  outline: 'none',
  transition: 'border-color 0.3s',
  ':focus': {
    borderColor: '#3498db'
  }
};

const buttonStyle = {
  width: '100%',
  padding: '14px',
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
  ':hover': {
    backgroundColor: '#2980b9'
  }
};

export default Login;
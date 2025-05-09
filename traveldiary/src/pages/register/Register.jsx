import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    avatar: null
  });
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const navigate = useNavigate();

  // Mock用户名检查
  const checkUsernameAvailability = async (username) => {
    const existingUsers = ['user1', 'test', 'admin'];
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(!existingUsers.includes(username));
      }, 500);
    });
  };

  const handleUsernameChange = async (e) => {
    const value = e.target.value;
    setFormData({ ...formData, username: value });
    if (value.length > 0) {
      const isAvailable = await checkUsernameAvailability(value);
      setIsUsernameAvailable(isAvailable);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('用户名和密码不能为空');
      return;
    }
    if (!isUsernameAvailable) {
      setError('用户名已被占用');
      return;
    }
    
    // Mock注册逻辑
    localStorage.setItem('user', JSON.stringify(formData));
    navigate('/login');
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

  return (
    <div style={containerStyle}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>注册</h2>

        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <label style={{ cursor: 'pointer' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
            <img
              src={avatarPreview || 'https://picsum.photos/50'}
              alt="头像"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #3498db'
              }}
            />
            <div style={{ color: '#3498db', fontSize: '14px', marginTop: '8px' }}>点击上传头像</div>
          </label>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="用户名"
            value={formData.username}
            onChange={handleUsernameChange}
            style={{
              ...inputStyle,
              borderColor: formData.username && !isUsernameAvailable ? 'red' : '#ddd'
            }}
          />
          {formData.username && !isUsernameAvailable && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
              用户名不可用
            </div>
          )}
        </div>

        <div style={{ marginBottom: '30px' }}>
          <input
            type="password"
            placeholder="密码"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={inputStyle}
          />
        </div>

        <button type="submit" style={buttonStyle}>
          注册
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ color: '#3498db', textDecoration: 'none' }}>
            已有账号？立即登录
          </Link>
        </div>
      </form>
    </div>
  );
};

// 公共样式
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

const formStyle = {
  width: '100%',
  maxWidth: '400px',
  background: 'white',
  padding: '30px',
  borderRadius: '15px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
};

export default Register;
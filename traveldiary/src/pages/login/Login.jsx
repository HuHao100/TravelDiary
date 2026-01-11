import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Toast } from 'antd-mobile';
import axios from 'axios';
import API_BASE_URL from '../../config';

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/users/login`,
        { username: values.username, password: values.password },
        { responseType: 'json' } 
      );

      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        Toast.show({
          content: '登录成功',
          position: 'bottom'
        });
        navigate('/mynotes');
      }
    } catch (error) {
      const message = error.response?.data?.message || '登录失败，请检查用户名和密码';
      Toast.show({
        content: message,
        position: 'bottom'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#F5F5F5', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: '100vh',
      overflow: 'hidden',
      paddingBottom: '80px',
      boxSizing: 'border-box'
    }}>
      <div style={{ paddingTop: '30px', paddingBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' }}>
          旅游日记
        </h1>
        <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>
          分享你的旅行故事
        </p>
      </div>

      <div style={{ padding: '0 16px', width: '100%', maxWidth: '500px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          footer={
            <Button 
              block 
              type="submit" 
              color="primary" 
              size="large"
              loading={loading}
            >
              登录
            </Button>
          }
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e8e8e8',
              overflow: 'hidden'
            }}>
              <Input 
                placeholder="请输入用户名" 
                clearable
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: 'none'
                }}
              />
            </div>
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e8e8e8',
              overflow: 'hidden'
            }}>
              <Input 
                type="password" 
                placeholder="请输入密码" 
                clearable
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: 'none'
                }}
              />
            </div>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            没有账号？
          </span>
          <Link 
            to="/register" 
            style={{ 
              marginLeft: '8px',
              color: '#1890ff', 
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            立即注册
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
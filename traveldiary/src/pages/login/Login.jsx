import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Toast } from 'antd-mobile';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { useAppContext } from '../../context/AppContext';

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { t } = useAppContext();

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
          content: t('login.success'),
          position: 'bottom'
        });
        navigate('/mynotes');
      }
    } catch (error) {
      const message = error.response?.data?.message || t('login.failed');
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
      backgroundColor: 'var(--color-bg-secondary)', 
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
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: '0 0 8px 0' }}>
          {t('login.title')}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0' }}>
          {t('login.subtitle')}
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
              {t('login.submit')}
            </Button>
          }
        >
          <Form.Item
            name="username"
            label={t('login.username')}
            rules={[{ required: true, message: t('login.required.username') }]}
          >
            <div style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: '12px',
              border: '1px solid var(--color-border-deep)',
              overflow: 'hidden'
            }}>
              <Input 
                placeholder={t('login.username.placeholder')}
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
            label={t('login.password')}
            rules={[{ required: true, message: t('login.required.password') }]}
          >
            <div style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: '12px',
              border: '1px solid var(--color-border-deep)',
              overflow: 'hidden'
            }}>
              <Input 
                type="password" 
                placeholder={t('login.password.placeholder')}
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
          <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {t('login.no.account')}
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
            {t('login.register')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
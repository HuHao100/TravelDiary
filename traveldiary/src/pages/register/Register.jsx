import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Toast } from 'antd-mobile';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { useAppContext } from '../../context/AppContext';

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const { t } = useAppContext();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        // 将文件存储到 form 中
        form.setFieldValue('avatar', file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // 获取 avatar 文件
      const avatarFile = values.avatar || form.getFieldValue('avatar');
      
      if (!avatarFile && !avatarPreview) {
        Toast.show({
          content: t('register.no.avatar'),
          position: 'bottom'
        });
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('username', values.username);
      formDataToSend.append('password', values.password);
      formDataToSend.append('nickname', values.nickname);
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      const response = await axios.post(`${API_BASE_URL}/users/register`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'json'
      });

      if (response.status === 201) {
        Toast.show({
          content: t('register.success'),
          position: 'bottom'
        });
        navigate('/login');
      }
    } catch (error) {
      const message = error.response?.data?.message || t('register.failed');
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
          {t('register.title')}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0' }}>
          {t('register.subtitle')}
        </p>
      </div>

      <div style={{ padding: '0 16px', width: '100%', maxWidth: '500px' }}>
        {/* 头像上传区域 */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <label style={{ cursor: 'pointer', display: 'inline-block' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
            <img
              src={avatarPreview || `${API_BASE_URL}/avatars/default.png`}
              alt="头像"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #1890ff',
                display: 'block'
              }}
            />
            <div style={{
              color: '#1890ff',
              fontSize: '12px',
              marginTop: '8px',
              fontWeight: '500'
            }}>
              {t('register.avatar')}
            </div>
          </label>
        </div>

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
              {t('register.submit')}
            </Button>
          }
        >
          <Form.Item
            name="username"
            label={t('register.username')}
            rules={[{ required: true, message: t('register.required.username') }]}
          >
            <div style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: '12px',
              border: '1px solid var(--color-border-deep)',
              overflow: 'hidden'
            }}>
              <Input
                placeholder={t('register.username.placeholder')}
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
            label={t('register.password')}
            rules={[{ required: true, message: t('register.required.password') }]}
          >
            <div style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: '12px',
              border: '1px solid var(--color-border-deep)',
              overflow: 'hidden'
            }}>
              <Input
                type="password"
                placeholder={t('register.password.placeholder')}
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
            name="nickname"
            label={t('register.nickname')}
            rules={[{ required: true, message: t('register.required.nickname') }]}
          >
            <div style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: '12px',
              border: '1px solid var(--color-border-deep)',
              overflow: 'hidden'
            }}>
              <Input
                placeholder={t('register.nickname.placeholder')}
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
            {t('register.has.account')}
          </span>
          <Link
            to="/login"
            style={{
              marginLeft: '8px',
              color: '#1890ff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {t('register.login')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
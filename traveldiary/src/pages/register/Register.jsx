import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Toast } from 'antd-mobile';
import axios from 'axios';
import API_BASE_URL from '../../config';

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

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
          content: '请选择头像',
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
          content: '注册成功，请登录',
          position: 'bottom'
        });
        navigate('/login');
      }
    } catch (error) {
      const message = error.response?.data?.message || '注册失败，请重试';
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
              点击更换头像
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
              注册
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

          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e8e8e8',
              overflow: 'hidden'
            }}>
              <Input
                placeholder="请输入昵称"
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
            已有账号？
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
            立即登录
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Toast, Dialog, Image, Button } from 'antd-mobile';
import { CameraOutline } from 'antd-mobile-icons';
import axios from 'axios';
import API_BASE_URL from '../../config';

export default function Settings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  const [nickname, setNickname] = useState(user?.nickname || '');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const DEFAULT_AVATAR = `${API_BASE_URL}/avatars/default.png`;

  const avatarSrc = avatarPreview
    || (user.avatar_url
      ? (user.avatar_url.startsWith('http') ? user.avatar_url : `${API_BASE_URL}${user.avatar_url}`)
      : DEFAULT_AVATAR);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (!nickname.trim()) {
      Toast.show('昵称不能为空');
      return;
    }

    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append('nickname', nickname.trim());
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await axios.put(`${API_BASE_URL}/users/${user.id}/profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setAvatarFile(null);
      Toast.show('资料更新成功');
    } catch (error) {
      Toast.show(error.response?.data?.message || '更新失败');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Toast.show('请填写完整信息');
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show('两次输入的新密码不一致');
      return;
    }
    if (newPassword.length < 6) {
      Toast.show('新密码不能少于6位');
      return;
    }

    setPasswordLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/users/${user.id}/password`, {
        oldPassword,
        newPassword
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Toast.show('密码修改成功');
    } catch (error) {
      Toast.show(error.response?.data?.message || '修改失败');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await Dialog.confirm({
      content: '确定要退出登录吗？',
      confirmText: '退出',
      cancelText: '取消'
    });
    if (result) {
      localStorage.removeItem('user');
      Toast.show('已退出登录');
      navigate('/login');
    }
  };

  const sectionStyle = {
    margin: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
  };

  const sectionTitleStyle = {
    padding: '14px 16px 10px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#333',
    borderBottom: '1px solid #f5f5f5'
  };

  const fieldStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #f5f5f5'
  };

  const labelStyle = {
    fontSize: '13px',
    color: '#999',
    marginBottom: '6px'
  };

  return (
    <div style={{ backgroundColor: '#F5F5F5', minHeight: '100vh', paddingBottom: '24px' }}>
      {/* 顶部导航 */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <NavBar onBack={() => navigate(-1)}>设置</NavBar>
      </div>

      <div style={{ paddingTop: '50px' }}>
        {/* 头像与昵称 */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>个人资料</div>

          {/* 头像 */}
          <div style={{ ...fieldStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{ position: 'relative', width: 72, height: 72, flexShrink: 0, cursor: 'pointer' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Image
                src={avatarSrc}
                style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid #f0f0f0' }}
              />
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 22, height: 22, borderRadius: '50%',
                backgroundColor: '#1890ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #fff'
              }}>
                <CameraOutline style={{ color: '#fff', fontSize: '11px' }} />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>
            <span style={{ fontSize: '13px', color: '#999' }}>点击更换头像</span>
          </div>

          {/* 昵称 */}
          <div style={fieldStyle}>
            <div style={labelStyle}>昵称</div>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入昵称"
              maxLength={20}
              style={{
                width: '100%',
                border: 'none',
                borderBottom: '1px solid #e8e8e8',
                padding: '4px 0',
                fontSize: '15px',
                outline: 'none',
                color: '#333',
                backgroundColor: 'transparent',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 用户名（只读） */}
          <div style={fieldStyle}>
            <div style={labelStyle}>用户名</div>
            <div style={{ fontSize: '15px', color: '#999' }}>{user.username}</div>
          </div>

          <div style={{ padding: '12px 16px' }}>
            <Button
              block
              color="primary"
              loading={profileLoading}
              onClick={handleSaveProfile}
              style={{ borderRadius: '8px' }}
            >
              保存资料
            </Button>
          </div>
        </div>

        {/* 修改密码 */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>修改密码</div>

          <div style={fieldStyle}>
            <div style={labelStyle}>原密码</div>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="请输入原密码"
              style={{
                width: '100%',
                border: 'none',
                borderBottom: '1px solid #e8e8e8',
                padding: '4px 0',
                fontSize: '15px',
                outline: 'none',
                color: '#333',
                backgroundColor: 'transparent',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>新密码</div>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="请输入新密码（至少6位）"
              style={{
                width: '100%',
                border: 'none',
                borderBottom: '1px solid #e8e8e8',
                padding: '4px 0',
                fontSize: '15px',
                outline: 'none',
                color: '#333',
                backgroundColor: 'transparent',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>确认新密码</div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入新密码"
              style={{
                width: '100%',
                border: 'none',
                borderBottom: '1px solid #e8e8e8',
                padding: '4px 0',
                fontSize: '15px',
                outline: 'none',
                color: '#333',
                backgroundColor: 'transparent',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ padding: '12px 16px' }}>
            <Button
              block
              color="primary"
              loading={passwordLoading}
              onClick={handleChangePassword}
              style={{ borderRadius: '8px' }}
            >
              修改密码
            </Button>
          </div>
        </div>

        {/* 退出登录 */}
        <div style={{ margin: '16px' }}>
          <Button
            block
            color="danger"
            fill="outline"
            onClick={handleLogout}
            style={{ borderRadius: '8px', fontSize: '15px' }}
          >
            退出登录
          </Button>
        </div>
      </div>
    </div>
  );
}

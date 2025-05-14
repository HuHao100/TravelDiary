import React, { useState, useRef } from 'react';
import { Form, Input, Button, Toast, TextArea} from 'antd-mobile';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import API_BASE_URL from '../../config';

const Publish = () => {
  const [form] = Form.useForm();
  const [diaryId, setDiaryId] = useState(null);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const navigate = useNavigate();

  // 提交基础信息
  const onFinish = async (values) => {
    try {
      if (!user) {
        Toast.show('请先登录');
        navigate('/login');
        return;
      }
      
      if (!values.title || !values.content) {
        Toast.show('请填写标题和内容');
        return;
      }
      const response = await axios.post(`${API_BASE_URL}/diaries/publish`, {
        userId: user.id,
        title: values.title,
        content: values.content
      });

      const uploadPromises = [];
      
      // 如果有图片则加入上传队列
      if (images.length > 0) {
        uploadPromises.push(uploadImages(response.data.diaryId));
      }

      // 如果有视频则加入上传队列
      if (video) {
        uploadPromises.push(uploadVideo(response.data.diaryId));
      }

      // 并行执行所有上传
      await Promise.all(uploadPromises);
      
      setDiaryId(response.data.diaryId);
      Toast.show({
        content: response.data.message,
        position: 'bottom'
      });
      navigate('/mynotes')
    } catch (error) {
      Toast.show({
        content: '提交失败，请重试',
        position: 'bottom'
      });
    }
  };

  // 处理图片选择
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 9) {
      Toast.show('最多只能上传9张图片');
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  // 删除图片
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // 处理视频选择
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        Toast.show('请选择视频文件');
        return;
      }
      setVideo(file);
    }
  };

  // 图片上传处理（保持不变）
  const uploadImages = async (id) => {
    const formData = new FormData();
    formData.append('diaryId', id);
    images.forEach(file => formData.append('images', file));
    
    await axios.post(`${API_BASE_URL}/diaries/uploadImages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  };

  // 视频上传处理（保持不变）
  const uploadVideo = async (id) => {
    const formData = new FormData();
    formData.append('diaryId', id);
    formData.append('video', video);
    
    await axios.post(`${API_BASE_URL}/diaries/uploadVideo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  };

  return (
    <div style={{ 
      padding: '16px',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <Form
        form={form}
        onFinish={onFinish}
        footer={
          <div style={{ 
            marginTop: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <Button 
              block 
              type="submit" 
              color="primary"
              shape="rounded"
              size="large"
            >
              发布游记
            </Button>
          </div>
        }
      >
        {/* 标题输入（保持不变） */}
        <Form.Item
          name="title"
          label="游记标题"
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input placeholder="请输入游记标题" clearable />
        </Form.Item>

        {/* 内容编辑（保持不变） */}
        <Form.Item
          name="content"
          label="游记正文"
          rules={[{ required: true, message: '请输入内容' }]}
        >
          <TextArea 
            placeholder="分享你的旅行故事..." 
            rows={5} 
            showCount 
            maxLength={1000}
          />
        </Form.Item>

        {/* 图片上传区域 */}
        <Form.Item label="上传图片（最多9张）">
          <div style={{
            border: '1px dashed #1890ff',
            borderRadius: '8px',
            padding: '12px',
            background: 'white'
          }}>
            <input
              type="file"
              ref={imageInputRef}
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <Button 
              block 
              onClick={() => imageInputRef.current.click()}
              style={{ color: '#1890ff' }}
            >
              选择图片
            </Button>
            
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {images.map((file, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt="预览"
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                  <Button
                    size="mini"
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      minWidth: '24px',
                      height: '24px',
                      borderRadius: '12px',
                      padding: '0'
                    }}
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
            {images.length > 0 && (
              <div style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
                已选择 {images.length} 张图片
              </div>
            )}
          </div>
        </Form.Item>

        {/* 视频上传区域 */}
        <Form.Item label="上传视频（仅限1个）">
          <div style={{
            border: '1px dashed #1890ff',
            borderRadius: '8px',
            padding: '12px',
            background: 'white'
          }}>
            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              onChange={handleVideoSelect}
              style={{ display: 'none' }}
            />
            <Button 
              block 
              onClick={() => videoInputRef.current.click()}
              style={{ color: '#1890ff' }}
            >
              选择视频
            </Button>
            
            {video && (
              <div style={{ marginTop: '12px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px',
                  background: '#f0f0f0',
                  borderRadius: '4px'
                }}>
                  <span style={{ fontSize: '14px' }}>{video.name}</span>
                  <Button
                    size="mini"
                    style={{ minWidth: '24px', height: '24px' }}
                    onClick={() => setVideo(null)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Publish;
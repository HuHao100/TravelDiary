import { NavBar } from "antd-mobile";
import React, { useState } from 'react'
import { ImageUploader, Space} from 'antd-mobile'
import { Input } from 'antd-mobile'
import { TextArea } from 'antd-mobile'
import { Button } from 'antd-mobile'


export default function Publish() {
const [titleInput, setTitle] = useState('');
const back = () => {
  window.history.back();
};
const mockUpload = async (file)=>{
  return {
    url: URL.createObjectURL(file),
  };
}
const [fileList, setFileList] = useState([]);
const UploadStatus = () => {
  return (
    <ImageUploader
      style={
      {
        '--cell-size': '2rem',
        backgroundColor: '#FFFFFF'
      }
      
    }
      value={fileList}
      onChange={setFileList}
      upload={mockUpload}
    />
  )
}
const PostNotes = () => {
  return (
    <div style={{color:"#007AFF",fontSize:"0.35rem"}} onClick={()=>{
      console.log("发布游记")
    }}>
      <Button size='mini' color='primary'>
      发布
          </Button>
    </div>
  )
}
  return (
    <div style={{ backgroundColor: '#FFFFFF',height: '100vh', overflow: 'hidden'}}>
      <NavBar
          style={{
            '--height': '1rem',
            backgroundColor: '#FFFFFF',
          }}
          onBack={back}
          right={<PostNotes />}
        >
          发布游记
        </NavBar>
        {/* 图片上传 */}
        <Space direction='vertical' style={{marginLeft:"0.2rem",marginTop:"0.2rem"}}>
          <UploadStatus/>
        </Space>
        <Input
        style={{
          height: '1rem',
          '--font-size': '0.35rem',
          margin: '0 0.2rem',
          overflow: 'hidden',
          width: '95vw',
        }}
          placeholder='填写标题'
          value={titleInput}
          maxLength={25}
          onChange={val => {
            setTitle(val)
          }}
        />
        {/* 水平分割线 */}
        <hr style={{backgroundColor:"#666",margin:"0 0.2rem",height:"0.1px"} }/>
        <TextArea style={{padding:"0.2rem",width:"95vw"}} placeholder="添加正文" showCount 
        autoSize={{ minRows: 3, maxRows: 15 }}/>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { SearchBar, Tabs, Toast } from "antd-mobile";
import { useNavigate } from "react-router-dom";
import NoteCard from "../../components/notecard/Notecard";
import axios from "axios";
import API_BASE_URL from "../../config";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiaries = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/diaries/getAll`);
        const formattedData = response.data.map(item => ({
          id: item.id,
          title: item.title,
          cover: item.image_url,
          username: item.user.nickname,
          avatar: item.user.avatar_url
        }));
        setNotes(formattedData);
      } catch (error) {
        Toast.show({
          content: '加载游记失败',
          position: 'bottom'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDiaries();
  }, []);

  return (
    <div>
        <div
        style={
          {
            width:"100%",
            height:"1rem",
            backgroundColor:"#FFFFFF",
            overflow:"auto",
          }
        }
        >
        <SearchBar
          placeholder='请输入内容'
          showCancelButton
          style={{
            backgroundColor:"#FFFFFF",
            padding:"0.2rem 1rem",
            position:"fixed",top:0,left:0,right:0,bottom:0,
            '--border-radius': '100px',
          }}
        />
        </div>
        <div style={{
          position: "fixed",
          top:"0.8rem",
          width: "100%",
          backgroundColor: "#FFFFFF",  
          boxShadow: "0 8px 8px rgba(0, 0, 0, 0.1)", // 添加阴影
        }}>
        <Tabs style={{backgroundColor:"#FFFFFF"}}>
          <Tabs.Tab title='发现' key='recommended'></Tabs.Tab>
          <Tabs.Tab title='热门' key='trending'></Tabs.Tab>
          <Tabs.Tab title='最新' key='nearest'></Tabs.Tab>
        </Tabs>
        </div>

        <div style={{
        marginTop: '0.8rem',
        columnCount: 2,
        columnGap: '0.1rem',
        padding: '0.1rem',
        marginBottom: '1rem',
      }}>

      {loading ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>加载中...</div>
        ) : notes.map((note) => (
          <NoteCard
            key={note.id}
            title={note.title}
            username={note.username}
            cover={`${API_BASE_URL}${note.cover}`}
            avatar={`${API_BASE_URL}${note.avatar}`}
            onClick={() => navigate(`/details/${note.id}`)} 
          />
      ))}
      </div>
    </div>
  );
}
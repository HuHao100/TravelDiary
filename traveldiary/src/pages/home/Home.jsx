import React from "react";
import {SearchBar} from "antd-mobile";
import  {Tabs}  from "antd-mobile";
import NoteCard from "../../components/notecard/Notecard";

export default function Home() {
const notes=[
  {
    title: "游记标题1",
    username: "用户1",
    cover:"/cover.png",
    avatar: "/images.jpg",
  },
  {
    title: "游记标题2",
    username: "用户2",
    cover:"/cover.png",
    avatar: "/images.jpg",
  },
  {
    title: "游记标题3",
    username: "用户3",
    cover:"/cover.png",
    avatar: "/images.jpg",
  }
]
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
            position:"fixed",top:0,left:0,right:0,
            '--border-radius': '100px',
          }}
        />
        </div>
        <div style={{
          position: "fixed",
          width: "100%",
          backgroundColor: "#FFFFFF",
          
          boxShadow: "0 8px 8px rgba(0, 0, 0, 0.1)", // 添加阴影
        }}>
        <Tabs style={{backgroundColor:"#FFFFFF"}}>
          <Tabs.Tab title='推荐' key='recommended'></Tabs.Tab>
          <Tabs.Tab title='热门' key='trending'></Tabs.Tab>
          <Tabs.Tab title='同城' key='nearest'></Tabs.Tab>
        </Tabs>
        </div>
        <div style={{
        marginTop: '0.8rem',
        columnCount: 2,
        columnGap: '0.1rem',
        padding: '0.1rem',
        marginBottom: '1rem',
      }}>
        {notes.map((note, index) => (
          <NoteCard key={index} {...note} />
        ))}
      </div>
    </div>
  );
}
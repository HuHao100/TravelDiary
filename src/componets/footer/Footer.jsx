//页面底部导航栏
//图标后面可以再改
import React from "react";
import {
    AppOutline,
    FillinOutline,
    UserOutline,
  } from 'antd-mobile-icons'
import { TabBar } from 'antd-mobile'
import { useState } from "react";
import { useNavigate, useLocation} from "react-router-dom";


export default function Footer(){

const [actived,setActive]=useState(window.location.pathname);
const location = useLocation()
const hiddenPaths = ['/login', '/details', '/register']

const navigate=useNavigate();

function changeHandler(key){
    setActive(key);
    navigate(key);
}

    if (hiddenPaths.includes(location.pathname)) {
        return null;
    }
    return(
    <div>
    <TabBar activeKey={actived} onChange={changeHandler} style={{position:"fixed",bottom:0,left:0,right:0}}>
        <TabBar.Item icon={<AppOutline />} key={'/'} title={'首页'}></TabBar.Item>
        <TabBar.Item icon={<FillinOutline />} key={'/publish'} title={'发布游记'}></TabBar.Item>
        <TabBar.Item icon={<UserOutline />} key={'/mynotes'} title={'我的游记'}></TabBar.Item>
    </TabBar>
    </div>
)}
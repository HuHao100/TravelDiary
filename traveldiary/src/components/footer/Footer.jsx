import React from "react";
import {
    AppOutline,
    FillinOutline,
    UserOutline,
  } from 'antd-mobile-icons'
import { TabBar } from 'antd-mobile'
import { useNavigate, useLocation} from "react-router-dom";


export default function Footer(){

const location = useLocation()
const navigate = useNavigate();
const hiddenPaths = ['/login', '/register', '/search']

// 根据当前路由确定 activeKey
const getActiveKey = () => {
    const pathname = location.pathname;
    if (pathname === '/') return '/';
    if (pathname === '/publish') return '/publish';
    if (pathname === '/mynotes') return '/mynotes';
    // 其他路由默认返回首页的 key
    return '/';
}

function changeHandler(key){
    navigate(key);
}

// 检查是否应该隐藏底部导航栏
const shouldHideFooter = () => {
    // 检查固定的隐藏路径
    if (hiddenPaths.includes(location.pathname)) {
        return true;
    }
    // 检查是否是详情页面 (匹配 /details/ 开头的所有路径)
    if (location.pathname.startsWith('/details/')) {
        return true;
    }
    return false;
}

if (shouldHideFooter()) {
    return null;
    }
    return(
    <div>
    <TabBar activeKey={getActiveKey()} onChange={changeHandler} style={{backgroundColor:"#FFFFFF",position:"fixed",bottom:0,left:0,right:0}}>
        <TabBar.Item icon={<AppOutline />} key={'/'} title={'首页'}></TabBar.Item>
        <TabBar.Item icon={<FillinOutline />} key={'/publish'} title={'发布游记'}></TabBar.Item>
        <TabBar.Item icon={<UserOutline />} key={'/mynotes'} title={'我的游记'}></TabBar.Item>
    </TabBar>
    </div>
)}
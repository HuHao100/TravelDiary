import React, { useState } from "react";
import { Breadcrumb, Layout, Menu, List, Tag, Select, Input, Pagination, Drawer, Button,Avatar } from "antd";
import { useNavigate } from "react-router-dom"; // 用于页面跳转
const { Header, Content, Footer } = Layout;
const { Search } = Input;
const { Option } = Select;

const data = [
  {
    id: 1,
    title: "游记标题1",
    author: { name: "用户1", avatar: "/avatar.jpg" },
    content: "这是正文内容的一部分，展示一些摘要信息...",
    cover: "/cover.png",
    status: "待审核",
    publishTime: "2025-05-10 14:30",
    video: "/video.mp4",
  },
  {
    id: 2,
    title: "游记标题2",
    author: { name: "用户2", avatar: "/avatar.jpg" },
    content: "这是正文内容的一部分，展示一些摘要信息...",
    cover: "/cover.png",
    status: "不通过",
    publishTime: "2025-05-09 10:00",
    video: "/video.mp4",
  },
  {
    id: 3,
    title: "游记标题3",
    author: { name: "用户3", avatar: "/avatar.jpg" },
    content: "这是正文内容的一部分，展示一些摘要信息...",
    cover: "/cover.png",
    status: "已通过",
    publishTime: "2025-05-08 16:45",
    video: "/video.mp4",
  },
];

export default function Home() {
  const [filterStatus, setFilterStatus] = useState("all"); // 筛选状态
  const [selectedMenu, setSelectedMenu] = useState("1"); // 当前选中的菜单项
  const [drawerVisible, setDrawerVisible] = useState(false); // 抽屉显示状态
  const navigate = useNavigate(); // 用于页面跳转

  // 菜单切换时重置筛选状态
  const handleMenuClick = (e) => {
    setSelectedMenu(e.key);
    if (e.key === "2") {
      setFilterStatus("all"); // 重置筛选状态为 "全部"
    }
  };

  // 筛选后的数据
  const filteredData = data.filter((item) => {
    if (selectedMenu === "1") {
      // 待审核菜单
      return item.status === "待审核";
    } else if (selectedMenu === "2") {
      // 已审核菜单
      if (filterStatus === "all") return item.status !== "待审核";
      return item.status === filterStatus;
    }
    return false;
  });

  return (
    <Layout>
      <Header style={{ position: "sticky", top: 0, zIndex: 1, width: "100%", display: "flex", alignItems: "center", backgroundColor: "#fff" }}>
        <Menu
          theme="light"
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          onClick={handleMenuClick} // 使用新的菜单点击处理函数
          items={[
            { key: "1", label: "待审核" },
            { key: "2", label: "已审核" },
            { key: "3", label: "回收站" },
          ]}
          style={{ flex: 1, minWidth: 0 }}
        />
        <Avatar
          src="/avatar.jpg"
          style={{ cursor: "pointer" }}
          onClick={() => setDrawerVisible(true)} // 点击头像显示抽屉
        />
      </Header>
      <Content style={{ padding: "0 48px" }}>
        <Breadcrumb style={{ margin: "20px 0", marginLeft: "20px" }}>
          <Breadcrumb.Item>审核列表</Breadcrumb.Item>
          <Breadcrumb.Item>{selectedMenu === "1" ? "待审核" : "已审核"}</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 20 }}>
          {selectedMenu === "2" && (
            <Select
              value={filterStatus} // 确保筛选器的显示值与状态同步
              style={{ width: "10%", marginRight: 10 }}
              onChange={(value) => setFilterStatus(value)}
            >
              <Option value="all">全部</Option>
              <Option value="已通过">已通过</Option>
              <Option value="不通过">不通过</Option>
            </Select>
          )}
          <Search
            size="large"
            placeholder="搜索游记标题/内容/发布者"
            enterButton="搜索"
            style={{
              width: selectedMenu === "2" ? "80%" : "90%",
            }}
          />
        </div>
        <div style={{ margin: 20, minHeight: 380, background: "#fff", borderRadius: "8px", padding: 20 }}>
          <List
            itemLayout="vertical"
            dataSource={filteredData}
            renderItem={(item,index) => (
              <List.Item
                key={item.id}
                extra={<img width={100} alt="cover" src={item.cover} />}
                onClick={() => navigate(`/details/${item.id}`, { state: { item, allItems: data, currentIndex: index } })} // 跳转到详情页面并传递数据
                style={{ cursor: "pointer" }}
              >
                <List.Item.Meta
                  title={<a href="#">{item.title}</a>}
                  description={`发布时间: ${item.publishTime}`}
                />
                <div>{item.content}</div>
                <Tag color={item.status === "待审核" ? "blue" : item.status === "不通过" ? "red" : "green"}>{item.status}</Tag>
              </List.Item>
            )}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <Pagination style={{ margin: "auto", textAlign: "center" }} defaultCurrent={1} total={filteredData.length} pageSize={10} />
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>{new Date().getFullYear()}@jierwusha</Footer>

      {/* 抽屉 */}
      <Drawer
        title="用户信息"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
      >
        <div style={{ textAlign: "center" }}>
          <Avatar src="/avatar.jpg" size={64} />
          <h3 style={{ marginTop: 10 }}>用户1</h3>
          <p>当前角色：审核员</p>
          <Button type="primary" danger style={{ marginTop: 10 }} onClick={() => alert("退出系统")}>
            退出系统
          </Button>
        </div>
      </Drawer>
    </Layout>
  );
}
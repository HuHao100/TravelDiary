import React, { useState } from "react";
import { Breadcrumb, Layout, Menu, List, Tag, Select, Input, Pagination, Drawer, Button, Avatar } from "antd";
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
    content: "这是正文内容的一部分，展示一些摘要信息...111111111111111111111111",
    cover: "/cover.png",
    status: "已通过",
    publishTime: "2025-05-08 16:45",
    video: "/video.mp4",
  },
  {
    id: 4,
    title: "游记标题4",
    author: { name: "用户1", avatar: "/avatar.jpg" },
    content: "这是正文内容的一部分，展示一些摘要信息...",
    cover: "/cover.png",
    status: "待审核",
    publishTime: "2025-05-10 14:30",
    video: "/video.mp4",
  },
  {
    id: 5,
    title: "游记标题5",
    author: { name: "用户1", avatar: "/avatar.jpg" },
    content: "这是正文内容的一部分，展示一些摘要信息...",
    cover: "/cover.png",
    status: "待审核",
    publishTime: "2025-05-10 14:30",
    video: "/video.mp4",
  },
];

export default function Home() {
  const user = JSON.parse(localStorage.getItem("user")); // 获取登录用户信息
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMenu, setSelectedMenu] = useState("1");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = (e) => {
    setSelectedMenu(e.key);
    if (e.key === "2") {
      setFilterStatus("all");
    }
  };

  const filteredData = data.filter((item) => {
    if (selectedMenu === "1") {
      return item.status === "待审核";
    } else if (selectedMenu === "2") {
      if (filterStatus === "all") return item.status !== "待审核";
      return item.status === filterStatus;
    } else if (selectedMenu === "3" && user.role === "管理员") {
      return item.status === "回收站";
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
          onClick={handleMenuClick}
          items={[
            { key: "1", label: "待审核" },
            { key: "2", label: "已审核" },
            ...(user.role === "管理员" ? [{ key: "3", label: "回收站" }] : []), // 管理员显示回收站
          ]}
          style={{ flex: 1, minWidth: 0 }}
        />
        <Avatar
          src="/avatar.jpg"
          style={{ cursor: "pointer" }}
          onClick={() => setDrawerVisible(true)}
        />
      </Header>
      <Content style={{ padding: "0 48px" }}>
        <Breadcrumb style={{ margin: "20px 0", marginLeft: "20px" }}>
          <Breadcrumb.Item>审核列表</Breadcrumb.Item>
          <Breadcrumb.Item>{selectedMenu === "1" ? "待审核" : selectedMenu === "2" ? "已审核" : "回收站"}</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 20 }}>
          {selectedMenu === "2" && (
            <Select
              value={filterStatus}
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
            itemLayout="horizontal"
            dataSource={filteredData}
            renderItem={(item, index) => (
              <List.Item
                key={item.id}
                onClick={() => navigate(`/details/${item.id}`, { state: { item, allItems: filteredData, currentIndex: index } })}
                style={{ cursor: "pointer", alignItems: "center" }}
              >
                <div style={{ marginRight: 20 }}>
                  <img
                    src={item.cover}
                    alt="cover"
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>{item.title}</h3>
                  <p style={{ margin: "8px 0", color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
                    {item.content}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#999" }}>
                    <strong>发布时间：</strong> {item.publishTime}
                  </p>
                </div>
                <Tag
                  color={item.status === "待审核" ? "blue" : item.status === "不通过" ? "red" : "green"}
                  style={{
                    marginLeft: 20,
                    fontSize: "16px",
                    padding: "5px 10px",
                    borderRadius: "4px",
                  }}
                >
                  {item.status}
                </Tag>
              </List.Item>
            )}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <Pagination style={{ margin: "auto", textAlign: "center" }} defaultCurrent={1} total={filteredData.length} pageSize={10} />
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>{new Date().getFullYear()}@jierwusha</Footer>
      <Drawer
        title="用户信息"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
      >
        <div style={{ textAlign: "center" }}>
          <Avatar src="/avatar.jpg" size={64} />
          <h3 style={{ marginTop: 10 }}>{user.name}</h3>
          <p>当前角色：{user.role}</p>
          <Button
            type="primary"
            danger
            style={{ marginTop: 10 }}
            onClick={() => {
              localStorage.removeItem("user"); // 清除本地存储的用户信息
              navigate("/login"); // 跳转到登录页面
            }}
          >
            退出系统
          </Button>
        </div>
      </Drawer>
    </Layout>
  );
}
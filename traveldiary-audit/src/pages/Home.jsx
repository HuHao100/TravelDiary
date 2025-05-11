import React, { useState } from "react";
import { Breadcrumb, Layout, Menu, List, Avatar, Tag, Select, Input, Pagination } from "antd";
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
  },
  {
    id: 2,
    title: "游记标题2",
    author: { name: "用户2", avatar: "/avatar.jpg" },
    content: "这是正文内容的一部分，展示一些摘要信息...",
    cover: "/cover.png",
    status: "不通过",
  },
  {
    id: 3,
    title: "游记标题3",
    author: { name: "用户3", avatar: "/avatar.jpg" },
    content: "这是正文内容的一部分，展示一些摘要信息...",
    cover: "/cover.png",
    status: "已通过",
  },
];

export default function Home() {
  const [filterStatus, setFilterStatus] = useState("all"); // 筛选状态
  const [selectedMenu, setSelectedMenu] = useState("1"); // 当前选中的菜单项

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
          onClick={(e) => setSelectedMenu(e.key)} // 更新选中的菜单项
          items={[
            { key: "1", label: "待审核" },
            { key: "2", label: "已审核" },
            { key: "3", label: "回收站" },
          ]}
          style={{ flex: 1, minWidth: 0 }}
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
              defaultValue="all"
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
            renderItem={(item) => (
              <List.Item key={item.id} extra={<img width={100} alt="cover" src={item.cover} />}>
                <List.Item.Meta
                  avatar={<Avatar src={item.author.avatar} />}
                  title={<a href="#">{item.title}</a>}
                  description={`发布者: ${item.author.name}`}
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
    </Layout>
  );
}
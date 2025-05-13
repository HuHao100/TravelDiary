import React, { useState, useEffect } from "react";
import axios from "axios";
import { Breadcrumb, Layout, Menu, List, Tag, Select, Input, Pagination, Drawer, Button, Avatar, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom"; // 用于页面跳转
const { Header, Content, Footer } = Layout;
const { Search } = Input;
const { Option } = Select;

export default function Home() {
  const { state } = useLocation();
  const returnFlag = state?.returnFlag || "1"; // 恢复菜单项，默认为 "1"
  const initialFilterStatus = state?.filterStatus || "all"; // 恢复筛选状态，默认为 "all"
  const initialSearchValue = state?.searchValue || ""; // 恢复搜索框的值，默认为空字符串

  const [selectedMenu, setSelectedMenu] = useState(returnFlag);
  const [filterStatus, setFilterStatus] = useState(initialFilterStatus);
  const [searchValue, setSearchValue] = useState(initialSearchValue);

  const user = JSON.parse(localStorage.getItem("user")); // 获取登录用户信息
  const [diaries, setDiaries] = useState([]); // 存储游记数据
  const [filteredData, setFilteredData] = useState([]); // 存储筛选后的数据
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();
  const convertStatus = new Map([
    ["pending", "待审核"],
    ["approved", "已通过"],
    ["rejected", "已拒绝"],
    ["deleted", "已删除"],
  ]);

  useEffect(() => {
    console.log("恢复筛选条件:", { returnFlag, filterStatus, searchValue });
  }, [returnFlag, filterStatus, searchValue]);

  // 获取游记数据
  useEffect(() => {
    const fetchDiaries = async () => {
      try {
        console.log("请求 URL:", `${process.env.REACT_APP_API_BASE_URL}/api/diaries/getAll`);
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/diaries/getAll`);
        const dataWithFullImageUrl = response.data.map((item) => ({
          ...item,
          image_url: `${process.env.REACT_APP_API_BASE_URL}${item.image_url}`, // 拼接完整的图片路径
        })); // 调用后端接口
        setDiaries(dataWithFullImageUrl);
        setFilteredData(dataWithFullImageUrl);
      } catch (error) {
        console.error("获取游记失败:", error);
        message.error("获取游记失败，请稍后重试！");
      }
    };
    fetchDiaries();
  }, []);

  // 菜单点击事件
  const handleMenuClick = (e) => {
    setSelectedMenu(e.key);
    if (e.key === "2") {
      setFilterStatus("all");
    }
  };

  // 根据菜单和筛选条件过滤数据
  useEffect(() => {
    const filtered = diaries.filter((item) => {
      if (selectedMenu === "1") {
        return item.status === "pending";
      } else if (selectedMenu === "2") {
        if (filterStatus === "all") return item.status !== "pending";
        return item.status === filterStatus;
      } else if (selectedMenu === "3" && user.role === "管理员") {
        return item.status === "deleted";
      }
      return false;
    });

    // 如果有搜索值，进一步过滤
    const lowerCaseSearchValue = searchValue.toLowerCase();
    const finalFiltered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerCaseSearchValue) ||
        item.content.toLowerCase().includes(lowerCaseSearchValue) ||
        item.user.nickname.toLowerCase().includes(lowerCaseSearchValue)
    );

    setFilteredData(finalFiltered);
  }, [diaries, selectedMenu, filterStatus, searchValue, user.role]);

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const handleReset = () => {
    setSearchValue(""); // 清空搜索框的值
  };

  return (
    <Layout>
      <Header style={{ position: "sticky", top: 0, zIndex: 1, width: "100%", display: "flex", alignItems: "center", backgroundColor: "#fff" }}>
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={[selectedMenu]}
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
              <Option value="approved">已通过</Option>
              <Option value="rejected">不通过</Option>
            </Select>
          )}
          <Search
            size="large"
            placeholder="搜索游记标题/内容/发布者"
            enterButton="搜索"
            value={searchValue} // 绑定搜索框的值
            onChange={(e) => setSearchValue(e.target.value)} // 更新搜索框的值
            onSearch={handleSearch} // 绑定搜索逻辑
            style={{
              width: selectedMenu === "2" ? "70%" : "80%",
              marginRight: 10,
            }}
          />
          <Button onClick={handleReset} type="default">
            重置
          </Button>
        </div>
        <div style={{ margin: 20, minHeight: 380, background: "#fff", borderRadius: "8px", padding: 20 }}>
          <List
            itemLayout="horizontal"
            dataSource={filteredData}
            renderItem={(item, index) => (
              <List.Item
                key={item.id}
                onClick={() =>
                  navigate(`/details/${item.id}`, {
                    state: {
                      id: item.id, // 仅传递 id
                      returnFlag: selectedMenu,
                      filterStatus, // 当前筛选状态
                      searchValue, // 当前搜索框的值
                      allItems: filteredData, // 确保传递筛选后的游记列表
                      currentIndex: index, // 当前游记索引
                    },
                  })
                }
                style={{ cursor: "pointer", alignItems: "center" }}
              >
                <div style={{ marginRight: 20 }}>
                  <img
                    src={item.image_url} // 使用后端返回的图片路径
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
                    <strong>发布时间：</strong> {item.created_at}
                  </p>
                </div>
                <Tag
                  color={item.status === "pending" ? "blue" : item.status === "rejected" ? "red" : "green"}
                  style={{
                    marginLeft: 20,
                    fontSize: "16px",
                    padding: "5px 10px",
                    borderRadius: "4px",
                  }}
                >
                  {convertStatus.get(item.status)}
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
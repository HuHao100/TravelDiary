import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Breadcrumb, Layout, Menu, List, Tag, Select, Input, Pagination, Drawer, Button, Avatar, message, Card, Row, Col, Statistic } from "antd";
import { useLocation, useNavigate } from "react-router-dom"; // 用于页面跳转
import * as echarts from "echarts";
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

  const [user] = useState(() => JSON.parse(localStorage.getItem("user"))); // 获取登录用户信息
  const [diaries, setDiaries] = useState([]); // 存储游记数据
  const [filteredData, setFilteredData] = useState([]); // 存储筛选后的数据
  const [drawerVisible, setDrawerVisible] = useState(false);
  const statusChartRef = useRef(null);
  const authorChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const chartInstancesRef = useRef([]);
  const navigate = useNavigate();
  const convertStatus = new Map([
    ["pending", "待审核"],
    ["approved", "已通过"],
    ["rejected", "已拒绝"],
    ["deleted", "已删除"],
  ]);

  useEffect(() => {
    //console.log("恢复筛选条件:", { returnFlag, filterStatus, searchValue });
  }, [returnFlag, filterStatus, searchValue]);

  // 获取游记数据
  useEffect(() => {
    const fetchDiaries = async () => {
      try {
        // 获取正常状态的游记
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/diaries/getAll`);
        let dataWithFullImageUrl = res.data.map((item) => ({
          ...item,
          image_url: `${process.env.REACT_APP_API_BASE_URL}${item.image_url}`,
        }));

        // 如果是管理员，再获取deleted状态的游记并合并
        if (user?.role === "管理员") {
          const deletedRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/diaries/getDeleted`);
          const deletedWithFullImageUrl = deletedRes.data.map((item) => ({
            ...item,
            image_url: `${process.env.REACT_APP_API_BASE_URL}${item.image_url}`,
          }));
          dataWithFullImageUrl = [...dataWithFullImageUrl, ...deletedWithFullImageUrl];
        }

        setDiaries(dataWithFullImageUrl);
        setFilteredData(dataWithFullImageUrl);
      } catch (error) {
        console.error("获取游记失败:", error);
        message.error("获取游记失败，请稍后重试！");
      }
    };
    fetchDiaries();
    // user 变化时也要重新拉取
  }, [user]);

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
        if (filterStatus === "all") return item.status === "approved" || item.status === "rejected";
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
    //console.log("筛选后的数据:", finalFiltered);
  }, [diaries, selectedMenu, filterStatus, searchValue, user.role]);

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const handleReset = () => {
    setSearchValue(""); // 清空搜索框的值
  };

  const dashboardData = useMemo(() => {
    const statusCounter = {
      pending: 0,
      approved: 0,
      rejected: 0,
      deleted: 0,
    };
    const authorCounter = {};
    const dailyCounter = {};

    diaries.forEach((item) => {
      if (statusCounter[item.status] !== undefined) {
        statusCounter[item.status] += 1;
      }

      const nickname = item.user?.nickname || "未知用户";
      authorCounter[nickname] = (authorCounter[nickname] || 0) + 1;

      const day = typeof item.created_at === "string" ? item.created_at.slice(0, 10) : "";
      if (day) {
        dailyCounter[day] = (dailyCounter[day] || 0) + 1;
      }
    });

    const authorRank = Object.entries(authorCounter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const trend = Object.entries(dailyCounter).sort((a, b) => a[0].localeCompare(b[0]));

    return {
      total: diaries.length,
      statusCounter,
      authorRank,
      trend,
    };
  }, [diaries]);

  useEffect(() => {
    if (selectedMenu !== "4") return;
    if (!statusChartRef.current || !authorChartRef.current || !trendChartRef.current) return;

    chartInstancesRef.current.forEach((chart) => chart.dispose());
    chartInstancesRef.current = [];

    const statusChart = echarts.init(statusChartRef.current);
    statusChart.setOption({
      title: { text: "稿件状态分布", left: "center" },
      tooltip: { trigger: "item" },
      legend: { bottom: 0 },
      series: [
        {
          type: "pie",
          radius: ["40%", "65%"],
          data: [
            { value: dashboardData.statusCounter.pending, name: "待审核" },
            { value: dashboardData.statusCounter.approved, name: "已通过" },
            { value: dashboardData.statusCounter.rejected, name: "已拒绝" },
            { value: dashboardData.statusCounter.deleted, name: "已删除" },
          ],
        },
      ],
    });

    const authorChart = echarts.init(authorChartRef.current);
    authorChart.setOption({
      title: { text: "高频投稿用户TOP5", left: "center" },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: dashboardData.authorRank.map(([name]) => name),
        axisLabel: { interval: 0, rotate: 20 },
      },
      yAxis: { type: "value" },
      series: [
        {
          type: "bar",
          data: dashboardData.authorRank.map(([, count]) => count),
          itemStyle: { color: "#1677ff" },
        },
      ],
    });

    const trendChart = echarts.init(trendChartRef.current);
    trendChart.setOption({
      title: { text: "稿件提交趋势", left: "center" },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: dashboardData.trend.map(([day]) => day),
      },
      yAxis: { type: "value" },
      series: [
        {
          type: "line",
          smooth: true,
          data: dashboardData.trend.map(([, count]) => count),
          areaStyle: {},
        },
      ],
    });

    chartInstancesRef.current = [statusChart, authorChart, trendChart];

    const handleResize = () => {
      chartInstancesRef.current.forEach((chart) => chart.resize());
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstancesRef.current.forEach((chart) => chart.dispose());
      chartInstancesRef.current = [];
    };
  }, [selectedMenu, dashboardData]);


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
            { key: "4", label: "审核仪表盘" },
          ]}
          style={{ flex: 1, minWidth: 0 }}
        />
        <span style={{ marginRight: 16, color: "#888", fontSize: 16 }}>
          当前角色：{user.role}
        </span>
        <Avatar
          src="/avatar.jpg"
          style={{ cursor: "pointer" }}
          onClick={() => setDrawerVisible(true)}
        />
      </Header>
      <Content style={{ padding: "0 48px" }}>
        <Breadcrumb style={{ margin: "20px 0", marginLeft: "20px" }}>
          <Breadcrumb.Item>审核列表</Breadcrumb.Item>
          <Breadcrumb.Item>
            {selectedMenu === "1"
              ? "待审核"
              : selectedMenu === "2"
              ? "已审核"
              : selectedMenu === "3"
              ? "回收站"
              : "审核仪表盘"}
          </Breadcrumb.Item>
        </Breadcrumb>
        {selectedMenu !== "4" && (
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
        )}
        <div style={{ margin: 20, minHeight: 380, background: "#fff", borderRadius: "8px", padding: 20 }}>
          {selectedMenu !== "4" ? (
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
                    <p style={{ margin: 0, fontSize: "12px", color: "#999", display: "flex", alignItems: "center" }}>
                      <span style={{ marginRight: 12 }}>
                        <strong>发布者：</strong>{item.user?.nickname}
                      </span>
                      <span>
                        <strong>发布时间：</strong>{item.created_at}
                      </span>
                    </p>
                  </div>
                  <Tag
                    color={
                      item.status === "pending"
                        ? "blue"
                        : item.status === "rejected"
                        ? "red"
                        : item.status === "deleted"
                        ? "gray"
                        : "green"
                    }
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
          ) : (
            <>
              <Row gutter={16}>
                <Col span={6}>
                  <Card>
                    <Statistic title="稿件总量" value={dashboardData.total} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic title="待审核" value={dashboardData.statusCounter.pending} valueStyle={{ color: "#1677ff" }} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic title="已通过" value={dashboardData.statusCounter.approved} valueStyle={{ color: "#52c41a" }} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic title="已拒绝" value={dashboardData.statusCounter.rejected} valueStyle={{ color: "#ff4d4f" }} />
                  </Card>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Card>
                    <div ref={statusChartRef} style={{ height: 320 }} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <div ref={authorChartRef} style={{ height: 320 }} />
                  </Card>
                </Col>
              </Row>
              <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Card>
                    <div ref={trendChartRef} style={{ height: 320 }} />
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </div>
        {selectedMenu !== "4" && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            <Pagination style={{ margin: "auto", textAlign: "center" }} defaultCurrent={1} total={filteredData.length} pageSize={10} />
          </div>
        )}
      </Content>
      <Footer style={{ textAlign: "center" }}>{new Date().getFullYear()}@traveldiary</Footer>
      <Drawer
        title="用户信息"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
      >
        <div style={{ textAlign: "center" }}>
          <Avatar src="/avatar.jpg" size={64} />
          <h3 style={{ marginTop: 10 }}>{user.name}</h3>
          <p>用户：{user.username}</p>
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

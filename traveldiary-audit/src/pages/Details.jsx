import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Button, message, Image } from "antd";
import { useState } from "react";
import { LeftOutlined } from "@ant-design/icons";
const { Header, Content } = Layout;

export default function Details() {
  const { state: { item, allItems, currentIndex } } = useLocation(); // 获取传递的稿件数据、所有稿件和当前索引
  const navigate = useNavigate(); // 用于返回列表页面
  const user = JSON.parse(localStorage.getItem("user")); // 获取登录用户信息
  const [currentItemIndex, setCurrentItemIndex] = useState(currentIndex); // 当前稿件索引

  // 审核选项处理
  const handleAudit = (status) => {
    message.success(`稿件已标记为${status}`);
    // 在这里可以添加实际的审核逻辑，例如调用 API
  };

  // 删除稿件处理
  const handleDelete = () => {
    message.success("稿件已移入回收站！");
    // 在这里可以添加逻辑删除的实际逻辑，例如更新状态为 "回收站"
    navigate("/");
  };

  // 切换到上一个稿件
  const handlePrevious = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
    }
  };

  // 切换到下一个稿件
  const handleNext = () => {
    if (currentItemIndex < allItems.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    }
  };

  const currentItem = allItems[currentItemIndex]; // 当前显示的稿件

  return (
    <Layout>
      {/* 固定顶部菜单 */}
      <Header
        style={{
          position: "fixed",
          top: 0,
          zIndex: 1000,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#fff",
          padding: "0 20px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Button
          icon={<LeftOutlined />}
          type="link"
          onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center" }}
        >
          返回列表
        </Button>
        <div>
          <Button type="primary" style={{ marginRight: 10 }} onClick={() => handleAudit("通过")}>
            通过
          </Button>
          <Button type="primary" danger onClick={() => handleAudit("不通过")}>
            不通过
          </Button>
          {user.role === "管理员" && (
            <Button danger onClick={handleDelete} style={{ marginLeft: 10 }}>
              删除
            </Button>
          )}
        </div>
      </Header>

      {/* 固定左右按钮 */}
      <Button
        type="primary"
        disabled={currentItemIndex === 0} // 到达第一个稿件时禁用
        onClick={handlePrevious}
        style={{
          position: "fixed",
          left: 20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1000,
        }}
      >
        上一个
      </Button>
      <Button
        type="primary"
        disabled={currentItemIndex === allItems.length - 1} // 到达最后一个稿件时禁用
        onClick={handleNext}
        style={{
          position: "fixed",
          right: 20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1000,
        }}
      >
        下一个
      </Button>

      {/* 内容部分 */}
      <Content
        style={{
          padding: "100px 100px", // 增加左右内边距，避免与按钮重叠
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: 20 }}>{currentItem.title}</h1>
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: "16px" }}>
              <strong>发布者：</strong> {currentItem.author.name}
            </p>
            <p style={{ margin: 0, fontSize: "16px" }}>
              <strong>发布时间：</strong> {currentItem.publishTime}
            </p>
          </div>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: "16px", lineHeight: "1.8" }}>{currentItem.content}</p>
          </div>
          <div style={{ marginBottom: 20 }}>
            <Image
              src={currentItem.cover}
              alt="cover"
              width={200} // 缩略图大小
              style={{ borderRadius: "8px" }}
            />
          </div>
          <video src={currentItem.video} controls style={{ width: "20%", borderRadius: "8px" }} />
        </div>
      </Content>
    </Layout>
  );
}
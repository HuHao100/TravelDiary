import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Button, Image, Modal } from "antd";
import { useState, useEffect } from "react";
import axios from "axios";
import { LeftOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;

export default function Details() {
  const { state: { id, returnFlag, filterStatus, searchValue, allItems, currentIndex } } = useLocation();
  const navigate = useNavigate();
  const [detailedItem, setDetailedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentItemIndex, setCurrentItemIndex] = useState(currentIndex);
  const [items] = useState(allItems);
  const user = JSON.parse(localStorage.getItem("user") || "{}"); // 获取当前用户信息

  useEffect(() => {
    const fetchDiaryDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/diaries/${id}`);
        setDetailedItem(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("获取游记详情失败:", error);
        Modal.error({
          title: "加载失败",
          content: "无法加载游记详情，请稍后重试。",
          centered: true,
        });
        setIsLoading(false);
      }
    };
    fetchDiaryDetails();
  }, [id]);

  if (isLoading) {
    return <div>加载中...</div>;
  }

  if (!detailedItem) {
    return <div>游记详情不存在！</div>;
  }

  // 切换到上一个游记
  const handlePrevious = () => {
    if (currentItemIndex > 0) {
      const previousItem = items[currentItemIndex - 1];
      setCurrentItemIndex(currentItemIndex - 1);
      navigate(`/details/${previousItem.id}`, {
        state: {
          id: previousItem.id,
          returnFlag,
          filterStatus,
          searchValue,
          allItems: items,
          currentIndex: currentItemIndex - 1,
        },
      });
    }
  };

  // 切换到下一个游记
  const handleNext = () => {
    if (currentItemIndex < items.length - 1) {
      const nextItem = items[currentItemIndex + 1];
      setCurrentItemIndex(currentItemIndex + 1);
      navigate(`/details/${nextItem.id}`, {
        state: {
          id: nextItem.id,
          returnFlag,
          filterStatus,
          searchValue,
          allItems: items,
          currentIndex: currentItemIndex + 1,
        },
      });
    }
  };

  // 审核按钮逻辑
  const handleAudit = (status) => {
    Modal.confirm({
      title: `确认将该游记标记为${status === "approved" ? "通过" : status === "rejected" ? "拒绝" : status === "pending" ? "恢复" : "删除"}吗？`,
      onOk: async () => {
        try {
          await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/api/diaries/updateStatus/${id}`, { status });
          Modal.success({
            title: "操作成功",
            content:
              status === "approved"
                ? "游记已标记为通过！"
                : status === "rejected"
                ? "游记已标记为拒绝！"
                : status === "pending"
                ? "游记已恢复！"
                : "游记已删除！",
            onOk: () => window.location.reload(),
          });
        } catch (error) {
          console.error("操作失败:", error);
          Modal.error({
            title: "操作失败",
            content: "操作失败，请稍后重试。",
          });
        }
      },
    });
  };

  // 判断是否为回收站
  const isDeleted = detailedItem.status === "deleted";
  const isAdmin = user.role === "管理员";

  return (
    <Layout>
      {/* 固定顶部菜单 */}
      <Header
        style={{
          position: "fixed",
          top: 0,
          zIndex: 1,
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
          onClick={() =>
            navigate(`/`, {
              state: {
                returnFlag,
                filterStatus,
                searchValue,
              },
            })
          }
          style={{ display: "flex", alignItems: "center" }}
        >
          返回列表
        </Button>
        <div>
          {/* 回收站显示恢复按钮 */}
          {isAdmin && isDeleted && (
            <Button type="primary" onClick={() => handleAudit("pending")} style={{ marginRight: 10 }}>
              恢复
            </Button>
          )}
          {/* 非回收站显示审核按钮 */}
          {!isDeleted && (
            <>
              <Button type="primary" onClick={() => handleAudit("approved")} style={{ marginRight: 10 }}>
                通过
              </Button>
              <Button type="primary" danger onClick={() => handleAudit("rejected")} style={{ marginRight: 10 }}>
                拒绝
              </Button>
            </>
          )}
          {/* 管理员显示删除按钮，回收站不显示 */}
          {isAdmin && !isDeleted && (
            <Button danger onClick={() => handleAudit("deleted")}>
              删除
            </Button>
          )}
        </div>
      </Header>

      {/* 固定左右切换按钮 */}
      <Button
        type="primary"
        disabled={currentItemIndex === 0}
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
        disabled={currentItemIndex === items.length - 1}
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
          padding: "100px 200px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: 20 }}>{detailedItem.title}</h1>
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: "16px" }}>
              <strong>发布者：</strong> {detailedItem.author.nickname}
            </p>
            <p style={{ margin: 0, fontSize: "16px" }}>
              <strong>发布时间：</strong> {detailedItem.created_at}
            </p>
            <p style={{ margin: 0, fontSize: "16px" }}>
              <strong>当前状态：</strong>
              <span style={{
                color:
                  detailedItem.status === "pending"
                    ? "#1677ff"
                    : detailedItem.status === "approved"
                    ? "#52c41a"
                    : detailedItem.status === "rejected"
                    ? "#ff4d4f"
                    : detailedItem.status === "deleted"
                    ? "#888"
                    : "#333"
              }}>
                {detailedItem.status === "pending"
                  ? "待审核"
                  : detailedItem.status === "approved"
                  ? "已通过"
                  : detailedItem.status === "rejected"
                  ? "已拒绝"
                  : detailedItem.status === "deleted"
                  ? "已删除"
                  : detailedItem.status}
              </span>
            </p>
          </div>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: "16px", lineHeight: "1.8" }}>{detailedItem.content}</p>
          </div>
          <div style={{ marginBottom: 20 }}>
            {/* 视频独占一行 */}
            {detailedItem.media
              .filter((media) => media.type === "video")
              .map((media, index) => (
                <div key={index} style={{ marginBottom: 20 }}>
                  <video
                    src={`${process.env.REACT_APP_API_BASE_URL}${media.url}`}
                    controls
                    style={{ width: "400px", borderRadius: "8px", display: "block", margin: "0" }}
                  />
                </div>
              ))}
            {/* 图片横向排列 */}
            <div style={{ display: "flex", gap: 16 }}>
              {detailedItem.media
                .filter((media) => media.type === "image")
                .map((media, index) => (
                  <Image
                    key={index}
                    src={`${process.env.REACT_APP_API_BASE_URL}${media.url}`}
                    alt="media"
                    width={200}
                    style={{ borderRadius: "8px" }}
                  />
                ))}
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
}
import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Button, Image, Modal } from "antd";
import { useState, useEffect } from "react";
import axios from "axios";
import { LeftOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;

export default function Details() {
  const { state: { id, returnFlag, filterStatus, searchValue, allItems, currentIndex } } = useLocation(); // 接收传递的路由状态
  const navigate = useNavigate(); // 用于返回列表页面
  const [detailedItem, setDetailedItem] = useState(null); // 存储后端返回的详细数据
  const [isLoading, setIsLoading] = useState(true); // 加载状态
  const [currentItemIndex, setCurrentItemIndex] = useState(currentIndex); // 当前游记索引
  const [items] = useState(allItems); // 使用传递的筛选后的游记列表

  useEffect(() => {
    const fetchDiaryDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/diaries/${id}`);
        setDetailedItem(response.data); // 更新为接口返回的详细数据
        setIsLoading(false); // 加载完成
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
      title: `确认将该游记标记为${status === "approved" ? "通过" : "拒绝"}吗？`,
      onOk: async () => {
        try {
          await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/api/diaries/${id}/status`, { status });
          Modal.success({
            title: "操作成功",
            content: `游记已标记为${status === "approved" ? "通过" : "拒绝"}！`,
          });
        } catch (error) {
          console.error("审核失败:", error);
          Modal.error({
            title: "操作失败",
            content: "审核操作失败，请稍后重试。",
          });
        }
      },
    });
  };

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
                returnFlag, // 当前菜单项
                filterStatus, // 当前筛选状态
                searchValue, // 当前搜索框的值
              },
            })
          }
          style={{ display: "flex", alignItems: "center" }}
        >
          返回列表
        </Button>
        <div>
          <Button type="primary" onClick={() => handleAudit("approved")} style={{ marginRight: 10 }}>
            通过
          </Button>
          <Button type="primary" danger onClick={() => handleAudit("rejected")}>
            拒绝
          </Button>
        </div>
      </Header>

      {/* 固定左右切换按钮 */}
      <Button
        type="primary"
        disabled={currentItemIndex === 0} // 到达第一个游记时禁用
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
        disabled={currentItemIndex === items.length - 1} // 到达最后一个游记时禁用
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
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: 20 }}>{detailedItem.title}</h1>
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: "16px" }}>
              <strong>发布者：</strong> {detailedItem.author.nickname}
            </p>
            <p style={{ margin: 0, fontSize: "16px" }}>
              <strong>发布时间：</strong> {detailedItem.created_at}
            </p>
          </div>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: "16px", lineHeight: "1.8" }}>{detailedItem.content}</p>
          </div>
          <div style={{ marginBottom: 20 }}>
            {detailedItem.media.map((media, index) => (
              <div key={index} style={{ marginBottom: 10 }}>
                {media.type === "image" ? (
                  <Image
                    src={`${process.env.REACT_APP_API_BASE_URL}${media.url}`} // 补全图片路径
                    alt="media"
                    width={200} // 缩略图大小
                    style={{ borderRadius: "8px" }}
                  />
                ) : (
                  <video
                    src={`${process.env.REACT_APP_API_BASE_URL}${media.url}`} // 补全视频路径
                    controls
                    style={{ width: "200px", borderRadius: "8px" }}
                  />
                )}
              </div>
            ))}
          </div>
          <div>
            <strong>评论：</strong>
            {detailedItem.comments.map((comment) => (
              <div key={comment.id} style={{ marginBottom: 10 }}>
                <p>
                  <strong>{comment.user}：</strong> {comment.content}
                </p>
                <p style={{ fontSize: "12px", color: "#999" }}>{comment.created_at}</p>
              </div>
            ))}
          </div>
        </div>
      </Content>
    </Layout>
  );
}
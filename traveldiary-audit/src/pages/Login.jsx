import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { users } from "../config";
import { message, Form, Input, Button, Card } from "antd";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const user = users.find((u) => u.username === username && u.password === password);

    if (user) {
      localStorage.setItem("user", JSON.stringify(user)); // 存储用户信息到本地
      message.success("登录成功！");
      navigate("/"); // 跳转到首页
    } else {
      message.error("用户名或密码错误！");
    }
  };

  return (
    
    <div style={{ display: "flex",flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f0f2f5" }}>
         <h1 style={{ marginBottom: "20px", fontSize: "24px", fontWeight: "bold", color: "#333" }}>
        欢迎使用旅游日记审核平台
      </h1>
      <Card title="登录" bordered={false} style={{ width: 300, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
        <Form
          name="login"
          layout="vertical"
          onFinish={handleLogin}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: "请输入用户名！" }]}
          >
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码！" }]}
          >
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
    
  );
}
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Details from "./pages/Details";
import Login from "./pages/Login";
import "antd/dist/reset.css";

function App() {
  const user = JSON.parse(localStorage.getItem("user")); // 获取登录用户信息

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={user ? <Home /> : <Navigate to="/login" />} // 未登录跳转到登录页面
        />
        <Route
          path="/details/:id"
          element={user ? <Details /> : <Navigate to="/login" />} // 未登录跳转到登录页面
        />
      </Routes>
    </>
  );
}

export default App;
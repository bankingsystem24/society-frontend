import React from "react";
import { Layout, Dropdown, Avatar, Space } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

const HeaderBar: React.FC = () => {
  const navigate = useNavigate();

  const username = sessionStorage.getItem("username");

  const items = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => {
        sessionStorage.clear();
        navigate("/");
      },
    },
  ];

  return (
    <Header
      style={{
        background: "#fff",
        padding: "0 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ margin: 0 }}>Society Management System</h2>

      <Dropdown menu={{ items }} placement="bottomRight">
        <Space style={{ cursor: "pointer" }}>
          <Avatar icon={<UserOutlined />} />
          {username || "Admin"}
        </Space>
      </Dropdown>
    </Header>
  );
};

export default HeaderBar;
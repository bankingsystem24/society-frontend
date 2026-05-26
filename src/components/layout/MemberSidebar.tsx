import React from "react";
import { Menu } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  DollarOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const MemberSidebar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ height: "100vh" }}>
      <div style={{ color: "white", padding: 16, fontWeight: "bold" }}>
        Member Panel
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={[
          {
            key: "/member-dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
          {
            key: "/member-bills",
            icon: <DollarOutlined />,
            label: "Bills",
          },
          {
            key: "/member-receipts",
            icon: <FileTextOutlined />,
            label: "Receipts",
          },
          {
            key: "/member-login",
            icon: <LogoutOutlined />,
            label: "Logout",
          },
        ]}
      />
    </div>
  );
};

export default MemberSidebar;
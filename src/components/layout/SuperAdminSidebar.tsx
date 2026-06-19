import React from "react";
import { Menu } from "antd";
import {
  DashboardOutlined,
  BankOutlined,
  UserOutlined,
  FileTextOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "../../App.css";

const SuperAdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ height: "100vh" }}>
      <div style={{ color: "white", padding: 16, fontWeight: "bold" }}>
        Super Admin Panel
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={[
          {
            key: "/superadmindashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
              {
                key: "/superadminusers",
                icon: <TeamOutlined />,
                label: "Users",
              },
              {
                key: "/superadmin-view-societies",
                icon: <BankOutlined />,
                label: "Societies",
              },
        ]}
      />
    </div>
  );
};

export default SuperAdminSidebar;
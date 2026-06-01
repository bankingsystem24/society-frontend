import React from "react";
import { Menu } from "antd";
import {
  DashboardOutlined,
  BankOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const AuditorSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ height: "100vh" }}>
      <div style={{ color: "white", padding: 16, fontWeight: "bold" }}>
        Auditor Panel
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={[
          {
            key: "/auditordashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
          {
            key: "users",
            icon: <UserOutlined />,
            label: "Users",
            children: [
              {
                key: "/auditorusers",
                label: "User List",
              },
              {
                key: "/auditor-view-societies",
                label: "Society List",
              },
            ],
          },
        ]}
      />
    </div>
  );
};

export default AuditorSidebar;
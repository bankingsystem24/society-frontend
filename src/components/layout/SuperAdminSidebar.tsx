import React from "react";
import { Menu } from "antd";
import {
  DashboardOutlined,
  BankOutlined,
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const SuperAdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <div
        style={{
          height: 64,
          color: "#fff",
          textAlign: "center",
          lineHeight: "64px",
          fontSize: 16,
          fontWeight: "bold",
        }}
      >
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
            label: "Society List",
          },
          {
            key: "/set-society",
            icon: <BankOutlined />,
            label: "Set Society",
          },
          {
            key: "/view-receipts",
            label: "Receipts",
          },
          {
            key: "Reports",
            icon: <UserOutlined />,
            label: "Reports",
            children: [
              {
                key: "/view-journal",
                label: "View Journal",
                icon: <HomeOutlined />,
              },
              {
                key: "/view-ledger",
                label: "View Ledger",
                icon: <HomeOutlined />,
              },
              {
                key: "/trial-balance",
                label: "Trial Balance",
                icon: <HomeOutlined />,
              },
              {
                key: "/profit-and-loss",
                label: "Profit & Loss",
                icon: <HomeOutlined />,
              },
            ],
          },
        ]}
      />
    </>
  );
};

export default SuperAdminSidebar;
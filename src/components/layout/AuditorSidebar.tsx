import React from "react";
import { Menu } from "antd";
import {
  DashboardOutlined,
  BankOutlined,
  UserOutlined,
  FileTextOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "../../App.css";

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
            key: "/auditorusers",
            label: "Users",
          },
          {
            key: "/auditorsocieties",
            label: "Society List",
          },
          {
            key: "/financial-year",
            label: "Financial Year",
          },
          {
            key: "/set-society",
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
    </div>
  );
};

export default AuditorSidebar;
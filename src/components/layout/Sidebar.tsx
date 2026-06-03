import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  ApartmentOutlined,
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      collapsible
      onCollapse={(collapsed) => setCollapsed(collapsed)}
    >
      <div
        style={{
          height: 64,
          color: "#fff",
          textAlign: "center",
          lineHeight: "64px",
          fontSize: 20,
          fontWeight: "bold",
        }}
      >
        Logo
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={[
          {
            key: "/clientdashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
          {
            key:"/financial-year",
            label:"Set Financial Year"
          },
          {
            key: "/wings",
            icon: <ApartmentOutlined />,
            label: "Wings",

          },
          {
            key: "/flats",
            icon: <HomeOutlined />,
            label: "Flats",
          },
          {
            key: "/members",
            icon: <TeamOutlined />,
            label: "Members",
          },
          {
            key: "/users",
            icon: <UserOutlined />,
            label: "Users",
          },
          {
            key: "Bills",
            icon: <UserOutlined />,
            label: "Bills",
            children: [
              {
                key: "/bill-generate",
                label: "Generate Bill",
                icon: <HomeOutlined />,
              },
              {
                key: "/view-bills",
                label: "View Bills",
                icon: <HomeOutlined />,
              },
            ],
          },
          {
            key: "Expenses",
            icon: <UserOutlined />,
            label: "Expenses",
            children: [
              {
                key: "/add-expenses",
                label: "Add Expense",
                icon: <HomeOutlined />,
              },
              {
                key: "/view-expenses",
                label: "View Expenses",
                icon: <HomeOutlined />,
              },
            ],
          },
          {
            key: "Receipts",
            icon: <UserOutlined />,
            label: "Receipts",
            children: [
              {
                key: "/view-receipts",
                label: "View Receipts",
                icon: <HomeOutlined />,
              },
            ],
          },
          {
            key: "Reports 1",
            icon: <UserOutlined />,
            label: "Reports 1",
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
            ],
          },

        ]}
      />
    </Sider>
  );
};

export default Sidebar;

import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  ApartmentOutlined,
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "../../App.css";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sider
      width={250}
      breakpoint="md"
      collapsedWidth={0}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      style={{
        height: "100vh",
      }}
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
            key: "/financial-year",
            label: "Set Financial Year",
          },
          {
            key: "/Policies",
            label: "Policies",
            children:[
              {
                key: "/billing-policy",
                label: "Billing Policy",
              },
              {
                key: "/discount-policy",
                label: "Discount Policy",
              },
            ],
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
            key: "general-ledger",
            icon: <DollarOutlined />,
            label: "General Ledger",
            children: [
              {
                key: "/gl-master",
                label: "Master",
                icon: <UserOutlined />,
              },
              {
                key: "/gl-balances",
                label: "Balances",
                icon: <UserOutlined />,
              },
            ],
          },

          {
            key: "/add-expenses",
            icon: <UserOutlined />,
            label: "Expenses",
          },
          {
            key: "/vendors",
            icon: <UserOutlined />,
            label: "Vendors",
          },
          {
            key: "Bills",
            icon: <UserOutlined />,
            label: "Bills",
            children: [
              {
                key: "/bill-generate",
                label: "Generate",
                icon: <HomeOutlined />,
              },
              {
                key: "/view-bills",
                label: "View",
                icon: <HomeOutlined />,
              },
              {
                key: "/pending-bills",
                label: "Pay Online",
                icon: <HomeOutlined />,
              },
            ],
          },
          {
            key: "Sinking Fund",
            icon: <UserOutlined />,
            label: "Sinking Fund",
            children: [
              {
                key: "/generate-sinking-fund",
                label: "Generate",
                icon: <HomeOutlined />,
              },
              {
                key: "/view-sinking-fund",
                label: "View",
                icon: <HomeOutlined />,
              },
              {
                key: "/pending-sinking-funds",
                label: "Pay Online",
                icon: <HomeOutlined />,
              },
            ],
          },
          {
            key: "Contributions",
            icon: <UserOutlined />,
            label: "Contributions",
            children: [
              {
                key: "/generate-contribution",
                label: "Add",
                icon: <HomeOutlined />,
              },
              {
                key: "/view-contribution",
                label: "View",
                icon: <HomeOutlined />,
              },
              {
                key: "/payonline-contribution",
                label: "Pay Online",
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
    </Sider>
  );
};

export default Sidebar;

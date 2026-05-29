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
            key: "wings",
            icon: <ApartmentOutlined />,
            label: "Wings",
            children: [
              {
                key: "/wings",
                label: "Wing List",
              },
              {
                key: "/create-wing",
                label: "Create Wing",
              },
            ],
          },
          {
            key: "flats",
            icon: <HomeOutlined />,
            label: "Flats",
            children: [
              {
                key: "/flats",
                label: "Flat List",
              },
              {
                key: "/create-flat",
                label: "Create Flat",
              },
            ],
          },
          {
            key: "members",
            icon: <TeamOutlined />,
            label: "Members",
            children: [
              {
                key: "/members",
                label: "Member List",
              },
              {
                key: "/create-member",
                label: "Create Member",
              },
            ],
          },
          {
            key: "users",
            icon: <UserOutlined />,
            label: "Users",
            children: [
              {
                key: "/users",
                label: "User List",
              },
              {
                key: "/create-user",
                label: "Create User",
              },
            ],
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
            key: "Receipts",
            icon: <UserOutlined />,
            label: "Receipts",
            children: [
              // {
              //   key: "/generate-receipt",
              //   label: "Generate Receipt",
              //   icon: <HomeOutlined />,
              // },
              {
                key: "/view-receipts",
                label: "View Receipts",
                icon: <HomeOutlined />,
              },
            ],
          },
          {
            key: "Journal",
            icon: <UserOutlined />,
            label: "Journal",
            children: [
              {
                key: "/view-journal",
                label: "View Journal",
                icon: <HomeOutlined />,
              },
            ],
          },
          {
            key: "Ledger",
            icon: <UserOutlined />,
            label: "Ledger",
            children: [
              {
                key: "/view-ledger",
                label: "View Ledger",
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

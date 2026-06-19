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
import "../../App.css"
const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const onOpenChange = (keys: string[]) => {
  setOpenKeys(keys);
};

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <Sider
      width={240} // ✅ FIXED WIDTH REQUIRED
      breakpoint="lg"
      collapsedWidth={0}
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          height: 64,
          color: "#fff",
          textAlign: "center",
          lineHeight: "64px",
          fontSize: 15,
          fontWeight: "bold",
        }}
      >
        Admin Panel
      </div>

      {/* MENU (NO EXTRA DIV) */}
      <Menu
        theme="dark"
        mode="inline"
        style={{ lineHeight:"30px", fontSize:10}}
        selectedKeys={[location.pathname]}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        onClick={({ key }) => {
          if (key === "logout") handleLogout();
          else navigate(key);
        }}
        items={[
          {
            key: "/admindashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
          { key: "/financial-year", label: "Set Financial Year" },

          {
            key: "Policies",
            label: "Policies",
            children: [
              { key: "/billing-policy", label: "Billing Policy" },
              { key: "/discount-policy", label: "Discount Policy" },
            ],
          },

          { key: "/wings", icon: <ApartmentOutlined />, label: "Wings" },
          { key: "/flats", icon: <HomeOutlined />, label: "Flats" },
          { key: "/members", icon: <TeamOutlined />, label: "Members" },
          { key: "/users", icon: <UserOutlined />, label: "Users" },

          {
            key: "general-ledger",
            icon: <DollarOutlined />,
            label: "General Ledger",
            children: [
              { key: "/gl-master", label: "Master" },
              { key: "/gl-balances", label: "Balances" },
            ],
          },

          { key: "/add-expenses", label: "Expenses" },
          { key: "/vendors", label: "Vendors" },

          {
            key: "Bills",
            label: "Bills",
            children: [
              { key: "/bill-generate", label: "Generate" },
              { key: "/view-bills", label: "View" },
              { key: "/pending-bills", label: "Pay Online" },
            ],
          },

          {
            key: "Sinking Fund",
            label: "Sinking Fund",
            children: [
              { key: "/generate-sinking-fund", label: "Generate" },
              { key: "/view-sinking-fund", label: "View" },
              { key: "/sinking-funds", label: "Pay Online" },
            ],
          },

          {
            key: "Contributions",
            label: "Contributions",
            children: [
              { key: "/generate-contribution", label: "Add" },
              { key: "/view-contribution", label: "View" },
              { key: "/contributions", label: "Pay Online" },
            ],
          },
          {
            key: "/view-receipts",
            label: "Receipts",
            icon: <HomeOutlined />,
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

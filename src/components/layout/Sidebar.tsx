import React, { useState, useEffect } from "react";
import { Layout, Menu, Drawer, Button } from "antd";
import {
  DashboardOutlined,
  ApartmentOutlined,
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
  DollarOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const path = location.pathname;

    if (["/billing-policy", "/discount-policy"].includes(path)) {
      setOpenKeys(["Policies"]);
    } else if (["/gl-master", "/gl-balances"].includes(path)) {
      setOpenKeys(["general-ledger"]);
    } else if (
      ["/bill-generate", "/view-bills", "/member-paying-maintenance"].includes(
        path
      )
    ) {
      setOpenKeys(["Bills"]);
    } else if (
      [
        "/generate-sinking-fund",
        "/view-sinking-fund",
        "/sinking-funds",
      ].includes(path)
    ) {
      setOpenKeys(["Sinking Fund"]);
    } else if (
      [
        "/generate-contribution",
        "/view-contribution",
        "/contributions",
      ].includes(path)
    ) {
      setOpenKeys(["Contributions"]);
    } else if (
      [
        "/view-journal",
        "/view-ledger",
        "/trial-balance",
        "/profit-and-loss",
      ].includes(path)
    ) {
      setOpenKeys(["Reports"]);
    }
  }, [location.pathname]);

  const menuItems = [
    {
      key: "/admindashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/financial-year",
      label: "Set Financial Year",
    },
    {
      key: "/gl-mapping",
      label: "GL Mapping",
    },
    {
      key: "Policies",
      label: "Policies",
      children: [
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
        },
        {
          key: "/gl-balances",
          label: "Balances",
        },
      ],
    },

    {
      key: "/add-expenses",
      label: "Expenses",
    },
    {
      key: "/vendors",
      label: "Vendors",
    },

    {
      key: "Bills",
      label: "Bills",
      children: [
        {
          key: "/bill-generate",
          label: "Generate",
        },
        {
          key: "/view-bills",
          label: "View",
        },
        {
          key: "/member-paying-maintenance",
          label: "Pay Online",
        },
      ],
    },

    {
      key: "Sinking Fund",
      label: "Sinking Fund",
      children: [
        {
          key: "/generate-sinking-fund",
          label: "Generate",
        },
        {
          key: "/view-sinking-fund",
          label: "View",
        },
        {
          key: "/sinking-funds",
          label: "Pay Online",
        },
      ],
    },

    {
      key: "Contributions",
      label: "Contributions",
      children: [
        {
          key: "/generate-contribution",
          label: "Add",
        },
        {
          key: "/view-contribution",
          label: "View",
        },
        {
          key: "/contributions",
          label: "Pay Online",
        },
      ],
    },
    {
      key: "/verify-payment",
      label: "Verify Payment",
      icon: <HomeOutlined />,
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
        },
        {
          key: "/view-ledger",
          label: "View Ledger",
        },
        {
          key: "/trial-balance",
          label: "Trial Balance",
        },
        {
          key: "/profit-and-loss",
          label: "Profit & Loss",
        },
      ],
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      handleLogout();
    } else {
      navigate(key);
      setMobileOpen(false);
    }
  };

  const menuComponent = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      onClick={handleMenuClick}
      items={menuItems}
      style={{
        fontSize: 13,
      }}
    />
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        type="primary"
        icon={<MenuOutlined />}
        onClick={() => setMobileOpen(true)}
        className="mobile-menu-btn"
      />

      {/* Mobile Drawer */}
      <Drawer
        title="Admin Panel"
        placement="left"
        size={260}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        styles ={{ body : {padding: 0 } }}
      >
        {menuComponent}
      </Drawer>

      {/* Desktop Sidebar */}
      <Sider
        width={240}
        breakpoint="lg"
        collapsedWidth={0}
        className="desktop-sidebar"
        style={{
          height: "100vh",
          position: "sticky",
          top: 0,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
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
          Admin Panel
        </div>

        {menuComponent}
      </Sider>
    </>
  );
};

export default Sidebar;
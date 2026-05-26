import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  DollarOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;

const MemberSidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleMenuClick = (key: string) => {
    if (key === "dashboard") navigate("/member/dashboard");
    if (key === "bills") navigate("/member/bills");
    if (key === "receipts") navigate("/member/receipts");
    if (key === "profile") navigate("/member/profile");
    if (key === "logout") {
      sessionStorage.clear();
      navigate("/login");
    }
  };

  return (
    <Sider
      width={240}
      style={{
        minHeight: "100vh",
        background: "#001529",
      }}
    >
      <div
        style={{
          color: "white",
          fontSize: 18,
          textAlign: "center",
          padding: 16,
          fontWeight: "bold",
        }}
      >
        Member Panel
      </div>

      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["dashboard"]}
        onClick={(e) => handleMenuClick(e.key)}
        items={[
          {
            key: "dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
          {
            key: "bills",
            icon: <DollarOutlined />,
            label: "Bills",
          },
          {
            key: "receipts",
            icon: <FileTextOutlined />,
            label: "Receipts",
          },
          {
            key: "profile",
            icon: <UserOutlined />,
            label: "Profile",
          },
          {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Logout",
          },
        ]}
      />
    </Sider>
  );
};

export default MemberSidebar;
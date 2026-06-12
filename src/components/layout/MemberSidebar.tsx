import React, { useState } from "react";
import { Menu } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  DollarOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Sider from "antd/es/layout/Sider";

const MemberSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      collapsible
      onCollapse={(collapsed) => setCollapsed(collapsed)}
     
      style={{
        overflow: "auto",
        height: "100vh",
      }}
    >
    <div style={{ height: "100vh" }}>
      <div style={{ color: "white", padding: 16, fontWeight: "bold" }}>
        Member Panel
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={[
          {
            key: "/member-dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
          {
            key: "/member-pending-bills",
            icon: <DollarOutlined />,
            label: "Pending Bills",
          },
          {
            key: "/member-bills",
            icon: <DollarOutlined />,
            label: "Paid Bills",
          },



          {
            key: "/member-sinking-funds",
            icon: <DollarOutlined />,
            label: "Pending Funds",
          },


          {
            key: "/member-login",
            icon: <LogoutOutlined />,
            label: "Logout",
          },
        ]}
      />
    </div>
    </Sider>
  );
};

export default MemberSidebar;
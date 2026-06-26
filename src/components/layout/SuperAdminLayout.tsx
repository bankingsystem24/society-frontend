import React, { useState } from "react";
import { Layout as AntLayout, Drawer, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { Outlet } from "react-router-dom";
import SuperAdminHeaderBar from "./SuperAdminHeader";
import SuperAdminSidebar from "./SuperAdminSidebar";

const { Content, Sider } = AntLayout;

const SuperAdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      <Sider
        width={220}
        breakpoint="lg"
        collapsedWidth={0}
        className="desktop-sidebar"
      >
        <SuperAdminSidebar />
      </Sider>

      {/* Mobile Sidebar */}
      <Drawer
        placement="left"
        width={220}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        styles={{ body : {padding: 0} }}
      >
        <SuperAdminSidebar />
      </Drawer>

      <AntLayout>
        {/* Mobile Menu Button */}
        <Button
          icon={<MenuOutlined />}
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
        />

        <SuperAdminHeaderBar />

        <Content
          style={{
            margin: 20,
            padding: 20,
            background: "#fff",
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default SuperAdminLayout;
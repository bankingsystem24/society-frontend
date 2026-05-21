import React from "react";
import { Layout as AntLayout } from "antd";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import HeaderBar from "./Header";

const { Content } = AntLayout;

const Layout: React.FC = () => {
  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      
      {/* Sidebar */}
      <Sidebar />

      <AntLayout>
        
        {/* Header */}
        <HeaderBar />

        {/* Page Content */}
        <Content
          style={{
            margin: "20px",
            padding: "20px",
            background: "#fff",
            borderRadius: "10px",
          }}
        >
          <Outlet />
        </Content>

      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
import React from "react";
import { Layout as AntLayout } from "antd";
import { Outlet } from "react-router-dom";
import SuperAdminHeaderBar from "./SuperAdminHeader";
import SuperAdminSidebar from "./SuperAdminSidebar";

const { Content } = AntLayout;

const SuperAdminLayout: React.FC = () => {
  return (
<AntLayout style={{ minHeight: "100vh" }}>

  {/* SIDEBAR */}
  <AntLayout.Sider width={220}>
    <SuperAdminSidebar />
  </AntLayout.Sider>

  {/* MAIN AREA */}
  <AntLayout>

    {/* HEADER */}
    <SuperAdminHeaderBar />

    {/* CONTENT */}
    <Content style={{ margin: 20, padding: 20, background: "#fff" }}>
      <Outlet />
    </Content>

  </AntLayout>

</AntLayout>
  );
};

export default SuperAdminLayout;
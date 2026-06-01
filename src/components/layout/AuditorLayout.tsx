import React from "react";
import { Layout as AntLayout } from "antd";
import { Outlet } from "react-router-dom";
import AuditorSidebar from "./AuditorSidebar";
import AuditorHeaderBar from "./AuditorHeader";

const { Content } = AntLayout;

const AuditorLayout: React.FC = () => {
  return (
<AntLayout style={{ minHeight: "100vh" }}>

  {/* SIDEBAR */}
  <AntLayout.Sider width={220}>
    <AuditorSidebar />
  </AntLayout.Sider>

  {/* MAIN AREA */}
  <AntLayout>

    {/* HEADER */}
    <AuditorHeaderBar />

    {/* CONTENT */}
    <Content style={{ margin: 20, padding: 20, background: "#fff" }}>
      <Outlet />
    </Content>

  </AntLayout>

</AntLayout>
  );
};

export default AuditorLayout;
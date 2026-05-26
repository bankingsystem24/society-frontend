import React from "react";
import { Layout } from "antd";
import MemberSidebar from "../../components/layout/MemberSidebar";
import MemberHeader from "../../components/layout/MemberHeader";

const { Content } = Layout;

const MemberReceipts: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>

      {/* SIDEBAR */}
      <Layout.Sider
        breakpoint="lg"
        collapsedWidth="0"
      >
        <MemberSidebar />
      </Layout.Sider>

      {/* MAIN */}
      <Layout>

        {/* HEADER */}
        <MemberHeader />

        {/* CONTENT */}
        <Content
          style={{
            padding: 24,
            background: "#f0f5ff",
            minHeight: "100vh",
          }}
        >
          <h2>Member Bills</h2>

          <p>Here you will show all Receipts for the member.</p>

        </Content>

      </Layout>
    </Layout>
  );
};

export default MemberReceipts;
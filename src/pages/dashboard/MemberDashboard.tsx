import React, { useEffect, useState } from "react";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Layout,
} from "antd";

import {FileDoneOutlined,DollarOutlined,} from "@ant-design/icons";
import axios from "axios";


const { Content } = Layout;
const { Title } = Typography;
const BASE_URL = import.meta.env.VITE_API_URL;


const MemberDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    pendingMaintenance: 0,
    paidMaintenance: 0,
    receipts: 0,
    pendingFunds:0,
    paidFunds:0,
    pendingContributions:0,
    paidContributions:0
  });
  const memberName = sessionStorage.getItem("userName");
  const societyName = sessionStorage.getItem("societyName");
  const memberId = sessionStorage.getItem("memberId");
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
  
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/member/dashboard`,{memberId: Number(memberId),financialYearId:financialYearId});

        console.log("Data",res.data);
      setStats({
        pendingMaintenance:res.data.pendingMaintenance || 0,
        paidMaintenance:res.data.paidMaintenance || 0,
        receipts:res.data.receiptCount || 0,
        pendingFunds:res.data.pendingFunds || 0,
        paidFunds:res.data.paidFunds || 0,
        pendingContributions:res.data.pendingContributions || 0,
        paidContributions:res.data.paidContributions || 0,
      });

    } catch (error) {

      console.error(
        "Error loading member dashboard",
        error
      );

    }
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: 12,
    boxShadow:
      "0 4px 12px rgba(22, 119, 255, 0.15)",

    border: "1px solid #d6e4ff",
  };

  return (
  <Layout style={{ minHeight: "100vh" }}>

    {/* SIDEBAR (RESPONSIVE) */}
    <Layout.Sider
      breakpoint="lg"
      collapsedWidth="0"
      style={{
        background: "#001529",
      }}
    >
      <MemberSidebar />
    </Layout.Sider>

    {/* MAIN LAYOUT */}
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

        <Title
          level={2}
          style={{
            color: "#1677ff",
            marginBottom: 8,
          }}
        >
          Member Dashboard
        </Title>

        {/* RESPONSIVE GRID */}
        <Row gutter={[16, 16]}>
          
          <Col xs={24} sm={12} md={8}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Pending Maintenance</span>}
                value={stats.pendingMaintenance}
                prefix={<DollarOutlined style={{ color: "#ff4d4f" }} />}
                suffix="₹"
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Pending Sinking Funds</span>}
                value={stats.pendingFunds}
                prefix={<DollarOutlined style={{ color: "#ff4d4f" }} />}
                suffix="₹"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Pending Contributions</span>}
                value={stats.pendingContributions}
                prefix={<DollarOutlined style={{ color: "#ff4d4f" }} />}
                suffix="₹"
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Paid Maintenance</span>}
                value={stats.paidMaintenance}
                prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
                suffix="₹"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Paid Funds</span>}
                value={stats.paidFunds}
                prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
                suffix="₹"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Paid Contributions</span>}
                value={stats.paidContributions}
                prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
                suffix="₹"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Receipts</span>}
                value={stats.receipts}
                prefix={<FileDoneOutlined style={{ color: "#1677ff" }} />}
              />
            </Card>
          </Col>

        </Row>

      </Content>

    </Layout>
  </Layout>
);

};

export default MemberDashboard;
import React, { useEffect, useState } from "react";
import {
  Layout,
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Space,
  Progress,
  Avatar,
} from "antd";

import {
  CalendarOutlined,
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
  DollarCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BankOutlined,
} from "@ant-design/icons";

import axios from "axios";
import { apiGet } from "../../api/axios";

import "../../App.css";

import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";

import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";

import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";

import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const BASE_URL = import.meta.env.VITE_API_URL;

interface DashboardStats {
  wings: number;
  flats: number;
  members: number;
  users: number;
}

interface MemberDashboard {
  pendingMaintenance: number;
  paidMaintenance: number;
  receipts: number;
  pendingFunds: number;
  paidFunds: number;
  pendingContributions: number;
  paidContributions: number;
}

const cardStyle: React.CSSProperties = {
  borderRadius: 16,
  border: 0,
  overflow: "hidden",
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
};

const statValueStyle = {
  color: "#1677ff",
  fontWeight: 700,
};

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  color,
}) => (
  <Card hoverable style={cardStyle}>
    <Row align="middle" justify="space-between">
      <Col>
        <Text
          style={{
            color: "#888",
            fontWeight: 500,
          }}
        >
          {title}
        </Text>

        <Title
          level={3}
          style={{
            marginTop: 10,
            marginBottom: 0,
            color,
          }}
        >
          {value}
        </Title>
      </Col>

      <Col>
        <Avatar
          size={58}
          style={{
            background: `${color}20`,
            color,
          }}
          icon={icon}
        />
      </Col>
    </Row>
  </Card>
);

const AdminDashboard: React.FC = () => {
  const role = sessionStorage.getItem("role");

  const [financialYear, setFinancialYear] = useState("-");

  const [stats, setStats] = useState<DashboardStats>({
    wings: 0,
    flats: 0,
    members: 0,
    users: 0,
  });

  const [memberStats, setMemberStats] = useState<MemberDashboard>({
    pendingMaintenance: 0,
    paidMaintenance: 0,
    receipts: 0,
    pendingFunds: 0,
    paidFunds: 0,
    pendingContributions: 0,
    paidContributions: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    await Promise.all([
      loadFinancialYear(),
      loadStats(),
      loadMemberDashboard(),
    ]);
  };

  const loadFinancialYear = async () => {
    try {
      const societyId = sessionStorage.getItem("societyId");

      const res = await apiGet(
        `/accounting-year/${societyId}/active`
      );

      setFinancialYear(res.fyCode || "-");
    } catch {
      setFinancialYear("-");
    }
  };

  const loadStats = async () => {
    try {
      const societyId = sessionStorage.getItem("societyId");

      const [wingRes, flatRes, memberRes, userRes] =
        await Promise.all([
          apiGet(`/wings?societyId=${societyId}`),
          apiGet(`/flats?societyId=${societyId}`),
          apiGet(`/members?societyId=${societyId}`),
          apiGet(`/users?societyId=${societyId}`),
        ]);

      setStats({
        wings: wingRes.length,
        flats: flatRes.length,
        members: memberRes.length,
        users: userRes.length,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const loadMemberDashboard = async () => {
    try {
      const memberId = Number(
        sessionStorage.getItem("memberId")
      );

      const financialYearId = Number(
        sessionStorage.getItem("financialYearId")
      );

      const res = await axios.post(
        `${BASE_URL}/member/dashboard`,
        {
          memberId,
          financialYearId,
        }
      );

      setMemberStats({
        pendingMaintenance:
          res.data.pendingMaintenance ?? 0,

        paidMaintenance:
          res.data.paidMaintenance ?? 0,

        receipts:
          res.data.receiptCount ?? 0,

        pendingFunds:
          res.data.pendingFunds ?? 0,

        paidFunds:
          res.data.paidFunds ?? 0,

        pendingContributions:
          res.data.pendingContributions ?? 0,

        paidContributions:
          res.data.paidContributions ?? 0,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={role === "MEMBER" ? 200 : 250}
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {role === "ADMIN" ? (
          <Sidebar />
        ) : role === "MEMBER" ? (
          <MemberSidebar />
        ) : role === "SUPER_ADMIN" ? (
          <SuperAdminSidebar />
        ) : (
          <AuditorSidebar />
        )}
      </Sider>

      <Layout>

        {role === "ADMIN" ? (
          <Header />
        ) : role === "MEMBER" ? (
          <MemberHeader />
        ) : role === "SUPER_ADMIN" ? (
          <SuperAdminHeader />
        ) : (
          <AuditorHeader />
        )}

        <Content
          style={{
            padding: 24,
            background: "#f5f7fb",
          }}
        >
          <Space
            direction="vertical"
            size={24}
            style={{ width: "100%" }}
          >
            <div>
              <Title level={2}>
                Dashboard
              </Title>
            </div>

            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12} lg={6}>
                <DashboardCard
                  
                  title="Financial Year"
                  value={financialYear}
                  color="#1677ff"
                  icon={<CalendarOutlined />}
                />
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <DashboardCard
                  title="Wings"
                  value={stats.wings}
                  color="#52c41a"
                  icon={<HomeOutlined />}
                />
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <DashboardCard
                  title="Flats"
                  value={stats.flats}
                  color="#722ed1"
                  icon={<BankOutlined />}
                />
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <DashboardCard
                  title="Members"
                  value={stats.members}
                  color="#fa8c16"
                  icon={<TeamOutlined />}
                />
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <DashboardCard
                  title="Users"
                  value={stats.users}
                  color="#13c2c2"
                  icon={<UserOutlined />}
                />
              </Col>
            </Row>

            {/* ===========================
                 MEMBER PAYMENT SUMMARY
            ============================ */}

            <Card
              title="Member Payment Summary"
              style={cardStyle}
            >
              <Row gutter={[20, 20]}>
                <Col xs={24} md={6}>
                  <DashboardCard
                    title="Pending Maintenance"
                    value={memberStats.pendingMaintenance}
                    color="#ff4d4f"
                    icon={<ClockCircleOutlined />}
                  />
                </Col>

                <Col xs={24} md={6}>
                  <DashboardCard
                    title="Paid Maintenance"
                    value={memberStats.paidMaintenance}
                    color="#52c41a"
                    icon={<CheckCircleOutlined />}
                  />
                </Col>

                <Col xs={24} md={6}>
                  <DashboardCard
                    title="Receipts"
                    value={memberStats.receipts}
                    color="#1677ff"
                    icon={<DollarCircleOutlined />}
                  />
                </Col>
              </Row>

              <Row
                gutter={[20, 20]}
                style={{ marginTop: 20 }}
              >
                <Col xs={24} md={6}>
                  <DashboardCard
                    title="Pending Funds"
                    value={memberStats.pendingFunds}
                    color="#fa8c16"
                    icon={<ClockCircleOutlined />}
                  />
                </Col>

                <Col xs={24} md={6}>
                  <DashboardCard
                    title="Paid Funds"
                    value={memberStats.paidFunds}
                    color="#52c41a"
                    icon={<CheckCircleOutlined />}
                  />
                </Col>

                <Col xs={24} md={6}>
                  <DashboardCard
                    title="Pending Contribution"
                    value={memberStats.pendingContributions}
                    color="#eb2f96"
                    icon={<ClockCircleOutlined />}
                  />
                </Col>

                <Col xs={24} md={6}>
                  <DashboardCard
                    title="Paid Contribution"
                    value={memberStats.paidContributions}
                    color="#13c2c2"
                    icon={<CheckCircleOutlined />}
                  />
                </Col>
              </Row>
            </Card>

            {/* ===========================
                  COLLECTION OVERVIEW
            ============================ */}

            <Row gutter={[20, 20]}>
              <Col xs={24} lg={6}>
                <Card
                  title="Maintenance Collection"
                  style={cardStyle}
                >
                  <Statistic
                    title="Collected"
                    value={memberStats.paidMaintenance}
                    valueStyle={statValueStyle}
                  />

                  <Progress
                    percent={
                      memberStats.pendingMaintenance +
                        memberStats.paidMaintenance ===
                      0
                        ? 0
                        : Math.round(
                            (memberStats.paidMaintenance /
                              (memberStats.pendingMaintenance +
                                memberStats.paidMaintenance)) *
                              100
                          )
                    }
                    status="active"
                  />
                </Card>
              </Col>

              <Col xs={24} lg={6}>
                <Card
                  title="Fund Collection"
                  style={cardStyle}
                >
                  <Statistic
                    title="Collected"
                    value={memberStats.paidFunds}
                    valueStyle={statValueStyle}
                  />

                  <Progress
                    percent={
                      memberStats.pendingFunds +
                        memberStats.paidFunds ===
                      0
                        ? 0
                        : Math.round(
                            (memberStats.paidFunds /
                              (memberStats.pendingFunds +
                                memberStats.paidFunds)) *
                              100
                          )
                    }
                    status="active"
                  />
                </Card>
              </Col>
              <Col  xs={24} lg={6}>
                <Card
                  title="Contribution Collection"
                  style={cardStyle}
                >
                  <Statistic
                    title="Collected"
                    value={memberStats.paidContributions}
                    valueStyle={statValueStyle}
                  />

                  <Progress
                    percent={
                      memberStats.pendingContributions +
                        memberStats.paidContributions ===
                      0
                        ? 0
                        : Math.round(
                            (memberStats.paidContributions /
                              (memberStats.pendingContributions +
                                memberStats.paidContributions)) *
                              100
                          )
                    }
                    status="active"
                  />
                </Card>
              </Col>
            </Row>

            {/* ===========================
                  QUICK OVERVIEW
            ============================ */}

            <Row gutter={[20, 20]}>
              <Col xs={24} md={6}>
                <Card style={cardStyle}>
                  <Statistic
                    title="Total Pending Items"
                    value={
                      memberStats.pendingMaintenance +
                      memberStats.pendingFunds +
                      memberStats.pendingContributions
                    }
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{
                      color: "#ff4d4f",
                    }}
                  />
                </Card>
              </Col>

              <Col xs={24} md={6}>
                <Card style={cardStyle}>
                  <Statistic
                    title="Total Paid Items"
                    value={
                      memberStats.paidMaintenance +
                      memberStats.paidFunds +
                      memberStats.paidContributions
                    }
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{
                      color: "#52c41a",
                    }}
                  />
                </Card>
              </Col>

              <Col xs={24} md={6}>
                <Card style={cardStyle}>
                  <Statistic
                    title="Receipts Generated"
                    value={memberStats.receipts}
                    prefix={<DollarCircleOutlined />}
                    valueStyle={{
                      color: "#1677ff",
                    }}
                  />
                </Card>
              </Col>
            </Row>

          </Space>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Typography } from "antd";
import {
  CalendarOutlined,
  HomeOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { apiGet } from "../../api/axios";
import axios from "axios";
import "../../App.css";

const { Title } = Typography;
const BASE_URL = import.meta.env.VITE_API_URL;

const memberId = Number(sessionStorage.getItem("memberId"));
const financialYearId = Number(sessionStorage.getItem("financialYearId"));

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    wings: 0,
    flats: 0,
    members: 0,
    users: 0,
  });

  const [memberStats, setMemberStats] = useState({
    pendingMaintenance: 0,
    paidMaintenance: 0,
    receipts: 0,
    pendingFunds: 0,
    paidFunds: 0,
    pendingContributions: 0,
    paidContributions: 0,
  });

  const loadMemberDashboard = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/member/dashboard`, {
        memberId: Number(memberId),
        financialYearId: financialYearId,
      });

      console.log("Data", res.data);
      setMemberStats({
        pendingMaintenance: res.data.pendingMaintenance || 0,
        paidMaintenance: res.data.paidMaintenance || 0,
        receipts: res.data.receiptCount || 0,
        pendingFunds: res.data.pendingFunds || 0,
        paidFunds: res.data.paidFunds || 0,
        pendingContributions: res.data.pendingContributions || 0,
        paidContributions: res.data.paidContributions || 0,
      });
    } catch (error) {
      console.error("Error loading member dashboard", error);
    }
  };

  const [financialYear, setFinancialYear] = useState<string>("-");

  useEffect(() => {
    loadStats();
    loadFinancialYear();
    loadMemberDashboard();
  }, []);

  const loadFinancialYear = async () => {
    try {
      const societyId = sessionStorage.getItem("societyId");

      const res = await apiGet(`/accounting-year/${societyId}/active`);

      setFinancialYear(res.fyCode || "-");
    } catch (error) {
      console.error("Error loading financial year", error);
      setFinancialYear("-");
    }
  };

  const loadStats = async () => {
    try {
      const societyId = sessionStorage.getItem("societyId");

      const [wingRes, flatRes, memRes, userRes] = await Promise.all([
        apiGet(`/wings?societyId=${societyId}`),
        apiGet(`/flats?societyId=${societyId}`),
        apiGet(`/members?societyId=${societyId}`),
        apiGet(`/users?societyId=${societyId}`),
      ]);

      setStats({
        wings: Array.isArray(wingRes) ? wingRes.length : 0,
        flats: Array.isArray(flatRes) ? flatRes.length : 0,
        members: Array.isArray(memRes) ? memRes.length : 0,
        users: Array.isArray(userRes) ? userRes.length : 0,
      });
    } catch (error) {
      console.error("Error loading dashboard stats", error);
    }
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: 5,
    boxShadow: "0 4px 12px rgba(22, 119, 255, 0.15)",
    border: "1px solid #d6e4ff",
  };

  return (
    <>
      <div
        style={{
          padding: 5,
          background: "#f0f5ff",
          minHeight: "50%",
        }}
      >
        <Title
          level={4}
          style={{
            color: "#1677ff",
            background: "#f0f5ff",
            marginBottom: 5,
          }}
        >
          Admin Dashboard
        </Title>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={12} lg={4} xl={4}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Financial Year</span>}
                value={financialYear}
                prefix={<CalendarOutlined style={{ color: "#1677ff" }} />}
                valueStyle={{
                  color: "#1677ff",
                  fontSize: 20,
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={12} lg={4} xl={4}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Wings</span>}
                value={stats.wings}
                prefix={<HomeOutlined style={{ color: "#1677ff" }} />}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={12} lg={4} xl={4}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Flats</span>}
                value={stats.flats}
                prefix={<HomeOutlined style={{ color: "#1677ff" }} />}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={12} lg={4} xl={4}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Members</span>}
                value={stats.members}
                prefix={<TeamOutlined style={{ color: "#1677ff" }} />}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={12} lg={4} xl={4}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Users</span>}
                value={stats.users}
                prefix={<TeamOutlined style={{ color: "#1677ff" }} />}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <div
        style={{
          padding: 5,
          background: "#f0f5ff",
          minHeight: "50%",
        }}
      >
        <Title
          level={4}
          style={{
            color: "#1677ff",
            background: "#f0f5ff",
            marginBottom: 5,
          }}
        >
          Member Dashboard
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={12} lg={4} xl={4}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Pending Maint.</span>}
                value={memberStats.pendingMaintenance}
                prefix={<TeamOutlined style={{ color: "#1677ff" }} />}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={12} lg={4} xl={4}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Pending Funds</span>}
                value={memberStats.pendingFunds}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={12} lg={4} xl={4}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Pending Contri.</span>}
                value={memberStats.pendingContributions}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop:"10px"}}>
          <Col xs={24} sm={12} md={12} lg={4} xl={4}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Paid Maint.</span>}
                value={memberStats.paidMaintenance}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={12} lg={4} xl={4}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Paid Funds</span>}
                value={memberStats.paidFunds}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={12} lg={4} xl={4}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Paid Contri.</span>}
                value={memberStats.paidContributions}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={12} lg={4} xl={4}>
            <Card style={cardStyle}>
              <Statistic
                title={<span style={{ color: "#1677ff" }}>Receipts</span>}
                value={memberStats.receipts}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default AdminDashboard;

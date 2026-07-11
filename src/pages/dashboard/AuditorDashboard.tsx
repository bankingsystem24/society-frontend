import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Avatar,
  message,
  Layout,
} from "antd";
import {
  TeamOutlined,
  HomeOutlined,
  CalendarOutlined,
  AuditOutlined,
  FileDoneOutlined,
  FundProjectionScreenOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../api/axios";
import axios from "axios";

import "./AuditorDashboard.css";

const { Content } = Layout;
const { Title, Text } = Typography;
const BASE_URL = import.meta.env.VITE_API_URL;

const AuditorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const auditorId = Number(sessionStorage.getItem("userId"));
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    societies: 0,
  });

  const [societyName, setSocietyName] = useState("-");

  const [financialYear, setFinancialYear] = useState("-");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadFinancialYear = async () => {
    try {
      const societyId = Number(sessionStorage.getItem("societyId"));

      const res = await apiGet(`/accounting-year/${societyId}/active`);

      setFinancialYear(res.fyCode || "-");
      sessionStorage.setItem("financialYear", res.fyCode);
      sessionStorage.setItem("financialYearId", res.id);
      window.dispatchEvent(new Event("financialYearChanged"));
    } catch (error) {
      console.error(error);
      setFinancialYear("-");
    }
  };

  const fetchGlMapping = async () => {
    try {
      const societyId = Number(sessionStorage.getItem("societyId"));

      const res = await axios.get(
        `${BASE_URL}/gl/master/mapping?societyId=${societyId}`,
      );

      const cash = res.data.find(
        (x: any) =>
          x.description?.replace(/\s+/g, " ").trim().toLowerCase() ===
          "cash in hand",
      );

      if (cash) {
        sessionStorage.setItem("GlCashInHand", cash.gl_receivable);
      }

      const bank = res.data.find(
        (x: any) => x.description?.trim().toLowerCase() === "bank account",
      );

      if (bank) {
        sessionStorage.setItem("GlBankAccount", bank.gl_receivable);
      }
    } catch (error) {
      console.error(error);

      message.error("Unable to load GL Mapping.");
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const users = await apiGet("/users");
      const societies = await apiGet("/societies");
      const auditorSocieties = societies.filter((s: any) => s.auditor?.id === auditorId,);
      const societyIds = auditorSocieties.map((s: any) => s.id);
      const filteredUsers = users.filter((u: any) =>
        societyIds.includes(u.societyId),
      );

      setStats({
        users: filteredUsers.length,
        societies: auditorSocieties.length,
      });

      if (auditorSocieties.length > 0) {
        const society = auditorSocieties[0];
        setSocietyName(society.societyName);
        sessionStorage.setItem("societyId", society.id);
        sessionStorage.setItem("societyName", society.societyName);
        window.dispatchEvent(new Event("societyChanged"));
        await loadFinancialYear();
        await fetchGlMapping();
      }
    } catch (error) {
      console.error(error);

      message.error("Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: 18,
    border: "none",
    height: 150,
    background: "linear-gradient(135deg,#ffffff,#f8fbff)",
    boxShadow: "0 8px 25px rgba(0,0,0,.08)",
    transition: ".3s",
    cursor: "pointer",
  };
  return (
    <Content
      style={{
        padding: 24,
      }}
    >
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            Dashboard
          </Title>
        </Col>
      </Row>

      {/* KPI CARDS */}

      <Row gutter={[20, 20]} style={{ marginTop: 25 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={cardStyle} onClick={() => navigate("/financial-year")} >
            <Space direction="vertical">
              <CalendarOutlined
                style={{
                  fontSize: 34,
                  color: "#722ed1",
                }}
              />

              <Text type="secondary">Financial Year</Text>
              <Title
                level={3}
                style={{
                  margin: 0,
                  color: "#722ed1",
                }}
              >
                {financialYear}
              </Title>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={cardStyle} onClick={() => navigate("/users")} >
            <Space direction="vertical">
              <TeamOutlined
                style={{
                  fontSize: 34,
                  color: "#13c2c2",
                }}
              />
              <Text type="secondary">Users</Text>
              <Title
                level={2}
                style={{ margin: 0,color: "#13c2c2",}}
              >
                {stats.users}
              </Title>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={cardStyle} onClick={() => navigate("/societies")}>
            <Space direction="vertical">
              <HomeOutlined
                style={{
                  fontSize: 34,
                  color: "#52c41a",
                }}
              />
              <Text type="secondary">Societies</Text>
              <Title
                level={2}
                style={{
                  margin: 0,
                  color: "#52c41a",
                }}
              >
                {stats.societies}
              </Title>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* QUICK ACTIONS */}

      <Card
        style={{
          marginTop: 30,
          borderRadius: 18,
        }}
      >
        <Title level={4}>Quick Actions</Title>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Button
              type="primary"
              icon={<FileDoneOutlined />}
              block
              size="large"
              onClick={() => navigate("/trial-balance-snapshot-view")}
            >
              Trial Balance Snapshot
            </Button>
          </Col>

          <Col xs={24} md={8}>
            <Button
              type="primary"
              block
              size="large"
              icon={<FundProjectionScreenOutlined />}
              onClick={() => navigate("/profit-loss-snapshot-view")}
            >
              Profit & Loss Snapshot
            </Button>
          </Col>

          <Col xs={24} md={8}>
            <Button
              type="primary"
              block
              size="large"
              icon={<FileTextOutlined />}
              onClick={() => navigate("/balance-sheet-view")}
            >
              Balance Sheet
            </Button>
          </Col>
        </Row>
      </Card>

      {/* SYSTEM INFO */}
    </Content>
  );
};
export default AuditorDashboard;

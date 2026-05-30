import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Typography } from "antd";
import { CalendarOutlined, HomeOutlined, TeamOutlined } from "@ant-design/icons";
import { apiGet } from "../../api/axios";
import axios from "axios";

const { Title } = Typography;
const BASE_URL = import.meta.env.VITE_API_URL;

const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    users: 0,
  });
  const [financialYear, setFinancialYear] = useState<string>("-");

  useEffect(() => {
    loadStats();
    loadFinancialYear();
  }, []);

  const loadFinancialYear = async () => {
  try {
    const societyId = sessionStorage.getItem("societyId");

    const res = await apiGet(
      `/accounting-year/${societyId}/active`
    );

    console.log("response",res.data);
    setFinancialYear(res.fyCode || "-");
  } catch (error) {
    console.error("Error loading financial year", error);
    setFinancialYear("-");
  }
};

  const loadStats = async () => {
    try {
        const res = await apiGet("/users");
      




    } catch (error) {
      console.error("Error loading dashboard stats", error);
    }
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(22, 119, 255, 0.15)",
    border: "1px solid #d6e4ff",
  };

  return (
    <div style={{ padding: 24, background: "#f0f5ff", minHeight: "100vh" }}>
      <Title
        level={2}
        style={{ color: "#1677ff", marginBottom: 24 }}
      >
        Society Dashboard
      </Title>

      {/* <Row gutter={16}>
        <Col span={6}>
          <Card style={cardStyle}>
            <Statistic
              title={<span style={{ color: "#1677ff" }}>Wings</span>}
              value={stats.wings}
              prefix={<HomeOutlined style={{ color: "#1677ff" }} />}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card style={cardStyle}>
            <Statistic
              title={<span style={{ color: "#1677ff" }}>Flats</span>}
              value={stats.flats}
              prefix={<HomeOutlined style={{ color: "#1677ff" }} />}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card style={cardStyle}>
            <Statistic
              title={<span style={{ color: "#1677ff" }}>Members</span>}
              value={stats.members}
              prefix={<TeamOutlined style={{ color: "#1677ff" }} />}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>

        <Col span={6}>
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
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={6}>
          <Card style={cardStyle}>
            <Statistic
              title={<span style={{ color: "#1677ff" }}>Financial Year</span>}
              value={financialYear}
              prefix={<CalendarOutlined  style={{ color: "#1677ff" }} />}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>
    </Row> */}

    </div>
  );
};

export default SuperAdminDashboard;
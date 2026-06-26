import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Typography } from "antd";
import { CalendarOutlined, HomeOutlined, TeamOutlined } from "@ant-design/icons";
import { apiGet } from "../../api/axios";
import axios from "axios";
import Societies from "../society/Societies";

const { Title } = Typography;
const BASE_URL = import.meta.env.VITE_API_URL;

const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    users: 0,
    Societies:0,
  });
  const [financialYear, setFinancialYear] = useState<string>("-");
  const saId = Number(sessionStorage.getItem("userId"));


  useEffect(() => {
    loadStats();
    // loadFinancialYear();
  }, []);

  const loadFinancialYear = async () => {
  try {
    const societyId = sessionStorage.getItem("societyId");

    const res = await apiGet(
      `/accounting-year/${societyId}/active`
    );

    setFinancialYear(res.fyCode || "-");      
    sessionStorage.setItem("financialYear",res.fyCode);
    sessionStorage.setItem("financialYearId",res.id); 

  } catch (error) {
    console.error("Error loading financial year", error);
    setFinancialYear("-");
  }
};

  const loadStats = async () => {
    try {
      const usersRes = await apiGet("/users");
      const societiesRes = await apiGet("/societies");
      const filteredSocieties = societiesRes;
      const societyIds = filteredSocieties.map((society: any) => society.id);
      const filteredUsers = usersRes.filter((user: any) =>
        societyIds.includes(user.societyId),
      );

        setStats({
          users:usersRes.length | 0,
          Societies:societiesRes.length | 0,
        })
      const firstSociety = filteredSocieties[0];

      if (firstSociety) {
        sessionStorage.setItem("societyId", firstSociety.id);
        sessionStorage.setItem("societyName", String(firstSociety.societyName));
        window.dispatchEvent(new Event("societyChanged"));
        await loadFinancialYear();
       }

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
    <div
  style={{
    padding: 16,
    background: "#f0f5ff",
    minHeight: "100vh",
  }}
  className="dashboard-container"
>
      <Title
        level={4}
        style={{ color: "#1677ff", marginBottom: 24 }}
      >
        Administrator Dashboard
      </Title>

      <Row gutter={[16,16]}>
        <Col xs={24} sm={12} md={4} lg={4} xl={4}>
          <Card style={cardStyle}>
            <Statistic
              title={<span style={{ color: "#1677ff" }}>Users</span>}
              value={stats.users}
              prefix={<HomeOutlined style={{ color: "#1677ff" }} />}
              styles={{ content : { color: "#1677ff"} }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4} lg={4} xl={4}>
          <Card style={cardStyle}>
            <Statistic
              title={<span style={{ color: "#1677ff" }}>Societies</span>}
              value={stats.Societies}
              prefix={<HomeOutlined style={{ color: "#1677ff" }} />}
              styles={{ content : { color: "#1677ff"} }}
            />
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default SuperAdminDashboard;
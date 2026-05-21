import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Typography } from "antd";
import { HomeOutlined, TeamOutlined, BankOutlined } from "@ant-design/icons";
import { apiGet } from "../../api/axios";

const { Title } = Typography;

const ClientDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    // societies: 0,
    wings: 0,
    flats: 0,
    members: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const societyId = sessionStorage.getItem("societyId");

      const [wingRes, flatRes, memRes] = await Promise.all([
        apiGet(`/wings?societyId=${societyId}`),
        apiGet(`/flats?societyId=${societyId}`),
        apiGet(`/members?societyId=${societyId}`),
      ]);

      const wings = Array.isArray(wingRes) ? wingRes : [];
      const flats = Array.isArray(flatRes) ? flatRes : [];
      const members = Array.isArray(memRes) ? memRes : [];

      setStats({
        wings: wings.length,
        flats: flats.length,
        members: members.length,
      });
    } catch (error) {
      console.error("Error loading dashboard stats", error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>Society Dashboard</Title>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Wings"
              value={stats.wings}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Flats"
              value={stats.flats}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Members"
              value={stats.members}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ClientDashboard;

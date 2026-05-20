import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Typography } from "antd";
import {
  HomeOutlined,
  TeamOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { apiGet } from "../../api/axios";

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    societies: 0,
    wings: 0,
    flats: 0,
    members: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [soc, wing, flat, mem] = await Promise.all([
        apiGet("/societies"),
        apiGet("/wings"),
        apiGet("/flats"),
        apiGet("/members"),
      ]);

      // ✅ SAFE extraction (handles both array and object responses)
      const societies = Array.isArray(soc) ? soc : soc?.data ?? [];
      const wings = Array.isArray(wing) ? wing : wing?.data ?? [];
      const flats = Array.isArray(flat) ? flat : flat?.data ?? [];
      const members = Array.isArray(mem) ? mem : mem?.data ?? [];

      setStats({
        societies: societies.length,
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
              title="Societies"
              value={stats.societies}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>

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

export default Dashboard;
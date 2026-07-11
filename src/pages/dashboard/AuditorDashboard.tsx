import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Typography, message } from "antd";
import {
  CalendarOutlined,
  HomeOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { apiGet } from "../../api/axios";
import axios from "axios";

const { Title } = Typography;
const BASE_URL = import.meta.env.VITE_API_URL;

const AuditorDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    users: 0,
    societies: 0,
  });
  const [financialYear, setFinancialYear] = useState<string>("-");
  const auditorId = Number(sessionStorage.getItem("userId"));

  useEffect(() => {
    loadStats();
  }, []);

  const loadFinancialYear = async () => {
    try {
      const societyId = Number(sessionStorage.getItem("societyId"));
      const res = await apiGet(`/accounting-year/${societyId}/active`);
      setFinancialYear(res.fyCode || "-");
      sessionStorage.setItem("financialYear",res.fyCode);
      sessionStorage.setItem("financialYearId",res.id); 
      window.dispatchEvent(new Event("financialYearChanged"));
    } catch (error) {
      console.error("Error loading financial year", error);
      setFinancialYear("-");
    }
  };

  const fetchGlMapping = async () => {
    const societyId = Number(sessionStorage.getItem("societyId"));
      try {
        const res = await axios.get(`${BASE_URL}/gl/master/mapping?societyId=${societyId}`,);
        const mapping = res.data.find(
          (item: any) =>
            item.description &&
            item.description.replace(/\s+/g, " ").trim().toLowerCase() === "cash in hand"
        );
        if (!mapping) {
          message.error("Cash in Hand Mapping not configured");
          return;
        }
      
        sessionStorage.setItem("GlCashInHand", mapping.gl_receivable);

        const mapping1 = res.data.find((item: any) =>item.description?.trim().toLowerCase() === "bank account",);
        if (!mapping1) {
          message.error("Bank Account not configured");
          return;
        }
        sessionStorage.setItem("GlBankAccount", mapping1.gl_receivable);

      } catch (err) {
        console.error(err);
        message.error("Unable to load GL Mapping");
      }
    };
    
  const loadStats = async () => {
    try {
      const usersRes = await apiGet("/users");
      const societiesRes = await apiGet("/societies");
      const filteredSocieties = societiesRes.filter(
        (society: any) => society.auditor?.id === auditorId,
      );
      const societyIds = filteredSocieties.map((society: any) => society.id);
      const filteredUsers = usersRes.filter((user: any) =>
        societyIds.includes(user.societyId),
      );

      setStats({ users: filteredUsers.length | 0, societies: filteredSocieties.length | 0, });

      const firstSociety = filteredSocieties[0];
      if (firstSociety) {
        sessionStorage.setItem("societyId", String(firstSociety.id));
        sessionStorage.setItem("societyName", String(firstSociety.societyName));
          window.dispatchEvent(new Event("societyChanged"));
          await loadFinancialYear();
          await fetchGlMapping();
       }

    } catch (error) {
      console.error("Error loading dashboard stats", error);
    }
  };


const cardStyle: React.CSSProperties = {
  borderRadius: 18,
  border: "none",
  background: "#ffffff",
  boxShadow: "0 10px 30px rgba(72, 19, 19, 0.08)",
  transition: "0.3s",
  height: 130,
};
  return (
    <div style={{ padding: 24, background: "#f1f2f4", minHeight: "100vh" }}>
      <Title level={4} style={{color: "#1677ff",marginBottom: 16,}}
>   Auditor Dashboard
      </Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card style={cardStyle}>
            <Statistic
              title={<span style={{ color: "#1677ff",fontSize: 22,fontWeight: 600}}>Users</span>}
              value={stats.users + 1}
              prefix={<TeamOutlined style={{ color: "#1677ff",fontSize: 28, }} />}
              styles={{ content : { color: "#1677ff"} }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card style={cardStyle}>
            <Statistic
              title={<span style={{color: "#1677ff",fontSize: 22,fontWeight: 600, }}>Societies</span>}
              value={stats.societies}
              prefix={<HomeOutlined style={{ color: "#52c41a",fontSize: 28, }} />}
              styles={{ content : { color: "#1677ff"} }}
            />
          </Card>
        </Col>
      </Row>
    </div>

    
  );
};

export default AuditorDashboard;

import React, { useEffect, useState } from "react";
import { Layout, Table, Button, Typography, Card, message, Space } from "antd";
import axios from "axios";
import AuditorHeader from "../../../components/layout/AuditorHeader";
import AuditorSidebar from "../../../components/layout/AuditorSidebar";
import MemberHeader from "../../../components/layout/MemberHeader";
import MemberSidebar from "../../../components/layout/MemberSidebar";
import Sidebar from "../../../components/layout/Sidebar";
import SuperAdminHeader from "../../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../../components/layout/SuperAdminSidebar";
import Header from "../../../components/layout/Header";

const { Content } = Layout;
const { Title } = Typography;

const BASE_URL = import.meta.env.VITE_API_URL;

interface Society {
  id: number;
  societyName: string;
  financialYear: string;
}

const SetSociety: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [societies, setSocieties] = useState<Society[]>([]);
  const role = sessionStorage.getItem("role");
  const userId = Number(sessionStorage.getItem("userId"));

  useEffect(() => {
    loadSocieties();
  }, []);

  const loadSocieties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/societies`);

      let filteredSocieties;

      if (role ==="SUPER_ADMIN"){
          filteredSocieties = response.data;
      } else {
        filteredSocieties = (response.data || []).filter((society: any) => society.auditor?.id === userId);
      }
      setSocieties(filteredSocieties);

    } catch (error) {
      console.error(error);
      message.error("Failed to load societies");
    } finally {
      setLoading(false);
    }
  };

const handleSetSociety = async (record: Society) => {
  try {
    // Get active financial year for selected society
    const fyRes = await axios.get(
      `${BASE_URL}/accounting-year/${record.id}/active`
    );
    const financialYear = fyRes.data?.fyCode || "";
    sessionStorage.setItem("societyId", String(record.id));
    sessionStorage.setItem("societyName", record.societyName);
    sessionStorage.setItem("financialYear", financialYear);
    sessionStorage.setItem("financialYearId",fyRes.data?.id);
    window.dispatchEvent(new Event("societyChanged"));
    window.dispatchEvent(new Event("financialYearChanged"));
    message.success(`${record.societyName} selected successfully`);
  } catch (error) {
    console.error("Error loading financial year:", error);
    message.error("Unable to load active financial year");
  }
};

  const columns = [
    {
      title: "Society ID",
      dataIndex: "id",
      key: "id",
      width: 120,
    },
    {
      title: "Society Name",
      dataIndex: "societyName",
      key: "societyName",
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      render: (_: any, record: Society) => (
        <Space>
          <Button type="primary" size="small"   onClick={() => handleSetSociety(record)}>
            Set Society
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider
        width={role === "MEMBER" ? 200 : 250}
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          height: "100vh",
          position: "sticky",
          top: 0,
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
      </Layout.Sider>

      {/* MAIN AREA */}
      <Layout style={{ minWidth: 0 }}>
        {/* HEADER (NO EXTRA DIV) */}
        {role === "ADMIN" ? (
          <Header />
        ) : role === "MEMBER" ? (
          <MemberHeader />
        ) : role === "SUPER_ADMIN" ? (
          <SuperAdminHeader />
        ) : (
          <AuditorHeader />
        )}

        <Content style={{ padding: 24 }}>
          <Card>
            <Title level={3}>Select Society (Auditor)</Title>

            <Table
              rowKey="id"
              loading={loading}
              columns={columns}
              dataSource={societies}
              size="small"
              pagination={{
                pageSize: 10,
              }}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SetSociety;

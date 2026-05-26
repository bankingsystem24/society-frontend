import React, { useEffect, useState } from "react";
import { Layout, Table, Tag, Spin, Typography } from "antd";
import MemberSidebar from "../../components/layout/MemberSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;
const { Content } = Layout;
const { Title } = Typography;

const MemberBills: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState<any[]>([]);

  const memberId = Number(sessionStorage.getItem("memberId"));
  const societyId = Number(sessionStorage.getItem("societyId"));

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);

      // 1. GET FLATS
      const flatsRes = await axios.get(`${BASE_URL}/members/flats`, {
        params: {
          societyId,
          memberId,
        },
      });

      const flatIds = flatsRes.data.map((f: any) => Number(f.id));

      if (flatIds.length === 0) {
        setBills([]);
        return;
      }

      // 2. GET BILLS
      const billsRes = await axios.post(`${BASE_URL}/members/bills`, {
        flatIds,
      });

      const billData = billsRes.data || [];

      setBills(billData);

      // ✅ correct logging
      console.log("Bills API Response:", billData);
    } catch (error) {
      console.error("Error fetching bills", error);
    } finally {
      setLoading(false);
    }
  };

  // TABLE COLUMNS
  const columns = [
    {
      title: "Flat No",
      dataIndex: "flatNo",
      key: "flatNo",
      render: (_: any, record: any) => record.flat?.flatNo,
    },
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (value: number) => `₹ ${value}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "PAID" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Paid On",
      dataIndex: "paidDate",
      key: "paidDate",
      render: (value: string) => {
        if (!value) return "-";

        const date = new Date(value);

        return date.toLocaleDateString("en-GB");
        // en-GB = dd/mm/yyyy
      },
    },
    {
      title: "Mode",
      dataIndex: "paymentMode",
      key: "paymentMode",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <Layout.Sider breakpoint="lg" collapsedWidth="0">
        <MemberSidebar />
      </Layout.Sider>

      {/* MAIN */}
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
          <Title level={3}>Member Bills</Title>

          {loading ? (
            <div style={{ textAlign: "center", marginTop: 50 }}>
              <Spin size="large" />
            </div>
          ) : (
            <Table
              dataSource={bills}
              columns={columns}
              rowKey="id"
              bordered
              pagination={{ pageSize: 10 }}
              size="small"
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MemberBills;

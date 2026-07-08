import React, { useMemo, useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Select,
  Input,
  Tag,
  Space,
  Layout,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";
import axios from "axios";

const { Option } = Select;
const { Search } = Input;
const role = sessionStorage.getItem("role");
const { Content } = Layout;
const BASE_URL = import.meta.env.VITE_API_URL;

interface FlatPayment {
  key: number;
  flatNo: string;
  description: string;
  totalAmount: number;
  status: "PAID" | "PENDING";
  memberName: string;
  memberId:number;
}

export default function FlatPaymentDashboard() {
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const role = sessionStorage.getItem("role");
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<FlatPayment[]>([]);
  const memberId = Number(sessionStorage.getItem("memberId"));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const payload = {
        societyId: Number(sessionStorage.getItem("societyId")),
        financialYearId: Number(sessionStorage.getItem("financialYearId")),
      };

      const response = await axios.get(`${BASE_URL}/reports/payments`, {params: payload,});
      const filteredData = (role === "MEMBER") ? response.data.filter((item: any) => item.memberId === memberId) : response.data;  
      const paymentData = filteredData.map((item: any, index: number) => ({
        key: index + 1,
        flatNo: item.flatNo,
        description: item.description,
        totalAmount: item.totalAmount,
        status: item.status,
        memberName: item.memberName,
        memberId : item.memberId,
      }));

      setPayments(paymentData);
    } catch (error) {
      console.error("Error fetching payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return payments.filter((item) => {
      const statusMatch =
        status === "All" || item.status === status.toUpperCase();

      const searchText = search.toLowerCase();

      const searchMatch =
        item.flatNo.toLowerCase().includes(searchText) ||
        item.description.toLowerCase().includes(searchText) ||
        item.memberName.toLowerCase().includes(searchText);

      return statusMatch && searchMatch;
    });
  }, [payments, status, search]);

  const summary = {
    totalFlats: filteredData.length,
    bills: filteredData.reduce((a, b) => a + b.totalAmount, 0),
    received: filteredData
      .filter((x) => x.status === "PAID")
      .reduce((a, b) => a + b.totalAmount, 0),
    pending: filteredData
      .filter((x) => x.status === "PENDING")
      .reduce((a, b) => a + b.totalAmount, 0),
    pendingFlats: filteredData.filter((x) => x.status === "PENDING").length,
  };

  const collection =
    summary.bills === 0
      ? 0
      : ((summary.received / summary.bills) * 100).toFixed(2);

  const columns: ColumnsType<FlatPayment> = [
    {
      title: "Member",
      dataIndex: "memberName",
    },
    {
      title: "Flat No",
      dataIndex: "flatNo",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => (
        <Tag color={status === "PAID" ? "green" : "red"}>{status}</Tag>
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
        <Content>
          <Space orientation="vertical" size="small" style={{ width: "100%", marginTop:10 }}>
            {/* Summary Cards */}

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                <Card size="small">
                  <Statistic 
                  title={<span style={{ fontSize: "13px",display: "block", textAlign:"center" }}>Total Flats </span>}
                  value={summary.totalFlats} 
                  styles={{ content: {fontSize: 20, fontWeight: 600,textAlign:"center"},}}/>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                <Card size="small">
                  <Statistic 
                  title={<span style={{ fontSize: "13px",display: "block", textAlign:"center" }}>Bills</span>}
                  value={summary.bills} prefix="₹" styles={{ content: {fontSize: 20, fontWeight: 600,textAlign:"center"},}}/>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                <Card size="small">
                  <Statistic
                    title={<span style={{ fontSize: "13px",display: "block", textAlign:"center" }}>Received</span>}
                    value={summary.received}
                    prefix="₹" styles={{ content: {fontSize: 20, fontWeight: 600,textAlign:"center"},}}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                <Card size="small">
                  <Statistic
                    title={<span style={{ fontSize: "13px",display: "block", textAlign:"center" }}>Outstanding</span>}
                    value={summary.pending}
                    prefix="₹" styles={{ content: {fontSize: 20, fontWeight: 600,textAlign:"center"},}}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                <Card size="small">
                  <Statistic
                    title={<span style={{ fontSize: "13px",display: "block", textAlign:"center" }}>Pending Flats</span>}
                    value={summary.pendingFlats} styles={{ content: {fontSize: 20, fontWeight: 600,textAlign:"center"},}}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                <Card size="small">
                  <Statistic
                    title={<span style={{ fontSize: "13px", display: "block", textAlign:"center"}}>Collection %</span>}
                    value={collection}
                    suffix="%" styles={{ content: {fontSize: 20, fontWeight: 600, textAlign:"center"},}}
                  />
                </Card>
              </Col>
            </Row>

            {/* Filters */}

            <Card>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Select
                    value={status}
                    onChange={setStatus}
                    style={{ width: "100%" }}
                  >
                    <Option value="All">All</Option>
                    <Option value="PAID">Paid</Option>
                    <Option value="PENDING">Pending</Option>
                  </Select>
                </Col>

                <Col xs={24} sm={24} md={24} lg={6}>
                  <Search
                    placeholder="Search Flat / Owner"
                    onSearch={setSearch}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                  />
                </Col>
              </Row>
            </Card>

            {/* Table */}

            <Card>
              <Table
                loading={loading}
                columns={columns}
                dataSource={filteredData}
                rowKey="key"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 700 }}
              />
            </Card>
          </Space>
        </Content>
      </Layout>
    </Layout>
  );
}

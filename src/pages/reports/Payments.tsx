import React, { useMemo, useState } from "react";
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

const { Option } = Select;
const { Search } = Input;
const role = sessionStorage.getItem("role");
const { Content } = Layout;

interface FlatPayment {
  key: number;
  flatNo: string;
  owner: string;
  bill: number;
  received: number;
  pending: number;
  lastPayment: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Partial";
}

const data: FlatPayment[] = [
  {
    key: 1,
    flatNo: "A101",
    owner: "Deepak",
    bill: 2500,
    received: 2500,
    pending: 0,
    lastPayment: "02-Jul-2026",
    dueDate: "05-Jul-2026",
    status: "Paid",
  },
  {
    key: 2,
    flatNo: "A102",
    owner: "Rahul",
    bill: 2500,
    received: 1000,
    pending: 1500,
    lastPayment: "01-Jul-2026",
    dueDate: "05-Jul-2026",
    status: "Partial",
  },
  {
    key: 3,
    flatNo: "A103",
    owner: "Amit",
    bill: 2500,
    received: 0,
    pending: 2500,
    lastPayment: "-",
    dueDate: "05-Jul-2026",
    status: "Pending",
  },
];

export default function FlatPaymentDashboard() {
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const statusMatch = status === "All" || item.status === status;

      const searchMatch =
        item.flatNo.toLowerCase().includes(search.toLowerCase()) ||
        item.owner.toLowerCase().includes(search.toLowerCase());

      return statusMatch && searchMatch;
    });
  }, [status, search]);

  const summary = {
    totalFlats: filteredData.length,
    bills: filteredData.reduce((a, b) => a + b.bill, 0),
    received: filteredData.reduce((a, b) => a + b.received, 0),
    pending: filteredData.reduce((a, b) => a + b.pending, 0),
    pendingFlats: filteredData.filter((x) => x.pending > 0).length,
  };

  const collection =
    summary.bills === 0
      ? 0
      : ((summary.received / summary.bills) * 100).toFixed(2);

  const columns: ColumnsType<FlatPayment> = [
    {
      title: "Flat",
      dataIndex: "flatNo",
    },
    {
      title: "Owner",
      dataIndex: "owner",
    },
    {
      title: "Bill",
      dataIndex: "bill",
      render: (v) => `₹${v.toLocaleString()}`,
    },
    {
      title: "Received",
      dataIndex: "received",
      render: (v) => `₹${v.toLocaleString()}`,
    },
    {
      title: "Pending",
      dataIndex: "pending",
      render: (v) => `₹${v.toLocaleString()}`,
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
    },
    {
      title: "Last Payment",
      dataIndex: "lastPayment",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const color =
          status === "Paid" ? "green" : status === "Pending" ? "red" : "orange";

        return <Tag color={color}>{status}</Tag>;
      },
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
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Summary Cards */}

            <Row gutter={16}>
              <Col span={4}>
                <Card>
                  <Statistic title="Total Flats" value={summary.totalFlats} />
                </Card>
              </Col>

              <Col span={4}>
                <Card>
                  <Statistic title="Bills" value={summary.bills} prefix="₹" />
                </Card>
              </Col>

              <Col span={4}>
                <Card>
                  <Statistic
                    title="Received"
                    value={summary.received}
                    prefix="₹"
                  />
                </Card>
              </Col>

              <Col span={4}>
                <Card>
                  <Statistic
                    title="Outstanding"
                    value={summary.pending}
                    prefix="₹"
                  />
                </Card>
              </Col>

              <Col span={4}>
                <Card>
                  <Statistic
                    title="Pending Flats"
                    value={summary.pendingFlats}
                  />
                </Card>
              </Col>

              <Col span={4}>
                <Card>
                  <Statistic
                    title="Collection %"
                    value={collection}
                    suffix="%"
                  />
                </Card>
              </Col>
            </Row>

            {/* Filters */}

            <Card>
              <Row gutter={16}>
                <Col span={5}>
                  <Select defaultValue="July" style={{ width: "100%" }}>
                    <Option value="July">July</Option>
                    <Option value="August">August</Option>
                  </Select>
                </Col>

                <Col span={5}>
                  <Select defaultValue="2026" style={{ width: "100%" }}>
                    <Option value="2026">2026</Option>
                    <Option value="2025">2025</Option>
                  </Select>
                </Col>

                <Col span={5}>
                  <Select
                    value={status}
                    onChange={setStatus}
                    style={{ width: "100%" }}
                  >
                    <Option value="All">All Status</Option>
                    <Option value="Paid">Paid</Option>
                    <Option value="Partial">Partial</Option>
                    <Option value="Pending">Pending</Option>
                  </Select>
                </Col>

                <Col span={9}>
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
                columns={columns}
                dataSource={filteredData}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </Space>
        </Content>
      </Layout>
    </Layout>
  );
}

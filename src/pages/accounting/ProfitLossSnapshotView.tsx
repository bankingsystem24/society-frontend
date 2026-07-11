import React, { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Typography,
  Table,
  Row,
  Col,
  Tag,
  Button,
  Space,
  message,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";

import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";

import "../../App.css";

const { Title, Text } = Typography;
const { Content } = Layout;

const BASE_URL = import.meta.env.VITE_API_URL;

interface ProfitLossDetail {
  id: number;
  glCode: number;
  accountName: string;
  accountType: "INCOME" | "EXPENSE";
  amount: number;
}

interface ProfitLossSnapshot {
  id: number;
  societyId: number;
  financialYearId: number;
  remarks: string;
  createdBy: number;
  createdAt: string;
  totalIncome: number;
  totalExpense: number;
  netProfitLoss: number;
  details: ProfitLossDetail[];
}

const ProfitLossSnapshotView: React.FC = () => {
  const role = sessionStorage.getItem("role");
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

  const [loading, setLoading] = useState(false);

  const [snapshot, setSnapshot] = useState<ProfitLossSnapshot | null>(null);

  const [rows, setRows] = useState<ProfitLossDetail[]>([]);

  useEffect(() => {
    fetchSnapshot();
  }, []);

  const fetchSnapshot = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/profit-loss-snapshot/${financialYearId}`,
      );

      setSnapshot(res.data);
      setRows(res.data.details || []);
    } catch (error) {
      console.error(error);
      message.error("Failed to load Profit & Loss Snapshot.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContents = document.getElementById("print-area")?.innerHTML;
    if (!printContents) return;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const columns: ColumnsType<ProfitLossDetail> = [
    {
      title: "Sr.",
      width: 70,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "GL Code",
      dataIndex: "glCode",
      width: 120,
      align: "center",
    },
    {
      title: "Account Name",
      dataIndex: "accountName",
      width: 350,
    },
    {
      title: "Account Type",
      dataIndex: "accountType",
      width: 180,
      align: "center",
      render: (value) => (
        <Tag color={value === "INCOME" ? "green" : "red"}>{value}</Tag>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      width: 180,
      align: "right",
      render: (value: number) =>
        `₹ ${Number(value || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
  ];

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Spin
          size="large"
          style={{
            margin: "150px auto",
          }}
        />
      </Layout>
    );
  }

  const totalIncome = snapshot?.totalIncome || 0;
  const totalExpense = snapshot?.totalExpense || 0;
  const netProfit = snapshot?.netProfitLoss || 0;

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

      <Layout>
        {role === "ADMIN" ? (
          <Header />
        ) : role === "MEMBER" ? (
          <MemberHeader />
        ) : role === "SUPER_ADMIN" ? (
          <SuperAdminHeader />
        ) : (
          <AuditorHeader />
        )}

        <Content style={{ padding: 20 }}>
          <div id="print-area">
            <Card style={{ borderRadius: 12 }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={5}>Profit &amp; Loss Snapshot</Title>
                </Col>

                <Col>
                  <Button type="primary" onClick={handlePrint}>
                    Print
                  </Button>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: 10 }}>
                <Col span={6}>
                  <Card size="small">
                    <Text strong>Financial Year Id</Text>
                    <br />
                    <Text>{snapshot?.financialYearId}</Text>
                  </Card>
                </Col>

                <Col span={6}>
                  <Card size="small">
                    <Text strong>Created By</Text>
                    <br />
                    <Text>{snapshot?.createdBy}</Text>
                  </Card>
                </Col>

                <Col span={6}>
                  <Card size="small">
                    <Text strong>Created At</Text>
                    <br />
                    <Text>
                      {snapshot?.createdAt
                        ? new Date(snapshot.createdAt).toLocaleString()
                        : "-"}
                    </Text>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Text strong>Remarks</Text>
                    <br />
                    <Text>{snapshot?.remarks || "-"}</Text>
                  </Card>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: 10 }}>
                <Col>
                  <Card
                    size="small"
                    style={{
                      minWidth: 180,
                      textAlign: "center",
                    }}
                  >
                    <b>Total Income</b>

                    <div
                      style={{
                        color: "green",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      ₹{" "}
                      {totalIncome.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </Card>
                </Col>

                <Col>
                  <Card
                    size="small"
                    style={{
                      minWidth: 180,
                      textAlign: "center",
                    }}
                  >
                    <b>Total Expense</b>

                    <div
                      style={{
                        color: "red",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      ₹{" "}
                      {totalExpense.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </Card>
                </Col>

                <Col>
                  <Card
                    size="small"
                    style={{
                      minWidth: 220,
                      textAlign: "center",
                      border:
                        netProfit >= 0 ? "1px solid green" : "1px solid red",
                    }}
                  >
                    <b>Net Profit / Loss</b>

                    <div
                      style={{
                        color: netProfit >= 0 ? "green" : "red",
                        fontSize: 15,
                        fontWeight: 700,
                      }}
                    >
                      ₹{" "}
                      {netProfit.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </Card>
                </Col>
              </Row>

              <Table
                rowKey="id"
                className="compact-table"
                style={{ marginTop: 25 }}
                bordered
                size="small"
                pagination={false}
                columns={columns}
                dataSource={rows}
                scroll={{ x: 900 }}
              />
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProfitLossSnapshotView;

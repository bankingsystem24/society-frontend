import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Spin,
  message,
  Row,
  Col,
  Tag,
  Layout,
} from "antd";
import axios from "axios";
import type { ColumnsType } from "antd/es/table";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";
import "../../App.css";

const { Title } = Typography;

const BASE_URL = import.meta.env.VITE_API_URL;
const { Content } = Layout;

interface TrialBalanceRow {
  glCode: number;
  accountName: string;

  openingBalance: number;
  openingType: "DR" | "CR";

  debit: number;
  credit: number;

  closingBalance: number;
  closingType: "DR" | "CR";

  groupName?: string;
}

const TrialBalance: React.FC = () => {
  const [data, setData] = useState<TrialBalanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const role = sessionStorage.getItem("role");

  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

  useEffect(() => {
    if (!societyId) {
      message.error("Society ID missing. Please login again.");
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/gl/reports/trial-balance`, {
        params: { societyId, financialYearId },
      });
      const filteredData = (res.data || []).filter(
        (item: any) =>
          (item.openingBalance ?? 0) !== 0 ||
          (item.closingBalance ?? 0) !== 0 ||
          (item.credit ?? 0) !== 0 ||
          (item.debit ?? 0) !== 0,
      );

      setData(filteredData);
    } catch (error) {
      message.error("Failed to load Trial Balance");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<TrialBalanceRow> = [
    {
      title: "GL Code",
      dataIndex: "glCode",
      key: "glCode",
      width: 60,
    },
    {
      title: "Account Name",
      dataIndex: "accountName",
      key: "accountName",
      width: 150,
    },
    {
      title: "Opening Dr",
      key: "openingDebit",
      width: 100,
      align: "right",
      render: (_, record) =>
        record.openingType === "DR"
          ? (record.openingBalance || 0).toFixed(2)
          : "",
    },
    {
      title: "Opening Cr",
      key: "openingCredit",
      width: 100,
      align: "right",
      render: (_, record) =>
        record.openingType === "CR"
          ? (record.openingBalance || 0).toFixed(2)
          : "",
    },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      width: 80,
      align: "right",
      render: (value: number) => (value || 0).toFixed(2),
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      width: 80,
      align: "right",
      render: (value: number) => (value || 0).toFixed(2),
    },
    {
      title: "Closing Dr",
      key: "closingDebit",
      width: 100,
      align: "right",
      render: (_, record) =>
        record.closingType === "DR"
          ? (record.closingBalance || 0).toFixed(2)
          : "",
    },
    {
      title: "Closing Cr",
      key: "closingCredit",
      width: 100,
      align: "right",
      render: (_, record) =>
        record.closingType === "CR"
          ? (record.closingBalance || 0).toFixed(2)
          : "",
    },
    {
      title: "A/c Type",
      dataIndex: "groupName",
      key: "accountType",
      width: 80,
      align: "center",
      render: (value: string) => {
        let color = "default";

        switch (value) {
          case "ASSET":
            color = "blue";
            break;
          case "LIABILITY":
            color = "red";
            break;
          case "INCOME":
            color = "green";
            break;
          case "EXPENSE":
            color = "orange";
            break;
          case "EQUITY":
            color = "purple";
            break;
        }

        return <Tag color={color}>{value}</Tag>;
      },
    },
  ];

  const totalDebit = data.reduce((sum, row) => sum + (row.debit || 0), 0);

  const totalCredit = data.reduce((sum, row) => sum + (row.credit || 0), 0);

  const difference = totalDebit - totalCredit;

  const isBalanced = Math.abs(difference) < 0.01;

  return (
    // <Layout style={{ minHeight: "100vh" }}>
    //   <Layout.Sider
    //     width={role === "MEMBER" ? 200 : 250}
    //     breakpoint="lg"
    //     collapsedWidth="0"
    //     style={{
    //       height: "100vh",
    //       position: "sticky",
    //       top: 0,
    //       overflowY: "auto",
    //     }}
    //   >
    //     {role === "ADMIN" ? (
    //       <Sidebar />
    //     ) : role === "MEMBER" ? (
    //       <MemberSidebar />
    //     ) : role === "SUPER_ADMIN" ? (
    //       <SuperAdminSidebar />
    //     ) : (
    //       <AuditorSidebar />
    //     )}
    //   </Layout.Sider>

    //   {/* MAIN AREA */}
    //   <Layout style={{ minWidth: 0 }}>
    //     {/* HEADER (NO EXTRA DIV) */}
    //     {role === "ADMIN" ? (
    //       <Header />
    //     ) : role === "MEMBER" ? (
    //       <MemberHeader />
    //     ) : role === "SUPER_ADMIN" ? (
    //       <SuperAdminHeader />
    //     ) : (
    //       <AuditorHeader />
    //     )}
    //     <Content>
          <Card style={{ borderRadius: 12 }}>
            <Title level={3}>Trial Balance</Title>

            {loading ? (
              <Spin />
            ) : (
              <>
                <Table
                  className="compact-table"
                  dataSource={data}
                  columns={columns}
                  rowKey="glCode"
                  pagination={{ pageSize: 12 }}
                  bordered
                  size="small"
                  scroll={{ x: 800 }}
                  summary={() => (
                    <Table.Summary fixed>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={4}>
                          <strong>Total</strong>
                        </Table.Summary.Cell>

                        <Table.Summary.Cell index={4} align="right">
                          <strong>{totalDebit.toFixed(2)}</strong>
                        </Table.Summary.Cell>

                        <Table.Summary.Cell index={5} align="right">
                          <strong>{totalCredit.toFixed(2)}</strong>
                        </Table.Summary.Cell>

                        <Table.Summary.Cell index={6} />
                        <Table.Summary.Cell index={7} />
                        <Table.Summary.Cell index={8} />
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />

                <Row gutter={16} justify="end" style={{ marginTop: 20 }}>
                  <Col>
                    <Card size="small">
                      <b>Total Debit</b>
                      <div>{totalDebit.toFixed(2)}</div>
                    </Card>
                  </Col>

                  <Col>
                    <Card size="small">
                      <b>Total Credit</b>
                      <div>{totalCredit.toFixed(2)}</div>
                    </Card>
                  </Col>

                  <Col>
                    <Card
                      size="small"
                      style={{
                        border: isBalanced
                          ? "1px solid green"
                          : "1px solid red",
                      }}
                    >
                      <b>Difference</b>
                      <div
                        style={{
                          color: isBalanced ? "green" : "red",
                        }}
                      >
                        {difference.toFixed(2)}
                      </div>
                    </Card>
                  </Col>

                  <Col>
                    <Card size="small">
                      <b>Status</b>
                      <div
                        style={{
                          color: isBalanced ? "green" : "red",
                          fontWeight: 600,
                        }}
                      >
                        {isBalanced ? "BALANCED" : "NOT BALANCED"}
                      </div>
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </Card>
    //     </Content>
    //   </Layout>
    // </Layout>
  );
};

export default TrialBalance;

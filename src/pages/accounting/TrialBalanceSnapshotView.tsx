import React, { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Typography,
  Table,
  Row,
  Col,
  Spin,
  message,
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

const { Title } = Typography;
const { Content } = Layout;

const BASE_URL = import.meta.env.VITE_API_URL;

interface SnapshotRow {
  glCode: number;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
}

const TrialBalanceSnapshotView: React.FC = () => {

  const role = sessionStorage.getItem("role");

  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<SnapshotRow[]>([]);

  useEffect(() => {
    fetchSnapshot();
  }, []);

  const fetchSnapshot = async () => {

    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/trial-balance-snapshot/view`,
        {
          params: {
            societyId,
            financialYearId,
          },
        }
      );
      setData(res.data);
    } catch (error) {
      message.error("Snapshot not available");
    } finally {
      setLoading(false);
    }

  };
    const columns: ColumnsType<SnapshotRow> = [
    {
      title: "GL Code",
      dataIndex: "glCode",
      key: "glCode",
      width: 100,
      align: "center",
    },
    {
      title: "Account Name",
      dataIndex: "accountName",
      key: "accountName",
      width: 350,
    },
    {
      title: "Credit",
      dataIndex: "creditAmount",
      key: "creditAmount",
      width: 180,
      align: "right",
      render: (value: number) => (value || 0).toFixed(2),
    },
    {
      title: "Debit",
      dataIndex: "debitAmount",
      key: "debitAmount",
      width: 180,
      align: "right",
      render: (value: number) => (value || 0).toFixed(2),
    },

  ];

  const totalDebit = data.reduce(
    (sum, row) => sum + (row.debitAmount || 0),
    0
  );

  const totalCredit = data.reduce(
    (sum, row) => sum + (row.creditAmount || 0),
    0
  );

  const difference = totalDebit - totalCredit;

  const isBalanced = Math.abs(difference) < 0.01;
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
          <Card style={{ borderRadius: 12 }}>
            <Title level={3}>Trial Balance Snapshot</Title>

            {loading ? (
              <Spin />
            ) : (
              <>
                <Table
                  className="compact-table"
                  rowKey={(record) =>
                    `${record.glCode}-${record.accountName}`
                  }
                  dataSource={data}
                  columns={columns}
                  bordered
                  pagination={{ pageSize: 15 }}
                  size="small"
                  scroll={{ x: 900 }}
                  summary={() => (
                    <Table.Summary fixed>
                      <Table.Summary.Row>
                        <Table.Summary.Cell
                          index={0}
                          colSpan={2}
                        >
                          <strong>Total</strong>
                        </Table.Summary.Cell>

                        <Table.Summary.Cell
                          index={1}
                          align="right"
                        >
                          <strong>
                            {totalDebit.toFixed(2)}
                          </strong>
                        </Table.Summary.Cell>

                        <Table.Summary.Cell
                          index={2}
                          align="right"
                        >
                          <strong>
                            {totalCredit.toFixed(2)}
                          </strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />

                <Row
                  gutter={16}
                  justify="end"
                  style={{ marginTop: 20 }}
                >
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
                          color: isBalanced
                            ? "green"
                            : "red",
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
                          color: isBalanced
                            ? "green"
                            : "red",
                          fontWeight: 600,
                        }}
                      >
                        {isBalanced
                          ? "BALANCED"
                          : "NOT BALANCED"}
                      </div>
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TrialBalanceSnapshotView;
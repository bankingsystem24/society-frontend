import React, { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Typography,
  Table,
  Button,
  Input,
  InputNumber,
  Form,
  Space,
  Row,
  Col,
  Select,
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

interface ProfitLossRow {
  key: number;
  glCode: number;
  accountName: string;
  accountType: "INCOME" | "EXPENSE";
  amount: number;
}

const ProfitLossSnapshotEntry: React.FC = () => {
  const role = sessionStorage.getItem("role");

  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
  const createdBy = Number(sessionStorage.getItem("userId"));

  const [remarks, setRemarks] = useState("");
  const [glAccounts, setGlAccounts] = useState<any[]>([]);

  const [rows, setRows] = useState<ProfitLossRow[]>([
    {
      key: 1,
      glCode: 0,
      accountName: "",
      accountType: "EXPENSE",
      amount: 0,
    },
  ]);

  useEffect(() => {
    fetchGlAccounts();
  }, []);

  const fetchGlAccounts = async () => {
    try {
      const res = await axios.get( `${BASE_URL}/gl/master?societyId=${societyId}`);

      setGlAccounts(res.data);
    } catch (error) {
      message.error("Failed to load GL Accounts.");
    }
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        key: Date.now(),
        glCode: 0,
        accountName: "",
        accountType: "EXPENSE",
        amount: 0,
      },
    ]);
  };

  const deleteRow = (key: number) => {
    setRows(rows.filter((r) => r.key !== key));
  };

  const updateRow = (
    key: number,
    field: keyof ProfitLossRow,
    value: any
  ) => {
    setRows(
      rows.map((row) =>
        row.key === key
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  };

  const totalIncome = rows
    .filter((r) => r.accountType === "INCOME")
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const totalExpense = rows
    .filter((r) => r.accountType === "EXPENSE")
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const netProfit = totalIncome - totalExpense;

  const saveSnapshot = async () => {
    try {
      if (rows.length === 0) {
        message.error("Please add at least one row.");
        return;
      }

      for (const row of rows) {
        if (!row.accountName.trim()) {
          message.error("Please select an account.");
          return;
        }

        if (row.amount <= 0) {
          message.error(
            `Please enter amount for ${row.accountName}.`
          );
          return;
        }
      }

      const payload = {
        societyId,
        financialYearId,
        remarks,
        createdBy,
        details: rows.map((r) => ({
          glCode: r.glCode,
          accountName: r.accountName,
          accountType: r.accountType,
          amount: r.amount,
        })),
      };

      await axios.post(`${BASE_URL}/profit-loss-snapshot/save`,payload );

      message.success("Profit & Loss Snapshot saved successfully.");

      setRows([
        {
          key: 1,
          glCode: 0,
          accountName: "",
          accountType: "EXPENSE",
          amount: 0,
        },
      ]);

      setRemarks("");
    } catch (error) {
      console.error(error);
      message.error("Failed to save snapshot.");
    }
  };
    const columns: ColumnsType<ProfitLossRow> = [
    {
      title: "Sr.",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Account Name",
      width: 300,
      render: (_, record) => (
        <Select
          showSearch
          style={{ width: "100%" }}
          placeholder="Select GL Account"
          value={record.glCode || undefined}
          options={glAccounts.map((gl: any) => ({
            value: gl.glCode,
            label: `${gl.glCode} - ${gl.accountName}`,
          }))}
          onChange={(value) => {
            const account = glAccounts.find(
              (g: any) => Number(g.glCode) === Number(value)
            );

            if (!account) return;

            setRows((prev) =>
              prev.map((r) =>
                r.key === record.key
                  ? {
                      ...r,
                      glCode: account.glCode,
                      accountName: account.accountName,
                    }
                  : r
              )
            );
          }}
          filterOption={(input, option) =>
            String(option?.label ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        />
      ),
    },
    {
      title: "Account Type",
      width: 180,
      align: "center",
      render: (_, record) => (
        <Select
          style={{ width: "100%" }}
          value={record.accountType}
          onChange={(value) =>
            updateRow(record.key, "accountType", value)
          }
          options={[
            {
              value: "INCOME",
              label: "Income",
            },
            {
              value: "EXPENSE",
              label: "Expense",
            },
          ]}
        />
      ),
    },
    {
      title: "Amount",
      width: 180,
      align: "center",
      render: (_, record) => (
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          precision={2}
          value={record.amount}
          onChange={(value) =>
            updateRow(record.key, "amount", value || 0)
          }
        />
      ),
    },
    {
      title: "Action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Button danger onClick={() => deleteRow(record.key)}>
          Delete
        </Button>
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
            <Title level={3}>
              Profit &amp; Loss Snapshot Entry
            </Title>

            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Remarks">
                    <Input
                      placeholder="Enter Remarks"
                      value={remarks}
                      onChange={(e) =>
                        setRemarks(e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <Table
              className="compact-table"
              rowKey="key"
              dataSource={rows}
              columns={columns}
              pagination={false}
              bordered
              size="small"
              scroll={{ x: 900 }}
              style={{ marginTop: 20 }}
            />

            <Row gutter={16} style={{ marginTop: 20 }}>
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
                      fontSize: 18,
                      fontWeight: 600,
                    }}
                  >
                    ₹ {totalIncome.toFixed(2)}
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
                      fontSize: 18,
                      fontWeight: 600,
                    }}
                  >
                    ₹ {totalExpense.toFixed(2)}
                  </div>
                </Card>
              </Col>

              <Col>
                <Card
                  size="small"
                  style={{
                    minWidth: 200,
                    textAlign: "center",
                    border:
                      netProfit >= 0
                        ? "1px solid green"
                        : "1px solid red",
                  }}
                >
                  <b>Net Profit / Loss</b>

                  <div
                    style={{
                      color:
                        netProfit >= 0
                          ? "green"
                          : "red",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    ₹ {netProfit.toFixed(2)}
                  </div>
                </Card>
              </Col>
            </Row>

            <Space style={{ marginTop: 20 }}>
              <Button
                type="dashed"
                onClick={addRow}
              >
                Add Row
              </Button>

              <Button
                type="primary"
                onClick={saveSnapshot}
              >
                Save Snapshot
              </Button>
            </Space>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProfitLossSnapshotEntry;
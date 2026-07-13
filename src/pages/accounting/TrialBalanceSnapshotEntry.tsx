import React, { useState, useEffect } from "react";
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
  message,
  Select,
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
  key: number;
  glCode: number;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  accountType: string;
}

const TrialBalanceSnapshotEntry: React.FC = () => {
  const role = sessionStorage.getItem("role");

  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
//   const createdBy = sessionStorage.getItem("username");
  const [remarks, setRemarks] = useState("");
  const [glAccounts, setGlAccounts] = useState<any[]>([]);
  const createdBy = Number(sessionStorage.getItem("userId"));

  useEffect(() => {
    fetchGlAccounts();
  }, []);

  const fetchGlAccounts = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/gl/master?societyId=${societyId}`,
      );
      setGlAccounts(res.data);
    } catch (error) {
      message.error("Failed to load GL Accounts");
    }
  };

  const [rows, setRows] = useState<SnapshotRow[]>([
    {
      key: 1,
      glCode: 0,
      accountName: "",
      debitAmount: 0,
      creditAmount: 0,
      accountType: "SNAPSHOT",
    },
  ]);

  const addRow = () => {
    setRows([
      ...rows,
      {
        key: Date.now(),
        glCode: 0,
        accountName: "",
        debitAmount: 0,
        creditAmount: 0,
        accountType: "SNAPSHOT",
      },
    ]);
  };

  const deleteRow = (key: number) => {
    setRows(rows.filter((r) => r.key !== key));
  };

  const updateRow = (key: number, field: keyof SnapshotRow, value: any) => {
    setRows(
      rows.map((r) =>
        r.key === key
          ? {
              ...r,
              [field]: value,
            }
          : r,
      ),
    );
  };

  const totalDebit = rows.reduce((sum, row) => sum + (row.debitAmount || 0), 0);

  const totalCredit = rows.reduce(
    (sum, row) => sum + (row.creditAmount || 0),
    0,
  );

  const difference = totalDebit - totalCredit;
  const saveSnapshot = async () => {
    try {
      if (rows.length === 0) {
        message.error("Please add at least one row.");
        return;
      }

      for (const row of rows) {
        if (!row.accountName.trim()) {
          message.error("Account Name cannot be empty.");
          return;
        }

        if (row.debitAmount === 0 && row.creditAmount === 0) {
          message.error(`Please enter Debit or Credit for ${row.accountName}`);
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
          debitAmount: r.debitAmount,
          creditAmount: r.creditAmount,
          accountType: "SNAPSHOT",
        })),
      };

      await axios.post(`${BASE_URL}/trial-balance-snapshot/save`, payload);

      message.success("Snapshot saved successfully.");

      setRows([
        {
          key: 1,
          glCode: 0,
          accountName: "",
          debitAmount: 0,
          creditAmount: 0,
          accountType: "SNAPSHOT",
        },
      ]);

      setRemarks("");
    } catch (error) {
      console.error(error);
      message.error("Failed to save snapshot.");
    }
  };

  const columns: ColumnsType<SnapshotRow> = [
    {
      title: "Sr.",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Account Name",
      width: 150,
      render: (_, record) => (
        <Select
          showSearch
          style={{ width: "100%" }}
          placeholder="Select Account"
          value={record.glCode || undefined}
          options={glAccounts.map((gl: any) => ({
            value: gl.glCode,
            label: `${gl.glCode} - ${gl.accountName}`,
          }))}
          onChange={(value) => {
            const account = glAccounts.find(
              (g: any) => Number(g.glCode) === Number(value),
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
                  : r,
              ),
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
      title: "Credit",
      width: 180,
      align: "center",
      render: (_, record) => (
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          precision={2}
          value={record.creditAmount}
          onChange={(value) =>
            updateRow(record.key, "creditAmount", value || 0)
          }
        />
      ),
    },
    {
      title: "Debit",
      width: 180,
      align: "center",
      render: (_, record) => (
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          precision={2}
          value={record.debitAmount}
          onChange={(value) => updateRow(record.key, "debitAmount", value || 0)}
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
            <Title level={3}>Trial Balance Snapshot Entry</Title>

            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Remarks">
                    <Input
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter Remarks"
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
            />

            <Row gutter={16} style={{ marginTop: 20 }}>
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
                    border:
                      Math.abs(difference) < 0.01
                        ? "1px solid green"
                        : "1px solid red",
                  }}
                >
                  <b>Difference</b>
                  <div
                    style={{
                      color: Math.abs(difference) < 0.01 ? "green" : "red",
                    }}
                  >
                    {difference.toFixed(2)}
                  </div>
                </Card>
              </Col>
            </Row>

            <Space style={{ marginTop: 20 }}>
              <Button type="dashed" onClick={addRow}>
                Add Row
              </Button>

              <Button type="primary" onClick={saveSnapshot}>
                Save Snapshot
              </Button>
            </Space>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TrialBalanceSnapshotEntry;

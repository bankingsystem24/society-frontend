import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  InputNumber,
  Select,
  Space,
  message,
  Typography,
  Layout,
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

const { Title } = Typography;
const { Content } = Layout;
const BASE_URL = import.meta.env.VITE_API_URL;
const role = sessionStorage.getItem("role");

interface BalanceSheetRow {
  key: number;
  glCode: number;
  accountName: string;
  accountType: string;
  amount: number;
}

interface GLMaster {
  glCode: number;
  accountName: string;
  groupName: string;
}

interface BalanceSheetDetailDTO {
  id?: number;
  glCode: number;
  accountName: string;
  accountType: string;
  amount: number;
}

interface BalanceSheetDTO {
  id?: number;
  societyId: number;
  financialYearId: number;
  financialYear: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  details: BalanceSheetDetailDTO[];
}

const BalanceSheetSnapshot: React.FC = () => {
  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
  const financialYear = sessionStorage.getItem("financialYear") || "";
  const createdBy = sessionStorage.getItem("userId") || "";

  const [loading, setLoading] = useState(false);

  const [rows, setRows] = useState<BalanceSheetRow[]>([]);
  const [glMasters, setGlMasters] = useState<GLMaster[]>([]);

  useEffect(() => {
    loadSnapshot();
    loadGLMasters();
  }, []);

  const loadGLMasters = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/gl/master`, {
        params: { societyId },
      });
      setGlMasters(response.data);
    } catch (error) {
      console.error(error);
      message.error("Unable to load GL Accounts.");
    }
  };
  const loadSnapshot = async () => {
    try {
      setLoading(true);

      const response = await axios.get<BalanceSheetDTO>(
        `${BASE_URL}/balance-sheet-snapshot/${financialYearId}`,
      );

      const data = response.data;

      setRows(
        data.details.map((d, index) => ({
          key: index + 1,
          glCode: d.glCode,
          accountName: d.accountName,
          accountType: d.accountType,
          amount: d.amount,
        })),
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (key: number, field: keyof BalanceSheetRow, value: any) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
    );
  };

  const columns: ColumnsType<BalanceSheetRow> = [
    {
      title: "GL Account",
      width: 350,
      render: (_, record) => (
        <Select
          showSearch
          style={{ width: "100%" }}
          placeholder="Select GL Account"
          value={
            record.glCode
              ? `${record.glCode} - ${record.accountName}`
              : undefined
          }
          optionFilterProp="label"
          onChange={(value) => {
            const gl = glMasters.find((x) => x.glCode === Number(value));

            if (!gl) return;

            setRows((prev) =>
              prev.map((r) =>
                r.key === record.key
                  ? {
                      ...r,
                      glCode: gl.glCode,
                      accountName: gl.accountName,
                      accountType: gl.groupName,
                    }
                  : r,
              ),
            );
          }}
          options={glMasters.map((gl) => ({
            value: gl.glCode,
            label: `${gl.glCode} - ${gl.accountName}`,
          }))}
        />
      ),
    },
    {
      title: "Account Type",
      dataIndex: "accountType",
      width: 180,
      render: (_, record) => (
        <Select
          style={{ width: "100%" }}
          value={record.accountType}
          onChange={(v) => updateRow(record.key, "accountType", v)}
          options={[
            { value: "ASSETS", label: "ASSETS" },
            { value: "LIABILITIES", label: "LIABILITIES" },
            { value: "EQUITY", label: "EQUITY" },
          ]}
        />
      ),
    },

    {
      title: "Amount",
      dataIndex: "amount",
      width: 180,
      render: (_, record) => (
        <InputNumber
          style={{ width: "100%" }}
          value={record.amount === 0 ? undefined : record.amount}
          onChange={(v) => updateRow(record.key, "amount", Number(v))}
        />
      ),
    },
  ];
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        key: Date.now(),
        glCode: 0,
        accountName: "",
        accountType: "ASSETS",
        amount: 0,
      },
    ]);
  };

  const deleteRow = (key: number) => {
    setRows((prev) => prev.filter((r) => r.key !== key));
  };

  const totalAssets = rows
    .filter((r) => r.accountType === "ASSETS")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const totalLiabilities = rows
    .filter((r) => r.accountType === "LIABILITIES")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const totalEquity = rows
    .filter((r) => r.accountType === "EQUITY")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const saveSnapshot = async () => {
    if (rows.length === 0) {
      message.error("Please add at least one row.");
      return;
    }

    for (const row of rows) {
      if (!row.glCode) {
        message.error("GL Code is required.");
        return;
      }

      if (!row.accountName.trim()) {
        message.error("Account Name is required.");
        return;
      }

      if (!row.accountType) {
        message.error("Account Type is required.");
        return;
      }
    }

    const payload = {
      societyId,
      financialYearId,
      financialYear,
      createdBy,

      details: rows.map((r) => ({
        glCode: r.glCode,
        accountName: r.accountName,
        accountType: r.accountType,
        amount: Number(r.amount),
      })),
    };

    try {
      setLoading(true);

      await axios.post(`${BASE_URL}/balance-sheet-snapshot/save`, payload);

      message.success("Balance Sheet Snapshot saved successfully.");
    } catch (error: any) {
      console.error(error);

      message.error(
        error?.response?.data?.message ||
          "Failed to save Balance Sheet Snapshot.",
      );
    } finally {
      setLoading(false);
    }
  };

  const actionColumn: ColumnsType<BalanceSheetRow>[number] = {
    title: "Action",
    width: 100,
    align: "center",

    render: (_, record) => (
      <Button danger onClick={() => deleteRow(record.key)}>
        Delete
      </Button>
    ),
  };

  const tableColumns = [...columns, actionColumn];
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
          <Card>
            <Title level={3}>Balance Sheet Snapshot</Title>
            <Space
              style={{
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Space>
                <Button type="primary" onClick={addRow}>
                  Add Row
                </Button>

                <Button type="primary" onClick={saveSnapshot} loading={loading}>
                  Save Snapshot
                </Button>

                <Button onClick={loadSnapshot}>Refresh</Button>
              </Space>
            </Space>

            <Table
              rowKey="key"
              bordered
              loading={loading}
              columns={tableColumns}
              dataSource={rows}
              pagination={false}
              scroll={{ x: 900 }}
            />

            <Card
              style={{
                marginTop: 20,
                background: "#fafafa",
              }}
            >
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <strong>Total Assets</strong>
                  <strong>{totalAssets.toFixed(2)}</strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <strong>Total Liabilities</strong>
                  <strong>{totalLiabilities.toFixed(2)}</strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <strong>Total Equity</strong>
                  <strong>{totalEquity.toFixed(2)}</strong>
                </div>

                <hr />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color:
                      totalAssets === totalLiabilities + totalEquity
                        ? "green"
                        : "red",
                  }}
                >
                  <strong>Assets</strong>
                  <strong>{totalAssets.toFixed(2)}</strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color:
                      totalAssets === totalLiabilities + totalEquity
                        ? "green"
                        : "red",
                  }}
                >
                  <strong>Liabilities + Equity</strong>
                  <strong>{(totalLiabilities + totalEquity).toFixed(2)}</strong>
                </div>
              </Space>
            </Card>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BalanceSheetSnapshot;

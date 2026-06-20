import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Typography,
  Select,
  Row,
  Col,
  message,
  Tag,
  Space,
  Layout
} from "antd";
import axios from "axios";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";

const BASE_URL = import.meta.env.VITE_API_URL;
const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

interface LedgerData {
  entryDate: string;
  voucherNo: string;
  voucherType: string;
  narration: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  glCode: number;
  accountHead: string;
}

interface GLItem {
  glCode: number;
  accountName?: string;
  groupName?: string;
}

const LedgerView: React.FC = () => {
  const [data, setData] = useState<LedgerData[]>([]);
  const [loading, setLoading] = useState(false);

  const [glList, setGlList] = useState<GLItem[]>([]);
  const [glCode, setGlCode] = useState<number | null>(null);

  const societyId = sessionStorage.getItem("societyId");
  const role = sessionStorage.getItem("role");

  // ---------------- FETCH GL LIST ----------------
  useEffect(() => {
    fetchGlCodes();
  }, []);

  const fetchGlCodes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/gl/master?societyId=${societyId}`);

      const list = res.data || [];
      setGlList(list);

      // set default GL dynamically
      if (list.length > 0) {
        setGlCode(list[0].glCode);
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to load GL codes");
    }
  };

  // ---------------- FETCH LEDGER ----------------
  useEffect(() => {
    if (glCode) {
      fetchLedger();
    }
  }, [glCode]);

  const fetchLedger = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${BASE_URL}/ledger/${societyId}/${glCode}`
      );

      setData(response.data || []);

    } catch (error) {
      console.error(error);
      message.error("Failed to load ledger");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- CALCULATIONS ----------------
  const totalDebit = data.reduce(
    (sum, item) => sum + (item.debitAmount || 0),
    0
  );

  const totalCredit = data.reduce(
    (sum, item) => sum + (item.creditAmount || 0),
    0
  );

  const closingBalance =
    data.length > 0 ? data[data.length - 1].balance : 0;

  const accountName =
    data.length > 0
      ? `${data[0].glCode} - ${data[0].accountHead}`
      : "";

  // ---------------- TABLE COLUMNS ----------------
  const columns = [
    {
      title: "Date",
      dataIndex: "entryDate",
      key: "entryDate",
      width: 120,
      render: (date: string) =>
        new Date(date).toLocaleDateString("en-GB"),
    },
    {
      title: "Voucher No",
      dataIndex: "voucherNo",
      key: "voucherNo",
      width: 140,
    },
    {
      title: "Type",
      dataIndex: "voucherType",
      key: "voucherType",
      width: 120,
      render: (type: string) => {
        let color = "blue";

        if (type === "BILL") color = "orange";
        else if (type === "RECEIPT") color = "green";
        else if (type === "PAYMENT") color = "red";
        else if (type === "JOURNAL") color = "purple";
        else if (type === "OPENING") color = "gold";

        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "Narration",
      dataIndex: "narration",
      key: "narration",
    },
    {
      title: "Debit",
      dataIndex: "debitAmount",
      key: "debitAmount",
      align: "right" as const,
      width: 140,
      render: (value: number) =>
        value > 0
          ? value.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })
          : "-",
    },
    {
      title: "Credit",
      dataIndex: "creditAmount",
      key: "creditAmount",
      align: "right" as const,
      width: 140,
      render: (value: number) =>
        value > 0
          ? value.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })
          : "-",
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      align: "right" as const,
      width: 170,
      render: (value: number) => (
        <b>
          {Math.abs(value).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}{" "}
          {value >= 0 ? "DR" : "CR"}
        </b>
      ),
    },
  ];

  // ---------------- UI ----------------
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
      {role === "ADMIN" ? <Sidebar /> : role === "MEMBER" ? <MemberSidebar /> : role=== "SUPER_ADMIN" ? <SuperAdminSidebar/> : <AuditorSidebar />}
    </Layout.Sider>

    {/* MAIN AREA */}
    <Layout style={{ minWidth: 0 }}>

      {/* HEADER (NO EXTRA DIV) */}
      {role === "ADMIN" ? <Header /> : role === "MEMBER" ? <MemberHeader /> : role=== "SUPER_ADMIN" ? <SuperAdminHeader/> : <AuditorHeader />}
      <Content>

    <Card variant="outlined">
      <Row justify="space-between" align="middle">
        <Col>
          <Space direction="vertical" size={0}>
            <Title level={3} style={{ margin: 0 }}>
              Ledger Report
            </Title>

            <Text strong>{accountName}</Text>
          </Space>
        </Col>

        <Col>
          <Select
            value={glCode ?? undefined}
            style={{ width: 320 }}
            onChange={(value) => setGlCode(value)}
            loading={glList.length === 0}
            placeholder="Select Account"
          >
            {glList.map((gl) => (
              <Option key={gl.glCode} value={gl.glCode}>
                {gl.glCode} -{" "}
                {gl.accountName || gl.groupName || "Account"}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Table
        bordered
        size="small"
        loading={loading}
        columns={columns}
        dataSource={data}
        rowKey={(record) =>
          `${record.voucherNo}-${record.glCode}-${record.entryDate}`
        }
        pagination={{ pageSize: 8 }}
        style={{ marginTop: 20 }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={4}>
              <b>Total</b>
            </Table.Summary.Cell>

            <Table.Summary.Cell index={1} align="right">
              <b>
                {totalDebit.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </b>
            </Table.Summary.Cell>

            <Table.Summary.Cell index={2} align="right">
              <b>
                {totalCredit.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </b>
            </Table.Summary.Cell>

            <Table.Summary.Cell index={3} align="right">
              <b>
                {Math.abs(closingBalance).toLocaleString(
                  "en-IN",
                  { minimumFractionDigits: 2 }
                )}{" "}
                {closingBalance >= 0 ? "DR" : "CR"}
              </b>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />

      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={8}>
          <Card size="small">
            <b>Total Debit</b>
            <div>
              ₹{" "}
              {totalDebit.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card size="small">
            <b>Total Credit</b>
            <div>
              ₹{" "}
              {totalCredit.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card size="small">
            <b>Closing Balance</b>
            <div>
              ₹{" "}
              {Math.abs(closingBalance).toLocaleString(
                "en-IN",
                { minimumFractionDigits: 2 }
              )}{" "}
              {closingBalance >= 0 ? "DR" : "CR"}
            </div>
          </Card>
        </Col>
      </Row>
    </Card>
    </Content>
    </Layout>
    </Layout>
  );
};

export default LedgerView;
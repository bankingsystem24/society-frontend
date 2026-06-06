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
} from "antd";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

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

const LedgerView: React.FC = () => {
  const [data, setData] = useState<LedgerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [glCode, setGlCode] = useState<number>(1101);

  const societyId = sessionStorage.getItem("societyId");

  useEffect(() => {
    fetchLedger();
  }, [glCode]);

  const fetchLedger = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${BASE_URL}/ledger/${societyId}/${glCode}`
      );

      setData(response.data || []);

      console.log("Ledger",response.data);
      
    } catch (error) {
      console.error(error);
      message.error("Failed to load ledger");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Card variant="outlined">
      <Row justify="space-between" align="middle">
        <Col>
          <Space orientation="vertical" size={0}>
            <Title level={3} style={{ margin: 0 }}>
              Ledger Report
            </Title>

            <Text strong>{accountName}</Text>
          </Space>
        </Col>

        <Col>
          <Select
            value={glCode}
            style={{ width: 280 }}
            onChange={(value) => setGlCode(value)}
          >
            <Option value={1101}>
              1101 - Member Receivable
            </Option>

            <Option value={4001}>
              4001 - Maintenance Income
            </Option>

            <Option value={1001}>
              1001 - Cash In Hand
            </Option>

            <Option value={1010}>
              1010 - Bank Savings Account
            </Option>
          </Select>
        </Col>
      </Row>

      <Table
        bordered
        size="small"
        loading={loading}
        columns={columns}
        dataSource={data}
        rowKey={(record) => `${record.voucherNo}-${record.glCode}-${record.entryDate}`}
        pagination={{
          pageSize: 20,
        }}
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
                  {
                    minimumFractionDigits: 2,
                  }
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
                {
                  minimumFractionDigits: 2,
                }
              )}{" "}
              {closingBalance >= 0 ? "DR" : "CR"}
            </div>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default LedgerView;
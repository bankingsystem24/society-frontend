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
} from "antd";
import axios from "axios";

const { Title } = Typography;
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
        `http://localhost:7777/api/ledger/${societyId}/${glCode}`
      );

      setData(response.data);
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

        if (type === "RECEIPT") color = "green";
        if (type === "PAYMENT") color = "red";
        if (type === "JOURNAL") color = "purple";

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
        value ? value.toLocaleString("en-IN") : "-",
    },
    {
      title: "Credit",
      dataIndex: "creditAmount",
      key: "creditAmount",
      align: "right" as const,
      width: 140,
      render: (value: number) =>
        value ? value.toLocaleString("en-IN") : "-",
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      align: "right" as const,
      width: 140,
      render: (value: number) =>
        value.toLocaleString("en-IN"),
    },
  ];

  return (
    <Card style={{ margin: 20 }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={3}>Ledger Report</Title>
        </Col>

        <Col>
          <Select
            value={glCode}
            style={{ width: 260 }}
            onChange={(value) => setGlCode(value)}
          >
            <Option value={1101}>
              1101 - Member Receivable
            </Option>

            <Option value={3000}>
              3000 - Maintenance Income
            </Option>

            <Option value={1001}>
              1001 - Bank Account
            </Option>

            <Option value={4000}>
              4000 - Electricity Charges
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
        rowKey={(record, index) => `${record.voucherNo}-${index}`}
        pagination={{
          pageSize: 10,
        }}
        style={{ marginTop: 20 }}
      />

      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={8}>
          <Card size="small">
            <b>Total Debit</b>
            <div>
              ₹ {totalDebit.toLocaleString("en-IN")}
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card size="small">
            <b>Total Credit</b>
            <div>
              ₹ {totalCredit.toLocaleString("en-IN")}
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card size="small">
            <b>Closing Balance</b>
            <div>
              ₹ {closingBalance.toLocaleString("en-IN")}
            </div>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default LedgerView;
import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Typography,
  Button,
  Spin,
  Tag,
  message,
  Space,
  Checkbox,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";

const { Title, Text } = Typography;

const BASE_URL = import.meta.env.VITE_API_URL;

interface SinkingFundRegister {
  id: number;
  flatNo: string;
  memberName: string;
  month: string;
  year: number;
  amount: number;
  status: string;
  paidDate: string;
  paymentMode: string;
 transactionId: string;
  receiptNo: string;
}

const SinkingFundRegister: React.FC = () => {
const [data, setData] = useState<SinkingFundRegister[]>([]);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);

  const societyId = Number(sessionStorage.getItem("societyId"));

const [selectedColumns, setSelectedColumns] = useState<string[]>([
  "srNo",
  "flatNo",
  "memberName",
  "month",
  "maintenanceAmount",
  "penaltyAmount",
  "interestAmount",
  "discountAmount",
  "totalAmount",
  "dueDate",
  "status",
]);
  useEffect(() => {
   fetchSinkingFundRegister();
}, []);

const fetchSinkingFundRegister = async () => {
  try {
    setLoading(true);

    const res = await axios.get(
       `${BASE_URL}/sinking-fund`,
      {
        params: { societyId },
      }
    );

    setData(res.data || []);
  } catch {
    message.error("Failed to load Sinking Fund Register");
  } finally {
    setLoading(false);
  }
};

  const handlePrint = () => {
    setPrinting(true);

    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 300);
  };
const columnOptions = [
  { label: "SN.", value: "srNo" },
  { label: "Flat No", value: "flatNo" },
  { label: "Member Name", value: "memberName" },
  { label: "Month", value: "month" },
   { label: "Year", value: "year" },
  { label: "Amount", value: "amount" },
  { label: "Status", value: "status" },
    { label: "Transaction ID", value: "transactionId" },
];
const [pagination, setPagination] = useState({
  current: 1,
  pageSize: 20,
});
const allColumns: ColumnsType<SinkingFundRegister> = [
  {
    title: "SN.",
    key: "srNo",
    width: 50,
    align: "center",
    render: (_, __, index) =>
  (pagination.current - 1) * pagination.pageSize + index + 1,
  },
  {
    title: "Flat No",
    dataIndex: "flatNo",
    key: "flatNo",
    width: 80,
  },
  {
    title: "Member Name",
    dataIndex: "memberName",
    key: "memberName",
    width: 250,
  },
  {
    title: "Month",
    key: "month",
    render: (_, record) => `${record.month}-${record.year}`,
    width: 120,
  },
    {
    title: "Year",
    dataIndex: "year",
    key: "year",
    width: 80,
    align: "center",
  },
{
  title: "Amount",
  dataIndex: "amount",
  key: "amount",
  align: "right",
 render: (v) => `₹ ${(v || 0).toFixed(2)}`
},
{
  title: "Paid Date",
  dataIndex: "paidDate",
  key: "paidDate",
},
  {
  title: "Payment Mode",
  dataIndex: "paymentMode",
  key: "paymentMode",
},
  {
    title: "Transaction ID",
    dataIndex: "transactionId",
    key: "transactionId",
    width: 180,
  },
 {
  title: "Receipt No",
  dataIndex: "receiptNo",
  key: "receiptNo",
},

 
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    align: "center",
    width: 100,
    render: (value: string) =>
      printing ? (
        value
      ) : (
        <Tag color={value === "PENDING" ? "red" : "green"}>
          {value}
        </Tag>
      ),
  },
];

  const visibleColumns = allColumns.filter((col) =>
    selectedColumns.includes(col.key as string)
  );

  return (
    <Card bordered={false} style={{ borderRadius: 0 }}>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 0,
        }}
      >
    <Title level={5} className="print-title">
  Sinking Fund Register
</Title>
        <Button
          className="no-print"
          type="primary"
          onClick={handlePrint}
        >
          Print
        </Button>
      </Space>

      <div
        className="no-print"
        style={{
          background: "#f5f5f5",
          padding: "12px 16px",
          borderRadius: 8,
          border: "1px solid #d9d9d9",
          marginBottom: 16,
        }}
      >
        <Text strong>Select/Remove Columns :</Text>

        <br />
        <br />

        <Checkbox.Group
          value={selectedColumns}
          onChange={(values) => setSelectedColumns(values as string[])}
        >
          {columnOptions.map((item) => (
            <Checkbox
              key={item.value}
              value={item.value}
              style={{
                marginRight: 16,
                marginBottom: 8,
              }}
            >
              {item.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>

      {loading ? (
        <Spin />
      ) : (
        <Table
          className="compact-table"
          rowKey="id"
          bordered
          size="small"
          dataSource={data}
          columns={visibleColumns}
          pagination={
  printing
    ? false
    : {
        current: pagination.current,
        pageSize: pagination.pageSize,
        showSizeChanger: true,
      }
}
onChange={(page) => {
  setPagination({
    current: page.current!,
    pageSize: page.pageSize!,
  });
}}
          scroll={printing ? undefined : { x: 1000 }}
        />
      )}
    </Card>
  );
};

export default SinkingFundRegister;
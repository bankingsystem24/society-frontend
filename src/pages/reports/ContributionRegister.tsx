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

interface ContributionRegister {
  id: number;
  flatNo: string;
  memberName: string;
  name: string;
  type: string;
  mode: string;
  amount: number;
  date: string;
  dueDate: string;
  paidDate: string;
  paymentMode: string;
  transactionId: string;
  status: string;
}

const ContributionRegister: React.FC = () => {
 const [data, setData] = useState<ContributionRegister[]>([]);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);

  
  const societyId = Number(sessionStorage.getItem("societyId"));
const financialYearId = Number(sessionStorage.getItem("financialYearId"));

const [selectedColumns, setSelectedColumns] = useState<string[]>([
  "srNo",
  "flatNo",
  "memberName",
  "type",
  "mode",
  "amount",
  "date",
  "dueDate",
  "paidDate",
  "paymentMode",
  "transactionId",
  "status",
]);
useEffect(() => {
  fetchContributionRegister();
}, []);

const fetchContributionRegister = async () => {
  try {
    setLoading(true);

const res = await axios.get(
  `${BASE_URL}/contribution/${societyId}/${financialYearId}`
);

    setData(res.data || []);
  } catch {
    message.error("Failed to load Contribution Register");
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
  { label: "Type", value: "type" },
  { label: "Mode", value: "mode" },
  { label: "Amount", value: "amount" },
  { label: "Date", value: "date" },
  { label: "Due Date", value: "dueDate" },
  { label: "Paid Date", value: "paidDate" },
  { label: "Payment Mode", value: "paymentMode" },
  { label: "Transaction ID", value: "transactionId" },
  { label: "Status", value: "status" },
];
const [pagination, setPagination] = useState({
  current: 1,
  pageSize: 20,
});
const allColumns: ColumnsType<ContributionRegister> = [
  {
    title: "SN.",
    key: "srNo",
    align: "center",
    render: (_, __, index) =>
  (pagination.current - 1) * pagination.pageSize + index + 1,
  },
  {
    title: "Flat No",
    dataIndex: "flatNo",
    key: "flatNo",
  },
  {
    title: "Member Name",
    dataIndex: "memberName",
    key: "memberName",
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
  },
  {
    title: "Mode",
    dataIndex: "mode",
    key: "mode",
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    align: "right",
    render: (v) => `₹ ${(v ?? 0).toFixed(2)}`,
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Due Date",
    dataIndex: "dueDate",
    key: "dueDate",
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
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    align: "center",
    render: (value) =>
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
  Contribution Register
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
          rowKey="billId"
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

export default ContributionRegister;
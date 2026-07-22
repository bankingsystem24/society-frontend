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

interface FlatWiseMember {
  flatNo: string;
  memberName: string;
  mobile: string;
  email: string;
  memberType: string;
  ownershipType: string | null;
  active: boolean;
}

const FlatWiseMembers: React.FC = () => {
  const [data, setData] = useState<FlatWiseMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const societyId = Number(sessionStorage.getItem("societyId"));
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "srNo",
    "flatNo",
    "memberName",
    "mobile",
    "email",
    "memberType",
    "active",
  ]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const columnOptions = [
    { label: "SN.", value: "srNo" },
    { label: "Flat No", value: "flatNo" },
    { label: "Member Name", value: "memberName" },
    { label: "Mobile", value: "mobile" },
    { label: "Email", value: "email" },
    { label: "Member Type", value: "memberType" },
    { label: "Status", value: "active" },
  ];

  const fetchMembers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/reports/flat-wise-members`, {
        params: { societyId },
      });

      setData(res.data || []);
    } catch (err) {
      message.error("Failed to load Flat Wise Members");
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
  const allColumns: ColumnsType<FlatWiseMember> = [
    {
      title: "SN.",
      key: "srNo",
      width: 40,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Flat No",
      dataIndex: "flatNo",
      key: "flatNo",
      width: 70,
    },
    {
      title: "Member Name",
      dataIndex: "memberName",
      key: "memberName",
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
      width: 90,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string) => (
        <span
          style={{
            wordBreak: "break-word",
            whiteSpace: "normal",
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Type",
      dataIndex: "memberType",
      key: "memberType",
      width: 90,
      align: "center",
      render: (value: string) =>
        printing ? (
          value
        ) : (
          <Tag color={value === "OWNER" ? "blue" : "orange"}>{value}</Tag>
        ),
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      width: 70,
      align: "center",
      render: (value: boolean) =>
        printing ? (
          value ? (
            "ACTIVE"
          ) : (
            "INACTIVE"
          )
        ) : (
          <Tag color={value ? "green" : "red"}>
            {value ? "ACTIVE" : "INACTIVE"}
          </Tag>
        ),
    },
  ];

  const visibleColumns = allColumns.filter((col) =>
    selectedColumns.includes(col.key as string),
  );

  return (
    <Card bordered={false} style={{ borderRadius: 0 }}>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 0,
          marginTop: 0,
        }}
      >
        <Title level={5} className="print-title" style={{ marginTop: 0 }}>
          Flat Wise Members Report
        </Title>

        <Button className="no-print" type="primary" onClick={handlePrint}>
          Print
        </Button>
      </Space>

      <div
        className="no-print"
        style={{
          background: "#f5f5f5",
          padding: "12px 16px",
          borderRadius: "8px",
          border: "1px solid #d9d9d9",
          marginBottom: "16px",
        }}
      >
        <Text style={{ fontWeight: "bold", marginRight: 10 }}>
          Select/Remove Columns :
        </Text>

        <Checkbox.Group
          value={selectedColumns}
          onChange={(values) => setSelectedColumns(values as string[])}
        >
          {columnOptions.map((item) => (
            <Checkbox
              key={item.value}
              value={item.value}
              style={{ marginRight: 16, marginBottom: 8 }}
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
          rowKey={(record) => record.flatNo}
          dataSource={data}
          columns={visibleColumns}
          bordered
          size="small"
          pagination={printing ? false : { pageSize: 20 }}
          scroll={printing ? undefined : { x: 900 }}
        />
      )}
    </Card>
  );
};

export default FlatWiseMembers;

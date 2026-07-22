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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";

const { Title } = Typography;

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

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/reports/flat-wise-members`,
        {
          params: { societyId },
        }
      );

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

  const columns: ColumnsType<FlatWiseMember> = [
    {
      title: "SN.",
      width: 50,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Flat No",
      dataIndex: "flatNo",
      key: "flatNo",
      width: 100,
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
      width: 130,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Member Type",
      dataIndex: "memberType",
      key: "memberType",
      width: 120,
      align: "center",
      render: (value: string) => (
        <Tag color={value === "OWNER" ? "blue" : "orange"}>
          {value}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      width: 100,
      align: "center",
      render: (value: boolean) => (
        <Tag color={value ? "green" : "red"}>
          {value ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
  ];

  return (
    <Card
      bordered={false}
      style={{ borderRadius: 10 }}
    >
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Flat Wise Members Report
        </Title>

        <Button type="primary" onClick={handlePrint}>
          Print
        </Button>
      </Space>

      {loading ? (
        <Spin />
      ) : (
        <Table
          className="compact-table"
          rowKey={(record) => record.flatNo}
          dataSource={data}
          columns={columns}
          bordered
          size="small"
          pagination={printing ? false : { pageSize: 20 }}
          scroll={{ x: 900 }}
        />
      )}
    </Card>
  );
};

export default FlatWiseMembers;
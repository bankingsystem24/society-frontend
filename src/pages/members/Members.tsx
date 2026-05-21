import React, { useEffect, useState } from "react";
import { Table, Card, Typography } from "antd";
import { apiGet } from "../../api/axios";

const { Title } = Typography;

const Members: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);

      const societyId = sessionStorage.getItem("societyId");

      const res = await apiGet(
        `/members?societyId=${societyId}`
      );

      console.log("Members data:", res);

      setData(res || []);

    } catch (error) {
      console.error("Error loading members", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      hidden: true,
    },
    {
      title: "Member Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Flat",
      dataIndex: "flatNo",
      key: "flatNo",
    },
  ];

  return (
    <Card>
      <Title level={3}>Members List</Title>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />
    </Card>
  );
};

export default Members;
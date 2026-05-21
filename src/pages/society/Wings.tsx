import React, { useEffect, useState } from "react";
import { Table, Card, Typography } from "antd";
import { apiGet } from "../../api/axios";

const { Title } = Typography;

const Wings: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWings();
  }, []);

  const loadWings = async () => {
    try {
      setLoading(true);

      const societyId = sessionStorage.getItem("societyId");

      const res = await apiGet(
        `/wings?societyId=${societyId}`
      );

      setData(res || []);

    } catch (error) {
      console.error("Error loading wings", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Wing Name",
      dataIndex: "wingName",
      key: "wingName",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
  ];

  return (
    <Card>
      <Title level={3}>Wing List</Title>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />
    </Card>
  );
};

export default Wings;
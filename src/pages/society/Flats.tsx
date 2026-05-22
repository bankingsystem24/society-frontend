import React, { useEffect, useState } from "react";
import { Table, Card, Typography } from "antd";
import { apiGet } from "../../api/axios";

const { Title } = Typography;

const Flats: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFlats();
  }, []);

  const loadFlats = async () => {
    try {
      setLoading(true);

      const societyId = sessionStorage.getItem("societyId");

      const res = await apiGet(`/flats?societyId=${societyId}`
      );
      setData(res || []);
    } catch (error) {
      console.error("Error loading flats", error);
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
      title: "Flat Number",
      dataIndex: "flatNo",
      key: "flatNo",
    },
    {
      title: "Wing",
      dataIndex: "wingName",
      key: "wingName",
      render : (_: any , record : any ) => record?.wing?.wingName || "-"
    },
    {
      title: "Owner",
      dataIndex: "ownerName",
      key: "ownerName",
      render :(_: any, record : any ) => record?.owner?.name || "-"
    },
  ];

  return (
    <Card>
      <Title level={3}>Flat List</Title>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />
    </Card>
  );
};

export default Flats;
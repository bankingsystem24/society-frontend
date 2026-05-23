import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Popconfirm,
  Button,
  Space,
  message,
} from "antd";

import { apiDelete, apiGet } from "../../api/axios";
import { DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const Wings: React.FC = () => {

  const navigate = useNavigate();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWings();
  }, []);

  const loadWings = async () => {
    try {
      setLoading(true);

      const societyId = sessionStorage.getItem("societyId");

      const res = await apiGet(`/wings?societyId=${societyId}`);

      setData(res || []);

    } catch (error) {
      console.error("Error loading wings", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteWing = async (id: number) => {
    try {

      await apiDelete(`/wings/${id}`);

      message.success("Wing deleted successfully");

      setData((prev) =>
        prev.filter((item) => item.id !== id)
      );

    } catch (error) {
      console.error(error);
      message.error("Failed to delete wing");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      hidden : true,
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
    {
      title: "Total Floors",
      dataIndex: "total_floors",
      key: "total_floors",
    },
        {
      title: "Total Flats",
      dataIndex: "total_flats",
      key: "total_flats",
    },

    {
      title: "Action",
      key: "action",
      width: 140,

      render: (_: any, record: any) => (
        <Space>

          <Popconfirm
            title="Delete Wing"
            description="Are you sure to delete this Wing?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteWing(record.id)}
          >

            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            >
              Delete
            </Button>

          </Popconfirm>

        </Space>
      ),
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

        onRow={(record) => ({
          onClick: () => navigate(`/edit-wing/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />

    </Card>
  );
};

export default Wings;
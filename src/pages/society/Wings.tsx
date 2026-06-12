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
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

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
      align: "center" as const,
    },
    {
      title: "Total Flats",
      dataIndex: "total_flats",
      key: "total_flats",
      align: "center" as const,
    },
{
  title: "Action",
  key: "action",
  width: 180,

  render: (_: any, record: any) => (
    <Space wrap>
      <Button
        type="primary"
        size="small"
        icon={<EditOutlined />}
        onClick={() => navigate(`/edit-wing/${record.id}`)}
      >
        Edit
      </Button>

      <Popconfirm
        title="Delete Wing"
        description="Are you sure you want to delete this wing?"
        okText="Yes"
        cancelText="No"
        onConfirm={() => deleteWing(record.id)}
      >
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
        >
          Delete
        </Button>
      </Popconfirm>
    </Space>
  ),
},
  ];

return (
  <Card
    bordered={false}
    style={{
      borderRadius: 12,
      width: "100%",
      minHeight: "calc(100vh - 140px)",
    }}
    bodyStyle={{
      padding: window.innerWidth < 768 ? 12 : 24,
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div>
        <Title level={4} style={{ margin: 0 }}>
          Wings Management
        </Title>

        <Text type="secondary">
          Manage society wings, floors and flats
        </Text>
      </div>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => navigate("/create-wing")}
      >
        Create Wing
      </Button>
    </div>

    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      bordered
      size="small"
      scroll={{ x: 900 }}
      pagination={{
        pageSize: 8,
        showSizeChanger: true,
        responsive: true,
      }}
    />
  </Card>
);
};

export default Wings;
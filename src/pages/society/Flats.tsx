import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Button,
  Popconfirm,
  Space,
  message,
  
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { apiDelete, apiGet } from "../../api/axios";
import { DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const Flats: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFlats();
  }, []);

  const loadFlats = async () => {
    try {
      setLoading(true);

      const societyId = sessionStorage.getItem("societyId");

      const res = await apiGet(
        `/flats?societyId=${societyId}`
      );

      setData(res || []);
    } catch (error) {
      console.error("Error loading flats", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFlat = async (id: number) => {
    try {
      // FIXED API
      await apiDelete(`/flats/${id}`);

      message.success("Flat deleted successfully");

      setData((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error(error);
      message.error("Failed to delete flat");
    }
  };

const columns: ColumnsType<any> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      responsive: ["md"],
      hidden : true
    },
    {
      title: "Flat Number",
      dataIndex: "flatNo",
      key: "flatNo",
      width: 120,
    },
    {
      title: "Wing",
      dataIndex: "wingName",
      key: "wingName",
      width: 120,
      responsive: ["sm"],
    },
    {
      title: "Owner",
      dataIndex: "ownerName",
      key: "ownerName",
      width: 180,
      responsive: ["lg"],
    },
    {
      title: "Area",
      dataIndex: "areaSqFt",
      key: "areaSqFt",
      width: 120,
      responsive: ["md"],
    },
    {
      title: "Floor",
      dataIndex: "floorNo",
      key: "floorNo",
      width: 100,
      responsive: ["sm"],
    },
    {
      title: "Maintenance",
      dataIndex: "maintenanceAmount",
      key: "maintenanceAmount",
      width: 150,
      responsive: ["lg"],
      render: (value: any) => `₹ ${value}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
    },
    {
      title: "Action",
      key: "action",
      width: 140,
      fixed: "right",

      render: (_: any, record: any) => (
        <Space>
          <Popconfirm
            title="Delete Flat"
            description="Are you sure to delete this flat?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteFlat(record.id)}
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
    <Card
      styles={{
        body: {
          padding: 12,
        },
      }}
    >
      <Title level={3}>Flat List</Title>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
        onRow={(record) => ({
          onClick: () =>
            navigate(`/edit-flat/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />
    </Card>
  );
};

export default Flats;
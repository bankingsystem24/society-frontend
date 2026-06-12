import React, { useEffect, useState } from "react";
import { Table, Card, Button, Space, message, Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";
import { apiGet, apiDelete } from "../../api/axios";

const Societies: React.FC = () => {
  const [societies, setSocieties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // LOAD DATA
  const fetchSocieties = async () => {
    try {
      setLoading(true);

      const res = await apiGet("/societies");
      setSocieties(res || []);

    } catch (error) {
      console.error("Error loading societies:", error);
      message.error("Failed to load societies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocieties();
  }, []);

  // DELETE
  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/societies/${id}`);
      message.success("Society deleted successfully");
      fetchSocieties();
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Failed to delete society");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: "Society Name",
      dataIndex: "societyName",
      key: "societyName",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      hidden:true,
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      hidden:true,
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "EMail",
      dataIndex: "email",
      key: "email",
      hidden:true,
    },
    {
      title: "Auditor",
      key: "auditor",
      render: (_: any, record: any) =>
        record.auditor?.username || "-",
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      render: (active: boolean) =>
        active ? "Active" : "Inactive",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            onClick={() =>
              navigate(`/superadmin-edit-society/${record.id}`)
            }
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete this society?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Societies List"
      extra={
        <Button type="primary" onClick={() => navigate("/superadmin-create-society")}>
          + Add Society
        </Button>
      }
    >
      <Table
        dataSource={societies}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8 }}
        locale={{ emptyText: "No societies found" }}
      />
    </Card>
  );
};

export default Societies;
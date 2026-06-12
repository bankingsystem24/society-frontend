import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Select,
  Switch,
  message,
  Button,
  Popconfirm,
  Space,
} from "antd";
import { apiDelete, apiGet, apiPut } from "../../api/axios";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

const Users: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("active");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilter(statusFilter);
  }, [data, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const societyId = sessionStorage.getItem("societyId");

      if (!societyId) {
        const res = await apiGet("/users");
        const filtered = (res || [])
          .filter((user: any) => user.role !== "SUPER_ADMIN")
          .sort((a: any, b: any) => {
            const societyCompare = (a.societyName || "").localeCompare(
              b.societyName || "",
            );

            if (societyCompare !== 0) {
              return societyCompare;
            }

            return (a.role || "").localeCompare(b.role || "");
          });

        setData(filtered || []);

        return;
      } else {
        const res = await apiGet(`/users?societyId=${societyId}`);
        setData(res || []);

      }
    } catch (error) {
      console.error("Error loading users", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (filter: string) => {
    if (filter === "all") {
      setFilteredData(data);
    } else if (filter === "active") {
      setFilteredData(data.filter((item) => item.active));
    } else {
      setFilteredData(data.filter((item) => !item.active));
    }
  };

  const updateStatus = async (id: number, checked: boolean) => {
    try {
      await apiPut(`/users/update-status?id=${id}&active=${checked}`, {});

      message.success(checked ? "User Activated" : "User Deactivated");

      // update only clicked row
      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, active: checked } : item,
        ),
      );
    } catch (error) {
      console.error(error);

      message.error("Failed to update status");
    }
    navigate(`/users`);
  };

  const deleteUser = async (id: number) => {
    try {
      await apiDelete(`/users/${id}`);

      message.success("User deleted successfully");

      // remove deleted row instantly
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);

      message.error("Failed to delete user");
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "Society",
      dataIndex: "societyName",
      key: "societyName",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      responsive: ["md"],
      hidden: true,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Member Name",
      dataIndex: "memberName",
      key: "memberName",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      width: 80,
      render: (_: any, record: any) => (
        <Switch
          checked={record.active}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          onChange={(checked) => updateStatus(record.id, checked)}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/edit-user/${record.id}`);
            }}
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete User"
            description="Are you sure to delete this user?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteUser(record.id)}
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
      bordered={false}
      style={{
        width: "100%",
        borderRadius: 12,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 20,
          marginTop: -10,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Users Management
          </Title>

          <Typography.Text type="secondary">
            Manage users, roles and access permissions
          </Typography.Text>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            style={{ width: 160 }}
            size="small"
          >
            <Option value="active">Active Users</Option>
            <Option value="inactive">Inactive Users</Option>
            <Option value="all">All Users</Option>
          </Select>

          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => navigate("/create-user")}
          >
            Create User
          </Button>
        </div>
      </div>
      {/* Table */}
      <div
        style={{
          overflowX: "auto",
        }}
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
          }}
          scroll={{ x: "max-content" }}
        />
      </div>
    </Card>
  );
};

export default Users;

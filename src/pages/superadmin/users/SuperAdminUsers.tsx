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
} from "antd";
import { apiDelete, apiGet, apiPut } from "../../../api/axios";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

const SuperAdminUsers: React.FC = () => {
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
          // .filter((user: any) => user.role == "SUPER_ADMIN")
          .sort((a: any, b: any) => {
            const societyCompare = (a.societyName || "").localeCompare(
              b.societyName || "",
            );
            if (societyCompare !== 0) {
              return societyCompare;
            }
            const roleCompare = (a.role || "").localeCompare(b.role || "");
            if (roleCompare !== 0) {
              return roleCompare;
            }
            return (a.username || "").localeCompare(b.username || "");
          });
        setData(filtered);
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

      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, active: checked } : item,
        ),
      );
    } catch (error) {
      console.error(error);
      message.error("Failed to update status");
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await apiDelete(`/users/${id}`);

      message.success("User deleted successfully");

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
      width: 180,
      render: (_: any, record: any) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Switch
            checked={record.active}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            onChange={(checked) => updateStatus(record.id, checked)}
          />
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 220,
      render: (_: any, record: any) => (
        <div
          style={{
            display: "flex",
            gap: 8,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/superadmin-edit-user/${record.id}`)}
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
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Card
      style={{
        width: "100%",
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Users Management
          </Title>

          <Typography.Text type="secondary">
            Manage system users, roles and access permissions
          </Typography.Text>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            style={{ width: 160 }}
            size="medium"
          >
            <Option value="active">Active Users</Option>
            <Option value="inactive">Inactive Users</Option>
            <Option value="all">All Users</Option>
          </Select>

          <Button
            type="primary"
            size="medium"
            icon={<PlusOutlined />}
            onClick={() => navigate("/superadmin-create-user")}
          >
            Create User
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{
          pageSize: 8,
        }}
        scroll={{ x: 700 }}
      />
    </Card>
  );
};

export default SuperAdminUsers;

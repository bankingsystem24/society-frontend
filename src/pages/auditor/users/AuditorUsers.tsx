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
import { DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

const AuditorUsers: React.FC = () => {
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
      const auditorId = Number(sessionStorage.getItem("auditorId"));

      // Get all societies
      const societies = await apiGet("/societies");

      // Get society IDs assigned to this auditor
      const auditorSocietyIds = (societies || [])
        .filter((s: any) => Number(s.auditor?.id) === Number(auditorId))
        .map((s: any) => Number(s.id));

      // Get users
      let users = [];

      if (societyId) {
        users = await apiGet(`/users?societyId=${societyId}`);
      } else {
        users = await apiGet("/users");
      }

      // Keep only users belonging to auditor's societies
      const filtered = (users || [])
        .filter(
          (user: any) =>
            (user.role !== "SUPER_ADMIN" &&
            auditorSocietyIds.includes(Number(user.societyId)) || user.id === auditorId))
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
      title: "MemberName",
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
      width: 140,
      render: (_: any, record: any) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
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
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
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
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Users List
        </Title>

        <Select
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          style={{
            minWidth: 140,
            width: "100%",
            maxWidth: 180,
          }}
        >
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
          <Option value="all">All</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
        }}
        onRow={(record) => ({
          onClick: () => navigate(`/auditor-edit-user/${record.id}`),
          style: {
            cursor: "pointer",
          },
        })}
        scroll={{ x: 700 }}
      />
    </Card>
  );
};

export default AuditorUsers;

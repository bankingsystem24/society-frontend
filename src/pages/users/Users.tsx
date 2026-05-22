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
import { DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const Users: React.FC = () => {
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

      const res = await apiGet(
        `/users?societyId=${societyId}`
      );

      setData(res || []);
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
      setFilteredData(
        data.filter((item) => item.active)
      );
    } else {
      setFilteredData(
        data.filter((item) => !item.active)
      );
    }
  };

    const updateStatus = async (id: number, checked: boolean) => {
    try {
    await apiPut(
      `/users/update-status?id=${id}&active=${checked}`,
      {}
    );

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
  };
  
  const deleteUser = async (id: number) => {
    try {

      await apiDelete(`/users/${id}`);

      message.success("User deleted successfully");

      // remove deleted row instantly
      setData((prev) =>
        prev.filter((item) => item.id !== id)
      );

    } catch (error) {

      console.error(error);

      message.error("Failed to delete user");
    }
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Name",
      dataIndex: "memberName",
      key: "memberName",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
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
      <Switch
        checked={record.active}
        checkedChildren="Active"
        unCheckedChildren="Inactive"
        onChange={(checked) =>
          updateStatus(record.id, checked)
        }
      />
    ),
  },
  {
  title: "Action",
  key: "action",
  width: 120,
  render: (_: any, record: any) => (
    <Space>
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
      style={{
        width: "100%",
      }}
      bodyStyle={{
        padding: 16,
      }}
    >
      {/* Header */}
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
        <Title
          level={4}
          style={{
            margin: 0,
          }}
        >
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
          pagination={{
            pageSize: 10,
          }}
          scroll={{ x: 700 }}
        />
      </div>
    </Card>
  );
};

export default Users;
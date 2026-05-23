import React, { useEffect, useState } from "react";
import { Table, Card, Typography, Select, Switch, message, Button, Popconfirm, Space } from "antd";
import { apiDelete, apiGet, apiPut } from "../../api/axios";
import { DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const Members: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // default filter = active
  const [statusFilter, setStatusFilter] = useState("active");

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    applyFilter(statusFilter);
  }, [data, statusFilter]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const societyId = sessionStorage.getItem("societyId");
      const res = await apiGet(`/members?societyId=${societyId}`);
      setData(res || []);
    } catch (error) {
      console.error("Error loading members", error);
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
    await apiPut(
      `/members/update-status?id=${id}&active=${checked}`,
      {}
    );

      message.success(checked ? "Member Activated" : "Member Deactivated");

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

  const deleteMember = async (id: number) => {
    try {

      await apiDelete(`/members/${id}`);

      message.success("Member deleted successfully");

      // remove deleted row instantly
      setData((prev) =>
        prev.filter((item) => item.id !== id)
      );

    } catch (error) {

      console.error(error);

      message.error("Failed to delete member");
    }
  };


  const columns = [
    {
      title: "Member Name",
      dataIndex: "name",
      key: "name",
      width: 180,
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
      width: 140,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
    },
    {
      title: "Flat",
      dataIndex: "flatNo",
      key: "flatNo",
      width: 100,
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
          onChange={(checked) => updateStatus(record.id, checked)}
        />
      ),
    },
    {
  title: "Action",
  key: "action",
  width: 140,
  render: (_: any, record: any) => (
    <Space>
      <Popconfirm
        title="Delete Member"
        description="Are you sure to delete this member?"
        okText="Yes"
        cancelText="No"
        onConfirm={() => deleteMember(record.id)}
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
    <Card style={{ width: "100%", padding:16 }} >
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
          Members List
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

      {/* Responsive Table */}
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
            responsive: true,
          }}
          scroll={{ x: 850 }}
        />
      </div>
    </Card>
  );
};

export default Members;

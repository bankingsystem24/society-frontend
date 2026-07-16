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
  Layout
} from "antd";
import { apiDelete, apiGet, apiPut } from "../../api/axios";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";

const { Title } = Typography;
const { Option } = Select;
const { Content } = Layout;
const role = sessionStorage.getItem("role");

const Members: React.FC = () => {
  const navigate = useNavigate();

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
      await apiPut(`/members/update-status?id=${id}&active=${checked}`, {});

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
      setData((prev) => prev.filter((item) => item.id !== id));
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
      width: 250,
     render: (text: string) => (
      <Typography.Text
        ellipsis={{ tooltip: text }}
        style={{ width:250, display: "inline-block" }}
      >
        {text}
      </Typography.Text>
    ),
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
      width: 100,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: 250,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      width: 110,
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
      width: 110,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/edit-member/${record.id}`)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete Member"
            description="Are you sure to delete this member?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteMember(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
      <Layout style={{ minHeight: "100vh" }}>
        <Layout.Sider
      width={role === "MEMBER" ? 200 : 250}
      breakpoint="lg"
      collapsedWidth="0"
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
      }}
    >
      {role === "ADMIN" ? <Sidebar /> : role === "MEMBER" ? <MemberSidebar /> : role=== "SUPER_ADMIN" ? <SuperAdminSidebar/> : <AuditorSidebar />}
    </Layout.Sider>

    {/* MAIN AREA */}
    <Layout style={{ minWidth: 0 }}>

      {/* HEADER (NO EXTRA DIV) */}
      {role === "ADMIN" ? <Header /> : role === "MEMBER" ? <MemberHeader /> : role=== "SUPER_ADMIN" ? <SuperAdminHeader/> : <AuditorHeader />}
      <Content >
    <Card style={{ width: "100%", padding: 16 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Members Management
          </Title>

          <Typography.Text type="secondary">
            Manage society members and ownership details
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
            <Option value="active">Active Members</Option>
            <Option value="inactive">Inactive Members</Option>
            <Option value="all">All Members</Option>
          </Select>

          <Button
            type="primary"
            size="medium"
            icon={<PlusOutlined />}
            onClick={() => navigate("/create-member")}
          >
            Create Member
          </Button>
        </div>
        <div
          style={{
            width: "100%",
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
              pageSize: 12,
              showSizeChanger: true,
              responsive: true,
            }}
            scroll={{ x: "max-content" }}
          />
        </div>
      </div>
    </Card>
    </Content>
    </Layout>
    </Layout>
  );
};

export default Members;

import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Button,
  Popconfirm,
  Space,
  message,
  Layout
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { apiDelete, apiGet } from "../../api/axios";
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
const { Content } = Layout;

const role = sessionStorage.getItem("role");

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

      const res = await apiGet(`/flats?societyId=${societyId}`);

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

      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      message.error("Failed to delete flat");
    }
  };

  const columns: ColumnsType<any> = [
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
    },
    {
      title: "Area (Sq Ft)",
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
      responsive: ["md"],
    },
    {
      title: "Maintenance",
      dataIndex: "maintenanceAmount",
      key: "maintenanceAmount",
      width: 150,
      responsive: ["lg"],
      render: (value) => `₹ ${value}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      responsive: ["sm"],
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_: any, record: any) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/edit-flat/${record.id}`)}>Edit </Button>
          

          <Popconfirm
            title="Delete Flat"
            description="Are you sure?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteFlat(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} size="small">Delete</Button>
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
      <Content>

    <Card
      variant="borderless"
      style={{
        borderRadius: 12,
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
          <Title
            level={4}
            style={{
              margin: 0,
            }}
          >
            Flats Management
          </Title>

          <Typography.Text type="secondary">
            Manage society flats and owner details
          </Typography.Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/create-flat")}
        >
          Create Flat
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        bordered
        size="small"
        scroll={{ x: "max-content" }}
        pagination={{
          pageSize: 8,
          showSizeChanger: true,
          responsive: true,
        }}
      />
    </Card>
    </Content>
    </Layout>
    </Layout>
  );
};

export default Flats;

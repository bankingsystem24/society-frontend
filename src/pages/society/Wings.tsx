import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Popconfirm,
  Button,
  Space,
  message,
  Layout,
} from "antd";

import { apiDelete, apiGet } from "../../api/axios";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";

const { Content } = Layout;
const role = sessionStorage.getItem("role");

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
      width: "100%",
      minHeight: "calc(100vh - 140px)",
    }}
    styles={{ body : {
      padding: window.innerWidth < 768 ? 12 : 24,},
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
  </Content>
  </Layout>
  </Layout>
);
};

export default Wings;
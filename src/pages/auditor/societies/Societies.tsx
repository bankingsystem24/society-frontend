import React, { useEffect, useState } from "react";
import { Table, Card, Button, Space, message, Popconfirm, Layout } from "antd";
import { useNavigate } from "react-router-dom";
import { apiGet, apiDelete } from "../../../api/axios";
import Header from "../../../components/layout/Header";
import AuditorHeader from "../../../components/layout/AuditorHeader";
import AuditorSidebar from "../../../components/layout/AuditorSidebar";
import MemberHeader from "../../../components/layout/MemberHeader";
import MemberSidebar from "../../../components/layout/MemberSidebar";
import Sidebar from "../../../components/layout/Sidebar";
import SuperAdminHeader from "../../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../../components/layout/SuperAdminSidebar";

const Societies: React.FC = () => {
  const [societies, setSocieties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const role = sessionStorage.getItem("role");
  const { Content } = Layout;
  const navigate = useNavigate();

  // LOAD DATA
  const fetchSocieties = async () => {
    try {
      setLoading(true);

      const res = await apiGet("/societies");
      if (!Array.isArray(res)) {
        console.error("Unexpected response:", res);
        return;
      }

      const auditorId = Number(sessionStorage.getItem("auditorId"));

      const filtered = res.filter(
        (society: any) => society?.auditor?.id === auditorId,
      );

      setSocieties(filtered);
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
      hidden: true,
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
      hidden: true,
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "UPI",
      dataIndex: "upi1",
      key: "upi1",
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
      hidden: true,
    },
    {
      title: "Auditor",
      key: "auditor",
      render: (_: any, record: any) => record.auditor?.username || "-",
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      render: (active: boolean) => (active ? "Active" : "Inactive"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            onClick={() => navigate(`/edit-society/${record.id}`)}
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
        {role === "ADMIN" ? (
          <Sidebar />
        ) : role === "MEMBER" ? (
          <MemberSidebar />
        ) : role === "SUPER_ADMIN" ? (
          <SuperAdminSidebar />
        ) : (
          <AuditorSidebar />
        )}
      </Layout.Sider>

      {/* MAIN AREA */}
      <Layout style={{ minWidth: 0 }}>
        {/* HEADER (NO EXTRA DIV) */}
        {role === "ADMIN" ? (
          <Header />
        ) : role === "MEMBER" ? (
          <MemberHeader />
        ) : role === "SUPER_ADMIN" ? (
          <SuperAdminHeader />
        ) : (
          <AuditorHeader />
        )}
        <Content>
          <Card
            title="Societies List"
            extra={
              role === "SUPER_ADMIN" ? (
                <Button
                  type="primary"
                  onClick={() => navigate("/superadmin-create-society")}
                >
                  + Add Society
                </Button>
              ) : null
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default Societies;

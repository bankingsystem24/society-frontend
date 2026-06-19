import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Tag,
  Space,
  Typography,
  Layout,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import AuditorHeader from "../../../../components/layout/AuditorHeader";
import AuditorSidebar from "../../../../components/layout/AuditorSidebar";
import MemberHeader from "../../../../components/layout/MemberHeader";
import MemberSidebar from "../../../../components/layout/MemberSidebar";
import Sidebar from "../../../../components/layout/Sidebar";
import SuperAdminHeader from "../../../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../../../components/layout/SuperAdminSidebar";
import Header from "../../../../components/layout/Header";

const { Content } = Layout;
const { Title } = Typography;
const BASE_URL = import.meta.env.VITE_API_URL;

interface FinancialYear {
  id: number;
  fyCode: string;
  startDate: string;
  endDate: string;
  active: boolean;
  societyId: number;
}

const FinancialYear: React.FC = () => {
  const [data, setData] = useState<FinancialYear[]>([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const societyId = sessionStorage.getItem("societyId");
  const role = sessionStorage.getItem("role");
  const userId = Number(sessionStorage.getItem("userId"));

  useEffect(() => {
    fetchYears();
  }, []);

  // ================= FETCH =================
  const fetchYears = async () => {
    try {
      setLoading(true);
      let res: any;

      if (role === "ADMIN") {
        res = await axios.get(`${BASE_URL}/accounting-year/${societyId}`);
        setData(res.data);
      } else if (role === "AUDITOR") {
        const auditorRes = await axios.get(`${BASE_URL}/accounting-year`);
        const societiesRes = await axios.get(`${BASE_URL}/societies`);
        const societyIds = societiesRes.data
          .filter((society: any) => society.auditor?.id === userId)
          .map((society: any) => society.id);
          res = auditorRes.data
            .filter((year: any) =>
              societyIds.includes(Number(year.society?.id))
            )
            .sort(
              (a: any, b: any) =>
                Number(a.society?.id) - Number(b.society?.id)
            );
        setData(res);
      }
    } catch (err) {
      message.error("Failed to load financial years");
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE =================
  const handleCreate = async (values: any) => {
    const startDate = values.dates[0].format("YYYY-MM-DD");
    const endDate = values.dates[1].format("YYYY-MM-DD");
    const fyCode = values.fyCode;
    const username = "Admin";

    try {
      await axios.post(`${BASE_URL}/accounting-year/create`, {
        societyId: Number(societyId),
        fyCode,
        startDate,
        endDate,
        username,
      });

      message.success("Financial Year created");
      setOpen(false);
      form.resetFields();
      fetchYears();
    } catch (err) {
      message.error("Error creating financial year");
    }
  };

  // ================= ACTIVATE =================
  const handleActivate = async (yearId: number) => {
    try {

      await axios.put(`${BASE_URL}/accounting-year/activate`, {
        societyId,
        yearId,
      });

      message.success("Active financial year updated");
      fetchYears();

      const token = sessionStorage.getItem("token");
      const fyRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/accounting-year/${societyId}/active`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      sessionStorage.setItem("financialYear", fyRes.data.fyCode);
      sessionStorage.setItem("financialYearId", fyRes.data.id);
      window.dispatchEvent(new Event("financialYearChanged"));
    } catch (err) {
      message.error("Failed to activate year");
    }
  };

  // ================= COLUMNS =================
  const columns = [
    {
      title: "FY Code",
      dataIndex: "fyCode",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      render: (d: string) => dayjs(d).format("DD-MMM-YYYY"),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      render: (d: string) => dayjs(d).format("DD-MMM-YYYY"),
    },
    {
      title: "Status",
      dataIndex: "active",
      render: (active: boolean) =>
        active ? <Tag color="green">ACTIVE</Tag> : <Tag>INACTIVE</Tag>,
    },
    {
      title: "Action",
      render: (_: any, record: FinancialYear) => (
        <Space>
          {!record.active && (
            <Button type="primary" onClick={() => handleActivate(record.id)}>
              Set Active
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const auditorColumns = [
    {
      title: "Society",
      render: (_: any, record: any) => record.society?.societyName || "-",
    },
    {
      title: "FY Code",
      dataIndex: "fyCode",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      render: (d: string) => dayjs(d).format("DD-MMM-YYYY"),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      render: (d: string) => dayjs(d).format("DD-MMM-YYYY"),
    },
    {
      title: "Status",
      dataIndex: "active",
      render: (active: boolean) =>
        active ? <Tag color="green">ACTIVE</Tag> : <Tag>INACTIVE</Tag>,
    },
  ];

  const tableColumns = role === "AUDITOR" ? auditorColumns : columns;

  // ================= UI =================
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider
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

      <Layout style={{ minWidth: 0 }}>
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
            style={{
              margin: 10,
              width: "100%",
            }}
            styles={{
              body: {
                padding: window.innerWidth < 768 ? 12 : 24,
              },
            }}
          >
            <Title level={3}>
              {role === "AUDITOR"
                ? "Financial Year Details"
                : "Financial Year Management"}
            </Title>

            {role === "ADMIN" && (
              <Button
                type="primary"
                onClick={() => setOpen(true)}
                style={{ marginBottom: 16 }}
              >
                + Create Financial Year
              </Button>
            )}

            <Table
              rowKey="id"
              loading={loading}
              columns={tableColumns}
              dataSource={data}
              size="small"
              pagination={{
                pageSize: 8,
                showSizeChanger: false,
              }}
              scroll={{ x: 800 }}
            />

            {role === "ADMIN" && (
              <Modal
                title="Create Financial Year"
                open={open}
                onCancel={() => setOpen(false)}
                onOk={() => form.submit()}
                width={window.innerWidth < 768 ? "95%" : 600}
                centered
                destroyOnHidden
              >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                  <Form.Item
                    label="FY Code (e.g. 2025-26)"
                    name="fyCode"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="Date Range"
                    name="dates"
                    rules={[{ required: true }]}
                  >
                    <DatePicker.RangePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Form>
              </Modal>
            )}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default FinancialYear;

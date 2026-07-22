import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Button,
  Row,
  Col,
  Input,
  message,
  Layout,
  Table,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
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
const financialYearId = Number(sessionStorage.getItem("financialYearId"));
const BASE_URL = import.meta.env.VITE_API_URL;


interface Flat {
  id: number;
  flatNo: string;
  ownerName: string;
}

interface FinancialYear {
  id: number;
  fyCode: string;
}

interface Arrears {
  id: number;
  flatNo: string;
  ownerName: string;
  maintenanceAmount: number;
  dueDate: string;
  status: string;
}


const ArrearsEntry: React.FC = () => {
  const [form] = Form.useForm();

  const [flats, setFlats] = useState<Flat[]>([]);
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);

  const societyId = sessionStorage.getItem("societyId");
  const userId = sessionStorage.getItem("userId");
  const [arrears, setArrears] = useState<Arrears[]>([]);
    const [glReceivable, setGlReceivable] = useState<number>(0);
    const [glCreditAccount, setGlCreditAccount] = useState<number>(0);
  const [maintenanceMappingExists, setMaintenanceMappingExists] = useState(false);

  useEffect(() => {
    loadFlats();
    loadArrears();
    loadGlMapping();
  }, []);

  const loadGlMapping = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/gl/master/mapping?societyId=${societyId}`,
      );

      const mapping = res.data.find(
        (item: any) =>
          item.description?.trim().toLowerCase() === "monthly maintenance",
      );

      if (!mapping) {
        setMaintenanceMappingExists(false);

        message.error("Monthly Maintenance GL Mapping not configured");
        return;
      }

      setMaintenanceMappingExists(true);

      setGlReceivable(mapping.gl_receivable);
      setGlCreditAccount(mapping.gl_credit_account);
    } catch (err) {
      console.error(err);

      setMaintenanceMappingExists(false);

      message.error("Unable to load GL Mapping");
    }
  };

  const loadFlats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/flats?societyId=${societyId}`);
      setFlats(res.data);
    } catch {
      message.error("Unable to load flats");
    }
  };

  const loadArrears = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/billing/arrears?societyId=${societyId}&financialYearId=${financialYearId}`,
      );
      setArrears(res.data);
      console.log("Response:",res.data);
    } catch {
      message.error("Unable to load arrears");
    }
  };

  const onFinish = async (values: any) => {
    if (!financialYearId) {
      message.error("Please set Financial Year before saving.");
      return;
    }
    try {
      const payload = {
        societyId: Number(societyId),
        flatId: values.flatId,
        financialYearId: financialYearId,
        amount: values.amount,
        interestAmount: 0,
        penaltyAmount: 0,
        discountAmount: 0,
        dueDate: values.dueDate.format("YYYY-MM-DD"),
        billType: "ARREARS",
        month: "OPENING",
        year: dayjs(values.dueDate).year(),
        createdBy: Number(userId),
        glReceivable,
        glCreditAccount,
      };
      await axios.post(`${BASE_URL}/billing/arrears`, payload);
      message.success("Opening arrears created successfully");
      loadArrears();
      form.resetFields();
    } catch (err) {
      message.error("Failed to save arrears");
    }
  };

  const columns = [
    {
      title: "Flat",
      dataIndex: ["flatNo"],
    },
    {
      title: "Owner",
      dataIndex: ["ownerName"],
    },
    {
      title: "Amount",
      dataIndex: "maintenanceAmount",
      align: "right" as const,
      render: (value: number | null) => `₹ ${(value ?? 0).toFixed(2)}`
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
    },
    {
      title: "Status",
      dataIndex: "status",
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
          <Card title="Opening Arrears Entry">
            <Form layout="vertical" form={form} onFinish={onFinish}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label="Flat"
                    name="flatId"
                    rules={[{ required: true }]}
                  >
                    <Select
                      showSearch
                      optionFilterProp="children"
                      placeholder="Select Flat"
                    >
                      {flats.map((f) => (
                        <Select.Option key={f.id} value={f.id}>
                          {f.flatNo} - {f.ownerName}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item
                    label="Opening Arrears Amount"
                    name="amount"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      precision={2}
                    />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item
                    label="Due Date"
                    name="dueDate"
                    rules={[{ required: true }]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>


                <Col span={6} style={{ alignContent:"center"}}>
                  <Button type="primary" htmlType="submit">
                    Save Opening Arrears
                  </Button>
                </Col>
              </Row>
            </Form>
            <Table
              style={{ marginTop: 20 }}
              rowKey="id"
              columns={columns}
              dataSource={arrears}
              bordered
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ArrearsEntry;

import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Form,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Select,
  message,
  Row,
  Col,
  Layout,
  Popconfirm,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
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

const BASE_URL = import.meta.env.VITE_API_URL;
const { Content } = Layout;

const role = sessionStorage.getItem("role");
const cashInHand = sessionStorage.getItem("cashInHand");
const bankAccount = sessionStorage.getItem("bankAccount");

interface Income {
  id: number;
  voucherDate: string;
  incomeGlCode: number;
  receivedFrom: string;
  amount: number;
  paymentMode: string;
  narration: string;
}

const Income: React.FC = () => {
  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Income[]>([]);
  const [glList, setGlList] = useState<any[]>([]);

  useEffect(() => {
    fetchIncome();
    fetchGlMaster();
  }, []);

  const fetchGlMaster = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/gl/master?societyId=${societyId}`
      );

      setGlList((res.data || []).filter((gl: any) =>
           (gl.groupName === "INCOME" ||
            gl.groupName === "OTHER INCOME") && gl.parentGlCode !=null
        )
      );
    } catch {
      message.error("Failed to load Income Accounts");
    }
  };

  const fetchIncome = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/income/${societyId}/${financialYearId}`
      );

      setData(res.data);
    } catch {
      message.error("Failed to load income vouchers");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    const GlCashInHand=Number(sessionStorage.getItem("GlCashInHand"));
    const GlBankAccount=Number(sessionStorage.getItem("GlBankAccount"));


    try {
      const payload = {
        societyId,
        financialYearId,
        voucherDate: values.voucherDate.format("YYYY-MM-DD"),
        incomeGlCode: values.incomeGlCode,
        receivedFrom: values.receivedFrom,
        amount: values.amount,
        paymentMode: values.paymentMode,
        narration: values.narration,
        glCashInHand : GlCashInHand,
        glBankAccount : GlBankAccount
      };

      console.log("Payload:",payload);

      await axios.post(`${BASE_URL}/income`, payload);

      message.success("Income saved successfully");

      form.resetFields();

      fetchIncome();
    } catch {
      message.error("Failed to save income");
    }
  };

  const deleteIncome = async (id: number) => {
    try {
      await axios.delete(`${BASE_URL}/income/${id}`);

      message.success("Income deleted successfully");

      fetchIncome();
    } catch {
      message.error("Failed to delete income");
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "voucherDate",
      render: (d: string) => dayjs(d).format("DD-MMM-YYYY"),
    },
    {
      title: "GL Code",
      dataIndex: "incomeGlCode",
    },
    {
      title: "Income Head",
      render: (_: any, record: Income) => {
        const gl = glList.find(
          (g) => g.glCode === record.incomeGlCode
        );

        return gl?.accountName || "-";
      },
    },
    {
      title: "Received From",
      dataIndex: "receivedFrom",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right" as const,
      render: (v: number) =>
        v.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },
    {
      title: "Mode",
      dataIndex: "paymentMode",
    },
    {
      title: "Narration",
      dataIndex: "narration",
    },
    {
      title: "Action",
      width: 110,
      align: "center" as const,
      render: (_: any, record: Income) => (
        <Popconfirm
          title="Delete Income"
          description="Are you sure?"
          okText="Yes"
          cancelText="No"
          onConfirm={() => deleteIncome(record.id)}
        >
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
          >
            Delete
          </Button>
        </Popconfirm>
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
          <div style={{ padding: 16 }}>
            <Card title="Add Income" style={{ marginBottom: 16 }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
              >
                <Row gutter={16} style={{ marginTop: -10 }}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="voucherDate"
                      label="Date"
                      rules={[
                        {
                          required: true,
                          message: "Please select date",
                        },
                      ]}
                    >
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item
                      name="incomeGlCode"
                      label="Income Account"
                      rules={[
                        {
                          required: true,
                          message: "Please select income account",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder="Select Income Account"
                        optionFilterProp="label"
                      >
                        {glList.map((gl) => (
                          <Select.Option
                            key={gl.glCode}
                            value={gl.glCode}
                            label={`${gl.glCode} - ${gl.accountName}`}
                          >
                            {gl.glCode} - {gl.accountName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item
                      name="receivedFrom"
                      label="Received From"
                      rules={[
                        {
                          required: true,
                          message: "Please enter received from",
                        },
                      ]}
                    >
                      <Input placeholder="Received From" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: -10 }}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="amount"
                      label="Amount"
                      rules={[
                        {
                          required: true,
                          message: "Please enter amount",
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        controls={false}
                        min={0}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item
                      name="paymentMode"
                      label="Payment Mode"
                      rules={[
                        {
                          required: true,
                          message: "Please select payment mode",
                        },
                      ]}
                    >
                      <Select placeholder="Payment Mode">
                        <Select.Option value="CASH">
                          Cash
                        </Select.Option>
                        <Select.Option value="BANK">
                          Bank
                        </Select.Option>
                        <Select.Option value="UPI">
                          UPI
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item
                      name="narration"
                      label="Narration"
                    >
                      <Input placeholder="Narration" />
                    </Form.Item>
                  </Col>
                </Row>

                <Button
                  type="primary"
                  htmlType="submit"
                >
                  Save Income
                </Button>
              </Form>
            </Card>

            <Card title="Income List">
              <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                size="small"
                scroll={{ x: 1000 }}
                pagination={{
                  pageSize: 8,
                }}
              />
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Income;
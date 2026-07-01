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

interface Transfer {
  id: number;
  voucherDate: string;
  fromGlCode: number;
  toGlCode: number;
  amount: number;
  narration: string;
}

const Transfer: React.FC = () => {
  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Transfer[]>([]);
  const [glList, setGlList] = useState<any[]>([]);

  useEffect(() => {
    fetchTransfers();
    fetchGlMaster();
  }, []);

  const fetchGlMaster = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/gl/master?societyId=${societyId}`);
      setGlList(res.data || []);
    } catch {
      message.error("Failed to load GL Accounts");
    }
  };

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/transfer?societyId=${societyId}&financialYearId=${financialYearId}`);
      setData(res.data);

    } catch {
      message.error("Failed to load transfers");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    if (values.fromGlCode === values.toGlCode) {
      message.error("From Account and To Account cannot be same.");
      return;
    }

    try {

      const payload = {
        societyId,
        financialYearId,
        voucherDate: values.voucherDate.format("YYYY-MM-DD"),
        fromGlCode: values.fromGlCode,
        toGlCode: values.toGlCode,
        amount: values.amount,
        narration: values.narration,
      };
      
      await axios.post(`${BASE_URL}/transfer`, payload);
      message.success("Transfer saved successfully");
      form.resetFields();
      fetchTransfers();
    } catch (err) {
      message.error("Failed to save transfer");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${BASE_URL}/transfer/${id}`);
      message.success("Transfer deleted");
      fetchTransfers();
    } catch {
      message.error("Delete failed");
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "voucherDate",
      render: (d: string) => dayjs(d).format("DD-MMM-YYYY"),
    },
    {
      title: "From Account",
      render: (_: any, record: any) => {
        const gl = glList.find(
          (g: any) => g.glCode === record.fromGlCode
        );

        return gl
          ? `${gl.glCode} - ${gl.accountName}`
          : "-";
      },
    },
    {
      title: "To Account",
      render: (_: any, record: any) => {
        const gl = glList.find(
          (g: any) => g.glCode === record.toGlCode
        );

        return gl
          ? `${gl.glCode} - ${gl.accountName}`
          : "-";
      },
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
      title: "Narration",
      dataIndex: "narration",
    },
        {
      title: "Action",
      render: (_: any, record: any) => (
        <Popconfirm
          title="Delete Transfer"
          description="Are you sure you want to delete this transfer?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger size="small">
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
            {/* Entry Form */}
            <Card title="Transfer Entry" style={{ marginBottom: 16 }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
              >
                <Row gutter={16} style={{ marginTop: -10 }}>
                  <Col xs={24} md={6}>
                    <Form.Item
                      name="voucherDate"
                      label="Voucher Date"
                      rules={[
                        {
                          required: true,
                          message: "Select Voucher Date",
                        },
                      ]}
                    >
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={6}>
                    <Form.Item
                      name="fromGlCode"
                      label="From Account (Credit) (जमा)"
                      rules={[
                        {
                          required: true,
                          message: "Select From Account",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        optionFilterProp="label"
                        placeholder="Select From Account"
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

                  <Col xs={24} md={6}>
                    <Form.Item
                      name="toGlCode"
                      label="To Account (Debit) (नावे)"
                      rules={[
                        {
                          required: true,
                          message: "Select To Account",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        optionFilterProp="label"
                        placeholder="Select To Account"
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
                  <Col xs={24} md={6}>
                    <Form.Item
                      name="amount"
                      label="Amount"
                      rules={[
                        {
                          required: true,
                          message: "Enter Amount",
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
                </Row>

                <Row gutter={16} style={{ marginTop: -10 }}>


                  <Col xs={24} md={6}>
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
                  Save Transfer
                </Button>
              </Form>
            </Card>

            {/* Transfer List */}
            <Card title="Transfer List">
              <Table
                dataSource={data}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                }}
                scroll={{ x: 1000 }}
                size="small"
              />
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Transfer;
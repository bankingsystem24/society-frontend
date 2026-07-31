import React, { useEffect, useState } from "react";
import {
  Form,
  InputNumber,
  Button,
  Card,
  Select,
  message,
  Row,
  Col,
  Input,
  Popconfirm,
  Layout,
  Table,
  Space,
} from "antd";

import { apiGet, apiPost, apiDelete } from "../../api/axios";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import MemberSidebar from "../../components/layout/MemberSidebar";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";
import axios from "axios";

const { Content } = Layout;
const { Option } = Select;

const role = sessionStorage.getItem("role");
const BASE_URL = import.meta.env.VITE_API_URL;

const MaintenancePolicy: React.FC = () => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [policyId, setPolicyId] = useState<number | null>(null);
  const [policies, setPolicies] = useState<any[]>([]);

  const societyId = Number(sessionStorage.getItem("societyId"));
  const societyName = sessionStorage.getItem("societyName");
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
const dueDateType = Form.useWatch("dueDateType", form);

  useEffect(() => {
    form.setFieldsValue({
      societyId,
      calculationBasis: "FLAT_AREA",
      rate: 2.25,
      billingFrequency: "QUARTERLY",
      dueDateType: "END_OF_PERIOD"
    });

    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    try {
      const data = await apiGet(
        `/maintenance-policy/society/${societyId}/financial-year/${financialYearId}`
      );

      if (data) {
        setPolicyId(data.id);
        setPolicies([data]);

        form.setFieldsValue({
          societyId: data.society?.id,
          calculationBasis: data.calculationBasis,
          rate: data.rate,
          billingFrequency: data.billingFrequency,
        });
      }
    } catch {
      setPolicyId(null);
      setPolicies([]);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${BASE_URL}/accounting-year/${societyId}/year/${financialYearId}/status`
      );

      const isClosed =
        response.data === "Closed" ||
        response.data?.status === "Closed";

      if (isClosed) {
        message.error(
          "This financial year is closed. You cannot add or edit records."
        );
        return;
      }

      const payload = {
        id: policyId,
        societyId,
        financialYearId,
        calculationBasis: values.calculationBasis,
        rate: values.rate,
        billingFrequency: values.billingFrequency,
        dueDateType: values.dueDateType,
        dueAfterDays: values.dueAfterDays,
        dueDay: values.dueDay,
      };

      await apiPost("/maintenance-policy", payload);

      message.success(
        policyId
          ? "Maintenance policy updated successfully."
          : "Maintenance policy saved successfully."
      );

      loadPolicy();
    } catch (e) {
      console.log(e);
      message.error("Failed to save maintenance policy.");
    } finally {
      setLoading(false);
    }
  };

  const editPolicy = (record: any) => {
    setPolicyId(record.id);

    form.setFieldsValue({
      societyId: record.society.id,
      calculationBasis: record.calculationBasis,
      rate: record.rate,
      billingFrequency: record.billingFrequency,
    });
  };

const deletePolicy = async (id: number) => {
  try {
    await apiDelete(`/maintenance-policy/${id}`);

    message.success("Policy deleted.");

    setPolicyId(null);
    setPolicies([]);

    form.resetFields();

    form.setFieldsValue({
      societyId,
      calculationBasis: "FLAT_AREA",
      rate: 2.25,
      billingFrequency: "QUARTERLY",
    });
  } catch {
    message.error("Delete failed.");
  }
};

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

      <Layout>
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
            title={
              policyId
                ? "Edit Maintenance Policy"
                : "Create Maintenance Policy"
            }
          >
            <Form form={form} layout="horizontal" onFinish={onFinish}>
              <Form.Item name="societyId" hidden>
                <Input />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Society">
                    <Input value={societyName || ""} disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Calculation Basis"
                    name="calculationBasis"
                  >
                    <Select placeholder="Select Calculation Basis">
                    <Option value="FLAT_AREA">FLAT_AREA</Option>
                    <Option value="FLAT_MAINTENANCE">FLAT_MAINTENANCE</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Rate (₹ / Sq.Ft.)"
                    name="rate"
                  >
                    <InputNumber
                      min={0}
                      step={0.01}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                <Form.Item
                    label="Billing Frequency"
                    name="billingFrequency"
                    rules={[
                    {
                        required: true,
                        message: "Please select billing frequency",
                    },
                    ]}
                >
                    <Select placeholder="Select Billing Frequency">
                    <Option value="MONTHLY">Monthly</Option>
                    <Option value="QUARTERLY">Quarterly</Option>
                    <Option value="HALF_YEARLY">Half Yearly</Option>
                    <Option value="YEARLY">Yearly</Option>
                    </Select>
                </Form.Item>
                </Col>

                <Col span={8}>
  <Form.Item
    label="Due Date Type"
    name="dueDateType"
    rules={[
      {
        required: true,
        message: "Please select Due Date Type",
      },
    ]}
  >
    <Select>
      <Option value="END_OF_PERIOD">End Of Period</Option>
      <Option value="DAYS_AFTER_BILL">Days After Bill</Option>
      <Option value="FIXED_DAY_OF_MONTH">Fixed Day Of Month</Option>
    </Select>
  </Form.Item>
</Col>
              </Row>
              <Row gutter={16}>
  {dueDateType === "DAYS_AFTER_BILL" && (
    <Col span={8}>
      <Form.Item
        label="Due After Days"
        name="dueAfterDays"
        rules={[{ required: true }]}
      >
        <InputNumber
          min={1}
          style={{ width: "100%" }}
        />
      </Form.Item>
    </Col>
  )}

  {dueDateType === "FIXED_DAY_OF_MONTH" && (
    <Col span={8}>
      <Form.Item
        label="Due Day"
        name="dueDay"
        rules={[{ required: true }]}
      >
        <InputNumber
          min={1}
          max={31}
          style={{ width: "100%" }}
        />
      </Form.Item>
    </Col>
  )}
</Row>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                {policyId ? "Update Policy" : "Save Policy"}
              </Button>
            </Form>

            <Card
              title="Maintenance Policies"
              style={{ marginTop: 20 }}
            >
              <Table
                rowKey="id"
                pagination={false}
                dataSource={policies}
                columns={[
                  {
                    title: "Society",
                    render: () => societyName,
                  },
                  {
                    title: "Basis",
                    dataIndex: "calculationBasis",
                  },
                  {
                    title: "Rate",
                    dataIndex: "rate",
                    render: (v) => `₹${v} / Sq.Ft.`,
                  },
                  {
                    title: "Frequency",
                    dataIndex: "billingFrequency",
                  },
                  {
                    title: "Action",
                    render: (_, record) => (
                      <Space>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => editPolicy(record)}
                        >
                          Edit
                        </Button>

                        <Popconfirm
                          title="Delete Policy?"
                          onConfirm={() =>
                            deletePolicy(record.id)
                          }
                        >
                          <Button
                            danger
                            size="small"
                            type="primary"
                          >
                            Delete
                          </Button>
                        </Popconfirm>
                      </Space>
                    ),
                  },
                ]}
              />
            </Card>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MaintenancePolicy;
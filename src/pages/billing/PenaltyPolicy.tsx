import React from "react";
import {
  Card,
  Form,
  InputNumber,
  Select,
  Switch,
  Row,
  Col,
  Button,
  Typography,
  Divider,
  Layout,
} from "antd";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const PenaltyPolicy: React.FC = () => {
  const role = sessionStorage.getItem("role");
  const [form] = Form.useForm();
  const penaltyType = Form.useWatch("penaltyType", form);
  const onFinish = (values: any) => {
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
            borderRadius: 8,
          }}
        >
          <Title level={5}>Penalty Policy</Title>

          <Divider />

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              penaltyType: "Fixed",
              frequency: "Monthly",
              graceDays: 5,
              penaltyAmount: 100,
              maxPenalty: 1000,
              allowWaiver: false,
              active: true,
            }}
          >
            <Row gutter={16}>
              {/* Penalty Type */}
              <Col xs={24} md={6}>
                <Form.Item
                  label="Penalty Type"
                  name="penaltyType"
                  rules={[
                    {
                      required: true,
                      message: "Please select penalty type",
                    },
                  ]}
                >
                  <Select>
                    <Option value="Fixed">Fixed Amount</Option>
                    <Option value="Percentage">Percentage</Option>
                  </Select>
                </Form.Item>
              </Col>

              {/* Penalty Amount */}
              {penaltyType === "Fixed" && (
                <Col xs={24} md={6}>
                  <Form.Item
                    label="Penalty Amount (₹)"
                    name="penaltyAmount"
                    rules={[
                      {
                        required: true,
                        message: "Enter penalty amount",
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              )}

              {/* Penalty Percentage */}
              {penaltyType === "Percentage" && (
                <Col xs={24} md={6}>
                  <Form.Item
                    label="Penalty Percentage (%)"
                    name="penaltyPercentage"
                    rules={[
                      {
                        required: true,
                        message: "Enter penalty percentage",
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              )}

              <Col xs={24} md={6}>
                <Form.Item
                  label="Penalty Frequency"
                  name="frequency"
                  rules={[
                    {
                      required: true,
                      message: "Please select frequency",
                    },
                  ]}
                >
                  <Select>
                    <Option value="One Time">One Time</Option>
                    <Option value="Daily">Daily</Option>
                    <Option value="Monthly">Monthly</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={6}>
                <Form.Item
                  label="Apply Penalty After (Days)"
                  name="graceDays"
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={6}>
                <Form.Item
                  label="Maximum Penalty (₹)"
                  name="maxPenalty"
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={6}>
                <Form.Item
                  label="Allow Penalty Waiver"
                  name="allowWaiver"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={6}>
                <Form.Item
                  label="Enable Penalty"
                  name="active"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Penalty Policy
              </Button>

              <Button
                style={{ marginLeft: 10 }}
                onClick={() => form.resetFields()}
              >
                Reset
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  </Layout>
);
};

export default PenaltyPolicy;

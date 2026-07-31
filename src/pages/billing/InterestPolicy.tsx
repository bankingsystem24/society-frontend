import React, { useEffect } from "react";
import {
  Form,
  InputNumber,
  Select,
  Button,
  Card,
  Row,
  Col,
  message,
  Layout,
} from "antd";
import axios from "axios";
import Sidebar from "../../components/layout/Sidebar";
import MemberSidebar from "../../components/layout/MemberSidebar";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import MemberHeader from "../../components/layout/MemberHeader";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";

const { Option } = Select;
const { Content } = Layout;
const role = sessionStorage.getItem("role");

const InterestPolicy = () => {
  const [form] = Form.useForm();

  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

  const loadPolicy = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/interest-policy/society/${societyId}/financial-year/${financialYearId}`
      );

      form.setFieldsValue(res.data);
    } catch (err) {
      // No existing policy
    }
  };

  useEffect(() => {
    loadPolicy();
  }, []);

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        society: {
          id: societyId,
        },
        financialYearId,
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/interest-policy`,
        payload
      );

      message.success("Interest Policy Saved Successfully");
      loadPolicy();
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Unable to save Interest Policy"
      );
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

    <Card title="Interest Policy">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Annual Interest Rate (%)"
              name="annualInterestRate"
              rules={[
                {
                  required: true,
                  message: "Enter Annual Interest Rate",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={100}
                step={0.01}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Interest Type"
              name="interestType"
              initialValue="MONTHLY"
            >
              <Select>
                <Option value="DAILY">Daily</Option>
                <Option value="MONTHLY">Monthly</Option>
                <Option value="YEARLY">Yearly</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Calculation Method"
              name="calculationMethod"
              initialValue="COMPOUND"
            >
              <Select>
                <Option value="SIMPLE">Simple</Option>
                <Option value="COMPOUND">Compound</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Grace Days"
              name="graceDays"
              initialValue={0}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Posting Type"
              name="postingType"
              initialValue="FIRST_DAY_OF_MONTH"
            >
              <Select>
                <Option value="FIRST_DAY_OF_MONTH">
                  First Day Of Month
                </Option>
                <Option value="DUE_DATE">
                  Due Date
                </Option>
                <Option value="DAILY">
                  Daily
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Button type="primary" htmlType="submit">
          Save Interest Policy
        </Button>
      </Form>
    </Card>
    </Content>
    </Layout>
    </Layout>
  );
};

export default InterestPolicy;
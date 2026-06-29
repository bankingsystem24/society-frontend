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

const  { Content } = Layout;
const role = sessionStorage.getItem("role");
const { Option } = Select;
const BASE_URL = import.meta.env.VITE_API_URL;

const BillingPolicy: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [policyId, setPolicyId] = useState<number | null>(null);

  const societyId = Number(sessionStorage.getItem("societyId"));
  const societyName = sessionStorage.getItem("societyName");
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
  useEffect(() => {
    form.setFieldsValue({
      societyId,
      interestRate: 0,
      interestType: "MONTHLY",
    });

    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    try {
      const data = await apiGet(
        `/billing-policy/society/${societyId}`
      );

      if (data) {
        setPolicyId(data.id);

        form.setFieldsValue({
          societyId: data.society?.id,
          interestRate: data.interestRate,
          interestType: data.interestType,
        });
      }
    } catch (error) {
      console.error("No billing policy found");
      setPolicyId(null);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const payload = {
        id: policyId,
        societyId,
        interestRate: values.interestRate,
        interestType: values.interestType,
        financialYearId:financialYearId,
      };

      await apiPost("/billing-policy", payload);

      message.success(
        policyId
          ? "Billing policy updated successfully"
          : "Billing policy saved successfully"
      );

      await loadPolicy();
    } catch (error) {
      console.error(error);
      message.error("Failed to save billing policy");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!policyId) return;

      await apiDelete(`/billing-policy/${policyId}`);

      message.success("Billing policy deleted successfully");

      setPolicyId(null);

      form.resetFields();

      form.setFieldsValue({
        societyId,
        interestRate: 0,
        interestType: "MONTHLY",
      });
    } catch (error) {
      console.error(error);
      message.error("Failed to delete billing policy");
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
      {role === "ADMIN" ? <Sidebar /> : role === "MEMBER" ? <MemberSidebar /> : role=== "SUPER_ADMIN" ? <SuperAdminSidebar/> : <AuditorSidebar />}
    </Layout.Sider>

    {/* MAIN AREA */}
    <Layout style={{ minWidth: 0 }}>

      {/* HEADER (NO EXTRA DIV) */}
      {role === "ADMIN" ? <Header /> : role === "MEMBER" ? <MemberHeader /> : role=== "SUPER_ADMIN" ? <SuperAdminHeader/> : <AuditorHeader />}
<Content>
    <Card
      title={
        policyId
          ? "Edit Billing Policy"
          : "Create Billing Policy"
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item name="societyId" hidden>
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Society">
              <Input
                value={societyName || ""}
                disabled
              />
            </Form.Item>
          </Col>

        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Interest Rate (%)"
              name="interestRate"
            >
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Interest Type"
              name="interestType"
            >
              <Select>
                <Option value="MONTHLY">
                  Monthly
                </Option>
                <Option value="QUARTERLY">
                  Quarterly
                </Option>
                <Option value="ANNUAL">
                  Annual
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              {policyId
                ? "Update Policy"
                : "Save Policy"}
            </Button>
          </Col>

          {policyId && (
            <Col>
              <Popconfirm
                title="Delete Billing Policy?"
                description="This action cannot be undone."
                onConfirm={handleDelete}
              >
                <Button danger>
                  Delete
                </Button>
              </Popconfirm>
            </Col>
          )}
        </Row>
      </Form>
    </Card>
    </Content>
    </Layout>
    </Layout>
  );
};

export default BillingPolicy;
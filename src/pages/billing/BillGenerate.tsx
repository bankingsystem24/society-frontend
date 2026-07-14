// src/pages/billing/BillingGenerate.tsx

import React, { useEffect, useState } from "react";
import {
  Button,
  Select,
  Input,
  message,
  Card,
  Form,
  Row,
  Col,
  Layout,
  Modal,
} from "antd";
import axios from "axios";
import { apiPost } from "../../api/axios";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";

const { Option } = Select;
const BASE_URL = import.meta.env.VITE_API_URL;

const { Content } = Layout;
const role = sessionStorage.getItem("role");

interface BillingFormValues {
  month: string;
  year: number;
}

const BillGenerate: React.FC = () => {
  const [form] = Form.useForm<BillingFormValues>();
  const [loading, setLoading] = useState(false);

  const [maintenanceMappingExists, setMaintenanceMappingExists] =
    useState(false);

  const [glReceivable, setGlReceivable] = useState<number>(0);
  const [glCreditAccount, setGlCreditAccount] = useState<number>(0);

  const societyId = Number(sessionStorage.getItem("societyId"));

  useEffect(() => {
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

  const onFinish = async (values: BillingFormValues) => {
    const financialYear = sessionStorage.getItem("financialYear");
    const financialYearId = Number(sessionStorage.getItem("financialYearId"));

    if (!financialYear) {
      message.error("Financial Year not found");
      return;
    }

    if (!glReceivable || !glCreditAccount) {
      message.error("Monthly Maintenance GL Mapping not configured");
      return;
    }

    const [start, end] = financialYear.trim().split("-");
    const startYear = Number(start);
    const endYear =
      end.length === 2 ? Number(start.substring(0, 2) + end) : Number(end);

    const selectedYear = Number(values.year);
    const selectedMonth = values.month;

    const validMonthsStartYear = [
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER",
    ];

    const validMonthsEndYear = ["JANUARY", "FEBRUARY", "MARCH"];

    const isValid =
      (selectedYear === startYear &&
        validMonthsStartYear.includes(selectedMonth)) ||
      (selectedYear === endYear && validMonthsEndYear.includes(selectedMonth));

    if (!isValid) {
      message.error(
        `Bill generation is allowed only for Financial Year ${financialYear}`,
      );
      return;
    }

    try {
      setLoading(true);

      const societyId = sessionStorage.getItem("societyId");

      if (!societyId) {
        message.error("Society not found");
        return;
      }

      const payload = {
        month: selectedMonth,
        year: selectedYear,
        societyId: Number(societyId),
        createdBy: Number(sessionStorage.getItem("userId")),
        financialYearId,
        glReceivable,
        glCreditAccount,
      };

      await apiPost("/billing/generate", payload);

      message.success("Bills generated successfully");

      form.resetFields();

      form.setFieldsValue({
        year: new Date().getFullYear(),
      });
    } catch (error) {
      console.error(error);

      message.error("Failed to generate bills");
    } finally {
      setLoading(false);
    }
  };

const generateFinancialYearBills = () => {
  Modal.confirm({
    title: "Generate Bills for Entire Financial Year",
    content:
      "This will generate maintenance bills for all 12 months (April to March). Continue?",
    okText: "Generate",
    cancelText: "Cancel",
    onOk: async () => {
      try {
        setLoading(true);

        const year = form.getFieldValue("year");

        const payload = {
          year: Number(year),
          societyId,
          createdBy: Number(sessionStorage.getItem("userId")),
          financialYearId: Number(sessionStorage.getItem("financialYearId")),
          glReceivable,
          glCreditAccount,
        };

        await apiPost("/billing/generate-financial-year-bills", payload);

        message.success(
          "Bills generated successfully for all 12 months."
        );
      } catch (err) {
        console.error(err);
        message.error("Failed to generate yearly bills.");
      } finally {
        setLoading(false);
      }
    },
  });
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
          <Card
            title={`Generate Monthly Bills (FY: ${sessionStorage.getItem("financialYear") || "N/A"})`}
            style={{ marginBottom: 20 }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                year: new Date().getFullYear(),
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={10}>
                  <Form.Item
                    label="Month"
                    name="month"
                    rules={[
                      {
                        required: true,
                        message: "Select month",
                      },
                    ]}
                  >
                    <Select placeholder="Select Month">
                      <Option value="JANUARY">JANUARY</Option>
                      <Option value="FEBRUARY">FEBRUARY</Option>
                      <Option value="MARCH">MARCH</Option>
                      <Option value="APRIL">APRIL</Option>
                      <Option value="MAY">MAY</Option>
                      <Option value="JUNE">JUNE</Option>
                      <Option value="JULY">JULY</Option>
                      <Option value="AUGUST">AUGUST</Option>
                      <Option value="SEPTEMBER">SEPTEMBER</Option>
                      <Option value="OCTOBER">OCTOBER</Option>
                      <Option value="NOVEMBER">NOVEMBER</Option>
                      <Option value="DECEMBER">DECEMBER</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    label="Year"
                    name="year"
                    rules={[
                      {
                        required: true,
                        message: "Enter year",
                      },
                    ]}
                  >
                    <Input type="number" placeholder="Enter year" />
                  </Form.Item>
                </Col>

                <Col
                  xs={24}
                  md={6}
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    disabled={!maintenanceMappingExists}
                    block
                  >
                    Generate Bills
                  </Button>
                </Col>

              </Row>
              <Row gutter={24}>
                  <Col xs={12} md={12}>
                    <Button
                      type="primary"
                      loading={loading}
                      disabled={!maintenanceMappingExists}
                      block
                      onClick={generateFinancialYearBills}
                    >
                      Generate Maintenance for 12 months (Accounting Year : April
                      to March)
                    </Button>
                  </Col>
              </Row>
            </Form>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BillGenerate;

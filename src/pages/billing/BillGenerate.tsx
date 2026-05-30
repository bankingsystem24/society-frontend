// src/pages/billing/BillingGenerate.tsx

import React, { useState } from "react";
import {
  Button,
  Select,
  Input,
  message,
  Card,
  Form,
  Row,
  Col,
} from "antd";

import { apiPost } from "../../api/axios";

const { Option } = Select;

interface BillingFormValues {
  month: string;
  year: number;
}

const BillGenerate: React.FC = () => {
  const [form] = Form.useForm<BillingFormValues>();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: BillingFormValues) => {
    const financialYear = sessionStorage.getItem("financialYear");

    if (!financialYear) {
      message.error("Financial Year not found");
      return;
    }

    const [startYear, endYear] = financialYear
      .trim()
      .split("-")
      .map(Number);

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

    const validMonthsEndYear = [
      "JANUARY",
      "FEBRUARY",
      "MARCH",
    ];

    const isValid =
      (selectedYear === startYear &&
        validMonthsStartYear.includes(selectedMonth)) ||
      (selectedYear === endYear &&
        validMonthsEndYear.includes(selectedMonth));

    if (!isValid) {
      message.error(
        `Bill generation is allowed only for Financial Year ${financialYear}`
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

  return (
    <Card
      title={`Generate Monthly Bills (FY: ${
        sessionStorage.getItem("financialYear") || "N/A"
      })`}
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
              <Input
                type="number"
                placeholder="Enter year"
              />
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
              block
            >
              Generate Bills
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default BillGenerate;
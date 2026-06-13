import React, { useState } from "react";
import { Button, Select, Input, message, Card, Form, Row, Col } from "antd";
import { apiPost } from "../../api/axios";

const { Option } = Select;

interface SinkingFundFormValues {
  month: string;
  year: number;
  amount: number;
}

const GenerateSinkingFund: React.FC = () => {
  const [form] = Form.useForm<SinkingFundFormValues>();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: SinkingFundFormValues) => {
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
    const selectedAmount = values.amount;

    const validMonthsStartYear = [
      "APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER",
      "OCTOBER","NOVEMBER","DECEMBER"
    ];

    const validMonthsEndYear = [
      "JANUARY","FEBRUARY","MARCH"
    ];

    const isValid =
      (selectedYear === startYear &&
        validMonthsStartYear.includes(selectedMonth)) ||
      (selectedYear === endYear &&
        validMonthsEndYear.includes(selectedMonth)) ;

    if (!isValid) {
      message.error(
        `Sinking Fund generation is allowed only for FY ${financialYear}`
      );
      return;
    }

    try {
      setLoading(true);

      const societyId = sessionStorage.getItem("societyId");
      const financialYearId = sessionStorage.getItem("financialYearId");

      if (!societyId) {
        message.error("Society not found");
        return;
      }

      const payload = {
        month: selectedMonth,
        year: selectedYear,
        amount:selectedAmount,
        societyId: Number(societyId),
        createdBy: Number(sessionStorage.getItem("userId")),
        financialYearId
      };

      await apiPost("/sinking-fund/generate", payload);

      message.success("Sinking Fund generated successfully");

      form.resetFields();

      form.setFieldsValue({
        year: new Date().getFullYear(),
      });
    } catch (error) {
      console.error(error);
      message.error("Failed to generate Sinking Fund");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={`Generate Sinking Fund (FY: ${
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
          <Col xs={24} md={6}>
            <Form.Item
              label="Month"
              name="month"
              rules={[{ required: true, message: "Select month" }]}
            >
              <Select placeholder="Select Month">
                {[
                  "JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE",
                  "JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"
                ].map((m) => (
                  <Option key={m} value={m}>
                    {m}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              label="Year"
              name="year"
              rules={[{ required: true, message: "Enter year" }]}
            >
              <Input type="number" placeholder="Enter year" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              label="Amount"
              name="amount"
              rules={[{ required: true, message: "Enter Amount" }]}
            >
              <Input type="number" placeholder="Enter Amount" />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            md={6}
            style={{ display: "flex", alignItems: "center" }}
          >
            <Button type="primary" htmlType="submit" loading={loading} block>
              Generate
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default GenerateSinkingFund;
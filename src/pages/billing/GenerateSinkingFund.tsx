import React, { useEffect, useState } from "react";
import { Button, Select, Input, message, Card, Form, Row, Col } from "antd";
import { apiPost } from "../../api/axios";
import axios from "axios";

const { Option } = Select;

const BASE_URL = import.meta.env.VITE_API_URL;

interface SinkingFundFormValues {
  month: string;
  year: number;
  amount: number;
}

const GenerateSinkingFund: React.FC = () => {
  const [form] = Form.useForm<SinkingFundFormValues>();
  const [loading, setLoading] = useState(false);
  const societyId = Number(sessionStorage.getItem("societyId"));

 
    const [glReceivable, setGlReceivable] = useState<number>(0);
    const [glCreditAccount, setGlCreditAccount] = useState<number>(0);
  
    const [glCashInHand, setGlCashInHand] = useState<number>(0);
    const [glBankAccount, setGlBankAccount] = useState<number>(0);
    const [glInterestIncome, setGlInterestIncome] = useState<number>(0);
    const [glDiscount, setGlDiscount] = useState<number>(0);
  
    useEffect(() => {}, [ glCashInHand, glBankAccount, glInterestIncome, glDiscount, glReceivable,glCreditAccount ]);
    
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
          item.description?.trim().toLowerCase() === "sinking fund receivable",
      );

      setGlReceivable(mapping.gl_receivable);
      setGlCreditAccount(mapping.gl_credit_account);

      const CashInHand = res.data.find(
        (item: any) => item.description?.trim().toLowerCase() == "cash in hand",
      )?.gl_receivable;
      setGlCashInHand(Number(CashInHand));
      const BankAccount = res.data.find(
        (item: any) => item.description?.trim().toLowerCase() == "bank account",
      )?.gl_receivable;
      setGlBankAccount(Number(BankAccount));
      const InterestIncome = res.data.find(
        (item: any) =>
          item.description?.trim().toLowerCase() == "interest income",
      )?.gl_receivable;
      setGlInterestIncome(Number(InterestIncome));
      const Discount = res.data.find(
        (item: any) => item.description?.trim().toLowerCase() == "discount",
      )?.gl_receivable;
      setGlDiscount(Number(Discount));
    } catch (err) {
      console.error(err);
      message.error("Unable to load GL Mapping");
    }
  };

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
        financialYearId,
        glReceivable,
        glCreditAccount,
        glCashInHand,
        glBankAccount,
        glInterestIncome,
        glDiscount,
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
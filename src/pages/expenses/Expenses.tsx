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
} from "antd";

const BASE_URL = import.meta.env.VITE_API_URL;

import axios from "axios";
import dayjs from "dayjs";

interface Expense {
  id: number;
  expenseDate: string;
  expenseHead: string;
  vendor: string;
  amount: number;
  paymentMode: string;
  narration: string;
}

const Expenses: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  const societyId = sessionStorage.getItem("societyId");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/expenses/${societyId}`
      );
      setData(res.data);
    } catch (err) {
      message.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      const payload = {
        societyId: Number(societyId),
        expenseDate: values.expenseDate.format("YYYY-MM-DD"),
        expenseHead: values.expenseHead,
        vendor: values.vendor,
        amount: values.amount,
        paymentMode: values.paymentMode,
        narration: values.narration,
      };

      await axios.post("${BASE_URL}/expenses", payload);

      message.success("Expense added successfully");
      form.resetFields();
      fetchExpenses();
    } catch (err) {
      message.error("Failed to save expense");
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "expenseDate",
      render: (d: string) => dayjs(d).format("DD-MMM-YYYY"),
    },
    {
      title: "Expense Head",
      dataIndex: "expenseHead",
    },
    {
      title: "Vendor",
      dataIndex: "vendor",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right" as const,
      render: (v: number) =>
        v.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    },
    {
      title: "Mode",
      dataIndex: "paymentMode",
    },
    {
      title: "Narration",
      dataIndex: "narration",
    },
  ];

  return (
    <Row gutter={16}>
      {/* FORM */}
      <Col span={8}>
        <Card title="Add Expense">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="expenseDate"
              label="Date"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="expenseHead"
              label="Expense Head"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g. Electricity, Salary" />
            </Form.Item>

            <Form.Item name="vendor" label="Vendor">
              <Input />
            </Form.Item>

            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="paymentMode" label="Payment Mode">
              <Select>
                <Select.Option value="CASH">Cash</Select.Option>
                <Select.Option value="BANK">Bank</Select.Option>
                <Select.Option value="UPI">UPI</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="narration" label="Narration">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Button type="primary" htmlType="submit" block>
              Save Expense
            </Button>
          </Form>
        </Card>
      </Col>

      {/* TABLE */}
      <Col span={16}>
        <Card title="Expense List">
          <Table
            dataSource={data}
            columns={columns}
            rowKey="id"
            loading={loading}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default Expenses;
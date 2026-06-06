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
  expenseGlCode: number;
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
  const [glList, setGlList] = useState<any[]>([]);

  const fetchGlMaster = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/gl/master?societyId=${societyId}`,
      );
      setGlList(
        (res.data || []).filter((gl: any) => gl.groupName === "EXPENSES"),
      );
    } catch {
      message.error("Failed to load GL Accounts");
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchGlMaster();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/expenses/${societyId}`);
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
        voucherDate: values.expenseDate.format("YYYY-MM-DD"),
        expenseGlCode: values.expenseGlCode,
        amount: values.amount,
        paymentMode: values.paymentMode,
        narration: values.narration,
        vendorId: values.vendorId || null,
      };

      await axios.post(`${BASE_URL}/expenses`, payload);

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
      title: "GL Code",
      dataIndex: "expenseGlCode",
    },
    {
      title: "GL Name",
      render: (_: any, record: any) => {
        const gl = glList.find((g) => g.glCode === record.expenseGlCode);

        return gl?.accountName || "-";
      },
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
  <div style={{ padding: 16 }}>
    {/* ENTRY FORM */}
    <Card title="Add Expense" style={{ marginBottom: 16 }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16} style={{ marginTop:-10}} >
          <Col xs={24} md={8}>
            <Form.Item
              name="expenseDate"
              label="Date"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="expenseGlCode"
              label="Expense Account"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                placeholder="Select Expense Account"
                optionFilterProp="label"
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

          <Col xs={24} md={8}>
            <Form.Item name="vendor" label="Vendor">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop:-10}}>
          <Col xs={24} md={8}>
            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                controls={false}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="paymentMode"
              label="Payment Mode"
            >
              <Select>
                <Select.Option value="CASH">Cash</Select.Option>
                <Select.Option value="BANK">Bank</Select.Option>
                <Select.Option value="UPI">UPI</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="narration"
              label="Narration"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Button type="primary" htmlType="submit">
          Save Expense
        </Button>
      </Form>
    </Card>

    {/* EXPENSE LIST */}
    <Card title="Expense List">
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        size="small"
      />
    </Card>
  </div>
);

};

export default Expenses;

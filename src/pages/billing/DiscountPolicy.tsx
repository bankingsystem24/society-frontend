import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  DatePicker,
  Switch,
  Row,
  Col,
  message,
  Space,
  Table,
  Tag,
  Popconfirm,
  Layout
} from "antd"; 
import dayjs from "dayjs";
import axios from "axios";
import type { ColumnsType } from "antd/es/table";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";

const { RangePicker } = DatePicker;
const BASE_URL = import.meta.env.VITE_API_URL;
const { Content } = Layout;
const role = sessionStorage.getItem("role");

interface DiscountPolicyForm {
  policyName: string;
  active: boolean;
  paidBeforeDate: dayjs.Dayjs;
  discountPercent: number;
  effectiveDates?: [dayjs.Dayjs, dayjs.Dayjs];
}

interface DiscountPolicyData {
  id: number;
  policyName: string;
  active: boolean;
  paidBeforeDate: string;
  discountPercent: number;
  effectiveFrom: string;
  effectiveTo: string;
}

const DiscountPolicy: React.FC = () => {
  const [form] = Form.useForm();
  const societyId = Number(sessionStorage.getItem("societyId"));

  const [policies, setPolicies] = useState<DiscountPolicyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    form.setFieldsValue({
      active: true,
      discountPercent: 5,
    });

    loadPolicies();
  }, [form]);

  // ================= LOAD =================
  const loadPolicies = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/discount-policy/society/${societyId}`
      );

      setPolicies(res.data);
    } catch (error) {
      console.error(error);
      message.error("Failed to load policies");
    } finally {
      setLoading(false);
    }
  };

  // ================= EDIT =================
  const editPolicy = (record: DiscountPolicyData) => {
    setEditingId(record.id);

    form.setFieldsValue({
      policyName: record.policyName,
      paidBeforeDate: dayjs(record.paidBeforeDate),
      discountPercent: record.discountPercent,
      active: record.active,
      effectiveDates: [
        dayjs(record.effectiveFrom),
        dayjs(record.effectiveTo),
      ],
    });
  };

  // ================= SUBMIT =================
  const onFinish = async (values: DiscountPolicyForm) => {
    try {
      const payload = {
        societyId,
        policyName: values.policyName,
        active: values.active,
        paidBeforeDate: values.paidBeforeDate.format("YYYY-MM-DD"),
        discountPercent: values.discountPercent,
        effectiveFrom: values.effectiveDates?.[0]?.format("YYYY-MM-DD"),
        effectiveTo: values.effectiveDates?.[1]?.format("YYYY-MM-DD"),
      };

      if (editingId) {
        await axios.put(
          `${BASE_URL}/discount-policy/${editingId}`,
          payload
        );
        message.success("Policy updated successfully");
      } else {
        await axios.post(`${BASE_URL}/discount-policy`, payload);
        message.success("Policy created successfully");
      }

      form.resetFields();
      setEditingId(null);

      form.setFieldsValue({
        active: true,
        daysBeforeDue: 7,
        discountPercent: 5,
      });

      loadPolicies();
    } catch (error) {
      console.error(error);
      message.error("Failed to save policy");
    }
  };

  // ================= DELETE =================
  const deletePolicy = async (id: number) => {
    try {
      await axios.delete(`${BASE_URL}/discount-policy/${id}`);
      message.success("Policy deleted");
      loadPolicies();
    } catch (error) {
      message.error("Delete failed");
    }
  };

  // ================= TABLE =================
  const columns: ColumnsType<DiscountPolicyData> = [
    {
      title: "Policy Name",
      dataIndex: "policyName",
    },
    {
      title: "Paid Before Date",
      dataIndex: "paidBeforeDate",
      render: (date: string) => dayjs(date).format("DD-MM-YYYY"),
    },
    {
      title: "Discount %",
      dataIndex: "discountPercent",
    },
    {
      title: "From",
      dataIndex: "effectiveFrom",
    },
    {
      title: "To",
      dataIndex: "effectiveTo",
    },
    {
      title: "Status",
      dataIndex: "active",
      render: (active) =>
        active ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => editPolicy(record)}>
            Edit
          </Button>

          <Popconfirm
            title="Delete Policy?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deletePolicy(record.id)}
          >
            <Button danger type="primary">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ================= UI =================
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
      title="Discount Policy"
      styles ={{ body : {padding: 12 },}}
    >
      {/* FORM */}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Policy Name"
              name="policyName"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Paid Before Date"
              name="paidBeforeDate"
              rules={[{ required: true, message: "Please select Paid Before Date" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD-MM-YYYY"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Discount %"
              name="discountPercent"
              rules={[{ required: true }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={100}
                precision={2}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12}>
            <Form.Item label="Effective Period" name="effectiveDates">
              <RangePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12}>
            <Form.Item label="Active" name="active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="end" style={{ marginTop: 10 }}>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              htmlType="submit"
              block
            >
              {editingId ? "Update Policy" : "Save Policy"}
            </Button>
          </Col>
        </Row>
      </Form>

      {/* TABLE */}
      <div style={{ marginTop: 24 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={policies}
          loading={loading}
          size="small"
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </Card>
    </Content>
    </Layout>
    </Layout>
  );
};

export default DiscountPolicy;
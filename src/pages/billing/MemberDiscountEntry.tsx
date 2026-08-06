import React, { useEffect, useState, useRef } from "react";
import {
  Form,
  Table,
  Input,
  Button,
  Select,
  Card,
  message,
  Layout,
  Row,
  Col,
  Popconfirm,
  Space,
  DatePicker,
  Tag,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";

const { Option } = Select;
const { Content } = Layout;
const BASE_URL = import.meta.env.VITE_API_URL;

// ---- Types ----
interface FlatMaster {
  id: number;
  flatNo: string;
  ownerName: string;
}

interface DiscountForm {
  flatId: number;
  discountAmount: number;
  reason: string;
  approvedBy: string;
  approvedDate: any; // dayjs object from DatePicker
  financialYear: string;
}

interface Discount {
  id: number;
  flatId: number;
  flatNo: string;
  memberName: string;
  discountAmount: number;
  reason: string;
  approvedBy: string;
  approvedDate: string;
  financialYear: string;
  status: "PENDING" | "PARTIALLY_ADJUSTED" | "ADJUSTED";
}

const MemberDiscountEntry: React.FC = () => {
  const [form] = Form.useForm();

  const [flats, setFlats] = useState<FlatMaster[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYear = sessionStorage.getItem("financialYear");
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

  const role = sessionStorage.getItem("role");

  const flatRef = useRef<any>(null);
  const amountRef = useRef<any>(null);
  const saveRef = useRef<HTMLButtonElement>(null);
  if (!financialYear) {
    message.error("Financial Year not found.");
    return;
  }

  if (!financialYear) {
    throw new Error("Financial year not found in session.");
  }

  const years = financialYear.split("-");
  const startYear = years[0];

  useEffect(() => {
    loadFlats();
    loadDiscounts();

    form.setFieldsValue({
      financialYear: "Previous Year",
      approvedDate: dayjs(`${startYear}-04-01`),
      approvedBy: "Committee",
      reason: "Pending Discount",
    });
  }, []);

  const loadFlats = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/flats?societyId=${societyId}&financialYearId=${financialYearId}`,
      );
      setFlats(res.data);
    } catch (err) {
      message.error("Unable to load Flats");
    }
  };

  const loadDiscounts = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/discount?societyId=${societyId}&financialYearId=${financialYearId}`,
      );
      setDiscounts(res.data);
    } catch (err) {
      message.error("Unable to load Discounts");
    }
  };

  const onFinish = async (values: DiscountForm) => {
    try {
      const payload = {
        ...values,
        societyId,
        financialYearId,
        approvedDate: values.approvedDate
          ? values.approvedDate.format("YYYY-MM-DD")
          : null,
      };

      if (editingId) {
        await axios.put(`${BASE_URL}/discount/${editingId}`, payload);
        message.success("Discount Updated");
      } else {
        await axios.post(`${BASE_URL}/discount`, payload);
        message.success("Discount Saved");
      }

      form.resetFields();
      setEditingId(null);
      loadDiscounts();
      form.setFieldsValue({
        financialYear: "Previous Year",
        approvedDate: dayjs(`${startYear}-04-01`),
        approvedBy: "Committee",
        reason: "Pending Discount",
      });
    } catch (err) {
      message.error("Error saving discount");
    }
  };

  const getFlatLabel = (flatId: number) => {
    const f = flats.find((x) => x.id === flatId);
    return f ? `${f.flatNo} - ${f.ownerName}` : "";
  };

  const handleEdit = (record: Discount) => {
    setEditingId(record.id);
    form.setFieldsValue({
      flatId: record.flatId,
      discountAmount: record.discountAmount,
      reason: record.reason,
      approvedBy: record.approvedBy,
      approvedDate: record.approvedDate ? dayjs(record.approvedDate) : null,
      financialYear: record.financialYear,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${BASE_URL}/discount/${id}`);
      message.success("Discount deleted");

      if (editingId === id) {
        form.resetFields();
        setEditingId(null);
      }
      loadDiscounts();
    } catch (err) {
      message.error(
        "Unable to delete Discount (it may already be adjusted in a bill)",
      );
    }
  };

  const statusColor: Record<string, string> = {
    PENDING: "orange",
    PARTIALLY_ADJUSTED: "blue",
    ADJUSTED: "green",
  };

  const columns = [
    {
      title: "Flat",
      dataIndex: "flatNo",
    },
    {
      title: "Member",
      dataIndex: "ownerName",
    },
    {
      title: "Discount Amount",
      dataIndex: "discountAmount",
      render: (v: number) => `₹${v.toFixed(2)}`,
    },
    {
      title: "Reason",
      dataIndex: "reason",
    },
    {
      title: "FY",
      dataIndex: "financialYear",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (v: string) => <Tag color={statusColor[v]}>{v}</Tag>,
    },
    {
      title: "Action",
      render: (_: any, record: Discount) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            disabled={record.status === "ADJUSTED"}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete Discount"
            description="Are you sure you want to delete this discount entry?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger size="small" disabled={record.status !== "PENDING"}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

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

        <Content style={{ padding: 16, background: "#f0f5ff" }}>
          <div style={{ maxWidth: "100%", margin: "0 auto" }}>
            <Card
              title="Member Discount Entry (Flat-wise)"
              style={{ width: "100%" }}
            >
              <Form layout="vertical" form={form} onFinish={onFinish}>
                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={24} md={12} lg={6}>
                    <Form.Item
                      label="Flat"
                      name="flatId"
                      rules={[{ required: true, message: "Select Flat" }]}
                    >
                      <Select
                        ref={flatRef}
                        showSearch
                        placeholder="Select flat"
                        optionFilterProp="children"
                        onChange={() =>
                          setTimeout(() => amountRef.current?.focus(), 100)
                        }
                      >
                        {flats.map((f) => (
                          <Option key={f.id} value={f.id}>
                            {f.flatNo} - {f.ownerName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={12} lg={6}>
                    <Form.Item
                      label="Discount Amount"
                      name="discountAmount"
                      rules={[
                        { required: true, message: "Enter Discount Amount" },
                      ]}
                    >
                      <Input
                        ref={amountRef}
                        type="number"
                        min={0}
                        step="0.01"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={12} lg={6}>
                    <Form.Item
                      label="Financial Year"
                      name="financialYear"
                      rules={[{ message: "Enter Financial Year" }]}
                    >
                      <Input placeholder="e.g. 2025-26" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={12} lg={6}>
                    <Form.Item label="Approved Date" name="approvedDate">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={12} lg={6}>
                    <Form.Item label="Approved By" name="approvedBy">
                      <Input placeholder="MC Resolution / Name" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={18} lg={18}>
                    <Form.Item label="Reason" name="reason">
                      <Input placeholder="e.g. Early payment rebate FY25-26" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row>
                  <Col xs={24}>
                    <Form.Item>
                      <Button ref={saveRef} type="primary" htmlType="submit">
                        {editingId ? "Update" : "Save"}
                      </Button>

                      {editingId && (
                        <Button
                          style={{ marginLeft: 10 }}
                          onClick={() => {
                            form.resetFields();
                            setEditingId(null);
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>

              <Row>
                <Col span={24}>
                  <Table
                    style={{ marginTop: 20 }}
                    rowKey="id"
                    columns={columns}
                    dataSource={discounts}
                    bordered
                    size="small"
                    scroll={{ x: 900 }}
                    pagination={{ pageSize: 10 }}
                  />
                </Col>
              </Row>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MemberDiscountEntry;

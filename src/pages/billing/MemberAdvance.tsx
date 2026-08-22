import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  Table,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  message,
  Row,
  Col,
  Layout,
  Popconfirm,
  Tag,
  Space,
} from "antd";
import dayjs from "dayjs";
import axios from "axios";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const BASE_URL = import.meta.env.VITE_API_URL;
const { Content } = Layout;
const role = sessionStorage.getItem("role");

type AdvanceStatus =
  | "USED"
  | "AVAILABLE"
  | "FULLY_USED"
  | "PARTIALLY_USED"
  | "REFUNDED";

interface MemberAdvance {
  id: number;
  memberId?: number;
  societyId: number;
  flatId: number;
  receiptId?: number | null;
  advanceAmount: number;
  usedAmount: number;
  balanceAmount: number;
  status: AdvanceStatus;
  createdDate?: string;
}

interface Flat {
  id: number;
  flatNo: string;
}

const MemberAdvance: React.FC = () => {
  const societyId = Number(sessionStorage.getItem("societyId"));
  const [form] = Form.useForm();
  const [data, setData] = useState<MemberAdvance[]>([]);
  const [filteredAdvances, setFilteredAdvances] = useState<MemberAdvance[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [flatSearch, setFlatSearch] = useState("");
  const [statusSearch, setStatusSearch] = useState("");
  const [flats, setFlats] = useState<any[]>([]);

  const flatRef = useRef<any>(null);
  const receiptRef = useRef<any>(null);
  const advanceAmountRef = useRef<any>(null);
  const usedAmountRef = useRef<any>(null);
  const statusRef = useRef<any>(null);
  const saveButtonRef = useRef<any>(null);

  useEffect(() => {
    fetchAdvances();
  }, []);

  useEffect(() => {
    if (societyId) {
      loadFlats();
    }
  }, [societyId]);

  const loadFlats = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/flats?societyId=${societyId}`,
      );
      setFlats(response.data);
      console.log("Flats loaded:", response.data);
    } catch (error) {
      console.error("Error loading flats:", error);
    }
  };
  const fetchAdvances = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/billing/member-advance/${societyId}`,
      );
      setData(res.data || []);
      setFilteredAdvances(res.data || []);
    } catch (error) {
      console.error(error);
      message.error("Failed to load member advances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = data.filter((item: MemberAdvance) => {
      const matchMember =
        !memberSearch || item.memberId?.toString().includes(memberSearch);

      const matchFlat =
        !flatSearch || item.flatId?.toString().includes(flatSearch);

      const matchStatus =
        !statusSearch ||
        item.status?.toLowerCase().includes(statusSearch.toLowerCase());

      return matchMember && matchFlat && matchStatus;
    });

    setFilteredAdvances(filtered);
  }, [data, memberSearch, flatSearch, statusSearch]);

  const calculateBalance = () => {
    const advanceAmount = Number(form.getFieldValue("advanceAmount")) || 0;
    const usedAmount = Number(form.getFieldValue("usedAmount")) || 0;
    let balanceAmount = advanceAmount - usedAmount;
    if (balanceAmount < 0) {
      balanceAmount = 0;
    }

    let status: AdvanceStatus = "AVAILABLE";

    if (usedAmount === 0) {
      status = "AVAILABLE";
    } else if (usedAmount > 0 && balanceAmount > 0) {
      status = "PARTIALLY_USED";
    } else if (usedAmount > 0 && balanceAmount === 0) {
      status = "FULLY_USED";
    }

    form.setFieldsValue({
      balanceAmount,
      status,
    });
  };

  const onFinish = async (values: any) => {
    try {
      const advanceAmount = Number(values.advanceAmount) || 0;
      const usedAmount = Number(values.usedAmount) || 0;
      const balanceAmount = Math.max(advanceAmount - usedAmount, 0);
      const selectedFlat = flats.find(
        (flat) => flat.id === Number(values.flatId)
        );

      const payload = {
        societyId,
        flatId: Number(values.flatId),
        receiptId: values.receiptId ? Number(values.receiptId) : null,
        advanceAmount,
        usedAmount,
        balanceAmount,
        status: values.status,
        financialYearId: Number(sessionStorage.getItem("financialYearId")),
        memberId:selectedFlat?.ownerId,
        
      };

      console.log("Payload to be sent:", payload);

      if (editingId) {await axios.put(`${BASE_URL}/member-advance/${editingId}`, payload);
        message.success("Member advance updated successfully");
      } else {
        await axios.post(`${BASE_URL}/billing/member-advance`, payload);
        message.success("Member advance added successfully");
      }

      form.resetFields();
      setEditingId(null);
      await fetchAdvances();
      flatRef.current?.focus();
    } catch (error) {
      console.error(error);

      message.error(
        editingId
          ? "Failed to update member advance"
          : "Failed to save member advance",
      );
    }
  };

  const editAdvance = (record: MemberAdvance) => {
    setEditingId(record.id);

    form.setFieldsValue({
      flatId: record.flatId,
      receiptId: record.receiptId,
      advanceAmount: record.advanceAmount,
      usedAmount: record.usedAmount,
      balanceAmount: record.balanceAmount,
      status: record.status,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEdit = () => {
    form.resetFields();
    setEditingId(null);
    flatRef.current?.focus();
  };

  const deleteAdvance = async (id: number) => {
    try {
      await axios.delete(`${BASE_URL}/billing/member-advance/${id}`);

      message.success("Member advance deleted successfully");

      await fetchAdvances();
    } catch (error) {
      console.error(error);
      message.error("Failed to delete member advance");
    }
  };

  const getStatusColor = (status: AdvanceStatus) => {
    switch (status) {
      case "AVAILABLE":
        return "green";
      case "USED":
        return "blue";
      case "PARTIALLY_USED":
        return "orange";
      case "FULLY_USED":
        return "red";
      case "REFUNDED":
        return "purple";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Flat",
      dataIndex: "flatNo",
      width: 120,
    },
    {
      title: "Receipt ID",
      dataIndex: "receiptId",
      width: 130,
      render: (value: number | null) => value ?? "-",
    },
    {
      title: "Advance",
      dataIndex: "advanceAmount",
      align: "right" as const,
      render: (value: number) =>
        Number(value || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },
    {
      title: "Used",
      dataIndex: "usedAmount",
      align: "right" as const,
      render: (value: number) =>
        Number(value || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },
    {
      title: "Balance",
      dataIndex: "balanceAmount",
      align: "right" as const,
      render: (value: number) =>
        Number(value || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: AdvanceStatus) => (
        <Tag color={getStatusColor(status)}>{status.replace(/_/g, " ")}</Tag>
      ),
    },
    {
        title: "Created Date",
        dataIndex: "createdDate",
        width: 130,
        render: (date: string) =>
            date ? dayjs(date).format("DD/MM/YYYY") : "-",
        },
    {
      title: "Action",
      key: "action",
      width: 180,
      align: "center" as const,
      render: (_: any, record: MemberAdvance) => (
        <Space size="small" wrap={false}>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => editAdvance(record)}
            disabled={!!record.receiptId}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Member Advance"
            description="Are you sure you want to delete this advance?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteAdvance(record.id)}
            disabled={!!record.receiptId}
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={!!record.receiptId}
            >
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

        <Content>
          <div style={{ padding: 5 }}>
            <Card
              title={editingId ? "Edit Member Advance" : "Add Member Advance"}
              style={{ marginBottom: 0 }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  usedAmount: 0,
                  balanceAmount: 0,
                  status: "AVAILABLE",
                }}
                onValuesChange={(changedValues) => {
                  if (
                    changedValues.advanceAmount !== undefined ||
                    changedValues.usedAmount !== undefined
                  ) {
                    calculateBalance();
                  }
                }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="flatId"
                      label="Flat"
                      rules={[
                        {
                          required: true,
                          message: "Please select a flat",
                        },
                      ]}
                    >
                      <Select
                        ref={flatRef}
                        placeholder="Select Flat"
                        showSearch
                        optionFilterProp="label"
                        options={flats.map((flat: Flat) => ({
                          value: flat.id,
                          label: flat.flatNo,
                        }))}
                        onChange={() => receiptRef.current?.focus()}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name="receiptId" label="Receipt ID">
                      <InputNumber
                        ref={receiptRef}
                        style={{ width: "100%" }}
                        min={1}
                        controls={false}
                        placeholder="Receipt ID (Optional)"
                        onChange={() => advanceAmountRef.current?.focus()}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="status"
                      label="Status"
                      rules={[
                        {
                          required: true,
                          message: "Please select status",
                        },
                      ]}
                    >
                      <Select
                        ref={statusRef}
                        onChange={() => saveButtonRef.current?.focus()}
                      >
                        <Select.Option value="AVAILABLE">
                          Available
                        </Select.Option>

                        <Select.Option value="USED">Used</Select.Option>

                        <Select.Option value="PARTIALLY_USED">
                          Partially Used
                        </Select.Option>

                        <Select.Option value="FULLY_USED">
                          Fully Used
                        </Select.Option>

                        <Select.Option value="REFUNDED">Refunded</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: -10 }}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="advanceAmount"
                      label="Advance Amount"
                      rules={[
                        {
                          required: true,
                          message: "Please enter advance amount",
                        },
                      ]}
                    >
                      <InputNumber
                        ref={advanceAmountRef}
                        style={{ width: "100%" }}
                        controls={false}
                        min={0}
                        precision={2}
                        placeholder="Enter advance amount"
                        onChange={() => {
                          calculateBalance();
                          usedAmountRef.current?.focus();
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name="usedAmount" label="Used Amount">
                      <InputNumber
                        ref={usedAmountRef}
                        style={{ width: "100%" }}
                        controls={false}
                        min={0}
                        precision={2}
                        placeholder="Enter used amount"
                        onChange={() => {
                          calculateBalance();
                          statusRef.current?.focus();
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name="balanceAmount" label="Balance Amount">
                      <InputNumber
                        style={{ width: "100%" }}
                        disabled
                        precision={2}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Button ref={saveButtonRef} type="primary" htmlType="submit">
                  {editingId ? "Update Advance" : "Save Advance"}
                </Button>

                {editingId && (
                  <Button style={{ marginLeft: 10 }} onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
              </Form>
            </Card>

            <Card>
              <div
                style={{
                  marginBottom: 10,
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <Input
                  placeholder="Search Member ID"
                  prefix={<SearchOutlined style={{ color: "#999" }} />}
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  allowClear
                  style={{ width: 220 }}
                />

                <Input
                  placeholder="Search Flat ID"
                  prefix={<SearchOutlined style={{ color: "#999" }} />}
                  value={flatSearch}
                  onChange={(e) => setFlatSearch(e.target.value)}
                  allowClear
                  style={{ width: 220 }}
                />

                <Input
                  placeholder="Search Status"
                  prefix={<SearchOutlined style={{ color: "#999" }} />}
                  value={statusSearch}
                  onChange={(e) => setStatusSearch(e.target.value)}
                  allowClear
                  style={{ width: 220 }}
                />
              </div>

              <Table
                dataSource={filteredAdvances}
                columns={columns}
                rowKey="id"
                loading={loading}
                scroll={{ x: 1200 }}
                size="small"
                pagination={{ pageSize: 7 }}
              />
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MemberAdvance;

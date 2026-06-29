import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Space,
  Row,
  Col,
  InputNumber,
  Select,
  Layout
} from "antd";
import axios from "axios";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";

const BASE_URL = import.meta.env.VITE_API_URL;
const { Content } = Layout;
const role = sessionStorage.getItem("role");

interface Vendor {
  id?: number;
  vendorName: string;
  mobileNo: string;
  gstNo: string;
  address: string;
  payableGlCode: number;
  societyId: number;
}

const Vendors: React.FC = () => {
  const [data, setData] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [glList, setGlList] = useState<any[]>([]);
  const [form] = Form.useForm();

  const societyId = Number(sessionStorage.getItem("societyId"));

  // ================= FETCH =================

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/vendors/${societyId}`);
      setData(res.data || []);
    } catch {
      message.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const fetchGLCodes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/gl/master`, {
        params: {
          societyId: societyId,
        },
      });
      const filtered = (res.data || []).filter(
        (gl: any) =>
          gl.groupName === "LIABILITY" ||
          gl.accountName?.toLowerCase().includes("payable") ||
          gl.accountName?.toLowerCase().includes("creditor"),
      );

      setGlList(filtered);
    } catch (err) {
      message.error("Failed to load GL codes");
    }
  };

  useEffect(() => {
    if (societyId) {
      fetchVendors();
      fetchGLCodes();
    }
  }, [societyId]);

  const getGlName = (glCode: number) => {
    const gl = glList.find((g) => g.glCode === glCode);
    return gl ? gl.accountName : "-";
  };

  // ================= OPEN MODAL =================

  const openModal = (record?: Vendor) => {
    setEditing(record || null);

    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }

    setOpen(true);
  };

  // ================= SAVE =================

  const handleSave = async (values: Vendor) => {
    try {
      const payload = {
        ...values,
        societyId,
      };

      if (editing?.id) {
        await axios.put(`${BASE_URL}/vendors/${editing.id}`, payload);

        message.success("Vendor updated successfully");
      } else {
        await axios.post(`${BASE_URL}/vendors`, payload);

        message.success("Vendor created successfully");
      }

      setOpen(false);
      form.resetFields();
      fetchVendors();
    } catch (error) {
      console.error(error);
      message.error("Save failed");
    }
  };

  // ================= DELETE =================

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${BASE_URL}/vendors/${id}`);

      message.success("Vendor deleted successfully");

      fetchVendors();
    } catch (error) {
      console.error(error);
      message.error("Delete failed");
    }
  };

  // ================= COLUMNS =================

  const columns = [
    {
      title: "Vendor Name",
      dataIndex: "vendorName",
    },
    {
      title: "Mobile",
      dataIndex: "mobileNo",
    },
    {
      title: "GST No",
      dataIndex: "gstNo",
    },
    {
      title: "Payable GL",
      render: (_: any, record: Vendor) => {
        const gl = glList.find((g) => g.glCode === record.payableGlCode);
        return gl ? `${gl.glCode} - ${gl.accountName}` : record.payableGlCode;
      },
    },
    {
      title: "Address",
      dataIndex: "address",
    },
    {
      title: "Action",
      render: (_: any, record: Vendor) => (
        <Space>
          <Button type="primary" onClick={() => openModal(record)}>
            Edit
          </Button>

          <Popconfirm
            title="Delete Vendor?"
            onConfirm={() => handleDelete(record.id!)}
          >
            <Button type="primary" danger>
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
      {role === "ADMIN" ? <Sidebar /> : role === "MEMBER" ? <MemberSidebar /> : role=== "SUPER_ADMIN" ? <SuperAdminSidebar/> : <AuditorSidebar />}
    </Layout.Sider>

    {/* MAIN AREA */}
    <Layout style={{ minWidth: 0 }}>

      {/* HEADER (NO EXTRA DIV) */}
      {role === "ADMIN" ? <Header /> : role === "MEMBER" ? <MemberHeader /> : role=== "SUPER_ADMIN" ? <SuperAdminHeader/> : <AuditorHeader />}
      <Content >
    <div style={{ padding: 16 }}>
      <Card
        title="Vendor Master"
        extra={
          <Button type="primary" onClick={() => openModal()}>
            Add Vendor
          </Button>
        }
      >
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{pageSize: 8,}}
        />
      </Card>

      <Modal
        title={editing ? "Edit Vendor" : "Create Vendor"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="vendorName"
                label="Vendor Name"
                rules={[
                  {
                    required: true,
                    message: "Vendor Name is required",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="mobileNo" label="Mobile No">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="gstNo" label="GST No">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="payableGlCode"
                label="Payable GL Code"
                rules={[
                  {
                    required: true,
                    message: "Payable GL is required",
                  },
                ]}
              >
                <Select
                  placeholder="Select Payable GL Code"
                  showSearch
                  optionFilterProp="children"
                >
                  {glList.map((gl) => (
                    <Select.Option key={gl.glCode} value={gl.glCode}>
                      {gl.glCode} - {gl.accountName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Address">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
    </Content>
    </Layout>
    </Layout>
  );
};

export default Vendors;

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Space,
  Select,
  Row,
  Col,
  Grid,
} from "antd";

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

interface GlOpeningBalance {
  id?: number;
  societyId: number;
  financialYearId: number;
  glCode: number;
  // contraGlCode: number;
  openingDebit: number;
  openingCredit: number;
  openingBalance: number;
}

const GlOpeningBalance: React.FC = () => {
  const [data, setData] = useState<GlOpeningBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GlOpeningBalance | null>(null);
  const [glList, setGlList] = useState<any[]>([]);

  const [form] = Form.useForm();

  const debit = Form.useWatch("openingDebit", form);
  const credit = Form.useWatch("openingCredit", form);

  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
  const financialYear = sessionStorage.getItem("financialYear");
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  // ================= FETCH GL MASTER =================
  const fetchGlMaster = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/gl/master?societyId=${societyId}`,
      );
      setGlList(res.data || []);
    } catch {
      message.error("Failed to load GL Master");
    }
  };

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/gl/opening-balance?societyId=${societyId}`,
      );

      setData(res.data || []);
    } catch {
      message.error("Failed to load opening balances");
    } finally {
      setLoading(false);
    }
  };

  // ================= INITIAL LOAD =================
  useEffect(() => {
    fetchData();
    fetchGlMaster();
  }, []);

  // ================= AUTO CALCULATE BALANCE =================
  useEffect(() => {
    form.setFieldValue(
      "openingBalance",
      Number(debit || 0) - Number(credit || 0),
    );
  }, [debit, credit, form]);

  // ================= FORM INIT WHEN MODAL OPENS =================
  useEffect(() => {
    if (!open) return;

    if (editing) {
      form.setFieldsValue({
        financialYearId: editing.financialYearId,
        glCode: editing.glCode,
        // contraGlCode: editing.contraGlCode,
        openingDebit: editing.openingDebit,
        openingCredit: editing.openingCredit,
        openingBalance: editing.openingBalance,
      });
    } else {
      form.resetFields();

      form.setFieldsValue({
        financialYearId,
        openingDebit: 0,
        openingCredit: 0,
        openingBalance: null,
      });
    }
  }, [open, editing, financialYearId, form]);

  // ================= OPEN MODAL =================
  const openModal = (record?: GlOpeningBalance) => {
    setEditing(record || null);
    setOpen(true);
  };

  // ================= SAVE =================
  const handleSave = async (values: GlOpeningBalance) => {
    try {
      const payload = {
        societyId,
        financialYearId: values.financialYearId,
        glCode: values.glCode,
        openingDebit: Number(values.openingDebit || 0),
        openingCredit: Number(values.openingCredit || 0),
        // contraGlCode: values.contraGlCode,
        openingBalance:null
      };

      if (editing?.id) {
        await axios.put(
          `${BASE_URL}/gl/opening-balance/${editing.id}`,
          payload,
        );

        message.success("Updated successfully");
      } else {
        await axios.post(
          `${BASE_URL}/gl/opening-balance/save?societyId=${societyId}`,
          payload,
        );

        message.success("Created successfully");
      }

      form.resetFields();
      setEditing(null);
      setOpen(false);

      fetchData();
    } catch (error) {
      console.error(error);
      message.error("Save failed");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${BASE_URL}/gl/opening-balance/${id}`);

      message.success("Deleted successfully");
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("Delete failed");
    }
  };

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      title: "GL Account",
      key: "glAccount",
      render: (_: any, record: GlOpeningBalance) => {
        const gl = glList.find((g) => g.glCode === record.glCode);

        return `${record.glCode} - ${gl?.accountName || ""}`;
      },
    },
    {
      title: "Opening Debit",
      dataIndex: "openingDebit",
      key: "openingDebit",
    },
    {
      title: "Opening Credit",
      dataIndex: "openingCredit",
      key: "openingCredit",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: GlOpeningBalance) => (
        <Space wrap>
      <Button
        type="primary"
        onClick={() => openModal(record)}
      >
        Edit
      </Button>
          <Popconfirm
            title="Delete this record?"
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
    <div
      style={{
        padding: 16,
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <Button
        type="primary"
        onClick={() => openModal()}
        block={screens.xs}
        style={{ marginBottom: 16 }}
      >
        Add Opening Balance
      </Button>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 800 }}
        size="small"
        pagination={{
          pageSize: 8,
        }}
      />

      <Modal
        title={editing ? "Edit Opening Balance" : "Add Opening Balance"}
        open={open}
        width={screens.xs ? "95%" : 700}
        style={{ top: 20 }}
        onCancel={() => {
          form.resetFields();
          setEditing(null);
          setOpen(false);
        }}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="financialYearId" hidden rules={[{ required: true }]}>
            <InputNumber />
          </Form.Item>

          <Form.Item label="Financial Year">
            <Input value={financialYear || ""} disabled />
          </Form.Item>

          <Form.Item
            name="glCode"
            label="GL Account"
            rules={[
              {
                required: true,
                message: "Please select GL Account",
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Select GL Account"
              optionFilterProp="children"
            >
              {glList.map((gl) => (
                <Select.Option key={gl.glCode} value={gl.glCode}>
                  {gl.glCode} - {gl.accountName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>


          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="openingDebit" label="Opening Debit">
                <InputNumber
                  style={{ width: "100%" }}
                  controls={false}
                  min={0}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="openingCredit" label="Opening Credit">
                <InputNumber
                  style={{ width: "100%" }}
                  controls={false}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>
          {/* <Form.Item
            name="contraGlCode"
            label="Contra GL Account"
            rules={[
              {
                required: true,
                message: "Please select Contra GL",
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Select Contra GL"
              optionFilterProp="children"
            >
              {glList.map((gl) => (
                <Select.Option key={gl.glCode} value={gl.glCode}>
                  {gl.glCode} - {gl.accountName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item> */}


        </Form>
      </Modal>
    </div>
  );
};

export default GlOpeningBalance;

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
} from "antd";
import axios from "axios";

interface GlOpeningBalance {
  id?: number;
  societyId: number;
  financialYearId: number;
  glCode: number;
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

  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
  const financialYear = sessionStorage.getItem("financialYear");

  const fetchGlMaster = async () => {
    try {
      const res = await axios.get(
        `http://localhost:7777/api/gl/master?societyId=${societyId}`,
      );
      setGlList(res.data || []);
    } catch {
      message.error("Failed to load GL Master");
    }
  };

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:7777/api/gl/opening-balance?societyId=${societyId}`,
      );
      setData(res.data || []);
    } catch {
      message.error("Failed to load opening balances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchGlMaster();
  }, []);

  // ================= OPEN MODAL =================
  const openModal = (record?: GlOpeningBalance) => {
    setEditing(record || null);
    setOpen(true);

    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();

      // 👇 auto set financial year here
      form.setFieldsValue({
        financialYearId: financialYearId,
      });
    }
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
        openingBalance:
            Number(values.openingDebit || 0) - Number(values.openingCredit || 0),
        };

      if (editing?.id) {
        await axios.put(
          `http://localhost:7777/api/gl/opening-balance/${editing.id}`,
          payload,
        );
        message.success("Updated successfully");
      } else {

        console.log("Payload",payload);

        await axios.post(
          "http://localhost:7777/api/gl/opening-balance",
          payload,
        );
        message.success("Created successfully");
      }

      setOpen(false);
      fetchData();
    } catch {
      message.error("Save failed");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:7777/api/gl/opening-balance/${id}`);
      message.success("Deleted successfully");
      fetchData();
    } catch {
      message.error("Delete failed");
    }
  };

  // ================= TABLE =================
  const columns = [
    {
      title: "GL Code",
      dataIndex: "glCode",
      key: "glCode",
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
      title: "Opening Balance",
      dataIndex: "openingBalance",
      key: "openingBalance",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: GlOpeningBalance) => (
        <Space>
          <Button type="link" onClick={() => openModal(record)}>
            Edit
          </Button>

          <Popconfirm
            title="Delete this record?"
            onConfirm={() => handleDelete(record.id!)}
          >
            <Button danger type="link">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={() => openModal()}
        style={{ marginBottom: 16 }}
      >
        Add Opening Balance
      </Button>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
      />

      {/* ================= MODAL ================= */}
      <Modal
        title={editing ? "Edit Opening Balance" : "Add Opening Balance"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="financialYearId"
            label="Financial Year ID"
            rules={[{ required: true }]}
            hidden
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Financial Year">
            <Input value={financialYear || ""} disabled />
          </Form.Item>

          <Form.Item
            name="glCode"
            label="GL Account"
            rules={[{ required: true, message: "Select GL Account" }]}
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

          <Form.Item name="openingDebit" label="Opening Debit">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="openingCredit" label="Opening Credit">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="openingBalance" label="Opening Balance">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GlOpeningBalance;

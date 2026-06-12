import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  Popconfirm,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface GlMaster {
  glCode: number;
  accountName: string;
  groupName: string;
  accountType: string;
  parentGlCode?: number | null;
  isActive: boolean;
  societyId: number;
}

const emptyForm: GlMaster = {
  glCode: 0,
  accountName: "",
  groupName: "",
  accountType: "",
  parentGlCode: null,
  isActive: true,
  societyId: 1,
};

const GlMaster: React.FC = () => {
  const [data, setData] = useState<GlMaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GlMaster | null>(null);
  const BASE_URL = import.meta.env.VITE_API_URL;
  const [form] = Form.useForm();
  const societyId = Number(sessionStorage.getItem("societyId"));

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/gl/master?societyId=${societyId}`,
      );

      const responseData = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setData(responseData);

    } catch (err) {
      console.error(err);
      message.error("Failed to load GL Master");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();

    form.setFieldsValue({
      isActive: true,
      societyId: 1,
    });

    setOpen(true);
  };

  const handleEdit = (record: GlMaster) => {
    setEditing(record);

    form.setFieldsValue(record);

    setOpen(true);
  };

  const handleDelete = async (glCode: number) => {
    try {
      await axios.delete(
        `${BASE_URL}/gl/master/${glCode}?societyId=${societyId}`,
      );
      message.success("Deleted Successfully");

      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Delete Failed");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      values.societyId = societyId;

      if (editing) {
        await axios.put(`${BASE_URL}/gl/master/${editing.glCode}`, values, {
          params: {
            societyId,
          },
        });

        message.success("Updated Successfully");
      } else {
        await axios.post(`${BASE_URL}/gl/master`, values);

        message.success("Saved Successfully");
      }

      setOpen(false);

      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    {
      title: "GL Code",
      dataIndex: "glCode",
      key: "glCode",
    },
    {
      title: "Account Name",
      dataIndex: "accountName",
      key: "accountName",
    },
    {
      title: "Group Name",
      dataIndex: "groupName",
      key: "groupName",
    },
    {
      title: "Account Type",
      dataIndex: "accountType",
      key: "accountType",
    },
    {
      title: "Parent GL",
      dataIndex: "parentGlCode",
      key: "parentGlCode",
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (value: boolean) => (value ? "Yes" : "No"),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: GlMaster) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Edit
          </Button>

          <Popconfirm
            title="Delete Record?"
            onConfirm={() => handleDelete(record.glCode)}
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
        height: "calc(100vh - 180px)", // adjust 120px for your header/navbar
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2>GL Master</h2>

        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add GL
        </Button>
      </div>

      <Table
        rowKey="glCode"
        loading={loading}
        columns={columns}
        dataSource={data}
        bordered
        size="small"
        scroll={{ y: "calc(100vh - 240px)" }}
        pagination={{
          pageSize: 8,
        }}
      />

      <Modal
        title={editing ? "Edit GL" : "Add GL"}
        open={open}
        onOk={handleSubmit}
        onCancel={() => setOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="GL Code"
            name="glCode"
            rules={[
              {
                required: true,
                message: "GL Code Required",
              },
            ]}
          >
            <Input type="number" disabled={!!editing} />
          </Form.Item>

          <Form.Item
            label="Account Name"
            name="accountName"
            rules={[
              {
                required: true,
                message: "Account Name Required",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Group Name"
            name="groupName"
            rules={[
              {
                required: true,
                message: "Group Name Required",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Account Type"
            name="accountType"
            rules={[
              {
                required: true,
                message: "Select Account Type",
              },
            ]}
          >
            <Select>
              <Select.Option value="ASSET">ASSET</Select.Option>

              <Select.Option value="LIABILITY">LIABILITY</Select.Option>

              <Select.Option value="INCOME">INCOME</Select.Option>

              <Select.Option value="EXPENSE">EXPENSE</Select.Option>

              <Select.Option value="EQUITY">EQUITY</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Parent GL Code" name="parentGlCode">
            <Input type="number" />
          </Form.Item>

          <Form.Item label="Society Id" name="societyId" hidden>
            <Input />
          </Form.Item>

          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GlMaster;

import { Button, Card, Col, Form, Input, message, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../api/axios";
import { focusNext } from "../../utils/FocusNext";

interface FlatFormValues {
  flatNo: string;
  floorNo: string;
  areaSqFt: number;
  bedrooms: number;
  maintenanceAmount: number;
  status: boolean;
  societyId: number;
  wingId: number;
  ownerId: number;
}

const CreateFlat: React.FC = () => {
  const [form] = Form.useForm<FlatFormValues>();

  const [wings, setWings] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const societyId = sessionStorage.getItem("societyId");

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      const [wingRes, memberRes] = await Promise.all([
        apiGet(`/wings?societyId=${societyId}`),
        apiGet(`/members?societyId=${societyId}`),
      ]);

      setWings(wingRes || []);
      setMembers(memberRes || []);
    } catch (err) {
      message.error("Failed to load dropdowns");
    }
  };

  const onFinish = async (values: FlatFormValues) => {
    try {
      if (!societyId) {
        message.error("Society not found in session");
        return;
      }

      const payload = {
        flatNo: values.flatNo,
        floorNo: values.floorNo,
        areaSqFt: values.areaSqFt,
        bedrooms: values.bedrooms,
        maintenanceAmount: values.maintenanceAmount,
        status: values.status,

        society: { id: Number(societyId) },
        wing: { id: values.wingId },
        owner: { id: values.ownerId },
      };
      await apiPost("/flats", payload);
      message.success("Flat created successfully");
      form.resetFields();
    } catch (err) {
      message.error("Failed to create flat");
    }
  };

  return (
    <Card title="Create Flat" style={{ marginBottom: 20 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          status: true,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Flat No"
              name="flatNo"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter flat no" onPressEnter={focusNext} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Floor No"
              name="floorNo"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter floor no" onPressEnter={focusNext} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Area (Sq Ft)"
              name="areaSqFt"
            >
              <Input type="number" onPressEnter={focusNext} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Bedrooms"
              name="bedrooms"
            >
              <Input type="number" onPressEnter={focusNext} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Maintenance Amount"
              name="maintenanceAmount"
            >
              <Input type="number" onPressEnter={focusNext} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Status"
              name="status"
            >
              <Select onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
                <Select.Option value={true}>Active</Select.Option>
                <Select.Option value={false}>Inactive</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Wing"
              name="wingId"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select wing">
                {wings.map((w) => (
                  <Select.Option key={w.id} value={w.id}>
                    {w.wingName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Owner"
              name="ownerId"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select owner">
                {members.map((m) => (
                  <Select.Option key={m.id} value={m.id}>
                    {m.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Button type="primary" htmlType="submit">
          Save Flat
        </Button>
      </Form>
    </Card>
  );
};

export default CreateFlat;
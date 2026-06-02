import { Button, Card, Col,  Form, Input, message, Row, Select } from "antd";
import React, { useEffect } from "react";
import { apiGet, apiPost } from "../../api/axios";
import { focusNext } from "../../utils/FocusNext";
import { useNavigate } from "react-router-dom";

interface WingFormValues {
  description: string;
  wingName: string;
  active: boolean;
  total_flats: number;
  total_floors: number;
  societyId: number;
}

const CreateWings: React.FC = () => {
  const [form] = Form.useForm<WingFormValues>();
  const [wings, setWings] = React.useState<any[]>([]);

  const societyId = sessionStorage.getItem("societyId");

  const navigate = useNavigate();
  useEffect(() => {
    loadWings();
  }, []);

  const loadWings = async () => {
    try {
      const res = await apiGet("/wings");
      setWings(res);
    } catch (err) {
      message.error("Failed to load wings");
    }
  };

    const handleSelectEnter = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();

      const form = e.target.form;
      const elements = Array.from(form.elements) as HTMLElement[];

      const index = elements.indexOf(e.target);
      const next = elements[index + 1];

      if (next) next.focus();
    }
  };

  const onFinish = async (values: WingFormValues) => {
    try {
      if (!societyId) {
        message.error("Society not found in session");
        return;
      }
      const payload = {
        description: values.description,
        wingName: values.wingName,
        active: values.active,
        total_flats: values.total_flats,
        total_floors: values.total_floors,
        society: { id: Number(societyId) },
      };
      await apiPost("/wings", payload);
      message.success("Wing created successfully");
      form.resetFields();
      loadWings();
      navigate("/wings");
    } catch (err) {
      message.error("Failed to create wing");
    }
  };

return (
    <Card title="Create Wing" style={{ marginBottom: 20 }}>

    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        active: true,
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Wing Name"
            name="wingName"
            rules={[{ required: true, message: "Enter wing name" }]}
          >
            <Input
              placeholder="Enter wing name"
              onPressEnter={focusNext}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Description"
            name="description"
          >
            <Input
              placeholder="Enter description"
              onPressEnter={focusNext}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Total Floors"
            name="total_floors"
            rules={[{ required: true, message: "Enter total floors" }]}
          >
            <Input
              type="number"
              placeholder="Enter total floors"
              onPressEnter={focusNext}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Total Flats"
            name="total_flats"
            rules={[{ required: true, message: "Enter total flats" }]}
          >
            <Input
              type="number"
              placeholder="Enter total flats"
              onPressEnter={focusNext}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Status"
            name="active"
            rules={[{ required: true, message: "Select status" }]}
          >
            <Select
              placeholder="Select status"
              onKeyDown={handleSelectEnter}
            >
              <Select.Option value={true}>Active</Select.Option>
              <Select.Option value={false}>Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Button type="primary" htmlType="submit">
        Save Wing
      </Button>
      <Button
          type="default"
          size="medium"
          style={{ marginLeft: 8 }}
          onClick={() => navigate("/wings")}
        >
          Cancel
        </Button>
    </Form>
  </Card>
);


};

export default CreateWings;

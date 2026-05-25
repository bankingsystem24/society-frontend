// src/pages/wings/EditWing.tsx

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Spin,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut } from "../../api/axios";
import { focusNext } from "../../utils/FocusNext";

interface WingFormValues {
  description: string;
  wingName: string;
  active: boolean;
  total_flats: number;
  total_floors: number;
}

const EditWing: React.FC = () => {
  const [form] = Form.useForm<WingFormValues>();

  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWing();
  }, []);

  const loadWing = async () => {
    try {
      setLoading(true);

      const res = await apiGet(`/wings/${id}`);

      form.setFieldsValue({
        wingName: res.wingName,
        description: res.description,
        active: res.active,
        total_flats: res.total_flats,
        total_floors: res.total_floors,
      });
    } catch (err) {
      console.error(err);
      message.error("Failed to load wing");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEnter = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();

      const formEl = e.target.form;
      const elements = Array.from(formEl.elements) as HTMLElement[];

      const index = elements.indexOf(e.target);
      const next = elements[index + 1];

      if (next) next.focus();
    }
  };

  const onFinish = async (values: WingFormValues) => {
    try {
      setSaving(true);

      const societyId = sessionStorage.getItem("societyId");

      const payload = {
        description: values.description,
        wingName: values.wingName,
        active: values.active,
        total_flats: values.total_flats,
        total_floors: values.total_floors,
        society: {
          id: Number(societyId),
        },
      };
      await apiPut(`/wings/${id}`, payload);

      message.success("Wing updated successfully");

      navigate("/wings");

    } catch (err) {
      console.error(err);
      message.error("Failed to update wing");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Edit Wing" style={{ marginBottom: 20 }}>
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Wing Name"
                name="wingName"
                rules={[
                  { required: true, message: "Enter wing name" },
                ]}
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
                rules={[
                  { required: true, message: "Enter total floors" },
                ]}
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
                rules={[
                  { required: true, message: "Enter total flats" },
                ]}
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
                rules={[
                  { required: true, message: "Select status" },
                ]}
              >
                <Select
                  placeholder="Select status"
                  onKeyDown={handleSelectEnter}
                >
                  <Select.Option value={true}>
                    Active
                  </Select.Option>

                  <Select.Option value={false}>
                    Inactive
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
            >
              Update Wing
            </Button>

            <Button
              onClick={() => navigate("/wings")}
            >
              Cancel
            </Button>
          </Space>
        </Form>
      </Spin>
    </Card>
  );
};

export default EditWing;
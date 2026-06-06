import React, { useEffect, useState } from "react";
import {
  Form,
  InputNumber,
  Button,
  Card,
  Select,
  message,
  Row,
  Col,
  Input,
  Popconfirm,
} from "antd";

import { apiGet, apiPost, apiDelete } from "../../api/axios";

const { Option } = Select;
const BASE_URL = import.meta.env.VITE_API_URL;

const BillingPolicy: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [policyId, setPolicyId] = useState<number | null>(null);

  const societyId = Number(sessionStorage.getItem("societyId"));
  const societyName = sessionStorage.getItem("societyName");

  useEffect(() => {
    form.setFieldsValue({
      societyId,
      graceDays: 0,
      interestRate: 0,
      interestType: "MONTHLY",
      penaltyType: "FIXED",
      penaltyValue: 0,
    });

    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    try {
      const data = await apiGet(
        `/billing-policy/society/${societyId}`
      );

      if (data) {
        setPolicyId(data.id);

        form.setFieldsValue({
          societyId: data.society?.id,
          billingDay: data.billingDay,
          graceDays: data.graceDays,
          interestRate: data.interestRate,
          interestType: data.interestType,
          penaltyType: data.penaltyType,
          penaltyValue: data.penaltyValue,
        });
      }
    } catch (error) {
      console.error("No billing policy found");
      setPolicyId(null);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const payload = {
        id: policyId,
        societyId,
        billingDay: values.billingDay,
        graceDays: values.graceDays,
        interestRate: values.interestRate,
        interestType: values.interestType,
        penaltyType: values.penaltyType,
        penaltyValue: values.penaltyValue,
      };

      await apiPost("/billing-policy", payload);

      message.success(
        policyId
          ? "Billing policy updated successfully"
          : "Billing policy saved successfully"
      );

      await loadPolicy();
    } catch (error) {
      console.error(error);
      message.error("Failed to save billing policy");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!policyId) return;

      await apiDelete(`/billing-policy/${policyId}`);

      message.success("Billing policy deleted successfully");

      setPolicyId(null);

      form.resetFields();

      form.setFieldsValue({
        societyId,
        graceDays: 0,
        interestRate: 0,
        interestType: "MONTHLY",
        penaltyType: "FIXED",
        penaltyValue: 0,
      });
    } catch (error) {
      console.error(error);
      message.error("Failed to delete billing policy");
    }
  };

  return (
    <Card
      title={
        policyId
          ? "Edit Billing Policy"
          : "Create Billing Policy"
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item name="societyId" hidden>
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Society">
              <Input
                value={societyName || ""}
                disabled
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Billing Day"
              name="billingDay"
              rules={[
                {
                  required: true,
                  message: "Billing day is required",
                },
              ]}
            >
              <InputNumber
                min={1}
                max={31}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Grace Days"
              name="graceDays"
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Interest Rate (%)"
              name="interestRate"
            >
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Interest Type"
              name="interestType"
            >
              <Select>
                <Option value="MONTHLY">
                  Monthly
                </Option>
                <Option value="QUARTERLY">
                  Quarterly
                </Option>
                <Option value="ANNUAL">
                  Annual
                </Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Penalty Type"
              name="penaltyType"
            >
              <Select>
                <Option value="FIXED">
                  Fixed Amount
                </Option>
                <Option value="PERCENTAGE">
                  Percentage
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Penalty Value"
              name="penaltyValue"
            >
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              {policyId
                ? "Update Policy"
                : "Save Policy"}
            </Button>
          </Col>

          {policyId && (
            <Col>
              <Popconfirm
                title="Delete Billing Policy?"
                description="This action cannot be undone."
                onConfirm={handleDelete}
              >
                <Button danger>
                  Delete
                </Button>
              </Popconfirm>
            </Col>
          )}
        </Row>
      </Form>
    </Card>
  );
};

export default BillingPolicy;
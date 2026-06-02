import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Select,
  Row,
  Col,
  Space,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut } from "../../../api/axios";

const { Option } = Select;

const SuperAdminEditSociety: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [auditors, setAuditors] = useState<any[]>([]);

  // Load society by ID
  const fetchSociety = async () => {
    try {
      setLoading(true);

      const res = await apiGet(`/societies/${id}`);

      form.setFieldsValue({
        societyName: res.societyName,
        registrationNumber: res.registrationNumber,
        address: res.address,
        city: res.city,
        state: res.state,
        country: res.country,
        pinCode: res.pinCode,
        email: res.email,
        mobile: res.mobile,
        secretaryName: res.secretaryName,
        auditorId: res.auditor?.id,
      });
    } catch (error) {
      console.error("Error loading society:", error);
      message.error("Failed to load society");
    } finally {
      setLoading(false);
    }
  };

  // Load auditors
  const fetchAuditors = async () => {
    try {
      const res = await apiGet("/users");

      const auditorList = (res || []).filter((u: any) => u.role === "AUDITOR");

      setAuditors(auditorList);
    } catch (error) {
      console.error("Error loading auditors:", error);
    }
  };

  useEffect(() => {
    fetchSociety();
    fetchAuditors();
  }, []);

  // UPDATE
  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const payload = {
        societyName: values.societyName,
        registrationNumber: values.registrationNumber,
        address: values.address,
        city: values.city,
        state: values.state,
        country: values.country,
        pinCode: values.pinCode,
        email: values.email,
        mobile: values.mobile,
        secretaryName: values.secretaryName,
        auditor: {
          id: values.auditorId,
        },
      };
     
      await apiPut(`/societies/${id}`, payload);

      message.success("Society updated successfully");

      navigate("/superadmin-view-societies");
    } catch (error) {
      console.error("Update error:", error);
      message.error("Failed to update society");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Edit Society" style={{ margin: "auto" }}>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Society Name"
              name="societyName"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Registration Number" name="registrationNumber">
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Address" name="address">
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="City" name="city">
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="State" name="state">
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Country" name="country">
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Pin Code" name="pinCode">
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Email" name="email">
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Mobile" name="mobile">
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Secretary Name" name="secretaryName">
              <Input />
            </Form.Item>
          </Col>

          {/* AUDITOR */}
          <Col xs={24}>
            <Form.Item label="Assign Auditor" name="auditorId">
              <Select placeholder="Select Auditor">
                {auditors.map((a) => (
                  <Option key={a.id} value={a.id}>
                    {a.username}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* BUTTON */}
          <Col xs={24}>
            <Form.Item>
              <Space style={{ width: "100%", justifyContent: "center" }}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update Society
                </Button>

                <Button danger onClick={() => navigate("/superadmin-view-societies")}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default SuperAdminEditSociety;

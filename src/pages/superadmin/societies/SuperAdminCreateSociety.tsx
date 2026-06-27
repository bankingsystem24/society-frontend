import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Select,
  Col,
  Row,
  Space,
  Switch,
} from "antd";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../../api/axios";

const { Option } = Select;

const SuperAdminCreateSociety: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [auditors, setAuditors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load auditors
  useEffect(() => {
    fetchAuditors();
  }, []);

  const fetchAuditors = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/users");
      const auditorList = (res || []).filter((u: any) => u.role === "AUDITOR");
      setAuditors(auditorList);
    } catch (error) {
      console.error("Error loading auditors", error);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
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
      upi1: values.upi1,
      upi2: values.upi2,
      upi1Active: values.upi1Active,
      upi2Active: values.upi2Active,
      auditor: {
        id: values.auditorId,
      },
    };

    try {
      setLoading(true);
      const createSociety = await apiPost("/societies", payload);
      const newSocietyId = createSociety.id;
      if(newSocietyId){
        const defaultGl = await apiPost("/gl/master/defaultgl",newSocietyId);
      }
      message.success("Society created successfully");
      form.resetFields();
      navigate("/superadmin-view-societies");
    } catch (error) {
      console.error("Error creating society:", error);
      message.error("Failed to create society");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create Society" style={{ margin: "auto" }}>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} md={6}>
            <Form.Item
              label="Society Name"
              name="societyName"
              rules={[{ required: true, message: "Enter society name" }]}
            >
              <Input placeholder="Enter society name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item label="Registration Number" name="registrationNumber">
              <Input placeholder="Enter registration number" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label="Address" name="address">
              <Input placeholder="Enter address" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item label="City" name="city">
              <Input placeholder="Enter city" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item label="State" name="state">
              <Input placeholder="Enter state" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item label="Country" name="country">
              <Input placeholder="Enter country" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item label="Pin Code" name="pinCode">
              <Input placeholder="Enter pin code" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label="Email" name="email">
              <Input placeholder="Enter email" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item label="Mobile" name="mobile">
              <Input placeholder="Enter mobile number" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item label="Secretary Name" name="secretaryName">
              <Input placeholder="Enter secretary name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label="Upi1" name="upi1">
              <Input placeholder="Enter UPI Id1" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              label="Is Active"
              name="upi1Active"
              valuePropName="checked"
            >
              <Switch
                onChange={(checked) => {
                  if (checked) {
                    form.setFieldsValue({
                      upi2Active: false,
                    });
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item label="Upi2" name="upi2">
              <Input placeholder="Enter UPI Id2" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              label="Is Active"
              name="upi2Active"
              valuePropName="checked"
            >
              <Switch
                onChange={(checked) => {
                  if (checked) {
                    form.setFieldsValue({
                      upi1Active: false,
                    });
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              label="Assign Auditor"
              name="auditorId"
              rules={[{ required: true, message: "Select auditor" }]}
            >
              <Select placeholder="Select Auditor" loading={loading}>
                {auditors.map((a) => (
                  <Option key={a.id} value={a.id}>
                    {a.username}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item>
              <Space style={{ width: "100%", justifyContent: "center" }}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Save Society
                </Button>

                <Button
                  danger
                  onClick={() => navigate("/superadmin-view-societies")}
                >
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

export default SuperAdminCreateSociety;

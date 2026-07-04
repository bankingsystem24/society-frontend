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
  Switch,
  Layout,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut } from "../../../api/axios";
import Header from "../../../components/layout/Header";
import AuditorHeader from "../../../components/layout/AuditorHeader";
import AuditorSidebar from "../../../components/layout/AuditorSidebar";
import MemberHeader from "../../../components/layout/MemberHeader";
import MemberSidebar from "../../../components/layout/MemberSidebar";
import Sidebar from "../../../components/layout/Sidebar";
import SuperAdminHeader from "../../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../../components/layout/SuperAdminSidebar";

const { Option } = Select;
const { Content } = Layout;
const role = sessionStorage.getItem("role");

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
        upi1: res.upi1,
        upi2: res.upi2,
        upi1Active: res.upi1Active,
        upi2Active: res.upi2Active,
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
        upi1: values.upi1,
        upi2: values.upi2,
        upi1Active: values.upi1Active,
        upi2Active: values.upi2Active,
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
          <Col xs={24} md={6}>
            <Form.Item
              label="Society Name"
              name="societyName"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>

                <Col xs={24} md={6}>
                  <Form.Item
                    label="Registration Number"
                    name="registrationNumber"
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} md={6}>
                  <Form.Item label="Address" name="address">
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} md={6}>
                  <Form.Item label="City" name="city">
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} md={6}>
                  <Form.Item label="State" name="state">
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} md={6}>
                  <Form.Item label="Country" name="country">
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} md={6}>
                  <Form.Item label="Pin Code" name="pinCode">
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} md={6}>
                  <Form.Item label="Email" name="email">
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} md={6}>
                  <Form.Item label="Mobile" name="mobile">
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} md={6}>
                  <Form.Item label="Secretary Name" name="secretaryName">
                    <Input />
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

                {/* AUDITOR */}
                <Col xs={24} md={6}>
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
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                      >
                        Update Society
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

export default SuperAdminEditSociety;

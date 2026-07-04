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
  Layout,
  Switch,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut } from "../../api/axios";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";
import axios from "axios";


const { Option } = Select;
const { Content } = Layout;
const role = sessionStorage.getItem("role");
const BASE_URL = import.meta.env.VITE_API_URL;
const societyId = sessionStorage.getItem("societyId") || "";
const mappedBank = sessionStorage.getItem("GlBankAccount") || "";

const SuperAdminEditSociety: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [auditors, setAuditors] = useState<any[]>([]);

  useEffect(() => {
    fetchSociety();
    fetchAuditors();
    loadGlMapping();
  }, []);

  const loadGlMapping = async () => {
  try {
    const response = await apiGet(`/gl/master/mapping?societyId=${societyId}`);
    const mappedGlCode=response.find((item:any)=>item.description?.trim().toLowerCase() === "bank account")?.gl_receivable ?? "";
    const glres = await apiGet(`/gl/master/${mappedGlCode}`);
    const glName = glres[0]?.accountName || "";
    form.setFieldsValue({mappedBank: glName, });


  } catch (err) {
    console.error(err);
  }
};

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
        upi1Active: res.upi1Active,
        mappedBank:res.mappedBank,
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
        upi1: values.upi1,
        upi1Active: values.upi1Active,
        mappedBank: values.mappedBank,
        auditor: {
          id: values.auditorId,
        },
      };

      await apiPut(`/societies/${id}`, payload);

      message.success("Society updated successfully");

      navigate("/societies");
    } catch (error) {
      console.error("Update error:", error);
      message.error("Failed to update society");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider
        width={role === "MEMBER" ? 200 : 250}
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          height: "100vh",
          position: "sticky",
          top: 0,
          overflowY: "auto",
        }}
      >
        {role === "ADMIN" ? (
          <Sidebar />
        ) : role === "MEMBER" ? (
          <MemberSidebar />
        ) : role === "SUPER_ADMIN" ? (
          <SuperAdminSidebar />
        ) : (
          <AuditorSidebar />
        )}
      </Layout.Sider>

      {/* MAIN AREA */}
      <Layout style={{ minWidth: 0 }}>
        {/* HEADER (NO EXTRA DIV) */}
        {role === "ADMIN" ? (
          <Header />
        ) : role === "MEMBER" ? (
          <MemberHeader />
        ) : role === "SUPER_ADMIN" ? (
          <SuperAdminHeader />
        ) : (
          <AuditorHeader />
        )}
        <Content>
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
                </Row>
                <Row gutter={16}>
                  <Col xs={24} md={6}>
                    <Form.Item label="Mapped Bank" name="mappedBank" >
                      <Input disabled />
                    </Form.Item>
                  </Col>                  
                  <Col xs={24} md={6}>
                    <Form.Item label="Upi" name="upi1">
                      <Input />
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
                        } else {
                          form.setFieldsValue({
                            upi2Active: true,
                          });
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                </Row>

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
                        onClick={() => navigate("/societies")}
                      >
                        Cancel
                      </Button>
                    </Space>
                  </Form.Item>
                </Col>
            </Form>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SuperAdminEditSociety;

import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  message,
  Row,
  Col,
  Layout
} from "antd";

import { apiGet, apiPost } from "../../api/axios";
import { focusNext } from "../../utils/FocusNext";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";

const {Content } = Layout;
const role = sessionStorage.getItem("role");

const CreateUser: React.FC = () => {
  const [form] = Form.useForm();
  const [members, setMembers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const societyId = sessionStorage.getItem("societyId");

      const res = await apiGet(
        `/members?societyId=${societyId}`
      );

      setMembers(res || []);
    } catch (error) {
      console.error("Error loading members", error);
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

  const onFinish = async (values: any) => {
    try {
      const societyId = sessionStorage.getItem("societyId");

      const payload = {
        name:values.name,
        username: values.username,
        password: values.password,
        email: values.email,
        mobile: values.mobile,
        role: values.role,
        active: true,
        society: {
          id: values.role === "AUDITOR" ? null : Number(societyId),
        },
        member: {
          id: values.memberId,
        },
      };

      await apiPost("/users", payload);

      message.success("User created successfully");
      form.resetFields();
      navigate("/users");

    } catch (error: any) {
      message.error(
        error?.response?.data?.message ||
        "Failed to create user"
      );
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
      {role === "ADMIN" ? <Sidebar /> : role === "MEMBER" ? <MemberSidebar /> : role=== "SUPER_ADMIN" ? <SuperAdminSidebar/> : <AuditorSidebar />}
    </Layout.Sider>

    {/* MAIN AREA */}
    <Layout style={{ minWidth: 0 }}>

      {/* HEADER (NO EXTRA DIV) */}
      {role === "ADMIN" ? <Header /> : role === "MEMBER" ? <MemberHeader /> : role=== "SUPER_ADMIN" ? <SuperAdminHeader/> : <AuditorHeader />}
      <Content >
    <Card title="Create User">
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
      >

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true }]}
            >
              <Input onPressEnter={focusNext} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true }]}
            >
              <Input onPressEnter={focusNext} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true },
                { type: "email" },
              ]}
            >
              <Input onPressEnter={focusNext} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Mobile"
              name="mobile"
              rules={[{ required: true }]}
            >
              <Input onPressEnter={focusNext} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Select Role"
                options={[
                  { label: "Admin", value: "ADMIN" },
                  { label: "Security", value: "SECURITY" },
                  { label: "Treasurer", value: "TREASURER" },
                  { label: "Secretary", value: "SECRETARY" },
                  { label: "Member", value: "MEMBER" },
                  { label: "Manager", value: "MANAGER" },
                  { label: "Auditor", value:"AUDITOR"},
                ]}
                onKeyDown={handleSelectEnter}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Member"
              name="memberId"
              rules={[]}
            >
              <Select
                placeholder="Select Member"
                options={members.map((m) => ({
                  label: m.name,
                  value: m.id,
                }))}
                onKeyDown={handleSelectEnter}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>

        <Button type="primary" htmlType="submit">
          Save User
        </Button>
        <Button type="default" style={{ marginLeft: 8 }} onClick={() => navigate("/users")}>
          Cancel
        </Button>
      </Form>
    </Card>
    </Content>
    </Layout>
    </Layout>
  );
};

export default CreateUser;
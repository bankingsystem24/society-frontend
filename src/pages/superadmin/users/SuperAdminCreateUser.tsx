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
} from "antd";

import { apiGet, apiPost } from "../../../api/axios";
import { focusNext } from "../../../utils/FocusNext";
import { useNavigate } from "react-router-dom";

const SuperAdminCreateUser: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [societies, setSocieties] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    loadSocieties();
  }, []);

  const loadSocieties = async () => {
    try {
      const res = await apiGet("/societies");
      setSocieties(res || []);
    } catch (error) {
      console.error("Error loading societies", error);
    }
  };

  const loadMembers = async (societyId: number) => {
    try {
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
      const payload = {
        username: values.username,
        password: values.password,
        email: values.email,
        mobile: values.mobile,
        role: values.role,
        active: true,
        name:values.name,
        society: values.societyId
          ? {
              id: values.societyId,
            }
          : {
              id: 0,
            },

        member: values.memberId
          ? {
              id: values.memberId,
            }
          : null,
      };

      await apiPost("/users", payload);

      message.success("User created successfully");

      form.resetFields();
      setMembers([]);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ||
          "Failed to create user"
      );
    }
    navigate("/superadminusers");
  };

  return (
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
              rules={[
                {
                  required: true,
                  message: "Please enter username",
                },
              ]}
            >
              <Input onPressEnter={focusNext} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please enter name",
                },
              ]}
            >
              <Input onPressEnter={focusNext} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please enter email",
                },
                {
                  type: "email",
                  message: "Enter valid email",
                },
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
              rules={[
                {
                  required: true,
                  message: "Please enter mobile",
                },
              ]}
            >
              <Input onPressEnter={focusNext} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Role"
              name="role"
              rules={[
                {
                  required: true,
                  message: "Please select role",
                },
              ]}
            >
              <Select
                placeholder="Select Role"
                onKeyDown={handleSelectEnter}
                options={[
                  { label: "Admin", value: "ADMIN" },
                  { label: "Security", value: "SECURITY" },
                  { label: "Treasurer", value: "TREASURER" },
                  { label: "Secretary", value: "SECRETARY" },
                  { label: "Manager", value: "MANAGER" },
                  { label: "Member", value: "MEMBER" },
                  { label: "Auditor", value: "AUDITOR" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Society"
              name="societyId"
              rules={[
                {
                  required: false,
                  message: "Please select society",
                },
              ]}
            >
              <Select
                placeholder="Select Society"
                onKeyDown={handleSelectEnter}
                options={societies.map((s) => ({
                  label: s.societyName,
                  value: s.id,
                }))}
                onChange={(value) => {
                  form.setFieldValue("memberId", undefined);
                  loadMembers(value);
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Member"
              name="memberId"
            >
              <Select
                allowClear
                placeholder="Select Member (Optional)"
                onKeyDown={handleSelectEnter}
                options={members.map((m) => ({
                  label: m.name,
                  value: m.id,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please enter password",
                },
              ]}
            >
              <Input.Password onPressEnter={focusNext} />
            </Form.Item>
          </Col>
        </Row>

        <Button type="primary" htmlType="submit">
          Save User
        </Button>
        <Button type="default" onClick={() => navigate("/superadminusers")} style={{ marginLeft: 8 }}>
          Cancel
        </Button>
      </Form>
    </Card>
  );
};

export default SuperAdminCreateUser;
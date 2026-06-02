// src/pages/users/EditUser.tsx

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
  Spin,
  Space,
} from "antd";

import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut } from "../../api/axios";
import { focusNext } from "../../utils/FocusNext";

const EditUser: React.FC = () => {
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const { id } = useParams();

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMembers();
    loadUser();
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

  const loadUser = async () => {
    try {
      setLoading(true);

      const res = await apiGet(`/users/${id}`);

      form.setFieldsValue({
        name:res.name,
        username: res.username,
        email: res.email,
        mobile: res.mobile,
        role: res.role,
        memberId: res.memberId,
        active: res.active,
      });

    } catch (error) {
      console.error(error);
      message.error("Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEnter = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();

      const formEl = e.target.form;

      const elements = Array.from(
        formEl.elements
      ) as HTMLElement[];

      const index = elements.indexOf(e.target);
      const next = elements[index + 1];

      if (next) next.focus();
    }
  };

  const onFinish = async (values: any) => {
    try {
      setSaving(true);

      const societyId = sessionStorage.getItem("societyId");

      const payload = {
        name:values.name,
        username: values.username,
        password: values.password,
        email: values.email,
        mobile: values.mobile,
        role: values.role,
        active: values.active,

        society: {
          id: Number(societyId),
        },

        member: values.memberId
          ? {
              id: values.memberId,
            }
          : null,
      };

      await apiPut(`/users/${id}`, payload);

      message.success("User updated successfully");

      navigate("/users");

    } catch (error: any) {
      console.error(error);

      message.error(
        error?.response?.data?.message ||
          "Failed to update user"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Edit User">
      <Spin spinning={loading}>
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true }]}>
                <Input onPressEnter={focusNext} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true }]}
              >
                <Input onPressEnter={focusNext} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
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
            <Col xs={24} md={12}>
              <Form.Item
                label="Mobile"
                name="mobile"
                rules={[{ required: true }]}
              >
                <Input onPressEnter={focusNext} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Role"
                name="role"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Select Role"
                  onKeyDown={handleSelectEnter}
                  options={[
                    {
                      label: "Admin",
                      value: "ADMIN",
                    },
                    {
                      label: "Security",
                      value: "SECURITY",
                    },
                    {
                      label: "Treasurer",
                      value: "TREASURER",
                    },
                    {
                      label: "Secretary",
                      value: "SECRETARY",
                    },
                    {
                      label: "Member",
                      value: "MEMBER",
                    },
                    {
                      label: "Manager",
                      value: "MANAGER",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Member"
                name="memberId"
              >
                <Select
                  placeholder="Select Member"
                  onKeyDown={handleSelectEnter}
                  options={members.map((m) => ({
                    label: m.name,
                    value: m.id,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Password"
                name="password"
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Status"
                name="active"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Select Status"
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
              Update User
            </Button>

            <Button
              onClick={() => navigate("/users")}
            >
              Cancel
            </Button>
          </Space>
        </Form>
      </Spin>
    </Card>
  );
};

export default EditUser;
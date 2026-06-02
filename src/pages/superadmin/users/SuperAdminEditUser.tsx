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
import { apiGet, apiPut } from "../../../api/axios";
import { focusNext } from "../../../utils/FocusNext";

const SuperAdminEditUser: React.FC = () => {
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const { id } = useParams();

  const [societies, setSocieties] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSocieties();
    loadUser();
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

  const loadUser = async () => {
    try {
      setLoading(true);

      const res = await apiGet(`/users/${id}`);

      form.setFieldsValue({
        username: res.username,
        name: res.name,
        email: res.email,
        mobile: res.mobile,
        role: res.role,
        memberId: res.memberId,
        societyId: res.societyId,
        active: res.active,
      });

      if (res.societyId) {
        await loadMembers(res.societyId);
      }
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

      const payload = {
        username: values.username,
        password: values.password,
        email: values.email,
        mobile: values.mobile,
        role: values.role,
        active: values.active,
        name: values.name,

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

      await apiPut(`/users/${id}`, payload);

      message.success("User updated successfully");

      navigate("/superadminusers");
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
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
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
            <Col xs={24} md={12}>
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
            <Col xs={24} md={12}>
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
                    message: "Please enter valid email",
                  },
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

            <Col xs={24} md={12}>
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
                      label: "Manager",
                      value: "MANAGER",
                    },
                    {
                      label: "Member",
                      value: "MEMBER",
                    },
                    {
                      label: "Auditor",
                      value: "AUDITOR",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
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
                    form.setFieldValue(
                      "memberId",
                      undefined
                    );

                    loadMembers(value);
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Member"
                name="memberId"
              >
                <Select
                  allowClear
                  placeholder="Select Member"
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
            <Col xs={24} md={12}>
              <Form.Item
                label="Password"
                name="password"
              >
                <Input.Password />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Status"
                name="active"
                rules={[
                  {
                    required: true,
                    message: "Please select status",
                  },
                ]}
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
              onClick={() =>
                navigate("/superadminusers")
              }
            >
              Cancel
            </Button>
          </Space>
        </Form>
      </Spin>
    </Card>
  );
};

export default SuperAdminEditUser;
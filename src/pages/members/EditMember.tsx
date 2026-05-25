// src/pages/members/EditMember.tsx

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  message,
  Select,
  Card,
  Spin,
} from "antd";

import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut } from "../../api/axios";
import { focusNext } from "../../utils/FocusNext";

interface MemberFormValues {
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  gender?: string;
  occupation?: string;
  memberType?: string;
  flatId?: number;
  active?: boolean;
}

const EditMember: React.FC = () => {
  const [form] = Form.useForm<MemberFormValues>();

  const navigate = useNavigate();
  const { id } = useParams();

  const [flats, setFlats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const societyId = sessionStorage.getItem("societyId");

  useEffect(() => {
    loadFlats();
    loadMember();
  }, []);

  const loadFlats = async () => {
    try {
      const res = await apiGet(
        `/flats?societyId=${societyId}`
      );

      setFlats(res || []);
    } catch (err) {
      message.error("Failed to load flats");
    }
  };

  const loadMember = async () => {
    try {
      setLoading(true);

      const res = await apiGet(`/members/${id}`);

      form.setFieldsValue({
        name: res.name,
        mobile: res.mobile,
        email: res.email,
        address: res.address,
        gender: res.gender,
        occupation: res.occupation,
        memberType: res.memberType,
        flatId: res.flatId,
        active: res.active,
      });

    } catch (error) {
      console.error(error);
      message.error("Failed to load member");
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

  const onFinish = async (
    values: MemberFormValues
  ) => {
    try {
      setSaving(true);

      const payload = {
        name: values.name,
        mobile: values.mobile,
        email: values.email,
        address: values.address,
        gender: values.gender,
        occupation: values.occupation,
        memberType: values.memberType,
        active: values.active,

        societyId: Number(societyId),

        flatId: values.flatId
          ? values.flatId
          : null,
      };
      await apiPut(`/members/${id}`, payload);

      message.success(
        "Member updated successfully"
      );

      navigate("/members");

    } catch (error) {
      console.error(error);
      message.error("Failed to update member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title="Edit Member"
      style={{ marginBottom: 20 }}
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Enter name",
                  },
                ]}
              >
                <Input
                  placeholder="Enter full name"
                  onPressEnter={focusNext}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Mobile"
                name="mobile"
                rules={[
                  {
                    required: true,
                    message: "Enter mobile",
                  },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Invalid mobile",
                  },
                ]}
              >
                <Input
                  maxLength={10}
                  placeholder="Enter mobile"
                  onPressEnter={focusNext}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
              >
                <Input
                  placeholder="Enter email"
                  onPressEnter={focusNext}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Flat"
                name="flatId"
              >
                <Select
                  placeholder="Select flat"
                  allowClear
                  onKeyDown={handleSelectEnter}
                >
                  {flats.map((f) => (
                    <Select.Option
                      key={f.id}
                      value={f.id}
                    >
                      {f.flatNo}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Gender"
                name="gender"
              >
                <Select
                  placeholder="Select gender"
                  onKeyDown={handleSelectEnter}
                >
                  <Select.Option value="Male">
                    Male
                  </Select.Option>

                  <Select.Option value="Female">
                    Female
                  </Select.Option>

                  <Select.Option value="Other">
                    Other
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Occupation"
                name="occupation"
              >
                <Input
                  placeholder="Enter occupation"
                  onPressEnter={focusNext}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Member Type"
                name="memberType"
                rules={[
                  {
                    required: true,
                    message:
                      "Select member type",
                  },
                ]}
              >
                <Select
                  placeholder="Select type"
                  onKeyDown={handleSelectEnter}
                >
                  <Select.Option value="OWNER">
                    OWNER
                  </Select.Option>

                  <Select.Option value="TENANT">
                    TENANT
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Status"
                name="active"
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

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Address"
                name="address"
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Enter address"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
              >
                Update Member
              </Button>
            </Col>

            <Col>
              <Button
                onClick={() =>
                  navigate("/members")
                }
              >
                Cancel
              </Button>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Card>
  );
};

export default EditMember;
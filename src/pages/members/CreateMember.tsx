import React, { useEffect, useState } from "react";
import { Form, Input, Button, Row, Col, message, Select, Card } from "antd";
import { apiGet, apiPost } from "../../api/axios";
import { focusNext } from "../../utils/FocusNext";
import { useNavigate } from "react-router-dom";

interface MemberFormValues {
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  gender?: string;
  occupation?: string;
  memberType?: string;
  flatId?: number;
}


const CreateMember: React.FC = () => {
  const [form] = Form.useForm<MemberFormValues>();
  const [flats, setFlats] = useState<any[]>([]);

  const societyId = sessionStorage.getItem("societyId");
  const navigate = useNavigate();
  useEffect(() => {
    loadFlats();
  }, []);

  const loadFlats = async () => {
    try {
      const res = await apiGet("/flats");
      setFlats(res);
    } catch (err) {
      message.error("Failed to load flats");
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

  const onFinish = async (values: MemberFormValues) => {
    try {
      if (!societyId) {
        message.error("Society not found in session");
        return;
      }

      const payload = {
        name: values.name,
        mobile: values.mobile,
        email: values.email,
        address: values.address,
        gender: values.gender,
        occupation: values.occupation,
        memberType: values.memberType,
        active: true,

        societyId: societyId,
        flatId: values.flatId ? values.flatId  : null,
      };

      await apiPost("/members", payload);
      message.success("Member created successfully");
      form.resetFields();
      navigate("/members");
    } catch (error) {
      console.error(error);
      message.error("Failed to create member");
    }
  };

  return (
    <Card title="Create Member" style={{ marginBottom: 20 }}>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: "Enter name" }]}
            >
              <Input placeholder="Enter full name" onPressEnter={focusNext} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Mobile"
              name="mobile"
              rules={[
                { required: true, message: "Enter mobile" },
                { pattern: /^[0-9]{10}$/, message: "Invalid mobile" },
              ]}
            >
              <Input maxLength={10} placeholder="Enter mobile" onPressEnter={focusNext}/>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Email" name="email">
              <Input placeholder="Enter email" onPressEnter={focusNext} />
            </Form.Item>
          </Col>

          {/* <Col span={12}>
            <Form.Item label="Flat" name="flatId">
              <Select placeholder="Select flat" onKeyDown={handleSelectEnter}>
                {flats.map((f) => (
                  <Select.Option key={f.id} value={f.id}>
                    {f.flatNo}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col> */}
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Gender" name="gender">
              <Select placeholder="Select gender" onKeyDown={handleSelectEnter}>
                <Select.Option value="Male">Male</Select.Option>
                <Select.Option value="Female">Female</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Occupation" name="occupation">
              <Input placeholder="Enter occupation" onPressEnter={focusNext} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Member Type"
              name="memberType"
              rules={[{ required: true, message: "Select member type" }]}
            >
              <Select placeholder="Select type" onKeyDown={handleSelectEnter}>
                <Select.Option value="OWNER">OWNER</Select.Option>
                <Select.Option value="TENANT">TENANT</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Address" name="address">
              <Input.TextArea rows={2} placeholder="Enter address" />
            </Form.Item>
          </Col>
        </Row>

        <Button type="primary" htmlType="submit">
          Save Member
        </Button>
        <Button type="default" style={{ marginLeft: 8 }} onClick={() => navigate("/members")}>
          Cancel
        </Button>
      </Form>
    </Card>
  );
};

export default CreateMember;
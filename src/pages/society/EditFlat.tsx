// src/pages/flats/EditFlat.tsx

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Spin,
  Layout
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut } from "../../api/axios";
import { focusNext } from "../../utils/FocusNext";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";

interface FlatFormValues {
  flatNo: string;
  floorNo: string;
  areaSqFt: number;
  bedrooms: number;
  maintenanceAmount: number;
  status: string;
  active: boolean;
  wingId: number;
  ownerId?: number;
}

const {Content} = Layout;
const role = sessionStorage.getItem("role");

const EditFlat: React.FC = () => {
  const [form] = Form.useForm<FlatFormValues>();

  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [wings, setWings] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    loadMasters();
    loadFlat();
  }, []);

  const loadMasters = async () => {
    try {
      const societyId = sessionStorage.getItem("societyId");

      const wingRes = await apiGet(
        `/wings?societyId=${societyId}`
      );

      const memberRes = await apiGet(
        `/members?societyId=${societyId}`
      );

      setWings(wingRes || []);
      setMembers(memberRes || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to load master data");
    }
  };

  const loadFlat = async () => {
    try {
      setLoading(true);

      const res = await apiGet(`/flats/${id}`);

      form.setFieldsValue({
        flatNo: res.flatNo,
        floorNo: res.floorNo,
        areaSqFt: res.areaSqFt,
        bedrooms: res.bedrooms,
        maintenanceAmount: res.maintenanceAmount,
        status: res.status,
        active: res.active,
        wingId: res.wingId,
        ownerId: res.ownerId,
      });
    } catch (err) {
      console.error(err);
      message.error("Failed to load flat");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEnter = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();

      const formEl = e.target.form;
      const elements = Array.from(formEl.elements) as HTMLElement[];

      const index = elements.indexOf(e.target);
      const next = elements[index + 1];

      if (next) next.focus();
    }
  };

  const onFinish = async (values: FlatFormValues) => {
    try {
      setSaving(true);

      const societyId = sessionStorage.getItem("societyId");

      const payload = {
        flatNo: values.flatNo,
        floorNo: values.floorNo,
        areaSqFt: values.areaSqFt,
        bedrooms: values.bedrooms,
        maintenanceAmount: values.maintenanceAmount,
        status: values.status,
        active: values.active,

        society: {
          id: Number(societyId),
        },

        wing: {
          id: values.wingId,
        },

        owner: values.ownerId
          ? {
              id: values.ownerId,
            }
          : null,
      };
      await apiPut(`/flats/${id}`, payload);

      message.success("Flat updated successfully");

      navigate("/flats");
    } catch (err) {
      console.error(err);
      message.error("Failed to update flat");
    } finally {
      setSaving(false);
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
    <Card title="Edit Flat" style={{ marginBottom: 20 }}>
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Flat No"
                name="flatNo"
                rules={[
                  {
                    required: true,
                    message: "Enter flat no",
                  },
                ]}
              >
                <Input
                  placeholder="Enter flat no"
                  onPressEnter={focusNext}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Floor No"
                name="floorNo"
              >
                <Input
                  placeholder="Enter floor no"
                  onPressEnter={focusNext}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Area SqFt"
                name="areaSqFt"
              >
                <Input
                  type="number"
                  placeholder="Enter area"
                  onPressEnter={focusNext}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Bedrooms"
                name="bedrooms"
              >
                <Input
                  type="number"
                  placeholder="Enter bedrooms"
                  onPressEnter={focusNext}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Maintenance Amount"
                name="maintenanceAmount"
              >
                <Input
                  type="number"
                  placeholder="Enter maintenance"
                  onPressEnter={focusNext}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Wing"
                name="wingId"
                rules={[
                  {
                    required: true,
                    message: "Select wing",
                  },
                ]}
              >
                <Select
                  placeholder="Select wing"
                  onKeyDown={handleSelectEnter}
                >
                  {wings.map((w) => (
                    <Select.Option
                      key={w.id}
                      value={w.id}
                    >
                      {w.wingName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Owner"
                name="ownerId"
              >
                <Select
                  allowClear
                  placeholder="Select owner"
                  onKeyDown={handleSelectEnter}
                >
                  {members.map((m) => (
                    <Select.Option
                      key={m.id}
                      value={m.id}
                    >
                      {m.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
              >
                <Select
                  placeholder="Select status"
                  onKeyDown={handleSelectEnter}
                >
                  <Select.Option value="OCCUPIED">
                    OCCUPIED
                  </Select.Option>

                  <Select.Option value="VACANT">
                    VACANT
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Active"
                name="active"
              >
                <Select
                  placeholder="Select active"
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
              Update Flat
            </Button>

            <Button
              onClick={() => navigate("/flats")}
            >
              Cancel
            </Button>
          </Space>
        </Form>
      </Spin>
    </Card>
    </Content>
    </Layout>
    </Layout>
  );
};

export default EditFlat;
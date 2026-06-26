import React, { useEffect, useState } from "react";
import {
  Form,
  Table,
  Input,
  Button,
  Select,
  Card,
  message,
  Layout,
  Row,
  Col,
} from "antd";
import axios from "axios";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";




const { Option } = Select;
const { Content } = Layout;
const BASE_URL = import.meta.env.VITE_API_URL;

interface GLMaster {
  glCode: number;
  accountName: string;
  groupName: string;
}

interface GlMappingForm {
  description: string;
  societyId: number;
  gl_receivable: number;
  gl_credit_account: number;
}

interface GlMapping {
  id: number;
  description: string;
  societyId: number;
  gl_receivable: number;
  gl_credit_account: number;
}

const GlMappingEntry: React.FC = () => {
  const [form] = Form.useForm();

  const [receivableAccounts, setReceivableAccounts] = useState<GLMaster[]>([]);
  const [creditAccounts, setCreditAccounts] = useState<GLMaster[]>([]);

  const societyId = Number(sessionStorage.getItem("societyId"));
  const role = sessionStorage.getItem("role");
const [mappings, setMappings] = useState<GlMapping[]>([]);

  useEffect(() => {
    loadGLAccounts();
    loadGlMapping();
  }, []);

  const loadGLAccounts = async () => {
    
    try {
      const res = await axios.get(
        `${BASE_URL}/gl/master?societyId=${societyId}`,
      );
      const data: GLMaster[] = res.data;

      setReceivableAccounts(data);

      // Income + Reserve Accounts
      setCreditAccounts(
        data.filter(
          (x) => x.groupName === "INCOME" || x.groupName === "RESERVES",
        ),
      );
    } catch (err) {
      message.error("Unable to load GL Accounts");
    }
  };

  const loadGlMapping = async () => {
    try {
      const mappingres = await axios.get(
        `${BASE_URL}/gl/master/mapping?societyId=${societyId}`,
      );
      setMappings(mappingres.data);
    } catch (err) {
      message.error("Unable to load GL Mappings");
    }
  };

  const onFinish = async (values: GlMappingForm) => {
    try {
      await axios.post(`${BASE_URL}/gl/master/mapping`, {
        ...values,
        societyId,
      });

      message.success("GL Mapping Saved");

      form.resetFields();
      loadGlMapping();
    } catch (err) {
      message.error("Error saving mapping");
    }
  };

  const getAccountName = (glCode: number) => {
    const acc = [...receivableAccounts, ...creditAccounts].find(
      (x) => x.glCode === glCode,
    );
    return acc?.accountName || "";
  };

  const columns = [
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Receivable",
      dataIndex: "gl_receivable",
      render: (value: number) => `${value} - ${getAccountName(value)}`,
    },
    {
      title: "Credit Account",
      dataIndex: "gl_credit_account",
      render: (value: number) => `${value} - ${getAccountName(value)}`,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider
        width={240}
        breakpoint="lg"
        collapsedWidth={0}
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {role === "MEMBER" ? <MemberSidebar /> : <Sidebar />}
      </Layout.Sider>

      <Layout>
        {role === "MEMBER" ? <MemberHeader /> : <Header />}

        <Content
          style={{
            padding: 16,
            background: "#f0f5ff",
          }}
        >
          <div
            style={{
              maxWidth: "100%",
              margin: "0 auto",
            }}
          >
            <Card
              title="GL Mapping"
              style={{
                width: "100%",
              }}
            >
              <Form layout="vertical" form={form} onFinish={onFinish}>
                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={24} md={12} lg={8}>
                    <Form.Item
                      label="Description"
                      name="description"
                      rules={[
                        {
                          required: true,
                          message: "Enter Description",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={12} lg={8}>
                    <Form.Item
                      label="Account"
                      name="gl_receivable"
                      rules={[
                        {
                          required: true,
                          message: "Select Receivable Account",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder="Select Receivable Account"
                        optionFilterProp="children"
                      >
                        {receivableAccounts.map((item) => (
                          <Option key={item.glCode} value={item.glCode}>
                            {item.glCode} - {item.accountName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={12} lg={8}>
                    <Form.Item
                      label="MAP to Account"
                      name="gl_credit_account"
                      rules={[
                        {
                          required: false,
                          message: "Select Credit Account",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder="Select Credit Account"
                        optionFilterProp="children"
                      >
                        {creditAccounts.map((item) => (
                          <Option key={item.glCode} value={item.glCode}>
                            {item.glCode} - {item.accountName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row>
                  <Col xs={24}>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Save
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>{" "}
              <Row>
                <Col span={24}>
                  <Table
                    style={{ marginTop: 20 }}
                    rowKey="id"
                    columns={columns}
                    dataSource={mappings}
                    bordered
                    size="small"
                    scroll={{ x: 600 }}
                    pagination={{
                      pageSize: 10,
                    }}
                  />
                </Col>
              </Row>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default GlMappingEntry;

import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  InputNumber,
  DatePicker,
  Select,
  Input,
  Button,
  message,
  Row,
  Col,
  Divider,
  Alert,
  Typography,
  Spin,
  Layout,
} from "antd";
import dayjs from "dayjs";
import axios from "axios";
import Header from "../../components/layout/Header";
import MemberHeader from "../../components/layout/MemberHeader";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import Sidebar from "../../components/layout/Sidebar";
import MemberSidebar from "../../components/layout/MemberSidebar";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";
const { Content } = Layout;
const role = sessionStorage.getItem("role") || "MEMBER";

const { TextArea } = Input;
const { Text } = Typography;

type EntryType = "DEPOSIT" | "REFUND";

interface Member {
  id: number;
  name: string;
}

interface Flat {
  id: number;
  flatNumber: string;
  memberId?: number;
}


interface DepositBalance {
  totalDeposit: number;
  totalRefunded: number;
  refundableBalance: number;
}

const ParkingDepositEntry: React.FC = () => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [entryType, setEntryType] =
    useState<EntryType>("DEPOSIT");

  const [members, setMembers] = useState<Member[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);


  const [depositBalance, setDepositBalance] =
    useState<DepositBalance | null>(null);

  useEffect(() => {
    loadMembers();
    loadFlats();
  }, []);

const loadMembers = async () => {
  try {
    const response = await axios.get("/members");

    const data = response.data;

    if (Array.isArray(data)) {
      setMembers(data);
    } else if (Array.isArray(data?.content)) {
      setMembers(data.content);
    } else if (Array.isArray(data?.data)) {
      setMembers(data.data);
    } else {
      console.error("Unexpected members API response:", data);
      setMembers([]);
    }
  } catch (error) {
    console.error("Failed to load members", error);
    setMembers([]);
  }
};

const loadFlats = async () => {
  try {
    const response = await axios.get("/flats");

    const data = response.data;

    if (Array.isArray(data)) {
      setFlats(data);
    } else if (Array.isArray(data?.content)) {
      setFlats(data.content);
    } else if (Array.isArray(data?.data)) {
      setFlats(data.data);
    } else {
      console.error("Unexpected flats API response:", data);
      setFlats([]);
    }
  } catch (error) {
    console.error("Failed to load flats", error);
    setFlats([]);
  }
};



  const handleEntryTypeChange = (value: EntryType) => {
    setEntryType(value);
    setDepositBalance(null);

    form.setFieldsValue({
      amount: undefined,
    });
  };

  const loadDepositBalance = async () => {
    const memberId = form.getFieldValue("memberId");

    if (!memberId ) {
      setDepositBalance(null);
      return;
    }

    try {
      setPageLoading(true);

      const response = await axios.get(
        "/parking-deposit/balance",
        {
          params: {
            memberId,
          },
        }
      );

      const data = response.data;

      setDepositBalance({
        totalDeposit: Number(data.totalDeposit || 0),
        totalRefunded: Number(data.totalRefunded || 0),
        refundableBalance: Number(
          data.refundableBalance || 0
        ),
      });
    } catch (error: any) {
      console.error(error);

      setDepositBalance(null);

      if (entryType === "REFUND") {
        message.error(
          error?.response?.data?.message ||
            "Failed to load refundable balance"
        );
      }
    } finally {
      setPageLoading(false);
    }
  };

  const handleMemberChange = async () => {
    if (entryType === "REFUND") {
      await loadDepositBalance();
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const amount = Number(values.amount);

      if (
        values.entryType === "REFUND" &&
        depositBalance &&
        amount > depositBalance.refundableBalance
      ) {
        message.error(
          `Refund amount cannot exceed ₹${depositBalance.refundableBalance}`
        );
        return;
      }

      if (
        values.entryType === "REFUND" &&
        (!depositBalance ||
          depositBalance.refundableBalance <= 0)
      ) {
        message.error(
          "No refundable parking deposit balance available"
        );
        return;
      }

      const payload = {
        memberId: values.memberId,
        flatId: values.flatId,
        amount,
        paymentDate:
          values.paymentDate.format("YYYY-MM-DD"),
        paymentMode: values.paymentMode,
        remarks: values.remarks,
        entryType: values.entryType,
        refundable: true,
      };

      console.log(
        "Parking Deposit Entry Payload:",
        payload
      );

      await axios.post(
        "/parking-deposit/entry",
        payload
      );

      message.success(
        values.entryType === "DEPOSIT"
          ? "Parking deposit received successfully"
          : "Parking deposit refunded successfully"
      );

      form.resetFields();

      form.setFieldsValue({
        entryType: "DEPOSIT",
        paymentDate: dayjs(),
        paymentMode: "BANK",
      });

      setEntryType("DEPOSIT");
      setDepositBalance(null);
    } catch (error: any) {
      console.error(error);

      message.error(
        error?.response?.data?.message ||
          "Failed to save parking deposit entry"
      );
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

    <Spin spinning={pageLoading}>
      <Card
        title={
          entryType === "DEPOSIT"
            ? "Parking Refundable Deposit Entry"
            : "Parking Deposit Refund Entry"
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            entryType: "DEPOSIT",
            paymentDate: dayjs(),
            paymentMode: "BANK",
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item
                label="Transaction Type"
                name="entryType"
                rules={[
                  {
                    required: true,
                    message:
                      "Please select transaction type",
                  },
                ]}
              >
                <Select
                  onChange={handleEntryTypeChange}
                >
                  <Select.Option value="DEPOSIT">
                    Parking Deposit Received
                  </Select.Option>

                  <Select.Option value="REFUND">
                    Parking Deposit Refund
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Member"
                name="memberId"
                rules={[
                  {
                    required: true,
                    message:
                      "Please select member",
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Select Member"
                  optionFilterProp="children"
                  onChange={handleMemberChange}
                >
                  {members.map((member) => (
                    <Select.Option
                      key={member.id}
                      value={member.id}
                    >
                      {member.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                label="Flat"
                name="flatId"
                rules={[
                  {
                    required: true,
                    message:
                      "Please select flat",
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Select Flat"
                  optionFilterProp="children"
                >
                  {flats.map((flat) => (
                    <Select.Option
                      key={flat.id}
                      value={flat.id}
                    >
                      {flat.flatNumber}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
                        <Col xs={24} md={6}>
              <Form.Item
                label={
                  entryType === "DEPOSIT"
                    ? "Deposit Amount"
                    : "Refund Amount"
                }
                name="amount"
                rules={[
                  {
                    required: true,
                    message: "Please enter amount",
                  },
                  {
                    validator: (_, value) => {
                      if (
                        entryType === "REFUND" &&
                        depositBalance &&
                        Number(value) >
                          depositBalance.refundableBalance
                      ) {
                        return Promise.reject(
                          new Error(
                            `Amount cannot exceed refundable balance of ₹${depositBalance.refundableBalance}`
                          )
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  precision={2}
                  prefix="₹"
                  placeholder={
                    entryType === "DEPOSIT"
                      ? "Enter Deposit Amount"
                      : "Enter Refund Amount"
                  }
                  max={
                    entryType === "REFUND" &&
                    depositBalance
                      ? depositBalance.refundableBalance
                      : undefined
                  }
                />
              </Form.Item>
            </Col>

          </Row>

          {entryType === "REFUND" && (
            <>
              <Divider />

              {depositBalance ? (
                <Alert
                  type="info"
                  showIcon
                  message="Parking Deposit Balance"
                  description={
                    <div>
                      <p>
                        Total Deposit:{" "}
                        <Text strong>
                          ₹
                          {depositBalance.totalDeposit.toFixed(2)}
                        </Text>
                      </p>

                      <p>
                        Already Refunded:{" "}
                        <Text strong>
                          ₹
                          {depositBalance.totalRefunded.toFixed(2)}
                        </Text>
                      </p>

                      <p>
                        Available for Refund:{" "}
                        <Text strong>
                          ₹
                          {depositBalance.refundableBalance.toFixed(2)}
                        </Text>
                      </p>
                    </div>
                  }
                />
              ) : (
                <Alert
                  type="warning"
                  showIcon
                  message="Select Member"
                  description="The available refundable balance will be displayed here."
                />
              )}

              <Divider />
            </>
          )}

          <Row gutter={16}>

            <Col xs={24} md={6}>
              <Form.Item
                label={
                  entryType === "DEPOSIT"
                    ? "Deposit Date"
                    : "Refund Date"
                }
                name="paymentDate"
                rules={[
                  {
                    required: true,
                    message: "Please select date",
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD-MM-YYYY"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label={
                  entryType === "DEPOSIT"
                    ? "Received Through"
                    : "Refund Through"
                }
                name="paymentMode"
                rules={[
                  {
                    required: true,
                    message:
                      "Please select payment mode",
                  },
                ]}
              >
                <Select>
                  <Select.Option value="CASH">
                    Cash
                  </Select.Option>

                  <Select.Option value="BANK">
                    Bank
                  </Select.Option>

                  <Select.Option value="UPI">
                    UPI
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>

          <Form.Item
            label="Remarks"
            name="remarks"
          >
            <TextArea
              rows={3}
              placeholder={
                entryType === "DEPOSIT"
                  ? "Enter deposit remarks"
                  : "Enter refund remarks"
              }
            />
          </Form.Item>
          </Col>
          </Row>


          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              {entryType === "DEPOSIT"
                ? "Save Parking Deposit"
                : "Process Parking Refund"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Spin>
    </Content>
    </Layout>
    </Layout>
  );
};

export default ParkingDepositEntry;
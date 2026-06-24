import React, { useEffect, useState } from "react";
import {
  Layout,
  Table,
  Tag,
  Spin,
  Typography,
  Button,
  message,
  Select,
  Modal,
  InputNumber,
  Input,
} from "antd";
import axios from "axios";

import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import AppHeader from "../../components/layout/Header";
import { QRCodeCanvas } from "qrcode.react";

const { Content } = Layout;
const { Title } = Typography;

const BASE_URL = import.meta.env.VITE_API_URL;

type Contribution = {
  id: number;
  name: string;
  type: string;
  amount: number;
  flatId: number;
  flatNo: string;
  dueDate: string;
  status: string;
  memberId: number;
};

type Flat = {
  id: number;
  flatNo: string;
};

const PendingContributions: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const [allContributions, setAllContributions] = useState<Contribution[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);

  const [flats, setFlats] = useState<Flat[]>([]);
  const [selectedFlat, setSelectedFlat] = useState<number | null>(null);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [payLoading, setPayLoading] = useState(false);

  const [amountModalOpen, setAmountModalOpen] = useState(false);
  const [finalAmount, setFinalAmount] = useState<number | null>(null);
  const [minimumAmount, setMinimumAmount] = useState<number>(0);
  const [contributionType, setContributionType] = useState<string>("");

  const [upiUrl, setUpiUrl] = useState("");
  const [qrVisible, setQrVisible] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const role = sessionStorage.getItem("role");

  const memberId = Number(sessionStorage.getItem("memberId"));
  const societyId = Number(sessionStorage.getItem("societyId"));
  const userId = Number(sessionStorage.getItem("userId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

  const societyName = sessionStorage.getItem("societyName");
  const upi = sessionStorage.getItem("upi");
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "QR" | "">(
    "",
  );

  useEffect(() => {}, [selectedFlat, contributions]);

  useEffect(() => {
    loadFlats();
    loadContributions();
  }, []);

  useEffect(() => {
    if (selectedFlat == null) {
      setContributions([]);
      return;
    }

    const filtered = allContributions.filter(
      (item) => Number(item.flatId) === Number(selectedFlat),
    );

    setContributions(filtered);
  }, [selectedFlat, allContributions]);

  // ✅ SAFE NORMALIZER

  const loadFlats = async () => {
    try {
      const flatRes = await axios.get(`${BASE_URL}/members/flats`, {
        params: {
          societyId,
          memberId,
        },
      });

      const flatsData = flatRes.data || [];

      setFlats(flatsData);

      // Select first flat automatically
      if (flatsData.length > 0) {
        setSelectedFlat(Number(flatsData[0].id));
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to load flats");
    }
  };

  const openQr = (amount: number) => {
    const paymentRef = `SF-${Date.now()}`;

    const qr = `upi://pay?pa=${upi}
      &pn=${encodeURIComponent(societyName ?? "")}
      &am=${amount}
      &cu=INR
      &tn=${paymentRef}`;

    setUpiUrl(qr.replace(/\s+/g, ""));
    setQrVisible(true);
  };

  const handleManualPayment = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Select row first");
      return;
    }

    const first = selectedContributions[0];

    if (first?.type?.toUpperCase() === "VOLUNTARY") {
      setContributionType("VOLUNTARY");
      setMinimumAmount(totalAmount);
      setFinalAmount(totalAmount);
      setPaymentMethod("QR");
      setAmountModalOpen(true);
      return;
    }

    openQr(totalAmount);
  };
  const saveManualPayment = async () => {
    if (!transactionId.trim()) {
      message.warning("Please enter transaction ID");
      return;
    }

    try {
      setPayLoading(true);

      await axios.post(`${BASE_URL}/contribution/manual-payment`, {
        contributionIds: selectedRowKeys,
        memberId,
        userId,
        financialYearId,
        paymentMode: "UPI",
        transactionId,
        amount: finalAmount || totalAmount,
      });

      message.success("Payment submitted successfully");

      setQrVisible(false);
      setTransactionId("");
      setSelectedRowKeys([]);

      const freshData = await loadContributions();
      filterContributions(selectedFlat, freshData);
    } catch (error) {
      console.error(error);
      message.error("Failed to submit payment");
    } finally {
      setPayLoading(false);
    }
  };

  // ✅ FRONTEND FILTER ONLY

  const loadContributions = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/contribution/${societyId}/${financialYearId}`,
      );

      let data = (res.data || []).filter((item: any) => item.status !== "PAID");

      if (role === "MEMBER") {
        data = data.filter(
          (item: any) => Number(item.memberId) === Number(memberId),
        );
      }

      setAllContributions(data);

      return data;
    } catch (err) {
      console.error(err);
      message.error("Failed to load contributions");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const filterContributions = (
    flatId: number | null,
    sourceData = allContributions,
  ) => {
    const filtered = sourceData.filter(
      (item) => Number(item.flatId) === Number(flatId),
    );

    setContributions(filtered);
  };

  const selectedContributions = contributions.filter((i) =>
    selectedRowKeys.includes(i.id),
  );

  const totalAmount = selectedContributions.reduce(
    (s, i) => s + (i.amount || 0),
    0,
  );

  const handlePay = () => {
    if (!selectedRowKeys.length) {
      message.warning("Select records first");
      return;
    }

    const first = selectedContributions[0];

    if (first?.type?.toUpperCase() === "VOLUNTARY") {
      setContributionType("VOLUNTARY");
      setMinimumAmount(totalAmount);
      setFinalAmount(totalAmount);
      setPaymentMethod("RAZORPAY");
      setAmountModalOpen(true);
      return;
    }

    proceedPayment(totalAmount, "COMPULSORY");
  };

  const proceedPayment = async (amount: number, type: string) => {
    try {
      setPayLoading(true);

      const orderRes = await axios.post(
        `${BASE_URL}/contribution/create-order`,
        {
          contributionIds: selectedRowKeys,
          memberId,
          amount,
        },
      );

      const order = orderRes.data;

      const options = {
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: "Society Management",
        order_id: order.razorpayOrderId,

        handler: async (response: any) => {
          await axios.post(`${BASE_URL}/contribution/verify-payment`, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            contributionIds: selectedRowKeys,
            memberId,
            paymentMode: "ONLINE",
            userId,
            amount,
            type,
            financialYearId,
          });

          message.success("Payment successful");

          setSelectedRowKeys([]);

          const freshData = await loadContributions();

          filterContributions(selectedFlat, freshData);
        },
      };

      new (window as any).Razorpay(options).open();
    } catch {
      message.error("Payment failed");
    } finally {
      setPayLoading(false);
    }
  };

  const columns = [
    { title: "Flat No", dataIndex: "flatNo" },
    { title: "Name", dataIndex: "name" },
    { title: "Type", dataIndex: "type" },
    { title: "Due Date", dataIndex: "dueDate" },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (v: number) => `₹ ${v}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: string) => (
        <Tag color={s === "PAID" ? "green" : "orange"}>{s}</Tag>
      ),
    },
  ];

  const firstSelectedContribution = contributions.find((c) =>
    selectedRowKeys.includes(c.id),
  );

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
        {role === "MEMBER" ? <MemberHeader /> : <AppHeader />}

        <Content style={{ padding: 24, background: "#f0f5ff" }}>
          <Title level={3}>Pending Contributions</Title>

          <Select
            style={{ width: 220, marginBottom: 12 }}
            placeholder="Select Flat"
            options={flats.map((f) => ({
              label: f.flatNo,
              value: f.id,
            }))}
            value={selectedFlat ?? undefined}
            onChange={(v) => {
              const filtered = allContributions.filter(
                (item) => Number(item.flatId) === Number(v),
              );
              setSelectedFlat(Number(v));
              setContributions(filtered);
              setSelectedRowKeys([]);
            }}
          />

          <div style={{ marginBottom: 12 }}>
            Selected: {selectedRowKeys.length} | Total: ₹{totalAmount}
          </div>

          <Button
            type="primary"
            style={{ marginLeft: 10 }}
            onClick={() => handleManualPayment()}
            disabled={!selectedRowKeys.length}
          >
            Pay via UPI QR
          </Button>

          <Button
            type="default"
            style={{ marginLeft: 10 }}
            onClick={handlePay}
            disabled={!selectedRowKeys.length}
            loading={payLoading}
          >
            Pay via Razorpay
          </Button>

          {loading ? (
            <Spin />
          ) : (
            <Table
              rowKey="id"
              dataSource={contributions}
              columns={columns}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,

                getCheckboxProps: (record) => {
                  if (!firstSelectedContribution) {
                    return { disabled: false };
                  }
                  const firstType =
                    firstSelectedContribution.type?.toUpperCase();
                  const currentType = record.type?.toUpperCase();
                  return {
                    disabled:
                      currentType !== firstType &&
                      !selectedRowKeys.includes(record.id),
                  };
                },
              }}
              scroll={{ x: "max-content" }}
              pagination={{ pageSize: 8 }}
            />
          )}

          <Modal
            title="Enter Contribution Amount"
            open={amountModalOpen}
            onCancel={() => {
              setAmountModalOpen(false);
              setFinalAmount(minimumAmount);
            }}
            onOk={() => {
              if (!finalAmount || finalAmount <= 0) {
                message.error("Please enter amount");
                return;
              }

              if (finalAmount < minimumAmount) {
                message.error(
                  `Amount cannot be less than ₹${minimumAmount}. Please enter a valid amount.`,
                );
                return;
              }

              setAmountModalOpen(false);

              if (paymentMethod === "RAZORPAY") {
                proceedPayment(finalAmount, contributionType);
              } else if (paymentMethod === "QR") {
                openQr(finalAmount);
              }
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <strong>Minimum Amount:</strong> ₹{minimumAmount}
            </div>

            <InputNumber
              style={{ width: "100%" }}
              value={finalAmount}
              onChange={(v) => setFinalAmount(v ? Number(v) : 0)}
              placeholder="Enter amount"
            />

            {(finalAmount || 0) < minimumAmount && (
              <div
                style={{
                  color: "red",
                  marginTop: 8,
                }}
              >
                Amount must be at least ₹{minimumAmount}
              </div>
            )}
          </Modal>

          <Modal
            title="Scan & Pay"
            open={qrVisible}
            footer={null}
            onCancel={() => setQrVisible(false)}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <QRCodeCanvas value={upiUrl} size={250} />

              <div>
                <strong>Amount:</strong> ₹{finalAmount || totalAmount}
              </div>

              <Input
                placeholder="Enter UPI Transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />

              <Button
                type="primary"
                loading={payLoading}
                onClick={saveManualPayment}
                block
              >
                Submit Payment
              </Button>
            </div>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PendingContributions;

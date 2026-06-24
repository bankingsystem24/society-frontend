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
} from "antd";
import axios from "axios";

import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import Header from "../../components/layout/Header";
import { Modal, Input } from "antd";
import { QRCodeCanvas } from "qrcode.react";

const BASE_URL = import.meta.env.VITE_API_URL;

const { Content } = Layout;
const { Title } = Typography;

type SinkingFund = {
  id: number;
  month: string;
  year: number;
  amount: number;
  status: string;
  flatId: Number;
  flatNo?: string;
};

type Flat = {
  id: number;
  flatNo: string;
};

const PendingSinkingFunds: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sinkingFunds, setSinkingFunds] = useState<SinkingFund[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [selectedFlat, setSelectedFlat] = useState<number | null>(null);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [payLoading, setPayLoading] = useState(false);

  const memberId = Number(sessionStorage.getItem("memberId"));
  const societyId = Number(sessionStorage.getItem("societyId"));
  const userId = Number(sessionStorage.getItem("userId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
  const role = sessionStorage.getItem("role");
  const [qrVisible, setQrVisible] = useState(false);

  const [transactionId, setTransactionId] = useState("");
  const [upiUrl, setUpiUrl] = useState("");

  const societyName = sessionStorage.getItem("societyName");
  const upi = sessionStorage.getItem("upi");

    const [maintenanceMappingExists, setMaintenanceMappingExists] = useState(false);
  
    const [glReceivable, setGlReceivable] = useState<number>(0);
    const [glCreditAccount, setGlCreditAccount] = useState<number>(0);
  
    const [glCashInHand, setGlCashInHand] = useState<number>(0);
    const [glBankAccount, setGlBankAccount] = useState<number>(0);
    const [glInterestIncome, setGlInterestIncome] = useState<number>(0);
    const [glDiscount, setGlDiscount] = useState<number>(0);

  useEffect(() => {
    loadFlats();
    loadGlMapping();

  }, []);

  useEffect(() => {}, [ glCashInHand, glBankAccount, glInterestIncome, glDiscount, glReceivable,glCreditAccount ]);
  

  const loadFlats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/members/flats`, {
        params: { societyId, memberId },
      });

      const flatsData = res.data || [];
      setFlats(flatsData);

      if (flatsData.length > 0) {
        const firstFlatId = flatsData[0].id;
        setSelectedFlat(firstFlatId);
        fetchSinkingFunds(firstFlatId);
      }
    } catch (err) {
      message.error("Failed to load flats");
    }
  };


    const loadGlMapping = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/gl/master/mapping?societyId=${societyId}`,
      );

      const mapping = res.data.find(
        (item: any) =>
          item.description?.trim().toLowerCase() === "sinking fund receivable",
      );

      if (!mapping) {
        setMaintenanceMappingExists(false);
        message.error(" GL Mapping not configured");
        return;
      }

      setMaintenanceMappingExists(true);

      setGlReceivable(mapping.gl_receivable);
      setGlCreditAccount(mapping.gl_credit_account);

      const CashInHand = res.data.find(
        (item: any) => item.description?.trim().toLowerCase() == "cash in hand",
      )?.gl_receivable;
      setGlCashInHand(Number(CashInHand));
      const BankAccount = res.data.find(
        (item: any) => item.description?.trim().toLowerCase() == "bank account",
      )?.gl_receivable;
      setGlBankAccount(Number(BankAccount));
      const InterestIncome = res.data.find(
        (item: any) =>
          item.description?.trim().toLowerCase() == "interest income",
      )?.gl_receivable;
      setGlInterestIncome(Number(InterestIncome));
      const Discount = res.data.find(
        (item: any) => item.description?.trim().toLowerCase() == "discount",
      )?.gl_receivable;
      setGlDiscount(Number(Discount));
    } catch (err) {
      console.error(err);
      setMaintenanceMappingExists(false);
      message.error("Unable to load GL Mapping");
    }
  };

  const fetchSinkingFunds = async (flatId: number | null) => {
    if (!flatId) {
      setSinkingFunds([]);
      return;
    }

    try {
      setLoading(true);

      const flatsRes = await axios.get(`${BASE_URL}/members/flats`, {
        params: { societyId, memberId },
      });

      const flatIds = flatsRes.data.map((f: any) => Number(f.id));

      const payload = {
        flatIds,
        societyId,
        financialYearId,
      }
      const res = await axios.post(`${BASE_URL}/members/sinking-funds`,payload);

      let data = (res.data || []).filter(
        (fund: SinkingFund) =>
          fund.status !== "PAID" && Number(fund.flatId) === Number(flatId),
      );

      setSinkingFunds(data);
    } catch (err) {
      message.error("Failed to load sinking funds");
    } finally {
      setLoading(false);
    }
  };

  const selectedFunds = sinkingFunds.filter((f) =>
    selectedRowKeys.includes(f.id),
  );

  const totalAmount = selectedFunds.reduce(
    (sum, f) => sum + (f.amount || 0),
    0,
  );

  const handlePay = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Select sinking funds first");
      return;
    }

    const paymentRef = `SF-${Date.now()}`;

    const qr = `upi://pay?pa=${upi}
    &pn=${encodeURIComponent(societyName ?? "")}
    &am=${1}
    &cu=INR
    &tn=${paymentRef}`;

    setUpiUrl(qr.replace(/\s+/g, ""));
    setQrVisible(true);
  };

  const confirmPayment = async () => {
    if (!transactionId) {
      message.error("Enter UTR / Transaction Id");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/members/sinking-fund/manual-payment`, {
        sinkingFundIds: selectedRowKeys,
        memberId,
        amount: totalAmount,
        paymentMode: "UPI",
        transactionId,
        financialYearId,
        userId,
        glReceivable,
        glCreditAccount,
        glCashInHand,
        glBankAccount,
        glInterestIncome,
        glDiscount
      });

      message.success("Payment submitted. Awaiting verification.");

      setQrVisible(false);
      setTransactionId("");
      setSelectedRowKeys([]);

      fetchSinkingFunds(selectedFlat);
    } catch (error) {
      console.error(error);
      message.error("Failed to submit payment");
    }
  };

  const handleRazorPay = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Select sinking funds first");
      return;
    }

    try {
      setPayLoading(true);

      const orderRes = await axios.post(
        `${BASE_URL}/sinking-fund/create-order`,
        {
          sinkingFundIds: [...selectedRowKeys],
          memberId,
          amount: totalAmount,
        },
      );

      const order = orderRes.data;

      const options = {
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: "Society Management",
        description: "Sinking Fund Payment",
        order_id: order.razorpayOrderId,

        handler: async (response: any) => {
          await axios.post(`${BASE_URL}/sinking-fund/verify-payment`, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            sinkingFundIds: selectedRowKeys,
            memberId,
            amount: totalAmount,
            paymentMode: response.method || "ONLINE",
            financialYearId,
            userId,
          });

          message.success("Payment successful");
          setSelectedRowKeys([]);
          fetchSinkingFunds(selectedFlat);
        },
      };

      new (window as any).Razorpay(options).open();
    } catch (err) {
      message.error("Payment initiation failed");
    } finally {
      setPayLoading(false);
    }
  };

  const columns = [
    { title: "Flat No", dataIndex: "flatNo" },
    { title: "Month", dataIndex: "month" },
    { title: "Year", dataIndex: "year" },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (v: number) => `₹ ${v}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: string) => <Tag color="orange">{s}</Tag>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* SIDEBAR */}
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
        {role === "MEMBER" ? <MemberSidebar /> : <Sidebar />}
      </Layout.Sider>

      {/* MAIN AREA */}
      <Layout style={{ minWidth: 0 }}>
        {/* HEADER (NO EXTRA DIV) */}
        {role === "MEMBER" ? <MemberHeader /> : <Header />}

        {/* CONTENT */}
        <Content
          style={{
            padding: 24,
            background: "#f0f5ff",
            minWidth: 0,
            overflowX: "auto",
            overflowY: "auto",
          }}
        >
          <Title level={3}>Pending Sinking Funds</Title>

          {/* Flat Selector */}
          <div style={{ marginBottom: 12 }}>
            <Select
              placeholder="Select Flat"
              style={{ width: 220 }}
              allowClear
              options={flats.map((flat) => ({
                label: flat.flatNo,
                value: flat.id,
              }))}
              value={selectedFlat || undefined}
              onChange={(value) => {
                setSelectedFlat(value || null);
                fetchSinkingFunds(value || null);
                setSelectedRowKeys([]);
              }}
            />
          </div>

          {/* Summary */}
          <div
            style={{
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              Selected: <b>{selectedFunds.length}</b>
              {" | "}Total: <b>₹ {totalAmount}</b>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <Button
              type="primary"
              disabled={selectedRowKeys.length === 0}
              onClick={handlePay}
            >
              Pay via UPI QR
            </Button>

            <Button
              type="primary"
              style={{ marginLeft: 10 }}
              disabled={selectedRowKeys.length === 0}
              loading={payLoading}
              onClick={handleRazorPay}
            >
              Pay via Razorpay
            </Button>
          </div>
          {/* TABLE */}
          {loading ? (
            <Spin />
          ) : (
            <Table
              rowKey="id"
              dataSource={sinkingFunds}
              columns={columns}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
                getCheckboxProps: (record: SinkingFund) => ({
                  disabled: record.status !== "PENDING",
                }),
              }}
              pagination={{ pageSize: 8 }}
              bordered
              scroll={{ x: "max-content" }}
            />
          )}
          <Modal
            title="Pay Sinking Fund"
            open={qrVisible}
            onCancel={() => setQrVisible(false)}
            onOk={confirmPayment}
            okText="Submit Payment"
          >
            <div style={{ textAlign: "center" }}>
              <QRCodeCanvas value={upiUrl} size={250} />

              <div style={{ marginTop: 15 }}>
                <b>Amount:</b> ₹ {totalAmount}
              </div>

              <div style={{ marginTop: 15 }}>
                Scan using Google Pay / PhonePe / Paytm
              </div>
            </div>

            <Input
              style={{ marginTop: 20 }}
              placeholder="Enter UTR / Transaction Id"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PendingSinkingFunds;

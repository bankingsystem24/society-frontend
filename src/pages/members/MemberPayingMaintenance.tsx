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
  Input,
} from "antd";
import MemberSidebar from "../../components/layout/MemberSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";
import dayjs from "dayjs";

const today = dayjs().format("YYYY-MM-DD");

const BASE_URL = import.meta.env.VITE_API_URL;
const { Content } = Layout;
const { Title } = Typography;

type Billing = {
  id: number;
  month: string;
  year: number;
  totalAmount: number;
  interestAmount?: number;
  maintenanceAmount?: number;
  discountAmount?: number;
  status: string;
  paidDate?: string;
  paymentMode?: string;
  receiptNo?: string;
  flat?: { id?: number; flatNo?: string };
  transactionId?: string;
};

type Flat = {
  id: number;
  flatNo: string;
};

const MemberPayingMaintenance: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState<Billing[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [selectedFlat, setSelectedFlat] = useState<number | null>(null);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [payLoading, setPayLoading] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [upiUrl, setUpiUrl] = useState("");

  const memberId = Number(sessionStorage.getItem("memberId"));
  const userId = Number(sessionStorage.getItem("userId"));
  const societyId = Number(sessionStorage.getItem("societyId"));
  const societyName = sessionStorage.getItem("societyName");
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
  const role = sessionStorage.getItem("role");
  const upi = sessionStorage.getItem("upi");

  const [maintenanceMappingExists, setMaintenanceMappingExists] =
    useState(false);

  const [glReceivable, setGlReceivable] = useState<number>(0);
  const [glCreditAccount, setGlCreditAccount] = useState<number>(0);

  const [glCashInHand, setGlCashInHand] = useState<number>(0);
  const [glBankAccount, setGlBankAccount] = useState<number>(0);
  const [glInterestIncome, setGlInterestIncome] = useState<number>(0);
  const [glDiscount, setGlDiscount] = useState<number>(0);
  const [payableAmount, setPayableAmount] = useState(0);

  useEffect(() => {
    loadFlats();
    loadGlMapping();
  }, []);

  useEffect(() => {}, [
    glCashInHand,
    glBankAccount,
    glInterestIncome,
    glDiscount,
    glReceivable,
    glCreditAccount,
  ]);

  const loadFlats = async () => {
    if (memberId && societyId) {
      try {
        const res = await axios.get(`${BASE_URL}/members/flats`, {
          params: { societyId, memberId },
        });

        const flatsData = res.data || [];

        setFlats(flatsData);

        // ✅ Auto select first flat
        if (flatsData.length > 0) {
          const firstFlatId = flatsData[0].id;

          setSelectedFlat(firstFlatId);

          fetchBills(firstFlatId);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const loadGlMapping = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/gl/master/mapping?societyId=${societyId}`,
      );

      const mapping = res.data.find(
        (item: any) =>
          item.description?.trim().toLowerCase() === "monthly maintenance",
      );

      if (!mapping) {
        setMaintenanceMappingExists(false);
        message.error("Monthly Maintenance GL Mapping not configured");
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

  const fetchBills = async (flatId: number | null) => {
    if (!flatId) {
      setBills([]);
      return;
    }

    try {
      setLoading(true);

      const flatsRes = await axios.get(`${BASE_URL}/members/flats`, {
        params: { societyId, memberId },
      });

      const flatIds = flatsRes.data.map((f: any) => Number(f.id));

      const billsRes = await axios.post(`${BASE_URL}/members/bills`, {
        flatIds,
        societyId,
        financialYearId,
      });

      let pending = (billsRes.data || []).filter(
        (b: Billing) => b.status !== "PAID",
      );

      pending = pending.filter((b: Billing) => b.flat?.id === flatId);

      setBills(pending);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedBills = bills.filter((b) => selectedRowKeys.includes(b.id));

  const totalMaintenance = selectedBills.reduce(
    (sum, b) => sum + (b.maintenanceAmount || 0),
    0,
  );

  const totalInterest = selectedBills.reduce(
    (sum, b) => sum + (b.interestAmount || 0),
    0,
  );

  const totalDiscount = selectedBills.reduce(
    (sum, b) => sum + (b.discountAmount || 0),
    0,
  );

  const totalAmount = selectedBills.reduce(
    (sum, b) => sum + (b.totalAmount || 0),
    0,
  );

  const handlePay = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Select bills first");
      return;
    }
    let amount = 0.0;
    if (selectedRowKeys.length === 12) {
      const payload = {
        billIds: selectedRowKeys,
        paymentDate: today,
        financialYearId,
        selectedCount: selectedRowKeys.length,
      };
      const discount = await axios.post(
        `${BASE_URL}/billing/calculate-discount`,
        payload,
      );

      const discountAmount = discount.data.discountAmount || 0;
      amount = totalAmount - discountAmount;

      setPayableAmount(amount);

    }

    const billRef = `BILL-${Date.now()}`;
    const societyUpiId = upi; // from DB/API

    const qr = `upi://pay?pa=${societyUpiId}
    &pn=${encodeURIComponent(societyName ?? "")}
    &am=${1}
    // &am=${amount.toFixed(2)}
    &cu=INR
    &tn=${billRef}`;

    setUpiUrl(qr.replace(/\s+/g, ""));
    setQrVisible(true);
  };

  const confirmPayment = async () => {
    if (!transactionId) {
      message.error("Enter UTR / Transaction Id");
      return;
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/billing/member/manual-payment`,
        {
          billIds: selectedRowKeys,
          memberId,
          amount: Math.round(totalAmount),
          paymentMode: "UPI",
          transactionId,
          financialYearId,
          userId,
          glReceivable,
          glCreditAccount,
          glCashInHand,
          glBankAccount,
          glInterestIncome,
          glDiscount,
          interestAmount: Math.round(totalInterest),
          discountAmount: Math.round(totalDiscount),
          selectedCount: selectedRowKeys.length,
          societyId,
        },
      );
      console.log("Response:", res);

      message.success("Payment submitted. Awaiting verification.");

      setQrVisible(false);
      setTransactionId("");
      setSelectedRowKeys([]);

      fetchBills(selectedFlat);
    } catch (error) {
      console.error(error);
      message.error("Failed to submit payment");
    }
  };

  const columns = [
    {
      title: "Flat No",
      dataIndex: ["flat", "flatNo"],
    },
    {
      title: "Month",
      dataIndex: "month",
    },
    {
      title: "Year",
      dataIndex: "year",
    },
    {
      title: "Maintenance",
      dataIndex: "maintenanceAmount",
      render: (v: number) => `₹ ${v}`,
    },
    {
      title: "Interest",
      dataIndex: "interestAmount",
      render: (v: number) => `₹ ${v}`,
    },
    {
      title: "Discount",
      dataIndex: "discountAmount",
      render: (v: number) => `₹ ${v}`,
    },

    {
      title: "Amount",
      dataIndex: "totalAmount",
      render: (v: number) => `₹ ${v}`,
    },
    {
      title: "TransactionId",
      dataIndex: "transactionId",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: string) => <Tag color="orange">{s}</Tag>,
    },
  ];

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

        <Content style={{ padding: 24, background: "#f0f5ff" }}>
          {/* <Title level={5}>Pending Bills (Member Paying Online)</Title> */}

          {/* ================= FLAT FILTER ================= */}
          <div style={{ marginBottom: 12 }}>
            {" "}
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              Pending Bills (Member Paying Online) :{" "}
            </span>
            <Select
              placeholder="Select Flat"
              style={{ width: 220 }}
              allowClear
              options={flats.map((f) => ({
                label: f.flatNo,
                value: f.id,
              }))}
              value={selectedFlat || undefined}
              onChange={(val) => {
                setSelectedFlat(val || null);
                fetchBills(val || null);
                setSelectedRowKeys([]);
              }}
            />
          </div>

          {/* ================= SUMMARY BAR ================= */}
          <div
            style={{
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              Selected: <b>{selectedBills.length}</b>
              {" | "}Maintenance: <b>₹ {totalMaintenance}</b>
              {" | "}Interest: <b>₹ {totalInterest}</b>
              {" | "}Discount: <b>₹ {totalDiscount}</b>
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

            {/* <Button
              type="primary"
              style={{ marginLeft:10}}
              disabled={selectedRowKeys.length === 0}
              onClick={handleRazorPay}
            >
              Pay via(Razorpa y)
            </Button> */}
          </div>
          {/* ================= TABLE ================= */}
          {loading ? (
            <Spin size="large" />
          ) : (
            <Table
              rowKey="id"
              dataSource={bills}
              columns={columns}
              size="small"
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
                getCheckboxProps: (record: Billing) => ({
                  disabled: record.status !== "PENDING",
                }),
              }}
              pagination={{ pageSize: 12 }}
              bordered
            />
          )}
          <Modal
            title="Pay Maintenance Bill"
            open={qrVisible}
            onCancel={() => setQrVisible(false)}
            onOk={confirmPayment}
            okText="Submit Payment"
          >
            <div style={{ textAlign: "center" }}>
              <QRCodeCanvas value={upiUrl} size={250} />

              <div style={{ marginTop: 15 }}>
                <b>Amount:</b> ₹ {payableAmount}
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

export default MemberPayingMaintenance;

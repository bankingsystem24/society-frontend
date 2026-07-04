import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Table,
  message,
  Layout,
} from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import type { ColumnsType } from "antd/es/table";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";

const BASE_URL = import.meta.env.VITE_API_URL;

const { Content } = Layout;
const role = sessionStorage.getItem("role");

interface Flat {
  id: number;
  flatNo: string;
}

interface Bill {
  id: number;
  month: string;
  year: number;
  maintenanceAmount: number;
  penaltyAmount: number;
  interestAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: string;
  dueDate: string;
  createdDate: string;
  flatNo: string;
  memberName: string;
  transactionId: string;
}

interface Members {
  id: number;
  name: string;
}

const months = [
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
  "JANUARY",
  "FEBRUARY",
  "MARCH",
];

export default function ViewBills() {
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [members, setMembers] = useState<Members[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<string>("CASH");
  const [transactionId, setTransactionId] = useState<string>("");

  const [form] = Form.useForm();
  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
  const [maintenanceMappingExists, setMaintenanceMappingExists] =
    useState(false);

  const [glReceivable, setGlReceivable] = useState<number>(0);
  const [glCreditAccount, setGlCreditAccount] = useState<number>(0);

  const [glCashInHand, setGlCashInHand] = useState<number>(0);
  const [glBankAccount, setGlBankAccount] = useState<number>(0);
  const [glInterestIncome, setGlInterestIncome] = useState<number>(0);
  const [glDiscount, setGlDiscount] = useState<number>(0);

  const [paymentMaintenance, setPaymentMaintenance] = useState(0);
  const [paymentInterest, setPaymentInterest] = useState(0);
  const [paymentDiscount, setPaymentDiscount] = useState(0);

  const paymentTotal = paymentMaintenance + paymentInterest + paymentDiscount;

  useEffect(() => {
    loadFlats();
    loadBills();
    loadMembers();
    loadGlMapping();
  }, []);

  useEffect(() => {}, [
    glCashInHand,
    glBankAccount,
    glInterestIncome,
    glDiscount,
  ]);

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

  const loadFlats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/flats?societyId=${societyId}`);
      setFlats(res.data);
    } catch {
      message.error("Failed to load flats");
    }
  };

  const loadBills = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/billing/viewAllBills`, {
        societyId: societyId,
        financialYearId: financialYearId,
      });
      setBills(res.data);
      console.log("Bills loaded:", res.data);
    } catch {
      message.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const selectedBills = bills.filter((b) => selectedRowKeys.includes(b.id));

  const selectedFlatNo =
    selectedBills.length > 0 ? selectedBills[0].flatNo : null;

  const loadMembers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/members?societyId=${societyId}`);
      setMembers(res.data);
    } catch {
      message.error("Failed to load members");
    }
  };

  const handlePay = async () => {
    try {
      const billIds = selectedRowKeys.map(Number);

      const payload = {
        billIds,
        paymentMode,
        financialYearId,
        transactionId,

        maintenanceAmount: paymentMaintenance,
        interestAmount: paymentInterest,
        discountAmount: paymentDiscount,
        totalAmount: paymentTotal,

        glReceivable,
        glCreditAccount,
        glCashInHand,
        glBankAccount,
        glInterestIncome,
        glDiscount,
      };

      console.log("Payment payload:", payload);

      const res = await axios.put(`${BASE_URL}/billing/pay`, payload);

      // message.success(res.data);
      setSelectedRowKeys([]);
      setPaymentModalOpen(false);
      loadBills();
    } catch {
      message.error("Payment failed");
    }
  };

  const filterBills = async () => {
    try {
      setLoading(true);

      const values = form.getFieldsValue();

      const payload = {
        societyId: Number(societyId),
        flatId: values.flatId || null,
        fromYear: values.fromYear || null,
        month: values.month || null,
        status: values.status || null,
        memberId: values.memberId || null,
        financialYearId: financialYearId,
      };
      const res = await axios.post(`${BASE_URL}/billing/viewAllBills`, payload);
      setBills(res.data);
    } catch {
      message.error("Failed to filter bills");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Bill> = [
    { title: "Flat", dataIndex: "flatNo" },
    { title: "Member", dataIndex: "memberName" },
    { title: "Month", dataIndex: "month" },
    { title: "Year", dataIndex: "year" },
    { title: "Maintenance", dataIndex: "maintenanceAmount" },
    { title: "Interest", dataIndex: "interestAmount" },
    { title: "Penalty", dataIndex: "penaltyAmount" },
    { title: "Discount", dataIndex: "discountAmount" },

    { title: "Total", dataIndex: "totalAmount" },
    { title: "Trans.Id", dataIndex: "transactionId" },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: string) => (
        <span
          style={{
            color:
              text === "PAID" ? "green" : text === "PENDING" ? "orange" : "red",
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      render: (text: string) => new Date(text).toLocaleDateString("en-GB"),
    },
    {},
  ];

  const totalMaintenance = bills.reduce(
    (s, b) => s + (b.maintenanceAmount || 0),
    0,
  );
  const totalPenalty = bills.reduce((s, b) => s + (b.penaltyAmount || 0), 0);
  const totalInterest = bills.reduce((s, b) => s + (b.interestAmount || 0), 0);
  const totalDiscount = bills.reduce((s, b) => s + (b.discountAmount || 0), 0);

  const grandTotal = bills.reduce((s, b) => s + (b.totalAmount || 0), 0);

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
          <Card title="View Bills">
            {/* ================= FILTER SECTION ================= */}
            <Form form={form} layout="vertical">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  marginBottom: 5,
                  marginTop: -5,
                }}
              >
                {/* Flat */}
                <div style={{ flex: "1 1 100px", minWidth: 100 }}>
                  <Form.Item label="Flat" name="flatId">
                    <Select
                      allowClear
                      placeholder="Select Flat"
                      onChange={filterBills}
                      options={flats.map((f) => ({
                        label: f.flatNo,
                        value: f.id,
                      }))}
                    />
                  </Form.Item>
                </div>

                {/* Year */}
                <div style={{ flex: "1 1 100px", minWidth: 100 }}>
                  <Form.Item label="Financial Year" name="fromYear">
                    <Select
                      allowClear
                      onChange={filterBills}
                      options={[
                        { label: "2024-2025", value: 2024 },
                        { label: "2025-2026", value: 2025 },
                        { label: "2026-2027", value: 2026 },
                      ]}
                    />
                  </Form.Item>
                </div>

                {/* Month */}
                <div style={{ flex: "1 1 100px", minWidth: 100 }}>
                  <Form.Item label="Month" name="month">
                    <Select
                      allowClear
                      onChange={filterBills}
                      options={months.map((m) => ({ label: m, value: m }))}
                    />
                  </Form.Item>
                </div>

                {/* Status */}
                <div style={{ flex: "1 1 100px", minWidth: 100 }}>
                  <Form.Item label="Status" name="status">
                    <Select
                      allowClear
                      onChange={filterBills}
                      options={[
                        { label: "PENDING", value: "PENDING" },
                        { label: "SUBMITTED", value: "SUBMITTED" },
                        { label: "PAID", value: "PAID" },
                        { label: "OVERDUE", value: "OVERDUE" },
                      ]}
                    />
                  </Form.Item>
                </div>

                {/* Member */}
                <div style={{ flex: "1 1 100px", minWidth: 100 }}>
                  <Form.Item label="Member" name="memberId">
                    <Select
                      allowClear
                      onChange={filterBills}
                      options={members.map((m) => ({
                        label: m.name,
                        value: m.id,
                      }))}
                    />
                  </Form.Item>
                </div>
              </div>
            </Form>

            {/* ================= SUMMARY CARDS ================= */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                marginBottom: 5,
              }}
            >
              <div style={{ flex: "1 1 100px", minWidth: 100 }}>
                <Card styles={{ body: { padding: "6px 10px" } }}>
                  <div style={{ fontSize: 13 }}>Total Maintenance</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    ₹ {totalMaintenance.toFixed(2)}
                  </div>
                </Card>
              </div>

              <div style={{ flex: "1 1 100px", minWidth: 100 }}>
                <Card styles={{ body: { padding: "6px 10px" } }}>
                  <div style={{ fontSize: 13 }}>Total Penalty</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    ₹ {totalPenalty.toFixed(2)}
                  </div>
                </Card>
              </div>

              <div style={{ flex: "1 1 100px", minWidth: 100 }}>
                <Card styles={{ body: { padding: "6px 10px" } }}>
                  <div style={{ fontSize: 13 }}>Total Interest</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    ₹ {totalInterest.toFixed(2)}
                  </div>
                </Card>
              </div>

              <div style={{ flex: "1 1 100px", minWidth: 100 }}>
                <Card styles={{ body: { padding: "6px 10px" } }}>
                  <div style={{ fontSize: 13 }}>Total Discount</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    ₹ {totalDiscount.toFixed(2)}
                  </div>
                </Card>
              </div>

              <div style={{ flex: "1 1 100px", minWidth: 100 }}>
                <Card styles={{ body: { padding: "6px 10px" } }}>
                  <div style={{ fontSize: 13 }}>Grand Total</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    ₹ {grandTotal.toFixed(2)}
                  </div>
                </Card>
              </div>
            </div>

            {/* ================= BUTTON ================= */}
            <div style={{ marginBottom: 12 }}>
              <Button
                type="primary"
                disabled={selectedRowKeys.length === 0}
                onClick={() => {
                  setPaymentMaintenance(
                    selectedBills.reduce(
                      (s, b) => s + (b.maintenanceAmount || 0),
                      0,
                    ),
                  );
                  setPaymentInterest(
                    selectedBills.reduce(
                      (s, b) => s + (b.interestAmount || 0),
                      0,
                    ),
                  );
                  setPaymentDiscount(
                    selectedBills.reduce(
                      (s, b) => s + (b.discountAmount || 0),
                      0,
                    ),
                  );
                  setPaymentModalOpen(true);
                }}
              >
                Payment Received by Admin ({selectedRowKeys.length})
              </Button>
            </div>

            {/* ================= TABLE ================= */}
            <Table
              rowKey="id"
              columns={columns}
              dataSource={bills}
              loading={loading}
              size="small"
              scroll={{ x: 800 }}
              pagination={{ pageSize: 8 }}
              rowSelection={{
                selectedRowKeys,
                hideSelectAll: true,
                onChange: setSelectedRowKeys,
                getCheckboxProps: (record) => ({
                  disabled:
                    record.status !== "PENDING" ||
                    (selectedFlatNo !== null &&
                      record.flatNo !== selectedFlatNo &&
                      !selectedRowKeys.includes(record.id)),
                }),
              }}
            />

            {/* ================= PAYMENT MODAL ================= */}
            <Modal
              title="Select Payment Method"
              open={paymentModalOpen}
              onCancel={() => setPaymentModalOpen(false)}
              onOk={handlePay}
              okText="Pay Now"
            >
              <Form layout="vertical">
                <Form.Item label="Payment Method">
                  <Select
                    value={paymentMode}
                    onChange={setPaymentMode}
                    options={[
                      { label: "CASH", value: "CASH" },
                      { label: "UPI", value: "UPI" },
                      { label: "CARD", value: "CARD" },
                      { label: "NETBANKING", value: "NETBANKING" },
                    ]}
                  />
                </Form.Item>
                <Form.Item label="Maintenance">
                  <Input
                    type="number"
                    value={paymentMaintenance}
                    onChange={(e) =>
                      setPaymentMaintenance(Number(e.target.value) || 0)
                    }
                  />
                </Form.Item>

                <Form.Item label="Interest">
                  <Input
                    type="number"
                    value={paymentInterest}
                    onChange={(e) =>
                      setPaymentInterest(Number(e.target.value) || 0)
                    }
                  />
                </Form.Item>

                <Form.Item label="Discount">
                  <Input
                    type="number"
                    value={paymentDiscount}
                    onChange={(e) =>
                      setPaymentDiscount(Number(e.target.value) || 0)
                    }
                  />
                </Form.Item>

                <Form.Item label="Total">
                  <Input value={paymentTotal.toFixed(2)} readOnly />
                </Form.Item>

                {paymentMode !== "CASH" && (
                  <Form.Item
                    label="Transaction Id"
                    required
                    rules={[
                      {
                        required: true,
                        message: "Please enter Transaction Id",
                      },
                    ]}
                  >
                    <Input
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter transaction id"
                    />
                  </Form.Item>
                )}
              </Form>
            </Modal>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
}

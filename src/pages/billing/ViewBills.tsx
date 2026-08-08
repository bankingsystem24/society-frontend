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
  DatePicker,
  Popconfirm,
  Row,
  Col,
  Checkbox,
  Space,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
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
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { apiGet } from "../../api/axios";

dayjs.extend(isSameOrBefore);

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
  flatId: number;
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
  const [paymentMode, setPaymentMode] = useState<string>("UPI");
  const [transactionId, setTransactionId] = useState<string>("");
  const [form] = Form.useForm();
  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
  const [maintenanceMappingExists, setMaintenanceMappingExists] =
    useState(false);
  const [paymentDate, setPaymentDate] = useState(dayjs());
  const [glReceivable, setGlReceivable] = useState<number>(0);
  const [glCreditAccount, setGlCreditAccount] = useState<number>(0);
  const [glCashInHand, setGlCashInHand] = useState<number>(0);
  const [glBankAccount, setGlBankAccount] = useState<number>(0);
  const [glInterestIncome, setGlInterestIncome] = useState<number>(0);
  const [glDiscount, setGlDiscount] = useState<number>(0);
  const [paymentMaintenance, setPaymentMaintenance] = useState(0);
  const [paymentInterest, setPaymentInterest] = useState(0);
  const [currentDiscount, setCurrentDiscount] = useState(0);
  const [pendingDiscount, setPendingDiscount] = useState(0);
  const [discountPolicy, setDiscountPolicy] = useState<any>(null);
  const totalPaymentDiscount = currentDiscount + pendingDiscount;
  const paymentTotal =
    paymentMaintenance + paymentInterest - totalPaymentDiscount;
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [maintenancePolicy, setMaintenancePolicy] = useState<any>(null);
  const pendingAmount = Math.max(paymentTotal - paidAmount);
  const [discountEligible, setDiscountEligible] = useState(false);
  const defaultAmountSelection = {
    maintenance: true,
    interest: true, // always true, compulsory
    penalty: true,
    discount: true,
  };

  const [amountSelections, setAmountSelections] = useState<
    Record<
      number,
      {
        maintenance: boolean;
        interest: boolean;
        penalty: boolean;
        discount: boolean;
      }
    >
  >({});

  useEffect(() => {
    loadFlats();
    loadBills();
    loadMembers();
    loadGlMapping();
    loadDiscountPolicy();
    loadMaintenancePolicy();
  }, []);

  useEffect(() => {}, [
    glCashInHand,
    glBankAccount,
    glInterestIncome,
    glDiscount,
  ]);

  const loadMaintenancePolicy = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/maintenance-policy/society/${societyId}/financial-year/${financialYearId}`,
      );
      const activePolicy = Array.isArray(res.data)
        ? res.data.find((p: any) => p.active)
        : res.data;
      setMaintenancePolicy(activePolicy || null);
    } catch (err) {
      console.error(err);
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

      const sortedBills = res.data.sort((a: any, b: any) =>
        a.flatNo.localeCompare(b.flatNo, undefined, {
          numeric: true,
          sensitivity: "base",
        }),
      );

      setBills(sortedBills);
    } catch {
      message.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const selectedBills = bills.filter((b) => selectedRowKeys.includes(b.id));
  const selectedFlatNo =
    selectedBills.length > 0 ? selectedBills[0].flatNo : null;
  const selectedFlatId =
    selectedBills.length > 0 ? selectedBills[0].flatId : null;

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

      if (!paidAmount || paidAmount <= 0) {
        message.error("Please enter a valid Paid Amount");
        return;
      }

      const billsPayload = selectedBills.map((b) => {
        const sel = amountSelections[b.id] ?? defaultAmountSelection;

        const maintenance =
          sel.maintenance !== false ? b.maintenanceAmount || 0 : 0;
        const interest = b.interestAmount || 0; // always included, compulsory
        const penalty = sel.penalty !== false ? b.penaltyAmount || 0 : 0;
        const discount = sel.discount !== false ? b.discountAmount || 0 : 0;

        const billTotal = maintenance + interest + penalty - discount;

        return {
          billId: b.id,
          maintenanceAmount: maintenance,
          interestAmount: interest,
          penaltyAmount: penalty,
          discountAmount: discount,
          totalAmount: billTotal,
        };
      });

      const payload = {
        billIds,
        bills: billsPayload, // NEW — id-wise breakdown
        paymentMode,
        paymentDate: paymentDate.format("YYYY-MM-DD"),
        financialYearId,
        transactionId,
        maintenanceAmount: paymentMaintenance,
        interestAmount: paymentInterest,
        currentDiscount,
        pendingDiscount,
        discountAmount: totalPaymentDiscount,
        paidAmount,
        pendingAmount,
        totalAmount: paymentTotal,
        glReceivable,
        glCreditAccount,
        glCashInHand,
        glBankAccount,
        glInterestIncome,
        glDiscount,
        selectedCount: selectedRowKeys.length,
      };

      console.log("Payload:",payload);
      
      //const res = await axios.put(`${BASE_URL}/billing/pay`, payload);
      //message.success(res.data);
      setSelectedRowKeys([]);
      setPaymentModalOpen(false);
      setPaymentDate(dayjs());
      setPaidAmount(0);
      loadBills();
    } catch {
      message.error("Payment failed");
    }
  };

  const loadDiscountPolicy = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/discount-policy/society/${societyId}`,
      );
      const activePolicy = res.data.find((p: any) => p.active);
      setDiscountPolicy(activePolicy || null);
    } catch (err) {
      console.error(err);
    }
  };

  const filterBills = async () => {
    try {
      setLoading(true);

      const values = form.getFieldsValue();

      const payload = {
        societyId: Number(societyId),
        flatId: values.flatId || null,
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
    { title: "BillType", dataIndex: "billType" },
    { title: "Month", dataIndex: "month" },
    { title: "Year", dataIndex: "year" },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      render: (text: string) => new Date(text).toLocaleDateString("en-GB"),
    },
    {
      title: "Maintenance",
      dataIndex: "maintenanceAmount",
      render: (value: number, record: Bill) => {
        const isRowSelected = selectedRowKeys.includes(record.id);
        const checked = amountSelections[record.id]?.maintenance ?? true;
        return <Space>{value}</Space>;
      },
    },
    {
      title: "Interest",
      dataIndex: "interestAmount",
      render: (value: number, record: Bill) => {
        const isRowSelected = selectedRowKeys.includes(record.id);
        return (
          <Space>
            {/* <Checkbox checked disabled title="Interest is compulsory" /> */}
            {value}
          </Space>
        );
      },
    },
    {
      title: "Penalty",
      dataIndex: "penaltyAmount",
      render: (value: number, record: Bill) => {
        const isRowSelected = selectedRowKeys.includes(record.id);
        const checked = amountSelections[record.id]?.penalty ?? true;
        return <Space>{value}</Space>;
      },
    },
    {
      title: "Discount",
      dataIndex: "discountAmount",
      render: (value: number, record: Bill) => {
        const isRowSelected = selectedRowKeys.includes(record.id);
        const checked = amountSelections[record.id]?.discount ?? true;
        return <Space>{value}</Space>;
      },
    },
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
  ];

  const loadPendingDiscount = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/discount/pending?societyId=${societyId}&flatId=${selectedFlatId}&financialYearId=${financialYearId}`,
      );

      setPendingDiscount(res.data.pendingDiscount || 0);
    } catch (err) {
      console.error(err);
      setPendingDiscount(0);
    }
  };

  const calculateInterest = async (date: dayjs.Dayjs | null) => {
    if (!date || selectedRowKeys.length === 0) return;

    try {
      const res = await axios.post(`${BASE_URL}/billing/calculate-interest`, {
        billIds: selectedRowKeys,
        paymentDate: date.format("YYYY-MM-DD"),
        financialYearId,
      });

      setPaymentInterest(res.data.interestAmount);
      setPaymentMaintenance(res.data.maintenanceAmount);

      const discount = Math.round(
        computeDiscount(date, res.data.maintenanceAmount),
      );
      setCurrentDiscount(discount);
      setPaidAmount(
        res.data.maintenanceAmount +
          res.data.interestAmount -
          (discount + pendingDiscount),
      );
    } catch (err) {
      message.error("Unable to calculate interest.");
    }
  };

  const DISCOUNT_ELIGIBLE_MONTHS = ["APRIL", "JULY", "OCTOBER", "JANUARY"];

  const computeDiscount = (date: dayjs.Dayjs, maintenanceAmount: number) => {
    if (!discountPolicy || !discountPolicy.active) {
      setDiscountEligible(false);
      return 0;
    }

    const selectedMonths = selectedBills.map((b) => b.month);
    const isEligibleMonthCombo =
      selectedMonths.length === DISCOUNT_ELIGIBLE_MONTHS.length &&
      DISCOUNT_ELIGIBLE_MONTHS.every((m) => selectedMonths.includes(m));

    const requiredCount =
      maintenancePolicy?.billingFrequency === "MONTHLY"
        ? 12
        : maintenancePolicy?.billingFrequency === "QUARTERLY"
          ? 4
          : null;

    const isEligibleCount =
      requiredCount !== null && selectedRowKeys.length === requiredCount;

    const isWithinDeadline = date.isSameOrBefore(
      dayjs(discountPolicy.paidBeforeDate),
      "day",
    );

    const eligible =
      isEligibleCount && isEligibleMonthCombo && isWithinDeadline;
    setDiscountEligible(eligible);
    if (eligible) {
      return (maintenanceAmount * discountPolicy.discountPercent) / 100;
    }

    return 0;
  };

  const totalsSource = selectedRowKeys.length > 0 ? selectedBills : bills;

  const totalMaintenance = totalsSource.reduce(
    (s, b) => s + (b.maintenanceAmount || 0),
    0,
  );
  const totalPenalty = totalsSource.reduce(
    (s, b) => s + (b.penaltyAmount || 0),
    0,
  );
  const totalInterest = totalsSource.reduce(
    (s, b) => s + (b.interestAmount || 0),
    0,
  );
  const totalDiscount = totalsSource.reduce(
    (s, b) => s + (b.discountAmount || 0),
    0,
  );

  const grandTotal = totalsSource.reduce((s, b) => s + (b.totalAmount || 0), 0);
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
                      showSearch
                      allowClear
                      placeholder="Select Flat"
                      optionFilterProp="label"
                      onChange={filterBills}
                      filterOption={(input, option) =>
                        (option?.label as string)
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={flats.map((f) => ({
                        label: f.flatNo,
                        value: f.id,
                      }))}
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
                      showSearch
                      allowClear
                      placeholder="Search Member"
                      optionFilterProp="label"
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
                onClick={async () => {
                  try {
                    const response = await axios.get(
                      `${BASE_URL}/accounting-year/${societyId}/year/${financialYearId}/status`,
                    );
                    const isClosed =
                      response.data === "Closed" ||
                      response.data?.status === "Closed";
                    if (isClosed) {
                      message.error(
                        "This financial year is closed. You cannot add or edit records.",
                      );
                      return;
                    }
                    if (!glReceivable || !glCreditAccount) {
                      message.error(
                        "Monthly Maintenance GL Mapping not configured",
                      );
                      return;
                    }

                    const maintenance = selectedBills.reduce(
                      (s, b) =>
                        s +
                        (amountSelections[b.id]?.maintenance !== false
                          ? b.maintenanceAmount || 0
                          : 0),
                      0,
                    );

                    const interest = selectedBills.reduce(
                      (s, b) => s + (b.interestAmount || 0),
                      0,
                    );

                    const penalty = selectedBills.reduce(
                      (s, b) =>
                        s +
                        (amountSelections[b.id]?.penalty !== false
                          ? b.penaltyAmount || 0
                          : 0),
                      0,
                    );

                    const discount = computeDiscount(paymentDate, maintenance);

                    setPaymentMaintenance(maintenance);
                    setPaymentInterest(interest);
                    setCurrentDiscount(discount);
                    setPaidAmount(
                      maintenance + interest - (discount + pendingDiscount),
                    );
                    await loadPendingDiscount();
                    calculateInterest(paymentDate);
                    setPaymentModalOpen(true);
                    calculateInterest(paymentDate);
                    setTransactionId(selectedFlatNo || "");
                  } catch (error) {
                    message.error("Unable to verify accounting year status.");
                  }
                }}
              >
                Payment Received by Admin ({selectedRowKeys.length})
              </Button>
              <Button danger style={{ marginLeft: 40 }}>
                Delete All Pending Bills
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
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                responsive: true,
              }}
              rowSelection={{
                selectedRowKeys,
                hideSelectAll: true,
                onChange: (keys) => {
                  setSelectedRowKeys(keys);

                  setAmountSelections((prev) => {
                    const updated: typeof prev = {};
                    keys.forEach((key) => {
                      const id = Number(key);
                      updated[id] = prev[id] ?? { ...defaultAmountSelection };
                    });
                    return updated;
                  });
                },
                getCheckboxProps: (record) => ({
                  disabled:
                    (record.status !== "PENDING" &&
                      record.status !== "PARTIAL") ||
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
              okButtonProps={{ disabled: !paidAmount || paidAmount <= 0 }}
            >
              <Form layout="vertical">
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
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
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Payment Date" required>
                      <DatePicker
                        style={{ width: "100%" }}
                        value={paymentDate}
                        format="DD-MM-YYYY"
                        onChange={(date) => {
                          if (date) {
                            setPaymentDate(date);
                            calculateInterest(date); // now also recalculates discount
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Maintenance">
                      <Input
                        type="number"
                        value={paymentMaintenance}
                        readOnly
                        onChange={(e) =>
                          setPaymentMaintenance(Number(e.target.value) || 0)
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Interest">
                      <Input
                        type="number"
                        value={paymentInterest}
                        readOnly
                        onChange={(e) =>
                          setPaymentInterest(Number(e.target.value) || 0)
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Current Discount">
                      <Input
                        type="number"
                        value={currentDiscount}
                        onChange={(e) => {
                          const value = Number(e.target.value) || 0;

                          setCurrentDiscount(value);

                          setPaidAmount(
                            paymentMaintenance +
                              paymentInterest -
                              (value + pendingDiscount),
                          );
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Pending Discount">
                      <Input value={pendingDiscount.toFixed(2)} readOnly />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Total Discount">
                      <Input value={totalPaymentDiscount.toFixed(2)} readOnly />
                    </Form.Item>
                  </Col>{" "}
                  <Col xs={24} sm={12}>
                    <Form.Item label="Total">
                      <Input value={paymentTotal.toFixed(2)} readOnly />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Paid Amount">
                      <Input
                        type="number"
                        value={paidAmount}
                        onChange={(e) =>
                          setPaidAmount(Number(e.target.value) || 0)
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Pending Amount">
                      <Input value={pendingAmount.toFixed(2)} readOnly />
                    </Form.Item>
                  </Col>
                  {paymentMode !== "CASH" && (
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Transaction Id"
                        initialValue={"flatNo"}
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
                    </Col>
                  )}
                </Row>
              </Form>
            </Modal>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
}

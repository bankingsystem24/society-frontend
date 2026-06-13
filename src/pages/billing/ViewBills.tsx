import { Button, Card, Form, Modal, Select, Table, message } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import type { ColumnsType } from "antd/es/table";

const BASE_URL = import.meta.env.VITE_API_URL;

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
  discountAmount:number;
  totalAmount: number;
  status: string;
  dueDate: string;
  createdDate: string;
  flatNo: string;
  memberName: string;
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

  const [form] = Form.useForm();
  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

  useEffect(() => {
    loadFlats();
    loadBills();
    loadMembers();
  }, []);

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
        financialYearId:financialYearId,
      });
      setBills(res.data);
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

      const res = await axios.put(`${BASE_URL}/billing/pay`, {
        billIds,
        paymentMode,
        financialYearId,
      });

      message.success(res.data);
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
        financialYearId:financialYearId,
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
    <Card title="View Bills">
      {/* ================= FILTER SECTION ================= */}
      <Form form={form} layout="vertical">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 16,
          }}
        >
          {/* Flat */}
          <div style={{ flex: "1 1 220px", minWidth: 220 }}>
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
          <div style={{ flex: "1 1 220px", minWidth: 220 }}>
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
          <div style={{ flex: "1 1 220px", minWidth: 220 }}>
            <Form.Item label="Month" name="month">
              <Select
                allowClear
                onChange={filterBills}
                options={months.map((m) => ({ label: m, value: m }))}
              />
            </Form.Item>
          </div>

          {/* Status */}
          <div style={{ flex: "1 1 220px", minWidth: 220 }}>
            <Form.Item label="Status" name="status">
              <Select
                allowClear
                onChange={filterBills}
                options={[
                  { label: "PENDING", value: "PENDING" },
                  { label: "PAID", value: "PAID" },
                  { label: "OVERDUE", value: "OVERDUE" },
                ]}
              />
            </Form.Item>
          </div>

          {/* Member */}
          <div style={{ flex: "1 1 220px", minWidth: 220 }}>
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
          marginBottom: 20,
        }}
      >
        <div style={{ flex: "1 1 220px", minWidth: 220 }}>
          <Card styles={{ body: { padding: "6px 10px" } }}>
            <div style={{ fontSize: 13 }}>Total Maintenance</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              ₹ {totalMaintenance.toFixed(2)}
            </div>
          </Card>
        </div>

        <div style={{ flex: "1 1 220px", minWidth: 220 }}>
          <Card styles={{ body: { padding: "6px 10px" } }}>
            <div style={{ fontSize: 13 }}>Total Penalty</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              ₹ {totalPenalty.toFixed(2)}
            </div>
          </Card>
        </div>

        <div style={{ flex: "1 1 220px", minWidth: 220 }}>
          <Card styles={{ body: { padding: "6px 10px" } }}>
            <div style={{ fontSize: 13 }}>Total Interest</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              ₹ {totalInterest.toFixed(2)}
            </div>
          </Card>
        </div>

        <div style={{ flex: "1 1 220px", minWidth: 220 }}>
          <Card styles={{ body: { padding: "6px 10px" } }}>
            <div style={{ fontSize: 13 }}>Total Discount</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              ₹ {totalDiscount.toFixed(2)}
            </div>
          </Card>
        </div>

        <div style={{ flex: "1 1 220px", minWidth: 220 }}>
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
          onClick={() => setPaymentModalOpen(true)}
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
        pagination={{pageSize: 8,}}
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
        </Form>
      </Modal>
    </Card>
  );
}

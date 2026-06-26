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
};

type Flat = {
  id: number;
  flatNo: string;
};

const PendingBills: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState<Billing[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [selectedFlat, setSelectedFlat] = useState<number | null>(null);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [payLoading, setPayLoading] = useState(false);

  const memberId = Number(sessionStorage.getItem("memberId"));
  const societyId = Number(sessionStorage.getItem("societyId"));
  const userId = Number(sessionStorage.getItem("userId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

  useEffect(() => {
    loadFlats();
  }, []);

  const loadFlats = async () => {
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
        societyId,financialYearId
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

  // const handlePay = async () => {
  //   if (selectedRowKeys.length === 0) {
  //     message.warning("Select bills first");
  //     return;
  //   }

  //   try {
  //     setPayLoading(true);
  //     const orderRes = await axios.post(`${BASE_URL}/billing/create-order`, {
  //       billIds: [...selectedRowKeys],
  //       memberId,
  //       amount: totalAmount,
  //       financialYearId:financialYearId
  //     });

  //     const order = orderRes.data;
  //     const options = {
  //       key: order.key,
  //       amount: order.amount,
  //       currency: "INR",
  //       name: "Society Management",
  //       description: "Maintenance Bill Payment",
  //       order_id: order.razorpayOrderId,
  //       modal: {
  //         ondismiss: function () {
  //           message.warning("Payment cancelled");
  //         },
  //       },

  //       handler: async function (response: any) {
  //         try {
  //           await axios.post(`${BASE_URL}/billing/verify-payment`, {
  //             razorpayOrderId: response.razorpay_order_id,
  //             razorpayPaymentId: response.razorpay_payment_id,
  //             razorpaySignature: response.razorpay_signature,
  //             billIds: selectedRowKeys,
  //             memberId,
  //             userId,
  //             amount: totalAmount,
  //             paymentMode: response.method || "ONLINE",
  //             financialYearId:financialYearId,
  //           });

  //           message.success("Payment successful");
  //           setSelectedRowKeys([]);
  //           fetchBills(selectedFlat);
  //         } catch (err) {
  //           console.error(err);
  //           message.error("Payment verification failed");
  //         }
  //       },
  //       prefill: {
  //         name: sessionStorage.getItem("memberName") || "Member",
  //         email: sessionStorage.getItem("email") || "",
  //         contact: sessionStorage.getItem("mobile") || "",
  //       },

  //       theme: {
  //         color: "#1677ff",
  //       },
  //     };
  //     const rzp = new (window as any).Razorpay(options);
  //     rzp.on("payment.failed", function (response: any) {
  //       console.error(response);

  //       message.error(
  //         response?.error?.description ||
  //           response?.error?.reason ||
  //           "Payment failed",
  //       );
  //     });

  //     rzp.open();
  //   } catch (err) {
  //     console.error(err);

  //     message.error("Payment initiation failed");
  //   } finally {
  //     setPayLoading(false);
  //   }
  // };
  
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
      title: "Status",
      dataIndex: "status",
      render: (s: string) => <Tag color="orange">{s}</Tag>,
    },
  ];

  return (
        <Content style={{ padding: 24, background: "#f0f5ff" }}>
          <Title level={3}>Pending Bills</Title>

          {/* ================= FLAT FILTER ================= */}
          <div style={{ marginBottom: 12 }}>
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

            {/* <Button
              type="primary"
              loading={payLoading}
              disabled={selectedRowKeys.length === 0 || payLoading}
              onClick={handlePay}
            >
              Pay Bill (Online)
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
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
              }}
              pagination={{ pageSize: 8 }}
              bordered
            />
          )}
        </Content>
  );
};

export default PendingBills;

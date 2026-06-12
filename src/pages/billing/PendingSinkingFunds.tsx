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

type SinkingFund = {
  id: number;
  month: string;
  year: number;
  amount: number;
  status: string;
  flat?: {
    id?: number;
    flatNo?: string;
  };
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

  useEffect(() => {
    loadFlats();
  }, []);

  const loadFlats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/members/flats`, {
        params: {
          societyId,
          memberId,
        },
      });

      const flatsData = res.data || [];

      setFlats(flatsData);

      if (flatsData.length > 0) {
        const firstFlatId = flatsData[0].id;

        setSelectedFlat(firstFlatId);

        fetchSinkingFunds(firstFlatId);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to load flats");
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
        params: {
          societyId,
          memberId,
        },
      });

      const flatIds = flatsRes.data.map((f: any) => Number(f.id));

      const res = await axios.post(
        `${BASE_URL}/members/sinking-funds`,
        {
          flatIds,
        },
      );

      let pendingFunds = (res.data || []).filter(
        (fund: SinkingFund) => fund.status !== "PAID",
      );

      pendingFunds = pendingFunds.filter(
        (fund: SinkingFund) => fund.flat?.id === flatId,
      );

      setSinkingFunds(pendingFunds);
    } catch (err) {
      console.error(err);
      message.error("Failed to load sinking funds");
    } finally {
      setLoading(false);
    }
  };

  const selectedFunds = sinkingFunds.filter((fund) =>
    selectedRowKeys.includes(fund.id),
  );

  const totalAmount = selectedFunds.reduce(
    (sum, fund) => sum + (fund.amount || 0),
    0,
  );

  const handlePay = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Select sinking fund records first");
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

        modal: {
          ondismiss: function () {
            message.warning("Payment cancelled");
          },
        },

        handler: async function (response: any) {
          try {
            await axios.post(
              `${BASE_URL}/sinking-fund/verify-payment`,
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                sinkingFundIds: selectedRowKeys,
                memberId,
                userId,
                amount: totalAmount,
                paymentMode: response.method || "ONLINE",
              },
            );

            message.success("Payment successful");

            setSelectedRowKeys([]);

            fetchSinkingFunds(selectedFlat);
          } catch (err) {
            console.error(err);
            message.error("Payment verification failed");
          }
        },

        prefill: {
          name: sessionStorage.getItem("memberName") || "Member",
          email: sessionStorage.getItem("email") || "",
          contact: sessionStorage.getItem("mobile") || "",
        },

        theme: {
          color: "#1677ff",
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        console.error(response);

        message.error(
          response?.error?.description ||
            response?.error?.reason ||
            "Payment failed",
        );
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      message.error("Payment initiation failed");
    } finally {
      setPayLoading(false);
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
      title: "Amount",
      dataIndex: "amount",
      render: (value: number) => `₹ ${value}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => (
        <Tag color="orange">{status}</Tag>
      ),
    },
  ];

  return (
    
    <Content style={{ padding: 24, background: "#f0f5ff" }}>
      <Title level={3}>Pending Sinking Funds</Title>

      {/* Flat Filter */}
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
          alignItems: "center",
        }}
      >
        <div>
          Selected: <b>{selectedFunds.length}</b>
          {" | "}
          Total Amount: <b>₹ {totalAmount}</b>
        </div>

        <Button
          type="primary"
          loading={payLoading}
          disabled={selectedRowKeys.length === 0 || payLoading}
          onClick={handlePay}
        >
          Pay Sinking Fund (Online)
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          rowKey="id"
          dataSource={sinkingFunds}
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

export default PendingSinkingFunds;
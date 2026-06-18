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

      if (flatsData.length > 0) {
        const firstFlatId = flatsData[0].id;
        setSelectedFlat(firstFlatId);
        fetchSinkingFunds(firstFlatId);
      }
    } catch (err) {
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
        params: { societyId, memberId },
      });

      const flatIds = flatsRes.data.map((f: any) => Number(f.id));

      const res = await axios.post(`${BASE_URL}/members/sinking-funds`, {
        flatIds,
        societyId,
        financialYearId,
      });

console.log("Res",res);
let data = (res.data || []).filter(
  (fund: SinkingFund) =>
    fund.status !== "PAID" &&
    Number(fund.flatId) === Number(flatId)
);

setSinkingFunds(data);
console.log("data", data);

    } catch (err) {
      message.error("Failed to load sinking funds");
    } finally {
      setLoading(false);
    }
  };

  const selectedFunds = sinkingFunds.filter((f) =>
    selectedRowKeys.includes(f.id)
  );

  const totalAmount = selectedFunds.reduce(
    (sum, f) => sum + (f.amount || 0),
    0
  );

  const handlePay = async () => {
    if (!selectedRowKeys.length) {
      message.warning("Select records first");
      return;
    }

    setPayLoading(true);

    try {
      const orderRes = await axios.post(
        `${BASE_URL}/sinking-fund/create-order`,
        {
          sinkingFundIds: selectedRowKeys,
          memberId,
          amount: totalAmount,
        }
      );

      const order = orderRes.data;

      const options = {
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: "Society Management",
        order_id: order.razorpayOrderId,

        handler: async (response: any) => {
          await axios.post(`${BASE_URL}/sinking-fund/verify-payment`, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            sinkingFundIds: selectedRowKeys,
            memberId,
            userId,
            amount: totalAmount,
            paymentMode:"ONLINE",
            financialYearId,
          });

          message.success("Payment successful");
          setSelectedRowKeys([]);
          fetchSinkingFunds(selectedFlat);
        },
      };

      new (window as any).Razorpay(options).open();
    } catch (err) {
      message.error("Payment failed");
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
            Selected: <b>{selectedFunds.length}</b> | Total:{" "}
            <b>₹ {totalAmount}</b>
          </div>

          <Button
            type="primary"
            loading={payLoading}
            disabled={!selectedRowKeys.length}
            onClick={handlePay}
          >
            Pay Sinking Fund
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
            }}
            pagination={{ pageSize: 8 }}
            bordered
            scroll={{ x: "max-content" }}
          />
        )}
      </Content>
    </Layout>
  </Layout>
);
};

export default PendingSinkingFunds;
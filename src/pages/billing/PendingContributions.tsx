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
} from "antd";
import axios from "axios";

import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import AppHeader from "../../components/layout/Header";

const { Content } = Layout;
const { Title } = Typography;

const BASE_URL = import.meta.env.VITE_API_URL;

type Contribution = {
  id: number;
  name: string;
  type: string;
  amount: number;
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
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [selectedFlat, setSelectedFlat] = useState<number | null>(null);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [payLoading, setPayLoading] = useState(false);

  const [amountModalOpen, setAmountModalOpen] = useState(false);
  const [finalAmount, setFinalAmount] = useState<number | null>(null);
  const [minimumAmount, setMinimumAmount] = useState<number>(0);
  const [contributionType, setContributionType] = useState<string>("");

  const role = sessionStorage.getItem("role");

  const memberId = Number(sessionStorage.getItem("memberId"));
  const societyId = Number(sessionStorage.getItem("societyId"));
  const userId = Number(sessionStorage.getItem("userId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

  useEffect(() => {
    loadFlats();
  }, []);

  // ✅ SAFE NORMALIZER
  const normalize = (v: any) =>
    (v || "").toString().replace(/\s+/g, "").toUpperCase();

  const loadFlats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/members/flats`, {
        params: { societyId, memberId },
      });

      const flatsData = res.data || [];
      setFlats(flatsData);

      if (flatsData.length > 0) {
        const first = Number(flatsData[0].id);
        setSelectedFlat(first);

        // ⚠️ avoid race condition
        setTimeout(() => {
          fetchContributions(first);
        }, 0);
      }
    } catch {
      message.error("Failed to load flats");
    }
  };

  // ✅ FRONTEND FILTER ONLY
  const fetchContributions = async (flatId: number | null) => {
    if (!flatId) return setContributions([]);

    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/contribution/${societyId}/${financialYearId}`
      );

      let data = (res.data || []).filter(
        (i: any) => i.status !== "PAID"
      );

      const selectedFlatObj = flats.find(
        (f) => Number(f.id) === Number(flatId)
      );

      const selectedFlatNo = normalize(selectedFlatObj?.flatNo);

      // 🔥 MAIN FRONTEND FILTER
      data = data.filter((item: any) => {
        return normalize(item.flatNo) === selectedFlatNo;
      });

      // MEMBER FILTER
      if (role === "MEMBER") {
        data = data.filter((i: any) => i.memberId === memberId);
      }

      setContributions(data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load contributions");
    } finally {
      setLoading(false);
    }
  };

  const selectedContributions = contributions.filter((i) =>
    selectedRowKeys.includes(i.id)
  );

  const totalAmount = selectedContributions.reduce(
    (s, i) => s + (i.amount || 0),
    0
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
          fetchContributions(selectedFlat);
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
            value={selectedFlat || undefined}
            onChange={(v) => {
              setSelectedFlat(v);
              fetchContributions(v);
              setSelectedRowKeys([]);
            }}
          />

          <div style={{ marginBottom: 12 }}>
            Selected: {selectedRowKeys.length} | Total: ₹{totalAmount}
          </div>

          <Button
            type="primary"
            onClick={handlePay}
            disabled={!selectedRowKeys.length}
            loading={payLoading}
          >
            Pay Online
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
              }}
              scroll={{ x: "max-content" }}
              pagination={{ pageSize: 8 }}
            />
          )}

          <Modal
            open={amountModalOpen}
            onCancel={() => setAmountModalOpen(false)}
            onOk={() => {
              setAmountModalOpen(false);
              proceedPayment(finalAmount || 0, contributionType);
            }}
          >
            <p>Minimum: ₹{minimumAmount}</p>
            <InputNumber
              style={{ width: "100%" }}
              value={finalAmount}
              onChange={(v) => setFinalAmount(Number(v))}
            />
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PendingContributions;
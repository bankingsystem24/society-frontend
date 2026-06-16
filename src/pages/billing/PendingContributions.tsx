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

const BASE_URL = import.meta.env.VITE_API_URL;

const { Content } = Layout;
const { Title } = Typography;

type Contribution = {
  id: number;
  name: string;
  type: string;
  amount: number;
  flatNo: string;
  dueDate: string;
  date: string;
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

  const memberId = Number(sessionStorage.getItem("memberId"));
  const societyId = Number(sessionStorage.getItem("societyId"));
  const userId = Number(sessionStorage.getItem("userId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

  const [amountModalOpen, setAmountModalOpen] = useState(false);
  const [finalAmount, setFinalAmount] = useState<number | null>(null);
  const [minimumAmount, setMinimumAmount] = useState<number>(0);
  const [contributionType, setContributionType] = useState<string>("");

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
        const firstFlatId = Number(flatsData[0].id);

        setSelectedFlat(firstFlatId);

        // pass directly from API response
        fetchContributions(firstFlatId);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to load flats");
    }
  };

  const fetchContributions = async (flatId: number | null) => {
    if (!flatId) {
      setContributions([]);
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

      const selectedFlatObj = flatsRes.data.find(
        (f: any) => Number(f.id) === Number(flatId),
      );

      console.log("Selected Flat:", selectedFlatObj);

      const res = await axios.get(
        `${BASE_URL}/contribution/${societyId}/${financialYearId}`,
      );

      console.log("Contributions:", res.data);

      let pendingContributions = (res.data || []).filter(
        (item: any) => item.status !== "PAID",
      );

      if (selectedFlatObj) {
        pendingContributions = pendingContributions.filter(
          (item: any) =>
            item.flatNo?.replace(/\s/g, "").toUpperCase() ===
            selectedFlatObj.flatNo?.replace(/\s/g, "").toUpperCase(),
        );
      }

      console.log("Filtered Contributions:", pendingContributions);

      setContributions(pendingContributions);
    } catch (err) {
      console.error(err);
      message.error("Failed to load contributions");
    } finally {
      setLoading(false);
    }
  };

  const selectedContributions = contributions.filter((item) =>
    selectedRowKeys.includes(item.id),
  );

  const totalAmount = selectedContributions.reduce(
    (sum, item) => sum + (item.amount || 0),
    0,
  );

  const handlePay = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Select contribution records first");
      return;
    }

    const firstContribution = selectedContributions[0];

    if (firstContribution?.type?.toUpperCase() === "VOLUNTARY") {
      setContributionType("VOLUNTARY");
      setMinimumAmount(totalAmount);
      setFinalAmount(totalAmount);
      setAmountModalOpen(true);
      return;
    }

    proceedPayment(totalAmount, "COMPULSORY");
  };

  const proceedPayment = async (
    amountToPay: number,
    contributionType: string,
  ) => {
    try {
      setPayLoading(true);

      const orderRes = await axios.post(
        `${BASE_URL}/contribution/create-order`,
        {
          contributionIds: [...selectedRowKeys],
          memberId,
          amount: amountToPay,
        },
      );

      const order = orderRes.data;

      const options = {
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: "Society Management",
        description: "Contribution Payment",
        order_id: order.razorpayOrderId,

        modal: {
          ondismiss: function () {
            message.warning("Payment cancelled");
          },
        },

        handler: async function (response: any) {
          try {
            await axios.post(`${BASE_URL}/contribution/verify-payment`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,

              contributionIds: selectedRowKeys,
              memberId,
              userId,
              amount: amountToPay,
              type: contributionType,
              paymentMode: response.method || "ONLINE",
              financialYearId,
            });

            message.success("Payment successful");

            setSelectedRowKeys([]);

            fetchContributions(selectedFlat);
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
      dataIndex: "flatNo",
    },
    {
      title: "Contribution",
      dataIndex: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
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
        <Tag color={status === "PAID" ? "green" : "orange"}>{status}</Tag>
      ),
    },
  ];

  return (
    <Content style={{ padding: 24, background: "#f0f5ff" }}>
      <Title level={3}>Pending Contributions</Title>

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
            fetchContributions(value || null);
            setSelectedRowKeys([]);
          }}
        />
      </div>

      <div
        style={{
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          Selected: <b>{selectedContributions.length}</b>
          {" | "}
          Total Amount: <b>₹ {totalAmount}</b>
        </div>

        <Button
          type="primary"
          loading={payLoading}
          disabled={selectedRowKeys.length === 0 || payLoading}
          onClick={handlePay}
        >
          Pay Contribution (Online)
        </Button>
      </div>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          rowKey="id"
          dataSource={contributions}
          columns={columns}
          rowSelection={{
            selectedRowKeys,

            onChange: (newSelectedRowKeys) => {
              if (newSelectedRowKeys.length === 0) {
                setSelectedRowKeys([]);
                return;
              }

              const selectedRows = contributions.filter((item) =>
                newSelectedRowKeys.includes(item.id),
              );

              const firstRow = selectedRows[0];

              const hasInvalidSelection = selectedRows.some(
                (row) =>
                  row.flatNo?.trim().toUpperCase() !==
                    firstRow.flatNo?.trim().toUpperCase() ||
                  row.type?.trim().toUpperCase() !==
                    firstRow.type?.trim().toUpperCase(),
              );

              if (hasInvalidSelection) {
                message.warning(
                  "You can select only records having the same Flat No and Type",
                );
                return;
              }

              setSelectedRowKeys(newSelectedRowKeys);
            },

            getCheckboxProps: (record: Contribution) => {
              if (selectedRowKeys.length === 0) {
                return { disabled: false };
              }

              const firstSelectedRow = contributions.find(
                (item) => item.id === selectedRowKeys[0],
              );

              if (!firstSelectedRow) {
                return { disabled: false };
              }

              const sameFlat =
                record.flatNo?.trim().toUpperCase() ===
                firstSelectedRow.flatNo?.trim().toUpperCase();

              const sameType =
                record.type?.trim().toUpperCase() ===
                firstSelectedRow.type?.trim().toUpperCase();

              return {
                disabled: !(sameFlat && sameType),
              };
            },
          }}
          pagination={{ pageSize: 8 }}
          bordered
        />
      )}

      <Modal
        title="Enter Contribution Amount"
        open={amountModalOpen}
        destroyOnClose
        onCancel={() => {
          setAmountModalOpen(false);
          setFinalAmount(null);
        }}
        onOk={() => {
          const enteredAmount = Number(finalAmount || 0);

          if (enteredAmount <= 0) {
            message.error("Please enter amount");
            return;
          }

          if (enteredAmount < minimumAmount) {
            message.error(
              `Entered amount cannot be less than ₹${minimumAmount}`,
            );
            return;
          }

          setAmountModalOpen(false);
          proceedPayment(enteredAmount, contributionType);
        }}
      >
        <p>
          Minimum Amount: <b>₹{minimumAmount}</b>
        </p>

        <InputNumber
          style={{ width: "100%" }}
          controls={false}
          value={finalAmount}
          onChange={(value) => {
            setFinalAmount(value === null ? null : Number(value));
          }}
          placeholder="Enter amount"
        />
      </Modal>
    </Content>
  );
};

export default PendingContributions;

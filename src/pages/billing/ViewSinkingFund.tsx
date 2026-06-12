import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Select,
  InputNumber,
  Button,
  message,
  Space,
  Form,
  Modal,
} from "antd";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

interface SinkingFund {
  id: number;
  societyId: number;
  flatNo: string;
  month: string;
  year: number;
  amount: number;
  createdBy: number;
  status: string;
  memberName: string;
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
}

const ViewSinkingFund: React.FC = () => {
  const [data, setData] = useState<SinkingFund[]>([]);
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredData, setFilteredData] = useState<SinkingFund[]>([]);
  const [flatNo, setFlatNo] = useState<string | undefined>();
  const [memberName, setMemberName] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();

  const [month, setMonth] = useState<string | undefined>();
  const [year, setYear] = useState<number | undefined>();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<string>("CASH");

  const societyId = Number(sessionStorage.getItem("societyId"));

  const selectedFunds = filteredData.filter((f) =>
    selectedRowKeys.includes(f.id),
  );

  const selectedFlatNo =
    selectedFunds.length > 0 ? selectedFunds[0].flatNo : null;

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/sinking-fund?societyId=${societyId}`,
      );

      setData(res.data || []);
      setFilteredData(res.data || []);
    } catch (error) {
      message.error("Failed to load sinking fund");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [month, year, flatNo, memberName, status, data]);

  useEffect(() => {
    fetchData();
  }, []);

  const applyFilter = () => {
    let filtered = [...data];

    if (month) {
      filtered = filtered.filter((item) => item.month === month);
    }

    if (year) {
      filtered = filtered.filter((item) => item.year === year);
    }

    if (flatNo) {
      filtered = filtered.filter((item) => item.flatNo === flatNo);
    }

    if (memberName) {
      filtered = filtered.filter((item) => item.memberName === memberName);
    }

    if (status) {
      filtered = filtered.filter((item) => item.status === status);
    }

    setFilteredData(filtered);
  };

  const handlePay = async () => {
    try {
      const sinkingFundIds = selectedRowKeys.map(Number);

      const res = await axios.put(`${BASE_URL}/sinking-fund/pay`, {
        sinkingFundIds,
        paymentMode,
      });

      message.success(res.data);
      setSelectedRowKeys([]);
      setPaymentModalOpen(false);
      loadBills();
    } catch {
      message.error("Payment failed");
    }
  };

  const loadBills = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/billing/viewAllBills`, {
        societyId: Number(societyId),
      });
      setBills(res.data);
    } catch {
      message.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      title: "Flat",
      dataIndex: "flatNo",
      key: "flat",
    },
    {
      title: "Member",
      dataIndex: "memberName",
      key: "memberName",
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
    },
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
  const flatOptions = [...new Set(data.map((item) => item.flatNo))];

  const memberOptions = [...new Set(data.map((item) => item.memberName))];

  const statusOptions = [...new Set(data.map((item) => item.status))];

  return (
    <div style={{ padding: 16 }}>
      <Card title="View Sinking Fund">
        {/* FILTER SECTION */}
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            placeholder="Month"
            style={{ width: 150 }}
            // onChange={(value) => setMonth(value)}
            onChange={(value) => {
              setMonth(value || undefined);
            }}
            allowClear
          >
            {[
              "JANUARY",
              "FEBRUARY",
              "MARCH",
              "APRIL",
              "MAY",
              "JUNE",
              "JULY",
              "AUGUST",
              "SEPTEMBER",
              "OCTOBER",
              "NOVEMBER",
              "DECEMBER",
            ].map((m) => (
              <Select.Option key={m} value={m}>
                {m}
              </Select.Option>
            ))}
          </Select>

          <InputNumber
            placeholder="Year"
            onChange={(value) => {
              setYear(typeof value === "number" ? value : undefined);
            }}
          />

          <Select
            placeholder="Flat"
            style={{ width: 140 }}
            allowClear
            onChange={(value) => setFlatNo(value || undefined)}
          >
            {flatOptions.map((flat) => (
              <Select.Option key={flat} value={flat}>
                {flat}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Member"
            style={{ width: 220 }}
            allowClear
            showSearch
            optionFilterProp="children"
            onChange={(value) => setMemberName(value || undefined)}
          >
            {memberOptions.map((member) => (
              <Select.Option key={member} value={member}>
                {member}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Status"
            style={{ width: 140 }}
            allowClear
            onChange={(value) => setStatus(value || undefined)}
          >
            {statusOptions.map((sts) => (
              <Select.Option key={sts} value={sts}>
                {sts}
              </Select.Option>
            ))}
          </Select>
                  </Space>

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

        {/* TABLE */}
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          size="small"
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
    </div>
  );
};

export default ViewSinkingFund;

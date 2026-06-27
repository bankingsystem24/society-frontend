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
  Input,
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
  transactionId : String;
}


const ViewSinkingFund: React.FC = () => {
  const [data, setData] = useState<SinkingFund[]>([]);
  const [loading, setLoading] = useState(false);
  // const [bills, setBills] = useState<Bill[]>([]);
  const [filteredData, setFilteredData] = useState<SinkingFund[]>([]);
  const [flatNo, setFlatNo] = useState<string | undefined>();
  const [memberName, setMemberName] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();

  const [month, setMonth] = useState<string | undefined>();
  const [year, setYear] = useState<number | undefined>();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<string>("CASH");
  const [transactionId, setTransactionId] = useState<string>("");

  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

    const [maintenanceMappingExists, setMaintenanceMappingExists] = useState(false);
    
    const [glReceivable, setGlReceivable] = useState<number>(0);
    const [glCreditAccount, setGlCreditAccount] = useState<number>(0);
  
    const [glCashInHand, setGlCashInHand] = useState<number>(0);
    const [glBankAccount, setGlBankAccount] = useState<number>(0);
    const [glInterestIncome, setGlInterestIncome] = useState<number>(0);
    const [glDiscount, setGlDiscount] = useState<number>(0);
  
    useEffect(() => { loadGlMapping(); }, []);
    useEffect(() => {}, [ glCashInHand, glBankAccount, glInterestIncome, glDiscount, glReceivable,glCreditAccount ]);
      
  const selectedFunds = filteredData.filter((f) =>
    selectedRowKeys.includes(f.id),
  );

  const selectedFlatNo =
    selectedFunds.length > 0 ? selectedFunds[0].flatNo : null;

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/sinking-fund?societyId=${societyId}`,);

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

  const loadGlMapping = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/gl/master/mapping?societyId=${societyId}`,
      );

      const mapping = res.data.find(
        (item: any) =>
          item.description?.trim().toLowerCase() === "sinking fund receivable",
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

  const handlePay = async () => {
    try {
      const sinkingFundIds = selectedRowKeys.map(Number);

      const payload = {
        sinkingFundIds,
        paymentMode,
        financialYearId,
        transactionId,
        glReceivable,
        glCreditAccount,
        glCashInHand,
        glBankAccount,
        glInterestIncome,
        glDiscount,
      }

      const res = await axios.put(`${BASE_URL}/sinking-fund/pay`, payload);

      message.success(res.data);
      setSelectedRowKeys([]);
      setPaymentModalOpen(false);
      fetchData();
    } catch {
      message.error("Payment failed");
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
    </div>
  );
};

export default ViewSinkingFund;

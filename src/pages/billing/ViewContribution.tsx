import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Select,
  Button,
  message,
  Space,
  Form,
  Modal,
  InputNumber,
  Input,
  Layout
} from "antd";
import axios from "axios";
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

interface Contribution {
  id: number;
  societyId: number;
  memberId: number;
  name: string;
  type: string;
  mode: string;
  amount: number;
  date: string;
  dueDate: string;
  description: string;
  receiptId: number;
  paymentMode: string;
  transactionId: string;
  status: string;
  createdBy: number;
  financialYearId: number;
  flatNo: string;
  glReceivable:number;
  glCreditAccount:number;
}

const ViewContribution: React.FC = () => {
  const [data, setData] = useState<Contribution[]>([]);
  const [filteredData, setFilteredData] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>();
  const [flatNo, setFlatNo] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [contributionAmount, setContributionAmount] = useState<number>(0);
  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
  const userId = Number(sessionStorage.getItem("userId"));
  const [transactionId, setTransactionId] = useState("");
  const selectedContributions = filteredData.filter((c) => selectedRowKeys.includes(c.id),);
  const selectedFlatNo = selectedContributions.length > 0 ? selectedContributions[0].flatNo : null;
  const selectedType = selectedContributions.length > 0 ? selectedContributions[0].type : null;
  const totalSelectedAmount = selectedContributions.reduce((sum, contribution) => sum + Number(contribution.amount || 0),0,);
  const glCashInHand = Number(sessionStorage.getItem("GlCashInHand"));
  const glBankAccount = Number(sessionStorage.getItem("GlBankAccount"));

  useEffect(() => {
    if (selectedType === "VOLUNTARY") {
      setContributionAmount(totalSelectedAmount);
    } else {
      setContributionAmount(totalSelectedAmount);
    }
  }, [selectedType, totalSelectedAmount]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/contribution/${societyId}/${financialYearId}`,);
      setData(res.data || []);
      setFilteredData(res.data || []);
    } catch {
      message.error("Failed to load contributions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if(!glCashInHand || !glBankAccount){
      message.error("Cash In Hand and Bank Account Gl are not mapped");
    }
  }, []);

  useEffect(() => {
    applyFilter();
  }, [type, flatNo, status, data]);

  const applyFilter = () => {
    let filtered = [...data];

    if (type) {
      filtered = filtered.filter((item) => item.type === type);
    }

    if (flatNo) {
      filtered = filtered.filter((item) => item.flatNo === flatNo);
    }

    if (status) {
      filtered = filtered.filter((item) => item.status === status);
    }

    setFilteredData(filtered);
  };

  const handlePay = async () => {
    try {
      const contributionIds = selectedRowKeys.map(Number);

      const selectedContributions = filteredData.filter((c) =>selectedRowKeys.includes(c.id));
      const glReceivable = selectedContributions.length > 0 ? selectedContributions[0].glReceivable : null;
      const glCreditAccount = selectedContributions.length > 0 ? selectedContributions[0].glCreditAccount : null;


      if (
        selectedType === "VOLUNTARY" &&
        contributionAmount < totalSelectedAmount
      ) {
        message.error(
          `Voluntary Amount cannot be less than ₹${totalSelectedAmount}`,
        );
        return;
      }

      const payload = {
        contributionIds,
        paymentMode,
        financialYearId,
        contributionAmount,
        userId,
        glReceivable,
        glCreditAccount,
        transactionId,
        glCashInHand,
        glBankAccount

      }

      const res = await axios.put(`${BASE_URL}/contribution/pay`,payload );
      message.success(res.data);
      setSelectedRowKeys([]);
      setPaymentModalOpen(false);
      fetchData();
    } catch {
      message.error("Payment failed");
    }
  };

  const columns = [
    {
      title: "Flat No",
      dataIndex: "flatNo",
      key: "flatNo",
    },
    {
      title: "Contribution for",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "GlReceivable",
      dataIndex: "glReceivable",
      key: "glReceivable",
      hidden: true,
    },
    {
      title: "Gl Credit",
      dataIndex: "glCreditAccount",
      key: "glCreditAccount",
      hidden: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
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

  const typeOptions = [
    ...new Set(
      data.filter((d) => !flatNo || d.flatNo === flatNo).map((d) => d.type),
    ),
  ];

  const flatOptions = [
    ...new Set(
      data
        .filter((d) => !type || d.type === type)
        .map((d) => d.flatNo)
        .filter(Boolean),
    ),
  ];

  const statusOptions = [...new Set(data.map((d) => d.status))];

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
      {role === "ADMIN" ? <Sidebar /> : role === "MEMBER" ? <MemberSidebar /> : role=== "SUPER_ADMIN" ? <SuperAdminSidebar/> : <AuditorSidebar />}
    </Layout.Sider>

    {/* MAIN AREA */}
    <Layout style={{ minWidth: 0 }}>

      {/* HEADER (NO EXTRA DIV) */}
      {role === "ADMIN" ? <Header /> : role === "MEMBER" ? <MemberHeader /> : role=== "SUPER_ADMIN" ? <SuperAdminHeader/> : <AuditorHeader />}
      <Content >
    <div style={{ padding: 16 }}>
      <Card title="View Contribution">
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            placeholder="Contribution Type"
            style={{ width: 180 }}
            allowClear
            onChange={(value) => {
              setType(value || undefined);
              setFlatNo(undefined);
            }}
          >
            {typeOptions.map((t) => (
              <Select.Option key={t} value={t}>
                {t}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Flat No"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => {
              setFlatNo(value || undefined);
              setType(undefined);
            }}
          >
            {flatOptions.map((flat) => (
              <Select.Option key={flat} value={flat}>
                {flat}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Status"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => setStatus(value || undefined)}
          >
            {statusOptions.map((s) => (
              <Select.Option key={s} value={s}>
                {s}
              </Select.Option>
            ))}
          </Select>
        </Space>

        <div style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            disabled={selectedRowKeys.length === 0}
            onClick={() => setPaymentModalOpen(true)}
          >
            Payment Received by Admin ({selectedRowKeys.length})
          </Button>
        </div>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={filteredData}
          columns={columns}
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ x: "max-content" }}
          rowSelection={{
            selectedRowKeys,
            hideSelectAll: true,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record) => {
              const sameFlat =
                selectedFlatNo === null || record.flatNo === selectedFlatNo;

              const sameType =
                selectedType === null || record.type === selectedType;

              return {
                disabled:
                  record.status !== "PENDING" ||
                  ((!sameFlat || !sameType) &&
                    !selectedRowKeys.includes(record.id)),
              };
            },
          }}
        />

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
                  {
                    label: "CASH",
                    value: "CASH",
                  },
                  {
                    label: "UPI",
                    value: "UPI",
                  },
                  {
                    label: "CARD",
                    value: "CARD",
                  },
                  {
                    label: "NETBANKING",
                    value: "NETBANKING",
                  },
                ]}
              />
            </Form.Item>
            {paymentMode !== "CASH" && (
              <Form.Item label="Transaction ID" required>
                <Input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter Transaction ID"
                />
              </Form.Item>
            )}
            {selectedContributions.some((c) => c.type === "VOLUNTARY") && (
              <Form.Item label="Voluntary Amount" required>
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  value={contributionAmount}
                  onChange={(value) =>
                    setContributionAmount(Number(value || 0))
                  }
                  placeholder="Enter Amount"
                />
              </Form.Item>
            )}
          </Form>
        </Modal>
      </Card>
    </div>
    </Content>
    </Layout>
    </Layout>
  );
};

export default ViewContribution;

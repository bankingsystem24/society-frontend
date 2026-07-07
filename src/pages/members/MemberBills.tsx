import React, { useEffect, useState } from "react";
import { Layout, Table, Spin, Typography, message, Tag } from "antd";
import axios from "axios";
import type { ColumnsType } from "antd/es/table";
import MemberSidebar from "../../components/layout/MemberSidebar";
import MemberHeader from "../../components/layout/MemberHeader";

const { Content } = Layout;
const { Title } = Typography;

const BASE_URL = import.meta.env.VITE_API_URL;

interface Receipt {
  id: number;
  receiptNo: string;
  createdAt?: string;
  flatNo: string;
  memberName: string;
  interestAmount?: number;
  maintenanceAmount?: number;
  penaltyAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMode?: string;
  transactionId?: string;
  status?: string;
}

const MemberBills: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [billingReceipts, setBillingReceipts] = useState<Receipt[]>([]);

  const memberId = Number(sessionStorage.getItem("memberId"));
  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
const [billingOpen, setBillingOpen] = useState(false);
const [contributionOpen, setContributionOpen] = useState(false);
const [sinkingFundOpen, setSinkingFundOpen] = useState(false);

const [receiptBills, setReceiptBills] = useState([]);
const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

const fetchReceipts = async (flatId?: number) => {
  try {
    setLoading(true);

    const flatsRes = await axios.get(`${BASE_URL}/members/flats`, {
      params: {
        memberId,
        societyId,
      },
    });

    const flatIds = flatsRes.data.map((f: any) => f.id);

    const payload = {
      societyId,
      flatIds,
      financialYearId,
    };

    const res = await axios.post(
      `${BASE_URL}/receipts/viewReceipts`,
      payload
    );

    setBillingReceipts(
      res.data.filter((r: any) => r.status === "PAID")
    );
  } catch (err) {
    console.error(err);
    message.error("Unable to load receipts");
  } finally {
    setLoading(false);
  }
};

const loadReceiptDetails = async (receiptId: number) => {
  try {
    setLoading(true);

    const res = await axios.get(
      `${BASE_URL}/receipts/details/${receiptId}`
    );

    setReceiptBills(res.data);

    const selected =
      billingReceipts.find((r) => r.id === receiptId) || null;

    setSelectedReceipt(selected);

    const receiptType = res.data?.[0]?.receiptType;

    if (receiptType === "BILLING") {
      setBillingOpen(true);
    } else if (receiptType === "CONTRIBUTION") {
      setContributionOpen(true);
    } else if (receiptType === "SINKING_FUND") {
      setSinkingFundOpen(true);
    }
  } finally {
    setLoading(false);
  }
};

  const printReceipt = (receipt: Receipt) => {
    const societyName = sessionStorage.getItem("societyName") || "";

    const html = `
      <html>
      <head>
      <style>
      body{
        font-family:Arial;
        padding:20px;
      }
      table{
        width:100%;
        border-collapse:collapse;
      }
      td{
        border:1px solid #ddd;
        padding:8px;
      }
      h2{
        text-align:center;
      }
      </style>
      </head>

      <body>

      <h2>${societyName}</h2>
      <h3 style="text-align:center">Receipt</h3>

      <table>

      <tr>
      <td><b>Receipt No</b></td>
      <td>${receipt.receiptNo}</td>
      </tr>

      <tr>
      <td><b>Flat No</b></td>
      <td>${receipt.flatId}</td>
      </tr>

      <tr>
      <td><b>Amount</b></td>
      <td>₹ ${receipt.totalAmount}</td>
      </tr>

      <tr>
      <td><b>Payment Mode</b></td>
      <td>${receipt.paymentMode}</td>
      </tr>

      <tr>
      <td><b>Paid Date</b></td>
      <td>${new Date(receipt.receiptDate).toLocaleDateString("en-GB")}</td>
      </tr>

      <tr>
      <td><b>Transaction Id</b></td>
      <td>${receipt.transactionId}</td>
      </tr>

      </table>

      <br><br>

      <p><b>Authorized Signatory</b></p>

      </body>
      </html>
    `;

    const win = window.open("", "_blank");

    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  };
  const columns: ColumnsType<Receipt> = [
    {
      title: "Receipt No",
      dataIndex: "receiptNo",
render: (_, record) => (
  <a onClick={() => loadReceiptDetails(record.id)}>
    {record.receiptNo}
  </a>
)
    },
    {
      title: "Receipt Date",
      dataIndex: "receiptDate",
      render: (date) => new Date(date).toLocaleDateString("en-GB"),
    },
    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
    },
    {
      title: "Maintenance",
      dataIndex: "maintenanceAmount",
      render: (v: number) => `₹${v.toLocaleString()}`,
    },
    {
      title: "Interest",
      dataIndex: "interestAmount",
      render: (v: number) => `₹${v.toLocaleString()}`,
    },
    {
      title: "Discount",
      dataIndex: "discountAmount",
      render: (v: number) => `₹${v.toLocaleString()}`,
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      render: (v: number) => <strong>₹{v.toLocaleString()}</strong>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "PAID" ? "green" : "red"}>{status}</Tag>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider breakpoint="lg" collapsedWidth="0" width={220}>
        <MemberSidebar />
      </Layout.Sider>
      <Layout>
        <MemberHeader />
        <Content
          style={{
            margin: 16,
            padding: 20,
            background: "#fff",
            borderRadius: 8,
          }}
        >
          <Title level={3}>Maintenance Receipts</Title>

          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: 50,
              }}
            >
              <Spin size="large" />
            </div>
          ) : (
            <Table
              rowKey="id"
              loading={loading}
              columns={columns}
              dataSource={billingReceipts}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 900 }}
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MemberBills;

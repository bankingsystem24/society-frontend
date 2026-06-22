import {
  Button,
  Card,
  Form,
  Modal,
  Select,
  Table,
  Tag,
  Typography,
  Layout,
  message,
} from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import type { ColumnsType } from "antd/es/table";
import Sidebar from "../../components/layout/Sidebar";
import MemberSidebar from "../../components/layout/MemberSidebar";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";
import Header from "../../components/layout/Header";
import MemberHeader from "../../components/layout/MemberHeader";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import AuditorHeader from "../../components/layout/AuditorHeader";

const BASE_URL = import.meta.env.VITE_API_URL;

const { Content } = Layout;
const { Title } = Typography;

interface Flat {
  id: number;
  flatNo: string;
}

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
  status?: string;
}

interface ReceiptBill {
  id: number;
  month: string;
  year: number;
  maintenanceAmount: number;
  penaltyAmount: number;
  interestAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  status: string;
  receiptType: String;
  name: String;
}

export default function VerifyPayemnt() {
  const [form] = Form.useForm();
  const [flats, setFlats] = useState<Flat[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  // const [detailsOpen, setDetailsOpen] = useState(false);

  const [billingOpen, setBillingOpen] = useState(false);
  const [contributionOpen, setContributionOpen] = useState(false);
  const [sinkingFundOpen, setSinkingFundOpen] = useState(false);

  const [receiptBills, setReceiptBills] = useState<ReceiptBill[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const societyId = sessionStorage.getItem("societyId");
  const financialYear = sessionStorage.getItem("financialYear");
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
  const role = sessionStorage.getItem("role");

  useEffect(() => {
    loadFlats();
    loadReceipts();
  }, []);

  useEffect(() => {}, [receiptBills]);

  const loadFlats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/flats?societyId=${societyId}`);

      setFlats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadReceipts = async (flatId?: number) => {
    try {
      setLoading(true);

      const payload = {
        societyId:
          societyId && !isNaN(Number(societyId)) ? Number(societyId) : null,
        flatId: flatId ? Number(flatId) : null,
        financialYearId: Number(financialYearId),
      };

      console.log("Payload:", payload);

      const res = await axios.post(
        `${BASE_URL}/receipts/viewReceipts`,
        payload,
      );

      console.log("res:", res);

      if (!financialYear) {
        setReceipts(res.data);
        return;
      }

      const [startYear, endYear] = financialYear.split("-").map(Number);

      const filtered = res.data.filter((r: any) => {
        const receiptDate = new Date(r.createdAt);

        const year = receiptDate.getFullYear();
        const month = receiptDate.getMonth() + 1; // Jan=1

        return (
          r.status === "SUBMITTED" &&
          ((year === startYear && month >= 4) ||
            (year === endYear && month <= 3))
        );
      });

      setReceipts(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadReceiptDetails = async (receiptId: number) => {
    try {
      setLoading(true);
      const detailsres = await axios.get(
        `${BASE_URL}/receipts/details/${receiptId}`,
      );
      const data = detailsres.data;

      setReceiptBills(data);

      const receiptType = detailsres.data?.[0]?.receiptType;

      const selected = receipts.find((r) => r.id === receiptId) || null;
      setSelectedReceipt(selected);

      if (receiptType === "BILLING") {
        setBillingOpen(true);
      } else if (receiptType === "CONTRIBUTION") {
        setContributionOpen(true);
      } else if (receiptType === "SINKING_FUND") {
        setSinkingFundOpen(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBillingPrint = (receipt: Receipt | null) => {
    if (!receipt) return;

    const rows = receiptBills
      .map(
        (b) => `
        <tr>
          <td>${b.month}</td>
          <td>${b.year}</td>
          <td>${b.maintenanceAmount}</td>
          <td>${b.penaltyAmount}</td>
          <td>${b.interestAmount}</td>
          <td>${b.discountAmount}</td>
          <td>${b.totalAmount}</td>
          <td>${b.status}</td>
        </tr>
      `,
      )
      .join("");

    const societyName = sessionStorage.getItem("societyName") || "";

    const content = `
      <html>
        <head>
          <title>Receipt</title>

          <style>
            body {
              font-family: Arial;
              padding: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }

            h2 {
              margin-bottom: 0;
            }
          </style>
        </head>

        <body>

          <h2>${societyName}</h2>
          <h2>Maintenance Receipt</h2>

          <hr />

        <table
        style={{
            width: "100%",
            marginTop: "10px",
            borderCollapse: "collapse",
        }}
        >
        <tbody>
            <tr>
            <td style="padding:6px; font-weight:bold; width:180px;">
                Receipt No
            </td>
            <td style="padding:6px;">
                ${receipt.receiptNo}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Flat
            </td>
            <td style="padding:6px;">
                ${receipt.flatNo}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Member
            </td>
            <td style="padding:6px;">
                ${receipt.memberName}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Total Amount
            </td>
            <td style="padding:6px;">
                ₹ ${receipt.totalAmount}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Payment Mode
            </td>
            <td style="padding:6px;">
                ${receipt.paymentMode || "CASH"}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Date
            </td>
            <td style="padding:6px;">
                ${
                  receipt.createdAt
                    ? new Date(receipt.createdAt).toLocaleDateString("en-GB")
                    : "-"
                }
            </td>
            </tr>
        </tbody>
        </table>

          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Year</th>
                <th>Maintenance</th>
                <th>Penalty</th>
                <th>Interest</th>
                <th>Discount</th>
                <th>Net Paid</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

          <br/><br/>

          <p>
            <b>Authorized Signatory</b>
          </p>

        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");

    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleContributionPrint = (receipt: Receipt | null) => {
    if (!receipt) return;

    const rows = receiptBills
      .map(
        (b) => `
        <tr>
          <td>${b.name}</td>
          <td>${b.totalAmount}</td>
          <td>${b.status}</td>
        </tr>
      `,
      )
      .join("");

    const societyName = sessionStorage.getItem("societyName") || "";

    const content = `
      <html>
        <head>
          <title>Receipt</title>

          <style>
            body {
              font-family: Arial;
              padding: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }

            h2 {
              margin-bottom: 0;
            }
          </style>
        </head>

        <body>

          <h2>${societyName}</h2>
          <h2>Contribution Receipt</h2>

          <hr />

        <table
        style={{
            width: "100%",
            marginTop: "10px",
            borderCollapse: "collapse",
        }}
        >
        <tbody>
            <tr>
            <td style="padding:6px; font-weight:bold; width:180px;">
                Receipt No
            </td>
            <td style="padding:6px;">
                ${receipt.receiptNo}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Flat
            </td>
            <td style="padding:6px;">
                ${receipt.flatNo}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Member
            </td>
            <td style="padding:6px;">
                ${receipt.memberName}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Total Amount
            </td>
            <td style="padding:6px;">
                ₹ ${receipt.totalAmount}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Payment Mode
            </td>
            <td style="padding:6px;">
                ${receipt.paymentMode || "CASH"}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Date
            </td>
            <td style="padding:6px;">
                ${
                  receipt.createdAt
                    ? new Date(receipt.createdAt).toLocaleDateString("en-GB")
                    : "-"
                }
            </td>
            </tr>
        </tbody>
        </table>

          <table>
            <thead>
              <tr>
                <th>Contribution for</th>
                <th>Net Paid</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

          <br/><br/>

          <p>
            <b>Authorized Signatory</b>
          </p>

        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");

    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSinkingFundPrint = (receipt: Receipt | null) => {
    if (!receipt) return;

    const rows = receiptBills
      .map(
        (b) => `
        <tr>
          <td>${b.receiptType}</td>
          <td>${b.totalAmount}</td>
          <td>${b.status}</td>
        </tr>
      `,
      )
      .join("");

    const societyName = sessionStorage.getItem("societyName") || "";

    const content = `
      <html>
        <head>
          <title>Receipt</title>

          <style>
            body {
              font-family: Arial;
              padding: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }

            h2 {
              margin-bottom: 0;
            }
          </style>
        </head>

        <body>

          <h2>${societyName}</h2>
          <h2>Sinking Fund Receipt</h2>

          <hr />

        <table
        style={{
            width: "100%",
            marginTop: "10px",
            borderCollapse: "collapse",
        }}
        >
        <tbody>
            <tr>
            <td style="padding:6px; font-weight:bold; width:180px;">
                Receipt No
            </td>
            <td style="padding:6px;">
                ${receipt.receiptNo}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Flat
            </td>
            <td style="padding:6px;">
                ${receipt.flatNo}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Member
            </td>
            <td style="padding:6px;">
                ${receipt.memberName}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Total Amount
            </td>
            <td style="padding:6px;">
                ₹ ${receipt.totalAmount}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Payment Mode
            </td>
            <td style="padding:6px;">
                ${receipt.paymentMode || "CASH"}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Date
            </td>
            <td style="padding:6px;">
                ${
                  receipt.createdAt
                    ? new Date(receipt.createdAt).toLocaleDateString("en-GB")
                    : "-"
                }
            </td>
            </tr>
        </tbody>
        </table>

          <table>
            <thead>
              <tr>
                <th>Contribution for</th>
                <th>Net Paid</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

          <br/><br/>

          <p>
            <b>Authorized Signatory</b>
          </p>

        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");

    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const confirmPayment = async (receiptId: number,receiptNo:string) => {

    console.log(receiptNo);

    let paymentTable;
    if (receiptNo.startsWith("RCPT")) {
      paymentTable="billing";
    } else if (receiptNo.startsWith("SFRCPT"))
    {
      paymentTable="sinkingfund";
    } else if(receiptNo.startsWith("CONTR")){
      paymentTable="contribution";
    }

    try {
        await axios.put(`${BASE_URL}/receipts/confirm`, {receiptId, paymentTable,});

        message.success("Payment confirmed successfully");

        loadReceipts(); // refresh table
    } catch (error) {
      console.error(error);
      message.error("Failed to confirm payment");
    }
  };

  const columns: ColumnsType<Receipt> = [
    {
      title: "Receipt No",
      dataIndex: "receiptNo",
    },
    {
      title: "Flat",
      dataIndex: "flatNo",
    },
    {
      title: "Member",
      dataIndex: "memberName",
    },
    {
      title: "Maintenance",
      dataIndex: "maintenanceAmount",
      render: (value) => `₹ ${value}`,
    },
    {
      title: "Interest",
      dataIndex: "interestAmount",
      render: (value) => `₹ ${value}`,
    },
    {
      title: "Discount",
      dataIndex: "discountAmount",
      render: (value) => `₹ ${value}`,
    },
    {
      title: "Net Paid",
      dataIndex: "totalAmount",
      render: (value) => `₹ ${value}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "SUBMITTED" ? "red" : "green"}>{status}</Tag>
      ),
    },
    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
      render: (value) => <Tag color="green">{value || "CASH"}</Tag>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (value) =>
        value ? new Date(value).toLocaleDateString("en-GB") : "-",
    },
    {
      title: "Transaction Id",
      dataIndex: "transactionId",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation(); // prevent row click modal
            confirmPayment(record.id,record.receiptNo);
          }}
        >
          Confirm Payment
        </Button>
      ),
    },
  ];

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
        {role === "ADMIN" ? (
          <Sidebar />
        ) : role === "MEMBER" ? (
          <MemberSidebar />
        ) : role === "SUPER_ADMIN" ? (
          <SuperAdminSidebar />
        ) : (
          <AuditorSidebar />
        )}
      </Layout.Sider>

      {/* MAIN AREA */}
      <Layout style={{ minWidth: 0 }}>
        {/* HEADER (NO EXTRA DIV) */}
        {role === "ADMIN" ? (
          <Header />
        ) : role === "MEMBER" ? (
          <MemberHeader />
        ) : role === "SUPER_ADMIN" ? (
          <SuperAdminHeader />
        ) : (
          <AuditorHeader />
        )}
        <Content>
          <Card
            title="View Receipts"
            style={{ padding: 0, marginTop: -10, marginBottom: -5 }}
          >
            <Form form={form} layout="vertical">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 5,
                  marginBottom: 0,
                }}
              >
                <Form.Item
                  label="Select Flat"
                  style={{
                    flex: "1 1 250px",
                    minWidth: 200,
                    marginBottom: 0,
                    marginTop: -10,
                    maxWidth: "200px",
                  }}
                >
                  <Select
                    allowClear
                    placeholder="Select Flat"
                    options={flats.map((f) => ({
                      label: f.flatNo,
                      value: f.id,
                    }))}
                    onChange={(val) => loadReceipts(val)}
                  />
                </Form.Item>
              </div>
            </Form>

            <div style={{ width: "100%", overflowX: "auto", fontSize: "5px" }}>
              <Table
                rowKey="id"
                dataSource={receipts}
                columns={columns}
                loading={loading}
                size="small"
                pagination={{
                  pageSize: 10,
                }}
                scroll={{ x: "max-content" }}
                onRow={(record) => ({
                  onClick: () => loadReceiptDetails(record.id),
                  style: { cursor: "pointer" },
                })}
              />
            </div>

            <Modal
              open={billingOpen}
              onCancel={() => setBillingOpen(false)}
              width={900}
              title={`Receipt Details - ${selectedReceipt?.receiptNo || ""}`}
              footer={[
                <Button
                  key="print"
                  type="primary"
                  onClick={() => handleBillingPrint(selectedReceipt)}
                >
                  Print Receipt
                </Button>,

                <Button key="close" onClick={() => setBillingOpen(false)}>
                  Close
                </Button>,
              ]}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div>
                  <b>Flat:</b> {selectedReceipt?.flatNo}
                </div>

                <div>
                  <b>Member:</b> {selectedReceipt?.memberName}
                </div>

                <div>
                  <b>Total:</b> ₹ {selectedReceipt?.totalAmount}
                </div>

                <div>
                  <b>Payment Mode:</b> {selectedReceipt?.paymentMode}
                </div>
              </div>

              <Table
                rowKey="id"
                dataSource={receiptBills}
                pagination={false}
                size="small"
                scroll={{ x: "max-content" }}
                columns={[
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
                  },
                  {
                    title: "Penalty",
                    dataIndex: "penaltyAmount",
                  },
                  {
                    title: "Interest",
                    dataIndex: "interestAmount",
                  },
                  {
                    title: "Discount",
                    dataIndex: "discountAmount",
                  },

                  {
                    title: "Total",
                    dataIndex: "totalAmount",
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    render: (value) => <Tag color="green">{value}</Tag>,
                  },
                  {
                    title: "Receipt Type",
                    dataIndex: "receiptType",
                  },
                ]}
              />
            </Modal>

            <Modal
              open={contributionOpen}
              onCancel={() => setContributionOpen(false)}
              width={900}
              title={`Receipt Details - ${selectedReceipt?.receiptNo || ""}`}
              footer={[
                <Button
                  key="print"
                  type="primary"
                  onClick={() => handleContributionPrint(selectedReceipt)}
                >
                  Print Receipt
                </Button>,

                <Button key="close" onClick={() => setContributionOpen(false)}>
                  Close
                </Button>,
              ]}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div>
                  <b>Flat:</b> {selectedReceipt?.flatNo}
                </div>

                <div>
                  <b>Member:</b> {selectedReceipt?.memberName}
                </div>

                <div>
                  <b>Total:</b> ₹ {selectedReceipt?.totalAmount}
                </div>

                <div>
                  <b>Payment Mode:</b> {selectedReceipt?.paymentMode}
                </div>
              </div>

              <Table
                rowKey="id"
                dataSource={receiptBills}
                pagination={false}
                size="small"
                scroll={{ x: "max-content" }}
                columns={[
                  {
                    title: "Contribution for",
                    dataIndex: "name",
                  },
                  {
                    title: "Total",
                    dataIndex: "totalAmount",
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    render: (value) => <Tag color="green">{value}</Tag>,
                  },
                  {
                    title: "Paid Date",
                    dataIndex: "createdAt",
                  },
                ]}
              />
            </Modal>

            <Modal
              open={sinkingFundOpen}
              onCancel={() => setSinkingFundOpen(false)}
              width={900}
              title={`Receipt Details - ${selectedReceipt?.receiptNo || ""}`}
              footer={[
                <Button
                  key="print"
                  type="primary"
                  onClick={() => handleSinkingFundPrint(selectedReceipt)}
                >
                  Print Receipt
                </Button>,

                <Button key="close" onClick={() => setSinkingFundOpen(false)}>
                  Close
                </Button>,
              ]}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div>
                  <b>Flat:</b> {selectedReceipt?.flatNo}
                </div>

                <div>
                  <b>Member:</b> {selectedReceipt?.memberName}
                </div>

                <div>
                  <b>Total:</b> ₹ {selectedReceipt?.totalAmount}
                </div>

                <div>
                  <b>Payment Mode:</b> {selectedReceipt?.paymentMode}
                </div>
              </div>

              <Table
                rowKey="id"
                dataSource={receiptBills}
                pagination={false}
                size="small"
                scroll={{ x: "max-content" }}
                columns={[
                  {
                    title: "Contribution for",
                    dataIndex: "receiptType",
                  },
                  {
                    title: "Total",
                    dataIndex: "totalAmount",
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    render: (value) => <Tag color="green">{value}</Tag>,
                  },
                  {
                    title: "Paid Date",
                    dataIndex: "createdAt",
                  },
                ]}
              />
            </Modal>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
}

import React, { useEffect, useState } from "react";
import { Layout, Table,  Spin, Typography } from "antd";
import MemberSidebar from "../../components/layout/MemberSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;
const { Content } = Layout;
const { Title } = Typography;

/* ================= PRINT FUNCTION ================= */
const printReceipt = (receipt: any, type: string) => {
  if (!receipt) return;

  const rows = (receipt.items || [])
    .map(
      (b: any) => `
      <tr>
        <td>${b.month || "-"}</td>
        <td>${b.year || "-"}</td>
        <td>₹ ${b.totalAmount ?? b.amount ?? 0}</td>
        <td>${b.status || "-"}</td>
      </tr>
    `
    )
    .join("");

  const societyName = sessionStorage.getItem("societyName") || "";

  const flatNo =
    receipt.flatNo ||
    receipt.items?.[0]?.flat?.flatNo ||
    receipt.items?.[0]?.flatNo ||
    "-";

  const content = `
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ccc; padding: 8px; }
          h2 { text-align: center; }
        </style>
      </head>
      <body>

        <h2>${societyName}</h2>
        <h2>${type} Receipt</h2>

        <hr />

        <table>
          <tbody>
            <tr>
              <td><b>Receipt No</b></td>
              <td>${receipt.receiptNo}</td>
            </tr>

            <tr>
              <td><b>Flat</b></td>
              <td>${flatNo}</td>
            </tr>

            <tr>
              <td><b>Total Amount</b></td>
              <td>₹ ${receipt.totalAmount}</td>
            </tr>

            <tr>
              <td><b>Payment Mode</b></td>
              <td>${receipt.paymentMode || "-"}</td>
            </tr>

            <tr>
              <td><b>Date</b></td>
              <td>
                ${
                  receipt.paidDate
                    ? new Date(receipt.paidDate).toLocaleDateString("en-GB")
                    : "-"
                }
              </td>
            </tr>

            <tr>
              <td><b>Transaction ID</b></td>
              <td>${receipt.transactionId || "-"}</td>
            </tr>
          </tbody>
        </table>

        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Year</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <br/><br/>
        <p><b>Authorized Signatory</b></p>

      </body>
    </html>
  `;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(content);
    win.document.close();
    win.print();
  }
};

/* ================= COMPONENT ================= */
const MemberBills: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [groupedBills, setGroupedBills] = useState<any[]>([]);
  const [sinkingFunds, setSinkingFunds] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);


  const memberId = Number(sessionStorage.getItem("memberId"));
  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);

      const flatsRes = await axios.get(`${BASE_URL}/members/flats`, {
        params: { societyId, memberId },
      });

      const flatIds = flatsRes.data.map((f: any) => Number(f.id));

      const payload = {
        flatIds,
        memberId,
        societyId,
        financialYearId,
      };

      const billsRes = await axios.post(`${BASE_URL}/members/bills`, payload);
      const sinkingRes = await axios.post(
        `${BASE_URL}/members/sinking-funds`,
        payload
      );
      const contributionRes = await axios.post(
        `${BASE_URL}/members/contributions `,
        payload
      );

      /* ================= MAINTENANCE ================= */
      const bills = (billsRes.data || [])
        .filter((b: any) => b.status === "PAID")
        .sort(
          (a: any, b: any) =>
            new Date(b.paidDate ?? 0).getTime() -
            new Date(a.paidDate ?? 0).getTime()
        );

      const groupedBills = Object.values(
        bills.reduce((acc: any, item: any) => {
          const key = item.receiptNo || "NO_RECEIPT";

          if (!acc[key]) {
            acc[key] = {
              receiptNo: key,
              paidDate: item.paidDate,
              paymentMode: item.paymentMode,
              totalAmount: 0,
              transactionId: item.transactionId,
              flatNo: item.flat?.flatNo,
              items: [],
            };
          }

          acc[key].items.push(item);
          acc[key].totalAmount += item.totalAmount || 0;

          return acc;
        }, {})
      );

      setGroupedBills(groupedBills);

      /* ================= SINKING FUND ================= */
      const sinkingData = (sinkingRes.data || []).filter(
        (i: any) => i.status === "PAID"
      );

      const groupedSinking = Object.values(
        sinkingData.reduce((acc: any, item: any) => {
          const key = item.receiptNo || "NO_RECEIPT";

          if (!acc[key]) {
            acc[key] = {
              receiptNo: key,
              paidDate: item.paidDate,
              paymentMode: item.paymentMode,
              totalAmount: 0,
              transactionId: item.transactionId,
              flatNo: item.flatNo,
              items: [],
            };
          }

          acc[key].items.push(item);
          acc[key].totalAmount += Number(item.amount || 0);

          return acc;
        }, {})
      );

      setSinkingFunds(groupedSinking);


      const contributionsData = (contributionRes.data || [])
        .filter((b: any) => b.status === "PAID")
        .sort(
          (a: any, b: any) =>
            new Date(b.paidDate ?? 0).getTime() -
            new Date(a.paidDate ?? 0).getTime()
        );

      const groupedContributions = Object.values(
        contributionsData.reduce((acc: any, item: any) => {
          const key = item.receiptNo || "NO_RECEIPT";

          if (!acc[key]) {
            acc[key] = {
              receiptNo: key,
              paidDate: item.paidDate,
              paymentMode: item.paymentMode,
              totalAmount: Number(item.receiptAmount || 0), 
              transactionId: item.transactionId,
              flatNo: item.flatNo,
              items: [],
            };
          }

    acc[key].items.push({
      ...item,
      amount: item.contributionAmount, // item-wise amount
    });


          return acc;
        }, {})
      );

      setContributions(groupedContributions);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= COLUMNS ================= */
  const columns = [
    {
      title: "Receipt No",
      dataIndex: "receiptNo",
      render: (_: any, record: any) => (
        <span
          style={{
            color: "#1677ff",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() => printReceipt(record, "Maintenance")}
        >
          {record.receiptNo}
        </span>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      render: (v: number) => `₹ ${v}`,
    },
    {
      title: "Paid Date",
      dataIndex: "paidDate",
      render: (v: string) =>
        v ? new Date(v).toLocaleDateString("en-GB") : "-",
    },
    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
    },
    {
      title: "Transaction Id",
      dataIndex: "transactionId",
    },
  ];

  const sinkingColumns = [
    {
      title: "Receipt No",
      dataIndex: "receiptNo",
      render: (_: any, record: any) => (
        <span
          style={{
            color: "#1677ff",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() => printReceipt(record, "Sinking Fund")}
        >
          {record.receiptNo}
        </span>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      render: (v: number) => `₹ ${v}`,
    },
    {
      title: "Paid Date",
      dataIndex: "paidDate",
      render: (v: string) =>
        v ? new Date(v).toLocaleDateString("en-GB") : "-",
    },
    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
    },
    {
      title: "Transaction Id",
      dataIndex: "transactionId",
    },
  ];

    const contributionColumns = [
    {
      title: "Receipt No",
      dataIndex: "receiptNo",
      render: (_: any, record: any) => (
        <span
          style={{
            color: "#1677ff",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() => printReceipt(record, "Contributions")}
        >
          {record.receiptNo}
        </span>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      render: (v: number) => `₹ ${v}`,
    },
    {
      title: "Paid Date",
      dataIndex: "paidDate",
      render: (v: string) =>
        v ? new Date(v).toLocaleDateString("en-GB") : "-",
    },
    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
    },
    {
      title: "Transaction Id",
      dataIndex: "transactionId",
    },
  ];


  /* ================= UI ================= */
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider breakpoint="lg" collapsedWidth="0">
        <MemberSidebar />
      </Layout.Sider>

      <Layout>
        <MemberHeader />

        <Content style={{ padding: 24, background: "#f0f5ff" }}>
          <Title level={3}>Paid Bills</Title>

          {loading ? (
            <Spin size="large" />
          ) : (
            <>
              <Table
                dataSource={groupedBills}
                columns={columns}
                rowKey="receiptNo"
                bordered
                size="small"
                pagination={{ pageSize: 8 }}
                scroll={{ x: "max-content" }}
              />

              <div style={{ marginTop: 32 }}>
                <Title level={3}>Sinking Fund</Title>

                <Table
                  dataSource={sinkingFunds}
                  columns={sinkingColumns}
                  rowKey="receiptNo"
                  bordered
                  size="small"
                  pagination={{ pageSize: 8 }}
                  scroll={{ x: "max-content" }}
                />
              </div>

              <div style={{ marginTop: 32 }}>
                <Title level={3}>Contributions</Title>

                <Table
                  dataSource={contributions}
                  columns={contributionColumns}
                  rowKey="receiptNo"
                  bordered
                  size="small"
                  pagination={{ pageSize: 8 }}
                  scroll={{ x: "max-content" }}
                />
              </div>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MemberBills;
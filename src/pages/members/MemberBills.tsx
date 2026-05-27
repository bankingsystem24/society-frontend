import React, { useEffect, useState } from "react";
import { Layout, Table, Tag, Spin, Typography } from "antd";
import MemberSidebar from "../../components/layout/MemberSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;
const { Content } = Layout;
const { Title } = Typography;

type Billing = {
  id: number;
  month: string;
  year: number;
  totalAmount: number;
  status: string;
  paidDate?: string;
  paymentMode?: string;
  receiptNo?: string;
  flat?: { flatNo?: string };
};

const MemberBills: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [groupedBills, setGroupedBills] = useState<any[]>([]);

  const memberId = Number(sessionStorage.getItem("memberId"));
  const societyId = Number(sessionStorage.getItem("societyId"));

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

      if (flatIds.length === 0) {
        setGroupedBills([]);
        return;
      }

      const billsRes = await axios.post(`${BASE_URL}/members/bills`, {
        flatIds,
      });

      const bills: Billing[] = (billsRes.data || [])
      .filter((b: any) => b.status === "PAID")
      .sort(
        (a :any, b:any) =>
          new Date(b.paidDate ?? 0).getTime() -
          new Date(a.paidDate ?? 0).getTime()
      );

      const grouped = bills.reduce((acc: any, item: Billing) => {
        const key = item.receiptNo || "NO_RECEIPT";

        if (!acc[key]) {
          acc[key] = {
            receiptNo: key,
            paidDate: item.paidDate,
            paymentMode: item.paymentMode,
            totalAmount: 0,
            items: [],
          };
        }

        acc[key].items.push(item);
        acc[key].totalAmount += item.totalAmount || 0;

        return acc;
      }, {});

      setGroupedBills(Object.values(grouped));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= PRINT =================
  const handlePrint = (receipt: any) => {
    if (!receipt) return;

    const rows = receipt.items
      .map(
        (b: any) => `
        <tr>
          <td>${b.month}</td>
          <td>${b.year}</td>
          <td>${b.totalAmount}</td>
          <td>${b.status}</td>
        </tr>
      `
      )
      .join("");

    const societyName = sessionStorage.getItem("societyName") || "";

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
          <h2>Maintenance Receipt</h2>

          <hr />

          <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
            <tbody>
              <tr>
                <td style="padding:6px; font-weight:bold; width:180px; background:#f5f5f5;">
                  Receipt No
                </td>
                <td style="padding:6px;">
                  ${receipt.receiptNo}
                </td>
              </tr>

              <tr>
                <td style="padding:6px; font-weight:bold; background:#f5f5f5;">
                  Flat
                </td>
                <td style="padding:6px;">
                  ${receipt.items?.[0]?.flat?.flatNo || "-"}
                </td>
              </tr>

              <tr>
                <td style="padding:6px; font-weight:bold; background:#f5f5f5;">
                  Total Amount
                </td>
                <td style="padding:6px;">
                  ₹ ${receipt.totalAmount}
                </td>
              </tr>

              <tr>
                <td style="padding:6px; font-weight:bold; background:#f5f5f5;">
                  Payment Mode
                </td>
                <td style="padding:6px;">
                  ${receipt.paymentMode || ""}
                </td>
              </tr>

              <tr>
                <td style="padding:6px; font-weight:bold; background:#f5f5f5;">
                  Date
                </td>
                <td style="padding:6px;">
                  ${
                    receipt.paidDate
                      ? new Date(receipt.paidDate).toLocaleDateString("en-GB")
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

  // ================= INNER TABLE =================
  const innerColumns = [
    {
      title: "Flat No",
      render: (_: any, r: any) => r.flat?.flatNo,
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
      dataIndex: "totalAmount",
      render: (v: number) => `₹ ${v}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => (
        <Tag color={status === "PAID" ? "green" : "red"}>{status}</Tag>
      ),
    },
  ];

  // ================= MAIN TABLE =================
  const columns = [
{
  title: "Receipt No",
  dataIndex: "receiptNo",
  render: (_: any, record: any) => {
    const isValid = record.receiptNo && record.receiptNo !== "NO_RECEIPT";

    return (
      <span
        style={{
          color: isValid ? "#1677ff" : "#999",
          cursor: isValid ? "pointer" : "not-allowed",
          fontWeight: 500,
          textDecoration: isValid ? "underline" : "none",
        }}
        onClick={() => {
          if (isValid) {
            handlePrint(record);
          }
        }}
      >
        {record.receiptNo || "NO_RECEIPT"}
      </span>
    );
  },
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
  ];

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
            <Table
              dataSource={groupedBills}
              columns={columns}
              rowKey="receiptNo"
              bordered
              pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender: (record: any) => (
                  <Table
                    dataSource={record.items}
                    columns={innerColumns}
                    pagination={false}
                    rowKey="id"
                    size="small"
                  />
                ),
              }}
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MemberBills;
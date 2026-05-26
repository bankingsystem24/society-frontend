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
  receiptId?: number;
  flat?: {
    flatNo?: string;
  };
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

      // 1. GET FLATS
      const flatsRes = await axios.get(`${BASE_URL}/members/flats`, {
        params: { societyId, memberId },
      });

      const flatIds = flatsRes.data.map((f: any) => Number(f.id));

      if (flatIds.length === 0) {
        setGroupedBills([]);
        return;
      }

      // 2. GET BILLS
      const billsRes = await axios.post(`${BASE_URL}/members/bills`, {
        flatIds,
      });

      const bills: Billing[] = (billsRes.data || []).sort(
        (a: Billing, b: Billing) =>
          new Date(b.paidDate ?? 0).getTime() -
          new Date(a.paidDate ?? 0).getTime(),
      );

      // 3. GROUP BY RECEIPT NO
      const grouped = bills.reduce((acc: any, item: Billing) => {
        const key = item.receiptNo || "NO_RECEIPT";

        if (!acc[key]) {
          acc[key] = {
            receiptNo: key,
            paidDate: item.paidDate,
            totalAmount: 0,
            items: [],
          };
        }

        acc[key].items.push(item);
        acc[key].totalAmount += item.totalAmount || 0;

        return acc;
      }, {});

      setGroupedBills(Object.values(grouped));

      console.log("Grouped Bills:", Object.values(grouped));
    } catch (error) {
      console.error("Error fetching bills", error);
    } finally {
      setLoading(false);
    }
  };

  // MAIN TABLE COLUMNS (Receipt Level)
  const columns = [
    {
      title: "Receipt No",
      dataIndex: "receiptNo",
      key: "receiptNo",
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (v: number) => `₹ ${v}`,
    },
    {
      title: "Paid Date",
      dataIndex: "paidDate",
      key: "paidDate",
      render: (v: string) =>
        v ? new Date(v).toLocaleDateString("en-GB") : "-",
    },
  ];

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
    {
      title: "Mode",
      dataIndex: "paymentMode",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <Layout.Sider breakpoint="lg" collapsedWidth="0">
        <MemberSidebar />
      </Layout.Sider>

      {/* MAIN */}
      <Layout>
        <MemberHeader />

        <Content
          style={{
            padding: 24,
            background: "#f0f5ff",
            minHeight: "100vh",
          }}
        >
          <Title level={3}>Member Bills (Grouped by Receipt)</Title>

          {loading ? (
            <div style={{ textAlign: "center", marginTop: 50 }}>
              <Spin size="large" />
            </div>
          ) : (
            <Table
              dataSource={groupedBills}
              columns={columns}
              rowKey="receiptNo"
              bordered
              pagination={{ pageSize: 10 }}
              size="small"
              scroll={{ x: "max-content" }}
              expandable={{
                expandedRowRender: (record: any) => (
                  <Table
                    dataSource={record.items}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    scroll={{ x: "max-content" }}
                    columns={innerColumns}
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

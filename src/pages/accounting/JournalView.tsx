import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  message,
  Tag,
  Row,
  Col,
  Collapse,
  Layout
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import Sidebar from "../../components/layout/Sidebar";
import MemberSidebar from "../../components/layout/MemberSidebar";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";

const BASE_URL = import.meta.env.VITE_API_URL;

const { Content } = Layout;
const { Title } = Typography;

interface JournalData {
  journalId: number;
  voucherNo: string;
  voucherType: string;
  entryDate: string;
  narration: string;
  glCode: number;
  accountHead: string;
  debitAmount: number;
  creditAmount: number;
}

const JournalView: React.FC = () => {
  const [data, setData] = useState<JournalData[]>([]);
  const [loading, setLoading] = useState(false);

  const societyId = sessionStorage.getItem("societyId");
  const role = sessionStorage.getItem("role");
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

  useEffect(() => {
    fetchJournal();
  }, []);

  const fetchJournal = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${BASE_URL}/journal/`,
        { params: { societyId, financialYearId }, } );

      setData(response.data);
    } catch (error) {
      console.error(error);
      message.error("Failed to load journal data");
    } finally {
      setLoading(false);
    }
  };

  // ================= GROUPING =================

  const grouped = data.reduce((acc: any, item) => {
    if (!acc[item.voucherType]) acc[item.voucherType] = {};
    if (!acc[item.voucherType][item.voucherNo]) {
      acc[item.voucherType][item.voucherNo] = [];
    }
    acc[item.voucherType][item.voucherNo].push(item);
    return acc;
  }, {});

  const columns = [
    {
      title: "Voucher No",
      dataIndex: "voucherNo",
      width: 100,
    },
    {
      title: "Type",
      dataIndex: "voucherType",
      width: 110,
      render: (type: string) => {
        let color = "blue";
        if (type === "RECEIPT") color = "green";
        if (type === "PAYMENT") color = "red";
        if (type === "BILL") color = "orange";
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "Date",
      dataIndex: "entryDate",
      width: 130,
      render: (date: string) => dayjs(date).format("DD-MMM-YYYY"),
    },
    {
      title: "Narration",
      dataIndex: "narration",
      width: 200,
    },
    {
      title: "GL Code",
      dataIndex: "glCode",
      width: 110,
    },
    {
      title: "Account Head",
      dataIndex: "accountHead",
      width: 150,
    },
    {
      title: "Debit",
      dataIndex: "debitAmount",
      width: 100,
      align: "right" as const,
      render: (value: number) =>
        value > 0
          ? value.toLocaleString("en-IN", { minimumFractionDigits: 2 })
          : "-",
    },
    {
      title: "Credit",
      dataIndex: "creditAmount",
      width: 100,
      align: "right" as const,
      render: (value: number) =>
        value > 0
          ? value.toLocaleString("en-IN", { minimumFractionDigits: 2 })
          : "-",
    },
  ];

  // ================= TOTALS =================

  const totalDebit = data.reduce((s, r) => s + (r.debitAmount || 0), 0);
  const totalCredit = data.reduce((s, r) => s + (r.creditAmount || 0), 0);

  const getGroupTotal = (rows: JournalData[]) => {
    return rows.reduce(
      (acc, r) => {
        acc.debit += r.debitAmount || 0;
        acc.credit += r.creditAmount || 0;
        return acc;
      },
      { debit: 0, credit: 0 },
    );
  };


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
      <Content>


    <Card style={{ margin: 10 }}>
      {/* HEADER */}
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Journal View
          </Title>
        </Col>

        <Col>
          <b>
            Debit:{" "}
            {totalDebit.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}{" "}
            | Credit:{" "}
            {totalCredit.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </b>
        </Col>
      </Row>

      <br />

      {/* GROUPED VIEW */}
      <Collapse
        defaultActiveKey={Object.keys(grouped)}
        items={Object.keys(grouped).map((type) => {
          const voucherGroup = grouped[type];

          const typeRows = Object.values(voucherGroup).flat() as JournalData[];
          const typeTotal = getGroupTotal(typeRows);

          return {
            key: type,
            label: (
              <Row justify="space-between" style={{ width: "100%" }}>
                <Col>
                  <Tag
                    color={
                      type === "RECEIPT"
                        ? "green"
                        : type === "PAYMENT"
                          ? "red"
                          : "orange"
                    }
                  >
                    {type}
                  </Tag>
                </Col>

                <Col>
                  <b>
                    Debit:{" "}
                    {typeTotal.debit.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                    {" | "}
                    Credit:{" "}
                    {typeTotal.credit.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </b>
                </Col>
              </Row>
            ),

            children: (
              <Collapse
                items={Object.keys(voucherGroup).map((voucherNo) => {
                  const rows = voucherGroup[voucherNo];
                  const totals = getGroupTotal(rows);

                  return {
                    key: voucherNo,
                    label: (
                      <Row justify="space-between" style={{ width: "100%" }}>
                        <Col>
                          <b>{voucherNo}</b>
                        </Col>

                        <Col>
                          Debit:{" "}
                          {totals.debit.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                          {" | "}
                          Credit:{" "}
                          {totals.credit.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </Col>
                      </Row>
                    ),

                    children: (
                      <Table
                        bordered
                        size="small"
                        loading={loading}
                        columns={columns}
                        dataSource={rows}
                        rowKey={(r: JournalData) =>
                          `${r.journalId}-${r.glCode}`
                        }
                        pagination={{
                          pageSize: 8,
                        }}
                        scroll={{ x: "max-content" }}
                      />
                    ),
                  };
                })}
              />
            ),
          };
        })}
      />
    </Card>
    </Content>
    </Layout>
    </Layout>
  );
};

export default JournalView;

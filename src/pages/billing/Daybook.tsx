import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  DatePicker,
  Button,
  Typography,
  Spin,
  message,
  Layout,
} from "antd";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import "./Daybook.css";
import Header from "../../components/layout/Header";
import MemberHeader from "../../components/layout/MemberHeader";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";

const { Title } = Typography;
const { Content } = Layout;
const role = sessionStorage.getItem("role");

const BASE_URL = import.meta.env.VITE_API_URL;

interface DayBookDTO {
  entryDate: string;
  voucherNo: string;
  glCode: number;
  accountName: string;
  memberName: string;
  particulars: string;
  remarks: string;
  debitAmount: number;
  creditAmount: number;
}

interface DayBookGroupDTO {
  glCode: number;
  accountName: string;
  totalDebit: number;
  totalCredit: number;
  transactions: DayBookDTO[];
}

interface DayBookReportDTO {
  debitGroups: DayBookGroupDTO[];
  creditGroups: DayBookGroupDTO[];
  totalDebit: number;
  totalCredit: number;
}

const Daybook = () => {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Dayjs>(dayjs());

  const [report, setReport] = useState<DayBookReportDTO>({
    debitGroups: [],
    creditGroups: [],
    totalDebit: 0,
    totalCredit: 0,
  });

  const societyId = sessionStorage.getItem("societyId");

  const loadReport = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/daybook`, {
        params: {
          societyId,
          date: date.format("YYYY-MM-DD"),
        },
      });
      setReport(res.data);

    } catch (e) {
      console.error(e);
      message.error("Unable to load Day Book");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [date]);

  const maxGroups = Math.max(
    report.debitGroups.length,
    report.creditGroups.length,
  );
  const handlePrint = () => {
    window.print();
  };
  return (
    // <Layout style={{ minHeight: "100vh" }}>
    //   <Layout.Sider
    //     width={role === "MEMBER" ? 200 : 250}
    //     breakpoint="lg"
    //     collapsedWidth="0"
    //     style={{
    //       height: "100vh",
    //       position: "sticky",
    //       top: 0,
    //       overflowY: "auto",
    //     }}
    //   >
    //     {role === "ADMIN" ? (
    //       <Sidebar />
    //     ) : role === "MEMBER" ? (
    //       <MemberSidebar />
    //     ) : role === "SUPER_ADMIN" ? (
    //       <SuperAdminSidebar />
    //     ) : (
    //       <AuditorSidebar />
    //     )}
    //   </Layout.Sider>

    //   {/* MAIN AREA */}
    //   <Layout style={{ minWidth: 0 }}>
    //     {/* HEADER (NO EXTRA DIV) */}
    //     {role === "ADMIN" ? (
    //       <Header />
    //     ) : role === "MEMBER" ? (
    //       <MemberHeader />
    //     ) : role === "SUPER_ADMIN" ? (
    //       <SuperAdminHeader />
    //     ) : (
    //       <AuditorHeader />
    //     )}
    //     <Content>
          <div id="daybook-print">
            {/* Entire Day Book Report */}

            <Card>
              <Row justify="space-between" style={{ marginBottom: 5 }}>
                <Col>
                  <DatePicker value={date} onChange={(d) => { if (d) { loadReport(); setDate(d);  } }}/>   
                  {/* <Button
                    type="primary"
                    onClick={loadReport}
                    style={{ marginLeft: 10 }}
                  >
                    Search
                  </Button> */}
                  <Button
                    type="primary"
                    onClick={handlePrint}
                    style={{ marginLeft: 10 }}
                  >
                    Print
                  </Button>
                </Col>
              </Row>

              <Title
                level={5}
                style={{ textAlign: "center", marginTop: 0, marginBottom: 0 }}
              >
                DAY BOOK
              </Title>

              <Title
                level={5}
                style={{ textAlign: "center", marginTop: 0, marginBottom: 0 }}
              >
                {date.format("DD-MM-YYYY")}
              </Title>
              <Spin spinning={loading}>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className="debit-header" >DEBIT</div>
                  </Col>

                  <Col span={12}>
                    <div className="credit-header">CREDIT</div>
                  </Col>
                </Row>

                {Array.from({ length: maxGroups }).map((_, index) => {
                  const debit = report.debitGroups[index];
                  const credit = report.creditGroups[index];

                  return (
                    <Row gutter={16} key={index} style={{ marginTop: 15 }}>
                      {/* Debit */}
                      <Col span={12}>
                        {debit && (
                          <>
                            <table className="daybook-table">
                              <thead>
                                <tr>
                                  <th colSpan={3} style={{ textAlign: "left" }}>
                                    {debit.glCode} - {debit.accountName}
                                  </th>
                                </tr>

                                <tr>
                                  <th>Voucher</th>
                                  <th>Particulars</th>
                                  <th>Debit</th>
                                </tr>
                              </thead>

                              <tbody>
                                {debit.transactions.map((t, i) => (
                                  <tr key={i}>
                                    <td>{t.voucherNo}</td>
                                    <td>{t.memberName || t.particulars || "-"}</td>
                                    <td className="text-right">
                                      {t.debitAmount.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}

                                <tr className="group-total">
                                  <td colSpan={2}>
                                    <b>Total</b>
                                  </td>

                                  <td className="text-right">
                                    <b>{debit.totalDebit.toFixed(2)}</b>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </>
                        )}
                      </Col>

                      {/* Credit */}
                      <Col span={12}>
                        {credit && (
                          <>
                            <table className="daybook-table">
                              <thead>
                                <tr>
                                  <th colSpan={3} style={{ textAlign: "left" }}>
                                    {credit.glCode} - {credit.accountName}
                                  </th>
                                </tr>

                                <tr>
                                  <th>Voucher</th>
                                  <th>Particulars</th>
                                  <th>Credit</th>
                                </tr>
                              </thead>

                              <tbody>
                                {credit.transactions.map((t, i) => (
                                  <tr key={i}>
                                    <td>{t.voucherNo}</td>
                                    <td>{t.memberName || t.particulars || "-"}</td>
                                    <td className="text-right">
                                      {t.creditAmount.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}

                                <tr className="group-total">
                                  <td colSpan={2}>
                                    <b>Total</b>
                                  </td>

                                  <td className="text-right">
                                    <b>{credit.totalCredit.toFixed(2)}</b>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </>
                        )}
                      </Col>
                    </Row>
                  );
                })}

                <Row style={{ marginTop: 20 }}>
                  <Col span={12}>
                    <Title level={5}>
                      Total Debit : {report.totalDebit.toFixed(2)}
                    </Title>
                  </Col>

                  <Col span={12} style={{ textAlign: "right" }}>
                    <Title level={5}>
                      Total Credit : {report.totalCredit.toFixed(2)}
                    </Title>
                  </Col>
                </Row>
              </Spin>
            </Card>
          </div>
    //     </Content>
    //   </Layout>
    // </Layout>
  );
};

export default Daybook;

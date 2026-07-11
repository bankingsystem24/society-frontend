import React, { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Typography,
  Row,
  Col,
  Button,
  message,
  Spin,
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

import "../../App.css";
import "./ProfitLossSnapshotView.css";

const { Title, Text } = Typography;
const { Content } = Layout;

const BASE_URL = import.meta.env.VITE_API_URL;

interface ProfitLossDetail {
  id: number;
  glCode: number;
  accountName: string;
  accountType: string;
  amount: number;
}

interface ProfitLossSnapshot {
  id: number;
  societyId: number;
  financialYearId: number;
  remarks: string;
  createdBy: number;
  createdAt: string;
  totalIncome: number;
  totalExpense: number;
  netProfitLoss: number;
  details: ProfitLossDetail[];
}

const ProfitLossSnapshotView: React.FC = () => {

  const role = sessionStorage.getItem("role");

  const financialYearId = Number(
    sessionStorage.getItem("financialYearId")
  );

  const societyName =
    sessionStorage.getItem("societyName") ?? "";

  const financialYear =
    sessionStorage.getItem("financialYear") ?? "";

  const [loading, setLoading] = useState(false);

  const [snapshot, setSnapshot] =
    useState<ProfitLossSnapshot | null>(null);

  const [incomeRows, setIncomeRows] =
    useState<ProfitLossDetail[]>([]);

  const [expenseRows, setExpenseRows] =
    useState<ProfitLossDetail[]>([]);

  useEffect(() => {
    fetchSnapshot();
  }, []);

  const fetchSnapshot = async () => {

    try {

      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/profit-loss-snapshot/${financialYearId}`
      );

      const data = res.data;

      setSnapshot(data);

      setIncomeRows(
        (data.details || []).filter(
          (x: ProfitLossDetail) =>
            x.accountType === "INCOME"
        )
      );

      setExpenseRows(
        (data.details || []).filter(
          (x: ProfitLossDetail) =>
            x.accountType === "EXPENSE"
        )
      );

    } catch (error) {

      console.error(error);
      message.error("Profit & Loss Snapshot not found");
    } finally {

      setLoading(false);

    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Spin
          size="large"
          style={{
            margin: "180px auto",
          }}
        />
      </Layout>
    );
  }

  const totalIncome =
    snapshot?.totalIncome ?? 0;

  const totalExpense =
    snapshot?.totalExpense ?? 0;

  const netProfit =
    snapshot?.netProfitLoss ?? 0;

  const maxRows = Math.max(
    incomeRows.length,
    expenseRows.length
  );

  const reportRows = [];

  for (let i = 0; i < maxRows; i++) {

    reportRows.push({

      income: incomeRows[i] ?? null,

      expense: expenseRows[i] ?? null,

    });

  }
    return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider
        className="no-print"
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

      <Layout>

        <div className="no-print">
          {role === "ADMIN" ? (
            <Header />
          ) : role === "MEMBER" ? (
            <MemberHeader />
          ) : role === "SUPER_ADMIN" ? (
            <SuperAdminHeader />
          ) : (
            <AuditorHeader />
          )}
        </div>

        <Content style={{ padding: 20 }}>

          <div className="no-print" style={{ marginBottom: 15 }}>
            <Button type="primary" onClick={handlePrint}>
              Print Report
            </Button>
          </div>

          <div id="print-area" className="pl-report">

            <div className="report-header">

              <Title level={3} style={{ marginBottom: 0 }}>
                {societyName}
              </Title>

              <Title level={4} style={{ marginTop: 5 }}>
                PROFIT & LOSS ACCOUNT (Snapshot)
              </Title>

              <Text strong>
                Financial Year : {financialYear}
              </Text>

            </div>

            <table className="profit-loss-table">

              <thead>

                <tr>

                  <th style={{ width: "6%" }}>Sr.</th>
                  <th style={{ width: "34%" }}>
                    Income Particulars
                  </th>
                  <th style={{ width: "15%" }}>
                    Amount
                  </th>

                  <th style={{ width: "6%" }}>Sr.</th>
                  <th style={{ width: "24%" }}>
                    Expense Particulars
                  </th>
                  <th style={{ width: "15%" }}>
                    Amount
                  </th>

                </tr>

              </thead>

              <tbody>

                {reportRows.map((row, index) => (

                  <tr key={index}>

                    <td align="center">
                      {row.income ? index + 1 : ""}
                    </td>

                    <td>
                      {row.income?.accountName ?? ""}
                    </td>

                    <td align="right">
                      {row.income
                        ? row.income.amount.toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                            }
                          )
                        : ""}
                    </td>

                    <td align="center">
                      {row.expense ? index + 1 : ""}
                    </td>

                    <td>
                      {row.expense?.accountName ?? ""}
                    </td>

                    <td align="right">
                      {row.expense
                        ? row.expense.amount.toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                            }
                          )
                        : ""}
                    </td>

                  </tr>

                ))}

                <tr className="total-row">

                  <td></td>

                  <td>
                    <b>Total</b>
                  </td>

                  <td align="right">
                    <b>
                      {totalIncome.toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </b>
                  </td>

                  <td></td>

                  <td>
                    <b>Total</b>
                  </td>

                  <td align="right">
                    <b>
                      {totalExpense.toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </b>
                  </td>

                </tr>

                {/* <tr className="net-row">

                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    {netProfit >= 0
                      ? `Net Profit : ₹ ${netProfit.toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}`
                      : `Net Loss : ₹ ${Math.abs(
                          netProfit
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}`}
                  </td>

                </tr> */}

              </tbody>

            </table>

            <div className="signature-section">

              <div className="signature-box">
                <br />
                ______________________
                <br />
                Auditor
              </div>

              <div className="signature-box">
                <br />
                ______________________
                <br />
                Secretary
              </div>

              <div className="signature-box">
                <br />
                ______________________
                <br />
                Chairman
              </div>

            </div>

          </div>

        </Content>

      </Layout>

    </Layout>
  );
};

export default ProfitLossSnapshotView;
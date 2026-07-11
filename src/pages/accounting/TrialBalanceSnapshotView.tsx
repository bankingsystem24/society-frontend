import React, { useEffect, useState } from "react";
import { Layout, Typography, Button, Spin, message } from "antd";
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
import "./TrialBalanceSnapshotView.css";

const { Title, Text } = Typography;
const { Content } = Layout;

const BASE_URL = import.meta.env.VITE_API_URL;

interface SnapshotRow {
  glCode: number;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
}

const TrialBalanceSnapshotView: React.FC = () => {
  const role = sessionStorage.getItem("role");

  const societyId = Number(sessionStorage.getItem("societyId"));

  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

  const societyName = sessionStorage.getItem("societyName") ?? "";

  const societyAddress = sessionStorage.getItem("societyAddress") ?? "";

  const financialYear = sessionStorage.getItem("financialYear") ?? "";

  const [loading, setLoading] = useState(false);

  const [rows, setRows] = useState<SnapshotRow[]>([]);

  useEffect(() => {
    loadSnapshot();
  }, []);

  const loadSnapshot = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/trial-balance-snapshot/view`, {
        params: {
          societyId,
          financialYearId,
        },
      });

      setRows(res.data);
    } catch (e) {
      console.error(e);

      message.error("Trial Balance Snapshot not found.");
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

  const totalDebit = rows.reduce((sum, row) => sum + (row.debitAmount || 0), 0);

  const totalCredit = rows.reduce(
    (sum, row) => sum + (row.creditAmount || 0),
    0,
  );

  const difference = totalDebit - totalCredit;

  const isBalanced = Math.abs(difference) < 0.01;
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

          <div className="tb-report">
            <div className="report-header">
              <Title level={3} style={{ marginBottom: 0 }}>
                {societyName}
              </Title>

              <Text style={{ fontSize: 15 }}>{societyAddress}</Text>

              <Title level={4} style={{ marginTop: 8 }}>
                TRIAL BALANCE (Snapshot)
              </Title>

              <Text strong>Financial Year : {financialYear}</Text>
            </div>

            <table className="trial-balance-report">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Sr.</th>

                  <th style={{ width: 120 }}>GL Code</th>

                  <th>Account Name</th>

                  <th style={{ width: 180 }}>Credit</th>

                  <th style={{ width: 180 }}>Debit</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.glCode}>
                    <td className="center">{index + 1}</td>

                    <td className="center">{row.glCode}</td>

                    <td>{row.accountName}</td>

                    <td className="amount">
                      {row.creditAmount !== null &&
                      row.creditAmount !== undefined
                        ? row.creditAmount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })
                        : ""}
                    </td>

                    <td className="amount">
                      {row.debitAmount !== null && row.debitAmount !== undefined
                        ? row.debitAmount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })
                        : ""}
                    </td>
                  </tr>
                ))}

                <tr className="total-row">
                  <td></td>

                  <td></td>

                  <td>
                    <strong>TOTAL</strong>
                  </td>

                  <td className="amount">
                    <strong>
                      {totalDebit.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </td>

                  <td className="amount">
                    <strong>
                      {totalCredit.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </td>
                </tr>

                <tr>
                  <td colSpan={5}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "6px 12px",
                        fontWeight: 600,
                      }}
                    >
                      <span>
                        Difference :{" "}
                        {difference.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </span>

                      <span
                        style={{
                          color: isBalanced ? "green" : "red",
                        }}
                      >
                        {isBalanced
                          ? "TRIAL BALANCE IS BALANCED"
                          : "TRIAL BALANCE IS NOT BALANCED"}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <table className="signature-table">
              <tbody>
                <tr>
                  <td>
                    <div className="signature-line"></div>
                    Prepared By
                  </td>

                  <td>
                    <div className="signature-line"></div>
                    Secretary
                  </td>

                  <td>
                    <div className="signature-line"></div>
                    Chairman
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TrialBalanceSnapshotView;

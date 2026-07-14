import React, { useEffect, useState } from "react";
import { Layout, Typography, Button, message, Spin } from "antd";
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
import "./BalanceSheetSnapshotView.css";

const { Title, Text } = Typography;
const { Content } = Layout;

const BASE_URL = import.meta.env.VITE_API_URL;

interface BalanceSheetDetail {
  id: number;
  glCode: number;
  accountName: string;
  accountType: string; // ASSET, LIABILITY, EQUITY
  amount: number;
}

interface BalanceSheetSnapshot {
  id: number;
  societyId: number;
  financialYearId: number;
  remarks: string;
  createdBy: number;
  createdAt: string;

  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  currentYearProfitLoss: number;

  details: BalanceSheetDetail[];
}

const BalanceSheetSnapshotView: React.FC = () => {
  const role = sessionStorage.getItem("role");

  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

  const societyName = sessionStorage.getItem("societyName") ?? "";

  const financialYear = sessionStorage.getItem("financialYear") ?? "";

  const [loading, setLoading] = useState(false);

  const [snapshot, setSnapshot] = useState<BalanceSheetSnapshot | null>(null);

  const [liabilityRows, setLiabilityRows] = useState<BalanceSheetDetail[]>([]);

  const [assetRows, setAssetRows] = useState<BalanceSheetDetail[]>([]);

  useEffect(() => {
    fetchSnapshot();
  }, []);

  const fetchSnapshot = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/balance-sheet-snapshot/${financialYearId}`,
      );

      const data: BalanceSheetSnapshot = res.data;

      setSnapshot(data);

      const liabilities = (data.details || []).filter(
        (x) => x.accountType === "LIABILITIES" || x.accountType === "EQUITY",
      );

      const assets = (data.details || []).filter(
        (x) => x.accountType === "ASSETS",
      );

      // Show Current Year Profit/Loss separately

      if ((data.currentYearProfitLoss ?? 0) > 0) {
        liabilities.push({
          id: -1,
          glCode: 0,
          accountName: "Add : Current Year Profit",
          accountType: "EQUITY",
          amount: data.currentYearProfitLoss,
        });
      } else if ((data.currentYearProfitLoss ?? 0) < 0) {
        liabilities.push({
          id: -2,
          glCode: 0,
          accountName: "Less : Current Year Loss",
          accountType: "EQUITY",
          amount: data.currentYearProfitLoss,
        });
      }

      setLiabilityRows(liabilities);
      setAssetRows(assets);
    } catch (error) {
      console.error(error);
      message.error("Balance Sheet Snapshot not found");
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

  const maxRows = Math.max(liabilityRows.length, assetRows.length);

  const reportRows = [];

  for (let i = 0; i < maxRows; i++) {
    reportRows.push({
      liability: liabilityRows[i] ?? null,

      asset: assetRows[i] ?? null,
    });
  }

  const totalLiabilitySide =
    (snapshot?.totalLiabilities ?? 0) +
    (snapshot?.totalEquity ?? 0) +
    (snapshot?.currentYearProfitLoss ?? 0);

  const totalAssetSide = snapshot?.totalAssets ?? 0;

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

          <div id="print-area" className="bs-report">
            <div className="report-header">
              <Title level={3} style={{ marginBottom: 0 }}>
                {societyName}
              </Title>

              <Title level={4} style={{ marginTop: 5 }}>
                BALANCE SHEET (Snapshot)
              </Title>

              <Text strong>Financial Year : {financialYear}</Text>
            </div>
            <table className="balance-sheet-table">
              <thead>
                <tr>
                  <th style={{ width: "6%" }}>Sr.</th>
                  <th style={{ width: "34%" }}>Liabilities / Equity</th>
                  <th style={{ width: "15%" }}>Amount</th>

                  <th style={{ width: "6%" }}>Sr.</th>
                  <th style={{ width: "24%" }}>Assets</th>
                  <th style={{ width: "15%" }}>Amount</th>
                </tr>
              </thead>

              <tbody>
                {reportRows.map((row, index) => (
                  <tr key={index}>
                    <td align="center">{row.liability ? index + 1 : ""}</td>

                    <td>{row.liability?.accountName ?? ""}</td>

                    <td align="right">
                      {row.liability
                        ? row.liability.amount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })
                        : ""}
                    </td>

                    <td align="center">{row.asset ? index + 1 : ""}</td>

                    <td>{row.asset?.accountName ?? ""}</td>

                    <td align="right">
                      {row.asset
                        ? row.asset.amount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })
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
                      {totalLiabilitySide.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </b>
                  </td>

                  <td></td>

                  <td>
                    <b>Total</b>
                  </td>

                  <td align="right">
                    <b>
                      {totalAssetSide.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </b>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="signature-section">
              <div className="signature-box">
                ______________________
                <br />
                Auditor
              </div>

              <div className="signature-box">
                ______________________
                <br />
                Secretary
              </div>

              <div className="signature-box">
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

export default BalanceSheetSnapshotView;

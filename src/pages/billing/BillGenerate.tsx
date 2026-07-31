// src/pages/billing/BillingGenerate.tsx

import React, { useEffect, useState } from "react";
import {
  Button,
  Select,
  message,
  Card,
  Form,
  Row,
  Col,
  Layout,
  Modal,
} from "antd";
import axios from "axios";
import { apiPost } from "../../api/axios";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";

const BASE_URL = import.meta.env.VITE_API_URL;

const { Content } = Layout;
const role = sessionStorage.getItem("role");
const financialYear = sessionStorage.getItem("financialYear");
const financialYearId = Number(sessionStorage.getItem("financialYearId"));

const BillGenerate: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [maintenanceMappingExists, setMaintenanceMappingExists] =
    useState(false);
  const [glReceivable, setGlReceivable] = useState<number>(0);
  const [glCreditAccount, setGlCreditAccount] = useState<number>(0);
  const societyId = Number(sessionStorage.getItem("societyId"));

  useEffect(() => {
    loadGlMapping();
  }, []);

  const loadGlMapping = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/gl/master/mapping?societyId=${societyId}`,
      );
      const mapping = res.data.find(
        (item: any) =>
          item.description?.trim().toLowerCase() === "monthly maintenance",
      );

      if (!mapping) {
        setMaintenanceMappingExists(false);

        message.error("Monthly Maintenance GL Mapping not configured");
        return;
      }
      setMaintenanceMappingExists(true);
      setGlReceivable(mapping.gl_receivable);
      setGlCreditAccount(mapping.gl_credit_account);
    } catch (err) {
      console.error(err);

      setMaintenanceMappingExists(false);

      message.error("Unable to load GL Mapping");
    }
  };
  
  const generateFinancialYearBills = () => {
    Modal.confirm({
      title: "Generate Maintenance Bills",
      content:
        "Maintenance bills will be generated as per the configured Maintenance Policy. Continue?",
      okText: "Generate",
      cancelText: "Cancel",

      onOk: async () => {
        try {
          const response = await axios.get(
            `${BASE_URL}/accounting-year/${societyId}/year/${financialYearId}/status`,
          );

          const isClosed =
            response.data === "Closed" || response.data?.status === "Closed";

          if (isClosed) {
            message.error(
              "This financial year is closed. You cannot generate bills.",
            );
            return;
          }

          if (!glReceivable || !glCreditAccount) {
            message.error("Monthly Maintenance GL Mapping not configured");
            return;
          }

          setLoading(true);

          const financialYear = sessionStorage.getItem("financialYear");

          const year = financialYear
            ? Number(financialYear.substring(0, 4))
            : new Date().getFullYear();

          const payload = {
            year,
            societyId,
            createdBy: Number(sessionStorage.getItem("userId")),
            financialYearId,
            glReceivable,
            glCreditAccount,
          };

          const generationresponse = await apiPost("/billing/generate-financial-year-bills", payload);
          message.success(generationresponse);
        } catch (err) {
          console.error(err);
          message.error("Failed to generate maintenance bills.");
        } finally {
          setLoading(false);
        }
      },
    });
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
            title={`Generate Maintenance (FY: ${sessionStorage.getItem("financialYear") || "N/A"})`}
            style={{ marginBottom: 20 }}
          >
            <Row gutter={24}>
              <Col xs={24} md={4}>
                <Button
                  type="primary"
                  loading={loading}
                  disabled={!maintenanceMappingExists}
                  block
                  onClick={generateFinancialYearBills}
                  style={{
                    height: "auto",
                    whiteSpace: "normal",
                    lineHeight: "20px",
                    padding: "8px 16px",
                  }}
                >
                  Generate Maintenance Bills
                </Button>
              </Col>
            </Row>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BillGenerate;

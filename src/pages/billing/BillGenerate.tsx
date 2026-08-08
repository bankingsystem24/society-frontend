// src/pages/billing/BillingGenerate.tsx

import React, { useEffect, useState } from "react";
import {
  Button,
  Select,
  message,
  Card,
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
const financialYearId = Number(
  sessionStorage.getItem("financialYearId")
);

interface Flat {
  id: number;
  flatNumber?: string;
  flatNo?: string;
  number?: string;
  name?: string;
}

const BillGenerate: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // Existing GL mapping
  const [maintenanceMappingExists, setMaintenanceMappingExists] =
    useState(false);

  const [glReceivable, setGlReceivable] = useState<number>(0);
  const [glCreditAccount, setGlCreditAccount] = useState<number>(0);

  // Flats
  const [flats, setFlats] = useState<Flat[]>([]);
  const [selectedFlatId, setSelectedFlatId] = useState<number | null>(null);
  const [flatsLoading, setFlatsLoading] = useState(false);

  const societyId = Number(sessionStorage.getItem("societyId"));

  useEffect(() => {
    loadGlMapping();
    loadFlats();
  }, []);

  // ============================================================
  // LOAD GL MAPPING
  // ============================================================

  const loadGlMapping = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/gl/master/mapping?societyId=${societyId}`
      );

      const mapping = res.data.find(
        (item: any) =>
          item.description?.trim().toLowerCase() ===
          "monthly maintenance"
      );

      if (!mapping) {
        setMaintenanceMappingExists(false);

        message.error(
          "Monthly Maintenance GL Mapping not configured"
        );

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

  // ============================================================
  // LOAD FLATS
  // ============================================================

  const loadFlats = async () => {
    try {
      setFlatsLoading(true);

      const response = await axios.get(
        `${BASE_URL}/flats?societyId=${societyId}`
      );

      setFlats(response.data || []);
    } catch (err) {
      console.error(err);

      message.error("Unable to load flats");
    } finally {
      setFlatsLoading(false);
    }
  };

  // ============================================================
  // GENERATE ALL FINANCIAL YEAR BILLS
  // ============================================================

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
            `${BASE_URL}/accounting-year/${societyId}/year/${financialYearId}/status`
          );

          const isClosed =
            response.data === "Closed" ||
            response.data?.status === "Closed";

          if (isClosed) {
            message.error(
              "This financial year is closed. You cannot generate bills."
            );

            return;
          }

          if (!glReceivable || !glCreditAccount) {
            message.error(
              "Monthly Maintenance GL Mapping not configured"
            );

            return;
          }

          setLoading(true);

          const financialYear =
            sessionStorage.getItem("financialYear");

          const year = financialYear
            ? Number(financialYear.substring(0, 4))
            : new Date().getFullYear();

          const payload = {
            year,
            societyId,
            createdBy: Number(
              sessionStorage.getItem("userId")
            ),
            financialYearId,
            glReceivable,
            glCreditAccount,
          };

          const generationResponse = await apiPost(
            "/billing/generate-financial-year-bills",
            payload
          );

          message.success(generationResponse);
        } catch (err) {
          console.error(err);

          message.error(
            "Failed to generate maintenance bills."
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // ============================================================
  // GENERATE BILL FOR SELECTED FLAT
  // ============================================================

  const generateSelectedFlatBill = () => {
    if (!selectedFlatId) {
      message.warning("Please select a flat.");

      return;
    }

    if (!maintenanceMappingExists) {
      message.error(
        "Monthly Maintenance GL Mapping not configured"
      );

      return;
    }

    if (!glReceivable || !glCreditAccount) {
      message.error(
        "Monthly Maintenance GL Mapping not configured"
      );

      return;
    }

    Modal.confirm({
      title: "Generate Bill for Selected Flat",

      content:
        "A maintenance bill will be generated for the selected flat only. Continue?",

      okText: "Generate",

      cancelText: "Cancel",

      onOk: async () => {
        try {
          // Check financial year status first
          const response = await axios.get(
            `${BASE_URL}/accounting-year/${societyId}/year/${financialYearId}/status`
          );

          const isClosed =
            response.data === "Closed" ||
            response.data?.status === "Closed";

          if (isClosed) {
            message.error(
              "This financial year is closed. You cannot generate bills."
            );

            return;
          }

          setLoading(true);

          const financialYear =
            sessionStorage.getItem("financialYear");

          const year = financialYear
            ? Number(financialYear.substring(0, 4))
            : new Date().getFullYear();

          const payload = {
            year,
            societyId,
            flatId: selectedFlatId,
            createdBy: Number(
              sessionStorage.getItem("userId")
            ),
            financialYearId,
            glReceivable,
            glCreditAccount,
          };

          /*
           * NEW BACKEND API
           *
           * Change this URL if your backend uses
           * another endpoint.
           */
          const generationResponse = await apiPost(
            "/billing/generate-flat-bill",
            payload
          );

          message.success(
            generationResponse ||
              "Bill generated successfully for selected flat."
          );
        } catch (err: any) {
          console.error(err);

          /*
           * Show backend error if available
           */
          const errorMessage =
            err?.response?.data?.message ||
            err?.response?.data ||
            "Failed to generate bill for selected flat.";

          message.error(errorMessage);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // ============================================================
  // UI
  // ============================================================

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

      <Layout style={{ minWidth: 0 }}>
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
          {/* ================================================== */}
          {/* EXISTING FULL YEAR GENERATION */}
          {/* ================================================== */}

          <Card
            title={`Generate Maintenance (FY: ${
              sessionStorage.getItem("financialYear") || "N/A"
            })`}
            style={{ marginBottom: 20 }}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} md={6}>
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

          {/* ================================================== */}
          {/* ADDITIONAL SELECTED FLAT GENERATION */}
          {/* ================================================== */}

          <Card
            title="Additional Bill Generation"
            style={{ marginBottom: 20 }}
          >
            <Row gutter={[24, 16]} align="middle">
              {/* FLAT SELECT */}
              <Col xs={24} md={8}>
                <Select
                  showSearch
                  allowClear
                  placeholder="Select Flat"
                  loading={flatsLoading}
                  value={selectedFlatId}
                  onChange={(value) => {
                    setSelectedFlatId(
                      value ? Number(value) : null
                    );
                  }}
                  style={{ width: "100%" }}
                  optionFilterProp="label"
                  options={flats.map((flat) => ({
                    value: flat.id,

                    label:
                      flat.flatNumber ||
                      flat.flatNo ||
                      flat.number ||
                      flat.name ||
                      `Flat ${flat.id}`,
                  }))}
                />
              </Col>

              {/* GENERATE BUTTON */}
              <Col xs={24} md={6}>
                <Button
                  type="primary"
                  loading={loading}
                  disabled={
                    !maintenanceMappingExists ||
                    !selectedFlatId
                  }
                  block
                  onClick={generateSelectedFlatBill}
                  style={{
                    height: "auto",
                    whiteSpace: "normal",
                    lineHeight: "20px",
                    padding: "8px 16px",
                  }}
                >
                  Generate Bill for Selected Flat
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
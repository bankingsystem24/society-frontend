import { Button, Card, Col, Layout, Menu, Row, Typography } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/layout/Header";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";
import MemberHeader from "../../components/layout/MemberHeader";
import MemberSidebar from "../../components/layout/MemberSidebar";
import Sidebar from "../../components/layout/Sidebar";
import SuperAdminHeader from "../../components/layout/SuperAdminHeader";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";
import { Outlet } from "react-router-dom";

const { Content } = Layout;
const role = sessionStorage.getItem("role");

const ReportsMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
            styles ={{ body : { padding: 0} }}
            style={{
              margin: 15,
              borderRadius: 10,
              color: "#f01919",
            }}
          >

            <Row justify="start" align="middle" style={{ padding: "5px 10px" }}>
            <Typography.Title level={5} style={{ margin: "5px", fontSize:"20px", color: "#1677ff", }}>
              Reports
            </Typography.Title>
                <Col>
                    <Button danger style= {{ fontWeight: "bold", fontSize:"15px", marginLeft:"40px"}} onClick={() => navigate("/reports")}>
                    Clear
                    </Button>
                </Col>
                </Row>
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
            //   triggerSubMenuAction="click"
              onClick={({ key }) => navigate(key)}
              style={{
                marginTop: 10,
                borderRadius: 8,
                fontWeight: "bold",
                padding: "4px 10px",
                borderBottom: "2px solid #f01919",
                border: "2px solid #f01919",
              }}
              items={[
                {
                  key: "accounting",
                  label: "Accounting",
                  children: [
                    { key: "/reports/daybook", label: "Day Book" },
                    { key: "/reports/cashbook", label: "Cash/Bank Book" },
                    // { key: "/reports/general-ledger", label: "General Ledger" },
                    // { key: "/reports/member-ledger", label: "Member Ledger" },
                    { key: "/reports/trial-balance", label: "Trial Balance" },
                    // { key: "/reports/journal", label: "Journal Register" },
                    // {
                    //   key: "/reports/chart-of-accounts",
                    //   label: "Chart Of Accounts (GL Master)",
                    // },
                  ],
                },
                {
                  key: "billingreports",
                  label: "Billing",
                  children: [
                    // {
                    //   key: "/reports/maintenance-register",
                    //   label: "Maintenance Bill Register",
                    // },
                    // {
                    //   key: "/reports/sinking-register",
                    //   label: "Sinking Fund Register",
                    // },
                    // {
                    //   key: "/reports/contribution-register",
                    //   label: "Contribution Register",
                    // },
                    // {
                    //   key: "/reports/interest-report",
                    //   label: "Interest Calculation Report",
                    // },
                    // {
                    //   key: "/reports/discount-report",
                    //   label: "Discount Report",
                    // },
                    // {
                    //   key: "/reports/billing-summary",
                    //   label: "Billing Summary",
                    // },
                    // {
                    //   key: "/reports/due-bills-report",
                    //   label: "Due Bills Report",
                    // },
                  ],
                },
                {
                  key: "collectionreports",
                  label: "Collection",
                  children: [
                    // {
                    //   key: "/reports/receipt-report",
                    //   label: "Receipt Register",
                    // },
                    // {
                    //   key: "/reports/collection-summary",
                    //   label: "Collection Summary",
                    // },
                    // {
                    //   key: "/reports/payment-mode-report",
                    //   label: "Payment Mode Report (Cash/Bank)",
                    // },
                    // {
                    //   key: "/reports/daily-collection-report",
                    //   label: "Daily Collection Report",
                    // },
                    // {
                    //   key: "/reports/monthly-collection-report",
                    //   label: "Monthly Collection Report",
                    // },
                    // {
                    //   key: "/reports/collection-by-member",
                    //   label: "Collection By Member",
                    // },
                    // {
                    //   key: "/reports/outstanding-dues",
                    //   label: "Outstanding Dues",
                    // },
                    // {
                    //   key: "/reports/member-outstanding-ledger",
                    //   label: "Member Outstanding Ledger",
                    // },
                    // {
                    //   key: "/reports/aging-report",
                    //   label: "Aging Report (30/60/90) days",
                    // },
                    // {
                    //   key: "/reports/defaulters-list",
                    //   label: "Defaulters List",
                    // },
                    // {
                    //   key: "/reports/interest-due-report",
                    //   label: "Interest Due Report",
                    // },
                  ],
                },
                {
                  key: "financialreport",
                  label: "Financial",
                  children: [
                    {
                      key: "/reports/profit-and-loss",
                      label: "Income & Expenditure",
                    },
                    // {
                    //   key: "/reports/receipts-payments",
                    //   label: "Receipts & Payments",
                    // },
                    // { 
                    //     key: "/reports/balance-sheet", 
                    //     label: "Balance Sheet" 
                    // },
                    // { 
                    //     key: "/reports/profit-and-loss", 
                    //     label: "Profit & Loss" 
                    // },
                    // {
                    //   key: "/reports/budget-actual",
                    //   label: "Budget vs Actual",
                    // },
                    // { 
                    //     key: "/reports/fund-summary", 
                    //     label: "Fund Summary" },
                    // {
                    //   key: "/reports/bank-reconciliation-summary",
                    //   label: "Bank Reconciliation Summary (BRS)",
                    // },
                  ],
                },
                {
                  key: "memberreport",
                  label: "Members",
                  children: [
                    // {
                    //   key: "/reports/member-register",
                    //   label: "Member Register",
                    // },
                    // {
                    //   key: "/reports/flat-wise-members",
                    //   label: "Flat Wise Members",
                    // },
                    // {
                    //   key: "/reports/occupancy-report",
                    //   label: "Occupancy Report",
                    // },
                    // {
                    //   key: "/reports/parking-allocation-report",
                    //   label: "Parking Allocation Report",
                    // },
                    // {
                    //   key: "/reports/member-contact-list",
                    //   label: "Member Contact List",
                    // },
                    // {
                    //   key: "/reports/ownership-transfer-report",
                    //   label: "Ownership Transfer Report",
                    // },
                  ],
                },
                {
                  key: "maintenanceandassetsreports",
                  label: "Maintenance & Assets",
                  children: [
                    // {
                    //   key: "/reports/vendor-payment-report",
                    //   label: "Vendor Payment Report",
                    // },
                    // {
                    //   key: "/reports/expense-register",
                    //   label: "Expense Register",
                    // },
                    // {
                    //   key: "/reports/repair-fund-utilization",
                    //   label: "Repair Fund Utilization",
                    // },
                    // { key: "/reports/asset-register", label: "Asset Register" },
                    // {
                    //   key: "/reports/service-contract-report",
                    //   label: "Service Contract Report",
                    // },
                  ],
                },
                {
                  key: "administrationreports",
                  label: "Administration",
                  children: [
                    // { 
                    //     key: "/reports/flat-register", 
                    //     label: "Flat Register" },
                    // {
                    //   key: "/reports/wing-wise-flats",
                    //   label: "Wing Wise Flats",
                    // },
                    // {
                    //   key: "/reports/society-information",
                    //   label: "Society Information",
                    // },
                    // {
                    //   key: "/reports/user-and-role-report",
                    //   label: "User & Role Report",
                    // },
                    // {
                    //   key: "/reports/financial-year-list",
                    //   label: "Financial Year List",
                    // },
                    // {
                    //   key: "/reports/gl-mapping-report",
                    //   label: "GL Mapping Report",
                    // },
                    // { key: "/reports/audit-trail", label: "Audit Trail" },
                    // {
                    //   key: "/reports/journal-adjustment-report",
                    //   label: "Journal Adjustment Report",
                    // },
                    // {
                    //   key: "/reports/deleted-transactions-log",
                    //   label: "Deleted Transactions Log",
                    // },
                    // {
                    //   key: "/reports/user-activity-report",
                    //   label: "User Activity Report",
                    // },
                    // {
                    //   key: "/reports/financial-year-closing-report",
                    //   label: "Financial Year Closing Report",
                    // },
                  ],
                },
              ]}
            />
            <div style={{ padding: 20 }}>
                <Outlet />
            </div>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ReportsMenu;

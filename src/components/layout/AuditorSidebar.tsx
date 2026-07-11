import React from "react";
import { Menu } from "antd";
import {
  DashboardOutlined,
  BankOutlined,
  UserOutlined,
  FileTextOutlined,
  HomeOutlined,
  ApartmentOutlined,
  TeamOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "../../App.css";

const AuditorSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ height: "100vh" }}>
      <div style={{ color: "white", padding: 16, fontWeight: "bold" }}>
        Auditor Panel
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => { navigate(key)}}
        items={[
          {
            key: "/auditordashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
          {
            key: "/societies",
            label: "Society List",
          },
          {
            key: "/set-society",
            label: "Set Society",
          },
          {
            key: "/financial-year",
            label: "Set Financial Year",
          },
          {
            key: "/open-financial-year",
            label: "Open/Close Financial Year",
          },
          {
            key: "/members",
            icon: <TeamOutlined />,
            label: "Members",
          },
          {
            key: "/users",
            icon: <UserOutlined />,
            label: "Users",
          },
          {
            key: "/wings",
            icon: <ApartmentOutlined />,
            label: "Wings",
          },
          {
            key: "/flats",
            icon: <HomeOutlined />,
            label: "Flats",
          },
          {
            key: "general-ledger",
            icon: <DollarOutlined />,
            label: "General Ledger",
            children: [
              {
                key: "/gl-master",
                label: "Master",
              },
              {
                key: "/gl-balances",
                label: "Balances",
              },
              {
                key: "/gl-mapping",
                label: "GL Mapping",
              },
            ],
          },


          {
            key: "Policies",
            label: "Policies",
            children: [
              {
                key: "/billing-policy",
                label: "Billing Policy",
              },
              {
                key: "/discount-policy",
                label: "Discount Policy",
              },
              {
                key: "/penalty-policy",
                label: "Penalty Policy",
              }
            ],
          },
          {
            key: "Entries",
            label: "Entries",
            children: [
              {
                key: "/add-expenses",
                label: "Expenses",
              },
              {
                key: "/income",
                label: "Income",
              },
              { 
                key: "/transfer",

                label: "Transfer",
              },
            ],
          },
        
          {
            key: "/vendors",
            label: "Vendors",
          },
          {
            key: "Mainteannce",
            label: "Maintenance",
            children: [
              {
                key: "/bill-generate",
                label: "Generate",
              },
              {
                key: "/view-bills",
                label: "View",
              },
              {
                key: "/member-paying-maintenance",
                label: "Pay Online",
              },
            ],
          },
          {
            key: "Sinking Fund",
            label: "Sinking Fund",
            children: [
              {
                key: "/generate-sinking-fund",
                label: "Generate",
              },
              {
                key: "/view-sinking-fund",
                label: "View",
              },
              {
                key: "/sinking-funds",
                label: "Pay Online",
              },
            ],
          },
          {
            key: "Contributions",
            label: "Contributions",
            children: [
              {
                key: "/generate-contribution",
                label: "Add",
              },
              {
                key: "/view-contribution",
                label: "View",
              },
              {
                key: "/contributions",
                label: "Pay Online",
              },
            ],
          },
          {
            key: "/verify-payment",
            label: "Verify Payment",
            icon: <HomeOutlined />,
          },

          {
            key: "/view-receipts",
            label: "Receipts",
          },
          {
            key: "Reports",
            icon: <UserOutlined />,
            label: "Reports",
            children: [
              {
                key: "/view-journal",
                label: "View Journal",
                icon: <HomeOutlined />,
              },
              {
                key: "/view-ledger",
                label: "View Ledger",
                icon: <HomeOutlined />,
              },
              {
                key: "/trial-balance",
                label: "Trial Balance",
                icon: <HomeOutlined />,
              },
              {
                key: "/profit-and-loss",
                label: "Profit & Loss",
                icon: <HomeOutlined />,
              },
              {
                key: "/payments",
                label: "Payments",
                icon: <HomeOutlined />,
              },
            ],
          },

          {
            key: "Snapshot",
            icon: <UserOutlined />,
            label: "Snapshots",
            children: [
              // {
              //   key: "/trial-balance-snapshot",
              //   label: "TrialBalance Entry",
              //   icon: <HomeOutlined />,
              // },
              {
                key: "/trial-balance-snapshot-view",
                label: "View TrialBalance",
                icon: <HomeOutlined />,
              },
              // {
              //   key: "/profit-loss-snapshot-entry",
              //   label: "Profit & Loss Entry",
              //   icon: <HomeOutlined />,
              // },
              {
                key: "/profit-loss-snapshot-view",
                label: "View P&L",
                icon: <HomeOutlined />,
              },
            ]
          },

        ]}
      />
    </div>
  );
};

export default AuditorSidebar;
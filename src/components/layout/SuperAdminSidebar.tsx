import React from "react";
import { Menu } from "antd";
import {
  DashboardOutlined,
  BankOutlined,
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const SuperAdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <div
        style={{
          height: 64,
          color: "#fff",
          textAlign: "center",
          lineHeight: "64px",
          fontSize: 16,
          fontWeight: "bold",
        }}
      >
        Super Admin Panel
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={[
          {
            key: "/superadmindashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },

          {
            key: "/superadmin-view-societies",
            icon: <BankOutlined />,
            label: "Society List",
          },
          {
            key: "/set-society",
            icon: <BankOutlined />,
            label: "Set Society",
          },
          {
            key: "/members",
            icon: <TeamOutlined />,
            label: "Members",
          },
          {
            key: "/superadminusers",
            icon: <TeamOutlined />,
            label: "Users",
          },
          {
            key: "/view-receipts",
            label: "Receipts",
          },
          {
            key:"/reports-menu",
            label:"Reports Menu"
          },
          {
            key: "Reports",
            icon: <UserOutlined />,
            label: "Reports",
            children: [
              // {
              //   key: "/daybook",
              //   icon:<BookOutlined />,
              //   label: "View Daybook",
              // },
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
              // {
              //   key: "/trial-balance",
              //   label: "Trial Balance",
              //   icon: <HomeOutlined />,
              // },
              // {
              //   key: "/profit-and-loss",
              //   label: "Profit & Loss",
              //   icon: <HomeOutlined />,
              // }, 
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
              // {
              //   key: "/balance-sheet-snapsnot",
              //   label: "BalanceSheet Snapshot Entry",
              //   icon: <HomeOutlined />,
              // },
              {
                key: "/balance-sheet-snapshot-view",
                label: "View BalanceSheet",
                icon: <HomeOutlined />,
              },              
            ]
          },
      
        ]}
      />
    </>
  );
};

export default SuperAdminSidebar;
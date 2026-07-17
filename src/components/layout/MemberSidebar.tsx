import React from "react";
import { Menu } from "antd";
import {
  BookOutlined,
  DashboardOutlined,
  DollarOutlined,
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import Sider from "antd/es/layout/Sider";
import "../../App.css";

const MemberSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = ({ key }: any) => {
    if (key === "/member-login") {
      sessionStorage.clear();
      navigate("/member-login");
      return;
    }
    navigate(key);
  };

  return (
    <Sider
      width={200}
      breakpoint="lg"
      collapsedWidth={0}
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          color: "white",
          padding: 16,
          fontWeight: "bold",
        }}
      >
        Member Panel
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={handleClick}
        items={[
          {
            key: "/member-dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
          {
            key: "/member-paying-maintenance",
            icon: <DollarOutlined />,
            label: "Pending Maint.",
          },
          {
            key: "/sinking-funds",
            icon: <DollarOutlined />,
            label: "Pending Funds",
          },
          {
            key: "/contributions",
            icon: <DollarOutlined />,
            label: "Pending Contri.",
          },
          {
            key: "/view-receipts",
            icon: <DollarOutlined />,
            label: "Receipts",
          },
          {
            key: "Reports",
            icon: <UserOutlined />,
            label: "Reports",
            children: [
              {
                key: "/daybook",
                icon:<BookOutlined />,
                label: "View Daybook",
              },

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
    </Sider>
  );
};

export default MemberSidebar;

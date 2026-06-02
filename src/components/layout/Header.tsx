import React, { useEffect, useState } from "react";
import { Layout, Dropdown, Avatar, Space, Typography } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;
const { Text } = Typography;

const HeaderBar: React.FC = () => {
  const navigate = useNavigate();

  const userName = sessionStorage.getItem("userName");
  const role = sessionStorage.getItem("role");
  const societyName = sessionStorage.getItem("societyName");
  const [financialYear, setFinancialYear] = useState(
    sessionStorage.getItem("financialYear") || "",
  );

  useEffect(() => {
    const updateFinancialYear = () => {
      setFinancialYear(sessionStorage.getItem("financialYear") || "");
    };

    window.addEventListener("financialYearChanged", updateFinancialYear);

    return () => {
      window.removeEventListener("financialYearChanged", updateFinancialYear);
    };
  }, []);
  const items = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => {
        sessionStorage.clear();
        navigate("/");
      },
    },
  ];

  return (
    <Header
      style={{
        height: 64,
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(90deg, #1677ff, #4096ff)",
        boxShadow: "0 4px 12px rgba(22, 119, 255, 0.25)",
      }}
    >
      {/* LEFT SIDE */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          {societyName || "Society Management System"}
        </Text>

        <Text
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 16,
          }}
        >
          Dashboard {financialYear && `| FY: ${financialYear}`}
        </Text>
      </div>

      {/* RIGHT SIDE */}
      <Dropdown menu={{ items }} placement="bottomRight">
        <Space
          style={{
            cursor: "pointer",
            padding: "6px 10px",
            borderRadius: 10,
            transition: "0.3s",
          }}
        >
          <Avatar
            size={38}
            style={{
              backgroundColor: "#ffffff20",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
            icon={<UserOutlined />}
          />

          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text style={{ color: "#fff", fontWeight: 500 }}>
              {userName} ({role})
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>
              Online 
            </Text>
          </div>
        </Space>
      </Dropdown>
    </Header>
  );
};

export default HeaderBar;

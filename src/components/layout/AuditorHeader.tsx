import React, { useEffect, useState } from "react";
import { Layout, Dropdown, Avatar, Space, Typography } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;
const { Text } = Typography;

const AuditorHeaderBar: React.FC = () => {
  const navigate = useNavigate();

  const userName = sessionStorage.getItem("userName");
  const role = sessionStorage.getItem("role");

  const [financialYear, setFinancialYear] = useState(
    sessionStorage.getItem("financialYear") || ""
  );

  const [societyName, setSocietyName] = useState(
    sessionStorage.getItem("societyName") || ""
  );

  useEffect(() => {
    const updateHeaderData = () => {
      setFinancialYear(sessionStorage.getItem("financialYear") || "");
      setSocietyName(sessionStorage.getItem("societyName") || "");
    };

    window.addEventListener(
      "financialYearChanged",
      updateHeaderData as EventListener
    );

    window.addEventListener(
      "societyChanged",
      updateHeaderData as EventListener
    );

    return () => {
      window.removeEventListener(
        "financialYearChanged",
        updateHeaderData as EventListener
      );

      window.removeEventListener(
        "societyChanged",
        updateHeaderData as EventListener
      );
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
          Group of Societies
        </Text>

        <Text
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 16,
          }}
        >
          Society : {societyName || "-"} | FY : {financialYear || "-"}
        </Text>
      </div>

      {/* RIGHT SIDE */}
      <Dropdown menu={{ items }} placement="bottomRight">
        <Space
          style={{
            cursor: "pointer",
            padding: "6px 10px",
            borderRadius: 10,
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
            <Text
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 11,
              }}
            >
              Online
            </Text>
          </div>
        </Space>
      </Dropdown>
    </Header>
  );
};

export default AuditorHeaderBar;
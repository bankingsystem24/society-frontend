import React from "react";

import {
  Layout,
  Dropdown,
  Avatar,
  Space,
  Typography,
} from "antd";

import {
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

const { Header } = Layout;

const { Text } = Typography;

const MemberHeader: React.FC = () => {

  const navigate = useNavigate();

  const memberName = sessionStorage.getItem("userName");
  const societyName = sessionStorage.getItem("societyName");
  const role = sessionStorage.getItem("role");
  const financialYear = sessionStorage.getItem("financialYear");

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

        background:
          "linear-gradient(90deg, #1677ff, #4096ff)",

        boxShadow:
          "0 4px 12px rgba(22, 119, 255, 0.25)",
      }}
    >

      {/* LEFT */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          {societyName ||
            "Society Management System"}
        </Text>

        <Text
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 16,
          }}
        >
          Member Portal {financialYear && `| FY: ${financialYear}`}
        </Text>
      </div>

      {/* RIGHT */}

      <Dropdown
        menu={{ items }}
        placement="bottomRight"
      >
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

              border:
                "1px solid rgba(255,255,255,0.3)",
            }}

            icon={<UserOutlined />}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: 500,
              }}
            >
              {memberName || "Member"}
            </Text>

            <Text
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 11,
              }}
            >
              Role : {role || "-"}
            </Text>
          </div>
        </Space>
      </Dropdown>
    </Header>
  );
};

export default MemberHeader;
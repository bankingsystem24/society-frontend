import React, { useState } from "react";
import { Card, Form, Input, Button, message } from "antd";
import axios from "axios";
import buildingImage from "../../assets/building.jpg";
import { Link, useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL;
 
  const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);

    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/auth/login",
        values,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      message.success("Login successful");
      sessionStorage.setItem("userName", res.data.name);
      console.log("Login Response:", res.data);
      console.log("Token:", res.data.token);
//Store JWT token in sessionStorage so it can be used for authenticated API calls
sessionStorage.setItem("token", res.data.token);

console.log("Stored Token:", sessionStorage.getItem("token"));
// Save logged-in user's details for use throughout the application
      sessionStorage.setItem("role", res.data.role);
      sessionStorage.setItem("memberId", String(res.data.memberId));

      if (res.data.societyId !== null) {
        const fyRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/accounting-year/${res.data.societyId}/active`,
          {
            headers: {
              Authorization: `Bearer ${res.data.token}`,
            },
          },
        );
        sessionStorage.setItem("financialYear", fyRes.data.fyCode);
        sessionStorage.setItem("financialYearId", fyRes.data.id);
      }

      sessionStorage.setItem("token", res.data.token);

      if (res.data.societyId !== null && res.data.societyId !== undefined) {
        sessionStorage.setItem("societyId", String(res.data.societyId));
      } else {
        sessionStorage.removeItem("societyId");
      }

      sessionStorage.setItem("societyName", res.data.societyName);
      sessionStorage.setItem("memberToken", res.data.token);
      sessionStorage.setItem("memberName", res.data.memberName);
      sessionStorage.setItem("societyName", res.data.societyName);
      sessionStorage.setItem("role", res.data.role);
      sessionStorage.setItem("userId", String(res.data.auditorId));
      sessionStorage.setItem("upi", res.data.upi);

      fetchGlMapping();
 
      if (res.data.role === "SUPER_ADMIN") {
        navigate("/superadmindashboard");
      } else if (res.data.role === "ADMIN") {
        navigate("/admindashboard");
      } else if (res.data.role === "MEMBER") {
        navigate("/member-dashboard");
      } else if (res.data.role === "AUDITOR") {
        sessionStorage.setItem("auditorId", res.data.auditorId);
        navigate("/auditordashboard");
      }
    } catch (error: any) {
      message.error("Login failed");
    } finally {
      setLoading(false);
    }
  };
 
  const fetchGlMapping = async () => {
    const societyId = Number(sessionStorage.getItem("societyId"));
    if (societyId) {

      try {
        const res = await axios.get(`${BASE_URL}/gl/master/mapping?societyId=${societyId}`,);
        const mapping = res.data.find((item: any) =>item.description?.trim().toLowerCase() === "cash in hand",);

        if (!mapping) {
          message.error("Cash in Hand Mapping not configured");
          return;
        }
        sessionStorage.setItem("GlCashInHand", mapping.gl_receivable);
        const mapping1 = res.data.find((item: any) =>item.description?.trim().toLowerCase() === "bank account",);
        if (!mapping1) {
          message.error("Bank Account not configured");
          return;
        }
        sessionStorage.setItem("GlBankAccount", mapping1.gl_receivable);

      } catch (err) {
        console.error(err);
        message.error("Unable to load GL Mapping");
      }
    }
    };
  

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
      }}
    >
      {/* Blue Border Container */}
     <div
  style={{
    display: "flex",
    border: "2px solid #1677ff",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    background: "#fff",
  }}
>
        {/* Left Image */}
        <Card
          style={{
            width: 380,
            height: 430,
            padding: 0,
            border: "none",
            borderRadius: 0,
            boxShadow: "none",
          }}
          bodyStyle={{
            padding: 0,
            height: "100%",
          }}
        >
          <img
            src={buildingImage}
            alt="Society Building"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Card>

       {/* Login Card */}
<Card
  title={
    <div
      style={{
        textAlign: "center",
        color: "#1677ff",
        fontSize: "24px",
        fontWeight: 700,
      }}
    >
      Society Management
    </div>
  }
  style={{
    width: 380,
    height: 430,
    border: "none",
    borderRadius: 0,
    boxShadow: "none",
  }}
>
  <Form layout="vertical" onFinish={onFinish}>
    <Form.Item
      label="Username"
      name="username"
      rules={[
        {
          required: true,
          message: "Please enter username",
        },
      ]}
    >
      <Input placeholder="Enter username" />
    </Form.Item>

    <Form.Item
      label="Password"
      name="password"
      rules={[
        {
          required: true,
          message: "Please enter password",
        },
      ]}
    >
      <Input.Password placeholder="Enter password" />
    </Form.Item>

    <Form.Item style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Link to="/change-password">Change Password</Link>
      </div>
    </Form.Item>

    <Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        block
      >
        Login
      </Button>
    </Form.Item>
  </Form>
</Card>
      </div>
    </div>
  );
};

export default Login;
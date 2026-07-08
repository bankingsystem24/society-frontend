import React, { useState } from "react";
import { Card, Form, Input, Button, message } from "antd";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import buildingImage from "../../assets/building.jpg";

const BASE_URL = import.meta.env.VITE_API_URL;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${BASE_URL}/auth/login`,
        values,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Login Response:", res.data);
      console.log("Token:", res.data.token);

      sessionStorage.setItem("token", res.data.token);

      console.log("Stored Token:", sessionStorage.getItem("token"));

      message.success("Login successful");

      sessionStorage.setItem("userName", res.data.name);
      sessionStorage.setItem("role", res.data.role);
      sessionStorage.setItem("memberId", String(res.data.memberId ?? ""));
      sessionStorage.setItem("societyId", String(res.data.societyId ?? ""));
      sessionStorage.setItem("societyName", res.data.societyName ?? "");
      sessionStorage.setItem("memberToken", res.data.token);
      sessionStorage.setItem("memberName", res.data.memberName ?? "");
      sessionStorage.setItem("userId", String(res.data.userId ?? ""));
      sessionStorage.setItem("upi", res.data.upi ?? "");

      if (res.data.societyId) {
        try {
          const fyRes = await axios.get(
            `${BASE_URL}/accounting-year/${res.data.societyId}/active`,
            {
              headers: {
                Authorization: `Bearer ${res.data.token}`,
              },
            }
          );

          sessionStorage.setItem("financialYear", fyRes.data.fyCode);
          sessionStorage.setItem("financialYearId", fyRes.data.id);
        } catch (err) {
          console.log("Financial Year not found");
        }
      }

      await fetchGlMapping();

      if (res.data.role === "SUPER_ADMIN") {
        navigate("/superadmindashboard");
      } else if (res.data.role === "ADMIN") {
        navigate("/admindashboard");
      } else if (res.data.role === "MEMBER") {
        navigate("/member-dashboard");
      } else if (res.data.role === "AUDITOR") {
        sessionStorage.setItem("auditorId", String(res.data.auditorId));
        navigate("/auditordashboard");
      }
    } catch (error) {
      console.error(error);
      message.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchGlMapping = async () => {
    const societyId = Number(sessionStorage.getItem("societyId"));

    if (!societyId) return;

    try {
      const res = await axios.get(
        `${BASE_URL}/gl/master/mapping?societyId=${societyId}`
      );

      const cash = res.data.find(
        (item: any) =>
          item.description?.trim().toLowerCase() === "cash in hand"
      );

      if (cash) {
        sessionStorage.setItem("GlCashInHand", cash.gl_receivable);
      }

      const bank = res.data.find(
        (item: any) =>
          item.description?.trim().toLowerCase() === "bank account"
      );

      if (bank) {
        sessionStorage.setItem("GlBankAccount", bank.gl_receivable);
      }
    } catch (err) {
      console.error(err);
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
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: 350,
          height: 400,
          padding: 0,
          overflow: "hidden",
          borderRadius: "12px 0 0 12px",
        }}
        bodyStyle={{ padding: 0, height: "100%" }}
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

      <Card
        title="Society Management Login"
        style={{
          width: 350,
          height: 400,
          borderRadius: "0 12px 12px 0",
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
                justifyContent: "space-between",
              }}
            >
              <Link to="/change-password">Change Password</Link>

              <Link to="/forgot-password">Forgot Password?</Link>
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
  );
};

export default Login;
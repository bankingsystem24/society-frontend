import React, { useState } from "react";
import { Card, Form, Input, Button, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
      sessionStorage.setItem("role", res.data.role);

      if (res.data.societyId !== null){
        const fyRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/accounting-year/${res.data.societyId}/active`,
          {
            headers: {
              Authorization: `Bearer ${res.data.token}`,
            },
          },
        );
        sessionStorage.setItem("financialYear", fyRes.data.fyCode);
        sessionStorage.setItem("financialYearId",fyRes.data.id);
        }

      sessionStorage.setItem("token", res.data.token);
      if (res.data.societyId !== null && res.data.societyId !== undefined) {
        sessionStorage.setItem("societyId", String(res.data.societyId));
      } else {
        sessionStorage.removeItem("societyId");
      }
      console.log(res.data);

      sessionStorage.setItem("societyName", res.data.societyName);
      sessionStorage.setItem("memberToken", res.data.token);
      sessionStorage.setItem("memberId", String(res.data.memberId));
      sessionStorage.setItem("memberName", res.data.memberName);
      sessionStorage.setItem("societyId", String(res.data.societyId));
      sessionStorage.setItem("societyName", res.data.societyName);
      sessionStorage.setItem("role", res.data.role);
      sessionStorage.setItem("userName", res.data.name);
      sessionStorage.setItem("userId", String(res.data.auditorId));
      if(res.data.role === "SUPER_ADMIN"){
          navigate("/superadmindashboard");
      } else if(res.data.role === "ADMIN"){
          navigate("/clientdashboard");
      } else if(res.data.role === "MEMBER"){
          navigate("/member-dashboard");
      } else if(res.data.role === "AUDITOR"){
          sessionStorage.setItem("auditorId", res.data.auditorId);
          navigate("/auditordashboard");
      }
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Invalid username or password",
      );
    } finally {
      setLoading(false);
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
      <Card title="Society Management Login" style={{ width: 350 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter username" }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter password" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

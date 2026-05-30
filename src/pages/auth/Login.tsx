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
      console.log("Response",res);
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
        }
      
      sessionStorage.setItem("token", res.data.token);
      if (res.data.societyId !== null && res.data.societyId !== undefined) {
        sessionStorage.setItem("societyId", String(res.data.societyId));
      } else {
        sessionStorage.removeItem("societyId");
      }
      sessionStorage.setItem("societyName", res.data.societyName);
      if(res.data.role === "SUPER_ADMIN"){
          navigate("/superadmindashboard");
      }
      if(res.data.role === "ADMIN"){
          navigate("/clientdashboard");
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

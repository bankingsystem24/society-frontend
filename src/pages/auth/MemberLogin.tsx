import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";

import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const MemberLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);

    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/auth/memberlogin",
        values,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      message.success("Login successful");

      // ================= SESSION =================
      console.log("res", res.data);

      sessionStorage.setItem("memberToken", res.data.token);
      sessionStorage.setItem("memberId", String(res.data.memberId));
      sessionStorage.setItem("memberName", res.data.memberName);
      sessionStorage.setItem("societyId", String(res.data.societyId));
      sessionStorage.setItem("societyName", res.data.societyName);
      sessionStorage.setItem("role", res.data.role);
      navigate("/member-dashboard");
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ?? "Invalid username or password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
        padding: 16,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 350,
          borderRadius: 12,
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          <Title level={3}>Member Login</Title>
        </div>

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

export default MemberLogin;

import React, { useState } from "react";
import { Card, Form, Input, Button, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
    console.log(import.meta.env.VITE_API_URL);

  const onFinish = async (values: any) => {
    setLoading(true);

    console.log("Login values:", values);

    try {
        const res = await axios.post(
        import.meta.env.VITE_API_URL + "/auth/login",
        values,
        {
            headers: {
            "Content-Type": "application/json",
            },
        }
        );
      // Example: store token (if you use JWT later)
      // localStorage.setItem("token", res.data.token);

      message.success("Login successful");
      navigate("/dashboard"); // redirect to dashboard
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Invalid username or password"
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
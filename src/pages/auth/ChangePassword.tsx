import React, { useState } from "react";
import { Card, Form, Input, Button, message } from "antd";
import axios from "axios";
import buildingImage from "../../assets/building.jpg";

const BASE_URL = import.meta.env.VITE_API_URL;

const ChangePassword: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("New Password and Confirm Password do not match");
      return;
    }

    try {
      setLoading(true);

      const token = sessionStorage.getItem("token");

      console.log("Token from Change Password:", token);

      const response = await axios.post(
        `${BASE_URL}/auth/changePassword`,
        {
          userName: values.username,
          oldPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response:", response.data);
      message.success("Password changed successfully");
    } catch (error: any) {
      console.log("Error:", error);
      console.log("Response:", error.response);

      message.error(
        error.response?.data || "Unable to change password"
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
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: 350,
          height: 500,
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
        title="Change Password"
        style={{
          width: 350,
          height: 500,
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
            label="Current Password"
            name="currentPassword"
            rules={[
              {
                required: true,
                message: "Please enter current password",
              },
            ]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              {
                required: true,
                message: "Please enter new password",
              },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              {
                required: true,
                message: "Please confirm password",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Passwords do not match")
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword;
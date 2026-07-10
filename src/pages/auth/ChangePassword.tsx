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


 

  // Retrieve JWT token stored after successful login
  const token = sessionStorage.getItem("token");


     const response = await axios.post(
  `${BASE_URL}/auth/changePassword`,
  {
    userName: values.username,
    oldPassword: values.currentPassword,
    newPassword: values.newPassword,
  },
  {
    headers: {
      "Content-Type": "application/json",
    },
  }
);

      
      message.success("Password changed successfully");
    } catch (error: any) {
     
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

      {/* Change Password Card */}
      <Card
        title={
          <div
            style={{
              textAlign: "center",
              color: "#1677ff",
              fontSize: "24px",
              fontWeight: 700,
              marginBottom:5,
            }}
          >
            Change Password
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
        <Form
          layout="vertical"
          onFinish={onFinish}
          
        >
          <Form.Item
            label="Username"
            name="username"
            style={{ marginBottom: 5 }}
            rules={[
              {
                required: true,
                message: "Please enter username",
              },
            ]}
          >
            <Input
              placeholder="Enter username"
              size="large"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item
            label="Current Password"
            name="currentPassword"
            style={{ marginBottom: 5 }}
            rules={[
              {
                required: true,
                message: "Please enter current password",
              },
            ]}
          >
            <Input.Password
              placeholder="Enter current password"
              size="large"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            style={{ marginBottom: 5}}
            rules={[
              {
                required: true,
                message: "Please enter new password",
              },
            ]}
          >
            <Input.Password
              placeholder="Enter new password"
              size="large"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            style={{ marginBottom: 5 }}
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
            <Input.Password
              placeholder="Confirm new password"
              size="large"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                height: "45px",
                borderRadius: "8px",
                fontWeight: 600,
              }}
            >
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  </div>
);
};

export default ChangePassword;
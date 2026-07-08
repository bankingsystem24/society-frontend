import React, { useState } from "react";
import { Card, Form, Input, Button, message } from "antd";
import emailjs from "@emailjs/browser";

import buildingImage from "../../assets/building.jpg";

const ForgotPassword: React.FC = () => {
  const [form] = Form.useForm();
  const [generatedOtp, setGeneratedOtp] = useState("");

  const onFinish = async (values: any) => {
    if (
      values.username === "admin" &&
      values.phoneNumber === "7276200676"
    ) {
      // Generate 6-digit OTP
      const otp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      try {
        const response = await emailjs.send(
          "service_dnwze3t", // Service ID
          "template_8j3c0gc", // Template ID
          {
            to_email: "simran.gaykar1@gmail.com",
            otp: otp,
          },
          "t6tGNAYqNbepzagXH" // Public Key
        );

        console.log("EmailJS Response:", response);

        setGeneratedOtp(otp);
        sessionStorage.setItem("otp", otp);

        message.success("OTP sent successfully to your email.");
      } catch (error: any) {
        console.error("EmailJS Error:", error);

        if (error.text) {
          console.log("Error Text:", error.text);
        }

        message.error("Failed to send OTP.");
      }
    } else {
      message.error("Username or Phone Number is incorrect");
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
      {/* Left Image */}
      <Card
        style={{
          width: 350,
          height: 450,
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

      {/* Right Card */}
      <Card
        title="Forgot Password"
        style={{
          width: 350,
          height: 450,
          borderRadius: "0 12px 12px 0",
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: "Please enter your username",
              },
            ]}
          >
            <Input placeholder="Enter Username" />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            rules={[
              {
                required: true,
                message: "Please enter your registered phone number",
              },
              {
                pattern: /^[0-9]{10}$/,
                message: "Phone number must be 10 digits",
              },
            ]}
          >
            <Input placeholder="Enter Registered Phone Number" />
          </Form.Item>

          <Form.Item style={{ marginTop: 20 }}>
            <Button type="primary" htmlType="submit" block>
              Send OTP
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
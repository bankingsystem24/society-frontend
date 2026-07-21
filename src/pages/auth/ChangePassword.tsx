import React, { useState } from "react";
import {Form, Input, Button, message } from "antd";
import axios from "axios";
import buildingImage from "../../assets/SocietyLogo1.png";
import buildingImage1 from "../../assets/SocietyLogo2.png";
import {
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";


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
    minHeight: "100vh",
    background: "#f3f5f9",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  }}
>
    {/* Blue Border Container */}
    <div
      style={{
          display: "flex",
    width: 540,
    minHeight: 530,
    background: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      }}
    >
      {/* Left Image */}
<div
        style={{
           width: 230,
    background: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
        }}
      >
        <img
           src={buildingImage}
         alt="Society"   
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
          }}
        />
        </div>

      {/* Change Password Card */}
       <div
  style={{
  flex: 1,
            padding: "15px 20px",
            display: "flex",
            flexDirection: "column",
  }}
>
          <div
  style={{
    textAlign: "center",
    marginBottom: 15,
  }}
>
  <img
    src={buildingImage1}
    alt="Logo"
    style={{
      width: 180,
      maxWidth: "100%",
    }}
  />
</div>

<div
  style={{
    textAlign: "center",
    marginBottom: 15,
  }}
>

<h2 style={{ margin: 0,
      fontWeight: 700, }}>
      Change Password
    </h2>

    <div
      style={{
        color: "#666",
        fontSize: 13,
         marginTop: 5,
      }}
    >
      Please update your account password
    </div>
  </div>

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
  prefix={<UserOutlined style={{ color: "#d6005f" }} />}
  placeholder="Enter username"
  size="middle"
  style={{ borderRadius: 8 }}
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
  prefix={<LockOutlined style={{ color: "#d6005f" }} />}
  placeholder="Enter current password"
  size="middle"
  style={{ borderRadius: 8 }}
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
  prefix={<LockOutlined style={{ color: "#d6005f" }} />}
  placeholder="Enter new password"
  size="middle"
  style={{ borderRadius: 8 }}
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
  prefix={<LockOutlined style={{ color: "#d6005f" }} />}
  placeholder="Confirm new password"
  size="middle"
  style={{ borderRadius: 8 }}
/>
          </Form.Item>

          <Form.Item>
           <Button
    block
    type="primary"
    htmlType="submit"
    size="large"
    style={{
        background: "#d6005f",
        borderColor: "#d6005f",
        height: 42,
        fontWeight: 600,
        
    }}
>
    Change Password
</Button>
          </Form.Item>
        </Form>
        <div
  style={{
       marginTop: 20,
    textAlign: "center",
    fontSize: 12,
    color: "#181818",
    background: "#f6f3f3",
    borderTop: "1px solid #e8e8e8",
    paddingTop: 10,
  }}
>
  <div>© 2026 VBank Society | VIJAISWAPN INFOTECH</div>
  <div>All Rights Reserved.</div>
  </div>
      

    </div>
    </div>
  </div>
);
};

export default ChangePassword;
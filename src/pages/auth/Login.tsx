import React, { useState } from "react";
import { Card, Form, Input, Button, message, Col, Row } from "antd";
import axios from "axios";
import buildingImage from "../../assets/SocietyLogo1.png";
import buildingImage1 from "../../assets/SocietyLogo2.png";
import { Link, useNavigate } from "react-router-dom";
import {
  UserOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

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

      //Store JWT token in sessionStorage so it can be used for authenticated API calls
      sessionStorage.setItem("token", res.data.token);

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
        const res = await axios.get(
          `${BASE_URL}/gl/master/mapping?societyId=${societyId}`,
        );
        const mapping = res.data.find(
          (item: any) =>
            item.description?.trim().toLowerCase() === "cash in hand",
        );

        if (!mapping) {
          message.error("Cash in Hand Mapping not configured");
          return;
        }
        sessionStorage.setItem("GlCashInHand", mapping.gl_receivable);
        const mapping1 = res.data.find(
          (item: any) =>
            item.description?.trim().toLowerCase() === "bank account",
        );
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
        minHeight: "100vh",
        background: "#f3f5f9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 5,
      }}
    >
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
        {/* LEFT PANEL */}

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

        {/* RIGHT PANEL */}

        <div
          style={{
            flex: 1,
            padding: "15px 20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* LOGO */}

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

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label={
                <span>
                  <UserOutlined
                    style={{
                      color: "#D8075E",
                      marginRight: 8,
                    }}
                  />
                  Username
                </span>
              }
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please enter username",
                },
              ]}
            >
              <Input size="medium" placeholder="Enter username" />
            </Form.Item>

            <Form.Item
              label={
                <span>
                  <LockOutlined
                    style={{
                      color: "#D8075E",
                      marginRight: 8,
                    }}
                  />
                  Password
                </span>
              }
              name="password"
              style={{ marginTop: 0, marginBottom: 10 }}
              rules={[
                {
                  required: true,
                  message: "Please enter password",
                },
              ]}
            >
              <Input.Password size="medium" placeholder="Enter password" />
            </Form.Item>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 10,
                marginTop: 5,
              }}
            >
              <Link
                to="/change-password"
                style={{
                  color: "#D8075E",
                  textDecoration: "none",
                  fontWeight: 450,
                }}
              >
                Change Password
              </Link>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                background: "#D8075E",
                borderColor: "#D8075E",
                height: 42,
                fontWeight: 600,
              }}
            >
              Login
            </Button>

            <div
              style={{
                alignItems: "center",
                textAlign: "center",
                marginTop: 5,
              }}
            >
              or
            </div>
            <div style={{ alignItems: "center" }}>
              <Button
                block
                style={{
                  marginTop: 10,
                  textAlign: "center",
                  color: "#f63030",
                  borderColor: "#f63030",
                  fontWeight: "bold",
                }}
              >
                <SafetyCertificateOutlined
                  style={{
                    fontSize: 20,
                    color: "#D8075E",
                  }}
                />
                Login with OTP
              </Button>
            </div>
          </Form>

          <div
            style={{
              marginTop: 15,
              paddingTop: 5,
            }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <SafetyCertificateOutlined
                    style={{
                      fontSize: 20,
                      color: "#D8075E",
                    }}
                  />

                  <div
                    style={{
                      fontWeight: "bold",
                      marginTop: 8,
                      fontSize: 14,
                    }}
                  >
                    Secure
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#666",
                      marginTop: 4,
                      lineHeight: "16px",
                    }}
                  >
                    Your data is safe
                    <br />
                    and protected
                  </div>
                </div>
              </Col>

              <Col span={8}>
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <ThunderboltOutlined
                    style={{
                      fontSize: 20,
                      color: "#ff1616",
                    }}
                  />

                  <div
                    style={{
                      fontWeight: "bold",
                      marginTop: 8,
                      fontSize: 14,
                    }}
                  >
                    Reliable
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#666",
                      marginTop: 4,
                      lineHeight: "16px",
                    }}
                  >
                    24×7 System
                    <br />
                    Availability
                  </div>
                </div>
              </Col>

              <Col span={8}>
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <CheckCircleOutlined
                    style={{
                      fontSize: 20,
                      color: "#ff1616",
                    }}
                  />

                  <div
                    style={{
                      fontWeight: "bold",
                      marginTop: 8,
                      fontSize: 14,
                    }}
                  >
                    Trusted
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#666",
                      marginTop: 4,
                      lineHeight: "16px",
                    }}
                  >
                    Trusted by
                    <br />
                    Housing Societies
                  </div>
                </div>
              </Col>
            </Row>
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
    </div>
  );
};

export default Login;

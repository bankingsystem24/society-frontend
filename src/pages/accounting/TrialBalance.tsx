import React, { useEffect, useState } from "react";
import { Table, Card, Typography, Spin, message, Row, Col, Tag } from "antd";
import axios from "axios";

const { Title } = Typography;

interface TrialBalanceRow {
  glCode: number;
  accountName: string;
  debit: number;
  credit: number;
  accountType?: string;
  balanceType?: string;
}

const TrialBalance: React.FC = () => {
  const [data, setData] = useState<TrialBalanceRow[]>([]);
  const [loading, setLoading] = useState(false);

  const societyId = sessionStorage.getItem("societyId");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:7777/api/gl/reports/trial-balance?societyId=${societyId}`
      );
      setData(res.data || []);
    } catch (err) {
      message.error("Failed to load Trial Balance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: "GL Code",
      dataIndex: "glCode",
      key: "glCode",
      width: 120,
      fixed: "left" as const,
    },
    {
      title: "Account Name",
      dataIndex: "accountName",
      key: "accountName",
      width: 240,
    },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      align: "right" as const,
      width: 140,
      render: (v: number) => (v || 0).toFixed(2),
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      align: "right" as const,
      width: 140,
      render: (v: number) => (v || 0).toFixed(2),
    },
    {
      title: "Type",
      dataIndex: "balanceType",
      key: "balanceType",
      align:"center",
      render: (v: string) => (
        <Tag color={v === "DEBIT" ? "blue" : "purple"}>
          {v}
        </Tag>
      ),
    },
    {
        title:"A/c Type",
        dataIndex:"accountType",
        key:"accountType"
    }
  ];

  const totalDebit = data.reduce((a, b) => a + (b.debit || 0), 0);
  const totalCredit = data.reduce((a, b) => a + (b.credit || 0), 0);
  const diff = totalDebit - totalCredit;

  const isBalanced = Math.abs(diff) < 0.01;

  return (
    <Card style={{ borderRadius: 12 }}>
      <Title level={3} style={{ marginBottom: 20 }}>
        Trial Balance
      </Title>

      {loading ? (
        <Spin />
      ) : (
        <>
          {/* TABLE */}
          <div style={{ width: "100%", overflowX: "auto" }}>
            <Table
              dataSource={data}
              columns={columns}
              rowKey="glCode"
              pagination={false}
              scroll={{ x: 800 }}
              bordered
            />
          </div>

          {/* SUMMARY */}
          <Row gutter={[16, 16]} style={{ marginTop: 20 }} justify="end">
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <b>Total Debit</b>
                <div>{totalDebit.toFixed(2)}</div>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <b>Total Credit</b>
                <div>{totalCredit.toFixed(2)}</div>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card
                size="small"
                style={{
                  border: isBalanced ? "1px solid green" : "1px solid red",
                }}
              >
                <b>Difference</b>
                <div style={{ color: isBalanced ? "green" : "red" }}>
                  {diff.toFixed(2)}
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <b>Status</b>
                <div style={{ color: isBalanced ? "green" : "red" }}>
                  {isBalanced ? "BALANCED" : "NOT BALANCED"}
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Card>
  );
};

export default TrialBalance;
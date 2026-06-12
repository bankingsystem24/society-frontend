import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Typography,
  Row,
  Col,
  Statistic,
  Spin,
  message,
} from "antd";
import { apiGet } from "../../api/axios";

const { Title } = Typography;

interface PnlItem {
  glCode: number;
  accountName: string;
  amount: number;
}

interface PnlResponse {
  income: PnlItem[];
  expense: PnlItem[];
  totalIncome: number;
  totalExpense: number;
  surplus: number;
}

const ProfitAndLoss: React.FC = () => {
  const [data, setData] = useState<PnlResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPnl = async () => {
    try {
      setLoading(true);
      const societyId = Number(sessionStorage.getItem("societyId"));
      const res = await apiGet(`/reports/profit-loss?societyId=${societyId}`);

      setData(res);
    } catch (error) {
      console.error(error);
      message.error("Failed to load Profit & Loss Report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPnl();
  }, []);

  const columns = [
    {
      title: "GL Code",
      dataIndex: "glCode",
      key: "glCode",
    },
    {
      title: "Account Name",
      dataIndex: "accountName",
      key: "accountName",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right" as const,
      render: (value: number) =>
        `₹ ${value.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })}`,
    },
  ];

  if (loading) {
    return <Spin fullscreen />;
  }

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>Income & Expenditure Account</Title>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Statistic
            title="Total Income"
            value={data?.totalIncome || 0}
            precision={2}
            prefix="₹"
            valueStyle={{
              fontSize: "18px",
              fontWeight: 600,
            }}
          />
        </Col>

        <Col span={8}>
          <Statistic
            title="Total Expense"
            value={data?.totalExpense || 0}
            precision={2}
            prefix="₹"
            valueStyle={{
              fontSize: "18px",
              fontWeight: 600,
            }}
          />
        </Col>

        <Col span={8}>
          <Statistic
            title={(data?.surplus || 0) >= 0 ? "Surplus" : "Deficit"}
            value={Math.abs(data?.surplus || 0)}
            precision={2}
            prefix="₹"
            valueStyle={{
              fontSize: "18px",
              fontWeight: 600,
            }}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Income">
            <Table
              rowKey="glCode"
              dataSource={data?.income || []}
              columns={columns}
              pagination={{
                pageSize: 8,
              }}
              size="small"
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} />
                  <Table.Summary.Cell index={1}>
                    <b>Total Income</b>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <b>
                      ₹{" "}
                      {(data?.totalIncome || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </b>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Expenses">
            {(data?.expense?.length ?? 0) > 0 ? (
              <Table
                rowKey="glCode"
                dataSource={data?.expense}
                columns={columns}
                pagination={{pageSize: 8,}}
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} />
                    <Table.Summary.Cell index={1}>
                      <b>Total Expenses</b>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <b>
                        ₹{" "}
                        {(data?.totalExpense || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </b>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: 20,
                  color: "#999",
                }}
              >
                No expenses recorded.
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card
        style={{
          marginTop: 10,
          textAlign: "center",
        }}
      >
        <Title level={5} style={{ marginTop: -5, marginBottom: -5 }}>
          {(data?.surplus || 0) >= 0
            ? `Net Surplus : ₹ ${Math.abs(data?.surplus || 0).toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                },
              )}`
            : `Net Deficit : ₹ ${Math.abs(data?.surplus || 0).toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                },
              )}`}
        </Title>
      </Card>
    </div>
  );
};

export default ProfitAndLoss;

import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Spin,
  message,
  Row,
  Col,
  Tag,
} from "antd";
import axios from "axios";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

const BASE_URL = import.meta.env.VITE_API_URL;

interface TrialBalanceRow {
  glCode: number;
  accountName: string;

  openingBalance: number;
  openingType: "DR" | "CR";

  debit: number;
  credit: number;

  closingBalance: number;
  closingType: "DR" | "CR";

  groupName?: string;
}

const TrialBalance: React.FC = () => {
  const [data, setData] = useState<TrialBalanceRow[]>([]);
  const [loading, setLoading] = useState(false);

  const societyId = Number(sessionStorage.getItem("societyId"));

  useEffect(() => {
    if (!societyId) {
      message.error("Society ID missing. Please login again.");
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/gl/reports/trial-balance?societyId=${societyId}`
      );

      setData(res.data || []);

      console.log("Trial Balance Response:",res.data);

    } catch (error) {
      message.error("Failed to load Trial Balance");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<TrialBalanceRow> = [
    {
      title: "GL Code",
      dataIndex: "glCode",
      key: "glCode",
      width: 100,
      fixed: "left",
    },
    {
      title: "Account Name",
      dataIndex: "accountName",
      key: "accountName",
      width: 250,
      fixed: "left",
    },
    {
      title: "Opening",
      key: "opening",
      width: 140,
      align: "right",
      render: (_, record) =>
        `${(record.openingBalance || 0).toFixed(2)} ${
          record.openingType || ""
        }`,
    },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      width: 140,
      align: "right",
      render: (value: number) => (value || 0).toFixed(2),
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      width: 140,
      align: "right",
      render: (value: number) => (value || 0).toFixed(2),
    },
    {
      title: "Closing",
      key: "closing",
      width: 140,
      align: "right",
      render: (_, record) =>
        `${(record.closingBalance || 0).toFixed(2)} ${
          record.closingType || ""
        }`,
    },
    {
      title: "A/c Type",
      dataIndex: "groupName",
      key: "accountType",
      width: 140,
      align: "center",
      render: (value: string) => {
        let color = "default";

        switch (value) {
          case "ASSET":
            color = "blue";
            break;
          case "LIABILITY":
            color = "red";
            break;
          case "INCOME":
            color = "green";
            break;
          case "EXPENSE":
            color = "orange";
            break;
          case "EQUITY":
            color = "purple";
            break;
        }

        return <Tag color={color}>{value}</Tag>;
      },
    },
  ];

  const totalDebit = data.reduce(
    (sum, row) => sum + (row.debit || 0),
    0
  );

  const totalCredit = data.reduce(
    (sum, row) => sum + (row.credit || 0),
    0
  );

  const difference = totalDebit - totalCredit;

  const isBalanced = Math.abs(difference) < 0.01;

  return (
    <Card style={{ borderRadius: 12 }}>
      <Title level={3}>Trial Balance</Title>

      {loading ? (
        <Spin />
      ) : (
        <>
          <Table
            dataSource={data}
            columns={columns}
            rowKey="glCode"
            pagination={false}
            bordered
            size="small"
            scroll={{ x: 1200 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <strong>Total</strong>
                  </Table.Summary.Cell>

                  <Table.Summary.Cell index={3} align="right">
                    <strong>{totalDebit.toFixed(2)}</strong>
                  </Table.Summary.Cell>

                  <Table.Summary.Cell index={4} align="right">
                    <strong>{totalCredit.toFixed(2)}</strong>
                  </Table.Summary.Cell>

                  <Table.Summary.Cell index={5} colSpan={2} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />

          <Row gutter={16} justify="end" style={{ marginTop: 20 }}>
            <Col>
              <Card size="small">
                <b>Total Debit</b>
                <div>{totalDebit.toFixed(2)}</div>
              </Card>
            </Col>

            <Col>
              <Card size="small">
                <b>Total Credit</b>
                <div>{totalCredit.toFixed(2)}</div>
              </Card>
            </Col>

            <Col>
              <Card
                size="small"
                style={{
                  border: isBalanced
                    ? "1px solid green"
                    : "1px solid red",
                }}
              >
                <b>Difference</b>
                <div
                  style={{
                    color: isBalanced ? "green" : "red",
                  }}
                >
                  {difference.toFixed(2)}
                </div>
              </Card>
            </Col>

            <Col>
              <Card size="small">
                <b>Status</b>
                <div
                  style={{
                    color: isBalanced ? "green" : "red",
                    fontWeight: 600,
                  }}
                >
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
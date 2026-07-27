import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Typography,
  Row,
  Col,
  Spin,
  message,
  Button,
  DatePicker,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";
import { PrinterOutlined } from "@ant-design/icons";
import "./BalanceSheet.css";

const { Title, Text } = Typography;

const BASE_URL = import.meta.env.VITE_API_URL;

interface BalanceSheetItem {
  accountType: string;
  glCode: number;
  glName: string;
  openingBalance: number;
  debit: number;
  credit: number;
  closingBalance: number;
}

interface BalanceSheetResponse {
  assets: BalanceSheetItem[];
  liabilities: BalanceSheetItem[];
  equity: BalanceSheetItem[];

  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

const formatAmount = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const BalanceSheet: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
  const [asOnDate, setAsOnDate] = useState<Dayjs | null>(null);
  const societyName = sessionStorage.getItem("societyName");
  const [data, setData] = useState<BalanceSheetResponse>({
    assets: [],
    liabilities: [],
    equity: [],
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
  });

  useEffect(() => {}, []);

  useEffect(() => {
    const financialYear = sessionStorage.getItem("financialYear");

    if (financialYear) {
      const years = financialYear.split("-");
      if (years.length === 2) {
        const endYear = years[1].length === 2 ? `20${years[1]}` : years[1];

        setAsOnDate(dayjs(`${endYear}-03-31`));
      }
    }
  }, []);

  const loadBalanceSheet = async () => {
    if (!asOnDate) {
      message.warning("Please select As On Date.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(`${BASE_URL}/reports/balance-sheet`, {
        params: {
          societyId,
          financialYearId,
          asOnDate: asOnDate.format("YYYY-MM-DD"),
        },
      });

      setData(response.data);
    } catch (err) {
      message.error("Unable to load balance sheet.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "GL Code",
      dataIndex: "glCode",
      width: 100,
    },
    {
      title: "Account",
      dataIndex: "glName",
    },
    {
      title: "Closing Balance",
      dataIndex: "closingBalance",
      align: "right" as const,
      render: (value: number) => formatAmount(value),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Card>
        {/* Header */}
        <Row
          justify="space-between"
          align="middle"
          className="no-print"
          style={{ marginBottom: 16 }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Balance Sheet
          </Title>

          <div style={{ display: "flex", gap: 10 }}>
            <DatePicker
              value={asOnDate}
              onChange={setAsOnDate}
              format="DD-MM-YYYY"
              placeholder="As On Date"
              allowClear={false}
              disabledDate={(current) => current && current > dayjs()}
            />

            <Button type="primary" onClick={loadBalanceSheet}>
              Load
            </Button>

            <Button
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
              disabled={data.assets.length === 0}
            >
              Print
            </Button>
          </div>
        </Row>
        {/* ================= SCREEN VIEW ================= */}
        <div className="screen-only">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Assets">
                <Table
                  rowKey="glCode"
                  columns={columns}
                  dataSource={data.assets}
                  pagination={false}
                  size="small"
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <Text strong>Total Assets</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <Text strong>{formatAmount(data.totalAssets)}</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                />
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Liabilities">
                <Table
                  rowKey="glCode"
                  columns={columns}
                  dataSource={data.liabilities}
                  pagination={false}
                  size="small"
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <Text strong>Total Liabilities</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <Text strong>
                          {formatAmount(data.totalLiabilities)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                />
              </Card>

              <Card title="Equity" style={{ marginTop: 16 }}>
                <Table
                  rowKey="glCode"
                  columns={columns}
                  dataSource={data.equity}
                  pagination={false}
                  size="small"
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <Text strong>Total Equity</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <Text strong>{formatAmount(data.totalEquity)}</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                />
              </Card>
              <Card style={{ marginTop: 0 }}>
                <Row justify="space-between">
                  <Text strong>Total Liabilities + Equity</Text>
                  <Text strong>
                    {formatAmount(data.totalLiabilities + data.totalEquity)}
                  </Text>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>

        {/* ================= PRINT VIEW ================= */}
        <div className="print-only">
          <Title level={4} style={{ textAlign: "center" }}>
            {societyName} (Balance Sheet)
          </Title>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
                <Text strong>
                    As on : {asOnDate ? asOnDate.format("DD-MM-YYYY") : ""}
                </Text>
            </div>

          <table className="balance-sheet-table">
            <thead>
              <tr>
                <th>Assets</th>
                <th>Amount</th>
                <th>Liabilities & Equity</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {Array.from({
                length: Math.max(
                  data.assets.length,
                  data.liabilities.length + data.equity.length,
                ),
              }).map((_, index) => {
                const asset = data.assets[index];

                const rightSide = [...data.liabilities, ...data.equity];

                const right = rightSide[index];

                return (
                  <tr key={index}>
                    <td>{asset?.glName ?? ""}</td>

                    <td style={{ textAlign: "right" }}>
                      {asset ? formatAmount(asset.closingBalance) : ""}
                    </td>

                    <td>{right?.glName ?? ""}</td>

                    <td style={{ textAlign: "right" }}>
                      {right ? formatAmount(right.closingBalance) : ""}
                    </td>
                  </tr>
                );
              })}

              <tr className="total-row">
                <td>
                  <b>Total Assets</b>
                </td>

                <td style={{ textAlign: "right" }}>
                  <b>{formatAmount(data.totalAssets)}</b>
                </td>

                <td>
                  <b>Total Liabilities + Equity</b>
                </td>

                <td style={{ textAlign: "right" }}>
                  <b>
                    {formatAmount(data.totalLiabilities + data.totalEquity)}
                  </b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </Spin>
  );
};

export default BalanceSheet;

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  Form,
  DatePicker,
  Select,
  Button,
  Row,
  Col,
  Checkbox,
  Table,
  Space,
  Typography,
} from "antd";
import dayjs from "dayjs";
import axios from "axios";
import type { ColumnsType } from "antd/es/table";
import "./CashBookReport.css";

const { Text } = Typography;
const BASE_URL = import.meta.env.VITE_API_URL;

const { RangePicker } = DatePicker;

const CashBookReport: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportRange, setReportRange] = useState<{
    fromDate: string;
    toDate: string;
  } | null>(null);
  const [reportTitle, setReportTitle] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    loadAccounts();
  }, []);


  const loadAccounts = async () => {
    try {
      const societyId = Number(sessionStorage.getItem("societyId"));

      const response = await axios.get(`${BASE_URL}/gl/master/cash-bank`, {
        params: { societyId },
      });

      setAccounts(response.data);

    } catch (error) {
      console.error("Error loading accounts:", error);
    }
  };

  const onGenerate = async (values: any) => {
    const fromDate = values.dateRange[0].format("DD-MM-YYYY");
    const toDate = values.dateRange[1].format("DD-MM-YYYY");

    setReportRange({ fromDate, toDate });

    setReportTitle(`Cash Book (${fromDate} - ${toDate})`);

    const payload = {
      societyId: Number(sessionStorage.getItem("societyId")),
      financialYearId: Number(sessionStorage.getItem("financialYearId")),
      fromDate: values.dateRange[0].format("YYYY-MM-DD"),
      toDate: values.dateRange[1].format("YYYY-MM-DD"),
      accountCode: values.accountId,
      voucherType: values.voucherType,
      paymentMode: values.paymentMode,
      memberId: values.memberId,
      flatId: values.flatId,
      openingBalance: values.openingBalance,
      showNarration: values.showNarration,
    };

    try {
      setLoading(true);

      const response = await axios.post(
        `${BASE_URL}/cash-book/report`,
        payload,
      );

      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Voucher",
      dataIndex: "voucherNo",
      key: "voucherNo",
    },
    {
      title: "Particulars",
      dataIndex: "particulars",
      key: "particulars",
    },
    {
      title: "Receipt",
      dataIndex: "receipt",
      key: "receipt",
      align: "right",
      render: (value: number) =>
        value
          ? Number(value).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })
          : "",
    },
    {
      title: "Payment",
      dataIndex: "payment",
      key: "payment",
      align: "right",
      render: (value: number) =>
        value
          ? Number(value).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })
          : "",
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      align: "right",
      render: (value: number) =>
        Number(value).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },
  ];

  const handlePrint = () => {
    const printContents = reportRef.current?.innerHTML;
    const printWindow = window.open("", "_blank", "width=1000,height=800");

    if (printWindow && printContents) {
      printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            table, th, td {
              border: 1px solid #000;
            }
            th, td {
              padding: 8px;
              text-align: left;
            }
            th {
              background: #f5f5f5;
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={onGenerate}
        initialValues={{
          openingBalance: true,
          showNarration: true,
          dateRange: [dayjs().startOf("month"), dayjs()],
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Space align="center">
              <Text strong>
                Cash Book Report : {}-{}
              </Text>

              <Form.Item
                name="dateRange"
                rules={[
                  { required: true, message: "Please select date range" },
                ]}
                style={{ marginBottom: 0 }}
              >
                <RangePicker format="DD-MM-YYYY" />
              </Form.Item>
            </Space>
          </Col>
<Col span={12}>
  <Space align="center">
    <Text strong>Cash / Bank Account :</Text>

    <Form.Item
      name="accountId"
      rules={[{ required: true, message: "Please select account" }]}
      style={{ marginBottom: 0, width: 300 }}
    >
      <Select placeholder="Select Account">
        {accounts.map((account) => (
          <Select.Option
            key={account.glCode}
            value={account.glCode}
          >
            {account.accountName}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  </Space>
</Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 10 }}>


          {/* <Col span={6}>
            <Form.Item label="Voucher Type" name="voucherType">
              <Select allowClear placeholder="All">
                <Select.Option value="RECEIPT">Receipt</Select.Option>
                <Select.Option value="PAYMENT">Payment</Select.Option>
                <Select.Option value="CONTRA">Contra</Select.Option>
                <Select.Option value="JOURNAL">Journal</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Payment Mode" name="paymentMode">
              <Select allowClear placeholder="All">
                <Select.Option value="CASH">Cash</Select.Option>
                <Select.Option value="CHEQUE">Cheque</Select.Option>
                <Select.Option value="UPI">UPI</Select.Option>
                <Select.Option value="NEFT">NEFT</Select.Option>
                <Select.Option value="RTGS">RTGS</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Member" name="memberId">
              <Select allowClear placeholder="All Members">
                <Select.Option value={1}>Member 1</Select.Option>
                <Select.Option value={2}>Member 2</Select.Option>
              </Select>
            </Form.Item>
          </Col> */}
        </Row>

        <Row gutter={16} style={{ marginTop: 0 }}>
          {/* <Col span={6}>
            <Form.Item label="Flat" name="flatId">
              <Select allowClear placeholder="All Flats">
                <Select.Option value={1}>A-101</Select.Option>
                <Select.Option value={2}>A-102</Select.Option>
              </Select>
            </Form.Item>
          </Col> */}
          <Col span={6} style={{ marginTop: 30 }}>
            <Form.Item name="openingBalance" valuePropName="checked">
              <Checkbox>Include Opening Balance</Checkbox>
            </Form.Item>
          </Col>

          {/* <Col span={6} style={{ marginTop: 30 }}>
            <Form.Item name="showNarration" valuePropName="checked">
              <Checkbox>Show Narration</Checkbox>
            </Form.Item>
          </Col> */}

          <Col span={6} style={{ marginTop: 30 }}>
            <Button type="primary" htmlType="submit">
              Generate Report
            </Button>
          </Col>
          <Col span={6} style={{ marginTop: 30 }}>
            <Button danger onClick={handlePrint}>
              Print
            </Button>
          </Col>
        </Row>
      </Form>
      {data.length > 0 && (
        <div ref={reportRef} id="cashBookReport">
          <Card title={reportTitle || "Cash Book"} style={{ marginTop: 20 }}>
            <Table
              rowKey={(_, index) => index!.toString()}
              columns={columns}
              dataSource={data}
              loading={loading}
              pagination={false}
              bordered
            />
          </Card>
        </div>
      )}
    </>
  );
};

export default CashBookReport;

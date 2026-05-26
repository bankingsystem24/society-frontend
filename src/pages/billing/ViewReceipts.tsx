import { Button, Card, Form, Select, Space, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import type { ColumnsType } from "antd/es/table";

const BASE_URL = import.meta.env.VITE_API_URL;

interface Flat {
  id: number;
  flatNo: string;
}

interface Receipt {
  id: number;
  receiptNo: string;
  createdAt?: string;
  flatNo: string;
  memberName: string;
  totalAmount: number;
  paymentMode?: string;
}

export default function ViewReceipts() {
  const [form] = Form.useForm();

  const [flats, setFlats] = useState<Flat[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const [loading, setLoading] = useState(false);

  const societyId = sessionStorage.getItem("societyId");

  useEffect(() => {
    loadFlats();
    loadReceipts();
  }, []);

  const loadFlats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/flats?societyId=${societyId}`);

      setFlats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadReceipts = async (flatId?: number) => {
    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/receipts/viewReceipts`, {
        societyId: Number(societyId),
        flatId: flatId || null,
      });

      console.log("Receipts", res.data);

      setReceipts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Receipt> = [
    {
      title: "Receipt No",
      dataIndex: "receiptNo",
    },
    {
      title: "Flat",
      dataIndex: "flatNo",
    },
    {
      title: "Member",
      dataIndex: "memberName",
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      render: (value) => `₹ ${value}`,
    },
    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
      render: (value) => <Tag color="green">{value || "CASH"}</Tag>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (value) =>
        value ? new Date(value).toLocaleDateString("en-GB") : "-",
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => handlePrint(record)}
          >
            Print
          </Button>
        </Space>
      ),
    },
  ];

  const handlePrint = (receipt: Receipt) => {
    const content = `
      <html>
        <head>
          <title>Receipt</title>
        </head>

        <body style="font-family: Arial; padding:20px;">

          <h2>Society Maintenance Receipt</h2>

          <hr/>

          <p><b>Receipt No:</b> ${receipt.receiptNo}</p>
          <p><b>Flat:</b> ${receipt.flatNo}</p>
          <p><b>Member:</b> ${receipt.memberName}</p>
          <p><b>Amount:</b> ₹ ${receipt.totalAmount}</p>
          <p><b>Payment Mode:</b> ${receipt.paymentMode || "CASH"}</p>
          <p><b>Date:</b> ${receipt.createdAt || "-"}</p>

          <br/><br/>

          <p>Authorized Signatory</p>

        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");

    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card title="View Receipts">
      <Form form={form} layout="vertical">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <Form.Item
            label="Select Flat"
            style={{
              flex: "1 1 250px",
              maxWidth: 220,
              marginBottom: 0,
            }}
          >
            <Select
              allowClear
              placeholder="Select Flat"
              options={flats.map((f) => ({
                label: f.flatNo,
                value: f.id,
              }))}
              onChange={(val) => loadReceipts(val)}
            />
          </Form.Item>
        </div>
      </Form>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <Table
          rowKey="id"
          dataSource={receipts}
          columns={columns}
          loading={loading}
          size="small"
          pagination={{ pageSize: 10, }}
          scroll={{ x: "max-content" }}
        />
      </div>
    </Card>
  );
}

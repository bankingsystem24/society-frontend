import { Button, Card, Form, Modal, Select, Table, Tag } from "antd";
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

interface ReceiptBill {
  id: number;
  month: string;
  year: number;
  totalAmount: number;
  maintenanceAmount: number;
  penaltyAmount: number;
  status: string;
}

export default function ViewReceipts() {
  const [form] = Form.useForm();

  const [flats, setFlats] = useState<Flat[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const [loading, setLoading] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [receiptBills, setReceiptBills] = useState<ReceiptBill[]>([]);

  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

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

    const res = await axios.post(
      `${BASE_URL}/receipts/viewReceipts`,
      {
        societyId: Number(societyId),
        flatId: flatId || null,
      }
    );

    const financialYear =
      sessionStorage.getItem("financialYear");

    if (!financialYear) {
      setReceipts(res.data);
      return;
    }

    const [startYear, endYear] = financialYear
      .split("-")
      .map(Number);

    const filtered = res.data.filter((r: any) => {
      const receiptDate = new Date(r.createdAt);

      const year = receiptDate.getFullYear();
      const month = receiptDate.getMonth() + 1; // Jan=1

      return (
        (year === startYear && month >= 4) ||
        (year === endYear && month <= 3)
      );
    });

    setReceipts(filtered);

  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  const loadReceiptDetails = async (receiptId: number) => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/receipts/details/${receiptId}`);

      setReceiptBills(res.data);

      const selected = receipts.find((r) => r.id === receiptId) || null;

      setSelectedReceipt(selected);

      setDetailsOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (receipt: Receipt | null) => {
    if (!receipt) return;

    const rows = receiptBills
      .map(
        (b) => `
        <tr>
          <td>${b.month}</td>
          <td>${b.year}</td>
          <td>${b.maintenanceAmount}</td>
          <td>${b.penaltyAmount}</td>
          <td>${b.totalAmount}</td>
          <td>${b.status}</td>
        </tr>
      `,
      )
      .join("");

    const societyName =  sessionStorage.getItem("societyName") || "";

    const content = `
      <html>
        <head>
          <title>Receipt</title>

          <style>
            body {
              font-family: Arial;
              padding: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }

            h2 {
              margin-bottom: 0;
            }
          </style>
        </head>

        <body>

          <h2>${societyName}</h2>
          <h2>Maintenance Receipt</h2>

          <hr />

        <table
        style={{
            width: "100%",
            marginTop: "10px",
            borderCollapse: "collapse",
        }}
        >
        <tbody>
            <tr>
            <td style="padding:6px; font-weight:bold; width:180px;">
                Receipt No
            </td>
            <td style="padding:6px;">
                ${receipt.receiptNo}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Flat
            </td>
            <td style="padding:6px;">
                ${receipt.flatNo}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Member
            </td>
            <td style="padding:6px;">
                ${receipt.memberName}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Total Amount
            </td>
            <td style="padding:6px;">
                ₹ ${receipt.totalAmount}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Payment Mode
            </td>
            <td style="padding:6px;">
                ${receipt.paymentMode || "CASH"}
            </td>
            </tr>

            <tr>
            <td style="padding:6px; font-weight:bold;">
                Date
            </td>
            <td style="padding:6px;">
                ${
                receipt.createdAt
                    ? new Date(receipt.createdAt).toLocaleDateString("en-GB")
                    : "-"
                }
            </td>
            </tr>
        </tbody>
        </table>

          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Year</th>
                <th>Maintenance</th>
                <th>Penalty</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

          <br/><br/>

          <p>
            <b>Authorized Signatory</b>
          </p>

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
      title:"Payment Mode",
      dataIndex:"paymentMode",
    },
    {
      title:"Transaction Id",
      dataIndex:"transactionId",
    },
  ];

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
              minWidth: 220,
              marginBottom: 0,
              maxWidth:"200px"
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
          pagination={{
            pageSize: 10,
          }}
          scroll={{ x: "max-content" }}
          onRow={(record) => ({
            onClick: () => loadReceiptDetails(record.id),
            style: { cursor: "pointer" },
          })}
        />
      </div>

      <Modal
        open={detailsOpen}
        onCancel={() => setDetailsOpen(false)}
        width={900}
        title={`Receipt Details - ${selectedReceipt?.receiptNo || ""}`}
        footer={[
          <Button
            key="print"
            type="primary"
            onClick={() => handlePrint(selectedReceipt)}
          >
            Print Receipt
          </Button>,

          <Button key="close" onClick={() => setDetailsOpen(false)}>
            Close
          </Button>,
        ]}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div>
            <b>Flat:</b> {selectedReceipt?.flatNo}
          </div>

          <div>
            <b>Member:</b> {selectedReceipt?.memberName}
          </div>

          <div>
            <b>Total:</b> ₹ {selectedReceipt?.totalAmount}
          </div>

          <div>
            <b>Payment Mode:</b> {selectedReceipt?.paymentMode}
          </div>
        </div>

        <Table
          rowKey="id"
          dataSource={receiptBills}
          pagination={false}
          size="small"
          scroll={{ x: "max-content" }}
          columns={[
            {
              title: "Month",
              dataIndex: "month",
            },
            {
              title: "Year",
              dataIndex: "year",
            },
            {
              title: "Maintenance",
              dataIndex: "maintenanceAmount",
            },
            {
              title: "Penalty",
              dataIndex: "penaltyAmount",
            },
            {
              title: "Total",
              dataIndex: "totalAmount",
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (value) => <Tag color="green">{value}</Tag>,
            },
          ]}
        />
      </Modal>
    </Card>
  );
}

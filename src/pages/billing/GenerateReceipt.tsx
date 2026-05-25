import { Button, Card, Form, Modal, Select, Table, message } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import type { ColumnsType } from "antd/es/table";

const BASE_URL = import.meta.env.VITE_API_URL;

interface Flat {
  id: number;
  flatNo: string;
}

interface Bill {
  id: number;
  flatNo: string;
  memberName: string;
  month: string;
  year: number;
  totalAmount: number;
  status: string;
  flatId:number;
}

export default function GenerateReceipt() {
  const [form] = Form.useForm();

  const [flats, setFlats] = useState<Flat[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<Bill[]>([]);
  const [receiptNo, setReceiptNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const societyId = sessionStorage.getItem("societyId");

  useEffect(() => {
    loadFlats();
  }, []);

  const loadFlats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/flats?societyId=${societyId}`);
      setFlats(res.data);
    } catch {
      message.error("Failed to load flats");
    }
  };

  const loadPaidBills = async (flatId?: number) => {
    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/billing/viewAllBills`, {
        societyId: Number(societyId),
        flatId: flatId || null,
        status: "PAID",
      });

      setBills(res.data);
    } catch {
      message.error("Failed to load paid bills");
    } finally {
      setLoading(false);
    }
  };

  const generateReceiptNo = () => {
    const date = new Date();
    const rand = Math.floor(Math.random() * 10000);
    return `RCP-${date.getFullYear()}-${rand}`;
  };

  const handleGenerateReceipt = () => {
    const selected = bills.filter((b) => selectedRowKeys.includes(b.id));

    if (selected.length === 0) {
      message.warning("Select at least one record");
      return;
    }

    const rcpNo = generateReceiptNo();
    setReceiptNo(rcpNo);

    Modal.confirm({
      title: "Generate Receipt?",
      content: `Receipt No: ${rcpNo}`,
      okText: "Yes",
      cancelText: "No",

      onOk: async () => {
        try {
          setSaving(true);

            await axios.post(`${BASE_URL}/receipts/create`, {
            receiptNo: rcpNo,
            societyId: Number(societyId),
            flatId: selected[0].flatId,
            totalAmount: selected.reduce((s, b) => s + (b.totalAmount || 0), 0),
            billIds: selected.map((b) => b.id)
            });

          setReceiptData(selected);
          setReceiptOpen(true);
          setSelectedRowKeys([]);

          message.success("Receipt generated");
        } catch {
          message.error("Failed to generate receipt");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const columns: ColumnsType<Bill> = [
    { title: "Flat", dataIndex: "flatNo" },
    { title: "Member", dataIndex: "memberName" },
    { title: "Month", dataIndex: "month" },
    { title: "Year", dataIndex: "year" },
    { title: "Amount", dataIndex: "totalAmount" },
  ];

  const totalAmount = receiptData.reduce((s, b) => s + (b.totalAmount || 0), 0);

  return (
    <Card title="Generate Receipt">
      {/* ================= FILTER (RESPONSIVE) ================= */}
      <Form form={form} layout="vertical">
        <div style={{ maxWidth: 250, marginBottom: 12 }}>
          <Form.Item label="Select Flat" style={{ maxWidth: 250 }}>
            <Select
              allowClear
              placeholder="Select Flat"
              options={flats.map((f) => ({
                label: f.flatNo,
                value: f.id,
              }))}
              onChange={(val) => loadPaidBills(val)}
            />
          </Form.Item>
        </div>
      </Form>

      {/* ================= BUTTON (RESPONSIVE) ================= */}
      <div style={{ marginBottom: 12 }}>
        <Button
          type="primary"
          loading={saving}
          disabled={selectedRowKeys.length === 0}
          onClick={handleGenerateReceipt}
          block={window.innerWidth < 768}
        >
          Generate Receipt ({selectedRowKeys.length})
        </Button>
      </div>

      {/* ================= TABLE ================= */}
      <Table
        rowKey="id"
        dataSource={bills}
        columns={columns}
        loading={loading}
        size="small"
        scroll={{ x: "max-content" }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
      />

      {/* ================= MODAL (RESPONSIVE) ================= */}
      <Modal
        title="Payment Receipt"
        open={receiptOpen}
        onCancel={() => setReceiptOpen(false)}
        footer={[
          <Button key="close" onClick={() => setReceiptOpen(false)}>
            Close
          </Button>,
        ]}
        width="90%"
        style={{ top: 20 }}
      >
        <div>
          <h3 style={{ marginBottom: 5 }}>Society Maintenance Receipt</h3>

          <div style={{ marginBottom: 10 }}>
            <b>Receipt No:</b> {receiptNo}
          </div>

          <Table
            dataSource={receiptData}
            columns={columns}
            pagination={false}
            rowKey="id"
            size="small"
            scroll={{ x: "max-content" }}
          />

          <div
            style={{
              marginTop: 16,
              textAlign: "right",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Total Paid: ₹ {totalAmount.toFixed(2)}
          </div>
        </div>
      </Modal>
    </Card>
  );
}

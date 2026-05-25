import { Button, Card, Col, Form, Row, Select, Table, message } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

interface Flat {
  id: number;
  flatNo: string;
}

interface Bill {
  id: number;
  month: string;
  year: number;
  maintenanceAmount: number;
  penaltyAmount: number;
  totalAmount: number;
  status: string;
  dueDate: string;
  createdDate: string;
  flat: {
    flatNo: string;
  };
}

const months = [
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
  "JANUARY",
  "FEBRUARY",
  "MARCH",
];

export default function ViewBills() {
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);

  const societyId = sessionStorage.getItem("societyId");

  useEffect(() => {
    loadFlats();
    loadBills();
  }, []);

  const loadFlats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/flats?societyId=${societyId}`);
      console.log("flats", res);

      setFlats(res.data);
    } catch {
      message.error("Failed to load flats");
    }
  };

  const loadBills = async () => {
    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/billing/viewAllBills`, {
        societyId: Number(societyId),
      });
      console.log("society Id", societyId);
      console.log("Bills by SocietyId Response", res);

      setBills(res.data);
    } catch {
      message.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const filterBills = async () => {
    try {
      setLoading(true);

      const values = form.getFieldsValue();

      const payload = {
        societyId: Number(societyId),
        flatId: values.flatId || null,
        fromYear: values.fromYear || null,
        month: values.month || null,
        status: values.status || null,
      };

      console.log("payload", payload);

      const res = await axios.post(`${BASE_URL}/billing/viewAllBills`, payload);

      setBills(res.data);
    } catch {
      message.error("Failed to filter bills");
    } finally {
      setLoading(false);
    }
  };
  const [form] = Form.useForm();

  const columns = [
    {
      title: "Flat",
      dataIndex: ["flat", "flatNo"],
    },
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
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
    },
  ];
  const totalMaintenance = bills.reduce(
    (sum, bill) => sum + (bill.maintenanceAmount || 0),
    0,
  );

  const totalPenalty = bills.reduce(
    (sum, bill) => sum + (bill.penaltyAmount || 0),
    0,
  );

  const grandTotal = bills.reduce(
    (sum, bill) => sum + (bill.totalAmount || 0),
    0,
  );
  return (
    <Card title="View Bills">
      <Form form={form} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={12} lg={6}>
            <Form.Item label="Flat" name="flatId">
              <Select
                allowClear
                placeholder="Select Flat"
                onChange={filterBills}
                options={flats.map((f) => ({
                  label: f.flatNo,
                  value: f.id,
                }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={6}>
            <Form.Item label="Financial Year" name="fromYear">
              <Select
                allowClear
                placeholder="Select Year"
                onChange={filterBills}
                options={[
                  { label: "2024-2025", value: 2024 },
                  { label: "2025-2026", value: 2025 },
                  { label: "2026-2027", value: 2026 },
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={6}>
            <Form.Item label="Month" name="month">
              <Select
                allowClear
                placeholder="Select Month"
                onChange={filterBills}
                options={months.map((m) => ({
                  label: m,
                  value: m,
                }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={6}>
            <Form.Item label="Status" name="status">
              <Select
                allowClear
                placeholder="Select Status"
                onChange={filterBills}
                options={[
                  { label: "PENDING", value: "PENDING" },
                  { label: "PAID", value: "PAID" },
                  { label: "OVERDUE", value: "OVERDUE" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={24} md={8}>
          <Card styles={{ body: { padding: "6px 10px" } }}>
            {" "}
            <div style={{ fontSize: 13 }}>Total Maintenance</div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              ₹ {totalMaintenance.toFixed(2)}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={8}>
          <Card styles={{ body: { padding: "6px 10px" } }}>
            <div style={{ fontSize: 13 }}>Total Penalty</div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              ₹ {totalPenalty.toFixed(2)}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={8}>
          <Card styles={{ body: { padding: "6px 10px" } }}>
            <div style={{ fontSize: 13 }}>Grand Total</div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              ₹ {grandTotal.toFixed(2)}
            </div>
          </Card>
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={bills}
        loading={loading}
        size="small"
        className="compact-table"
        scroll={{ x: 800 }}
      />
    </Card>
  );
}

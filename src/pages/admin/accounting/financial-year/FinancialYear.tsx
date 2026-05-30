import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Tag,
  Space,
  Typography,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Title } = Typography;

interface FinancialYear {
  id: number;
  fyCode: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

const FinancialYear: React.FC = () => {
  const [data, setData] = useState<FinancialYear[]>([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const societyId = sessionStorage.getItem("societyId");

  useEffect(() => {
    fetchYears();
  }, []);

  // ================= FETCH =================
  const fetchYears = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:7777/api/accounting-year/${societyId}`
      );

      setData(res.data);
    } catch (err) {
      message.error("Failed to load financial years");
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE =================
    const handleCreate = async (values: any) => {
    const startDate = values.dates[0].format("YYYY-MM-DD");
    const endDate = values.dates[1].format("YYYY-MM-DD");
    const fyCode = values.fyCode;
    const username = "Admin";

    console.log("username",username);
    try {
      await axios.post(
        `http://localhost:7777/api/accounting-year/create`,
        {
            societyId: Number(societyId),
            fyCode,
            startDate,
            endDate,
            username 
        }
      );

      message.success("Financial Year created");
      setOpen(false);
      form.resetFields();
      fetchYears();
    } catch (err) {
      message.error("Error creating financial year");
    }
  };

  // ================= ACTIVATE =================
  const handleActivate = async (yearId: number) => {
    try {
      await axios.put(
        `http://localhost:7777/api/accounting-year/activate`,
        {
          societyId,
          yearId,
        }
      );


      message.success("Active financial year updated");
      fetchYears();

      const token = sessionStorage.getItem("token");
      const fyRes = await axios.get(
              `${import.meta.env.VITE_API_URL}/accounting-year/${societyId}/active`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );
      
      sessionStorage.setItem("financialYear", fyRes.data.fyCode);
      window.dispatchEvent(new Event("financialYearChanged"));

    } catch (err) {
      message.error("Failed to activate year");
    }
  };

  // ================= COLUMNS =================
  const columns = [
    {
      title: "FY Code",
      dataIndex: "fyCode",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      render: (d: string) => dayjs(d).format("DD-MMM-YYYY"),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      render: (d: string) => dayjs(d).format("DD-MMM-YYYY"),
    },
    {
      title: "Status",
      dataIndex: "active",
      render: (active: boolean) =>
        active ? <Tag color="green">ACTIVE</Tag> : <Tag>INACTIVE</Tag>,
    },
    {
      title: "Action",
      render: (_: any, record: FinancialYear) => (
        <Space>
          {!record.active && (
            <Button
              type="primary"
              onClick={() => handleActivate(record.id)}
            >
              Set Active
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // ================= UI =================
  return (
    <Card style={{ margin: 10 }}>
      <Title level={3}>Financial Year Management</Title>

      <Button type="primary" onClick={() => setOpen(true)}>
        + Create Financial Year
      </Button>

      <br />
      <br />

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={false}
      />

      {/* CREATE MODAL */}
      <Modal
        title="Create Financial Year"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            label="FY Code (e.g. 2025-26)"
            name="fyCode"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Date Range"
            name="dates"
            rules={[{ required: true }]}
          >
            <DatePicker.RangePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default FinancialYear;
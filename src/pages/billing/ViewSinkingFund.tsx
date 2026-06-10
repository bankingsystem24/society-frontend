import React, { useEffect, useState } from "react";
import { Table, Card, Select, InputNumber, Button, message, Space } from "antd";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

interface SinkingFund {
  id: number;
  societyId: number;
  flatNo: string;
  month: string;
  year: number;
  amount: number;
  createdBy: number;
}

const ViewSinkingFund: React.FC = () => {
  const [data, setData] = useState<SinkingFund[]>([]);
  const [loading, setLoading] = useState(false);

  const [filteredData, setFilteredData] = useState<SinkingFund[]>([]);

  const [month, setMonth] = useState<string | undefined>();
  const [year, setYear] = useState<number | undefined>();

  const societyId = Number(sessionStorage.getItem("societyId"));

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/sinking-fund?societyId=${societyId}`,
      );

      setData(res.data || []);
      setFilteredData(res.data || []);
    } catch (error) {
      message.error("Failed to load sinking fund");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  applyFilter();
}, [month, year]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!month && !year) {
      setFilteredData(data);
    }
  }, [month, year, data]);

  const applyFilter = () => {
    let filtered = [...data];

    if (month) {
      filtered = filtered.filter((item) => item.month === month);
    }

    if (year) {
      filtered = filtered.filter((item) => item.year === year);
    }

    setFilteredData(filtered);
  };

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      title: "Flat",
      dataIndex: "flatNo",
      key: "flat",
    },
    {
      title: "Member",
      dataIndex: "memberName",
      key: "memberName",
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
      title: "Amount",
      dataIndex: "amount",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: string) => (
        <span
          style={{
            color:
              text === "PAID" ? "green" : text === "PENDING" ? "orange" : "red",
          }}
        >
          {text}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Card title="View Sinking Fund">
        {/* FILTER SECTION */}
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            placeholder="Month"
            style={{ width: 150 }}
            // onChange={(value) => setMonth(value)}
            onChange={(value) => {
              setMonth(value || undefined);
            }}
            allowClear
          >
            {[
              "JANUARY",
              "FEBRUARY",
              "MARCH",
              "APRIL",
              "MAY",
              "JUNE",
              "JULY",
              "AUGUST",
              "SEPTEMBER",
              "OCTOBER",
              "NOVEMBER",
              "DECEMBER",
            ].map((m) => (
              <Select.Option key={m} value={m}>
                {m}
              </Select.Option>
            ))}
          </Select>

          <InputNumber
            placeholder="Year"
            onChange={(value) => {
            setYear(typeof value === "number" ? value : undefined);
            }}
          />
        </Space>

        {/* TABLE */}
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default ViewSinkingFund;

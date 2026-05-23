import React, { useState } from "react";
import { Button, Select, Input, message, Card, Table } from "antd";
import axios from "axios";

const { Option } = Select;

const BillingGenerate = () => {
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const societyId = sessionStorage.getItem("societyId");

  const generateBills = async () => {
    if (!month || !year) {
      message.error("Please select month and year");
      return;
    }

    // try {
    //   setLoading(true);

    //   await axios.post("http://localhost:8080/api/billing/generate", {
    //     societyId: societyId,
    //     month: month,
    //     year: year,
    //   });

    //   message.success("Bills generated successfully");
    // } catch (error) {
    //   message.error("Error generating bills");
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <Card title="Generate Monthly Bills">

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>

        <Select
          placeholder="Select Month"
          style={{ width: 150 }}
          onChange={(value) => setMonth(value)}
        >
          <Option value="JANUARY">JANUARY</Option>
          <Option value="FEBRUARY">FEBRUARY</Option>
          <Option value="MARCH">MARCH</Option>
          <Option value="APRIL">APRIL</Option>
          <Option value="MAY">MAY</Option>
          <Option value="JUNE">JUNE</Option>
          <Option value="JULY">JULY</Option>
          <Option value="AUGUST">AUGUST</Option>
          <Option value="SEPTEMBER">SEPTEMBER</Option>
          <Option value="OCTOBER">OCTOBER</Option>
          <Option value="NOVEMBER">NOVEMBER</Option>
          <Option value="DECEMBER">DECEMBER</Option>
        </Select>

        <Input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={{ width: 120 }}
        />

        <Button
          type="primary"
          loading={loading}
          onClick={generateBills}
        >
          Generate Bills
        </Button>

      </div>

    </Card>
  );
};

export default BillingGenerate;
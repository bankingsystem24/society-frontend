import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Radio,
  DatePicker,
  Button,
  Select,
  Table,
  Typography,
  Divider,
  Tag,
  Col,
  Row,
} from "antd";
import dayjs from "dayjs";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;
const { Title, Text } = Typography;
type ContributionType = "COMPULSORY" | "VOLUNTARY";
type CompulsoryMode = "FLAT" | "AREA";

type Member = {
  id: number;
  name: string;
  flatNo: string;
  areaSqft: number;
};

type Contribution = {
  id: number;
  name: string;
  amount: number;
  flatNo: string;
  areaSqFt: number;
  status: string;
  dueDate: string;
  date: string;
  mode: string;
  societyId: number;
  memberId: number;
};

const ContributionPage: React.FC = () => {
  const [type, setType] = useState<ContributionType>("COMPULSORY");
  const [mode, setMode] = useState<CompulsoryMode>("FLAT");
  const [name, setName] = useState("");
  const [date, setDate] = useState(dayjs());
  const [dueDate, setDueDate] = useState<any>(null);
  const [flatAmount, setFlatAmount] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [minAmount, setMinAmount] = useState<number>(0);
  const userId = Number(sessionStorage.getItem("userId"));
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(false);
  const societyId = Number(sessionStorage.getItem("societyId"));
  const financialYearId = Number(sessionStorage.getItem("financialYearId"));

  useEffect(() => {
    if (type === "COMPULSORY") {
      fetchCompulsoryContributions();
    }
  }, [type]);

const clearForm = () => {
  setName("");
  setDate(dayjs());
  setDueDate(null);
  setFlatAmount(0);
  setRate(0);
  setDescription("");
  setMinAmount(0);
  setMode("FLAT");
};

const total = useMemo(() => {
  if (!Array.isArray(contributions)) return 0;

  return contributions.reduce((sum, item) => {
    return sum + Number(item.amount || 0);
  }, 0);
}, [contributions]);


  const fetchCompulsoryContributions = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/contribution/compulsory/${societyId}/${financialYearId}`,
      );
      setContributions(res.data);
    } catch (err) {
      console.error("Error fetching contributions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    const payload = {
      type: type,
      name: name,
      date: date?.format("YYYY-MM-DD"),
      dueDate: dueDate?.format("YYYY-MM-DD"),
      mode: mode,
      flatAmount: flatAmount,
      rate: rate,
      description: description,
      minAmount: minAmount,
      userId: userId,
    };
    if (type === "COMPULSORY") {
      if (mode === "AREA") {
        const cres = await axios.post(
          `${BASE_URL}/contribution/compulsory/${societyId}/${financialYearId}`,
          payload,
        );
        alert("Contribution generated successfully!");
        fetchCompulsoryContributions();
      } else if (mode === "FLAT") {
        const cres = await axios.post(
          `${BASE_URL}/contribution/compulsory/${societyId}/${financialYearId}`,
          payload,
        );
        alert("Contribution generated successfully!");
        fetchCompulsoryContributions();
      }
    } else if (type === "VOLUNTARY") {
      const vres = await axios.post(
        `${BASE_URL}/contribution/voluntary/${societyId}/${financialYearId}`,
        payload,
      );
        alert("Contribution generated successfully!");
        fetchCompulsoryContributions();
    }
    clearForm();
  };

  return (
    <div style={{ padding: 10 }}>
      {/* FORM SECTION */}
      <Card title="Create Contribution" style={{ marginBottom: 20 }}>
        <Form layout="vertical">
          {/* ROW 1 - TYPE ONLY */}
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card size="small" bordered>
                <Form.Item
                  label="Contribution Type"
                  style={{ marginBottom: 0 }}
                >
                  <Radio.Group
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <Radio value="COMPULSORY">Compulsory</Radio>
                    <Radio value="VOLUNTARY">Voluntary</Radio>
                  </Radio.Group>
                </Form.Item>
              </Card>
            </Col>
          </Row>

          {/* ROW 2 - MAIN FIELDS */}
          <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
            {/* LEFT */}
            <Col xs={24} md={8}>
              <Card size="small" bordered>
                <Form.Item label="Contribution for...">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ganesh Utsav Fund"
                  />
                </Form.Item>

                <Form.Item label="Generation Date">
                  <DatePicker
                    style={{ width: "100%" }}
                    onChange={(d) => setDate(d)}
                    defaultValue={date || dayjs}
                    format="DD-MM-YYYY"
                  />
                </Form.Item>
              </Card>
            </Col>

            {/* MIDDLE */}
            <Col xs={24} md={8}>
              <Card size="small" bordered>
                <Form.Item label="Due Date">
                  <DatePicker
                    style={{ width: "100%" }}
                    onChange={(d) => setDueDate(d)}
                  />
                </Form.Item>

                {type === "COMPULSORY" && (
                  <Form.Item label="Mode">
                    <Select
                      value={mode}
                      onChange={(v) => setMode(v)}
                      options={[
                        { value: "FLAT", label: "Flat Amount" },
                        { value: "AREA", label: "Area Based (per sqft)" },
                      ]}
                    />
                  </Form.Item>
                )}
              </Card>
            </Col>

            {/* RIGHT */}
            <Col xs={24} md={8}>
              <Card size="small" bordered>
                {type === "COMPULSORY" ? (
                  mode === "FLAT" ? (
                    <Form.Item label="Flat Amount">
                      <InputNumber
                        style={{ width: "100%" }}
                        value={flatAmount}
                        onChange={(v) => setFlatAmount(v || 0)}
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item label="Rate per Sqft">
                      <InputNumber
                        style={{ width: "100%" }}
                        value={rate}
                        onChange={(v) => setRate(v || 0)}
                      />
                    </Form.Item>
                  )
                ) : (
                  <>
                    <Form.Item label="Description">
                      <Input.TextArea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Form.Item>

                    <Form.Item label="Minimum Amount">
                      <InputNumber
                        style={{ width: "100%" }}
                        value={minAmount}
                        onChange={(v) => setMinAmount(v || 0)}
                      />
                    </Form.Item>
                  </>
                )}

                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={handleGenerate}
                >
                  Generate Contribution
                </Button>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* PREVIEW SECTION BELOW FORM */}
      <div style={{ marginTop: 20 }}>
        <Card
          title={
            <>
              Preview{" "}
              {type === "COMPULSORY" ? (
                <Tag color="red">Compulsory</Tag>
              ) : (
                <Tag color="green">Voluntary</Tag>
              )}
            </>
          }
        >
          {type === "COMPULSORY" ? (
            <>
              <Title level={5}>Member-wise Calculation</Title>

              <Text>Total Estimated Collection: </Text>
              <Text strong>₹{total}</Text>

              <Divider />

              <Table
                dataSource={contributions}
                rowKey="id"
                size="small"
                columns={[
                  { title: "Name", dataIndex: "name" },
                  { title: "Flat No", dataIndex: "flatNo" },
                  { title: "Area", dataIndex: "areaSqFt" },
                  { title: "Amount", dataIndex: "amount" },
                  { title: "Status", dataIndex: "status" },
                  { title: "Due Date", dataIndex: "dueDate" },
                ]}
              />
            </>
          ) : (
            <>
              <Title level={5}>{name || "Voluntary Contribution"}</Title>

              <p>{description || "No description added"}</p>

              <Divider />

              <p>
                <b>Minimum Amount:</b> ₹{minAmount}
              </p>

              <p>Members can contribute any amount voluntarily.</p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ContributionPage;

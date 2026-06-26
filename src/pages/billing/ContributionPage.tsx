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
  message,
} from "antd";
import dayjs from "dayjs";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;
const { Title, Text } = Typography;
type ContributionType = "COMPULSORY" | "VOLUNTARY";
type CompulsoryMode = "FLAT" | "AREA";

type Contribution = {
  id: number;
  name: string;
  type: string;
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
  const [glAccounts, setGlAccounts] = useState<any[]>([]);
  const [selectedGlReceivable, setSelectedGlReceivable] = useState<
    number | null
  >(null);
  const [creditAccounts, setCreditAccounts] = useState<any[]>([]);
  const [selectedGlCreditAccount, setSelectedGlCreditAccount] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (type === "COMPULSORY") {
      fetchContributions();
    }
    fetchGlAccounts();
  }, []);

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

  const filteredContributions = useMemo(() => {
    return contributions.filter((item) => item.mode && item.type === type);
  }, [contributions, type]);

  const total = useMemo(() => {
    if (!Array.isArray(contributions)) return 0;

    return contributions.reduce((sum, item) => {
      return sum + Number(item.amount || 0);
    }, 0);
  }, [contributions]);

  const fetchGlAccounts = async () => {
    try {
      setLoading(true);

      const glres = await axios.get(
        `${BASE_URL}/gl/master?societyId=${societyId}`,
      );

      const filteredgl = glres.data.filter((x: any) =>
        x.accountName?.toLowerCase().includes("receivable"),
      );
      setGlAccounts(filteredgl);
      const filteredglcredit = glres.data.filter((x: any) =>
        x.groupName?.toLowerCase().includes("reserves"),
      );
      setCreditAccounts(filteredglcredit);
    } catch (err) {
      console.error("Error fetching Gl Accounts", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContributions = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/contribution/${societyId}/${financialYearId}`,
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
      glReceivable: selectedGlReceivable,
      glCreditAccount: selectedGlCreditAccount,
    };
    try {
      if (type === "COMPULSORY") {
        await axios.post(
          `${BASE_URL}/contribution/compulsory/${societyId}/${financialYearId}`,
          payload,
        );
      } else {
        await axios.post(
          `${BASE_URL}/contribution/voluntary/${societyId}/${financialYearId}`,
          payload,
        );
      }

      message.success("Contribution generated successfully!");
      fetchContributions();
      clearForm();
    } catch (error: any) {
      console.error(error);
      message.error(
        error?.response?.data?.message || "Failed to generate contribution",
      );
    }

    clearForm();
  };

  return (
    <div style={{ padding: 10 }}>
      {/* FORM SECTION */}
      {/* <Card title="Create Contribution" style={{ marginBottom: 20 }}> */}
      <Form layout="vertical">
        {/* ROW 1 - TYPE ONLY */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card size="small" variant="outlined">
              <Form.Item label="Contribution Type" style={{ marginBottom: 0 }}>
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
        <Row gutter={[16, 16]} style={{ marginBottom: "-5px" }}>
          <Col xs={24} md={8}>
            <Form.Item label="Receivable GL">
              <Select
                placeholder="Select Receivable GL"
                value={selectedGlReceivable}
                onChange={(value) => setSelectedGlReceivable(value)}
                options={glAccounts.map((gl: any) => ({
                  value: gl.glCode,
                  label: `${gl.glCode} - ${gl.accountName}`,
                }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item label="Credit Account">
              <Select
                placeholder="Select Credit A/c GL"
                value={selectedGlCreditAccount}
                onChange={(value) => setSelectedGlCreditAccount(value)}
                options={creditAccounts.map((gl: any) => ({
                  value: gl.glCode,
                  label: `${gl.glCode} - ${gl.accountName}`,
                }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item label="Contribution For">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Painting Fund"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginBottom: "-5px" }}>
          <Col xs={24} md={8}>
            <Form.Item label="Generation Date">
              <DatePicker
                style={{ width: "100%" }}
                value={date}
                onChange={(d) => setDate(d ?? dayjs())}
                format="DD-MM-YYYY"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item label="Due Date">
              <DatePicker
                style={{ width: "100%" }}
                value={dueDate}
                onChange={(d) => setDueDate(d)}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
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
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          {type === "COMPULSORY" ? (
            <>
              <Col xs={24} md={8}>
                {mode === "FLAT" ? (
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
                )}
              </Col>

              <Col xs={24} md={8} />

              <Col xs={24} md={8}>
                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={handleGenerate}
                  style={{ marginTop: 30 }}
                >
                  Generate Contribution
                </Button>
              </Col>
            </>
          ) : (
            <>
              <Col xs={24} md={8}>
                <Form.Item label="Description">
                  <Input.TextArea
                    rows={1}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item label="Minimum Amount">
                  <InputNumber
                    style={{ width: "100%" }}
                    value={minAmount}
                    onChange={(v) => setMinAmount(v || 0)}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={handleGenerate}
                  style={{ marginTop: 30 }}
                >
                  Generate Contribution
                </Button>
              </Col>
            </>
          )}
        </Row>
      </Form>
      {/* </Card> */}

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
          <>
            <Title level={5}>Member-wise Calculation</Title>

            <Text>Total Estimated Collection: </Text>
            <Text strong>₹{total}</Text>

            <Divider />

            <Table
              dataSource={filteredContributions}
              rowKey="id"
              size="small"
              scroll={{ x: "max-content" }}
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
        </Card>
      </div>
    </div>
  );
};

export default ContributionPage;

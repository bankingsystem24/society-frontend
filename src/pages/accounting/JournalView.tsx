import React, { useEffect, useState } from "react";
import { Table, Card, Typography, message, Tag, Row, Col } from "antd";

import axios from "axios";
import dayjs from "dayjs";

const { Title } = Typography;

interface JournalData {
  journalId: number;
  voucherNo: string;
  voucherType: string;
  entryDate: string;
  narration: string;
  glCode: number;
  accountHead: string;
  debitAmount: number;
  creditAmount: number;
}

const JournalView: React.FC = () => {
  const [data, setData] = useState<JournalData[]>([]);

  const [loading, setLoading] = useState(false);

  const societyId = sessionStorage.getItem("societyId");

  useEffect(() => {
    fetchJournal();
  }, []);

  // =====================================================
  // FETCH JOURNAL
  // =====================================================

  const fetchJournal = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:7777/api/journal/${societyId}`,
      );

      setData(response.data);
    } catch (error) {
      console.error(error);

      message.error("Failed to load journal data");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // TABLE COLUMNS
  // =====================================================

  const columns = [
    // HIDDEN COLUMN
    {
      title: "Journal ID",
      dataIndex: "journalId",
      key: "journalId",
      hidden: true,
    },

    {
      title: "Voucher No",
      dataIndex: "voucherNo",
      key: "voucherNo",
      width: 100,
    },

    {
      title: "Type",
      dataIndex: "voucherType",
      key: "voucherType",
      width: 110,

      render: (type: string) => {
        let color = "blue";

        if (type === "RECEIPT") color = "green";

        if (type === "PAYMENT") color = "red";

        if (type === "BILL") color = "orange";

        return <Tag color={color}>{type}</Tag>;
      },
    },

    {
      title: "Date",
      dataIndex: "entryDate",
      key: "entryDate",
      width: 130,

      render: (date: string) => dayjs(date).format("DD-MMM-YYYY"),
    },

    {
      title: "Narration",
      dataIndex: "narration",
      key: "narration",
      width:200
    },

    {
      title: "GL Code",
      dataIndex: "glCode",
      key: "glCode",
      width: 110,
    },

    {
      title: "Account Head",
      dataIndex: "accountHead",
      key: "accountHead",
      width: 150,
    },

    {
      title: "Debit",
      dataIndex: "debitAmount",
      key: "debitAmount",
      width: 100,

      align: "right" as const,

      render: (value: number) =>
        value > 0
          ? value.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })
          : "-",
    },

    {
      title: "Credit",
      dataIndex: "creditAmount",
      key: "creditAmount",
      width: 100,

      align: "right" as const,

      render: (value: number) =>
        value > 0
          ? value.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })
          : "-",
    },
  ].filter((item: any) => !item.hidden);

  // =====================================================
  // TOTALS
  // =====================================================

  const totalDebit = data.reduce((sum, row) => sum + (row.debitAmount || 0), 0);

  const totalCredit = data.reduce(
    (sum, row) => sum + (row.creditAmount || 0),
    0,
  );

  return (
    <Card style={{ margin: 10 }}>
      {/* HEADER */}

      <Row justify="space-between" align="middle">
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Journal View
          </Title>
        </Col>

        <Col>
          <div style={{ fontWeight: 600 }}>
            Debit :{" "}
            {totalDebit.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
            {" | "}
            Credit :{" "}
            {totalCredit.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </div>
        </Col>
      </Row>

      <br />

      {/* TABLE */}

      <Table
        bordered
        size="small"
        loading={loading}
        columns={columns}
        dataSource={data}
        scroll={{ x: 1200 }}
        rowKey={(record) =>
          `${record.journalId}-${record.glCode}-${record.accountHead}`
        }
        pagination={{
          pageSize: 15,
        }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={6}>
              <b>Total</b>
            </Table.Summary.Cell>

            <Table.Summary.Cell index={1} align="right">
              <b>
                {totalDebit.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </b>
            </Table.Summary.Cell>

            <Table.Summary.Cell index={2} align="right">
              <b>
                {totalCredit.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </b>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </Card>
  );
};

export default JournalView;

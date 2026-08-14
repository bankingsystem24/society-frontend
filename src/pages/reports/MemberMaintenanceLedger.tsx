import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  Input,
  Select,
  Tag,
  Card,
  Space,
  Typography,
  Button,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

interface MemberMaintenanceTransaction {
  billingId: number;
  receiptId?: number | null;
  receiptNo?: string | null;

  flatNo?: string | null;

  billType?: string | null;
  month?: string | null;
  year?: number | null;

  maintenanceAmount: number;
  interestAmount: number;
  discountAmount: number;

  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;

  status?: string | null;

  paymentDate?: string | null;
  paymentMode?: string | null;
}

interface Member {
  id: number;
  name: string;
  flatNo?: string | null;
  mobile?: string | null;
}

const MemberMaintenanceLedger: React.FC = () => {
  const [transactions, setTransactions] = useState<
    MemberMaintenanceTransaction[]
  >([]);

  const [filteredTransactions, setFilteredTransactions] = useState<
    MemberMaintenanceTransaction[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [monthFilter, setMonthFilter] = useState<string>("ALL");

  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(
    null
  );
  const [memberLoading, setMemberLoading] = useState(false);

  // Print report reference
  const reportRef = useRef<HTMLDivElement>(null);

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  const societyId = sessionStorage.getItem("societyId");
  const financialYearId = sessionStorage.getItem("financialYearId");

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchText, statusFilter, monthFilter]);

  const loadMembers = async () => {
    try {
      setMemberLoading(true);

      const response = await api.get("/members", {
        params: {
          societyId,
        },
      });

      setMembers(response.data || []);
    } catch (error) {
      console.error("Error loading members:", error);
      message.error("Failed to load members");
    } finally {
      setMemberLoading(false);
    }
  };

  const handleMemberChange = (memberId: number) => {
    setSelectedMemberId(memberId);

    // Clear previous member's data immediately
    setTransactions([]);
    setSearchText("");
    setStatusFilter("ALL");
    setMonthFilter("ALL");

    loadLedger(memberId);
  };

  const loadLedger = async (memberId: number) => {
    try {
      setLoading(true);

      const response = await api.get("/billing/member-transactions", {
        params: {
          societyId,
          financialYearId,
          memberId,
        },
      });

      const data = (response.data || []).sort(
        (
          a: MemberMaintenanceTransaction,
          b: MemberMaintenanceTransaction
        ) => (a.status || "").localeCompare(b.status || "")
      );
      setTransactions(data);
    } catch (error) {
      console.error("Error loading maintenance ledger:", error);
    //   message.error("Failed to load maintenance ledger");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let data = [...transactions];

    if (searchText.trim()) {
      const search = searchText.toLowerCase();

      data = data.filter((item) =>
        [
          item.flatNo,
          item.receiptNo,
          item.paymentMode,
          item.month,
          item.billType,
          item.status,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(search)
          )
      );
    }

    if (statusFilter !== "ALL") {
      data = data.filter(
        (item) =>
          item.status?.toUpperCase() === statusFilter.toUpperCase()
      );
    }

    if (monthFilter !== "ALL") {
      data = data.filter(
        (item) =>
          item.month?.toUpperCase() === monthFilter.toUpperCase()
      );
    }

    setFilteredTransactions(data);
  };

  const formatAmount = (value?: number | null) => {
    return `₹ ${(value ?? 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date?: string | null) => {
    if (!date) {
      return "-";
    }

    return dayjs(date).format("DD-MM-YYYY");
  };

  const getStatusTag = (status?: string | null) => {
    const value = status?.toUpperCase() || "PENDING";

    switch (value) {
      case "PAID":
        return <Tag color="green">PAID</Tag>;

      case "PARTIAL":
      case "PARTIALLY_PAID":
        return <Tag color="orange">PARTIAL</Tag>;

      case "PENDING":
        return <Tag color="red">PENDING</Tag>;

      case "CANCELLED":
        return <Tag color="default">CANCELLED</Tag>;

      default:
        return <Tag>{value}</Tag>;
    }
  };

  const columns: ColumnsType<MemberMaintenanceTransaction> = [
    {
      title: "Sr.",
      key: "sr",
      width: 40,
      render: (_value, _record, index) => index + 1,
    },

    {
      title: "Flat",
      dataIndex: "flatNo",
      key: "flatNo",
      width: 70,
      sorter: (a, b) =>
        (a.flatNo || "").localeCompare(b.flatNo || ""),
    },

    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      width: 80,
    },

    {
      title: "Year",
      dataIndex: "year",
      key: "year",
      width: 60,
    },

    {
      title: "Bill Type",
      dataIndex: "billType",
      key: "billType",
      width: 120,
    },

    {
      title: "Maintenance",
      dataIndex: "maintenanceAmount",
      key: "maintenanceAmount",
      align: "right",
      width: 100,
      render: (value) => formatAmount(value),
    },

    {
      title: "Interest",
      dataIndex: "interestAmount",
      key: "interestAmount",
      align: "right",
      width: 100,
      render: (value) => formatAmount(value),
    },

    {
      title: "Discount",
      dataIndex: "discountAmount",
      key: "discountAmount",
      align: "right",
      width: 100,
      render: (value) => formatAmount(value),
    },

    {
      title: "Paid",
      dataIndex: "paidAmount",
      key: "paidAmount",
      align: "right",
      width: 100,
      render: (value) => (
        <span style={{ color: "#389e0d" }}>
          {formatAmount(value)}
        </span>
      ),
    },

    {
      title: "Pending",
      dataIndex: "pendingAmount",
      key: "pendingAmount",
      align: "right",
      width: 100,
      render: (value) => (
        <span style={{ color: "#cf1322" }}>
          {formatAmount(value)}
        </span>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => getStatusTag(status),
    },

    {
      title: "Receipt No",
      dataIndex: "receiptNo",
      key: "receiptNo",
      width: 130,
      render: (receiptNo) => {
        if (!receiptNo) {
          return "-";
        }

        return (
          <strong style={{ color: "#1677ff" }}>
            {receiptNo}
          </strong>
        );
      },
    },

    {
      title: "Payment Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      width: 100,
      render: (date) => formatDate(date),
    },

    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
      key: "paymentMode",
      width: 100,
      render: (mode) => mode || "-",
    },
  ];

  const totalAmount = filteredTransactions.reduce(
    (sum, item) => sum + (item.maintenanceAmount || 0),
    0
  );

  const totalPaid = filteredTransactions.reduce(
    (sum, item) => sum + (item.paidAmount || 0),
    0
  );

  const totalDiscount = filteredTransactions.reduce(
    (sum, item) => sum + (item.discountAmount || 0),
    0
  );

  const totalPending = filteredTransactions.reduce(
    (sum, item) => sum + (item.pendingAmount || 0),
    0
  );

  const interestAmount = filteredTransactions.reduce(
    (sum, item) => sum + (item.interestAmount || 0),
    0
  );

  // =========================
  // PRINT
  // =========================
 const handlePrint = () => {
  const printContents = reportRef.current?.innerHTML;

  if (!printContents) {
    message.warning("No data available to print");
    return;
  }

  const selectedMember = members.find(
    (member) => member.id === selectedMemberId
  );

  const memberName = selectedMember?.name || "";
  const flatNo = selectedMember?.flatNo || "";

  const printWindow = window.open(
    "",
    "_blank",
    "width=1200,height=800"
  );

  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Member Maintenance Ledger</title>

          <style>

            @page {
              size: landscape;
              margin: 10mm 30mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              color: #000;
            }

            .print-header {
              text-align: center;
              margin-bottom: 15px;
            }

            .print-header h2 {
              margin: 0 0 5px 0;
            }

            .member-info {
              text-align: center;
              margin-bottom: 15px;
              font-size: 14px;
            }

            /* =========================
               TABLE
            ========================= */

            table {
              width: 100% !important;
              border-collapse: collapse !important;
              font-size: 9px;
              table-layout: auto !important;
            }

            table,
            th,
            td {
              border: 1px solid #000 !important;
            }

            th,
            td {
              padding: 4px !important;
              text-align: left;
              white-space: normal !important;
              word-break: break-word !important;
            }

            th {
              background: #f5f5f5 !important;
              font-weight: bold;
            }

            /* =========================
               ANT DESIGN
            ========================= */

            .ant-card {
              border: none !important;
              box-shadow: none !important;
            }

            .ant-card-body {
              padding: 0 !important;
            }

            .ant-table {
              width: 100% !important;
            }

            .ant-table-container {
              width: 100% !important;
              border: none !important;
              overflow: visible !important;
            }

            .ant-table-content {
              width: 100% !important;
              overflow: visible !important;
              overflow-x: visible !important;
              overflow-y: visible !important;
            }

            .ant-table-body {
              width: 100% !important;
              height: auto !important;
              max-height: none !important;
              overflow: visible !important;
              overflow-x: visible !important;
              overflow-y: visible !important;
            }

            /* Remove Ant Design sticky scrollbar */
            .ant-table-sticky-scroll {
              display: none !important;
            }

            .ant-table-sticky-scroll-bar {
              display: none !important;
            }

            /* Remove pagination */
            .ant-table-pagination {
              display: none !important;
            }

            /* Remove sorter/filter visual elements */
            .ant-table-column-sorters::after {
              display: none !important;
            }

            /* Tags */
            .ant-tag {
              border: none !important;
              background: transparent !important;
              color: #000 !important;
              padding: 0 !important;
              margin: 0 !important;
            }

            /* Remove shadows */
            .ant-table-container {
              box-shadow: none !important;
            }

            /* =========================
               PRINT
            ========================= */

            @media print {

              body {
                margin: 0;
                padding: 0;
              }

              .ant-table {
                width: 100% !important;
              }

              .ant-table-container,
              .ant-table-content,
              .ant-table-body {
                overflow: visible !important;
                height: auto !important;
                max-height: none !important;
              }

              .ant-table-sticky-scroll,
              .ant-table-sticky-scroll-bar,
              .ant-table-pagination {
                display: none !important;
              }

              table {
                width: 100% !important;
                table-layout: auto !important;
              }
            }

          </style>
        </head>

        <body>

          <div class="print-header">
            <h2>Member Maintenance Ledger</h2>
          </div>

          <div class="member-info">
            <strong>Member:</strong> ${memberName}
            ${
              flatNo
                ? ` &nbsp;&nbsp; <strong>Flat:</strong> ${flatNo}`
                : ""
            }
          </div>

          ${printContents}

        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
};

  return (
    <div style={{ padding: 5 }}>
      <Card>
        <Space
          direction="vertical"
          size="medium"
          style={{ width: "100%" }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 5,
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              Member Maintenance Ledger
            </Title>

            <Space>
              <Button
                type="primary"
                onClick={() => {
                  if (selectedMemberId) {
                    loadLedger(selectedMemberId);
                  }
                }}
                loading={loading}
                disabled={!selectedMemberId}
              >
                Refresh
              </Button>

              <Button
                danger
                onClick={handlePrint}
                disabled={filteredTransactions.length === 0}
              >
                Print
              </Button>
            </Space>
          </div>

          {/* Filters */}
          <div
            style={{
              display: "flex",
              gap: 5,
              flexWrap: "wrap",
            }}
          >
            <Select
              showSearch
              allowClear
              placeholder="Select Member"
              value={selectedMemberId}
              loading={memberLoading}
              onChange={handleMemberChange}
              optionFilterProp="label"
              style={{ width: 320 }}
              options={members.map((member) => ({
                value: member.id,
                label: `${member.name}${
                  member.flatNo ? ` - ${member.flatNo}` : ""
                }`,
              }))}
            />

            <Input
              placeholder="Search Flat / Receipt / Month..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 280 }}
            />

            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 160 }}
            >
              <Option value="ALL">All Status</Option>
              <Option value="PAID">Paid</Option>
              <Option value="PARTIAL">Partial</Option>
              <Option value="PENDING">Pending</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>

            <Select
              value={monthFilter}
              onChange={setMonthFilter}
              style={{ width: 160 }}
            >
              <Option value="ALL">All Months</Option>
              <Option value="APRIL">April</Option>
              <Option value="MAY">May</Option>
              <Option value="JUNE">June</Option>
              <Option value="JULY">July</Option>
              <Option value="AUGUST">August</Option>
              <Option value="SEPTEMBER">September</Option>
              <Option value="OCTOBER">October</Option>
              <Option value="NOVEMBER">November</Option>
              <Option value="DECEMBER">December</Option>
              <Option value="JANUARY">January</Option>
              <Option value="FEBRUARY">February</Option>
              <Option value="MARCH">March</Option>
            </Select>
          </div>

          {/* Printable Report */}
          <div ref={reportRef}>
            {/* Summary */}
            <div
              style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 5,
              }}
            >
              <Card
                size="small"
                style={{ minWidth: 180 }}
              >
                <div>Maintenance</div>
                <strong>
                  {formatAmount(totalAmount)}
                </strong>
              </Card>

              <Card
                size="small"
                style={{ minWidth: 180 }}
              >
                <div>Paid</div>
                <strong style={{ color: "#389e0d" }}>
                  {formatAmount(totalPaid)}
                </strong>
              </Card>

              <Card
                size="small"
                style={{ minWidth: 180 }}
              >
                <div>Interest</div>
                <strong style={{ color: "#cf1322" }}>
                  {formatAmount(interestAmount)}
                </strong>
              </Card>

              <Card
                size="small"
                style={{ minWidth: 180 }}
              >
                <div>Discount</div>
                <strong style={{ color: "#389e0d" }}>
                  {formatAmount(totalDiscount)}
                </strong>
              </Card>

              <Card
                size="small"
                style={{ minWidth: 180 }}
              >
                <div>Pending</div>
                <strong style={{ color: "#cf1322" }}>
                  {formatAmount(totalPending)}
                </strong>
              </Card>
            </div>

            {/* Table */}
            <Table
            rowKey="billingId"
            columns={columns}
            dataSource={filteredTransactions}
            loading={loading}
            bordered
            size="small"
            scroll={{ x: "max-content" }}
            pagination={{
                pageSize: 5,
                showSizeChanger: true,
                showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total}`,
            }}
            />
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default MemberMaintenanceLedger;
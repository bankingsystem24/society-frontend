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

interface SocietyMaintenanceTransaction {
  billingId: number;
  receiptId?: number | null;
  receiptNo?: string | null;

  memberId?: number | null;
  memberName?: string | null;

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

const SocietyMaintenanceLedger: React.FC = () => {
  const [transactions, setTransactions] = useState<
    SocietyMaintenanceTransaction[]
  >([]);

  const [filteredTransactions, setFilteredTransactions] = useState<
    SocietyMaintenanceTransaction[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");

  const [members, setMembers] = useState<Member[]>([]);

  const reportRef = useRef<HTMLDivElement>(null);

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  const societyId = sessionStorage.getItem("societyId");
  const financialYearId = sessionStorage.getItem("financialYearId");

  useEffect(() => {
    loadSocietyLedger();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    transactions,
    searchText,
    statusFilter,
    monthFilter,
  ]);

  // ==========================================
  // LOAD ALL MEMBERS + ALL MEMBER TRANSACTIONS
  // ==========================================
  const loadSocietyLedger = async () => {
    try {
      setLoading(true);

      // Load all members
      const memberResponse = await api.get("/members", {
        params: {
          societyId,
        },
      });
      const memberList: Member[] = memberResponse.data || [];
      setMembers(memberList);
      const transactionResponses = await Promise.all(
        memberList.map(async (member) => {
          try {
            const response = await api.get(
              "/billing/member-transactions",
              {
                params: {
                  societyId,
                  financialYearId,
                  memberId: member.id,
                },
              }
            );

            return (response.data || []).map(
              (item: SocietyMaintenanceTransaction) => ({
                ...item,
                memberId: member.id,
                memberName: member.name,
                flatNo: item.flatNo || member.flatNo,
              })
            );
          } catch (error) {
            console.error(
              `Error loading transactions for member ${member.id}:`,
              error
            );

            return [];
          }
        })
      );

      const allTransactions = transactionResponses.flat();

      // Sort by flat number, year, month
const sortedData = allTransactions.sort(
  (
    a: SocietyMaintenanceTransaction,
    b: SocietyMaintenanceTransaction
  ) => {
    // 1. Sort by flat number
    const flatCompare = (a.flatNo || "").localeCompare(
      b.flatNo || ""
    );

    if (flatCompare !== 0) {
      return flatCompare;
    }

    // 2. Sort by bill type
    const billTypeCompare = (a.billType || "").localeCompare(
      b.billType || ""
    );

    if (billTypeCompare !== 0) {
      return billTypeCompare;
    }

    // 3. Sort by year
    const yearCompare = (a.year || 0) - (b.year || 0);

    if (yearCompare !== 0) {
      return yearCompare;
    }

    // 4. Sort by month
    return (a.month || "").localeCompare(b.month || "");
  }
);
      setTransactions(sortedData);
    } catch (error) {
      console.error(
        "Error loading society maintenance ledger:",
        error
      );

      message.error(
        "Failed to load society maintenance ledger"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FILTERS
  // ==========================================
  const applyFilters = () => {
    let data = [...transactions];

    if (searchText.trim()) {
      const search = searchText.toLowerCase();

      data = data.filter((item) =>
        [
          item.memberName,
          item.flatNo,
          item.receiptNo,
          item.paymentMode,
          item.month,
          item.billType,
          item.status,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(search)
          )
      );
    }

    if (statusFilter !== "ALL") {
      data = data.filter(
        (item) =>
          item.status?.toUpperCase() ===
          statusFilter.toUpperCase()
      );
    }

    if (monthFilter !== "ALL") {
      data = data.filter(
        (item) =>
          item.month?.toUpperCase() ===
          monthFilter.toUpperCase()
      );
    }

    setFilteredTransactions(data);
  };

  // ==========================================
  // FORMAT
  // ==========================================
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

  // ==========================================
  // TABLE COLUMNS
  // ==========================================
  const columns: ColumnsType<SocietyMaintenanceTransaction> = [
    {
      title: "Sr.",
      key: "sr",
      width: 45,
      render: (_value, _record, index) =>
        index + 1,
    },

    {
      title: "Member",
      dataIndex: "memberName",
      key: "memberName",
      width: 200,
    },

    {
      title: "Flat",
      dataIndex: "flatNo",
      key: "flatNo",
      width: 80,
      sorter: (a, b) =>
        (a.flatNo || "").localeCompare(
          b.flatNo || ""
        ),
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
      width: 105,
      render: (value) =>
        formatAmount(value),
    },

    {
      title: "Interest",
      dataIndex: "interestAmount",
      key: "interestAmount",
      align: "right",
      width: 100,
      render: (value) =>
        formatAmount(value),
    },

    {
      title: "Discount",
      dataIndex: "discountAmount",
      key: "discountAmount",
      align: "right",
      width: 100,
      render: (value) =>
        formatAmount(value),
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
      render: (status) =>
        getStatusTag(status),
    },

    {
      title: "Receipt No",
      dataIndex: "receiptNo",
      key: "receiptNo",
      width: 120,
      render: (receiptNo) =>
        receiptNo ? (
          <strong
            style={{ color: "#1677ff" }}
          >
            {receiptNo}
          </strong>
        ) : (
          "-"
        ),
    },

    {
      title: "Payment Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      width: 100,
      render: (date) =>
        formatDate(date),
    },

    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
      key: "paymentMode",
      width: 100,
      render: (mode) =>
        mode || "-",
    },
  ];

  // ==========================================
  // TOTALS
  // ==========================================
  const totalAmount =
    filteredTransactions.reduce(
      (sum, item) =>
        sum + (item.maintenanceAmount || 0),
      0
    );

  const totalPaid =
    filteredTransactions.reduce(
      (sum, item) =>
        sum + (item.paidAmount || 0),
      0
    );

  const totalDiscount =
    filteredTransactions.reduce(
      (sum, item) =>
        sum + (item.discountAmount || 0),
      0
    );

  const totalPending =
    filteredTransactions.reduce(
      (sum, item) =>
        sum + (item.pendingAmount || 0),
      0
    );

  const totalInterest =
    filteredTransactions.reduce(
      (sum, item) =>
        sum + (item.interestAmount || 0),
      0
    );

  // ==========================================
  // PRINT
  // ==========================================
const handlePrint = () => {
  if (filteredTransactions.length === 0) {
    message.warning("No data available to print");
    return;
  }

  // Group transactions by Member + Flat
  const groupedTransactions =
    filteredTransactions.reduce(
      (
        groups: Record<string, SocietyMaintenanceTransaction[]>,
        item
      ) => {
        const key = `${item.memberId || item.memberName || ""}_${item.flatNo || ""}`;

        if (!groups[key]) {
          groups[key] = [];
        }

        groups[key].push(item);

        return groups;
      },
      {}
    );

  const memberPages = Object.values(groupedTransactions)
    .map((memberTransactions, memberIndex) => {
      const firstRecord = memberTransactions[0];

      const memberName =
        firstRecord.memberName || "-";

      const flatNo =
        firstRecord.flatNo || "-";

      const memberMaintenance =
        memberTransactions.reduce(
          (sum, item) =>
            sum + (item.maintenanceAmount || 0),
          0
        );

      const memberPaid =
        memberTransactions.reduce(
          (sum, item) =>
            sum + (item.paidAmount || 0),
          0
        );

      const memberInterest =
        memberTransactions.reduce(
          (sum, item) =>
            sum + (item.interestAmount || 0),
          0
        );

      const memberDiscount =
        memberTransactions.reduce(
          (sum, item) =>
            sum + (item.discountAmount || 0),
          0
        );

      const memberPending =
        memberTransactions.reduce(
          (sum, item) =>
            sum + (item.pendingAmount || 0),
          0
        );

      const rows = memberTransactions
        .map(
          (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.month || "-"}</td>
              <td>${item.year || "-"}</td>
              <td>${item.billType || "-"}</td>

              <td class="amount">
                ${formatAmount(
                  item.maintenanceAmount
                )}
              </td>

              <td class="amount">
                ${formatAmount(
                  item.interestAmount
                )}
              </td>

              <td class="amount">
                ${formatAmount(
                  item.discountAmount
                )}
              </td>

              <td class="amount">
                ${formatAmount(
                  item.paidAmount
                )}
              </td>

              <td class="amount">
                ${formatAmount(
                  item.pendingAmount
                )}
              </td>

              <td>
                ${item.status || "-"}
              </td>

              <td>
                ${item.receiptNo || "-"}
              </td>

              <td>
                ${formatDate(
                  item.paymentDate
                )}
              </td>

              <td>
                ${item.paymentMode || "-"}
              </td>
            </tr>
          `
        )
        .join("");

      return `
        <div class="member-page">

          <div class="member-header">
            <h2>Society Maintenance Ledger</h2>

            <div class="member-details">
              <strong>Member:</strong>
              ${memberName}

              &nbsp;&nbsp;&nbsp;

              <strong>Flat No:</strong>
              ${flatNo}
            </div>
          </div>

          <div class="summary">

            <div class="summary-card">
              <span>Maintenance</span>
              <strong>
                ${formatAmount(
                  memberMaintenance
                )}
              </strong>
            </div>

            <div class="summary-card">
              <span>Interest</span>
              <strong>
                ${formatAmount(
                  memberInterest
                )}
              </strong>
            </div>

            <div class="summary-card">
              <span>Discount</span>
              <strong>
                ${formatAmount(
                  memberDiscount
                )}
              </strong>
            </div>

            <div class="summary-card">
              <span>Paid</span>
              <strong>
                ${formatAmount(
                  memberPaid
                )}
              </strong>
            </div>

            <div class="summary-card">
              <span>Pending</span>
              <strong>
                ${formatAmount(
                  memberPending
                )}
              </strong>
            </div>

          </div>

          <table>

            <thead>
              <tr>
                <th>Sr.</th>
                <th>Month</th>
                <th>Year</th>
                <th>Bill Type</th>
                <th>Maintenance</th>
                <th>Interest</th>
                <th>Discount</th>
                <th>Paid</th>
                <th>Pending</th>
                <th>Status</th>
                <th>Receipt No</th>
                <th>Payment Date</th>
                <th>Payment Mode</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>

          </table>

          <div class="member-footer">
            Total Transactions:
            <strong>
              ${memberTransactions.length}
            </strong>
          </div>

        </div>
      `;
    })
    .join("");

  const printWindow = window.open(
    "",
    "_blank",
    "width=1400,height=900"
  );

  if (!printWindow) {
    message.error(
      "Unable to open print window"
    );
    return;
  }

  printWindow.document.write(`
    <html>

      <head>

        <title>
          Society Maintenance Ledger
        </title>

        <style>

          @page {
            size: landscape;
            margin: 10mm 15mm;
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

          /*
           * IMPORTANT:
           * Every member gets a separate page.
           */
          .member-page {
            page-break-after: always;
            break-after: page;
            min-height: 100vh;
          }

          /*
           * Don't create an unnecessary blank page
           * after the last member.
           */
          .member-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }

          .member-header {
            text-align: center;
            margin-bottom: 15px;
          }

          .member-header h2 {
            margin: 0 0 8px 0;
            font-size: 20px;
          }

          .member-details {
            font-size: 14px;
          }

          .summary {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
          }

          .summary-card {
            border: 1px solid #999;
            padding: 7px 12px;
            min-width: 130px;
            font-size: 11px;
          }

          .summary-card span {
            display: block;
          }

          .summary-card strong {
            display: block;
            margin-top: 4px;
            font-size: 12px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: auto;
            font-size: 9px;
          }

          th,
          td {
            border: 1px solid #000;
            padding: 5px;
          }

          th {
            background: #f5f5f5;
            font-weight: bold;
            white-space: nowrap;
          }

          td {
            word-break: break-word;
          }

          .amount {
            text-align: right;
            white-space: nowrap;
          }

          .member-footer {
            margin-top: 12px;
            text-align: right;
            font-size: 11px;
          }

          /*
           * Prevent table rows from splitting.
           */
          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }

        </style>

      </head>

      <body>

        ${memberPages}

      </body>

    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};
  // ==========================================
  // REFRESH
  // ==========================================
  const handleRefresh = () => {
    loadSocietyLedger();
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
              gap: 8,
            }}
          >
            <Title
              level={4}
              style={{ margin: 0 }}
            >
              Society Maintenance Ledger
            </Title>

            <Space>

              <Button
                type="primary"
                onClick={handleRefresh}
                loading={loading}
              >
                Refresh
              </Button>

              <Button
                danger
                onClick={handlePrint}
                disabled={
                  filteredTransactions.length === 0
                }
              >
                Print
              </Button>

            </Space>
          </div>

          {/* Filters */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >

            <Input
              placeholder="Search Member / Flat / Receipt..."
              value={searchText}
              onChange={(e) =>
                setSearchText(
                  e.target.value
                )
              }
              allowClear
              style={{ width: 300 }}
            />

            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 160 }}
            >
              <Option value="ALL">
                All Status
              </Option>

              <Option value="PAID">
                Paid
              </Option>

              <Option value="PARTIAL">
                Partial
              </Option>

              <Option value="PENDING">
                Pending
              </Option>

              <Option value="CANCELLED">
                Cancelled
              </Option>
            </Select>

            <Select
              value={monthFilter}
              onChange={setMonthFilter}
              style={{ width: 160 }}
            >
              <Option value="ALL">
                All Months
              </Option>

              <Option value="APRIL">
                April
              </Option>

              <Option value="MAY">
                May
              </Option>

              <Option value="JUNE">
                June
              </Option>

              <Option value="JULY">
                July
              </Option>

              <Option value="AUGUST">
                August
              </Option>

              <Option value="SEPTEMBER">
                September
              </Option>

              <Option value="OCTOBER">
                October
              </Option>

              <Option value="NOVEMBER">
                November
              </Option>

              <Option value="DECEMBER">
                December
              </Option>

              <Option value="JANUARY">
                January
              </Option>

              <Option value="FEBRUARY">
                February
              </Option>

              <Option value="MARCH">
                March
              </Option>
            </Select>

          </div>

          {/* Summary */}
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
            }}
          >

            <Card
              size="small"
              style={{ minWidth: 180 }}
            >
              <div>Maintenance</div>
              <strong>
                {formatAmount(
                  totalAmount
                )}
              </strong>
            </Card>

            <Card
              size="small"
              style={{ minWidth: 180 }}
            >
              <div>Paid</div>
              <strong
                style={{
                  color: "#389e0d",
                }}
              >
                {formatAmount(
                  totalPaid
                )}
              </strong>
            </Card>

            <Card
              size="small"
              style={{ minWidth: 180 }}
            >
              <div>Interest</div>
              <strong
                style={{
                  color: "#cf1322",
                }}
              >
                {formatAmount(
                  totalInterest
                )}
              </strong>
            </Card>

            <Card
              size="small"
              style={{ minWidth: 180 }}
            >
              <div>Discount</div>
              <strong
                style={{
                  color: "#389e0d",
                }}
              >
                {formatAmount(
                  totalDiscount
                )}
              </strong>
            </Card>

            <Card
              size="small"
              style={{ minWidth: 180 }}
            >
              <div>Pending</div>
              <strong
                style={{
                  color: "#cf1322",
                }}
              >
                {formatAmount(
                  totalPending
                )}
              </strong>
            </Card>

          </div>

          {/* Table */}
          <div
            style={{
              width: "100%",
              overflowX: "auto",
            }}
          >
            <Table
              rowKey="billingId"
              columns={columns}
              dataSource={
                filteredTransactions
              }
              loading={loading}
              bordered
              size="small"
              scroll={{
                x: "max-content",
              }}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (
                  total,
                  range
                ) =>
                  `${range[0]}-${range[1]} of ${total}`,
              }}
            />
          </div>

        </Space>
      </Card>
    </div>
  );
};

export default SocietyMaintenanceLedger;
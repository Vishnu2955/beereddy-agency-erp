import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "../services/api";

export default function PaymentReport() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Fetch Payments
  const fetchPayments = async () => {
    try {
      setLoading(true);

      const res = await api.get("/payments");

      if (res.data.success) {
        setPayments(res.data.payments || []);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load payment report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const retailer =
        payment.retailer?.shopName ||
        payment.retailer?.fullName ||
        "";

      const matchesSearch =
        retailer.toLowerCase().includes(search.toLowerCase()) ||
        (payment.reference || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        (payment.status || "").toLowerCase() ===
          statusFilter.toLowerCase();

      const matchesMethod =
        methodFilter === "All" ||
        (payment.paymentMethod || "") === methodFilter;

      const paymentDate = new Date(payment.createdAt);

      const matchesFrom =
        !fromDate ||
        paymentDate >= new Date(fromDate);

      const matchesTo =
        !toDate ||
        paymentDate <=
          new Date(toDate + "T23:59:59");

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMethod &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [
    payments,
    search,
    statusFilter,
    methodFilter,
    fromDate,
    toDate,
  ]);

  // Summary
  const summary = useMemo(() => {
    const approved = filteredPayments.filter(
      (p) =>
        (p.status || "").toLowerCase() ===
        "approved"
    );

    const pending = filteredPayments.filter(
      (p) =>
        (p.status || "").toLowerCase() ===
        "pending"
    );

    const rejected = filteredPayments.filter(
      (p) =>
        (p.status || "").toLowerCase() ===
        "rejected"
    );

    return {
      totalPayments: filteredPayments.length,
      approvedPayments: approved.length,
      pendingPayments: pending.length,
      rejectedPayments: rejected.length,

      totalAmountReceived: approved.reduce(
        (sum, p) =>
          sum + Number(p.amount || 0),
        0
      ),
    };
  }, [filteredPayments]);

  const exportExcel = () => {
  try {
    alert("Excel button clicked");
    console.log("Excel button clicked");
    console.log("Summary:", summary);
    console.log("Payments:", filteredPayments);

    const workbook = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.aoa_to_sheet([
      ["Beereddy Agency ERP"],
      ["Payment Report"],
    ]);

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "test.xlsx"
    );

    console.log("Excel created successfully");
  } catch (err) {
    console.error("Excel Error:", err);
    alert(err.message);
  }
};

  

  const exportPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3">
          Loading Payment Report...
        </p>
      </div>
    );
  }

  return (    <div className="container-fluid py-4">

      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Payment Report
          </h2>

          <p className="text-muted mb-0">
            Beereddy Agency ERP
          </p>
        </div>

        <div className="d-flex gap-2">

          <button
            className="btn btn-success"
            onClick={exportExcel}
          >
            Export Excel
          </button>

          <button
            className="btn btn-danger"
            onClick={exportPDF}
          >
            Export PDF
          </button>

          <button
            className="btn btn-primary"
            onClick={() => window.print()}
          >
            Print
          </button>

          <button
            className="btn btn-outline-dark"
            onClick={fetchPayments}
          >
            Refresh
          </button>

        </div>

      </div>

      {/* Summary Cards */}

      <div className="row g-3 mb-4">

        <div className="col-md-3">

          <div className="card shadow border-0">

            <div className="card-body text-center">

              <h6>Total Payments</h6>

              <h2 className="fw-bold">
                {summary.totalPayments}
              </h2>

            </div>

          </div>

        </div>

        <div className="col-md-3">

          <div className="card shadow border-success">

            <div className="card-body text-center">

              <h6>Approved</h6>

              <h2 className="text-success">
                {summary.approvedPayments}
              </h2>

            </div>

          </div>

        </div>

        <div className="col-md-3">

          <div className="card shadow border-warning">

            <div className="card-body text-center">

              <h6>Pending</h6>

              <h2 className="text-warning">
                {summary.pendingPayments}
              </h2>

            </div>

          </div>

        </div>

        <div className="col-md-3">

          <div className="card shadow border-danger">

            <div className="card-body text-center">

              <h6>Rejected</h6>

              <h2 className="text-danger">
                {summary.rejectedPayments}
              </h2>

            </div>

          </div>

        </div>

      </div>

      <div className="alert alert-success fw-bold fs-5">

        Total Amount Received :
        ₹
        {summary.totalAmountReceived.toLocaleString("en-IN")}

      </div>

      {/* Filters */}

      <div className="card shadow mb-4">

        <div className="card-body">

          <div className="row g-3">

            <div className="col-md-3">

              <input
                type="text"
                className="form-control"
                placeholder="Search Retailer / Reference"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

            <div className="col-md-2">

              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option>All</option>
                <option>Approved</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>

            </div>

            <div className="col-md-2">

              <select
                className="form-select"
                value={methodFilter}
                onChange={(e) =>
                  setMethodFilter(e.target.value)
                }
              >
                <option>All</option>
                <option>Cash</option>
                <option>UPI</option>
                <option>Bank Transfer</option>
                <option>Cheque</option>
              </select>

            </div>

            <div className="col-md-2">

              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) =>
                  setFromDate(e.target.value)
                }
              />

            </div>

            <div className="col-md-2">

              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) =>
                  setToDate(e.target.value)
                }
              />

            </div>

            <div className="col-md-1 d-grid">

              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setMethodFilter("All");
                  setFromDate("");
                  setToDate("");
                }}
              >
                Reset
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Payment Table */}

      <div className="card shadow">

        <div className="card-header bg-dark text-white">

          <h5 className="mb-0">
            Payment History
          </h5>

        </div>

        <div className="table-responsive">

          <table className="table table-hover table-bordered align-middle mb-0">

            <thead className="table-dark">

              <tr>

                <th>Date</th>
                <th>Retailer</th>
                <th>Reference</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Receipt</th>

              </tr>

            </thead>

            <tbody>
                              {filteredPayments.length > 0 ? (

                filteredPayments.map((payment) => (

                  <tr key={payment._id}>

                    <td>
                      {new Date(
                        payment.createdAt
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td>
                      {payment.retailer?.shopName ||
                        payment.retailer?.fullName ||
                        "N/A"}
                    </td>

                    <td>
                      {payment.reference || "-"}
                    </td>

                    <td>
                      {payment.paymentMethod || "UPI"}
                    </td>

                    <td className="fw-bold text-success">
                      ₹
                      {Number(
                        payment.amount || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>

                      <span
                        className={`badge ${
                          (payment.status || "")
                            .toLowerCase() === "approved"
                            ? "bg-success"
                            : (payment.status || "")
                                .toLowerCase() ===
                              "rejected"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {payment.status
                          ? payment.status
                              .charAt(0)
                              .toUpperCase() +
                            payment.status
                              .slice(1)
                              .toLowerCase()
                          : "Pending"}
                      </span>

                    </td>

                    <td>

                      {payment.receiptImage ? (

                        <a
                          href={payment.receiptImage}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          View Receipt
                        </a>

                      ) : (

                        <span className="text-muted">
                          No Receipt
                        </span>

                      )}

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="7"
                    className="text-center py-4"
                  >
                    No Payment Records Found
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        <div className="card-footer bg-light">

          <div className="row text-center">

            <div className="col-md-4">

              <h6 className="mb-1">
                Total Records
              </h6>

              <h4>
                {filteredPayments.length}
              </h4>

            </div>

            <div className="col-md-4">

              <h6 className="mb-1">
                Approved Payments
              </h6>

              <h4 className="text-success">
                {summary.approvedPayments}
              </h4>

            </div>

            <div className="col-md-4">

              <h6 className="mb-1">
                Amount Received
              </h6>

              <h4 className="text-success">
                ₹
                {summary.totalAmountReceived.toLocaleString(
                  "en-IN"
                )}
              </h4>

            </div>

          </div>

        </div>

      </div>
            {/* Bottom Toolbar */}

      <div className="card shadow-sm mt-4">

        <div className="card-body">

          <div className="row align-items-center">

            <div className="col-md-6">

              <h6 className="mb-1">
                Payment Report Summary
              </h6>

              <small className="text-muted">
                Generated on{" "}
                {new Date().toLocaleString("en-IN")}
              </small>

            </div>

            <div className="col-md-6 text-md-end">

              <button
                className="btn btn-success me-2"
                onClick={exportExcel}
              >
                Export Excel
              </button>

              <button
                className="btn btn-danger me-2"
                onClick={exportPDF}
              >
                Export PDF
              </button>

              <button
                className="btn btn-primary"
                onClick={() => window.print()}
              >
                Print Report
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Report Statistics */}

      <div className="row mt-4">

        <div className="col-md-4">

          <div className="card border-success shadow-sm">

            <div className="card-body">

              <h6>Total Approved Amount</h6>

              <h3 className="text-success">
                ₹
                {summary.totalAmountReceived.toLocaleString(
                  "en-IN"
                )}
              </h3>

            </div>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card border-primary shadow-sm">

            <div className="card-body">

              <h6>Approval Rate</h6>

              <h3 className="text-primary">

                {summary.totalPayments === 0
                  ? 0
                  : (
                      (summary.approvedPayments /
                        summary.totalPayments) *
                      100
                    ).toFixed(1)}
                %

              </h3>

            </div>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card border-warning shadow-sm">

            <div className="card-body">

              <h6>Pending Payments</h6>

              <h3 className="text-warning">
                {summary.pendingPayments}
              </h3>

            </div>

          </div>

        </div>

      </div>

      {/* Footer */}

      <div className="text-center text-muted mt-5 mb-3">

        <small>
          Beereddy Agency ERP • Payment Report Module
        </small>

      </div>
          </div>
  );
}
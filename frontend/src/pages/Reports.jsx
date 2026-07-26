import { useEffect, useMemo, useState, useCallback } from "react";
import api from "../services/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Reports() {
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalRetailers: 0,
    totalOrders: 0,
    totalSales: 0,
  });

  const [sales, setSales] = useState([]);
  const [stock, setStock] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [payments, setPayments] = useState([]);
const [paymentSearch, setPaymentSearch] = useState("");
const [paymentStatus, setPaymentStatus] = useState("");

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [retailerFilter, setRetailerFilter] = useState("");
const loadPayments = useCallback(async () => {
  try {
    const res = await api.get("/payments");

    if (res.data.success) {
      setPayments(res.data.payments || []);
    }
  } catch (err) {
    console.error("Failed to load payments", err);
  }
}, []);
  useEffect(() => {
  loadReports();
  loadPayments();
}, [loadPayments]);

  const loadReports = async () => {
    try {
      const [
        summaryRes,
        salesRes,
        stockRes,
        retailerRes,
      ] = await Promise.all([
        api.get("/reports"),
        api.get("/reports/sales"),
        api.get("/reports/stock"),
        api.get("/reports/retailers"),
      ]);

      setSummary(summaryRes.data.summary);

      setSales(salesRes.data.orders || []);

      setStock(stockRes.data.products || []);

      setRetailers(retailerRes.data.report || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = useMemo(() => {
    return sales.filter((order) => {
      const retailer =
        order.retailer?.shopName ||
        order.retailer?.fullName ||
        "";

      const matchesSearch =
        retailer
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        order._id
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesRetailer =
        retailerFilter === "" ||
        retailer === retailerFilter;

      return matchesSearch && matchesRetailer;
    });
  }, [sales, search, retailerFilter]);
const paymentSummary = useMemo(() => {
  return {
    total: payments.length,

    approved: payments.filter(
      (p) => (p.status || "").toLowerCase() === "approved"
    ).length,

    pending: payments.filter(
      (p) => (p.status || "").toLowerCase() === "pending"
    ).length,

    rejected: payments.filter(
      (p) => (p.status || "").toLowerCase() === "rejected"
    ).length,

    amount: payments
      .filter(
        (p) => (p.status || "").toLowerCase() === "approved"
      )
      .reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      ),
  };
}, [payments]);
const filteredPayments = useMemo(() => {
  return payments.filter((payment) => {
    const retailer =
      payment.retailer?.shopName ||
      payment.retailer?.fullName ||
      "";

    const searchMatch =
      retailer
        .toLowerCase()
        .includes(paymentSearch.toLowerCase()) ||
      (payment.reference || "")
        .toLowerCase()
        .includes(paymentSearch.toLowerCase());

    const statusMatch =
      paymentStatus === "" ||
      (payment.status || "").toLowerCase() ===
        paymentStatus.toLowerCase();

    return searchMatch && statusMatch;
  });
}, [payments, paymentSearch, paymentStatus]);
const exportExcel = () => {
  const workbook = XLSX.utils.book_new();

  const worksheet = XLSX.utils.json_to_sheet(
    filteredPayments.map((payment, index) => ({
      "S.No": index + 1,
      Date: new Date(payment.createdAt).toLocaleDateString("en-IN"),
      Retailer:
        payment.retailer?.shopName ||
        payment.retailer?.fullName ||
        "N/A",
      Reference: payment.reference || "-",
      Amount: payment.amount || 0,
      Status: payment.status || "Pending",
    }))
  );

  XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

  XLSX.writeFile(workbook, "Payment_Report.xlsx");
};
const exportPDF = () => {
  window.print();
};


  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border"></div>
      </div>
    );
  }
  ;

  return (
    <div className="container-fluid py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2 className="fw-bold">
          Reports Dashboard
        </h2>

        <div>

          <button
            className="btn btn-success me-2"
            onClick={() => window.print()}
          >
            Print
          </button>

         <button
  className="btn btn-danger me-2"
  onClick={exportPDF}
>
  PDF
</button>

<button
  className="btn btn-primary"
  onClick={exportExcel}
>
  Excel
</button>

        </div>

      </div>

      <div className="row g-3 mb-4">

        <div className="col-md-3">
          <div className="card shadow border-0">
            <div className="card-body">
              <h6>Total Products</h6>
              <h3>{summary.totalProducts}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow border-0">
            <div className="card-body">
              <h6>Total Retailers</h6>
              <h3>{summary.totalRetailers}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow border-0">
            <div className="card-body">
              <h6>Total Orders</h6>
              <h3>{summary.totalOrders}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow border-0 bg-success text-white">
            <div className="card-body">
              <h6>Total Sales</h6>
              <h3>₹{summary.totalSales}</h3>
            </div>
          </div>
        </div>

      </div>

      <div className="card shadow mb-4">

        <div className="card-header d-flex justify-content-between align-items-center">

          <h5 className="mb-0">
            Sales Report
          </h5>

          <div className="d-flex">

            <input
              className="form-control me-2"
              placeholder="Search..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <select
              className="form-select"
              value={retailerFilter}
              onChange={(e) =>
                setRetailerFilter(e.target.value)
              }
            >
              <option value="">
                All Retailers
              </option>

              {retailers.map((r) => (
                <option
                  key={r.retailer._id}
                  value={
                    r.retailer.shopName ||
                    r.retailer.fullName
                  }
                >
                  {r.retailer.shopName ||
                    r.retailer.fullName}
                </option>
              ))}
            </select>

          </div>

        </div>

        <div className="table-responsive">

          <table className="table table-hover mb-0">

            <thead className="table-dark">

              <tr>
                <th>Invoice</th>
                <th>Retailer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
              </tr>

            </thead>

            <tbody>
                            {filteredSales.length > 0 ? (
                filteredSales.map((order) => (
                  <tr key={order._id}>
                    <td>{order.invoiceNumber || order._id.slice(-6)}</td>

                    <td>
                      {order.retailer?.shopName ||
                        order.retailer?.fullName ||
                        "N/A"}
                    </td>

                    <td>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          order.orderStatus === "Delivered"
                            ? "bg-success"
                            : order.orderStatus === "Cancelled"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    <td>
                      ₹
                      {Number(order.totalAmount).toLocaleString(
                        "en-IN"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-4"
                  >
                    No Orders Found
                  </td>
                </tr>
              )}
            </tbody>

          </table>

        </div>

      </div>

      {/* ========================= */}
      {/* Stock Report */}
      {/* ========================= */}

      <div className="card shadow mb-4">

        <div className="card-header bg-primary text-white">

          <h5 className="mb-0">
            Stock Report
          </h5>

        </div>

        <div className="table-responsive">

          <table className="table table-striped table-hover mb-0">

            <thead className="table-light">

              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Current Stock</th>
                <th>Minimum Stock</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {stock.length > 0 ? (

                stock.map((product) => (

                  <tr key={product._id}>

                    <td>
                      {product.productName}
                    </td>

                    <td>
                      {product.sku}
                    </td>

                    <td>
                      {product.stock}
                    </td>

                    <td>
                      {product.minimumStock}
                    </td>

                    <td>

                      {product.stock <= product.minimumStock ? (

                        <span className="badge bg-danger">
                          Low Stock
                        </span>

                      ) : (

                        <span className="badge bg-success">
                          In Stock
                        </span>

                      )}

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="text-center py-4"
                  >
                    No Products Found
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ========================= */}
      {/* Retailer Report */}
      {/* ========================= */}

      <div className="card shadow">

        <div className="card-header bg-dark text-white">

          <h5 className="mb-0">
            Retailer Purchase Report
          </h5>

        </div>

        <div className="table-responsive">

          <table className="table table-bordered table-hover mb-0">

            <thead>

              <tr>
                <th>Retailer</th>
                <th>Total Orders</th>
                <th>Total Purchase</th>
              </tr>

            </thead>

            <tbody>
                            {retailers.length > 0 ? (

                retailers.map((retailer) => (

                  <tr key={retailer.retailer._id}>

                    <td>
                      {retailer.retailer.shopName ||
                        retailer.retailer.fullName}
                    </td>

                    <td>
                      {retailer.totalOrders}
                    </td>

                    <td className="fw-bold text-success">
                      ₹
                      {Number(
                        retailer.totalAmount
                      ).toLocaleString("en-IN")}
                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="3"
                    className="text-center py-4"
                  >
                    No Retailer Report Available
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>
            {/* ========================= */}
      {/* Payment Report */}
      {/* ========================= */}

      <div className="card shadow mt-4">

        <div className="card-header bg-success text-white">
          <h5 className="mb-0">Payment Report</h5>
        </div>

        <div className="card-body">

          <div className="row g-3 mb-4">

            <div className="col-md-3">
              <div className="card border-success">
                <div className="card-body text-center">
                  <h6>Total Payments</h6>
                  <h3>{paymentSummary.total}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-primary">
                <div className="card-body text-center">
                  <h6>Approved</h6>
                  <h3 className="text-success">
                    {paymentSummary.approved}
                  </h3>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-warning">
                <div className="card-body text-center">
                  <h6>Pending</h6>
                  <h3 className="text-warning">
                    {paymentSummary.pending}
                  </h3>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-danger">
                <div className="card-body text-center">
                  <h6>Rejected</h6>
                  <h3 className="text-danger">
                    {paymentSummary.rejected}
                  </h3>
                </div>
              </div>
            </div>

          </div>

          <div className="alert alert-success fw-bold">
            Total Approved Amount :
            ₹{paymentSummary.amount.toLocaleString("en-IN")}
          </div>

          <div className="row mb-3">

            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Search Retailer / Reference"
                value={paymentSearch}
                onChange={(e) =>
                  setPaymentSearch(e.target.value)
                }
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={paymentStatus}
                onChange={(e) =>
                  setPaymentStatus(e.target.value)
                }
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

          </div>
                    <div className="table-responsive">

            <table className="table table-hover table-bordered">

              <thead className="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Retailer</th>
                  <th>Reference</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {filteredPayments.length > 0 ? (

                  filteredPayments.map((payment) => (

                    <tr key={payment._id}>

                      <td>
                        {new Date(
                          payment.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        {payment.retailer?.shopName ||
                          payment.retailer?.fullName ||
                          "N/A"}
                      </td>

                      <td>
                        {payment.reference || "-"}
                      </td>

                      <td className="fw-bold">
                        ₹
                        {Number(
                          payment.amount || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td>

                        <span
                          className={`badge ${
                            payment.status === "Approved"
                              ? "bg-success"
                              : payment.status === "Rejected"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {payment.status}
                        </span>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-4"
                    >
                      No Payment Records Found
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* Footer */}

      <div className="text-center mt-4 text-muted">

        <small>

          Beereddy Agency ERP • Reports Module •
          Generated on{" "}
          {new Date().toLocaleString()}

        </small>

      </div>

    </div>

  );

}
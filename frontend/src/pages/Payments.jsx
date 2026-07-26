import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function PaymentReport() {
  const [payments, setPayments] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

 const [form, setForm] = useState({
    retailer: "",
    order: "",
    amount: "",
    paymentMethod: "Cash",
    status: "Pending",
    referenceNumber: "",
    notes: "",
  });

  const paymentMethods = [
    "Cash",
    "UPI",
    "Bank Transfer",
    "Cheque",
    "Card",
  ];

  const paymentStatuses = [
    "Pending",
    "Approved",
    "Rejected"
  ];

  const loadPayments = async () => {
    try {
      const res = await api.get("/payments");
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRetailers = async () => {
    try {
      const res = await api.get("/retailers");
      setRetailers(res.data.retailers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAll = async () => {
    try {
      setLoading(true);

      await Promise.all([
        loadPayments(),
        loadRetailers(),
        loadOrders(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      retailer: "",
      order: "",
      amount: "",
      paymentMethod: "Cash",
      status: "Pending",
      referenceNumber: "",
      notes: "",
    });
  };

  const selectedRetailerOrders = useMemo(() => {
    if (!form.retailer) return [];

    return orders.filter((o) => {
      if (!o.retailer) return false;

      const retailerId =
        typeof o.retailer === "object"
          ? o.retailer._id
          : o.retailer;

      return retailerId === form.retailer;
    });
  }, [orders, form.retailer]);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const retailerName =
        payment.retailer?.shopName ||
        payment.retailer?.fullName ||
        "";

      const method = payment.paymentMethod || "";
      const status = payment.paymentStatus || "";

      return (
        retailerName.toLowerCase().includes(search.toLowerCase()) ||
        method.toLowerCase().includes(search.toLowerCase()) ||
        status.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [payments, search]);
    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await api.post("/payments", {
        retailer: form.retailer,
        order: form.order ,
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
        status: form.status,
        referenceNumber: form.referenceNumber,
        notes: form.notes,
      });

      resetForm();
      await loadPayments();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Unable to save payment."
      );
    } finally {
      setSaving(false);
    }
  };
  const updateStatus = async (id, status) => {
  try {
    await api.put(`/payments/${id}/status`, { status });

    await loadAll();

    alert(`Payment ${status} successfully.`);
  } catch (err) {
    alert(err.response?.data?.message || "Unable to update payment.");
  }
};

  const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "success";

    case "pending":
      return "warning";

    case "rejected":
      return "danger";

    default:
      return "secondary";
  }
};

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <h5 className="mt-3">
            Loading Payments...
          </h5>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Payments
          </h2>

          <p className="text-muted mb-0">
            Manage retailer payment records.
          </p>
        </div>

        <div style={{ maxWidth: 320 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search payments..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

      </div>

      <div className="row">

        <div className="col-lg-4">

          <div className="card shadow-sm">

            <div className="card-header">
              <h5 className="mb-0">
                Add Payment
              </h5>
            </div>

            <div className="card-body">

              <form onSubmit={handleSubmit}>

                <div className="mb-3">

                  <label className="form-label">
                    Retailer
                  </label>

                  <select
                    className="form-select"
                    name="retailer"
                    value={form.retailer}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select Retailer
                    </option>

                    {retailers.map((retailer) => (
                      <option
                        key={retailer._id}
                        value={retailer._id}
                      >
                        {retailer.shopName ||
                          retailer.fullName}
                      </option>
                    ))}

                  </select>

                </div>

                <div className="mb-3">

                  <label className="form-label">
                    Order
                  </label>

                  <select
                    className="form-select"
                    name="order"
                    value={form.order}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select Order
                    </option>

                    {selectedRetailerOrders.map((order) => (
                     <option key={order._id} value={order._id}>
                       {order.invoiceNumber ||
                        order.orderNumber ||
                        order._id}
                     </option>
                  ))}

                  </select>

                </div>
                                <div className="mb-3">
                  <label className="form-label">
                    Amount
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Payment Method
                  </label>

                  <select
                    className="form-select"
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Payment Status
                  </label>

                  <select
  className="form-select"
  name="status"
  value={form.status}
  onChange={handleChange}
>
                    {paymentStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Reference Number
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="referenceNumber"
                    value={form.referenceNumber}
                    onChange={handleChange}
                    placeholder="UPI / Bank Ref No."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Notes
                  </label>

                  <textarea
                    className="form-control"
                    rows="3"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      "Save Payment"
                    )}
                  </button>
                </div>

              </form>

            </div>

          </div>

        </div>

        <div className="col-lg-8">

          <div className="card shadow-sm">

            <div className="card-header d-flex justify-content-between align-items-center">

              <h5 className="mb-0">
                Payment History
              </h5>

              <span className="badge bg-primary">
                {filteredPayments.length} Records
              </span>

            </div>

            <div className="card-body p-0">

              <div className="table-responsive">

                <table className="table table-hover align-middle mb-0">

                  <thead className="table-light">

                    <tr>
                      <th>Retailer</th>
                      <th>Order</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>

                  </thead>

                  <tbody>
  {filteredPayments.length === 0 ? (
    <tr>
      <td colSpan="7" className="text-center py-5 text-muted">
        No payment records found.
      </td>
    </tr>
  ) : (
    filteredPayments.map((payment) => (
      <tr key={payment._id}>
        <td>
          <div className="fw-semibold">
            {payment.retailer?.shopName ||
              payment.retailer?.fullName ||
              "-"}
          </div>

          {payment.retailer?.phone && (
            <small className="text-muted">
              {payment.retailer.phone}
            </small>
          )}
        </td>

        <td>
          {payment.order?.invoiceNumber ||
            payment.order?.orderNumber ||
            "-"}
        </td>

        <td className="fw-bold text-success">
          ₹
          {Number(payment.amount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </td>

        <td>{payment.paymentMethod}</td>

        <td>
          <span
            className={`badge bg-${
              payment.status === "Approved"
                ? "success"
                : payment.status === "Rejected"
                ? "danger"
                : "warning"
            }`}
          >
            {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1).toLowerCase()}
          </span>
        </td>

        <td>
          {payment.createdAt
            ? new Date(payment.createdAt).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )
            : "-"}
        </td>

        <td>
          {payment.status === "Pending" ? (
            <>
              <button
                className="btn btn-success btn-sm me-2"
                onClick={() =>
                  updateStatus(
                    payment._id,
                    "Approved"
                  )
                }
              >
                Approve
              </button>

              <button
                className="btn btn-danger btn-sm"
                onClick={() =>
                  updateStatus(
                    payment._id,
                    "Rejected"
                  )
                }
              >
                Reject
              </button>
            </>
          ) : (
            <span
              className={`badge bg-${
                payment.status === "Approved"
                  ? "success"
                  : "danger"
              }`}
            >
             {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1).toLowerCase()} 
            </span>
          )}
        </td>
      </tr>
    ))
  )}
</tbody>
                </table>

              </div>

            </div>

          </div>

        </div>

      </div>

      <div className="row mt-4">

        <div className="col-md-3">

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <h6 className="text-muted">
                Total Payments
              </h6>

              <h3 className="fw-bold">
                {payments.length}
              </h3>

            </div>

          </div>

        </div>

        <div className="col-md-3">

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <h6 className="text-muted">
                Paid
              </h6>

              <h3 className="text-success fw-bold">
                {
                  payments.filter(
                    (p) => p.paymentStatus === "Paid"
                  ).length
                }
              </h3>

            </div>

          </div>

        </div>

        <div className="col-md-3">

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <h6 className="text-muted">
                Pending
              </h6>

              <h3 className="text-warning fw-bold">
                {
                  payments.filter(
                    (p) => p.paymentStatus === "Pending"
                  ).length
                }
              </h3>

            </div>

          </div>

        </div>
                <div className="col-md-3">

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <h6 className="text-muted">
                Total Amount
              </h6>

              <h3 className="text-primary fw-bold">
                ₹
                {payments
                  .reduce(
                    (sum, payment) =>
                      sum + Number(payment.amount || 0),
                    0
                  )
                  .toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </h3>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
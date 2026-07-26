import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import outstandingService from "../services/outstandingService";

export default function OutstandingDetails() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result =
        await outstandingService.getRetailerOutstanding(id);

      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          Retailer not found.
        </div>

        <Link
          to="/outstanding"
          className="btn btn-primary"
        >
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2>{data.retailer}</h2>

        <Link
          to="/outstanding"
          className="btn btn-secondary"
        >
          Back
        </Link>

      </div>

      <div className="row g-3">

        <div className="col-md-4">
          <div className="card shadow border-0">
            <div className="card-body">
              <h6>Total Orders</h6>
              <h3>
                ₹{Number(data.totalOrders || 0).toLocaleString("en-IN")}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow border-0">
            <div className="card-body">
              <h6>Total Payments</h6>
              <h3 className="text-success">
                ₹{Number(data.totalPayments || 0).toLocaleString("en-IN")}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow border-0">
            <div className="card-body">
              <h6>Outstanding</h6>
              <h3 className="text-danger">
                ₹{Number(data.outstanding || 0).toLocaleString("en-IN")}
              </h3>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
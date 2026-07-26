import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import outstandingService from "../services/outstandingService";

export default function Outstanding() {
  const navigate = useNavigate();
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadOutstanding();
  }, []);

  const loadOutstanding = async () => {
    try {
      const data =
        await outstandingService.getAllOutstanding();

      setRetailers(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRetailers = useMemo(() => {
    return retailers.filter((r) =>
      r.retailer
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [retailers, search]);

  const totalOutstanding = retailers.reduce(
    (sum, r) => sum + Number(r.outstanding || 0),
    0
  );

  const totalCredit = retailers.reduce(
    (sum, r) => sum + Number(r.creditLimit || 0),
    0
  );

  const availableCredit = retailers.reduce(
    (sum, r) => sum + Number(r.availableCredit || 0),
    0
  );

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2 className="fw-bold">
          Outstanding Dashboard
        </h2>

        <button
          className="btn btn-primary"
          onClick={loadOutstanding}
        >
          Refresh
        </button>

      </div>

      <div className="row g-3 mb-4">

        <div className="col-md-3">
          <div className="card shadow border-0">
            <div className="card-body">
              <h6>Total Outstanding</h6>
              <h3 className="text-danger">
                ₹{totalOutstanding.toLocaleString("en-IN")}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow border-0">
            <div className="card-body">
              <h6>Retailers With Due</h6>
              <h3>
                {
                  retailers.filter(
                    (r) => r.outstanding > 0
                  ).length
                }
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow border-0">
            <div className="card-body">
              <h6>Total Credit Limit</h6>
              <h3>
                ₹{totalCredit.toLocaleString("en-IN")}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow border-0 bg-success text-white">
            <div className="card-body">
              <h6>Available Credit</h6>
              <h3>
                ₹{availableCredit.toLocaleString("en-IN")}
              </h3>
            </div>
          </div>
        </div>

      </div>

      <div className="card shadow">

        <div className="card-header d-flex justify-content-between">

          <h5 className="mb-0">
            Retailer Outstanding
          </h5>

          <input
            type="text"
            className="form-control w-25"
            placeholder="Search Retailer..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <div className="table-responsive">

          <table className="table table-hover mb-0">

            <thead className="table-dark">

              <tr>
                <th>Retailer</th>
                <th>Credit Limit</th>
                <th>Outstanding</th>
                <th>Available Credit</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>
                              {filteredRetailers.length > 0 ? (
                filteredRetailers.map((retailer) => (
                  <tr key={retailer.retailerId}>

                    <td className="fw-semibold">
                      {retailer.retailer}
                    </td>

                    <td>
                      ₹
                      {Number(
                        retailer.creditLimit || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="text-danger fw-bold">
                      ₹
                      {Number(
                        retailer.outstanding || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="text-success fw-bold">
                      ₹
                      {Number(
                        retailer.availableCredit || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>

                      {retailer.outstanding > 0 ? (
                        <span className="badge bg-warning text-dark">
                          Outstanding
                        </span>
                      ) : (
                        <span className="badge bg-success">
                          Cleared
                        </span>
                      )}

                    </td>
                    <td>
  <button
    className="btn btn-sm btn-primary"
    onClick={() => navigate(`/outstanding/${retailer.retailerId}`)}
  >
    View
  </button>
</td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-4"
                  >
                    No Outstanding Records Found
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);

const [form, setForm] = useState({
  productId: "",
  quantity: "",
  reason: "",
});
  const fetchInventory = async () => {
    try {
      const res = await api.get("/inventory");
      setInventory(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchProducts = async () => {
  try {
    const res = await api.get("/products");

    console.log("Products API:", res.data);

    if (Array.isArray(res.data)) {
      setProducts(res.data);
    } else if (Array.isArray(res.data.data)) {
      setProducts(res.data.data);
    } else if (Array.isArray(res.data.products)) {
      setProducts(res.data.products);
    } else {
      setProducts([]);
    }
  } catch (err) {
    console.error(err);
    setProducts([]);
  }
};

const handleStockIn = async (e) => {
  e.preventDefault();

  try {
    await api.post("/inventory/stock-in", form);

    alert("Stock Added Successfully");

    setForm({
      productId: "",
      quantity: "",
      reason: "",
    });

    fetchInventory();
    fetchProducts();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to add stock");
  }
};

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);

  if (loading) {
    return <h4 className="text-center mt-5">Loading Inventory...</h4>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Inventory History</h2>
      <form onSubmit={handleStockIn} className="row g-3 mb-4">

  <div className="col-md-4">
    <select
      className="form-select"
      value={form.productId}
      onChange={(e) =>
        setForm({ ...form, productId: e.target.value })
      }
      required
    >
      <option value="">Select Product</option>

      {products.map((product) => (
        <option key={product._id} value={product._id}>
          {product.productName} (Stock: {product.stock})
        </option>
      ))}
    </select>
  </div>

  <div className="col-md-2">
    <input
      type="number"
      className="form-control"
      placeholder="Quantity"
      value={form.quantity}
      onChange={(e) =>
        setForm({ ...form, quantity: e.target.value })
      }
      required
    />
  </div>

  <div className="col-md-4">
    <input
      type="text"
      className="form-control"
      placeholder="Reason"
      value={form.reason}
      onChange={(e) =>
        setForm({ ...form, reason: e.target.value })
      }
    />
  </div>

  <div className="col-md-2">
    <button type="submit" className="btn btn-success w-100">
      Stock In
    </button>
  </div>

</form>

      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Product</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Previous</th>
            <th>Current</th>
            <th>Reason</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {inventory.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No inventory records found.
              </td>
            </tr>
          ) : (
            inventory.map((item) => (
              <tr key={item._id}>
                <td>{item.product?.productName}</td>
                <td>{item.type}</td>
                <td>{item.quantity}</td>
                <td>{item.previousStock}</td>
                <td>{item.newStock}</td>
                <td>{item.reason}</td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
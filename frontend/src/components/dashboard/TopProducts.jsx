import { useEffect, useState } from "react";
import dashboardService from "../../services/dashboardService";

export default function TopProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await dashboardService.getTopSellingProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-5">
        Top Selling Products
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left py-3">Product</th>
              <th className="text-left py-3">Quantity</th>
              <th className="text-left py-3">Revenue</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product, index) => (
              <tr
                key={index}
                className="border-b"
              >
                <td className="py-3">
                  {product._id}
                </td>

                <td>
                  {product.totalQuantity}
                </td>

                <td>
                  ₹{product.totalRevenue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
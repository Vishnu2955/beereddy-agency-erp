import { useEffect, useState } from "react";
import dashboardService from "../../services/dashboardService";

export default function LowStockTable() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data =
        await dashboardService.getLowStockProducts();

      setProducts(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-5">
        Low Stock Products
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left py-3">
                Product
              </th>

              <th className="text-left py-3">
                Stock
              </th>

              <th className="text-left py-3">
                Minimum
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                className="border-b"
              >
                <td className="py-3 font-medium">
                  {product.productName|| product.name}
                </td>

                <td>
                  {product.stock}
                </td>

                <td>
                  {product.minimumStock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
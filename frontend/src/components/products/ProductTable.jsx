import {
  FaEdit,
  FaTrash,
  FaBoxOpen,
  FaShoppingCart,
} from "react-icons/fa";

const IMAGE_URL = "http://localhost:5000/uploads/products/";
const user = JSON.parse(localStorage.getItem("user"));
const role = user?.role || "";
export default function ProductTable({
  products,
  onEdit,
  onDelete,
  onAddToCart,
}) {
  if (!products.length) {
    return (
      <div className="bg-white rounded-xl shadow p-16 text-center">

        <FaBoxOpen
          className="mx-auto text-6xl text-gray-300 mb-4"
        />

        <h2 className="text-2xl font-bold">
          No Products Found
        </h2>

        <p className="text-gray-500 mt-2">
          Add your first product to start managing inventory.
        </p>

      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-gray-100 sticky top-0">

            <tr>

              <th className="px-5 py-4 text-left">
                Image
              </th>

              <th className="px-5 py-4 text-left">
                Product
              </th>

              <th className="px-5 py-4 text-left">
                Brand
              </th>

              <th className="px-5 py-4 text-left">
                Category
              </th>

              <th className="px-5 py-4 text-left">
                SKU
              </th>

              <th className="px-5 py-4 text-right">
                MRP
              </th>

              <th className="px-5 py-4 text-right">
                Selling
              </th>

              <th className="px-5 py-4 text-center">
                Stock
              </th>

              <th className="px-5 py-4 text-center">
                Status
              </th>

              <th className="px-5 py-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {products.map((product) => (

              <tr
                key={product._id}
                className="border-t hover:bg-blue-50 transition"
              >

                <td className="px-5 py-4">

                  {product.image ? (

                    <img
                      src={`${IMAGE_URL}${product.image}`}
                      alt={product.productName}
                      className="w-16 h-16 rounded-xl object-cover border shadow-sm"
                    />

                  ) : (

                    <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center">

                      <FaBoxOpen className="text-gray-500" />

                    </div>

                  )}

                </td>

                <td className="px-5 py-4 font-semibold">

                  {product.productName}

                </td>

                <td className="px-5 py-4">

                  {product.brand || "-"}

                </td>

                <td className="px-5 py-4">

                  {product.category}

                </td>

                <td className="px-5 py-4">

                  {product.sku}

                </td>

                <td className="px-5 py-4 text-right font-medium">

                  ₹{product.mrp}

                </td>

                <td className="px-5 py-4 text-right font-semibold text-green-600">

                  ₹{product.sellingPrice}

                </td>

                <td className="px-5 py-4 text-center">

                  {product.stock}

                </td>

                <td className="px-5 py-4 text-center">

                  {product.stock <= product.minimumStock ? (

                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">

                      Low Stock

                    </span>

                  ) : (

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">

                      In Stock

                    </span>

                  )}

                </td>

                <td className="px-5 py-4">

                  <div className="flex justify-center gap-3">

  {role === "admin" && (
    <>
      <button
        onClick={() => onEdit(product)}
        className="bg-blue-100 hover:bg-blue-600 hover:text-white transition w-10 h-10 rounded-full flex items-center justify-center"
      >
        <FaEdit />
      </button>

      <button
        onClick={() => onDelete(product)}
        className="bg-red-100 hover:bg-red-600 hover:text-white transition w-10 h-10 rounded-full flex items-center justify-center"
      >
        <FaTrash />
      </button>
    </>
  )}

  {role === "retailer" && (
    <button
      onClick={() => onAddToCart(product)}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
    >
      <FaShoppingCart />
      Add to Cart
    </button>
  )}

</div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
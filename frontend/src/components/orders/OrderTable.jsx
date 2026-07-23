import {
  FaEdit,
  FaTrash,
  FaShoppingCart,
} from "react-icons/fa";

export default function OrderTable({
  orders,
  onEdit,
  onDelete,
}) {
  if (!orders.length) {
    return (
      <div className="bg-white rounded-xl shadow p-16 text-center">

        <FaShoppingCart
          className="mx-auto text-6xl text-gray-300 mb-4"
        />

        <h2 className="text-2xl font-bold">
          No Orders Found
        </h2>

        <p className="text-gray-500 mt-2">
          Create your first order to start selling products.
        </p>

      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="px-5 py-4 text-left">
                Retailer
              </th>

              <th className="px-5 py-4 text-center">
                Products
              </th>

              <th className="px-5 py-4 text-right">
                Total
              </th>

              <th className="px-5 py-4 text-center">
                Payment
              </th>

              <th className="px-5 py-4 text-center">
                Status
              </th>

              <th className="px-5 py-4 text-center">
                Date
              </th>

              <th className="px-5 py-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {orders.map((order) => (

              <tr
                key={order._id}
                className="border-t hover:bg-blue-50 transition"
              >

                <td className="px-5 py-4">

                  <div className="font-semibold">
                    {order.retailer?.shopName}
                  </div>

                  <div className="text-sm text-gray-500">
                    {order.retailer?.fullName}
                  </div>

                </td>

                <td className="px-5 py-4 text-center">

                  {order.items?.length}

                </td>

                <td className="px-5 py-4 text-right font-semibold text-green-600">

                  ₹{Number(order.totalAmount).toLocaleString("en-IN")}

                </td>

                <td className="px-5 py-4 text-center">

                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">

                    {order.paymentMethod}

                  </span>

                </td>

                <td className="px-5 py-4 text-center">

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.orderStatus === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : order.orderStatus === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.orderStatus}
                  </span>

                </td>

                <td className="px-5 py-4 text-center">

                  {new Date(order.createdAt).toLocaleDateString("en-IN")}

                </td>

                <td className="px-5 py-4">

                  <div className="flex justify-center gap-3">

                    <button
                      onClick={() => onEdit(order)}
                      className="bg-blue-100 hover:bg-blue-600 hover:text-white transition w-10 h-10 rounded-full flex items-center justify-center"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() => onDelete(order)}
                      className="bg-red-100 hover:bg-red-600 hover:text-white transition w-10 h-10 rounded-full flex items-center justify-center"
                    >
                      <FaTrash />
                    </button>

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
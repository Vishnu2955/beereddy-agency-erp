import { useNavigate } from "react-router-dom";

import {
  FaEdit,
  FaTrash,
  FaShoppingCart,
  FaEye,
  FaPrint,
  FaFileInvoice,
} from "react-icons/fa";

export default function OrderTable({
  orders,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const openInvoice = (id) => {
    navigate(`/invoice/${id}`);
  };

  const printInvoice = (id) => {
    window.open(`/invoice/${id}`, "_blank");
  };

  if (!orders.length) {
    return (
      <div className="bg-white rounded-xl shadow p-16 text-center">
        <FaShoppingCart className="mx-auto text-6xl text-gray-300 mb-4" />

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
                Invoice
              </th>

              <th className="px-5 py-4 text-left">
                Retailer
              </th>

              <th className="px-5 py-4 text-center">
                Products
              </th>

              <th className="px-5 py-4 text-right">
                Amount
              </th>

              <th className="px-5 py-4 text-center">
                Payment
              </th>

              <th className="px-5 py-4 text-center">
                Order Status
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

                {/* Invoice */}

                <td className="px-5 py-4">

                  <div className="flex items-center gap-2">

                    <FaFileInvoice className="text-blue-600" />

                    <span className="font-semibold">

                      {order.invoiceNumber || "-"}

                    </span>

                  </div>

                </td>

                {/* Retailer */}

                <td className="px-5 py-4">

                  <div className="font-semibold">

                    {order.retailer?.shopName}

                  </div>

                  <div className="text-sm text-gray-500">

                    {order.retailer?.fullName}

                  </div>

                </td>

                {/* Products */}

                <td className="px-5 py-4 text-center">

                  {order.items?.length || 0}

                </td>

                {/* Amount */}

                <td className="px-5 py-4 text-right font-bold text-green-600">

                  ₹{Number(
                    order.finalAmount || order.totalAmount || 0
                  ).toLocaleString("en-IN")}

                </td>

                {/* Payment */}

                <td className="px-5 py-4 text-center">

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-700"
                        : order.paymentStatus === "Partially Paid"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.paymentStatus === "Failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.paymentStatus || "Pending"}
                  </span>

                </td>

                {/* Order Status */}

                <td className="px-5 py-4 text-center">

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.orderStatus === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : order.orderStatus === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : order.orderStatus === "Processing"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.orderStatus}
                  </span>

                </td>

                {/* Date */}

                <td className="px-5 py-4 text-center">

                  {new Date(order.createdAt).toLocaleDateString("en-IN")}

                </td>

                {/* Actions */}

                <td className="px-5 py-4">

                  <div className="flex justify-center gap-2">

                    <button
                      onClick={() => openInvoice(order._id)}
                      className="bg-indigo-100 hover:bg-indigo-600 hover:text-white transition w-10 h-10 rounded-full flex items-center justify-center"
                      title="View Invoice"
                    >
                      <FaEye />
                    </button>

                    <button
                      onClick={() => printInvoice(order._id)}
                      className="bg-green-100 hover:bg-green-600 hover:text-white transition w-10 h-10 rounded-full flex items-center justify-center"
                      title="Print Invoice"
                    >
                      <FaPrint />
                    </button>

                    <button
                      onClick={() => onEdit(order)}
                      className="bg-blue-100 hover:bg-blue-600 hover:text-white transition w-10 h-10 rounded-full flex items-center justify-center"
                      title="Edit Order"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() => onDelete(order)}
                      className="bg-red-100 hover:bg-red-600 hover:text-white transition w-10 h-10 rounded-full flex items-center justify-center"
                      title="Delete Order"
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
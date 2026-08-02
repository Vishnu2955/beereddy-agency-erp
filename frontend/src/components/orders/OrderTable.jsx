import { useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaShoppingCart,
  FaEye,
  FaPrint,
  FaFileInvoice,
} from "react-icons/fa";
import orderService from "../../services/orderService";
import { getUser } from "../../utils/auth";
import { successToast, errorToast } from "../../utils/toast";

export default function OrderTable({
  orders,
  onEdit,
  onDelete,
  onStatusUpdate,
}) {
  const navigate = useNavigate();
  const user = getUser();
  const isAdmin = user?.role === "admin";

  const openInvoice = (id) => {
    navigate(`/invoice/${id}`);
  };

  const printInvoice = (id) => {
    window.open(`/invoice/${id}`, "_blank");
  };

  if (!orders.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-16 text-center">
        <FaShoppingCart className="mx-auto text-5xl text-slate-300 mb-3" />
        <h3 className="text-2xl font-extrabold text-slate-800">No Orders Registered</h3>
        <p className="text-slate-500 text-xs mt-1">
          {isAdmin ? "No orders submitted yet across retailer network." : "Place your first product order from the products catalog."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-4">Invoice #</th>
              <th className="px-5 py-4">Retailer Partner</th>
              <th className="px-5 py-4 text-center">Items</th>
              <th className="px-5 py-4 text-right">Order Amount</th>
              <th className="px-5 py-4 text-center">Payment Status</th>
              <th className="px-5 py-4 text-center">Fulfillment Status</th>
              <th className="px-5 py-4 text-center">Date</th>
              <th className="px-5 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {orders.map((order) => {
              const shopName = order.retailer?.shopName || order.retailer?.fullName || "Retailer Partner";
              const shopInitial = shopName.substring(0, 1).toUpperCase();
              const orderStatus = order.orderStatus || order.status || "Pending";

              return (
                <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Invoice # */}
                  <td className="px-5 py-4 font-mono font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <FaFileInvoice className="text-blue-600 text-sm" />
                      <span>{order.invoiceNumber ? `#${order.invoiceNumber}` : "Pending"}</span>
                    </div>
                  </td>

                  {/* Retailer */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center border border-indigo-100 shadow-2xs">
                        {shopInitial}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800 text-sm leading-snug">{shopName}</p>
                        {order.retailer?.fullName && (
                          <p className="text-[11px] text-slate-400 font-medium">{order.retailer.fullName}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Items */}
                  <td className="px-5 py-4 text-center font-bold text-slate-700">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-[11px]">
                      {order.items?.length || 0} Items
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-4 text-right font-extrabold text-emerald-700 text-sm">
                    ₹{Number(order.finalAmount && Number(order.finalAmount) > Number(order.totalAmount || 0) ? order.finalAmount : Math.round(Number(order.totalAmount || 0) * 1.18)).toLocaleString("en-IN")}
                  </td>

                  {/* Payment Status */}
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                        order.paymentStatus === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : order.paymentStatus === "Partially Paid"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : order.paymentStatus === "Failed"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {order.paymentStatus || "Pending"}
                    </span>
                  </td>

                  {/* Fulfillment Status */}
                  <td className="px-5 py-4 text-center">
                    {isAdmin ? (
                      <select
                        value={orderStatus}
                        onChange={async (e) => {
                          try {
                            const newStatus = e.target.value;
                            await orderService.updateOrderStatus(order._id, newStatus);
                            successToast(`Order status updated to "${newStatus}"`);
                            if (onStatusUpdate) onStatusUpdate();
                          } catch (err) {
                            errorToast("Failed to update status.");
                          }
                        }}
                        className={`px-3 py-1 rounded-xl text-[11px] font-extrabold border outline-none cursor-pointer shadow-2xs transition ${
                          orderStatus === "Delivered"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : orderStatus === "Cancelled"
                            ? "bg-rose-50 text-rose-800 border-rose-300"
                            : orderStatus === "Shipped"
                            ? "bg-purple-50 text-purple-800 border-purple-300"
                            : orderStatus === "Packed"
                            ? "bg-indigo-50 text-indigo-800 border-indigo-300"
                            : orderStatus === "Confirmed"
                            ? "bg-blue-50 text-blue-800 border-blue-300"
                            : "bg-amber-50 text-amber-800 border-amber-300"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                          orderStatus === "Delivered"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : orderStatus === "Cancelled"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : orderStatus === "Shipped"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : orderStatus === "Packed"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : orderStatus === "Confirmed"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {orderStatus}
                      </span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4 text-center text-slate-500 font-medium">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => openInvoice(order._id)}
                        className="bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 transition w-8 h-8 rounded-xl flex items-center justify-center border border-indigo-200 shadow-2xs"
                        title="View Invoice"
                      >
                        <FaEye className="text-xs" />
                      </button>

                      <button
                        onClick={() => printInvoice(order._id)}
                        className="bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 transition w-8 h-8 rounded-xl flex items-center justify-center border border-emerald-200 shadow-2xs"
                        title="Print Invoice"
                      >
                        <FaPrint className="text-xs" />
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => onEdit(order)}
                            className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 transition w-8 h-8 rounded-xl flex items-center justify-center border border-blue-200 shadow-2xs"
                            title="Edit Order"
                          >
                            <FaEdit className="text-xs" />
                          </button>

                          <button
                            onClick={() => onDelete(order)}
                            className="bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition w-8 h-8 rounded-xl flex items-center justify-center border border-rose-200 shadow-2xs"
                            title="Delete Order"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
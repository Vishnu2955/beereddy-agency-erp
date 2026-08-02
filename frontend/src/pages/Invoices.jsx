import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaFileInvoice,
  FaPrint,
  FaEye,
  FaSearch,
} from "react-icons/fa";

import { getUser } from "../utils/auth";
import orderService from "../services/orderService";

export default function Invoices() {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const currentUser = getUser();
  const isRetailer = currentUser?.role === "retailer";

  useEffect(() => {

    loadInvoices();

  }, []);

  useEffect(() => {

    if (!search.trim()) {

      setFilteredOrders(orders);

      return;

    }

    const keyword = search.toLowerCase();

    setFilteredOrders(

      orders.filter((order) => {

        return (

          order.invoiceNumber
            ?.toLowerCase()
            .includes(keyword) ||

          order.retailer?.shopName
            ?.toLowerCase()
            .includes(keyword) ||

          order.retailer?.fullName
            ?.toLowerCase()
            .includes(keyword)

        );

      })

    );

  }, [search, orders]);

  const loadInvoices = async () => {

    try {

      setLoading(true);

      const data = isRetailer
        ? await orderService.getMyOrders()
        : await orderService.getOrders(1, 1000);

      setOrders(data.orders || []);

      setFilteredOrders(data.orders || []);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  const openInvoice = (id) => {

    navigate(`/invoice/${id}`);

  };

  if (loading) {

    return (

      <div className="p-10 text-center">

        Loading invoices...

      </div>

    );

  }

  return (

    <div className="p-6">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h1 className="text-3xl font-bold">

            Invoices

          </h1>

          <p className="text-gray-500">

            Manage all generated invoices

          </p>

        </div>

      </div>

      {/* Search */}

      <div className="relative mb-6">

        <FaSearch className="absolute left-4 top-4 text-gray-400" />

        <input

          type="text"

          value={search}

          onChange={(e) => setSearch(e.target.value)}

          placeholder="Search Invoice..."

          className="w-full pl-12 pr-4 py-3 border rounded-xl"

        />

      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="min-w-full">

          <thead className="bg-blue-600 text-white">

            <tr>

              <th className="p-4 text-left">

                Invoice

              </th>

              <th className="p-4 text-left">

                Retailer

              </th>

              <th className="p-4 text-center">

                Amount

              </th>

              <th className="p-4 text-center">

                Payment

              </th>

              <th className="p-4 text-center">

                Date

              </th>

              <th className="p-4 text-center">

                Actions

              </th>

            </tr>

          </thead>

          <tbody>

            {filteredOrders.map((order) => (

              <tr

                key={order._id}

                className="border-t hover:bg-blue-50"

              >

                <td className="p-4">

                  <div className="flex items-center gap-2">

                    <FaFileInvoice className="text-blue-600" />

                    <span className="font-semibold">

                      {order.invoiceNumber}

                    </span>

                  </div>

                </td>

                <td className="p-4">

                  <div className="font-semibold">

                    {order.retailer?.shopName}

                  </div>

                  <div className="text-sm text-gray-500">

                    {order.retailer?.fullName}

                  </div>

                </td>

                <td className="p-4 text-center font-bold text-green-600">

                  ₹{Number(order.finalAmount && Number(order.finalAmount) > Number(order.totalAmount || 0) ? order.finalAmount : Math.round(Number(order.totalAmount || 0) * 1.18)).toLocaleString("en-IN")}

                </td>
                                <td className="p-4 text-center">

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

                <td className="p-4 text-center">

                  {new Date(order.createdAt).toLocaleDateString("en-IN")}

                </td>

                <td className="p-4">

                  <div className="flex justify-center gap-3">

                    <button
                      onClick={() => openInvoice(order._id)}
                      className="bg-blue-100 hover:bg-blue-600 hover:text-white transition w-10 h-10 rounded-full flex items-center justify-center"
                      title="View Invoice"
                    >
                      <FaEye />
                    </button>

                    <button
                      onClick={() =>
                        window.open(`/invoice/${order._id}`, "_blank")
                      }
                      className="bg-green-100 hover:bg-green-600 hover:text-white transition w-10 h-10 rounded-full flex items-center justify-center"
                      title="Print Invoice"
                    >
                      <FaPrint />
                    </button>

                  </div>

                </td>

              </tr>

            ))}

            {filteredOrders.length === 0 && (

              <tr>

                <td
                  colSpan="6"
                  className="text-center py-12 text-gray-500"
                >

                  No invoices found.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}
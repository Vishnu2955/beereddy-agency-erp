import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaPrint,
  FaFileInvoice,
  FaBuilding,
} from "react-icons/fa";

import orderService from "../services/orderService";

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);

      const data = await orderService.getOrderById(id);

      setOrder(data.order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-xl">
        Loading Invoice...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-10 text-center">
        Invoice not found.
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">

      <div className="max-w-5xl mx-auto">

        {/* Top Buttons */}

        <div className="flex justify-between mb-6 print:hidden">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <FaArrowLeft />
            Back
          </button>

          <button
            onClick={printInvoice}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            <FaPrint />
            Print Invoice
          </button>

        </div>

        {/* Invoice */}

        <div className="bg-white shadow-xl rounded-xl p-10">

          {/* Company */}

          <div className="flex justify-between items-start border-b pb-6">

            <div>

              <div className="flex items-center gap-3">

                <FaBuilding className="text-4xl text-blue-700" />

                <div>

                  <h1 className="text-3xl font-bold">

                    BEEREDDY AGENCY

                  </h1>

                  <p className="text-gray-500">

                    Distributor of V Bond Products

                  </p>

                </div>

              </div>

              <div className="mt-5 text-sm text-gray-600">

                <p>Hyderabad, Telangana</p>

                <p>Phone : +91 XXXXX XXXXX</p>

                <p>Email : beereddyagency@gmail.com</p>

              </div>

            </div>

            <div className="text-right">

              <FaFileInvoice className="text-5xl text-blue-600 ml-auto mb-2" />

              <h2 className="text-2xl font-bold">

                TAX INVOICE

              </h2>

              <p className="mt-3">

                <span className="font-semibold">

                  Invoice No :

                </span>

                {" "}
                {order.invoiceNumber}

              </p>

              <p>

                <span className="font-semibold">

                  Date :

                </span>

                {" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN")}

              </p>

            </div>

          </div>

          {/* Retailer */}

          <div className="grid md:grid-cols-2 gap-10 mt-8">

            <div>

              <h3 className="font-bold text-lg mb-3">

                Bill To

              </h3>

              <p className="font-semibold">

                {order.retailer?.shopName}

              </p>

              <p>

                {order.retailer?.fullName}

              </p>

              <p>

                {order.retailer?.phone}

              </p>

              <p>

                {order.retailer?.email}

              </p>

            </div>

            <div className="text-right">

              <p>

                <strong>Payment Method :</strong>

                {" "}
                {order.paymentMethod}

              </p>

              <p>

                <strong>Payment Status :</strong>

                {" "}
                {order.paymentStatus}

              </p>

              <p>

                <strong>Order Status :</strong>

                {" "}
                {order.orderStatus}

              </p>

            </div>

          </div>

          {/* Products */}

          <table className="w-full mt-10 border">

            <thead className="bg-blue-600 text-white">

              <tr>

                <th className="p-3 text-left">

                  Product

                </th>

                <th className="p-3">

                  Qty

                </th>

                <th className="p-3">

                  Price

                </th>

                <th className="p-3">

                  Total

                </th>

              </tr>

            </thead>

            <tbody>

              {order.items.map((item, index) => (

                <tr
                  key={index}
                  className="border-b"
                >

                  <td className="p-3">

                    {item.productName}

                  </td>

                  <td className="p-3 text-center">

                    {item.quantity}

                  </td>

                  <td className="p-3 text-center">

                    ₹{item.price}

                  </td>

                  <td className="p-3 text-center">

                    ₹{item.price * item.quantity}

                  </td>

                </tr>

              ))}            </tbody>

          </table>

          {/* Invoice Summary */}

          <div className="flex justify-end mt-10">

            <div className="w-full md:w-96">

              <div className="flex justify-between py-2 border-b">

                <span>Subtotal</span>

                <span>
                  ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                </span>

              </div>

              <div className="flex justify-between py-2 border-b">

                <span>GST (18%)</span>

                <span>
                  ₹{Number(order.gstAmount || 0).toLocaleString("en-IN")}
                </span>

              </div>

              <div className="flex justify-between py-2 border-b">

                <span>Discount</span>

                <span>
                  ₹{Number(order.discount || 0).toLocaleString("en-IN")}
                </span>

              </div>

              <div className="flex justify-between py-4 text-xl font-bold text-blue-700">

                <span>Grand Total</span>

                <span>
                  ₹{Number(
                    order.finalAmount || order.totalAmount
                  ).toLocaleString("en-IN")}
                </span>

              </div>

            </div>

          </div>

          {/* Remarks */}

          {order.remarks && (

            <div className="mt-8">

              <h3 className="font-bold text-lg mb-2">
                Remarks
              </h3>

              <div className="border rounded-lg p-4 bg-gray-50">
                {order.remarks}
              </div>

            </div>

          )}

          {/* Footer */}

          <div className="grid md:grid-cols-2 gap-10 mt-16">

            <div>

              <h3 className="font-semibold mb-3">
                Terms & Conditions
              </h3>

              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">

                <li>Goods once sold will not be taken back.</li>

                <li>Please verify the products before delivery.</li>

                <li>Payment should be completed as agreed.</li>

                <li>Subject to Hyderabad jurisdiction.</li>

              </ul>

            </div>

            <div className="text-right">

              <div className="mt-16">

                <div className="border-t inline-block pt-2 px-8">

                  Authorized Signature

                </div>

              </div>

            </div>

          </div>

          <div className="text-center mt-12 border-t pt-6">

            <h2 className="text-2xl font-bold text-blue-700">

              Thank You!

            </h2>

            <p className="text-gray-500 mt-2">

              Thank you for choosing Beereddy Agency.

            </p>

          </div>

        </div>

      </div>

    </div>

  );

}
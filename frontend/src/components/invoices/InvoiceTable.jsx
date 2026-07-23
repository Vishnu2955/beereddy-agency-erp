import { FaEdit, FaTrash, FaFileInvoice } from "react-icons/fa";

export default function InvoiceTable({
  invoices,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">

      <table className="min-w-full">

        <thead className="bg-gray-100">

          <tr>

            <th className="px-5 py-3 text-left">
              Invoice No.
            </th>

            <th className="px-5 py-3 text-left">
              Retailer
            </th>

            <th className="px-5 py-3 text-left">
              Order
            </th>

            <th className="px-5 py-3 text-left">
              Amount
            </th>

            <th className="px-5 py-3 text-left">
              Status
            </th>

            <th className="px-5 py-3 text-left">
              Date
            </th>

            <th className="px-5 py-3 text-center">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {invoices.map((invoice) => (

            <tr
              key={invoice._id}
              className="border-t hover:bg-gray-50"
            >

              <td className="px-5 py-4 font-semibold flex items-center gap-2">

                <FaFileInvoice className="text-blue-600" />

                {invoice.invoiceNumber}

              </td>

              <td className="px-5 py-4">

                {invoice.retailer?.shopName}

              </td>

              <td className="px-5 py-4">

                {invoice.order?.orderNumber || invoice.order?._id}

              </td>

              <td className="px-5 py-4 font-semibold">

                ₹{Number(invoice.totalAmount).toLocaleString("en-IN")}

              </td>

              <td className="px-5 py-4">

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    invoice.paymentStatus === "Paid"
                      ? "bg-green-100 text-green-700"
                      : invoice.paymentStatus === "Partial"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {invoice.paymentStatus}
                </span>

              </td>

              <td className="px-5 py-4">

                {new Date(invoice.createdAt).toLocaleDateString()}

              </td>

              <td className="px-5 py-4">

                <div className="flex justify-center gap-3">

                  <button
                    onClick={() => onEdit(invoice)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>

                  <button
                    onClick={() => onDelete(invoice)}
                    className="text-red-600 hover:text-red-800"
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
  );
}
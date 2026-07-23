export default function InvoicePreview({ invoice }) {
  if (!invoice) return null;

  return (
    <div className="bg-white p-8 rounded-xl shadow max-w-4xl mx-auto">

      {/* Header */}

      <div className="flex justify-between border-b pb-6 mb-6">

        <div>
          <h1 className="text-3xl font-bold text-blue-700">
            Beereddy Agency
          </h1>

          <p>Nalgonda, Telangana</p>
          <p>Phone: 9876543210</p>
          <p>Email: info@beereddyagency.com</p>
        </div>

        <div className="text-right">

          <h2 className="text-2xl font-bold">
            TAX INVOICE
          </h2>

          <p>
            <strong>No:</strong>{" "}
            {invoice.invoiceNumber}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {new Date(
              invoice.invoiceDate
            ).toLocaleDateString()}
          </p>

        </div>

      </div>

      {/* Retailer */}

      <div className="mb-6">

        <h3 className="font-bold mb-2">
          Bill To
        </h3>

        <p className="font-semibold">
          {invoice.retailer?.shopName}
        </p>

        <p>{invoice.retailer?.fullName}</p>

        <p>{invoice.retailer?.address}</p>

        <p>{invoice.retailer?.phone}</p>

      </div>

      {/* Items */}

      <table className="w-full border">

        <thead className="bg-gray-100">

          <tr>

            <th className="border p-2 text-left">
              Product
            </th>

            <th className="border p-2">
              Qty
            </th>

            <th className="border p-2">
              Price
            </th>

            <th className="border p-2">
              Total
            </th>

          </tr>

        </thead>

        <tbody>

          {invoice.items?.map((item) => (

            <tr key={item._id}>

              <td className="border p-2">
                {item.productName}
              </td>

              <td className="border p-2 text-center">
                {item.quantity}
              </td>

              <td className="border p-2 text-center">
                ₹{item.price}
              </td>

              <td className="border p-2 text-center">
                ₹{item.price * item.quantity}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {/* Totals */}

      <div className="flex justify-end mt-6">

        <div className="w-80 space-y-2">

          <div className="flex justify-between">
            <span>Subtotal</span>
            <strong>
              ₹{invoice.subtotal}
            </strong>
          </div>

          <div className="flex justify-between">
            <span>GST (18%)</span>
            <strong>
              ₹{invoice.gst}
            </strong>
          </div>

          <hr />

          <div className="flex justify-between text-xl font-bold text-green-600">
            <span>Grand Total</span>
            <span>
              ₹{invoice.grandTotal}
            </span>
          </div>

        </div>

      </div>

      {/* Footer */}

      <div className="mt-16 flex justify-between">

        <div>

          <p>
            Payment Status:
          </p>

          <strong>
            {invoice.paymentStatus}
          </strong>

        </div>

        <div className="text-right">

          <div className="border-t pt-2 w-48">
            Authorized Signature
          </div>

        </div>

      </div>

    </div>
  );
}
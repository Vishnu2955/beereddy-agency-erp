import {
  FaEdit,
  FaTrash,
  FaStore,
} from "react-icons/fa";

export default function RetailerTable({
  retailers,
  onEdit,
  onDelete,
}) {
  if (!retailers.length) {
    return (
      <div className="bg-white rounded-xl shadow p-16 text-center">

        <FaStore
          className="mx-auto text-6xl text-gray-300 mb-4"
        />

        <h2 className="text-2xl font-bold">
          No Retailers Found
        </h2>

        <p className="text-gray-500 mt-2">
          Add your first retailer to start managing your customers.
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
                Shop
              </th>

              <th className="px-5 py-4 text-left">
                Owner
              </th>

              <th className="px-5 py-4 text-left">
                Phone
              </th>

              <th className="px-5 py-4 text-left">
                Email
              </th>

              <th className="px-5 py-4 text-right">
                Credit Limit
              </th>

              <th className="px-5 py-4 text-right">
                Outstanding
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

            {retailers.map((retailer) => (

              <tr
                key={retailer._id}
                className="border-t hover:bg-blue-50 transition"
              >

                <td className="px-5 py-4 font-semibold">
                  {retailer.shopName}
                </td>

                <td className="px-5 py-4">
                  {retailer.fullName}
                </td>

                <td className="px-5 py-4">
                  {retailer.phone}
                </td>

                <td className="px-5 py-4">
                  {retailer.email || "-"}
                </td>

                <td className="px-5 py-4 text-right font-medium">
                  ₹{Number(retailer.creditLimit || 0).toLocaleString("en-IN")}
                </td>

                <td className="px-5 py-4 text-right font-semibold text-red-600">
                ₹{Number(retailer.outstanding || 0).toLocaleString("en-IN")}
                </td>

                <td className="px-5 py-4 text-center">

                  {retailer.isActive ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Inactive
                    </span>
                  )}

                </td>

                <td className="px-5 py-4">

                  <div className="flex justify-center gap-3">

                    <button
                      onClick={() => onEdit(retailer)}
                      className="bg-blue-100 hover:bg-blue-600 hover:text-white transition w-10 h-10 rounded-full flex items-center justify-center"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() => onDelete(retailer)}
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
import { FaPlus, FaTrash } from "react-icons/fa";

export default function OrderItems({
  items,
  products,
  onChange,
}) {

  const handleItemChange = (index, field, value) => {

    const updatedItems = [...items];

    updatedItems[index][field] = value;

    if (field === "product") {

      const selectedProduct = products.find(
        (p) => p._id === value
      );

      if (selectedProduct) {

        updatedItems[index].productName =
          selectedProduct.productName;

        updatedItems[index].price =
          selectedProduct.sellingPrice;

        updatedItems[index].gst =
          selectedProduct.gst;

      }

    }

    const qty = Number(updatedItems[index].quantity || 0);
    const price = Number(updatedItems[index].price || 0);

    updatedItems[index].total = qty * price;

    onChange(updatedItems);

  };

  const addItem = () => {

    onChange([
      ...items,
      {
        product: "",
        productName: "",
        quantity: 1,
        price: 0,
        gst: 18,
        total: 0,
      },
    ]);

  };

  const removeItem = (index) => {

    const updatedItems = items.filter(
      (_, i) => i !== index
    );

    onChange(updatedItems);

  };

  return (
    <div className="space-y-4">

      <div className="flex justify-between items-center">

        <h3 className="text-lg font-bold">
          Order Items
        </h3>

        <button
          type="button"
          onClick={addItem}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaPlus />
          Add Product
        </button>

      </div>

      {items.map((item, index) => (

        <div
          key={index}
          className="grid md:grid-cols-5 gap-4 border rounded-lg p-4"
        >

          <select
            value={item.product}
            onChange={(e) =>
              handleItemChange(
                index,
                "product",
                e.target.value
              )
            }
            className="border rounded-lg px-3 py-2"
          >

            <option value="">
              Select Product
            </option>

            {products.map((product) => (

              <option
                key={product._id}
                value={product._id}
              >
                {product.productName}
              </option>

            ))}

          </select>

          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) =>
              handleItemChange(
                index,
                "quantity",
                e.target.value
              )
            }
            className="border rounded-lg px-3 py-2"
            placeholder="Quantity"
          />

          <input
            type="number"
            value={item.price}
            readOnly
            className="border rounded-lg px-3 py-2 bg-gray-100"
          />

          <input
            type="text"
            value={`₹${item.total || 0}`}
            readOnly
            className="border rounded-lg px-3 py-2 bg-gray-100"
          />

          <button
            type="button"
            onClick={() => removeItem(index)}
            className="bg-red-100 hover:bg-red-600 hover:text-white rounded-lg flex justify-center items-center transition"
          >
            <FaTrash />
          </button>

        </div>

      ))}

    </div>
  );
}
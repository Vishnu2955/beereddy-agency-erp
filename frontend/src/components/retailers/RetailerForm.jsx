import { useEffect, useState } from "react";

export default function RetailerForm({
  initialData,
  onSubmit,
  loading,
}) {
  const [form, setForm] = useState({
  fullName: "",
  shopName: "",
  phone: "",
  email: "",
  password: "",
  address: "",
  gstNumber: "",
  creditLimit: 0,
  outstandingBalance: 0,
  isActive: true,
});

  useEffect(() => {
    if (initialData) {
      setForm({
        fullName: initialData.fullName || "",
        shopName: initialData.shopName || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        password: "",
        address: initialData.address || "",
        gstNumber: initialData.gstNumber || "",
        creditLimit: initialData.creditLimit || 0,
        outstandingBalance:
          initialData.outstandingBalance || 0,
        isActive:
          initialData.isActive ?? true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      autoComplete="off"
    >
      {/* Hidden dummy fields to trick browser password manager autofill */}
      <input type="text" name="prevent_autofill_user" className="hidden" tabIndex="-1" autoComplete="off" />
      <input type="password" name="prevent_autofill_pass" className="hidden" tabIndex="-1" autoComplete="new-password" />

      <div className="grid md:grid-cols-2 gap-5">

        <div>
          <label className="block mb-1 font-medium">
            Full Name
          </label>

          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            autoComplete="off"
            required
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Shop Name
          </label>

          <input
            type="text"
            name="shopName"
            value={form.shopName}
            onChange={handleChange}
            autoComplete="off"
            required
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Phone
          </label>

          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            autoComplete="off"
            required
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="off"
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

      </div>
      <div>
        <label className="block mb-1 font-medium">
          Password
       </label>

       <input
         type="password"
         name="password"
         value={form.password}
         onChange={handleChange}
         autoComplete="new-password"
         required={!initialData}
         className="w-full border rounded-lg px-4 py-2"
         />
        </div>
      <div>
        <label className="block mb-1 font-medium">
          Address
        </label>

        <textarea
          name="address"
          rows="3"
          value={form.address}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5">

        <div>
          <label className="block mb-1 font-medium">
            GST Number
          </label>

          <input
            type="text"
            name="gstNumber"
            value={form.gstNumber}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Outstanding
          </label>

          <input
            type="number"
            value={form.outstandingBalance}
            readOnly
            className="w-full border rounded-lg px-4 py-2 bg-gray-100"
          />
        </div>

      </div>

      <div className="flex items-center gap-3">

        <input
          type="checkbox"
          name="isActive"
          checked={form.isActive}
          onChange={handleChange}
        />

        <label className="font-medium">
          Active Retailer
        </label>

      </div>

      <div className="flex justify-end gap-3">

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          {loading ? "Saving..." : "Save Retailer"}
        </button>

      </div>

    </form>
  );
}
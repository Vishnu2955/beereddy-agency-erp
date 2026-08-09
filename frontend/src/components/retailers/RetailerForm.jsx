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

    const payload = {
      ...form,
      shopName: form.shopName ? form.shopName.trim() : form.fullName.trim(),
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email && form.email.trim() ? form.email.trim() : undefined,
    };

    onSubmit(payload);
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
          <label className="block mb-1 text-xs font-bold uppercase tracking-wider text-slate-600">
            Full Name *
          </label>

          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            autoComplete="off"
            required
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-bold uppercase tracking-wider text-slate-600">
            Shop / Store Name *
          </label>

          <input
            type="text"
            name="shopName"
            value={form.shopName}
            onChange={handleChange}
            autoComplete="off"
            required
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-bold uppercase tracking-wider text-slate-600">
            Phone Number *
          </label>

          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            autoComplete="off"
            required
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-bold uppercase tracking-wider text-slate-600">
            Email Address
          </label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="off"
            placeholder="retailer@business.com"
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
          />
        </div>

      </div>

      <div>
        <label className="block mb-1 text-xs font-bold uppercase tracking-wider text-slate-600">
          Account Password {initialData ? "(Leave blank to keep unchanged)" : "*"}
        </label>

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          required={!initialData}
          placeholder="••••••••"
          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block mb-1 text-xs font-bold uppercase tracking-wider text-slate-600">
          Business Address / City
        </label>

        <textarea
          name="address"
          rows="3"
          value={form.address}
          onChange={handleChange}
          placeholder="City, State, Pincode"
          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5">

        <div>
          <label className="block mb-1 text-xs font-bold uppercase tracking-wider text-slate-600">
            GST Number
          </label>

          <input
            type="text"
            name="gstNumber"
            value={form.gstNumber}
            onChange={handleChange}
            placeholder="36AAAAA0000A1Z5"
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none uppercase"
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-bold uppercase tracking-wider text-slate-600">
            Outstanding Due Balance (₹)
          </label>

          <input
            type="number"
            value={form.outstandingBalance}
            readOnly
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-extrabold bg-slate-100 text-slate-700"
          />
        </div>

      </div>

      <div className="flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          name="isActive"
          id="isActive"
          checked={form.isActive}
          onChange={handleChange}
          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
        />

        <label htmlFor="isActive" className="text-xs font-bold text-slate-700 cursor-pointer">
          Active Retailer Account
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs px-8 py-3.5 rounded-2xl shadow-lg shadow-amber-500/25 transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving Retailer...</span>
            </>
          ) : (
            <span>Save Retailer Account</span>
          )}
        </button>
      </div>

    </form>
  );
}
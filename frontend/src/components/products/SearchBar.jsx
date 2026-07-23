import { FaSearch } from "react-icons/fa";

export default function SearchBar({
  value,
  onChange,
}) {
  return (
    <div className="relative w-full md:w-96">
      <FaSearch
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        placeholder="Search products..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
}
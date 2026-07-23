import { FaBars, FaBell, FaUserCircle } from "react-icons/fa";

export default function Navbar({
  sidebarOpen,
  setSidebarOpen,
}) {
  return (
    <header className="bg-white shadow-sm h-20 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden text-2xl"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <FaBars />
        </button>

        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Dashboard
          </h2>

          <p className="text-sm text-gray-500">
            Beereddy Agency ERP
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative">
          <FaBell className="text-xl text-gray-600" />

          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-[10px] px-1">
            3
          </span>
        </button>

        <div className="flex items-center gap-3">
          <FaUserCircle
            className="text-blue-700"
            size={34}
          />

          <div className="hidden sm:block">
            <p className="font-semibold">
              Administrator
            </p>

            <p className="text-sm text-gray-500">
              Beereddy Agency
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
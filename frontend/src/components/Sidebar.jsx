import {
  FaBoxOpen,
  FaChartBar,
  FaClipboardList,
  FaFileInvoice,
  FaHome,
  FaSignOutAlt,
  FaStore,
  FaTimes,
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

const menus = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <FaHome />,
  },
  {
    name: "Products",
    path: "/products",
    icon: <FaBoxOpen />,
  },
  {
    name: "Retailers",
    path: "/retailers",
    icon: <FaStore />,
  },
  {
    name: "Orders",
    path: "/orders",
    icon: <FaClipboardList />,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: <FaChartBar />,
  },
  {
    name: "Invoices",
    path: "/invoices",
    icon: <FaFileInvoice />,
  },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-gradient-to-b from-blue-700 to-blue-900 text-white shadow-xl z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-6 border-b border-blue-500">
          <div>
            <h1 className="text-2xl font-bold">Beereddy ERP</h1>
            <p className="text-xs text-blue-200">
              V Bond Distributor
            </p>
          </div>

          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes size={20} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {menus.map((menu) => (
            <NavLink
              key={menu.name}
              to={menu.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-white text-blue-700 font-semibold"
                    : "hover:bg-blue-800"
                }`
              }
            >
              <span className="text-lg">{menu.icon}</span>
              {menu.name}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 py-3 rounded-xl transition"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
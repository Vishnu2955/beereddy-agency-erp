import {
  FaBoxOpen,
  FaChartBar,
  FaClipboardList,
  FaFileInvoice,
  FaHome,
  FaMoneyCheckAlt,
  FaSignOutAlt,
  FaStore,
  FaTimes,
  FaWarehouse,
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
  name: "Inventory",
  path: "/inventory",
  icon: <FaWarehouse />,
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
  {
  name: "Payments",
  path: "/payments",
  icon: <FaMoneyCheckAlt />,
  },
  {
  name: "Outstanding",
  path: "/outstanding",
  icon: "💰",
  }
  
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
  className={`fixed top-0 left-0 h-screen w-72 bg-gradient-to-b from-blue-700 to-blue-900 text-white shadow-xl z-40 transition-transform duration-300 flex flex-col ${
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

       <div className="flex-1 overflow-y-auto">
  <nav className="mt-6 px-4 space-y-2 pb-6">
    {menus.map((menu) => (
      <NavLink
        key={menu.name}
        to={menu.path}
        onClick={() => setSidebarOpen(false)}
        className={({ isActive }) =>
  `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
    isActive
      ? "bg-white text-blue-700 font-bold shadow-md"
      : "text-white hover:text-white hover:bg-blue-800"
  }`
}
      >
        <span className="text-lg text-inherit">
  {menu.icon}
</span>
        {menu.name}
      </NavLink>
    ))}
  </nav>
</div> 
<div className="p-4 mt-auto">
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
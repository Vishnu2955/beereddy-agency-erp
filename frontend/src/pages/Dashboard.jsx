import { useEffect, useState } from "react";

import api from "../services/api";

import StatCard from "../components/StatCard";

import SalesChart from "../components/dashboard/SalesChart";
import OrderStatusChart from "../components/dashboard/OrderStatusChart";
import RecentOrders from "../components/dashboard/RecentOrders";
import LowStockTable from "../components/dashboard/LowStockTable";
import TopProducts from "../components/dashboard/TopProducts";

import {
  FaBoxOpen,
  FaStore,
  FaClipboardList,
  FaMoneyBillWave,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState({
    totalProducts: 0,
    totalRetailers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    totalSales: 0,
  });

  const loadDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setDashboard(res.data.dashboard);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-semibold text-gray-600">
          Loading Dashboard...
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Welcome to Beereddy Agency ERP
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        <StatCard
          title="Products"
          value={dashboard.totalProducts}
          icon={<FaBoxOpen />}
          color="bg-gradient-to-r from-blue-500 to-blue-700"
        />

        <StatCard
          title="Retailers"
          value={dashboard.totalRetailers}
          icon={<FaStore />}
          color="bg-gradient-to-r from-green-500 to-green-700"
        />

        <StatCard
          title="Orders"
          value={dashboard.totalOrders}
          icon={<FaClipboardList />}
          color="bg-gradient-to-r from-orange-500 to-red-500"
        />

        <StatCard
          title="Sales"
          value={`₹${dashboard.totalSales.toLocaleString()}`}
          icon={<FaMoneyBillWave />}
          color="bg-gradient-to-r from-purple-500 to-indigo-700"
        />

        <StatCard
          title="Pending Orders"
          value={dashboard.pendingOrders}
          icon={<FaClock />}
          color="bg-gradient-to-r from-yellow-500 to-orange-500"
        />

        <StatCard
          title="Low Stock"
          value={dashboard.lowStockProducts}
          icon={<FaExclamationTriangle />}
          color="bg-gradient-to-r from-red-500 to-pink-600"
        />

      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">

        <SalesChart />

        <OrderStatusChart />

      </div>

      {/* Tables */}
      <div className="grid lg:grid-cols-2 gap-6">

        <LowStockTable />

        <RecentOrders />

      </div>

      {/* Top Selling Products */}
      <TopProducts />

    </div>
  );
}
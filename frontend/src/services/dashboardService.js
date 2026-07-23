import api from "./api";

const dashboardService = {
  // Dashboard Summary
  async getSummary() {
    const res = await api.get("/dashboard");
    return res.data.dashboard;
  },

  // Monthly Sales Chart
  async getMonthlySales() {
    const res = await api.get("/dashboard/monthly-sales");
    return res.data.sales;
  },

  // Order Status
  async getOrderStatus() {
    const res = await api.get("/dashboard/order-status");
    return res.data.status;
  },

  // Recent Orders
  async getRecentOrders() {
    const res = await api.get("/dashboard/recent-orders");
    return res.data.recentOrders;
  },

  // Low Stock Products
  async getLowStockProducts() {
    const res = await api.get("/dashboard/low-stock");
    return res.data.products;
  },

  // Top Selling Products
  async getTopSellingProducts() {
    const res = await api.get("/dashboard/top-products");
    return res.data.topProducts;
  },
};

export default dashboardService;
class ApiConstants {
  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String sendOtp = '/auth/send-otp';
  static const String verifyOtp = '/auth/verify-otp';
  static const String resetPassword = '/auth/reset-password';

  // Products
  static const String products = '/products';

  // Orders
  static const String orders = '/orders';
  static const String myOrders = '/orders/my-orders';
  static const String searchOrders = '/orders/search';

  // Invoices
  static const String invoices = '/invoices';

  // Payments
  static const String payments = '/payments';
  static const String retailerPayments = '/payments/retailer';

  // Delivery
  static const String delivery = '/delivery';
  static const String deliveryDashboard = '/delivery/dashboard';

  // Dashboard
  static const String dashboardStats = '/dashboard';
  static const String recentOrders = '/dashboard/recent-orders';
  static const String lowStock = '/dashboard/low-stock';

  // Notifications
  static const String notifications = '/notifications';
  static const String unreadNotifications = '/notifications/unread';

  // Retailers
  static const String retailers = '/retailers';
}

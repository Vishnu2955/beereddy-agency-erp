class DashboardStatsModel {
  final double totalSales;
  final int totalOrders;
  final int pendingOrders;
  final int lowStockCount;
  final double outstandingBalance;

  DashboardStatsModel({
    required this.totalSales,
    required this.totalOrders,
    required this.pendingOrders,
    required this.lowStockCount,
    required this.outstandingBalance,
  });

  factory DashboardStatsModel.fromJson(Map<String, dynamic> json) {
    return DashboardStatsModel(
      totalSales: (json['totalSales'] ?? json['sales'] ?? 0).toDouble(),
      totalOrders: json['totalOrders'] ?? json['ordersCount'] ?? 0,
      pendingOrders: json['pendingOrders'] ?? 0,
      lowStockCount: json['lowStockCount'] ?? json['lowStock'] ?? 0,
      outstandingBalance: (json['outstandingBalance'] ?? json['dueAmount'] ?? 0).toDouble(),
    );
  }
}

class DeliveryModel {
  final String id;
  final String trackingId;
  final String orderId;
  final String driverName;
  final String driverPhone;
  final String vehicleNumber;
  final String status; // 'Assigned', 'In Transit', 'Out for Delivery', 'Delivered'
  final String currentAddress;
  final DateTime? estimatedDelivery;
  final DateTime createdAt;

  DeliveryModel({
    required this.id,
    required this.trackingId,
    required this.orderId,
    required this.driverName,
    required this.driverPhone,
    required this.vehicleNumber,
    required this.status,
    required this.currentAddress,
    this.estimatedDelivery,
    required this.createdAt,
  });

  factory DeliveryModel.fromJson(Map<String, dynamic> json) {
    return DeliveryModel(
      id: json['_id'] ?? json['id'] ?? '',
      trackingId: json['trackingId'] ?? 'TRK-${json['_id']?.toString().substring(0, 6)}',
      orderId: json['orderId'] ?? json['order']?.toString() ?? '',
      driverName: json['driverName'] ?? json['driver']?['name'] ?? 'Assigned Driver',
      driverPhone: json['driverPhone'] ?? json['driver']?['phone'] ?? '',
      vehicleNumber: json['vehicleNumber'] ?? json['vehicle'] ?? 'KA-01-EA-1234',
      status: json['status'] ?? 'In Transit',
      currentAddress: json['currentAddress'] ?? json['location'] ?? 'Dispatched from Warehouse',
      estimatedDelivery: json['estimatedDelivery'] != null ? DateTime.parse(json['estimatedDelivery']) : null,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }
}

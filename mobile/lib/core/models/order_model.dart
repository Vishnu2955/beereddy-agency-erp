import 'user_model.dart';

class OrderItemModel {
  final String productId;
  final String productName;
  final double price;
  final int quantity;
  final double total;

  OrderItemModel({
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
    required this.total,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    dynamic prod = json['product'] ?? json['productId'];
    String pId = prod is Map ? (prod['_id'] ?? '') : (prod?.toString() ?? '');
    String pName = json['productName'] ?? (prod is Map ? prod['name'] : '') ?? '';

    return OrderItemModel(
      productId: pId,
      productName: pName,
      price: (json['price'] ?? 0).toDouble(),
      quantity: json['quantity'] ?? 1,
      total: (json['total'] ?? json['price'] * json['quantity'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product': productId,
      'productName': productName,
      'price': price,
      'quantity': quantity,
      'total': total,
    };
  }
}

class OrderModel {
  final String id;
  final String orderNumber;
  final dynamic retailer; // Can be String ID or UserModel object
  final List<OrderItemModel> items;
  final double totalAmount;
  final double gstAmount;
  final String status; // 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'
  final String paymentStatus; // 'Unpaid', 'Partially Paid', 'Paid'
  final String deliveryAddress;
  final DateTime createdAt;

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.retailer,
    required this.items,
    required this.totalAmount,
    required this.gstAmount,
    required this.status,
    required this.paymentStatus,
    required this.deliveryAddress,
    required this.createdAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    var rawItems = json['items'] as List? ?? [];
    List<OrderItemModel> itemList = rawItems.map((item) => OrderItemModel.fromJson(item)).toList();

    return OrderModel(
      id: json['_id'] ?? json['id'] ?? '',
      orderNumber: json['orderNumber'] ?? json['orderId'] ?? 'ORD-${json['_id']?.toString().substring(0, 6)}',
      retailer: json['retailer'] != null && json['retailer'] is Map
          ? UserModel.fromJson(json['retailer'])
          : (json['retailer']?.toString() ?? ''),
      items: itemList,
      totalAmount: (json['totalAmount'] ?? json['total'] ?? 0).toDouble(),
      gstAmount: (json['gstAmount'] ?? json['tax'] ?? 0).toDouble(),
      status: json['status'] ?? 'Pending',
      paymentStatus: json['paymentStatus'] ?? 'Unpaid',
      deliveryAddress: json['deliveryAddress'] ?? json['shippingAddress'] ?? '',
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }
}

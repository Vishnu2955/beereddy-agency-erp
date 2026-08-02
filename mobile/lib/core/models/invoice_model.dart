import 'order_model.dart';
import 'user_model.dart';

class InvoiceModel {
  final String id;
  final String invoiceNumber;
  final dynamic order; // OrderId or OrderModel
  final dynamic retailer; // RetailerId or UserModel
  final double amount;
  final double gstAmount;
  final double grandTotal;
  final String status; // 'Paid', 'Unpaid', 'Overdue'
  final DateTime dueDate;
  final DateTime createdAt;

  InvoiceModel({
    required this.id,
    required this.invoiceNumber,
    required this.order,
    required this.retailer,
    required this.amount,
    required this.gstAmount,
    required this.grandTotal,
    required this.status,
    required this.dueDate,
    required this.createdAt,
  });

  factory InvoiceModel.fromJson(Map<String, dynamic> json) {
    return InvoiceModel(
      id: json['_id'] ?? json['id'] ?? '',
      invoiceNumber: json['invoiceNumber'] ?? 'INV-${json['_id']?.toString().substring(0, 6)}',
      order: json['order'] != null && json['order'] is Map
          ? OrderModel.fromJson(json['order'])
          : json['order']?.toString() ?? '',
      retailer: json['retailer'] != null && json['retailer'] is Map
          ? UserModel.fromJson(json['retailer'])
          : json['retailer']?.toString() ?? '',
      amount: (json['amount'] ?? json['subTotal'] ?? 0).toDouble(),
      gstAmount: (json['gstAmount'] ?? json['tax'] ?? 0).toDouble(),
      grandTotal: (json['grandTotal'] ?? json['totalAmount'] ?? 0).toDouble(),
      status: json['status'] ?? 'Unpaid',
      dueDate: json['dueDate'] != null ? DateTime.parse(json['dueDate']) : DateTime.now().add(const Duration(days: 15)),
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }
}

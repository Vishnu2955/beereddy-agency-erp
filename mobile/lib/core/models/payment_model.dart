import 'user_model.dart';

class PaymentModel {
  final String id;
  final dynamic retailer;
  final double amount;
  final String paymentMode; // 'UPI', 'Bank Transfer', 'Cheque', 'Cash'
  final String referenceNumber;
  final String status; // 'Pending', 'Approved', 'Rejected'
  final String? screenshotUrl;
  final String? remarks;
  final DateTime createdAt;

  PaymentModel({
    required this.id,
    required this.retailer,
    required this.amount,
    required this.paymentMode,
    required this.referenceNumber,
    required this.status,
    this.screenshotUrl,
    this.remarks,
    required this.createdAt,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      id: json['_id'] ?? json['id'] ?? '',
      retailer: json['retailer'] != null && json['retailer'] is Map
          ? UserModel.fromJson(json['retailer'])
          : json['retailer']?.toString() ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      paymentMode: json['paymentMode'] ?? json['method'] ?? 'UPI',
      referenceNumber: json['referenceNumber'] ?? json['transactionId'] ?? '',
      status: json['status'] ?? 'Pending',
      screenshotUrl: json['screenshotUrl'] ?? json['screenshot'],
      remarks: json['remarks'] ?? json['note'],
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }
}

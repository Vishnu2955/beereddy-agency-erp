class UserModel {
  final String id;
  final String fullName;
  final String shopName;
  final String phone;
  final String email;
  final String role; // 'admin' | 'retailer' | 'driver'
  final String address;
  final String gstNumber;
  final double creditLimit;
  final bool isActive;

  UserModel({
    required this.id,
    required this.fullName,
    required this.shopName,
    required this.phone,
    required this.email,
    required this.role,
    required this.address,
    required this.gstNumber,
    required this.creditLimit,
    required this.isActive,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? json['id'] ?? '',
      fullName: json['fullName'] ?? json['name'] ?? '',
      shopName: json['shopName'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'retailer',
      address: json['address'] ?? '',
      gstNumber: json['gstNumber'] ?? '',
      creditLimit: (json['creditLimit'] ?? 0).toDouble(),
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'fullName': fullName,
      'shopName': shopName,
      'phone': phone,
      'email': email,
      'role': role,
      'address': address,
      'gstNumber': gstNumber,
      'creditLimit': creditLimit,
      'isActive': isActive,
    };
  }
}

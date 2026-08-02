class ProductModel {
  final String id;
  final String name;
  final String sku;
  final String category;
  final double price;
  final double mrp;
  final int stockQuantity;
  final String description;
  final String? imageUrl;
  final bool isAvailable;

  ProductModel({
    required this.id,
    required this.name,
    required this.sku,
    required this.category,
    required this.price,
    required this.mrp,
    required this.stockQuantity,
    required this.description,
    this.imageUrl,
    required this.isAvailable,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      sku: json['sku'] ?? '',
      category: json['category'] ?? 'Tile Adhesive',
      price: (json['price'] ?? 0).toDouble(),
      mrp: (json['mrp'] ?? json['price'] ?? 0).toDouble(),
      stockQuantity: json['stockQuantity'] ?? json['stock'] ?? 0,
      description: json['description'] ?? '',
      imageUrl: json['imageUrl'] ?? json['image'],
      isAvailable: json['isAvailable'] ?? json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'sku': sku,
      'category': category,
      'price': price,
      'mrp': mrp,
      'stockQuantity': stockQuantity,
      'description': description,
      'imageUrl': imageUrl,
      'isAvailable': isAvailable,
    };
  }
}

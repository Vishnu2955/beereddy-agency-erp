import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/models/product_model.dart';

class CartItem {
  final ProductModel product;
  int quantity;

  CartItem({required this.product, this.quantity = 1});

  double get subtotal => product.price * quantity;
}

class CartState {
  final List<CartItem> items;

  CartState({this.items = const []});

  double get subTotal => items.fold(0, (sum, item) => sum + item.subtotal);
  double get gstAmount => subTotal * 0.18; // 18% GST for Tile Adhesives
  double get grandTotal => subTotal + gstAmount;
  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);
}

final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier();
});

class CartNotifier extends StateNotifier<CartState> {
  CartNotifier() : super(CartState());

  void addToCart(ProductModel product, {int quantity = 1}) {
    final existingIndex = state.items.indexWhere((item) => item.product.id == product.id);
    if (existingIndex >= 0) {
      final updatedList = List<CartItem>.from(state.items);
      updatedList[existingIndex].quantity += quantity;
      state = CartState(items: updatedList);
    } else {
      state = CartState(items: [...state.items, CartItem(product: product, quantity: quantity)]);
    }
  }

  void updateQuantity(String productId, int newQuantity) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    final updatedList = state.items.map((item) {
      if (item.product.id == productId) {
        return CartItem(product: item.product, quantity: newQuantity);
      }
      return item;
    }).toList();
    state = CartState(items: updatedList);
  }

  void removeFromCart(String productId) {
    final updatedList = state.items.where((item) => item.product.id != productId).toList();
    state = CartState(items: updatedList);
  }

  void clearCart() {
    state = CartState(items: []);
  }
}

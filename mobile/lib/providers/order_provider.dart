import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/models/order_model.dart';
import '../core/constants/api_constants.dart';
import 'auth_provider.dart';

class OrderState {
  final bool isLoading;
  final List<OrderModel> orders;
  final String? error;

  OrderState({
    this.isLoading = false,
    this.orders = const [],
    this.error,
  });

  OrderState copyWith({
    bool? isLoading,
    List<OrderModel>? orders,
    String? error,
  }) {
    return OrderState(
      isLoading: isLoading ?? this.isLoading,
      orders: orders ?? this.orders,
      error: error,
    );
  }
}

final orderProvider = StateNotifierProvider<OrderNotifier, OrderState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  final auth = ref.watch(authProvider);
  return OrderNotifier(apiService, auth.user?.role ?? 'retailer');
});

class OrderNotifier extends StateNotifier<OrderState> {
  final dynamic _apiService;
  final String _userRole;

  OrderNotifier(this._apiService, this._userRole) : super(OrderState()) {
    fetchOrders();
  }

  Future<void> fetchOrders() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final endpoint = _userRole == 'admin' ? ApiConstants.orders : ApiConstants.myOrders;
      final res = await _apiService.get(endpoint);

      List<OrderModel> list = [];
      if (res is List) {
        list = res.map((item) => OrderModel.fromJson(item)).toList();
      } else if (res is Map && res['orders'] is List) {
        list = (res['orders'] as List).map((item) => OrderModel.fromJson(item)).toList();
      } else if (res is Map && res['data'] is List) {
        list = (res['data'] as List).map((item) => OrderModel.fromJson(item)).toList();
      }

      state = state.copyWith(isLoading: false, orders: list);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }

  Future<bool> placeOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _apiService.post(
        ApiConstants.orders,
        data: {
          'items': items,
          'deliveryAddress': deliveryAddress,
        },
      );
      await fetchOrders();
      return res['success'] == true || res['_id'] != null;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
      return false;
    }
  }

  Future<bool> updateOrderStatus(String orderId, String newStatus) async {
    try {
      final res = await _apiService.put(
        '${ApiConstants.orders}/$orderId/status',
        data: {'status': newStatus},
      );
      await fetchOrders();
      return res['success'] == true;
    } catch (e) {
      rethrow;
    }
  }
}

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/models/delivery_model.dart';
import '../core/constants/api_constants.dart';
import 'auth_provider.dart';

class DeliveryState {
  final bool isLoading;
  final List<DeliveryModel> deliveries;
  final String? error;

  DeliveryState({
    this.isLoading = false,
    this.deliveries = const [],
    this.error,
  });

  DeliveryState copyWith({
    bool? isLoading,
    List<DeliveryModel>? deliveries,
    String? error,
  }) {
    return DeliveryState(
      isLoading: isLoading ?? this.isLoading,
      deliveries: deliveries ?? this.deliveries,
      error: error,
    );
  }
}

final deliveryProvider = StateNotifierProvider<DeliveryNotifier, DeliveryState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return DeliveryNotifier(apiService);
});

class DeliveryNotifier extends StateNotifier<DeliveryState> {
  final dynamic _apiService;

  DeliveryNotifier(this._apiService) : super(DeliveryState()) {
    fetchDeliveries();
  }

  Future<void> fetchDeliveries() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _apiService.get(ApiConstants.delivery);
      List<DeliveryModel> list = [];
      if (res is List) {
        list = res.map((item) => DeliveryModel.fromJson(item)).toList();
      } else if (res is Map && res['deliveries'] is List) {
        list = (res['deliveries'] as List).map((item) => DeliveryModel.fromJson(item)).toList();
      } else if (res is Map && res['data'] is List) {
        list = (res['data'] as List).map((item) => DeliveryModel.fromJson(item)).toList();
      }

      state = state.copyWith(isLoading: false, deliveries: list);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }
}

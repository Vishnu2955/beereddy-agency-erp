import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/models/payment_model.dart';
import '../core/constants/api_constants.dart';
import 'auth_provider.dart';

class PaymentState {
  final bool isLoading;
  final List<PaymentModel> payments;
  final String? error;

  PaymentState({
    this.isLoading = false,
    this.payments = const [],
    this.error,
  });

  PaymentState copyWith({
    bool? isLoading,
    List<PaymentModel>? payments,
    String? error,
  }) {
    return PaymentState(
      isLoading: isLoading ?? this.isLoading,
      payments: payments ?? this.payments,
      error: error,
    );
  }
}

final paymentProvider = StateNotifierProvider<PaymentNotifier, PaymentState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return PaymentNotifier(apiService);
});

class PaymentNotifier extends StateNotifier<PaymentState> {
  final dynamic _apiService;

  PaymentNotifier(this._apiService) : super(PaymentState()) {
    fetchPayments();
  }

  Future<void> fetchPayments() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _apiService.get(ApiConstants.payments);
      List<PaymentModel> list = [];
      if (res is List) {
        list = res.map((item) => PaymentModel.fromJson(item)).toList();
      } else if (res is Map && res['payments'] is List) {
        list = (res['payments'] as List).map((item) => PaymentModel.fromJson(item)).toList();
      } else if (res is Map && res['data'] is List) {
        list = (res['data'] as List).map((item) => PaymentModel.fromJson(item)).toList();
      }

      state = state.copyWith(isLoading: false, payments: list);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }

  Future<bool> submitPayment({
    required double amount,
    required String paymentMode,
    required String referenceNumber,
    String? imagePath,
    String? remarks,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      if (imagePath != null && imagePath.isNotEmpty) {
        await _apiService.uploadFile(
          ApiConstants.payments,
          imagePath,
          'screenshot',
          extraData: {
            'amount': amount,
            'paymentMode': paymentMode,
            'referenceNumber': referenceNumber,
            'remarks': remarks ?? '',
          },
        );
      } else {
        await _apiService.post(
          ApiConstants.payments,
          data: {
            'amount': amount,
            'paymentMode': paymentMode,
            'referenceNumber': referenceNumber,
            'remarks': remarks ?? '',
          },
        );
      }
      await fetchPayments();
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
      return false;
    }
  }

  Future<bool> updatePaymentStatus(String paymentId, String status) async {
    try {
      final res = await _apiService.put(
        '${ApiConstants.payments}/$paymentId/status',
        data: {'status': status},
      );
      await fetchPayments();
      return res['success'] == true;
    } catch (e) {
      rethrow;
    }
  }
}

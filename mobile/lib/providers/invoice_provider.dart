import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/models/invoice_model.dart';
import '../core/constants/api_constants.dart';
import 'auth_provider.dart';

class InvoiceState {
  final bool isLoading;
  final List<InvoiceModel> invoices;
  final String? error;

  InvoiceState({
    this.isLoading = false,
    this.invoices = const [],
    this.error,
  });

  InvoiceState copyWith({
    bool? isLoading,
    List<InvoiceModel>? invoices,
    String? error,
  }) {
    return InvoiceState(
      isLoading: isLoading ?? this.isLoading,
      invoices: invoices ?? this.invoices,
      error: error,
    );
  }
}

final invoiceProvider = StateNotifierProvider<InvoiceNotifier, InvoiceState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return InvoiceNotifier(apiService);
});

class InvoiceNotifier extends StateNotifier<InvoiceState> {
  final dynamic _apiService;

  InvoiceNotifier(this._apiService) : super(InvoiceState()) {
    fetchInvoices();
  }

  Future<void> fetchInvoices() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _apiService.get(ApiConstants.invoices);
      List<InvoiceModel> list = [];
      if (res is List) {
        list = res.map((item) => InvoiceModel.fromJson(item)).toList();
      } else if (res is Map && res['invoices'] is List) {
        list = (res['invoices'] as List).map((item) => InvoiceModel.fromJson(item)).toList();
      } else if (res is Map && res['data'] is List) {
        list = (res['data'] as List).map((item) => InvoiceModel.fromJson(item)).toList();
      }

      state = state.copyWith(isLoading: false, invoices: list);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }
}

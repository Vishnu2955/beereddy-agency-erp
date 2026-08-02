import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/models/dashboard_model.dart';
import '../core/constants/api_constants.dart';
import 'auth_provider.dart';

class DashboardState {
  final bool isLoading;
  final DashboardStatsModel? stats;
  final String? error;

  DashboardState({
    this.isLoading = false,
    this.stats,
    this.error,
  });

  DashboardState copyWith({
    bool? isLoading,
    DashboardStatsModel? stats,
    String? error,
  }) {
    return DashboardState(
      isLoading: isLoading ?? this.isLoading,
      stats: stats ?? this.stats,
      error: error,
    );
  }
}

final dashboardProvider = StateNotifierProvider<DashboardNotifier, DashboardState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return DashboardNotifier(apiService);
});

class DashboardNotifier extends StateNotifier<DashboardState> {
  final dynamic _apiService;

  DashboardNotifier(this._apiService) : super(DashboardState()) {
    fetchDashboard();
  }

  Future<void> fetchDashboard() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _apiService.get(ApiConstants.dashboardStats);
      DashboardStatsModel stats;
      if (res is Map<String, dynamic>) {
        stats = DashboardStatsModel.fromJson(res['data'] ?? res);
      } else {
        stats = DashboardStatsModel(
          totalSales: 0,
          totalOrders: 0,
          pendingOrders: 0,
          lowStockCount: 0,
          outstandingBalance: 0,
        );
      }
      state = state.copyWith(isLoading: false, stats: stats);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }
}

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/models/notification_model.dart';
import '../core/constants/api_constants.dart';
import 'auth_provider.dart';

class NotificationState {
  final bool isLoading;
  final List<NotificationModel> notifications;
  final int unreadCount;
  final String? error;

  NotificationState({
    this.isLoading = false,
    this.notifications = const [],
    this.unreadCount = 0,
    this.error,
  });

  NotificationState copyWith({
    bool? isLoading,
    List<NotificationModel>? notifications,
    int? unreadCount,
    String? error,
  }) {
    return NotificationState(
      isLoading: isLoading ?? this.isLoading,
      notifications: notifications ?? this.notifications,
      unreadCount: unreadCount ?? this.unreadCount,
      error: error,
    );
  }
}

final notificationProvider = StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return NotificationNotifier(apiService);
});

class NotificationNotifier extends StateNotifier<NotificationState> {
  final dynamic _apiService;

  NotificationNotifier(this._apiService) : super(NotificationState()) {
    fetchNotifications();
  }

  Future<void> fetchNotifications() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _apiService.get(ApiConstants.notifications);
      List<NotificationModel> list = [];
      if (res is List) {
        list = res.map((item) => NotificationModel.fromJson(item)).toList();
      } else if (res is Map && res['notifications'] is List) {
        list = (res['notifications'] as List).map((item) => NotificationModel.fromJson(item)).toList();
      } else if (res is Map && res['data'] is List) {
        list = (res['data'] as List).map((item) => NotificationModel.fromJson(item)).toList();
      }

      final unread = list.where((n) => !n.isRead).length;
      state = state.copyWith(isLoading: false, notifications: list, unreadCount: unread);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      await _apiService.put('${ApiConstants.notifications}/read/$notificationId');
      fetchNotifications();
    } catch (e) {
      // Ignore
    }
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/notification_provider.dart';
import '../../widgets/common_widgets.dart';

class NotificationScreen extends ConsumerWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifState = ref.watch(notificationProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.read(notificationProvider.notifier).fetchNotifications(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(notificationProvider.notifier).fetchNotifications();
        },
        child: notifState.isLoading
            ? const AppLoadingSpinner(message: 'Loading notifications...')
            : notifState.notifications.isEmpty
                ? const AppEmptyState(
                    title: 'No Notifications',
                    subtitle: 'Notifications about orders and payments will appear here.',
                    icon: Icons.notifications_off_outlined,
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: notifState.notifications.length,
                    itemBuilder: (context, index) {
                      final n = notifState.notifications[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        color: n.isRead ? null : AppColors.primaryTeal.withOpacity(0.05),
                        child: ListTile(
                          onTap: () {
                            ref.read(notificationProvider.notifier).markAsRead(n.id);
                          },
                          leading: Icon(
                            n.isRead
                                ? Icons.notifications_none_rounded
                                : Icons.notifications_active_rounded,
                            color: n.isRead ? Colors.grey : AppColors.primaryTeal,
                          ),
                          title: Text(
                            n.title,
                            style: TextStyle(
                              fontWeight: n.isRead ? FontWeight.normal : FontWeight.bold,
                            ),
                          ),
                          subtitle: Text(
                            '${n.message}\n${n.createdAt.toString().split('.')[0]}',
                          ),
                          isThreeLine: true,
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}

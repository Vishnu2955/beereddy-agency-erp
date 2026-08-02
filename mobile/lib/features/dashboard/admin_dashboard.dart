import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../providers/order_provider.dart';
import '../../widgets/common_widgets.dart';

class AdminDashboard extends ConsumerWidget {
  const AdminDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final dashboardState = ref.watch(dashboardProvider);
    final orderState = ref.watch(orderProvider);
    final user = authState.user;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Admin ERP Control Center',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            Text(
              user?.fullName ?? 'Administrator',
              style: const TextStyle(fontSize: 12, color: Colors.white70),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => context.push('/notifications'),
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(dashboardProvider.notifier).fetchDashboard();
          await ref.read(orderProvider.notifier).fetchOrders();
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Overall Admin Metrics
              Row(
                children: [
                  Expanded(
                    child: StatCard(
                      title: 'Total Revenue',
                      value: '₹${dashboardState.stats?.totalSales.toStringAsFixed(0) ?? "0"}',
                      icon: Icons.monetization_on_outlined,
                      color: AppColors.primaryTeal,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: StatCard(
                      title: 'Total Orders',
                      value: '${dashboardState.stats?.totalOrders ?? orderState.orders.length}',
                      icon: Icons.inventory_outlined,
                      color: AppColors.primaryBlue,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: StatCard(
                      title: 'Pending Orders',
                      value: '${dashboardState.stats?.pendingOrders ?? 0}',
                      icon: Icons.pending_actions_outlined,
                      color: Colors.orange,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: StatCard(
                      title: 'Low Stock Alert',
                      value: '${dashboardState.stats?.lowStockCount ?? 0}',
                      icon: Icons.warning_amber_rounded,
                      color: Colors.redAccent,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Admin Quick Actions
              Text(
                'Management Console',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 4,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                children: [
                  _buildAdminShortcut(
                    context,
                    icon: Icons.all_inbox_rounded,
                    label: 'All Orders',
                    color: Colors.indigo,
                    onTap: () => context.push('/orders'),
                  ),
                  _buildAdminShortcut(
                    context,
                    icon: Icons.inventory_2_outlined,
                    label: 'Catalog',
                    color: Colors.teal,
                    onTap: () => context.push('/products'),
                  ),
                  _buildAdminShortcut(
                    context,
                    icon: Icons.receipt_long_outlined,
                    label: 'Invoices',
                    color: Colors.deepPurple,
                    onTap: () => context.push('/invoices'),
                  ),
                  _buildAdminShortcut(
                    context,
                    icon: Icons.local_shipping_outlined,
                    label: 'Deliveries',
                    color: Colors.blue,
                    onTap: () => context.push('/delivery'),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Orders Requiring Approval
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Recent ERP Orders',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  TextButton(
                    onPressed: () => context.push('/orders'),
                    child: const Text('Manage All'),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              if (orderState.isLoading)
                const AppLoadingSpinner(message: 'Loading orders...')
              else if (orderState.orders.isEmpty)
                const AppEmptyState(
                  title: 'No Orders Yet',
                  subtitle: 'Retailer orders will appear here for processing.',
                  icon: Icons.assignment_turned_in_outlined,
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: orderState.orders.take(5).length,
                  itemBuilder: (context, index) {
                    final order = orderState.orders[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 10),
                      child: ListTile(
                        onTap: () => context.push('/orders/${order.id}'),
                        leading: const CircleAvatar(
                          backgroundColor: Colors.blue,
                          child: Icon(Icons.shopping_bag_outlined, color: Colors.white),
                        ),
                        title: Text(
                          order.orderNumber,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text('Total: ₹${order.totalAmount.toStringAsFixed(2)}'),
                        trailing: DropdownButton<String>(
                          value: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']
                                  .contains(order.status)
                              ? order.status
                              : 'Pending',
                          onChanged: (newStatus) async {
                            if (newStatus != null) {
                              await ref
                                  .read(orderProvider.notifier)
                                  .updateOrderStatus(order.id, newStatus);
                            }
                          },
                          items: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']
                              .map((status) => DropdownMenuItem(
                                    value: status,
                                    child: Text(
                                      status,
                                      style: const TextStyle(fontSize: 12),
                                    ),
                                  ))
                              .toList(),
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAdminShortcut(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}

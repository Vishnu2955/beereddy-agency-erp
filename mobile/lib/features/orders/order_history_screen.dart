import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/order_provider.dart';
import '../../widgets/common_widgets.dart';

class OrderHistoryScreen extends ConsumerStatefulWidget {
  const OrderHistoryScreen({super.key});

  @override
  ConsumerState<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends ConsumerState<OrderHistoryScreen> {
  @override
  void initState() {
    super.initState();
    // Ensure orders are fetched when the screen is opened
    Future.microtask(() => ref.read(orderProvider.notifier).fetchOrders());
  }

  @override
  Widget build(BuildContext context) {
    final orderState = ref.watch(orderProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Order History'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.read(orderProvider.notifier).fetchOrders(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(orderProvider.notifier).fetchOrders();
        },
        child: orderState.isLoading
            ? const AppLoadingSpinner(message: 'Loading orders...')
            : orderState.error != null
                ? AppErrorState(
                    errorMessage: orderState.error!,
                    onRetry: () => ref.read(orderProvider.notifier).fetchOrders(),
                  )
                : orderState.orders.isEmpty
                    ? const AppEmptyState(
                        title: 'No Orders Found',
                        subtitle: 'Orders placed with Beereddy Agency will appear here.',
                        icon: Icons.receipt_long_outlined,
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: orderState.orders.length,
                        itemBuilder: (context, index) {
                          final order = orderState.orders[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              onTap: () => context.push('/orders/${order.id}'),
                              contentPadding:
                                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              leading: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: _getStatusColor(order.status).withOpacity(0.12),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.local_shipping_rounded,
                                  color: _getStatusColor(order.status),
                                ),
                              ),
                              title: Text(
                                order.orderNumber,
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 4),
                                  Text('${order.items.length} Items • Total: ₹${order.totalAmount.toStringAsFixed(2)}'),
                                  Text(
                                    'Date: ${order.createdAt.toString().split(' ')[0]}',
                                    style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                                  ),
                                ],
                              ),
                              trailing: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _getStatusColor(order.status).withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      order.status,
                                      style: TextStyle(
                                        color: _getStatusColor(order.status),
                                        fontWeight: FontWeight.bold,
                                        fontSize: 11,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  const Icon(Icons.arrow_forward_ios_rounded, size: 14),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'delivered':
        return Colors.green;
      case 'shipped':
        return Colors.blue;
      case 'pending':
        return Colors.orange;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/delivery_provider.dart';
import '../../widgets/common_widgets.dart';

class DeliveryTrackingScreen extends ConsumerWidget {
  const DeliveryTrackingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final deliveryState = ref.watch(deliveryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery Tracking'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.read(deliveryProvider.notifier).fetchDeliveries(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(deliveryProvider.notifier).fetchDeliveries();
        },
        child: deliveryState.isLoading
            ? const AppLoadingSpinner(message: 'Loading deliveries...')
            : deliveryState.error != null
                ? AppErrorState(
                    errorMessage: deliveryState.error!,
                    onRetry: () => ref.read(deliveryProvider.notifier).fetchDeliveries(),
                  )
                : deliveryState.deliveries.isEmpty
                    ? const AppEmptyState(
                        title: 'No Active Deliveries',
                        subtitle: 'V Bond dispatch and tracking updates will appear here.',
                        icon: Icons.local_shipping_outlined,
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: deliveryState.deliveries.length,
                        itemBuilder: (context, index) {
                          final delivery = deliveryState.deliveries[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        delivery.trackingId,
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: AppColors.primaryTeal),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: AppColors.primaryTeal.withOpacity(0.15),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          delivery.status,
                                          style: const TextStyle(
                                            color: AppColors.primaryTeal,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Divider(height: 20),
                                  Row(
                                    children: [
                                      const Icon(Icons.person_pin_circle_outlined,
                                          color: Colors.grey),
                                      const SizedBox(width: 10),
                                      Text('Driver: ${delivery.driverName} (${delivery.driverPhone})'),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      const Icon(Icons.directions_bus_outlined,
                                          color: Colors.grey),
                                      const SizedBox(width: 10),
                                      Text('Vehicle: ${delivery.vehicleNumber}'),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      const Icon(Icons.my_location_rounded, color: Colors.grey),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Text(
                                          'Location: ${delivery.currentAddress}',
                                          style: const TextStyle(fontWeight: FontWeight.w500),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
      ),
    );
  }
}

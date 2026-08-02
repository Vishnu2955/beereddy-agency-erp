import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/payment_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common_widgets.dart';

class PaymentHistoryScreen extends ConsumerWidget {
  const PaymentHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final paymentState = ref.watch(paymentProvider);
    final userRole = ref.watch(authProvider).user?.role ?? 'retailer';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment History'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.read(paymentProvider.notifier).fetchPayments(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(paymentProvider.notifier).fetchPayments();
        },
        child: paymentState.isLoading
            ? const AppLoadingSpinner(message: 'Loading payments...')
            : paymentState.error != null
                ? AppErrorState(
                    errorMessage: paymentState.error!,
                    onRetry: () => ref.read(paymentProvider.notifier).fetchPayments(),
                  )
                : paymentState.payments.isEmpty
                    ? const AppEmptyState(
                        title: 'No Payments Recorded',
                        subtitle: 'Payments submitted for ERP invoices will appear here.',
                        icon: Icons.payments_outlined,
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: paymentState.payments.length,
                        itemBuilder: (context, index) {
                          final payment = paymentState.payments[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: _getStatusColor(payment.status).withOpacity(0.15),
                                child: Icon(Icons.payment_rounded,
                                    color: _getStatusColor(payment.status)),
                              ),
                              title: Text(
                                '₹${payment.amount.toStringAsFixed(2)}',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                              subtitle: Text(
                                'Mode: ${payment.paymentMode} • Ref: ${payment.referenceNumber.isNotEmpty ? payment.referenceNumber : "N/A"}\nDate: ${payment.createdAt.toString().split(' ')[0]}',
                              ),
                              isThreeLine: true,
                              trailing: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _getStatusColor(payment.status).withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Text(
                                      payment.status,
                                      style: TextStyle(
                                        color: _getStatusColor(payment.status),
                                        fontWeight: FontWeight.bold,
                                        fontSize: 11,
                                      ),
                                    ),
                                  ),
                                  if (userRole == 'admin' && payment.status.toLowerCase() == 'pending') ...[
                                    const SizedBox(height: 4),
                                    Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        InkWell(
                                          onTap: () => ref
                                              .read(paymentProvider.notifier)
                                              .updatePaymentStatus(payment.id, 'Approved'),
                                          child: const Icon(Icons.check_circle,
                                              color: Colors.green, size: 20),
                                        ),
                                        const SizedBox(width: 8),
                                        InkWell(
                                          onTap: () => ref
                                              .read(paymentProvider.notifier)
                                              .updatePaymentStatus(payment.id, 'Rejected'),
                                          child: const Icon(Icons.cancel,
                                              color: Colors.red, size: 20),
                                        ),
                                      ],
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          );
                        },
                      ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/add-payment'),
        backgroundColor: AppColors.primaryTeal,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('SUBMIT PAYMENT', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'rejected':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}

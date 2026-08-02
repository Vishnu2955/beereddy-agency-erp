import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/invoice_provider.dart';
import '../../core/services/pdf_service.dart';
import '../../widgets/common_widgets.dart';

class InvoiceListScreen extends ConsumerWidget {
  const InvoiceListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final invoiceState = ref.watch(invoiceProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tax Invoices'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.read(invoiceProvider.notifier).fetchInvoices(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(invoiceProvider.notifier).fetchInvoices();
        },
        child: invoiceState.isLoading
            ? const AppLoadingSpinner(message: 'Fetching invoices...')
            : invoiceState.error != null
                ? AppErrorState(
                    errorMessage: invoiceState.error!,
                    onRetry: () => ref.read(invoiceProvider.notifier).fetchInvoices(),
                  )
                : invoiceState.invoices.isEmpty
                    ? const AppEmptyState(
                        title: 'No Invoices Yet',
                        subtitle: 'Invoices generated for your orders will appear here.',
                        icon: Icons.receipt_outlined,
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: invoiceState.invoices.length,
                        itemBuilder: (context, index) {
                          final invoice = invoiceState.invoices[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              onTap: () => context.push('/invoices/${invoice.id}'),
                              leading: CircleAvatar(
                                backgroundColor: AppColors.primaryTeal.withOpacity(0.12),
                                child: const Icon(Icons.picture_as_pdf_rounded,
                                    color: AppColors.primaryTeal),
                              ),
                              title: Text(
                                invoice.invoiceNumber,
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              subtitle: Text(
                                'Grand Total: ₹${invoice.grandTotal.toStringAsFixed(2)}\nDue: ${invoice.dueDate.toString().split(' ')[0]}',
                              ),
                              isThreeLine: true,
                              trailing: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.download_rounded, color: AppColors.primaryTeal),
                                    onPressed: () async {
                                      await PdfInvoiceService.printOrShareInvoice(invoice);
                                    },
                                    tooltip: 'Print / Share PDF',
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

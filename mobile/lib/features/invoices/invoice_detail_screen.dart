import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/invoice_provider.dart';
import '../../core/services/pdf_service.dart';
import '../../widgets/common_widgets.dart';

class InvoiceDetailScreen extends ConsumerWidget {
  final String invoiceId;
  const InvoiceDetailScreen({super.key, required this.invoiceId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final invoiceState = ref.watch(invoiceProvider);
    final invoiceList = invoiceState.invoices.where((i) => i.id == invoiceId).toList();

    if (invoiceList.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Invoice Details')),
        body: const AppEmptyState(
          title: 'Invoice Not Found',
          subtitle: 'The selected invoice could not be located.',
          icon: Icons.search_off_rounded,
        ),
      );
    }

    final invoice = invoiceList.first;

    return Scaffold(
      appBar: AppBar(
        title: Text(invoice.invoiceNumber),
        actions: [
          IconButton(
            icon: const Icon(Icons.print_rounded),
            onPressed: () => PdfInvoiceService.printOrShareInvoice(invoice),
            tooltip: 'Print / Share PDF',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Banner Card
            Card(
              color: AppColors.primaryTeal,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'BEEREDDY AGENCY',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            invoice.status.toUpperCase(),
                            style: const TextStyle(
                              color: AppColors.primaryTeal,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Invoice Amount', style: TextStyle(color: Colors.white70)),
                        Text(
                          '₹${invoice.grandTotal.toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Metadata Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    _buildMetaRow('Invoice No', invoice.invoiceNumber),
                    const SizedBox(height: 8),
                    _buildMetaRow('Issued Date', invoice.createdAt.toString().split(' ')[0]),
                    const SizedBox(height: 8),
                    _buildMetaRow('Due Date', invoice.dueDate.toString().split(' ')[0]),
                    const SizedBox(height: 8),
                    _buildMetaRow('GST Tax (18%)', '₹${invoice.gstAmount.toStringAsFixed(2)}'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Action PDF Button
            ElevatedButton.icon(
              onPressed: () => PdfInvoiceService.printOrShareInvoice(invoice),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 50),
              ),
              icon: const Icon(Icons.picture_as_pdf_rounded),
              label: const Text('DOWNLOAD / PRINT PDF INVOICE'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetaRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
      ],
    );
  }
}

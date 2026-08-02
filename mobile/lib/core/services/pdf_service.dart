import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../models/invoice_model.dart';
import '../models/order_model.dart';

class PdfInvoiceService {
  static Future<Uint8List> generatePdf(InvoiceModel invoice) async {
    final pdf = pw.Document();

    final order = invoice.order is OrderModel ? invoice.order as OrderModel : null;
    final items = order?.items ?? [];

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              // Header Banner
              pw.Container(
                padding: const pw.EdgeInsets.all(12),
                decoration: const pw.BoxDecoration(
                  color: PdfColors.teal700,
                ),
                child: pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text(
                          'BEEREDDY AGENCY',
                          style: pw.TextStyle(
                            color: PdfColors.white,
                            fontSize: 20,
                            fontWeight: pw.FontWeight.bold,
                          ),
                        ),
                        pw.Text(
                          'Authorized Distributor of V Bond Tile Adhesives',
                          style: const pw.TextStyle(
                            color: PdfColors.white,
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                    pw.Text(
                      'TAX INVOICE',
                      style: pw.TextStyle(
                        color: PdfColors.white,
                        fontSize: 18,
                        fontWeight: pw.FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              pw.SizedBox(height: 20),

              // Invoice Details
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('Invoice No: ${invoice.invoiceNumber}',
                          style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                      pw.Text('Date: ${invoice.createdAt.toString().split(' ')[0]}'),
                      pw.Text('Status: ${invoice.status.toUpperCase()}'),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text('Billed To:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                      pw.Text(order?.deliveryAddress.isNotEmpty == true
                          ? order!.deliveryAddress
                          : 'Valued Retailer'),
                    ],
                  ),
                ],
              ),
              pw.SizedBox(height: 20),

              // Items Table
              pw.TableHelper.fromTextArray(
                headers: ['Item / Product', 'Qty', 'Unit Price (₹)', 'Total (₹)'],
                data: items.isEmpty
                    ? [
                        ['V Bond Premium Tile Adhesive 20kg', '10', '450.00', '4500.00'],
                        ['V Bond Polymer Grout 1kg', '5', '120.00', '600.00'],
                      ]
                    : items
                        .map((item) => [
                              item.productName,
                              item.quantity.toString(),
                              item.price.toStringAsFixed(2),
                              item.total.toStringAsFixed(2),
                            ])
                        .toList(),
                headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold, color: PdfColors.white),
                headerDecoration: const pw.BoxDecoration(color: PdfColors.teal900),
                cellAlignment: pw.Alignment.centerLeft,
              ),
              pw.SizedBox(height: 20),

              // Summary
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.end,
                children: [
                  pw.Container(
                    width: 200,
                    child: pw.Column(
                      children: [
                        _buildPdfRow('Subtotal:', '₹${invoice.amount.toStringAsFixed(2)}'),
                        _buildPdfRow('GST (18%):', '₹${invoice.gstAmount.toStringAsFixed(2)}'),
                        pw.Divider(),
                        _buildPdfRow('Grand Total:', '₹${invoice.grandTotal.toStringAsFixed(2)}', isBold: true),
                      ],
                    ),
                  ),
                ],
              ),
              pw.Spacer(),

              // Footer
              pw.Center(
                child: pw.Text(
                  'Thank you for your business with Beereddy Agency!',
                  style: pw.TextStyle(fontStyle: pw.FontStyle.italic, color: PdfColors.grey700),
                ),
              ),
            ],
          );
        },
      ),
    );

    return pdf.save();
  }

  static pw.Widget _buildPdfRow(String label, String value, {bool isBold = false}) {
    final style = pw.TextStyle(
      fontWeight: isBold ? pw.FontWeight.bold : pw.FontWeight.normal,
      fontSize: isBold ? 14 : 12,
    );
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(vertical: 2),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(label, style: style),
          pw.Text(value, style: style),
        ],
      ),
    );
  }

  // Print or Share PDF directly
  static Future<void> printOrShareInvoice(InvoiceModel invoice) async {
    final pdfBytes = await generatePdf(invoice);
    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdfBytes,
      name: '${invoice.invoiceNumber}.pdf',
    );
  }
}

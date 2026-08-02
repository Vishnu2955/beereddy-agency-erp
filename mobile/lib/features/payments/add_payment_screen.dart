import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../providers/payment_provider.dart';

class AddPaymentScreen extends ConsumerStatefulWidget {
  const AddPaymentScreen({super.key});

  @override
  ConsumerState<AddPaymentScreen> createState() => _AddPaymentScreenState();
}

class _AddPaymentScreenState extends ConsumerState<AddPaymentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _refNumberController = TextEditingController();
  final _remarksController = TextEditingController();
  String _paymentMode = 'UPI';
  File? _screenshotFile;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _amountController.dispose();
    _refNumberController.dispose();
    _remarksController.dispose();
    super.dispose();
  }

  Future<void> _pickScreenshot() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery);
    if (picked != null) {
      setState(() {
        _screenshotFile = File(picked.path);
      });
    }
  }

  void _submitPayment() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isSubmitting = true);

      final success = await ref.read(paymentProvider.notifier).submitPayment(
            amount: double.parse(_amountController.text.trim()),
            paymentMode: _paymentMode,
            referenceNumber: _refNumberController.text.trim(),
            imagePath: _screenshotFile?.path,
            remarks: _remarksController.text.trim(),
          );

      setState(() => _isSubmitting = false);

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment request submitted successfully!')),
        );
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Submit Payment'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Amount (₹)',
                  prefixIcon: Icon(Icons.currency_rupee_rounded),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Enter amount';
                  if (double.tryParse(val.trim()) == null) return 'Enter valid number';
                  return null;
                },
              ),
              const SizedBox(height: 16),

              DropdownButtonFormField<String>(
                value: _paymentMode,
                decoration: const InputDecoration(
                  labelText: 'Payment Mode',
                  prefixIcon: Icon(Icons.payment_outlined),
                ),
                items: ['UPI', 'Bank Transfer', 'Cheque', 'Cash']
                    .map((mode) => DropdownMenuItem(value: mode, child: Text(mode)))
                    .toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _paymentMode = val);
                },
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _refNumberController,
                decoration: const InputDecoration(
                  labelText: 'Transaction / UTR Reference No.',
                  prefixIcon: Icon(Icons.pin_rounded),
                ),
                validator: (val) => val == null || val.trim().isEmpty ? 'Enter reference no.' : null,
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _remarksController,
                decoration: const InputDecoration(
                  labelText: 'Remarks / Notes (Optional)',
                  prefixIcon: Icon(Icons.note_alt_outlined),
                ),
              ),
              const SizedBox(height: 20),

              // Image Attachment
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      if (_screenshotFile != null) ...[
                        Image.file(_screenshotFile!, height: 160, fit: BoxFit.cover),
                        const SizedBox(height: 10),
                      ],
                      OutlinedButton.icon(
                        onPressed: _pickScreenshot,
                        icon: const Icon(Icons.add_a_photo_outlined),
                        label: Text(_screenshotFile == null
                            ? 'Attach Payment Screenshot'
                            : 'Change Screenshot'),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitPayment,
                child: _isSubmitting
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('SUBMIT PAYMENT REQUEST'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

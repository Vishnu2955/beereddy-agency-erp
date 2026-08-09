import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'package:go_router/go_router.dart';
import '../../core/config/base_url.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/theme_provider.dart';
import '../../providers/auth_provider.dart';
import '../../core/services/api_service.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  late final TextEditingController _urlController;

  @override
  void initState() {
    super.initState();
    _urlController = TextEditingController(text: BaseUrlConfig.baseUrl);
    // fetch current company settings (logo) for admin preview
    Future.microtask(() => _fetchCompanySettings());
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  String? _logoUrl;

  Widget _buildLogoPreview() {
    final size = 48.0;
    if (_logoUrl == null) {
      return Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Icon(Icons.image_outlined, color: Colors.grey),
      );
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: Image.network(
        _logoUrl!,
        width: size,
        height: size,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => Container(
          width: size,
          height: size,
          color: Colors.grey.shade100,
          child: const Icon(Icons.broken_image_outlined, color: Colors.grey),
        ),
      ),
    );
  }

  Future<void> _fetchCompanySettings() async {
    try {
      final api = ref.read(apiServiceProvider);
      final res = await api.get('/settings/company');
      final settings = res['settings'] ?? res;
      final logo = settings['logo'] as String?;
      if (logo != null) {
        final url = logo.startsWith('/') ? '${BaseUrlConfig.baseUrl}$logo' : logo;
        setState(() => _logoUrl = url);
      }
    } catch (_) {}
  }

  Future<void> _pickAndUploadIcon() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery, maxWidth: 512, maxHeight: 512, imageQuality: 90);
    if (picked == null) return;

    final file = File(picked.path);
    try {
      final api = ref.read(apiServiceProvider);
      final res = await api.uploadFile('/settings/company', file.path, 'logo', method: 'put');
      if (res != null && res['success'] == true) {
        // Refresh local preview
        await _fetchCompanySettings();
        if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('App icon updated successfully')));
      } else {
        if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(res['message'] ?? 'Upload failed')));
      }
    } catch (e) {
      if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Upload error: ${e.toString()}')));
    }
  }

  void _showChangeUrlDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Backend API URL'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Configure the host address for your local server or production server:',
                style: TextStyle(fontSize: 13),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _urlController,
                decoration: const InputDecoration(
                  labelText: 'Base URL',
                  hintText: 'http://10.0.2.2:5000',
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                BaseUrlConfig.setCustomUrl(_urlController.text.trim());
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('API Base URL updated to: ${BaseUrlConfig.baseUrl}')),
                );
              },
              child: const Text('Save'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final themeMode = ref.watch(themeNotifierProvider);
    final isDark = themeMode == ThemeMode.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('App Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Admin App Icon management
          Consumer(
            builder: (context, ref, _) {
              final auth = ref.watch(authProvider);
              final isAdmin = auth.user?.role == 'admin';
              return Visibility(
                visible: isAdmin,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Branding', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryTeal)),
                    const SizedBox(height: 8),
                    Card(
                      child: ListTile(
                        leading: _buildLogoPreview(),
                        title: const Text('App Icon (Admin)'),
                        subtitle: const Text('Upload a square icon to be used inside the app UI'),
                        trailing: ElevatedButton(
                          onPressed: () => _pickAndUploadIcon(),
                          child: const Text('Change'),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              );
            },
          ),
          // Appearance Section
          const Text('Appearance', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryTeal)),
          const SizedBox(height: 8),
          Card(
            child: SwitchListTile(
              secondary: const Icon(Icons.dark_mode_outlined),
              title: const Text('Dark Mode'),
              subtitle: const Text('Toggle between dark and light Material 3 theme'),
              value: isDark,
              onChanged: (_) {
                ref.read(themeNotifierProvider.notifier).toggleTheme();
              },
            ),
          ),
          const SizedBox(height: 20),

          // Server Connection Section
          const Text('Network & Server', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryTeal)),
          const SizedBox(height: 8),
          Card(
            child: ListTile(
              leading: const Icon(Icons.dns_outlined),
              title: const Text('Backend API URL'),
              subtitle: Text(BaseUrlConfig.baseUrl),
              trailing: const Icon(Icons.edit_outlined, size: 20),
              onTap: _showChangeUrlDialog,
            ),
          ),
          const SizedBox(height: 20),

          // About Section
          const Text('About', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryTeal)),
          const SizedBox(height: 8),
          const Card(
            child: Column(
              children: [
                ListTile(
                  leading: Icon(Icons.business_center_outlined),
                  title: Text('Beereddy Agency'),
                  subtitle: Text('Distributor of V Bond Tile Adhesives'),
                ),
                Divider(height: 1),
                ListTile(
                  leading: Icon(Icons.info_outline),
                  title: Text('App Version'),
                  subtitle: Text('1.0.0 (Build 1)'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 30),

          // Logout Button
          ElevatedButton.icon(
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) {
                context.go('/login');
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
            ),
            icon: const Icon(Icons.logout),
            label: const Text('LOG OUT'),
          ),
        ],
      ),
    );
  }
}

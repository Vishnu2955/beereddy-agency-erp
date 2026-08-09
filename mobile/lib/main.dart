import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/services/storage_service.dart';
import 'core/services/notification_service.dart';
import 'core/theme/app_theme.dart';
import 'features/webview/web_app_screen.dart';
import 'routes/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Catch all Flutter framework errors silently without crashing
  FlutterError.onError = (FlutterErrorDetails details) {
    debugPrint('Caught Flutter Error: ${details.exception}');
  };

  // Catch all asynchronous/platform errors silently
  PlatformDispatcher.instance.onError = (Object error, StackTrace stack) {
    debugPrint('Caught Async Platform Error: $error');
    return true; // Prevents app process termination
  };

  // Initialize Storage (Hive) & Notifications safely
  try {
    await StorageService.init();
  } catch (e) {
    debugPrint('StorageService init error: $e');
  }

  try {
    await NotificationService.initialize();
  } catch (e) {
    debugPrint('NotificationService init error: $e');
  }

  runApp(const ProviderScope(child: BeereddyAgencyApp()));
}

class BeereddyAgencyApp extends ConsumerWidget {
  const BeereddyAgencyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'Beereddy Agency ERP',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: router,
    );
  }
}

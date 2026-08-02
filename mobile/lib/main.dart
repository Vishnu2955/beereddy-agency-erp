import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'core/services/storage_service.dart';
import 'core/services/notification_service.dart';
import 'core/theme/app_theme.dart';
import 'features/webview/web_app_screen.dart';

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

  runApp(const BeereddyAgencyApp());
}

class BeereddyAgencyApp extends StatelessWidget {
  const BeereddyAgencyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Beereddy Agency ERP',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.dark,
      home: const WebAppScreen(),
    );
  }
}

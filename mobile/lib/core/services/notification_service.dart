import 'package:flutter/foundation.dart';

class NotificationService {
  static Future<void> initialize() async {
    try {
      // Firebase Messaging will initialize when Firebase backend config is provided.
      // Keeping initialization safe to prevent crashes on startup.
      if (kDebugMode) {
        print('NotificationService initialized safely.');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Notification initialization error: $e');
      }
    }
  }
}

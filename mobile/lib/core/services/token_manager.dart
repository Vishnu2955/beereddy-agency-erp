import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenManager {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const String _keyJwtToken = 'jwt_token';
  static const String _keyUserRole = 'user_role';
  static const String _keyUserId = 'user_id';
  static const String _keyUserData = 'user_data';

  // Save Token
  static Future<void> saveToken(String token) async {
    try {
      await _storage.write(key: _keyJwtToken, value: token);
    } catch (e) {
      debugPrint('Error saving token: $e');
    }
  }

  // Get Token
  static Future<String?> getToken() async {
    try {
      return await _storage.read(key: _keyJwtToken);
    } catch (e) {
      debugPrint('Error reading token: $e');
      return null;
    }
  }

  // Save User Role
  static Future<void> saveUserRole(String role) async {
    try {
      await _storage.write(key: _keyUserRole, value: role);
    } catch (e) {
      debugPrint('Error saving user role: $e');
    }
  }

  // Get User Role
  static Future<String?> getUserRole() async {
    try {
      return await _storage.read(key: _keyUserRole);
    } catch (e) {
      return null;
    }
  }

  // Save User ID
  static Future<void> saveUserId(String userId) async {
    try {
      await _storage.write(key: _keyUserId, value: userId);
    } catch (e) {
      debugPrint('Error saving user id: $e');
    }
  }

  // Get User ID
  static Future<String?> getUserId() async {
    try {
      return await _storage.read(key: _keyUserId);
    } catch (e) {
      return null;
    }
  }

  // Save User Data JSON
  static Future<void> saveUserData(String userDataJson) async {
    try {
      await _storage.write(key: _keyUserData, value: userDataJson);
    } catch (e) {
      debugPrint('Error saving user data: $e');
    }
  }

  // Get User Data JSON
  static Future<String?> getUserData() async {
    try {
      return await _storage.read(key: _keyUserData);
    } catch (e) {
      return null;
    }
  }

  // Clear Session (Logout)
  static Future<void> clearSession() async {
    try {
      await _storage.deleteAll();
    } catch (e) {
      debugPrint('Error clearing session: $e');
    }
  }

  // Check if Logged In
  static Future<bool> isLoggedIn() async {
    try {
      final token = await getToken();
      return token != null && token.isNotEmpty;
    } catch (e) {
      return false;
    }
  }
}

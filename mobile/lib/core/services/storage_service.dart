import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String _themeBoxName = 'settingsBox';
  static const String _themeKey = 'isDarkMode';

  static Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox(_themeBoxName);
  }

  // Theme Settings
  static Future<bool> isDarkMode() async {
    final box = Hive.box(_themeBoxName);
    return box.get(_themeKey, defaultValue: false);
  }

  static Future<void> setDarkMode(bool isDark) async {
    final box = Hive.box(_themeBoxName);
    await box.put(_themeKey, isDark);
  }

  // SharedPreferences Fallback
  static Future<void> saveString(String key, String value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(key, value);
  }

  static Future<String?> getString(String key) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(key);
  }
}

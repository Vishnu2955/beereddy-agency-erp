class BaseUrlConfig {
  // Default development API host (Local Node.js backend runs on port 5000)
  static const String _emulatorUrl = 'http://10.0.2.2:5000';

  static String baseUrl = _emulatorUrl;

  static String get apiBaseUrl => '$baseUrl/api';
  static String get uploadsUrl => '$baseUrl/uploads';

  static void setCustomUrl(String customUrl) {
    if (customUrl.isNotEmpty) {
      baseUrl = customUrl.endsWith('/') ? customUrl.substring(0, customUrl.length - 1) : customUrl;
    }
  }
}

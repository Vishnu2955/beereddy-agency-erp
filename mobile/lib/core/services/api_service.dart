import 'package:dio/dio.dart';
import '../config/base_url.dart';
import 'token_manager.dart';
import 'error_handler.dart';

class ApiService {
  late final Dio _dio;

  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: BaseUrlConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Add JWT Token Interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Dynamically set Base URL in case user changed host URL in settings
          options.baseUrl = BaseUrlConfig.apiBaseUrl;
          final token = await TokenManager.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          // If 401 Unauthorized, token might be expired
          if (error.response?.statusCode == 401) {
            await TokenManager.clearSession();
          }
          return handler.next(error);
        },
      ),
    );
  }

  Dio get client => _dio;

  // GET Request
  Future<dynamic> get(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return response.data;
    } catch (e) {
      throw Exception(ApiErrorHandler.getErrorMessage(e));
    }
  }

  // POST Request
  Future<dynamic> post(String path, {dynamic data}) async {
    try {
      final response = await _dio.post(path, data: data);
      return response.data;
    } catch (e) {
      throw Exception(ApiErrorHandler.getErrorMessage(e));
    }
  }

  // PUT Request
  Future<dynamic> put(String path, {dynamic data}) async {
    try {
      final response = await _dio.put(path, data: data);
      return response.data;
    } catch (e) {
      throw Exception(ApiErrorHandler.getErrorMessage(e));
    }
  }

  // DELETE Request
  Future<dynamic> delete(String path) async {
    try {
      final response = await _dio.delete(path);
      return response.data;
    } catch (e) {
      throw Exception(ApiErrorHandler.getErrorMessage(e));
    }
  }

  // Multipart Form Upload (for payment screenshots, product images)
  Future<dynamic> uploadFile(String path, String filePath, String fieldName,
      {Map<String, dynamic>? extraData, String method = 'post'}) async {
    try {
      final formData = FormData.fromMap({
        fieldName: await MultipartFile.fromFile(filePath),
        if (extraData != null) ...extraData,
      });
      Response response;
      if (method.toLowerCase() == 'put') {
        response = await _dio.put(path, data: formData);
      } else {
        response = await _dio.post(path, data: formData);
      }
      return response.data;
    } catch (e) {
      throw Exception(ApiErrorHandler.getErrorMessage(e));
    }
  }
}

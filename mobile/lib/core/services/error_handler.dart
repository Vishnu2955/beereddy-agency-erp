import 'package:dio/dio.dart';

class ApiErrorHandler {
  static String getErrorMessage(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
          return 'Connection timeout with Beereddy ERP server. Please try again.';
        case DioExceptionType.sendTimeout:
          return 'Send timeout in connection with server.';
        case DioExceptionType.receiveTimeout:
          return 'Server response timeout. Please try again.';
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          final responseData = error.response?.data;
          if (responseData is Map && responseData.containsKey('message')) {
            return responseData['message'].toString();
          }
          if (statusCode == 401) {
            return 'Unauthorized access. Please login again.';
          } else if (statusCode == 403) {
            return 'Access denied. Account disabled or insufficient permissions.';
          } else if (statusCode == 404) {
            return 'Resource or API route not found.';
          } else if (statusCode == 500) {
            return 'Internal Server Error. Please contact support.';
          }
          return 'Server error (Code $statusCode)';
        case DioExceptionType.cancel:
          return 'Request to server was cancelled.';
        case DioExceptionType.connectionError:
          return 'No Internet Connection or Backend Server is unreachable. Please check host settings.';
        default:
          return 'An unexpected network error occurred.';
      }
    }
    return error.toString().replaceAll('Exception: ', '');
  }
}

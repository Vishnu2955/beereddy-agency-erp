import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/models/user_model.dart';
import '../core/services/api_service.dart';
import '../core/services/token_manager.dart';
import '../core/constants/api_constants.dart';

final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

class AuthState {
  final bool isLoading;
  final bool isAuthenticated;
  final UserModel? user;
  final String? error;

  AuthState({
    this.isLoading = false,
    this.isAuthenticated = false,
    this.user,
    this.error,
  });

  AuthState copyWith({
    bool? isLoading,
    bool? isAuthenticated,
    UserModel? user,
    String? error,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      error: error,
    );
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return AuthNotifier(apiService);
});

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiService _apiService;

  AuthNotifier(this._apiService) : super(AuthState()) {
    checkAutoLogin();
  }

  // Auto Login Check
  Future<void> checkAutoLogin() async {
    state = state.copyWith(isLoading: true);
    try {
      final isLoggedIn = await TokenManager.isLoggedIn();
      if (isLoggedIn) {
        final userDataJson = await TokenManager.getUserData();
        if (userDataJson != null && userDataJson.isNotEmpty) {
          final userMap = jsonDecode(userDataJson);
          final user = UserModel.fromJson(userMap);
          state = state.copyWith(
            isLoading: false,
            isAuthenticated: true,
            user: user,
          );
          return;
        }
      }
    } catch (e) {
      await TokenManager.clearSession();
    }
    state = state.copyWith(isLoading: false, isAuthenticated: false, user: null);
  }

  // Login
  Future<bool> login(String loginIdentifier, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _apiService.post(
        ApiConstants.login,
        data: {
          'login': loginIdentifier,
          'password': password,
        },
      );

      if (res['success'] == true && res['token'] != null) {
        final token = res['token'];
        final userModel = UserModel.fromJson(res['user']);

        await TokenManager.saveToken(token);
        await TokenManager.saveUserRole(userModel.role);
        await TokenManager.saveUserId(userModel.id);
        await TokenManager.saveUserData(jsonEncode(userModel.toJson()));

        state = state.copyWith(
          isLoading: false,
          isAuthenticated: true,
          user: userModel,
        );
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: res['message'] ?? 'Login failed',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
      return false;
    }
  }

  // Send OTP
  Future<bool> sendOtp(String email) async {
    try {
      final res = await _apiService.post(
        ApiConstants.sendOtp,
        data: {'email': email},
      );
      return res['success'] == true;
    } catch (e) {
      rethrow;
    }
  }

  // Reset Password
  Future<bool> resetPassword(String email, String otp, String newPassword) async {
    try {
      final res = await _apiService.post(
        ApiConstants.resetPassword,
        data: {
          'email': email,
          'otp': otp,
          'password': newPassword,
        },
      );
      return res['success'] == true;
    } catch (e) {
      rethrow;
    }
  }

  // Logout
  Future<void> logout() async {
    await TokenManager.clearSession();
    state = AuthState(isAuthenticated: false);
  }
}

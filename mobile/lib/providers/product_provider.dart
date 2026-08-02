import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/models/product_model.dart';
import '../core/constants/api_constants.dart';
import 'auth_provider.dart';

class ProductState {
  final bool isLoading;
  final List<ProductModel> products;
  final List<ProductModel> filteredProducts;
  final String selectedCategory;
  final String searchQuery;
  final String? error;

  ProductState({
    this.isLoading = false,
    this.products = const [],
    this.filteredProducts = const [],
    this.selectedCategory = 'All',
    this.searchQuery = '',
    this.error,
  });

  ProductState copyWith({
    bool? isLoading,
    List<ProductModel>? products,
    List<ProductModel>? filteredProducts,
    String? selectedCategory,
    String? searchQuery,
    String? error,
  }) {
    return ProductState(
      isLoading: isLoading ?? this.isLoading,
      products: products ?? this.products,
      filteredProducts: filteredProducts ?? this.filteredProducts,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      searchQuery: searchQuery ?? this.searchQuery,
      error: error,
    );
  }
}

final productProvider = StateNotifierProvider<ProductNotifier, ProductState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return ProductNotifier(apiService);
});

class ProductNotifier extends StateNotifier<ProductState> {
  final dynamic _apiService;

  ProductNotifier(this._apiService) : super(ProductState()) {
    fetchProducts();
  }

  Future<void> fetchProducts() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _apiService.get(ApiConstants.products);
      List<ProductModel> list = [];
      if (res is List) {
        list = res.map((item) => ProductModel.fromJson(item)).toList();
      } else if (res is Map && res['data'] is List) {
        list = (res['data'] as List).map((item) => ProductModel.fromJson(item)).toList();
      } else if (res is Map && res['products'] is List) {
        list = (res['products'] as List).map((item) => ProductModel.fromJson(item)).toList();
      }

      state = state.copyWith(
        isLoading: false,
        products: list,
        filteredProducts: _applyFilters(list, state.selectedCategory, state.searchQuery),
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }

  void search(String query) {
    final filtered = _applyFilters(state.products, state.selectedCategory, query);
    state = state.copyWith(searchQuery: query, filteredProducts: filtered);
  }

  void filterCategory(String category) {
    final filtered = _applyFilters(state.products, category, state.searchQuery);
    state = state.copyWith(selectedCategory: category, filteredProducts: filtered);
  }

  List<ProductModel> _applyFilters(List<ProductModel> list, String category, String query) {
    return list.where((p) {
      final matchesCategory = category == 'All' || p.category.toLowerCase() == category.toLowerCase();
      final matchesQuery = query.isEmpty ||
          p.name.toLowerCase().contains(query.toLowerCase()) ||
          p.sku.toLowerCase().contains(query.toLowerCase());
      return matchesCategory && matchesQuery;
    }).toList();
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/product_provider.dart';
import '../../providers/cart_provider.dart';
import '../../widgets/common_widgets.dart';
import 'product_detail_screen.dart';

class ProductCatalogScreen extends ConsumerWidget {
  const ProductCatalogScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productState = ref.watch(productProvider);
    final cartState = ref.watch(cartProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('V Bond Product Catalog'),
        actions: [
          IconButton(
            icon: Badge(
              label: Text('${cartState.itemCount}'),
              isLabelVisible: cartState.itemCount > 0,
              child: const Icon(Icons.shopping_cart_outlined),
            ),
            onPressed: () => context.push('/cart'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter Section
          Container(
            color: Theme.of(context).cardColor,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              children: [
                TextField(
                  onChanged: (query) => ref.read(productProvider.notifier).search(query),
                  decoration: const InputDecoration(
                    hintText: 'Search V Bond products, SKU...',
                    prefixIcon: Icon(Icons.search_rounded),
                    contentPadding: EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
                const SizedBox(height: 10),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: ['All', 'Tile Adhesive', 'Grout', 'Primer', 'Epoxy']
                        .map(
                          (cat) => Padding(
                            padding: const EdgeInsets.only(right: 8.0),
                            child: FilterChip(
                              label: Text(cat),
                              selected: productState.selectedCategory == cat,
                              onSelected: (_) {
                                ref.read(productProvider.notifier).filterCategory(cat);
                              },
                              selectedColor: AppColors.primaryTeal.withOpacity(0.2),
                              checkmarkColor: AppColors.primaryTeal,
                            ),
                          ),
                        )
                        .toList(),
                  ),
                ),
              ],
            ),
          ),

          // Product Grid View
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                await ref.read(productProvider.notifier).fetchProducts();
              },
              child: productState.isLoading
                  ? const AppLoadingSpinner(message: 'Fetching catalog...')
                  : productState.error != null
                      ? AppErrorState(
                          errorMessage: productState.error!,
                          onRetry: () => ref.read(productProvider.notifier).fetchProducts(),
                        )
                      : productState.filteredProducts.isEmpty
                          ? const AppEmptyState(
                              title: 'No Products Found',
                              subtitle: 'Try adjusting search or category filters.',
                              icon: Icons.inventory_2_outlined,
                            )
                          : GridView.builder(
                              padding: const EdgeInsets.all(16),
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                childAspectRatio: 0.70,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                              ),
                              itemCount: productState.filteredProducts.length,
                              itemBuilder: (context, index) {
                                final product = productState.filteredProducts[index];
                                return Card(
                                  clipBehavior: Clip.antiAlias,
                                  child: InkWell(
                                    onTap: () {
                                      showModalBottomSheet(
                                        context: context,
                                        isScrollControlled: true,
                                        shape: const RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.vertical(top: Radius.circular(20)),
                                        ),
                                        builder: (ctx) => ProductDetailModal(product: product),
                                      );
                                    },
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        // Image Header
                                        Expanded(
                                          child: Stack(
                                            children: [
                                              Center(
                                                child: ProductCachedImage(
                                                  imageUrl: product.imageUrl,
                                                  width: double.infinity,
                                                ),
                                              ),
                                              Positioned(
                                                top: 6,
                                                right: 6,
                                                child: Container(
                                                  padding: const EdgeInsets.symmetric(
                                                      horizontal: 6, vertical: 2),
                                                  decoration: BoxDecoration(
                                                    color: product.stockQuantity > 0
                                                        ? Colors.green
                                                        : Colors.red,
                                                    borderRadius: BorderRadius.circular(6),
                                                  ),
                                                  child: Text(
                                                    product.stockQuantity > 0
                                                        ? '${product.stockQuantity} In Stock'
                                                        : 'Out of Stock',
                                                    style: const TextStyle(
                                                      color: Colors.white,
                                                      fontSize: 10,
                                                      fontWeight: FontWeight.bold,
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),

                                        // Product Details
                                        Padding(
                                          padding: const EdgeInsets.all(10.0),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                product.category,
                                                style: const TextStyle(
                                                    fontSize: 10, color: AppColors.primaryTeal),
                                              ),
                                              const SizedBox(height: 2),
                                              Text(
                                                product.name,
                                                maxLines: 2,
                                                overflow: TextOverflow.ellipsis,
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 13,
                                                ),
                                              ),
                                              const SizedBox(height: 6),
                                              Row(
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                children: [
                                                  Text(
                                                    '₹${product.price.toStringAsFixed(0)}',
                                                    style: const TextStyle(
                                                      fontWeight: FontWeight.bold,
                                                      fontSize: 15,
                                                      color: AppColors.primaryTeal,
                                                    ),
                                                  ),
                                                  InkWell(
                                                    onTap: product.stockQuantity > 0
                                                        ? () {
                                                            ref
                                                                .read(cartProvider.notifier)
                                                                .addToCart(product);
                                                            ScaffoldMessenger.of(context)
                                                                .showSnackBar(
                                                              SnackBar(
                                                                content: Text(
                                                                    'Added ${product.name} to Cart'),
                                                                duration:
                                                                    const Duration(seconds: 1),
                                                              ),
                                                            );
                                                          }
                                                        : null,
                                                    child: Container(
                                                      padding: const EdgeInsets.all(6),
                                                      decoration: BoxDecoration(
                                                        color: product.stockQuantity > 0
                                                            ? AppColors.primaryTeal
                                                            : Colors.grey,
                                                        borderRadius: BorderRadius.circular(8),
                                                      ),
                                                      child: const Icon(
                                                        Icons.add_shopping_cart_rounded,
                                                        color: Colors.white,
                                                        size: 18,
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
            ),
          ),
        ],
      ),
    );
  }
}

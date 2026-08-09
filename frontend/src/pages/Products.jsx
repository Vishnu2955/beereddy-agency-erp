import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import productService from "../services/productService";
import SearchBar from "../components/products/SearchBar";
import Pagination from "../components/products/Pagination";
import ProductTable from "../components/products/ProductTable";
import ProductGrid from "../components/products/ProductGrid";
import ProductModal from "../components/products/ProductModal";
import DeleteProductModal from "../components/products/DeleteProductModal";
import Product3DViewerModal from "../components/products/Product3DViewerModal";
import CartModal from "../components/cart/CartModal";
import { FaShoppingCart, FaBoxOpen } from "react-icons/fa";
import { getUser } from "../utils/auth";
import { successToast, errorToast } from "../utils/toast";
import { confirmDelete } from "../utils/confirm";

import ProductMediaModal from "../components/products/ProductMediaModal";
import ProductDetailModal from "../components/products/ProductDetailModal";
import SkeletonLoader from "../components/common/SkeletonLoader";

export default function Products() {
  const currentUser = getUser();
  const isRetailer = currentUser?.role === "retailer";

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mediaModalProduct, setMediaModalProduct] = useState(null);

  // Commercial Product Details Modal State
  const [detailProduct, setDetailProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 3D Viewer & Cart States
  const [selected3DProduct, setSelected3DProduct] = useState(null);
  const [is3DOpen, setIs3DOpen] = useState(false);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const location = useLocation();

  // Load Products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts(page, 10, search);
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // Trigger a refresh any time the route becomes active or paging/search changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, location.pathname]);

  const handleAdd = () => {
    setSelectedProduct(null);
    setOpenModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteModal(true);
  };

  const handleSave = async (formData) => {
    try {
      setLoading(true);
      if (selectedProduct) {
        await productService.updateProduct(selectedProduct._id, formData);
        successToast("Product updated successfully.");
      } else {
        await productService.addProduct(formData);
        successToast("Product added successfully.");
      }
      await loadProducts();
      setOpenModal(false);
      setSelectedProduct(null);
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirmDelete("Delete Product", "This action cannot be undone.");
    if (!ok) return;

    try {
      setLoading(true);
      await productService.deleteProduct(selectedProduct._id);
      successToast("Product deleted successfully.");
      await loadProducts();
      setDeleteModal(false);
      setSelectedProduct(null);
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to delete product.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item._id === product._id);
      if (existing) {
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    successToast(`${product.productName} added to cart.`);
  };

  const handleView3D = (product) => {
    setSelected3DProduct(product);
    setIs3DOpen(true);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaBoxOpen className="text-blue-600" /> Products Catalog
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isRetailer ? "Browse products, view 360° interactive view, and add to cart to order" : "Manage inventory products, 360° product media, and pricing"}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <SearchBar
            value={search}
            onChange={(value) => {
              setPage(1);
              setSearch(value);
            }}
          />

          {!isRetailer && (
            <button
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-md flex items-center gap-2 whitespace-nowrap"
            >
              + Add Product
            </button>
          )}

          {/* Cart Icon Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-xl shadow-md transition flex items-center gap-2 font-semibold"
            title="View Shopping Cart"
          >
            <FaShoppingCart className="text-lg" />
            <span className="hidden md:inline">Cart</span>
            {totalCartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <SkeletonLoader type="products" count={6} />
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="bg-white rounded-2xl shadow p-16 text-center">
          <FaBoxOpen className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">No Products Available</h2>
          <p className="text-gray-500 mt-2">
            {!isRetailer ? "Click Add Product to list your first inventory item." : "No products found matching your search."}
          </p>
        </div>
      )}

      {/* Product Table / Catalog */}
      {!loading && products.length > 0 && (
        isRetailer ? (
          <ProductGrid
            products={products}
            onAddToCart={handleAddToCart}
            onView3D={handleView3D}
            onSelectProduct={(p) => {
              setDetailProduct(p);
              setIsDetailModalOpen(true);
            }}
          />
        ) : (
          <ProductTable
            products={products}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onAddToCart={handleAddToCart}
            onView3D={handleView3D}
            onOpenMedia={(p) => setMediaModalProduct(p)}
            onSelectProduct={(p) => {
              setDetailProduct(p);
              setIsDetailModalOpen(true);
            }}
          />
        )
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Admin Add/Edit Modal */}
      {!isRetailer && (
        <ProductModal
          isOpen={openModal}
          onClose={() => {
            setOpenModal(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleSave}
          initialData={selectedProduct}
          loading={loading}
        />
      )}

      {/* Admin Delete Modal */}
      {!isRetailer && (
        <DeleteProductModal
          isOpen={deleteModal}
          onClose={() => {
            setDeleteModal(false);
            setSelectedProduct(null);
          }}
          onConfirm={handleDelete}
          loading={loading}
          product={selectedProduct}
        />
      )}

      {/* Admin Product Media & 360 Manager Modal */}
      {mediaModalProduct && (
        <ProductMediaModal
          product={mediaModalProduct}
          onClose={() => setMediaModalProduct(null)}
          onUpdated={() => {
            loadProducts();
            setMediaModalProduct(null);
          }}
        />
      )}

      {/* Rich Commercial Product Detail & Specs Modal */}
      <ProductDetailModal
        product={detailProduct}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onAddToCart={handleAddToCart}
        onOrderNow={() => setIsCartOpen(true)}
      />

      {/* 3D & 360 Product Viewer Modal */}
      <Product3DViewerModal
        product={selected3DProduct}
        isOpen={is3DOpen}
        onClose={() => setIs3DOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {/* Retailer Cart & Checkout Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
        onOrderPlaced={loadProducts}
      />

    </div>
  );
}
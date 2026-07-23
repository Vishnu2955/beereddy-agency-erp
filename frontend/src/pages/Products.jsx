import { useEffect, useState } from "react";
import productService from "../services/productService";

import SearchBar from "../components/products/SearchBar";
import Pagination from "../components/products/Pagination";
import ProductTable from "../components/products/ProductTable";
import ProductModal from "../components/products/ProductModal";
import DeleteProductModal from "../components/products/DeleteProductModal";

import {
  successToast,
  errorToast,
} from "../utils/toast";

import { confirmDelete } from "../utils/confirm";

export default function Products() {

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);

  // Keep this for now.
  // We'll remove it later after replacing it completely with SweetAlert.
  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [loading, setLoading] = useState(false);

  //-----------------------------------------
  // Load Products
  //-----------------------------------------

  const loadProducts = async () => {

    try {

      const data = await productService.getProducts(
        page,
        10,
        search
      );

      setProducts(data.products);
      setTotalPages(data.totalPages);

    } catch (err) {

      errorToast(
        err.response?.data?.message ||
        "Failed to load products."
      );

    }

  };

  useEffect(() => {

    loadProducts();

  }, [page, search]);

  //-----------------------------------------
  // Add Product
  //-----------------------------------------

  const handleAdd = () => {

    setSelectedProduct(null);

    setOpenModal(true);

  };

  //-----------------------------------------
  // Edit Product
  //-----------------------------------------

  const handleEdit = (product) => {

    setSelectedProduct(product);

    setOpenModal(true);

  };

  //-----------------------------------------
  // Delete Button
  //-----------------------------------------

  const handleDeleteClick = (product) => {

    setSelectedProduct(product);

    setDeleteModal(true);

  };

  //-----------------------------------------
  // Save Product
  //-----------------------------------------

  const handleSave = async (formData) => {

    try {

      setLoading(true);

      if (selectedProduct) {

        await productService.updateProduct(
          selectedProduct._id,
          formData
        );

        successToast(
          "Product updated successfully."
        );

      } else {

        await productService.addProduct(
          formData
        );

        successToast(
          "Product added successfully."
        );

      }

      await loadProducts();

      setOpenModal(false);
      setSelectedProduct(null);

    } catch (err) {

      errorToast(
        err.response?.data?.message ||
        "Failed to save product."
      );

    } finally {

      setLoading(false);

    }

  };

  //-----------------------------------------
  // Delete Product
  //-----------------------------------------

  const handleDelete = async () => {

    const ok = await confirmDelete(
      "Delete Product",
      "This action cannot be undone."
    );

    if (!ok) return;

    try {

      setLoading(true);

      await productService.deleteProduct(
        selectedProduct._id
      );

      successToast(
        "Product deleted successfully."
      );

      await loadProducts();

      setDeleteModal(false);
      setSelectedProduct(null);

    } catch (err) {

      errorToast(
        err.response?.data?.message ||
        "Failed to delete product."
      );

    } finally {

      setLoading(false);

    }

  };
    return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">

        <div>
          <h1 className="text-3xl font-bold">
            Products
          </h1>

          <p className="text-gray-500">
            Manage inventory products
          </p>
        </div>

        <div className="flex items-center gap-3">

          <SearchBar
            value={search}
            onChange={(value) => {
              setPage(1);
              setSearch(value);
            }}
          />

          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition"
          >
            + Add Product
          </button>

        </div>

      </div>

      {/* Loading */}

      {loading && (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <div className="animate-pulse text-blue-600 font-semibold">
            Loading...
          </div>
        </div>
      )}

      {/* Empty State */}

      {!loading && products.length === 0 && (
        <div className="bg-white rounded-lg shadow p-16 text-center">

          <h2 className="text-2xl font-bold">
            No Products Found
          </h2>

          <p className="text-gray-500 mt-3">
            Click <b>Add Product</b> to create your first product.
          </p>

        </div>
      )}

      {/* Product Table */}

      {!loading && products.length > 0 && (
        <ProductTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Pagination */}

      {!loading && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Add / Edit Product */}

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

      {/* Delete Modal */}

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

    </div>
  );

}
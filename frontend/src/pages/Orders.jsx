import { useEffect, useState } from "react";

import orderService from "../services/orderService";

import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";

import OrderTable from "../components/orders/OrderTable";
import OrderModal from "../components/orders/OrderModal";
import DeleteOrderModal from "../components/orders/DeleteOrderModal";

import {
  successToast,
  errorToast,
} from "../utils/toast";

import {
  confirmDelete,
} from "../utils/confirm";

export default function Orders() {

  const [orders, setOrders] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [products, setProducts] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);

  //----------------------------------
  // Load Orders
  //----------------------------------

  const loadOrders = async () => {

    try {

      const data = await orderService.getOrders(
        page,
        10,
        search
      );

      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);

    } catch (err) {

      errorToast(
        err.response?.data?.message ||
        "Failed to load orders."
      );

    }

  };

  //----------------------------------
  // Load Retailers
  //----------------------------------

  const loadRetailers = async () => {

    try {

      const data =
        await orderService.getRetailers();

      setRetailers(data.retailers || []);

    } catch (err) {

      console.error(err);

    }

  };

  //----------------------------------
  // Load Products
  //----------------------------------

  const loadProducts = async () => {

    try {

      const data =
        await orderService.getProducts();

      setProducts(data.products || []);

    } catch (err) {

      console.error(err);

    }

  };

  useEffect(() => {

    loadOrders();
    loadRetailers();
    loadProducts();

  }, [page, search]);

  //----------------------------------
  // Add
  //----------------------------------

  const handleAdd = () => {

    setSelectedOrder(null);

    setOpenModal(true);

  };

  //----------------------------------
  // Edit
  //----------------------------------

  const handleEdit = (order) => {

    setSelectedOrder(order);

    setOpenModal(true);

  };

  //----------------------------------
  // Delete Click
  //----------------------------------

  const handleDeleteClick = (order) => {

    setSelectedOrder(order);

    setDeleteModal(true);

  };

  //----------------------------------
  // Save
  //----------------------------------

  const handleSave = async (formData) => {

    try {

      setLoading(true);

      if (selectedOrder) {

        await orderService.updateOrder(
          selectedOrder._id,
          formData
        );

        successToast(
          "Order updated successfully."
        );

      } else {

        await orderService.createOrder(
          formData
        );

        successToast(
          "Order created successfully."
        );

      }

      await loadOrders();

      setOpenModal(false);

      setSelectedOrder(null);

    } catch (err) {

      errorToast(
        err.response?.data?.message ||
        "Failed to save order."
      );

    } finally {

      setLoading(false);

    }

  };

  //----------------------------------
  // Delete
  //----------------------------------

  const handleDelete = async () => {

    const ok = await confirmDelete(
      "Delete Order",
      "This action cannot be undone."
    );

    if (!ok) return;

    try {

      setLoading(true);

      await orderService.deleteOrder(
        selectedOrder._id
      );

      successToast(
        "Order deleted successfully."
      );

      await loadOrders();

      setDeleteModal(false);

      setSelectedOrder(null);

    } catch (err) {

      errorToast(
        err.response?.data?.message ||
        "Failed to delete order."
      );

    } finally {

      setLoading(false);

    }

  };
    return (
    <div className="p-6">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <h1 className="text-3xl font-bold">
          Orders
        </h1>

        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          + Create Order
        </button>

      </div>

      {/* Search */}

      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search orders..."
        />
      </div>

      {/* Orders Table */}

      {loading ? (

        <div className="text-center py-10">
          Loading...
        </div>

      ) : orders.length === 0 ? (

        <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
          No orders found.
        </div>

      ) : (

        <>
          <OrderTable
            orders={orders}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />

          <div className="mt-6">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>

      )}

      {/* Create / Edit Modal */}

      <OrderModal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedOrder(null);
        }}
        onSubmit={handleSave}
        initialData={selectedOrder}
        retailers={retailers}
        products={products}
        loading={loading}
      />

      {/* Delete Modal */}

      <DeleteOrderModal
        isOpen={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleDelete}
        loading={loading}
        order={selectedOrder}
      />

    </div>
  );

}
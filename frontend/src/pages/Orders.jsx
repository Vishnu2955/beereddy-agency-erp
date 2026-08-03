import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaPlus, FaShoppingBag, FaSearch, FaFilter } from "react-icons/fa";

import orderService from "../services/orderService";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import OrderTable from "../components/orders/OrderTable";
import OrderModal from "../components/orders/OrderModal";
import DeleteOrderModal from "../components/orders/DeleteOrderModal";
import { successToast, errorToast } from "../utils/toast";
import { confirmDelete } from "../utils/confirm";

import SkeletonLoader from "../components/common/SkeletonLoader";

const STATUS_FILTERS = ["All", "Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [products, setProducts] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");

  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isRetailer = user?.role === "retailer";

  const loadOrders = async () => {
    try {
      setLoading(true);
      let data;
      if (isRetailer) {
        data = await orderService.getMyOrders();
        setOrders(data.orders || []);
        setTotalPages(1);
      } else {
        data = await orderService.getOrders(page, 10, search);
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const loadRetailers = async () => {
    try {
      const data = await orderService.getRetailers();
      setRetailers(data.retailers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await orderService.getProducts();
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

  // Client-side status tab filter (case-insensitive)
  const filteredOrders = useMemo(() => {
    if (!orders || !orders.length) return [];
    if (selectedStatusFilter === "All") return orders;
    return orders.filter((o) => {
      const st = (o.orderStatus || o.status || "Pending").toString().trim().toLowerCase();
      return st === selectedStatusFilter.toLowerCase();
    });
  }, [orders, selectedStatusFilter]);

  const handleAdd = () => {
    setSelectedOrder(null);
    setOpenModal(true);
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setOpenModal(true);
  };

  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setDeleteModal(true);
  };

  const handleSave = async (formData) => {
    try {
      setLoading(true);
      if (selectedOrder) {
        await orderService.updateOrderStatus(
          selectedOrder._id,
          formData.orderStatus
        );
        successToast("Order status updated successfully.");
      } else {
        await orderService.createOrder(formData);
        successToast("Order created successfully.");
      }
      await loadOrders();
      setOpenModal(false);
      setSelectedOrder(null);
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to save order.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirmDelete(
      "Delete Order",
      "This action cannot be undone."
    );

    if (!ok) return;

    try {
      setLoading(true);
      await orderService.deleteOrder(selectedOrder._id);
      successToast("Order deleted successfully.");
      await loadOrders();
      setDeleteModal(false);
      setSelectedOrder(null);
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to delete order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Banner Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/90">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl border border-amber-100 shadow-2xs">
              <FaClipboardList />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {isRetailer ? "My Order History & Tracking" : "Network Orders Management"}
              </h1>
              <p className="text-slate-400 text-xs font-medium mt-0.5">
                {isRetailer 
                  ? "Track active delivery status and download past tax invoices" 
                  : "Fulfill incoming retailer purchase orders and update dispatch status"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (isRetailer) {
              navigate("/products");
            } else {
              handleAdd();
            }
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold px-5 py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2"
        >
          {isRetailer ? (
            <><FaShoppingBag /> Browse Catalog & Place Order</>
          ) : (
            <><FaPlus /> Create Manual Order</>
          )}
        </button>
      </div>

      {/* Filter Tabs & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/90 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-2 md:pb-0">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatusFilter === status
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-72">
          <SearchBar
            value={search}
            placeholder="Search invoice or shop..."
          />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <SkeletonLoader type="table" count={5} />
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-16 text-center">
          <FaClipboardList className="mx-auto text-5xl text-slate-300 mb-3" />
          <h3 className="text-xl font-bold text-slate-800">No Orders Found</h3>
          <p className="text-slate-500 text-xs mt-1">Try resetting search query or selecting a different status filter tab.</p>
        </div>
      ) : (
        <>
          <OrderTable
            orders={filteredOrders}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onStatusUpdate={loadOrders}
          />

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
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
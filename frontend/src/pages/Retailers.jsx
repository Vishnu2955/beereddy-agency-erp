import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import retailerService from "../services/retailerService";

import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";

import RetailerTable from "../components/retailers/RetailerTable";
import RetailerModal from "../components/retailers/RetailerModal";
import DeleteRetailerModal from "../components/retailers/DeleteRetailerModal";

import {
  successToast,
  errorToast,
} from "../utils/toast";

import { confirmDelete } from "../utils/confirm";
import SkeletonLoader from "../components/common/SkeletonLoader";

export default function Retailers() {

  const [retailers, setRetailers] = useState([]);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedRetailer, setSelectedRetailer] = useState(null);

  const [loading, setLoading] = useState(true);
  const location = useLocation();

  //---------------------------------------
  // Load Retailers
  //---------------------------------------

  const loadRetailers = async () => {
    try {
      setLoading(true);
      const data = await retailerService.getRetailers(
        page,
        10,
        search
      );

      setRetailers(data.retailers || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      errorToast(
        err.response?.data?.message ||
        "Failed to load retailers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    loadRetailers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, location.pathname]);

  //---------------------------------------
  // Add Retailer
  //---------------------------------------

  const handleAdd = () => {

    setSelectedRetailer(null);

    setOpenModal(true);

  };

  //---------------------------------------
  // Edit Retailer
  //---------------------------------------

  const handleEdit = (retailer) => {

    setSelectedRetailer(retailer);

    setOpenModal(true);

  };

  //---------------------------------------
  // Delete Button
  //---------------------------------------

  const handleDeleteClick = (retailer) => {

    setSelectedRetailer(retailer);

    setDeleteModal(true);

  };

  //---------------------------------------
  // Save Retailer
  //---------------------------------------

  const handleSave = async (formData) => {

    try {

      setLoading(true);

      if (selectedRetailer) {

        await retailerService.updateRetailer(
          selectedRetailer._id,
          formData
        );

        successToast(
          "Retailer updated successfully."
        );

      } else {

        await retailerService.addRetailer(
          formData
        );

        successToast(
          "Retailer added successfully."
        );

      }

      await loadRetailers();

      setOpenModal(false);

      setSelectedRetailer(null);

    } catch (err) {

      errorToast(
        err.response?.data?.message ||
        "Failed to save retailer."
      );

    } finally {

      setLoading(false);

    }

  };

  //---------------------------------------
  // Delete Retailer
  //---------------------------------------

  const handleDelete = async () => {

    const ok = await confirmDelete(
      "Delete Retailer",
      "This action cannot be undone."
    );

    if (!ok) return;

    try {

      setLoading(true);

      await retailerService.deleteRetailer(
        selectedRetailer._id
      );

      successToast(
        "Retailer deleted successfully."
      );

      await loadRetailers();

      setDeleteModal(false);

      setSelectedRetailer(null);

    } catch (err) {

      errorToast(
        err.response?.data?.message ||
        "Failed to delete retailer."
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
            Retailers
          </h1>

          <p className="text-gray-500">
            Manage your retailers and customers
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
            + Add Retailer
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <SkeletonLoader type="table" count={5} />
      )}

      {/* Empty State */}

      {!loading && retailers.length === 0 && (

        <div className="bg-white rounded-xl shadow p-16 text-center">

          <h2 className="text-2xl font-bold">

            No Retailers Found

          </h2>

          <p className="text-gray-500 mt-3">

            Click <b>Add Retailer</b> to create your first retailer.

          </p>

        </div>

      )}

      {/* Retailers Table */}

      {!loading && retailers.length > 0 && (

        <RetailerTable
          retailers={retailers}
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

      {/* Add / Edit Modal */}

      <RetailerModal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedRetailer(null);
        }}
        onSubmit={handleSave}
        initialData={selectedRetailer}
        loading={loading}
      />

      {/* Delete Modal */}

      <DeleteRetailerModal
        isOpen={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedRetailer(null);
        }}
        onConfirm={handleDelete}
        loading={loading}
        retailer={selectedRetailer}
      />

    </div>
  );

}
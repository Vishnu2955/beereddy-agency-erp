import { useEffect, useState } from "react";
import invoiceService from "../services/invoiceService";
import orderService from "../services/orderService";

import InvoiceTable from "../components/invoices/InvoiceTable";
import InvoiceModal from "../components/invoices/InvoiceModal";
import DeleteInvoiceModal from "../components/invoices/DeleteInvoiceModal";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadInvoices = async () => {
    try {
      const res = await invoiceService.getInvoices(1, 1000, "");
      setInvoices(res.invoices || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await orderService.getOrders(1, 1000, "");
      setOrders(res.orders || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInvoices();
    loadOrders();
  }, []);

  const handleCreate = async (formData) => {
    try {
      setLoading(true);

      await invoiceService.createInvoice(formData);

      await loadInvoices();

      setShowModal(false);
      setSelectedInvoice(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInvoice) return;

    try {
      setLoading(true);

      await invoiceService.deleteInvoice(selectedInvoice._id);

      await loadInvoices();

      setShowDeleteModal(false);
      setSelectedInvoice(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const retailer = invoice.retailer?.shopName?.toLowerCase() || "";
    const number = invoice.invoiceNumber?.toLowerCase() || "";

    return (
      retailer.includes(search.toLowerCase()) ||
      number.includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-500">
            Manage all invoices
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedInvoice(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          + Create Invoice
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search invoice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 border rounded-lg px-4 py-2"
        />
      </div>

      <InvoiceTable
        invoices={filteredInvoices}
        onView={(invoice) => {
          setSelectedInvoice(invoice);
          setShowModal(true);
        }}
        onDelete={(invoice) => {
          setSelectedInvoice(invoice);
          setShowDeleteModal(true);
        }}
      />

      <InvoiceModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedInvoice(null);
        }}
        onSubmit={handleCreate}
        initialData={selectedInvoice}
        invoice={selectedInvoice}
        orders={orders}
        loading={loading}
      />

      <DeleteInvoiceModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedInvoice(null);
        }}
        onConfirm={handleDelete}
        loading={loading}
        invoice={selectedInvoice}
      />
    </div>
  );
}
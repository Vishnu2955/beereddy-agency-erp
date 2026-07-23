import api from "./api";

const invoiceService = {
  getInvoices: async (page = 1, limit = 10, search = "") => {
    const { data } = await api.get("/invoices", {
      params: { page, limit, search },
    });
    return data;
  },

  getInvoiceById: async (id) => {
    const { data } = await api.get(`/invoices/${id}`);
    return data;
  },

  createInvoice: async (invoiceData) => {
    const { data } = await api.post("/invoices", invoiceData);
    return data;
  },

  updateInvoice: async (id, invoiceData) => {
    const { data } = await api.put(`/invoices/${id}`, invoiceData);
    return data;
  },

  deleteInvoice: async (id) => {
    const { data } = await api.delete(`/invoices/${id}`);
    return data;
  },

  getOrders: async () => {
    const { data } = await api.get("/orders");
    return data;
  },
};

export default invoiceService;
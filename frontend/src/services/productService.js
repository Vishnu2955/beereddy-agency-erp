import api from "./api";

const productService = {
  getProducts: async (page = 1, limit = 10, search = "") => {
    const res = await api.get(
      `/products?page=${page}&limit=${limit}&search=${search}`
    );
    return res.data;
  },

  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data.product;
  },

  addProduct: async (formData) => {
    const res = await api.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  },

  updateProduct: async (id, formData) => {
    const res = await api.put(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};

export default productService;
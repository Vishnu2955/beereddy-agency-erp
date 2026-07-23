import api from "./api";

const orderService = {

  getOrders(page = 1, limit = 10, search = "") {
    return api
      .get(`/orders?page=${page}&limit=${limit}&search=${search}`)
      .then((res) => res.data);
  },

  getOrderById(id) {
    return api
      .get(`/orders/${id}`)
      .then((res) => res.data);
  },

  createOrder(data) {
    return api
      .post("/orders", data)
      .then((res) => res.data);
  },

  updateOrder(id, data) {
    return api
      .put(`/orders/${id}`, data)
      .then((res) => res.data);
  },

  deleteOrder(id) {
    return api
      .delete(`/orders/${id}`)
      .then((res) => res.data);
  },

  getRetailers() {
    return api
      .get("/retailers?limit=1000")
      .then((res) => res.data);
  },

  getProducts() {
    return api
      .get("/products?limit=1000")
      .then((res) => res.data);
  },

};

export default orderService;
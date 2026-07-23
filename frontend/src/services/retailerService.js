import api from "./api";

const retailerService = {

  getRetailers(page = 1, limit = 10, search = "") {
    return api
      .get(`/retailers?page=${page}&limit=${limit}&search=${search}`)
      .then((res) => res.data);
  },

  getRetailerById(id) {
    return api
      .get(`/retailers/${id}`)
      .then((res) => res.data);
  },

  addRetailer(data) {
    return api
      .post("/retailers", data)
      .then((res) => res.data);
  },

  updateRetailer(id, data) {
    return api
      .put(`/retailers/${id}`, data)
      .then((res) => res.data);
  },

  deleteRetailer(id) {
    return api
      .delete(`/retailers/${id}`)
      .then((res) => res.data);
  },

};

export default retailerService;
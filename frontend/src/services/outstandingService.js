import api from "./api";

const outstandingService = {
  getAllOutstanding: async () => {
    const res = await api.get("/outstanding");
    return res.data.retailers;
  },

  getRetailerOutstanding: async (id) => {
    const res = await api.get(`/outstanding/${id}`);
    return res.data.retailer;
  },
};

export default outstandingService;
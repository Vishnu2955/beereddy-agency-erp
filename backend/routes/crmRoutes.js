const express = require("express");
const router = express.Router();

const {
  getCRMDashboard,
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  getTickets,
  createTicket,
  updateTicket,
  getComplaints,
  createComplaint,
} = require("../controllers/crmController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.use(verifyToken);

// Dashboard
router.get("/dashboard", getCRMDashboard);

// Leads
router.get("/leads", getLeads);
router.post("/leads", createLead);
router.put("/leads/:id", updateLead);
router.delete("/leads/:id", isAdmin, deleteLead);

// Follow-ups
router.get("/followups", getFollowUps);
router.post("/followups", createFollowUp);
router.put("/followups/:id", updateFollowUp);

// Support Tickets
router.get("/tickets", getTickets);
router.post("/tickets", createTicket);
router.put("/tickets/:id", updateTicket);

// Complaints
router.get("/complaints", getComplaints);
router.post("/complaints", createComplaint);

module.exports = router;

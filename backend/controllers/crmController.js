const Lead = require("../models/Lead");
const FollowUp = require("../models/FollowUp");
const Ticket = require("../models/Ticket");
const Complaint = require("../models/Complaint");
const User = require("../models/User");

// ==========================================
// 1. CRM Dashboard APIs
// ==========================================
exports.getCRMDashboard = async (req, res) => {
  try {
    const totalRetailers = await User.countDocuments({ role: "retailer" });
    const activeRetailers = await User.countDocuments({ role: "retailer", isActive: true });
    const inactiveRetailers = await User.countDocuments({ role: "retailer", isActive: false });

    const newLeads = await Lead.countDocuments({ status: "New" });
    const totalLeads = await Lead.countDocuments();
    const pendingFollowups = await FollowUp.countDocuments({ status: "Pending" });
    const openTickets = await Ticket.countDocuments({ status: { $in: ["Open", "Assigned", "In Progress"] } });
    const resolvedTickets = await Ticket.countDocuments({ status: "Resolved" });

    res.json({
      success: true,
      metrics: {
        totalRetailers,
        activeRetailers,
        inactiveRetailers,
        totalLeads,
        newLeads,
        pendingFollowups,
        openTickets,
        resolvedTickets,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. Leads Management
// ==========================================
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().populate("assignedSalesPerson", "fullName phone").sort({ createdAt: -1 });
    res.json({ success: true, count: leads.length, leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLead = async (req, res) => {
  try {
    const { businessName, ownerName, phone, email, location, source, status, assignedSalesPerson, notes } = req.body;
    const lead = await Lead.create({
      businessName,
      ownerName,
      phone,
      email,
      location,
      source: source || "Direct Visit",
      status: status || "New",
      assignedSalesPerson: assignedSalesPerson || req.user?.id,
      notes,
    });

    res.status(201).json({ success: true, message: "Lead created successfully.", lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: "Lead status updated.", lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Lead removed." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. Follow-Ups Management
// ==========================================
exports.getFollowUps = async (req, res) => {
  try {
    const followUps = await FollowUp.find()
      .populate("retailer", "fullName shopName phone")
      .populate("lead", "businessName ownerName phone")
      .sort({ nextFollowUpDate: 1 });

    res.json({ success: true, count: followUps.length, followUps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFollowUp = async (req, res) => {
  try {
    const { retailerId, leadId, nextFollowUpDate, followUpType, remarks } = req.body;
    const followUp = await FollowUp.create({
      retailer: retailerId || null,
      lead: leadId || null,
      nextFollowUpDate: nextFollowUpDate || new Date(),
      followUpType: followUpType || "Call",
      remarks,
      createdBy: req.user?.id,
    });

    res.status(201).json({ success: true, message: "Follow-up scheduled.", followUp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: "Follow-up updated.", followUp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. Support Ticket System
// ==========================================
exports.getTickets = async (req, res) => {
  try {
    const query = {};
    if (req.user?.role === "retailer") query.retailer = req.user.id;

    const tickets = await Ticket.find(query)
      .populate("retailer", "fullName shopName phone")
      .populate("order", "orderNumber totalAmount")
      .populate("assignedEmployee", "fullName phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const { category, orderId, subject, description, priority } = req.body;
    const retailerId = req.user?.role === "retailer" ? req.user.id : req.body.retailerId;

    const ticket = await Ticket.create({
      retailer: retailerId,
      category: category || "Complaint",
      order: orderId || null,
      subject,
      description,
      priority: priority || "Medium",
    });

    res.status(201).json({ success: true, message: "Support ticket created.", ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const { status, assignedEmployee, resolutionNotes } = req.body;
    const update = { status, assignedEmployee, resolutionNotes };
    if (status === "Resolved" || status === "Closed") {
      update.resolvedAt = new Date();
    }

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, message: "Ticket status updated.", ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. Complaint Management
// ==========================================
exports.getComplaints = async (req, res) => {
  try {
    const query = {};
    if (req.user?.role === "retailer") query.retailer = req.user.id;

    const complaints = await Complaint.find(query)
      .populate("retailer", "fullName shopName phone")
      .populate("order", "orderNumber")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createComplaint = async (req, res) => {
  try {
    const { complaint, orderId, images } = req.body;
    const retailerId = req.user?.role === "retailer" ? req.user.id : req.body.retailerId;

    const newComplaint = await Complaint.create({
      retailer: retailerId,
      order: orderId || null,
      complaint,
      images: images || [],
    });

    res.status(201).json({ success: true, message: "Complaint submitted successfully.", complaint: newComplaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Contact = require("../models/Contact");

// ==============================
// Create Contact Enquiry
// ==============================

const createContact = async (req, res) => {
  try {
    const { name, phone, email, company, message } = req.body;

    // Validation
    if (!name || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, Phone and Message are required",
      });
    }

    const contact = await Contact.create({
      name,
      phone,
      email,
      company,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Enquiry Submitted Successfully",
      contact,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// Get All Contact Enquiries
// ==============================

const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// Delete Contact Enquiry
// ==============================

const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Enquiry Not Found",
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      message: "Enquiry Deleted Successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// Mark Contact as Contacted
// ==============================

const markAsContacted = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Enquiry Not Found",
      });
    }

    contact.status = "Contacted";

    await contact.save();

    res.status(200).json({
      success: true,
      message: "Enquiry marked as Contacted",
      contact,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  deleteContact,
  markAsContacted,
};

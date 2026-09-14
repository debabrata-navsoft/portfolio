import Contact from "../models/contact.model.js";
import { sendContactMail } from "../utils/emails/sendMail.js";
import { parseSort } from "../utils/queryFilters.js";

export const createContact = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const contact = await Contact.create({
      firstName,
      lastName,
      email,
      subject,
      message,
    });

    try {
      await sendContactMail({
        firstName,
        lastName,
        email,
        subject,
        message,
      });
    } catch (mailError) {
      console.log("Email sending failed:", mailError.message);
    }

    res.status(201).json({
      message: "Message sent successfully",
      contact,
    });
  } catch (error) {
    console.error("Contact Error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getContacts = async (req, res) => {
  try {
    const sort = parseSort(req.query, "createdAt", "desc");
    const contacts = await Contact.find().sort(sort);

    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found",
      });
    }

    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        isRead: true,
      },
      {
        returnDocument: "after",
      },
    );

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found",
      });
    }

    res.status(200).json({
      message: "Marked as read",
      contact,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found",
      });
    }

    res.status(200).json({
      message: "Contact deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

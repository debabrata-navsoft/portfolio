import express from "express";
import {
  createContact,
  getContacts,
  getContactById,
  markAsRead,
  deleteContact,
} from "../controllers/contact.controller.js";
import protectAdmin from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", createContact);
router.get("/", protectAdmin, getContacts);
router.get("/:id", protectAdmin, getContactById);
router.patch("/:id/read", protectAdmin, markAsRead);
router.delete("/:id", protectAdmin, deleteContact);

export default router;

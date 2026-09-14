import express from "express";
import {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getFAQById,
} from "../controllers/faq.controller.js";

const router = express.Router();

// Public
router.get("/", getFAQs);
router.get("/:id", getFAQById);
// Admin
router.post("/", createFAQ);
router.put("/:id", updateFAQ);
router.delete("/:id", deleteFAQ);

export default router;

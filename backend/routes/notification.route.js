import express from "express";
import protectAdmin from "../middleware/auth.middleware.js";
import {
  clearNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

// Admin only — notifications carry visitors' names and messages.
router.get("/", protectAdmin, getNotifications);
router.patch("/read-all", protectAdmin, markAllNotificationsRead);
router.patch("/:id/read", protectAdmin, markNotificationRead);
router.delete("/", protectAdmin, clearNotifications);
router.delete("/:id", protectAdmin, deleteNotification);

export default router;

import express from "express";
import {
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
} from "../controllers/admin.controller.js";
import protectAdmin from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/profile", protectAdmin, getAdminProfile);

export default router;

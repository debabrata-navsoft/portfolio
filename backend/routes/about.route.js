import express from "express";
import protectAdmin from "../middleware/auth.middleware.js";
import { uploadProfile } from "../middleware/upload.js";
import {
  createOrUpdateAbout,
  getAbout,
} from "../controllers/about.controller.js";

const router = express.Router();

router.post("/", protectAdmin, uploadProfile.array("images", 4), createOrUpdateAbout);
router.get("/", getAbout);

export default router;

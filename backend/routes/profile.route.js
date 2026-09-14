import express from "express";
import { uploadProfile } from "../middleware/upload.js";
import {
  uploadProfileImage,
  saveResumeLink,
  getResumeLink,
  getProfile,
  updateProfileContent,
} from "../controllers/profile.controller.js";

const router = express.Router();

// Profile
router.get("/", getProfile);
router.put("/", updateProfileContent);
router.post("/image", uploadProfile.single("image"), uploadProfileImage);

// Resume
router.post("/resume", saveResumeLink);
router.get("/resume", getResumeLink);

export default router;

import express from "express";
import {
  createExperience,
  getExperiences,
  getExperienceById,
  updateExperience,
  deleteExperience,
} from "../controllers/experience.controller.js";

const router = express.Router();

router.post("/", createExperience);
router.get("/", getExperiences);
router.get("/:id", getExperienceById);
router.put("/:id", updateExperience);
router.delete("/:id", deleteExperience);

export default router;

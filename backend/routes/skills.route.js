import express from "express";
import {
  createSkill,
  getSkills,
  updateSkill,
  deleteSkill,
} from "../controllers/skills.controller.js";
import { uploadSkill } from "../middleware/upload.js";

const router = express.Router();

router.post("/", uploadSkill.single("image"), createSkill);
router.get("/", getSkills);
router.put("/:id", uploadSkill.single("image"), updateSkill);
router.delete("/:id", deleteSkill);

export default router;
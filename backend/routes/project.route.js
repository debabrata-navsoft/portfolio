import express from "express";
import protectAdmin from "../middleware/auth.middleware.js";
import { uploadProject } from "../middleware/upload.js";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  getProjectBySlug,
} from "../controllers/project.controller.js";

const router = express.Router();

const uploadProjectImages = uploadProject.fields([
  { name: "projectCardImage", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

router.get("/", getProjects);
router.get("/:slug", getProjectBySlug);

router.post("/", protectAdmin, uploadProjectImages, createProject);
router.put("/:id", protectAdmin, uploadProjectImages, updateProject);
router.delete("/:id", protectAdmin, deleteProject);

export default router;

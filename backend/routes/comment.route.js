import express from "express";
import protectAdmin from "../middleware/auth.middleware.js";
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.get("/", getComments);
router.post("/", createComment);
router.put("/:id", protectAdmin, updateComment);
router.delete("/:id", protectAdmin, deleteComment);

export default router;

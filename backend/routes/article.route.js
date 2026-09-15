import express from "express";
import protectAdmin from "../middleware/auth.middleware.js";
import { uploadArticle } from "../middleware/upload.js";
import {
  createArticle,
  deleteArticle,
  getArticleBySlug,
  getArticles,
  registerArticleView,
  resetArticleStats,
  toggleArticleLike,
  updateArticle,
} from "../controllers/article.controller.js";

const router = express.Router();

router.get("/", getArticles);
router.get("/:slug", getArticleBySlug);
router.post("/:slug/view", registerArticleView);
router.post("/:slug/like", toggleArticleLike);
router.post("/:slug/reset-stats", protectAdmin, resetArticleStats);
router.post("/", protectAdmin, uploadArticle.single("image"), createArticle);
router.put("/:id", protectAdmin, uploadArticle.single("image"), updateArticle);
router.delete("/:id", protectAdmin, deleteArticle);

export default router;

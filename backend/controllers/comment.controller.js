import mongoose from "mongoose";

import Comment from "../models/comment.model.js";
import Article from "../models/article.model.js";
import { adminFromRequest } from "../middleware/auth.middleware.js";
import { emitCommentsChanged } from "../config/socket.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const serverError = (res, error) =>
  res.status(500).json({ message: "Server error", error: error.message });

const notFound = (res, what) => res.status(404).json({ message: `${what} not found` });

const findArticle = async (identifier) => {
  if (!identifier) return null;

  if (mongoose.isValidObjectId(identifier)) {
    return Article.findById(identifier);
  }

  return Article.findOne({ slug: identifier });
};

const buildThread = (comments) => {
  const replies = new Map();

  comments
    .filter((comment) => comment.parent)
    .forEach((comment) => {
      const key = String(comment.parent);
      replies.set(key, [...(replies.get(key) || []), comment]);
    });

  return comments
    .filter((comment) => !comment.parent)
    .map((comment) => ({
      ...comment,
      replies: replies.get(String(comment._id)) || [],
    }))
    .reverse();
};

// The form promises the email is never shown, so it must not even reach a reader's browser.
const withoutEmail = ({ email, ...comment }) => comment;

export const getComments = async (req, res) => {
  try {
    const { article: identifier } = req.query;
    const admin = await adminFromRequest(req);

    // Listing every comment across articles is a moderation view, not a public one.
    if (!identifier) {
      if (!admin) {
        return res.status(401).json({ message: "Not authorized" });
      }

      const comments = await Comment.find()
        .sort({ createdAt: -1 })
        .populate("article", "title slug")
        .lean();

      return res.json({ items: comments, total: comments.length });
    }

    const article = await findArticle(identifier);

    if (!article) {
      return notFound(res, "Article");
    }

    const comments = await Comment.find({ article: article._id })
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      items: buildThread(admin ? comments : comments.map(withoutEmail)),
      total: comments.length,
    });
  } catch (error) {
    serverError(res, error);
  }
};

export const createComment = async (req, res) => {
  try {
    const { article: identifier, name, email, message, parent } = req.body;

    if (!name?.trim() || !message?.trim()) {
      return res.status(400).json({ message: "Name and message are required" });
    }

    if (email?.trim() && !EMAIL_PATTERN.test(email.trim())) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    const article = await findArticle(identifier);

    if (!article) {
      return notFound(res, "Article");
    }

    let parentId = null;

    if (parent) {
      const parentComment = await Comment.findById(parent);

      if (!parentComment || String(parentComment.article) !== String(article._id)) {
        return notFound(res, "Comment");
      }

      parentId = parentComment.parent || parentComment._id;
    }

    const admin = req.body.isAuthor === true ? await adminFromRequest(req) : null;

    const comment = await Comment.create({
      article: article._id,
      parent: parentId,
      name: admin?.name?.trim() || name.trim(),
      email: email?.trim() || "",
      message: message.trim(),
      isAuthor: !!admin,
    });

    emitCommentsChanged(article._id);

    res.status(201).json({
      message: "Comment posted successfully",
      comment,
    });
  } catch (error) {
    serverError(res, error);
  }
};

/** Admin-only: fix up or moderate the text of a comment. */
export const updateComment = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { message: message.trim() },
      { returnDocument: "after" },
    );

    if (!comment) {
      return notFound(res, "Comment");
    }

    emitCommentsChanged(comment.article);

    res.json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    serverError(res, error);
  }
};

/** Deletes the comment and, when it is a top-level one, its replies. */
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return notFound(res, "Comment");
    }

    await Comment.deleteMany({ $or: [{ _id: id }, { parent: id }] });

    emitCommentsChanged(comment.article);

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    serverError(res, error);
  }
};

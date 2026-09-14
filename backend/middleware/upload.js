import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const imageFormats = ["jpg", "jpeg", "png", "webp"];

const projectStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "portfolio/projects",
    allowed_formats: imageFormats,
  },
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "portfolio/profile",
    allowed_formats: imageFormats,
  },
});

const skillStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "portfolio/skills",
    allowed_formats: imageFormats,
  },
});

const articleStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "portfolio/blogs",
    allowed_formats: imageFormats,
  },
});

export const uploadProject = multer({ storage: projectStorage });
export const uploadProfile = multer({ storage: profileStorage });
export const uploadSkill = multer({ storage: skillStorage });
export const uploadArticle = multer({ storage: articleStorage });

// import express from "express";
// import {
//   uploadProject,
//   uploadProfile,
//   uploadSkill,
//   uploadBlog,
//   // uploadResume,
// } from "../middleware/upload.js";

// import {
//   uploadProjectImage,
//   uploadProfileImage,
//   getProfileImage,
//   uploadSkillImage,
//   uploadBlogImage,
//   // uploadResumeFile,
//   // getResumeFile,
//   // viewResumeFile,
// } from "../controllers/upload.controller.js";

// const router = express.Router();

// router.post("/project", uploadProject.single("image"), uploadProjectImage);
// router.post("/profile", uploadProfile.single("image"), uploadProfileImage);
// router.get("/profile", getProfileImage);

// router.post("/skill", uploadSkill.single("image"), uploadSkillImage);
// router.post("/blog", uploadBlog.single("image"), uploadBlogImage);

// // router.post("/resume", uploadResume.single("resume"), uploadResumeFile);
// // router.get("/resume/view", viewResumeFile);
// // router.get("/resume", getResumeFile);

// export default router;

// // import express from "express";
// // import { v2 as cloudinary } from "cloudinary";
// // import {
// //   uploadProject,
// //   uploadProfile,
// //   uploadSkill,
// //   uploadBlog,
// //   uploadResume,
// // } from "../middleware/upload.js";
// // import Resume from "../models/resume.model.js";

// // const router = express.Router();

// // router.post("/project", uploadProject.single("image"), (req, res) => {
// //   if (!req.file) return res.status(400).json({ message: "No file uploaded" });
// //   res.json({ imageUrl: req.file.path });
// // });

// // import Profile from "../models/profile.model.js";

// // router.post("/profile", uploadProfile.single("image"), async (req, res) => {
// //   if (!req.file) return res.status(400).json({ message: "No file uploaded" });
// //   try {
// //     await Profile.deleteMany({}); // only keep latest
// //     const profile = await Profile.create({ imageUrl: req.file.path });
// //     res.json({ imageUrl: profile.imageUrl });
// //   } catch (error) {
// //     res.status(500).json({ message: "Server error", error });
// //   }
// // });

// // router.get("/profile", async (req, res) => {
// //   try {
// //     const profile = await Profile.findOne().sort({ createdAt: -1 });
// //     if (!profile)
// //       return res.status(404).json({ message: "No profile image found" });
// //     res.json({ imageUrl: profile.imageUrl });
// //   } catch (error) {
// //     res.status(500).json({ message: "Server error", error });
// //   }
// // });

// // // router.post("/profile", uploadProfile.single("image"), (req, res) => {
// // //   if (!req.file) return res.status(400).json({ message: "No file uploaded" });
// // //   res.json({ imageUrl: req.file.path });
// // // });

// // router.post("/skill", uploadSkill.single("image"), (req, res) => {
// //   if (!req.file) return res.status(400).json({ message: "No file uploaded" });
// //   res.json({ imageUrl: req.file.path });
// // });

// // router.post("/blog", uploadBlog.single("image"), (req, res) => {
// //   if (!req.file) return res.status(400).json({ message: "No file uploaded" });
// //   res.json({ imageUrl: req.file.path });
// // });

// // router.post("/resume", uploadResume.single("resume"), async (req, res) => {
// //   if (!req.file) return res.status(400).json({ message: "No file uploaded" });
// //   try {
// //     const viewUrl = req.file.path.replace(
// //       "/upload/",
// //       "/upload/fl_attachment:false/",
// //     );

// //     await Resume.deleteMany({});
// //     const resume = await Resume.create({ resumeUrl: viewUrl });

// //     res.json({ message: "Resume uploaded!", resumeUrl: resume.resumeUrl });
// //   } catch (error) {
// //     res.status(500).json({ message: "Server error", error });
// //   }
// // });

// // router.get("/resume", async (req, res) => {
// //   try {
// //     const resume = await Resume.findOne().sort({ createdAt: -1 });
// //     if (!resume) return res.status(404).json({ message: "No resume found" });

// //     res.json({ resumeUrl: resume.resumeUrl });
// //   } catch (error) {
// //     res.status(500).json({ message: "Server error", error });
// //   }
// // });

// // // router.post("/resume", uploadResume.single("resume"), async (req, res) => {
// // //   if (!req.file) return res.status(400).json({ message: "No file uploaded" });
// // //   try {
// // //     await Resume.deleteMany({});
// // //     const resume = await Resume.create({ resumeUrl: req.file.path });
// // //     res.json({ message: "Resume uploaded!", resumeUrl: resume.resumeUrl });
// // //   } catch (error) {
// // //     res.status(500).json({ message: "Server error", error });
// // //   }
// // // });

// // // router.get("/resume", async (req, res) => {
// // //   try {
// // //     const resume = await Resume.findOne().sort({ createdAt: -1 });
// // //     if (!resume) return res.status(404).json({ message: "No resume found" });
// // //     res.json({ resumeUrl: resume.resumeUrl });
// // //   } catch (error) {
// // //     res.status(500).json({ message: "Server error", error });
// // //   }
// // // });

// // export default router;

// // // import express from "express";
// // // import upload, { uploadResume } from "../middleware/upload.js";

// // // const router = express.Router();

// // // //  Existing — Image upload
// // // router.post("/upload", upload.single("image"), (req, res) => {
// // //   if (!req.file) return res.status(400).json({ message: "No file uploaded" });

// // //   res.json({
// // //     imageUrl: req.file.path,
// // //   });
// // // });

// // // //  New — Resume/PDF upload
// // // router.post("/resume", uploadResume.single("resume"), (req, res) => {
// // //   if (!req.file) return res.status(400).json({ message: "No file uploaded" });

// // //   res.json({
// // //     message: "Resume uploaded successfully!",
// // //     resumeUrl: req.file.path, // Cloudinary URL
// // //   });
// // // });

// // // export default router;

// // // import express from "express";
// // // import upload from "../middleware/upload.js";

// // // const router = express.Router();

// // // router.post("/upload", upload.single("image"), (req, res) => {
// // //   res.json({
// // //     imageUrl: req.file.path,
// // //   });
// // // });

// // // export default router;

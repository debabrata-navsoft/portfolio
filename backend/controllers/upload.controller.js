// import Profile from "../models/profile.model.js";
// // import Resume from "../models/resume.model.js";

// export const uploadProjectImage = (req, res) => {
//   if (!req.file) return res.status(400).json({ message: "No file uploaded" });

//   res.json({ imageUrl: req.file.path });
// };

// export const uploadProfileImage = async (req, res) => {
//   if (!req.file) return res.status(400).json({ message: "No file uploaded" });

//   try {
//     await Profile.deleteMany({});

//     const profile = await Profile.create({
//       imageUrl: req.file.path,
//     });

//     res.json({ imageUrl: profile.imageUrl });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// export const getProfileImage = async (req, res) => {
//   try {
//     const profile = await Profile.findOne().sort({ createdAt: -1 });

//     if (!profile) {
//       return res.status(404).json({ message: "No profile image found" });
//     }

//     res.json({ imageUrl: profile.imageUrl });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// export const uploadSkillImage = (req, res) => {
//   if (!req.file) return res.status(400).json({ message: "No file uploaded" });

//   res.json({ imageUrl: req.file.path });
// };

// export const uploadBlogImage = (req, res) => {
//   if (!req.file) return res.status(400).json({ message: "No file uploaded" });

//   res.json({ imageUrl: req.file.path });
// };

// export const uploadResumeFile = async (req, res) => {
//   if (!req.file) return res.status(400).json({ message: "No file uploaded" });

//   try {
//     await Resume.deleteMany({});

//     const resume = await Resume.create({
//       resumeUrl: req.file.path,
//     });

//     res.json({
//       message: "Resume uploaded successfully",
//       resumeUrl: resume.resumeUrl,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// export const uploadResumeFile = async (req, res) => {
//   if (!req.file) return res.status(400).json({ message: "No file uploaded" });

//   try {
//     await Resume.deleteMany({});

//     const resume = await Resume.create({
//       resumeUrl: req.file.path,
//     });

//     res.json({
//       message: "Resume uploaded successfully",
//       resumeUrl: resume.resumeUrl,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// export const getResumeFile = async (req, res) => {
//   try {
//     const resume = await Resume.findOne().sort({ createdAt: -1 });

//     if (!resume) {
//       return res.status(404).json({ message: "No resume found" });
//     }

//     res.json({ resumeUrl: resume.resumeUrl });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

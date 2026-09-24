import Profile from "../models/profile.model.js";
import Resume from "../models/resume.model.js";

export const uploadProfileImage = async (req, res) => {
  try {
    let profile = await Profile.findOne();

    if (!profile) {
      profile = await Profile.create({
        imageUrl: req.file.path,
      });
    } else {
      profile.imageUrl = req.file.path;
      await profile.save();
    }

    res.json({
      message: "Profile image updated",
      imageUrl: profile.imageUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfileContent = async (req, res) => {
  try {
    const { heroGradientText, heroHeading, introduction, profileDescription } =
      req.body;

    let profile = await Profile.findOne();

    if (!profile) {
      profile = await Profile.create({
        heroGradientText,
        heroHeading,
        introduction,
        profileDescription,
      });
    } else {
      profile.heroGradientText = heroGradientText;
      profile.heroHeading = heroHeading;
      profile.introduction = introduction;
      profile.profileDescription = profileDescription;

      await profile.save();
    }

    res.json({
      message: "Profile content updated",
      profile,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne();

    if (!profile) {
      return res.status(404).json({
        message: "No profile found",
      });
    }

    res.json({
      imageUrl: profile.imageUrl,
      heroGradientText: profile.heroGradientText,
      heroHeading: profile.heroHeading,
      introduction: profile.introduction,
      profileDescription: profile.profileDescription,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const saveResumeLink = async (req, res) => {
  try {
    const { resumeUrl } = req.body;

    if (!resumeUrl) {
      return res.status(400).json({ message: "Resume URL is required" });
    }

    await Resume.deleteMany({});

    const resume = await Resume.create({ resumeUrl });

    res.status(201).json({
      message: "Resume link saved successfully",
      resumeUrl: resume.resumeUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getResumeLink = async (req, res) => {
  try {
    const resume = await Resume.findOne().sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({ message: "No resume found" });
    }

    res.json({
      resumeUrl: resume.resumeUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

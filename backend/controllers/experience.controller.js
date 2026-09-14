import Experience from "../models/experience.model.js";
import { parseSort } from "../utils/queryFilters.js";

export const createExperience = async (req, res) => {
  try {
    const experience = await Experience.create(req.body);

    res.status(201).json({
      message: "Experience created successfully",
      experience,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getExperiences = async (req, res) => {
  try {
    const sort = parseSort(req.query, "createdAt", "desc");
    const experiences = await Experience.find().sort(sort);

    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getExperienceById = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    res.json(experience);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    );

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    res.json({
      message: "Experience updated successfully",
      experience,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const experience = await Experience.findByIdAndDelete(req.params.id);

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    res.json({ message: "Experience deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

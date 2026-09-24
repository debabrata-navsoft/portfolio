import Skill from "../models/skills.model.js";
import { parseSort } from "../utils/queryFilters.js";

const PERCENTAGE_ERROR = { message: "Skill percentage must be a number between 0 and 100" };

// Empty / missing means 0; returns null when the value is not a number in 0–100.
const parsePercentage = (value) => {
  const percentage = value === undefined || value === "" ? 0 : Number(value);

  return Number.isNaN(percentage) || percentage < 0 || percentage > 100 ? null : percentage;
};

export const createSkill = async (req, res) => {
  try {
    const { name, category, websiteUrl, percentage } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Skill name is required" });
    }

    if (!category) {
      return res.status(400).json({ message: "Skill category is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Skill image is required" });
    }

    const skillPercentage = parsePercentage(percentage);

    if (skillPercentage === null) {
      return res.status(400).json(PERCENTAGE_ERROR);
    }

    const skill = await Skill.create({
      name,
      category,
      websiteUrl,
      percentage: skillPercentage,
      imageUrl: req.file.path,
    });

    res.status(201).json({
      message: "Skill created successfully",
      skill,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getSkills = async (req, res) => {
  try {
    const sort = parseSort(req.query, "createdAt", "desc");
    const skills = await Skill.find().sort(sort);

    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const { name, category, websiteUrl, percentage } = req.body;

    const updateData = {};

    if (name !== undefined) {
      if (!name) {
        return res.status(400).json({ message: "Skill name is required" });
      }
      updateData.name = name;
    }

    if (category !== undefined) {
      if (!category) {
        return res.status(400).json({ message: "Skill category is required" });
      }
      updateData.category = category;
    }

    if (websiteUrl !== undefined) {
      updateData.websiteUrl = websiteUrl;
    }

    if (percentage !== undefined) {
      const skillPercentage = parsePercentage(percentage);

      if (skillPercentage === null) {
        return res.status(400).json(PERCENTAGE_ERROR);
      }

      updateData.percentage = skillPercentage;
    }

    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    const skill = await Skill.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!skill) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    res.json({
      message: "Skill updated successfully",
      skill,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);

    if (!skill) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    res.json({
      message: "Skill deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

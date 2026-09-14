import Education from "../models/education.model.js";
import { parseSort } from "../utils/queryFilters.js";

export const createEducation = async (req, res) => {
  try {
    const { school, degree, years } = req.body;

    if (!school || !degree || !years) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const education = await Education.create({
      school,
      degree,
      years,
    });

    res.status(201).json({
      message: "Education created successfully",
      education,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getEducations = async (req, res) => {
  try {
    const sort = parseSort(req.query, "createdAt", "desc");
    const educations = await Education.find().sort(sort);
    res.status(200).json(educations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const education = await Education.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
      // { new: true },
    );

    if (!education) {
      return res.status(404).json({ message: "Education not found" });
    }

    res.status(200).json({
      message: "Education updated successfully",
      education,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteEducation = async (req, res) => {
  try {
    const education = await Education.findByIdAndDelete(req.params.id);

    if (!education) {
      return res.status(404).json({ message: "Education not found" });
    }

    res.status(200).json({
      message: "Education deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

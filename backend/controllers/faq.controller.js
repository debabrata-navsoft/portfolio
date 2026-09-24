import FAQ from "../models/faq.model.js";
import { parseSort } from "../utils/queryFilters.js";

export const getFAQs = async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { isActive: true };
    const sort = parseSort(req.query, "order", "desc");
    const faqs = await FAQ.find(filter).sort(sort);
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch FAQs" });
  }
};

export const createFAQ = async (req, res) => {
  try {
    const lastFAQ = await FAQ.findOne().sort({ order: -1 });
    const nextOrder = lastFAQ ? lastFAQ.order + 1 : 0;

    const faq = await FAQ.create({ ...req.body, order: nextOrder });

    res.status(201).json({
      message: "FAQ created successfully",
      faq,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create FAQ" });
  }
};

export const getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json(faq);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch FAQ" });
  }
};

export const updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
    });

    res.status(200).json({
      message: "FAQ updated successfully",
      faq,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update FAQ" });
  }
};

export const deleteFAQ = async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "FAQ deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete FAQ" });
  }
};

import About from "../models/about.model.js";

const MAX_IMAGES = 4;

const parseArray = (value) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Rebuilds the gallery from the slots the admin kept (`existingImages`) with this
 * request's uploads dropped into the slots they replace (`imageSlots`). Clients that
 * send no slot map keep the stored images when they upload nothing, so a text-only
 * save can't wipe the gallery.
 */
const mergeImages = (body, files, stored = []) => {
  const kept = parseArray(body.existingImages) || (files.length ? [] : stored);
  const slots = parseArray(body.imageSlots) || [];
  const images = [...kept];

  files.forEach((file, i) => {
    images[Number.isInteger(slots[i]) ? slots[i] : images.length] = file.path;
  });

  return images.filter(Boolean).slice(0, MAX_IMAGES);
};

export const createOrUpdateAbout = async (req, res) => {
  try {
    const { description, email, location } = req.body;

    if (!description || !email || !location) {
      return res.status(400).json({
        message: "Description, email and location are required",
      });
    }

    const previous = await About.findOne().sort({ createdAt: -1 });
    const images = mergeImages(req.body, req.files || [], previous?.images);

    await About.deleteMany({});

    const about = await About.create({
      description,
      email,
      location,
      images,
    });

    res.status(201).json({
      message: "About saved successfully",
      about,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAbout = async (req, res) => {
  try {
    const about = await About.findOne().sort({ createdAt: -1 });

    if (!about) {
      return res.status(404).json({ message: "About not found" });
    }

    res.json(about);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

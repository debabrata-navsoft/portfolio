import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    projectDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    overview: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    projectCardImage: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    technologies: {
      type: [String],
      default: [],
    },

    liveUrl: {
      type: String,
      default: "",
    },

    githubUrl: {
      type: String,
      default: "",
    },

    // Inactive projects are hidden from the public site. Docs saved before this field existed
    // have no value, so the visibility filter treats "missing" as active ($ne: false).
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Project = mongoose.model("Project", projectSchema);

export default Project;

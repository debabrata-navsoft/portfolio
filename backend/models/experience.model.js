import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    years: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const Experience = mongoose.model("Experience", experienceSchema);

export default Experience;

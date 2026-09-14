import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    websiteUrl: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      default: "Frontend",
    },

    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Skills", skillSchema);

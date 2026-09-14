import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 4,
        message: "You can upload a maximum of 4 images",
      },
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("About", aboutSchema);

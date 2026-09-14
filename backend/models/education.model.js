import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
  {
    school: {
      type: String,
      required: true,
      trim: true,
    },
    degree: {
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

const Education = mongoose.model("Education", educationSchema);

export default Education;

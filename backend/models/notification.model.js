import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["like", "comment", "contact"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    // Admin route the bell opens, e.g. /admin/articles/<slug> or /admin/contacts/<id>
    link: {
      type: String,
      default: "",
    },
    // The comment that raised it, so deleting the comment removes the notification too
    source: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Notification", notificationSchema);

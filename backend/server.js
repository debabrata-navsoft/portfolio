import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { connectDB } from "./config/db.js";
import { initSocket } from "./config/socket.js";
import adminRoutes from "./routes/admin.route.js";
import aboutRoutes from "./routes/about.route.js";
import skillRoutes from "./routes/skills.route.js";
import experienceRoutes from "./routes/experience.route.js";
import educationRoutes from "./routes/education.route.js";
import profileRoutes from "./routes/profile.route.js";
import projectRoutes from "./routes/project.route.js";
import contactRoutes from "./routes/contact.route.js";
import articleRoutes from "./routes/article.route.js";
import faqRoutes from "./routes/faq.routes.js";
import commentRoutes from "./routes/comment.route.js";
import notificationRoutes from "./routes/notification.route.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:4200",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use("/api/admin", adminRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/educations", educationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

const server = createServer(app);

initSocket(server, allowedOrigins);

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Socket.io ready for live comments");
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();

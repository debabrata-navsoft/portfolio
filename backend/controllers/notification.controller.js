import Notification from "../models/notification.model.js";
import { emitToAdmin } from "../config/socket.js";
import { isTrue } from "../utils/queryFilters.js";

const LIST_LIMIT = 30;

/**
 * Called by the like / comment / contact handlers. Never throws — a failed notification
 * must not fail the visitor's request that triggered it.
 */
export const notify = async ({ type, title, message = "", link = "" }) => {
  try {
    const notification = await Notification.create({
      type,
      title,
      message: message.slice(0, 160),
      link,
    });

    emitToAdmin("notification:new", notification);
  } catch (error) {
    console.log("Notification failed:", error.message);
  }
};

// The bell gets the latest LIST_LIMIT; `?all=true` (the notifications page) gets everything.
/**
 * Takes back one notification — e.g. an unlike cancels a like. Likes are anonymous, so it removes
 * the newest matching one (unread first). Never throws, same as `notify`.
 */
export const unnotify = async ({ type, link }) => {
  try {
    const notification = await Notification.findOneAndDelete(
      { type, link },
      { sort: { isRead: 1, createdAt: -1 } },
    );

    if (notification) emitToAdmin("notification:removed", notification);
  } catch (error) {
    console.log("Notification removal failed:", error.message);
  }
};

export const getNotifications = async (req, res) => {
  try {
    const query = Notification.find().sort({ createdAt: -1 });
    if (!isTrue(req.query.all)) query.limit(LIST_LIMIT);

    const [items, unreadCount] = await Promise.all([
      query.exec(),
      Notification.countDocuments({ isRead: false }),
    ]);

    res.status(200).json({ items, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { returnDocument: "after" },
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notifications" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

export const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.status(200).json({ message: "Notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear notifications" });
  }
};

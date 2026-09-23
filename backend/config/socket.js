import { Server } from "socket.io";
import { adminFromToken } from "../middleware/auth.middleware.js";

// Sockets that proved an admin token; admin-only events (notifications) go only here.
const ADMIN_ROOM = "admins";

let io = null;

/** Attaches socket.io to the HTTP server; the CORS list mirrors the REST one. */
export const initSocket = (server, allowedOrigins) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} (${io.engine.clientsCount} online)`);

    socket.on("admin:join", async (token) => {
      if (!(await adminFromToken(token))) return;

      socket.join(ADMIN_ROOM);
      console.log(`Socket joined admin room: ${socket.id}`);
    });

    socket.on("admin:leave", () => socket.leave(ADMIN_ROOM));

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

export const emitCommentsChanged = (articleId) => {
  io?.emit("comments:changed", { articleId: String(articleId) });
};

export const emitToAdmin = (event, payload) => {
  io?.to(ADMIN_ROOM).emit(event, payload);
};

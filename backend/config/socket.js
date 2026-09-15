import { Server } from "socket.io";

let io = null;

/** Attaches socket.io to the HTTP server; the CORS list mirrors the REST one. */
export const initSocket = (server, allowedOrigins) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  return io;
};

export const emitCommentsChanged = (articleId) => {
  io?.emit("comments:changed", { articleId: String(articleId) });
};

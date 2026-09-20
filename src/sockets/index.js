import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://lux.cmcsweb.online",
].filter(Boolean);

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // يسمح للـ requests بدون origin مثل Postman
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.log("❌ Socket CORS blocked:", origin);

        return callback(new Error("Not allowed by CORS"));
      },

      credentials: true,

      methods: ["GET", "POST"],
    },
  });

  // =========================
  // SOCKET AUTH
  // =========================

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace(
          "Bearer ",
          ""
        );

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      socket.user = decoded;

      next();
    } catch (error) {
      console.log("❌ Socket auth error:", error.message);

      next(new Error("Invalid token"));
    }
  });

  // =========================
  // CONNECTION
  // =========================

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // =========================
    // ONLINE USERS
    // =========================

    const onlineUsers = io.engine.clientsCount;

    io.emit("onlineUsers", onlineUsers);

    // =========================
    // ADMIN ROOM
    // =========================

    socket.on("admin", () => {
      if (socket.user?.role !== "admin") {
        console.log(
          `❌ Unauthorized admin room: ${socket.id}`
        );

        return;
      }

      socket.join("adminroom");

      console.log(
        `👑 ${socket.id} joined adminroom`
      );
    });

    // =========================
    // USER ORDER ROOM
    // =========================

    socket.on("userOrder", (idOrder) => {
      if (!idOrder) return;

      const room = `userOrder-${idOrder}`;

      socket.join(room);

      console.log(
        `📦 ${socket.id} joined room: ${room}`
      );
    });

    // =========================
    // DISCONNECT
    // =========================

    socket.on("disconnect", (reason) => {
      const activeUsers =
        io.engine.clientsCount;

      io.emit("onlineUsers", activeUsers);

      console.log(
        `❌ User disconnected: ${socket.id} | Reason: ${reason}`
      );

      console.log(
        "Online users:",
        activeUsers
      );
    });
  });

  return io;
};

// =========================
// GET IO
// =========================

const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.io not initialized"
    );
  }

  return io;
};

export {
  initSocket,
  getIO,
};
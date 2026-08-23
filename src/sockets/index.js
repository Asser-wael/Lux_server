import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

let io;

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://lux-client-one.vercel.app",
].filter(Boolean);

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  // =========================
  // AUTH MIDDLEWARE (يشتغل مرة واحدة وقت الـ connect)
  // =========================
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        // نسمح بالاتصال Guest (زي الزوار اللي بيتفرجوا بس)
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("role");

      if (!user) {
        socket.user = null;
        return next();
      }

      socket.user = { id: user._id.toString(), role: user.role };
      next();
    } catch (error) {
      // توكن غلط/منتهي = يتعامل كـ guest، مش يرفض الاتصال بالكامل
      socket.user = null;
      next();
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    const onlineUsers = io.engine.clientsCount;
    io.emit("onlineUsers", onlineUsers);

    // =========================
    // ADMIN ROOM
    // =========================
    socket.on("admin", () => {
      if (socket.user?.role !== "admin") {
        console.warn(`Blocked non-admin ${socket.id} from adminroom`);
        return;
      }

      socket.join("adminroom");
      console.log(`${socket.id} joined adminroom`);
    });

    // =========================
    // USER ORDER ROOM
    // =========================
    socket.on("userOrder", async (idOrder) => {
      if (!idOrder || !socket.user) return;

      // لازم تتأكد إن الأوردر ده فعلاً بتاع اليوزر ده
      // (أو إنه أدمن، لو الأدمن محتاج ينضم كمان)
      const Order = (await import("../models/Order.js")).default;
      const order = await Order.findById(idOrder).select("user");

      if (!order) return;

      const isOwner = order.user.toString() === socket.user.id;
      const isAdmin = socket.user.role === "admin";

      if (!isOwner && !isAdmin) {
        console.warn(`Blocked ${socket.id} from unauthorized order room`);
        return;
      }

      socket.join(`userOrder-${idOrder}`);
      console.log(`${socket.id} joined room: userOrder-${idOrder}`);
    });

    // =========================
    // DISCONNECT
    // =========================
    socket.on("disconnect", (reason) => {
      const activeUsers = io.engine.clientsCount;
      io.emit("onlineUsers", activeUsers);
      console.log(`User disconnected: ${socket.id} | Reason: ${reason}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

export { initSocket, getIO };
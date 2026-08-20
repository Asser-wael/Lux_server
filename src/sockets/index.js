import { Server } from "socket.io";

let io;

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://lux-client-one.vercel.app"
].filter(Boolean);

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // حساب المستخدمين المتصلين بدقة عبر engine.clientsCount
    const onlineUsers = io.engine.clientsCount;
    console.log("User connected:", socket.id);
    io.emit("onlineUsers", onlineUsers);
    
    socket.on("admin", () => {
      socket.join("adminroom");
      console.log(`${socket.id} joined adminroom`);
    });

    socket.on("userOrder", (idOrder) => {
      if (!idOrder) return;
      // ينضم للغرفة بالصيغة المقابلة لـ changeStatus
      socket.join(`userOrder-${idOrder}`);
      console.log(`${socket.id} joined room: userOrder-${idOrder}`);
    });

    socket.on("disconnect", () => {
      const activeUsers = io.engine.clientsCount;
      io.emit("onlineUsers", activeUsers);
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

export { initSocket, getIO };
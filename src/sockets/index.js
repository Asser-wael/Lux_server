import { Server } from "socket.io";

let io;
let onlineUsers = 0;

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
    onlineUsers++;
    console.log("User connected:", socket.id);
    io.emit("onlineUsers", onlineUsers);
    
    socket.on("admin", () => {
      socket.join("adminroom");
      console.log(`${socket.id} joined adminroom`);
    });
    socket.on("userOrder", (idOrder) => {
      socket.join(`userOrder-${idOrder}`);
    })
    socket.on("disconnect", () => {
      onlineUsers--;
      io.emit("onlineUsers", onlineUsers);
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
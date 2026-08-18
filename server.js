import "dotenv/config";
import http from "http";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";
import { initSocket } from "./src/sockets/index.js";

const server = http.createServer(app);

initSocket(server);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    console.log("🚀 Starting server...");
    console.log("PORT:", process.env.PORT);

    await connectDB();
    console.log("✅ MongoDB ready");

    await connectRedis();
    console.log("✅ Redis ready");

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🔥 Server running on 0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup error:");
    console.error(error);

    process.exit(1);
  }
};

start();
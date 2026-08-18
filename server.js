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
    await connectDB();
    await connectRedis();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
};

start();
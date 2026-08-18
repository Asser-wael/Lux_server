import http from "http";
import dotenv from "dotenv";

const result = dotenv.config({ path: "./.env" });


import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";
import { initSocket } from "./src/sockets/index.js";

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await connectRedis();
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();
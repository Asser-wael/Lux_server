import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";

import dashboardRoutes from "./routes/dashboardRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import productdetailsRoutes from "./routes/productdetailsRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import popularRoutes from "./routes/popularRoutes.js";
import trustRoutes from "./routes/trustRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";

import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.set("trust proxy", 1);

// =========================
// Security
// =========================

app.use(helmet());

// =========================
// CORS
// =========================

const allowedOrigins = [
    process.env.CLIENT_URL,
    "https://lux.cmcsweb.online",
].filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

// =========================
// Body Parser
// =========================

app.use(express.json({ limit: "1mb" }));

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb",
    })
);

app.use(cookieParser());

// =========================
// Mongo Sanitize
// =========================

app.use(mongoSanitize());

// =========================
// Rate Limit
// =========================

app.use(
    "/api",
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 300,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

// =========================
// Health Check
// =========================

app.get("/", (req, res) => {
    res.json({
        message: "portfolio",
    });
});

// =========================
// Routes
// =========================

app.use("/api/admin/dashboard", dashboardRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

app.use("/api/products", productdetailsRoutes);

app.use("/api/account", accountRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/popular", popularRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/trust", trustRoutes);


// =========================
// Error Handler
// =========================

app.use(errorHandler);

export default app;
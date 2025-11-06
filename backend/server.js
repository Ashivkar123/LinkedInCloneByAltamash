import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import postRoutes from "./routes/post.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();
const app = express();

/* -------------------- ✅ CORS Configuration -------------------- */
const allowedOrigins = [
  "http://localhost:3000", // Local dev
  "https://linked-in-clone-by-altamash.vercel.app", // Production frontend
  "https://linked-in-clone-by-altamash-r1ftjk3mp.vercel.app", // Preview deployments
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl or mobile)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ CORS blocked for origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

/* -------------------- ✅ Middleware -------------------- */
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; font-src 'self' data:; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
  );
  next();
});

// Log all requests
app.use((req, res, next) => {
  console.log(`[SERVER] ${req.method} ${req.url}`);
  next();
});

// Serve static uploads folder
app.use(express.static("uploads"));

/* -------------------- ✅ Routes -------------------- */
app.use("/", postRoutes);
app.use("/user", userRoutes);

/* -------------------- ✅ Global Error Handler -------------------- */
app.use((err, req, res, next) => {
  console.error("❌ Uncaught Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

/* -------------------- ✅ Database & Server Startup -------------------- */
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 9090;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
};

start();

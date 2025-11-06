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
  "http://localhost:3000", // Local development
  "https://linked-in-clone-by-altamash.vercel.app", // Main production frontend
  "https://linked-in-clone-by-altamash-r1ftjk3mp.vercel.app", // Vercel preview deployment
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ CORS blocked for origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

/* -------------------- ✅ Middleware -------------------- */
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; font-src 'self' data: http://localhost:9090; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
  );
  next();
});

// Log each request
app.use((req, res, next) => {
  console.log(`[SERVER] ${req.method} ${req.url}`);
  next();
});

// Serve uploaded files
app.use(express.static("uploads"));

/* -------------------- ✅ Routes -------------------- */
app.use("/", postRoutes);
app.use("/user", userRoutes);

/* -------------------- ✅ Database & Server -------------------- */
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }

  const PORT = process.env.PORT || 9090;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

start();

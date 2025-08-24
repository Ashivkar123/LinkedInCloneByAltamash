
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import postRoutes from "./routes/post.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; font-src 'self' data: http://localhost:9090; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
  );
  next();
});

// ✅ Log the request URL to see what's being requested
app.use((req, res, next) => {
  console.log(`[SERVER] Received a request for: ${req.method} ${req.url}`);
  next();
});

app.use(express.static("uploads"));

// ✅ These lines are correct and should not be changed.
app.use("/", postRoutes);
app.use("/user", userRoutes);

const start = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://ashivkar999:A_shivkar999linkedinclone@linkedinclone.prxtrjo.mongodb.net/?retryWrites=true&w=majority&appName=linkedinclone"
    );
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }

  app.listen(9090, () => {
    console.log("🚀 Server is Running on Port 9090");
  });
};

start();


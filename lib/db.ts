// lib/db.ts
import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tanoshi"; // Updated default to match your env variable

if (!MONGODB_URI) {
  throw new Error("⚠️ Please define the MONGODB_URI in .env.local");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (cached.conn) {
    console.log("[v0] Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("[v0] Creating new MongoDB connection to:", MONGODB_URI);
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      console.log("[v0] MongoDB connected successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error("[v0] MongoDB connection error:", error);
    throw error;
  }
}

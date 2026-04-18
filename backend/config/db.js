import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Configurable constants
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

// Environment validation on startup
const validateEnv = () => {
  if (!process.env.MONGODB_URL) {
    console.error("❌ CRITICAL ERROR: MONGODB_URL is missing in .env file.");
    process.exit(1);
  }
};

const connectDB = async (retries = MAX_RETRIES) => {
  validateEnv();

  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    retryWrites: true,
  };

  try {
    const mongooseConnection = await mongoose.connect(process.env.MONGODB_URL, options);
    console.log("✅ MongoDB connected successfully");
    console.log(`Connected to: ${mongooseConnection.connection.host}`);
    return mongooseConnection;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);

    // Fallback message for DNS/reaching issues
    if (error.message.includes("ENOTFOUND") || error.message.includes("serverSelectionTimeout")) {
      console.error("⚠️  Database is unreachable. This usually means:");
      console.error("  1. Your IP Address is not whitelisted in MongoDB Atlas Network Access.");
      console.error("  2. Your MongoDB Atlas cluster is paused or down.");
      console.error("  3. Your system is not connected to the internet.");
    }

    if (retries > 0) {
      console.log(`🔄 Retrying in ${RETRY_DELAY_MS / 1000} seconds... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
      return connectDB(retries - 1);
    } else {
      console.error("❌ Exhausted all connection retries. Exiting...");
      process.exit(1); 
    }
  }
};

export default connectDB;

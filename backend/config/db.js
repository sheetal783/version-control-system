import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const mongooseConnection = await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ MongoDB connected successfully");
    console.log(`Connected to: ${mongooseConnection.connection.host}`);
    return mongooseConnection;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("Full error:", error);
    process.exit(1); // Exit if connection fails
  }
};

export default connectDB;

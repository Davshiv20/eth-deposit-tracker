const mongoose = require("mongoose");
const config = require("../config");
const logger = require("../utils/logger");

async function connectDB() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

module.exports = { connectDB };

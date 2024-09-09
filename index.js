require('dotenv').config();
const mongoose = require('mongoose');
const { trackDeposits } = require('./services/depositService');
const { connectDB } = require('./services/dbService');
const { startMetricsServer } = require('./services/metricsService');
const logger = require('./utils/logger');
const config = require('./config');

// Set strictQuery to false to prepare for Mongoose 7
mongoose.set('strictQuery', false);

async function main() {
    logger.info(`Starting Ethereum Deposit Tracker on ${config.NETWORK} network`);
    
    await connectDB();
    startMetricsServer();
    await trackDeposits();
}

main().catch(error => {
    logger.error('An error occurred:', error);
    process.exit(1);
});
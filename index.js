require('dotenv').config();
const mongoose = require('mongoose');
const { trackDeposits } = require('./services/depositService');
const { connectDB } = require('./services/dbService');
const { startMetricsServer } = require('./services/metricsService');
const logger = require('./utils/logger');
const config = require('./config');

// Set strictQuery to false to prepare for Mongoose 7
mongoose.set('strictQuery', false);

// Global error handlers
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    // Perform any necessary cleanup here
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason: reason.message, stack: reason.stack });
    // Perform any necessary cleanup here
    process.exit(1);
});

async function main() {
    try {
        logger.info(`Starting Ethereum Deposit Tracker on ${config.NETWORK} network`);
        
        await connectDB();
        logger.info('Database connection established');

        startMetricsServer();
        logger.info('Metrics server started');

        await trackDeposits();
    } catch (error) {
        logger.error('Fatal error in main application', { 
            error: error.message, 
            stack: error.stack,
            network: config.NETWORK
        });
        throw error; // Re-throw to be caught by the global handler
    }
}

main().catch(error => {
    logger.error('An error occurred in the main process:', { 
        error: error.message, 
        stack: error.stack 
    });
    // Perform any necessary cleanup here
    process.exit(1);
});
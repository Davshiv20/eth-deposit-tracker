module.exports = {
    INFURA_URL: process.env.INFURA_URL,
    BEACON_DEPOSIT_CONTRACT: '0x4242424242424242424242424242424242424242', // Holesky Beacon Deposit Contract
    BLOCKS_TO_FETCH: 1000,
    NETWORK: 'holesky',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/eth_deposit_tracker',
    METRICS_PORT: process.env.METRICS_PORT || 9101
};
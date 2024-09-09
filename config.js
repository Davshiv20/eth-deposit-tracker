module.exports = {
    INFURA_URL: process.env.INFURA_URL,
    BEACON_DEPOSIT_CONTRACT: '0x00000000219ab540356cBB839Cbe05303d7705Fa', // Mainnet Beacon Deposit Contract
    BLOCKS_TO_FETCH: 1000,
    NETWORK: 'mainnet', // Change this to 'mainnet'
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/eth_deposit_tracker',
    METRICS_PORT: process.env.METRICS_PORT || 9101
};
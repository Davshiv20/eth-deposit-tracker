const Web3 = require('web3');
const config = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider(config.INFURA_URL));

module.exports = {
    web3,
    getLatestBlockNumber: async () => {
        const blockNumber = await web3.eth.getBlockNumber();
        return blockNumber.toString();
    },
    getBlock: (blockNumber) => web3.eth.getBlock(blockNumber),
    getTransaction: (txHash) => web3.eth.getTransaction(txHash),
    getPastLogs: (options) => web3.eth.getPastLogs(options)
};
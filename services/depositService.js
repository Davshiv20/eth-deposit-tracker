const config = require('../config');
const web3Service = require('./web3Service');
const logger = require('../utils/logger');
const Deposit = require('../models/deposit');
const { incrementDeposits, addDepositAmount } = require('./metricsService');

const DEPOSIT_EVENT_ABI = {
    "anonymous": false,
    "inputs": [
        { "indexed": false, "name": "pubkey", "type": "bytes" },
        { "indexed": false, "name": "withdrawal_credentials", "type": "bytes" },
        { "indexed": false, "name": "amount", "type": "bytes" },
        { "indexed": false, "name": "signature", "type": "bytes" },
        { "indexed": false, "name": "index", "type": "bytes" }
    ],
    "name": "DepositEvent",
    "type": "event"
};

function decodeDepositEvent(log) {
    const decodedLog = web3Service.web3.eth.abi.decodeLog(
        DEPOSIT_EVENT_ABI.inputs,
        log.data,
        log.topics.slice(1)
    );
    return {
        pubkey: decodedLog.pubkey,
        withdrawalCredentials: decodedLog.withdrawal_credentials,
        amount: web3Service.web3.utils.fromWei(decodedLog.amount, 'ether'),
        signature: decodedLog.signature,
        index: decodedLog.index
    };
}

async function processDeposit(log) {
    try {
        const decodedDeposit = decodeDepositEvent(log);
        const block = await web3Service.getBlock(log.blockNumber);
        const transaction = await web3Service.getTransaction(log.transactionHash);

        const deposit = new Deposit({
            blockNumber: log.blockNumber,
            blockTimestamp: block.timestamp,
            transactionHash: log.transactionHash,
            senderAddress: transaction.from,
            ...decodedDeposit
        });

        await deposit.save();
        logger.info('Deposit saved:', deposit);

        // Update metrics
        incrementDeposits();
        addDepositAmount(parseFloat(deposit.amount));
    } catch (error) {
        logger.error('Error processing deposit:', error);
    }
}

async function trackDeposits() {
    logger.info(`Starting to track deposits on ${config.NETWORK}...`);

    const latestBlock = await web3Service.getLatestBlockNumber();
    logger.info('Latest block:', latestBlock);

    const fromBlock = BigInt(latestBlock) - BigInt(config.BLOCKS_TO_FETCH);
    const pastEvents = await web3Service.getPastLogs({
        fromBlock: fromBlock.toString(),
        toBlock: 'latest',
        address: config.BEACON_DEPOSIT_CONTRACT,
        topics: [web3Service.web3.utils.sha3('DepositEvent(bytes,bytes,bytes,bytes,bytes)')]
    });

    logger.info(`Found ${pastEvents.length} past deposit events`);

    for (const event of pastEvents) {
        await processDeposit(event);
    }

    logger.info('Finished processing past events. Now watching for new deposits...');

    // Use polling instead of subscription
    setInterval(async () => {
        const newLatestBlock = await web3Service.getLatestBlockNumber();
        if (newLatestBlock > latestBlock) {
            const newEvents = await web3Service.getPastLogs({
                fromBlock: (BigInt(latestBlock) + BigInt(1)).toString(),
                toBlock: newLatestBlock.toString(),
                address: config.BEACON_DEPOSIT_CONTRACT,
                topics: [web3Service.web3.utils.sha3('DepositEvent(bytes,bytes,bytes,bytes,bytes)')]
            });
            for (const event of newEvents) {
                await processDeposit(event);
            }
        }
    }, 15000);
}

module.exports = {
    trackDeposits
};
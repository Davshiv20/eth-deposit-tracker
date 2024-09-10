const config = require("../config");
const web3Service = require("./web3Service");
const logger = require("../utils/logger");
const Deposit = require("../models/deposit");
const { sendDepositNotification } = require("./telegramService");


const {
  incrementDeposits,
  addDepositAmount,
  recordDepositByAddress,
  updateLastDepositTimestamp,
  incrementMultiDepositTransactions,
} = require("./metricsService");

const CONTRACT_ABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes","name":"pubkey","type":"bytes"},{"indexed":false,"internalType":"bytes","name":"withdrawal_credentials","type":"bytes"},{"indexed":false,"internalType":"bytes","name":"amount","type":"bytes"},{"indexed":false,"internalType":"bytes","name":"signature","type":"bytes"},{"indexed":false,"internalType":"bytes","name":"index","type":"bytes"}],"name":"DepositEvent","type":"event"},
  {"inputs":[{"internalType":"bytes","name":"pubkey","type":"bytes"},{"internalType":"bytes","name":"withdrawal_credentials","type":"bytes"},{"internalType":"bytes","name":"signature","type":"bytes"},{"internalType":"bytes32","name":"deposit_data_root","type":"bytes32"}],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[],"name":"get_deposit_count","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"get_deposit_root","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"}
];

// You can then create a contract instance if needed
const contract = new web3Service.web3.eth.Contract(CONTRACT_ABI, config.BEACON_DEPOSIT_CONTRACT);

// Your existing DEPOSIT_EVENT_ABI can be extracted from the full ABI
const DEPOSIT_EVENT_ABI = CONTRACT_ABI.find(item => item.type === 'event' && item.name === 'DepositEvent');

function decodeDepositEvent(log) {
  try {
    const decodedLog = web3Service.web3.eth.abi.decodeLog(
      DEPOSIT_EVENT_ABI.inputs,
      log.data,
      log.topics.slice(1)
    );
    return {
      pubkey: decodedLog.pubkey,
      withdrawalCredentials: decodedLog.withdrawal_credentials,
      amount: decodedLog.amount,
      signature: decodedLog.signature,
      index: decodedLog.index,
    };
  } catch (error) {
    logger.error("Error decoding deposit event:", error);
    logger.error("Problematic log:", JSON.stringify(log, null, 2));
    throw error;
  }
}
async function processDeposit(log, transaction) {
  try {
    const decodedDeposit = decodeDepositEvent(log);
    const block = await web3Service.getBlock(log.blockNumber);

    const deposit = new Deposit({
      blockNumber: log.blockNumber,
      blockTimestamp: block.timestamp,
      transactionHash: log.transactionHash,
      logIndex: log.logIndex,
      senderAddress: transaction.from,
      amount: web3Service.web3.utils.fromWei(decodedDeposit.amount, "ether"),
      pubkey: decodedDeposit.pubkey,
      withdrawalCredentials: decodedDeposit.withdrawal_credentials,
      signature: decodedDeposit.signature,
      index: decodedDeposit.index
    });

    await deposit.save();
    logger.info("Deposit saved:", deposit);

    // Update metrics
    incrementDeposits();
    addDepositAmount(deposit.amount);
    recordDepositByAddress(deposit.senderAddress);
    updateLastDepositTimestamp(deposit.blockTimestamp);
    sendDepositNotification(deposit);

    return deposit;
  } catch (error) {
    logger.error("Error processing deposit:", error);
    logger.error("Problematic log:", JSON.stringify(log, null, 2));
  }
}async function trackDeposits() {
  logger.info(`Starting to track deposits on ${config.NETWORK}...`);

  const latestBlock = await web3Service.getLatestBlockNumber();
  logger.info("Latest block:", latestBlock);

  const fromBlock = BigInt(latestBlock) - BigInt(config.BLOCKS_TO_FETCH);
  
  async function processNewBlocks(fromBlockNum, toBlockNum) {
    const events = await web3Service.getPastLogs({
      fromBlock: fromBlockNum.toString(),
      toBlock: toBlockNum.toString(),
      address: config.BEACON_DEPOSIT_CONTRACT,
      topics: [web3Service.web3.utils.sha3("DepositEvent(bytes,bytes,bytes,bytes,bytes)")],
    });

    logger.info(`Found ${events.length} deposit events`);

    const transactionMap = new Map();

    for (const event of events) {
      if (!transactionMap.has(event.transactionHash)) {
        const transaction = await web3Service.getTransaction(event.transactionHash);
        transactionMap.set(event.transactionHash, transaction);
      }
      await processDeposit(event, transactionMap.get(event.transactionHash));
    }

    // Check for multi-deposit transactions
    for (const [txHash, deposits] of transactionMap.entries()) {
      if (deposits > 1) {
        incrementMultiDepositTransactions();
        logger.info(`Multi-deposit transaction detected: ${txHash} with ${deposits} deposits`);
      }
    }
  }

  // for past
 // await processNewBlocks(fromBlock, latestBlock);

  logger.info("Finished processing past events. Now watching for new deposits...");

  setInterval(async () => {
    const newLatestBlock = await web3Service.getLatestBlockNumber();
    if (newLatestBlock > latestBlock) {
      await processNewBlocks(BigInt(latestBlock) + BigInt(1), newLatestBlock);
    }
  }, 15000); 
}

module.exports = {
  trackDeposits,
};

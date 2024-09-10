const config = require("../config");
const web3Service = require("./web3Service");
const logger = require("../utils/logger");
const Deposit = require("../models/deposit");
const { incrementDeposits, addDepositAmount } = require("./metricsService");

const DEPOSIT_EVENT_ABI = {
  anonymous: false,
  inputs: [
    { indexed: false, name: "pubkey", type: "bytes" },
    { indexed: false, name: "withdrawal_credentials", type: "bytes" },
    { indexed: false, name: "amount", type: "bytes" },
    { indexed: false, name: "signature", type: "bytes" },
    { indexed: false, name: "index", type: "bytes" },
  ],
  name: "DepositEvent",
  type: "event",
};

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
async function processDeposit(log) {
  try {
    const decodedDeposit = decodeDepositEvent(log);
    const block = await web3Service.getBlock(log.blockNumber);
    const transaction = await web3Service.getTransaction(log.transactionHash);

    // Ensure we're working with strings for BigInt operations
    const gasPriceWei = transaction.gasPrice.toString();
    const gasUsed = transaction.gas.toString();
    const feeWei = BigInt(gasPriceWei) * BigInt(gasUsed);

    const deposit = new Deposit({
      blockNumber: log.blockNumber,
      blockTimestamp: block.timestamp,
      fee: web3Service.web3.utils.fromWei(feeWei.toString(), "ether"),
      hash: log.transactionHash,
      pubkey: decodedDeposit.pubkey,
    });

    await deposit.save();
    logger.info("Deposit saved:", deposit);

    // Update metrics
    incrementDeposits();

    // Ensure we're passing a string to fromWei
    const amountWei = decodedDeposit.amount.toString();
    const amountEther = web3Service.web3.utils.fromWei(amountWei, "ether");
    addDepositAmount(parseFloat(amountEther));
  } catch (error) {
    logger.error("Error processing deposit:", error);
    // Log the full log object for debugging
    logger.error("Problematic log:", JSON.stringify(log, null, 2));
  }
}

async function trackDeposits() {
  logger.info(`Starting to track deposits on ${config.NETWORK}...`);

  const latestBlock = await web3Service.getLatestBlockNumber();
  logger.info("Latest block:", latestBlock);

  const fromBlock = BigInt(latestBlock) - BigInt(config.BLOCKS_TO_FETCH);
  const pastEvents = await web3Service.getPastLogs({
    fromBlock: fromBlock.toString(),
    toBlock: "latest",
    address: config.BEACON_DEPOSIT_CONTRACT,
    topics: [
      web3Service.web3.utils.sha3(
        "DepositEvent(bytes,bytes,bytes,bytes,bytes)"
      ),
    ],
  });

  logger.info(`Found ${pastEvents.length} past deposit events`);

  for (const event of pastEvents) {
    await processDeposit(event);
  }

  logger.info(
    "Finished processing past events. Now watching for new deposits..."
  );

  // Use polling instead of subscription
  setInterval(async () => {
    const newLatestBlock = await web3Service.getLatestBlockNumber();
    logger.info(`New latest block: ${newLatestBlock}`);
    if (newLatestBlock > latestBlock) {
      const newEvents = await web3Service.getPastLogs({
        fromBlock: (BigInt(latestBlock) + BigInt(1)).toString(),
        toBlock: newLatestBlock.toString(),
        address: config.BEACON_DEPOSIT_CONTRACT,
        topics: [
          web3Service.web3.utils.sha3(
            "DepositEvent(bytes,bytes,bytes,bytes,bytes)"
          ),
        ],
      });
      logger.info(`New events found: ${newEvents.length}`);
      for (const event of newEvents) {
        await processDeposit(event);
      }
    }
  }, 15000);
}

module.exports = {
  trackDeposits,
};

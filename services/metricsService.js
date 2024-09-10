const client = require("prom-client");
const express = require("express");
const config = require("../config");
const logger = require("../utils/logger");

const app = express();
const register = new client.Registry();

// Existing metrics
const totalDeposits = new client.Gauge({
  name: "eth_total_deposits",
  help: "Total number of ETH deposits",
});

const totalEthDeposited = new client.Gauge({
  name: "eth_total_amount_deposited",
  help: "Total amount of ETH deposited",
});

// New metrics
const depositsByAddress = new client.Gauge({
  name: "eth_deposits_by_address",
  help: "Number of deposits by address",
  labelNames: ['address']
});

const lastDepositTimestamp = new client.Gauge({
  name: "eth_last_deposit_timestamp",
  help: "Timestamp of the last deposit",
});

const multiDepositTransactions = new client.Counter({
  name: "eth_multi_deposit_transactions",
  help: "Number of transactions with multiple deposits",
});

register.registerMetric(totalDeposits);
register.registerMetric(totalEthDeposited);
register.registerMetric(depositsByAddress);
register.registerMetric(lastDepositTimestamp);
register.registerMetric(multiDepositTransactions);

function incrementDeposits() {
  totalDeposits.inc();
}

function addDepositAmount(amount) {
  if (typeof amount === "string") {
    amount = parseFloat(amount);
  }
  if (!isNaN(amount)) {
    totalEthDeposited.inc(amount);
  } else {
    logger.error("Invalid deposit amount:", amount);
  }
}

function recordDepositByAddress(address) {
  depositsByAddress.inc({ address: address });
}

function updateLastDepositTimestamp(timestamp) {
  lastDepositTimestamp.set(timestamp);
}

function incrementMultiDepositTransactions() {
  multiDepositTransactions.inc();
}

function startMetricsServer() {
  app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  });

  app.listen(config.METRICS_PORT, () => {
    logger.info(`Metrics server listening on port ${config.METRICS_PORT}`);
  });
}

module.exports = {
  startMetricsServer,
  incrementDeposits,
  addDepositAmount,
  recordDepositByAddress,
  updateLastDepositTimestamp,
  incrementMultiDepositTransactions,
};
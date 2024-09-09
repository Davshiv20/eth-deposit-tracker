const client = require("prom-client");
const express = require("express");
const config = require("../config");
const logger = require("../utils/logger");

const app = express();

// Create a Registry to register the metrics
const register = new client.Registry();

// Create a gauge for total deposits
const totalDeposits = new client.Gauge({
  name: "eth_total_deposits",
  help: "Total number of ETH deposits",
});

// Create a gauge for total ETH deposited
const totalEthDeposited = new client.Gauge({
  name: "eth_total_amount_deposited",
  help: "Total amount of ETH deposited",
});

// Valid metric name
const regNoGauge = new client.Gauge({
  name: "done_by_shivam_dave_", // Valid name
  help: "21BCB0107",
});

// Register the metrics
register.registerMetric(totalDeposits);
register.registerMetric(totalEthDeposited);
register.registerMetric(regNoGauge);

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
    console.error("Invalid deposit amount:", amount);
  }
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
};

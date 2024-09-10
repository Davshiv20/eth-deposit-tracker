const TelegramBot = require("node-telegram-bot-api");
const config = require("../config");
const logger = require("../utils/logger");

const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: false });

function sendDepositNotification(deposit) {
  const message = `New deposit detected!
Block: ${deposit.blockNumber}
Timestamp: ${new Date(deposit.blockTimestamp * 1000).toISOString()}
Hash: ${deposit.hash}
Amount: ${deposit.amount} ETH`;

  logger.info("Attempting to send Telegram notification", {
    depositHash: deposit.hash,
  });

  bot
    .sendMessage(config.TELEGRAM_CHAT_ID, message)
    .then(() => {
      logger.info("Telegram notification sent successfully", {
        depositHash: deposit.hash,
      });
    })
    .catch((error) => {
      logger.error("Failed to send Telegram notification", {
        error: error.message,
        depositHash: deposit.hash,
      });
    });
}

module.exports = { sendDepositNotification };

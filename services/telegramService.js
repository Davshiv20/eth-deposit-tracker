const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');
const logger = require('../utils/logger');

const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: false });

function sendDepositNotification(deposit) {
  const message = `New Ethereum deposit detected!
Block Number: ${deposit.blockNumber}
Transaction Hash: ${deposit.transactionHash}
Sender: ${deposit.senderAddress}
Amount: ${deposit.amount} ETH
Timestamp: ${new Date(deposit.blockTimestamp * 1000).toISOString()}`;

  bot.sendMessage(config.TELEGRAM_CHAT_ID, message)
    .then(() => {
      logger.info('Telegram notification sent successfully', { depositHash: deposit.transactionHash });
    })
    .catch((error) => {
      logger.error('Failed to send Telegram notification', { error: error.message, depositHash: deposit.transactionHash });
    });
}

module.exports = { sendDepositNotification };
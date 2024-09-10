const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  blockNumber: Number,
  blockTimestamp: Number,
  transactionHash: String,
  logIndex: Number,
  senderAddress: String,
  amount: String,
  pubkey: String,
  withdrawalCredentials: String,
  signature: String,
  index: String
}, { timestamps: true });

module.exports = mongoose.model('Deposit', depositSchema);
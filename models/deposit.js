const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema(
  {
    blockNumber: Number,
    blockTimestamp: Number,
    transactionHash: String,
    senderAddress: String,
    pubkey: String,
    withdrawalCredentials: String,
    amount: String,
    signature: String,
    index: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deposit", depositSchema);

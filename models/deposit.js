const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
    blockNumber: Number,
    blockTimestamp: Number,
    fee: String,
    hash: String,
    pubkey: String
}, { timestamps: true });

module.exports = mongoose.model('Deposit', depositSchema);
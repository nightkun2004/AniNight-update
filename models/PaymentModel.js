// models/Payment.js
const mongoose = require("../config/db");

const playmenttruemoneySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['truemoneywallet', 'lazada', 'shopeeplay']
    },
    points: {
        type: Number,
        default: 0
    },
    wallet: {
        type: Number,
        default: 0
    },
    published: { type: Boolean, default: false },
});


const PaymentSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    playmentrequire: [playmenttruemoneySchema],
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'bank_transfer', 'trueMoney'],
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = Payment;

const mongoose = require('mongoose'); // Import from 'mongoose' package

// Subschema for specific payment requirements (e.g., TrueMoney, Lazada, Shopee)
const playmenttruemoneySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['truemoneywallet', 'lazada', 'shopeeplay'], // Type of payment option
    },
    points: {
        type: Number,
        default: 0 // Points associated with the payment
    },
    wallet: {
        type: Number,
        default: 0 // Wallet balance or amount for this method
    },
    published: {
        type: Boolean,
        default: false // Publication status of the payment method
    },
});

// Main Payment Schema
const PaymentSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    email: String,
    priceId: String,
    sessionId: String,
    paymentStatus: String,
    uuid: String,
    playmentrequire: [playmenttruemoneySchema], // Embedding the playmenttruemoneySchema
    amount: {
        type: Number,
        required: true // Total amount for the payment
    },
    paymentMethod: {
        type: String,
        enum: ['google', 'bank_transfer', 'trueMoney'], // Types of payment methods allowed
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'], // Status of the transaction
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set the creation date
    }
});

// Define the Payment model
const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;

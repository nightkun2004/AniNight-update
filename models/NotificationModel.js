const mongoose = require('../config/db');

const notificationSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
    },
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isRead: { // Add this field to track read status
        type: Boolean,
        default: false,
    },
}, { timestamps: true});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

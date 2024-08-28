const mongoose = require('../config/db');

const notificationSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    message: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
